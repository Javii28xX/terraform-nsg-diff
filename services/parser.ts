import { NSGRule, ParseResult, FirewallRuleChange, IPGroupChange, DiffType } from '../types';

// Helper to strip ANSI codes and get semantic prefix
const stripAnsiAndTimestamp = (line: string): { clean: string; prefix: string; rawClean: string } => {
  // Remove timestamp
  let rawClean = line.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z\s+/, '');
  
  let prefix = '';
  // Check for explicit markers inside ANSI codes
  if (rawClean.includes('[31m-') || rawClean.trim().startsWith('-')) prefix = '-';
  else if (rawClean.includes('[32m+') || rawClean.trim().startsWith('+')) prefix = '+';
  else if (rawClean.includes('[33m~') || rawClean.trim().startsWith('~')) prefix = '~';

  // Strip ANSI
  // eslint-disable-next-line no-control-regex
  let clean = rawClean.replace(/\x1B\[\d+;?\d*m/g, ''); 
  // eslint-disable-next-line no-control-regex
  clean = clean.replace(/\x1B\[0m/g, '');

  clean = clean.trim();
  
  // Remove the semantic character from the start of the clean string for key/value parsing
  if (clean.startsWith('+') || clean.startsWith('-') || clean.startsWith('~')) {
    clean = clean.substring(1).trim();
  }

  return { clean, prefix, rawClean };
};

const parseValue = (val: string): any => {
  val = val.trim();
  if (val.startsWith('"') && val.endsWith('"')) return val.slice(1, -1);
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (!isNaN(Number(val))) return Number(val);
  if (val === 'null') return null;
  return val;
};

// Parse "key = value" or "key = val1 -> val2"
const parseAttribute = (line: string) => {
  // Check for modification syntax: key = "old" -> "new"
  if (line.includes(' -> ')) {
    const parts = line.split('=');
    const key = parts[0].trim();
    const rest = parts.slice(1).join('=').trim();
    const [oldVal, newVal] = rest.split(' -> ').map(s => parseValue(s));
    return { key, oldVal, newVal, isModification: true };
  }
  
  // Standard assignment
  if (line.includes('=')) {
    const parts = line.split('=');
    const key = parts[0].trim();
    let val = parts.slice(1).join('=').trim();
    if (val.endsWith(',')) val = val.slice(0, -1);
    return { key, value: parseValue(val), isModification: false };
  }
  return null;
};

export const parseTerraformLog = (log: string): ParseResult => {
  const lines = log.split('\n');
  const nsgAdded: NSGRule[] = [];
  const nsgRemoved: NSGRule[] = [];
  const firewallChanges: FirewallRuleChange[] = [];
  const ipGroupChanges: IPGroupChange[] = [];
  const asgsCreated: string[] = [];

  // --- NSG Legacy Parser State ---
  let currentNsgRule: Partial<NSGRule> | null = null;
  let nsgListKey: string | null = null;
  let nsgList: any[] = [];
  let nsgBlockType: 'added' | 'removed' | null = null;

  // --- New Stack-Based Parser State ---
  // We use a stack to track context: Resource -> Collection -> Rule
  interface BlockContext {
    type: 'resource' | 'collection' | 'rule' | 'ipgroup' | 'asg';
    name?: string; // For collection/rule names
    changeType?: DiffType; // For the block itself
    data: any; // Accumulate attributes here
  }
  const stack: BlockContext[] = [];

  // Identify what kind of resource we are currently inside
  let activeResourceType: 'nsg' | 'firewall' | 'ipgroup' | 'asg' | null = null;
  let currentFirewallGroupName = '';

  for (const rawLine of lines) {
    const { clean, prefix, rawClean } = stripAnsiAndTimestamp(rawLine);
    
    // ---------------------------------------------------------
    // 1. Detect Resource Blocks
    // ---------------------------------------------------------
    if (rawClean.includes('resource "azurerm_firewall_policy_rule_collection_group"')) {
      activeResourceType = 'firewall';
      // Try to extract the name
      const nameMatch = rawClean.match(/"[^"]+"\s+"([^"]+)"/);
      if (nameMatch && nameMatch[1]) {
        currentFirewallGroupName = nameMatch[1];
      } else {
        currentFirewallGroupName = 'Unknown';
      }
      continue;
    }
    if (rawClean.includes('resource "azurerm_ip_group"')) {
      activeResourceType = 'ipgroup';
      let changeType = DiffType.UNCHANGED;
      if (rawClean.includes('will be created')) changeType = DiffType.ADDED;
      if (rawClean.includes('will be destroyed')) changeType = DiffType.REMOVED;
      if (rawClean.includes('will be updated')) changeType = DiffType.MODIFIED;
      if (prefix === '+') changeType = DiffType.ADDED;
      if (prefix === '-') changeType = DiffType.REMOVED;
      if (prefix === '~') changeType = DiffType.MODIFIED;

      stack.push({ type: 'ipgroup', changeType, data: { cidrs: { added: [], removed: [], current: [] } } });
      continue;
    }

    if (rawClean.includes('resource "azurerm_application_security_group"')) {
        activeResourceType = 'asg';
        let changeType = DiffType.UNCHANGED;
        if (rawClean.includes('will be created') || prefix === '+') changeType = DiffType.ADDED;
        
        // Push to stack to capture attributes (specifically 'name')
        stack.push({ type: 'asg', changeType, data: {} });
        continue;
    }
    
    // ---------------------------------------------------------
    // 2. Firewall Logic (Nested Blocks)
    // ---------------------------------------------------------
    if (activeResourceType === 'firewall') {
      // Opening Brace
      if (clean.endsWith('{')) {
        let blockType: BlockContext['type'] | null = null;
        let changeType = DiffType.UNCHANGED;
        
        if (prefix === '+') changeType = DiffType.ADDED;
        else if (prefix === '-') changeType = DiffType.REMOVED;
        else if (prefix === '~') changeType = DiffType.MODIFIED;

        if (clean.startsWith('network_rule_collection') || clean.startsWith('application_rule_collection') || clean.startsWith('nat_rule_collection')) {
          blockType = 'collection';
        } else if (clean.startsWith('rule')) {
          blockType = 'rule';
        } else if (clean.startsWith('resource')) {
          blockType = 'resource';
        }

        if (blockType) {
          stack.push({ type: blockType, changeType, data: {} });
        }
        continue;
      }

      // Closing Brace
      if (clean === '}' || clean === '},') {
        const finishedBlock = stack.pop();
        if (finishedBlock && finishedBlock.type === 'rule') {
          // Find parent collection
          const parentCollection = stack.find(b => b.type === 'collection');
          if (parentCollection) {
            // Determine effective change type
            let effectiveType = finishedBlock.changeType;
            if (effectiveType === DiffType.UNCHANGED && Object.keys(finishedBlock.data).length > 0) {
               const hasDiffs = Object.values(finishedBlock.data).some((v: any) => v.old !== undefined);
               if (hasDiffs) effectiveType = DiffType.MODIFIED;
            }

            if (effectiveType !== DiffType.UNCHANGED) {
              const collectionPriority = parentCollection.data.priority?.new ?? parentCollection.data.priority?.value;

              firewallChanges.push({
                id: Math.random().toString(36),
                changeType: effectiveType!,
                ruleCollectionGroupName: currentFirewallGroupName,
                ruleCollectionName: parentCollection.name || 'Unknown',
                ruleCollectionPriority: collectionPriority,
                ruleName: finishedBlock.data.name?.value || finishedBlock.data.name?.new || 'Unnamed Rule',
                priority: finishedBlock.data.priority?.value || finishedBlock.data.priority?.new,
                action: finishedBlock.data.action?.value,
                details: finishedBlock.data
              });
            }
          }
        }
        continue;
      }

      // Attributes inside blocks
      const currentBlock = stack[stack.length - 1];
      if (currentBlock) {
        if (currentBlock.type === 'collection') {
           if (clean.startsWith('name')) {
             const attr = parseAttribute(clean);
             if (attr) currentBlock.name = attr.newVal || attr.value;
           }
           if (clean.startsWith('priority')) {
             const attr = parseAttribute(clean);
             if (attr) {
                currentBlock.data.priority = {
                    value: attr.value,
                    old: attr.oldVal,
                    new: attr.newVal
                };
             }
           }
        }

        if (currentBlock.type === 'rule') {
          if (clean.endsWith(' = [')) {
            currentBlock.data._currentListKey = clean.split(' = ')[0].trim();
            currentBlock.data[currentBlock.data._currentListKey] = { old: [], new: [], value: [] };
            continue;
          }
          if (clean === ']' || clean === '],') {
            delete currentBlock.data._currentListKey;
            continue;
          }

          if (currentBlock.data._currentListKey) {
            let val = clean;
            if (val.endsWith(',')) val = val.slice(0, -1);
            const listRef = currentBlock.data[currentBlock.data._currentListKey];
            
            if (clean.includes(' -> ')) {
               const [oldV, newV] = clean.split(' -> ').map(s => parseValue(s.replace(/,$/, '')));
               listRef.old.push(oldV);
               listRef.new.push(newV);
            } else {
               const parsed = parseValue(val);
               if (prefix === '-') listRef.old.push(parsed);
               else if (prefix === '+') listRef.new.push(parsed);
               else listRef.value.push(parsed);
            }
            continue;
          }

          const attr = parseAttribute(clean);
          if (attr) {
            if (attr.isModification) {
              currentBlock.data[attr.key] = { old: attr.oldVal, new: attr.newVal };
            } else {
              if (currentBlock.changeType === DiffType.ADDED) {
                currentBlock.data[attr.key] = { new: attr.value };
              } else if (currentBlock.changeType === DiffType.REMOVED) {
                currentBlock.data[attr.key] = { old: attr.value };
              } else {
                 currentBlock.data[attr.key] = { value: attr.value };
              }
            }
          }
        }
      }
    }

    // ---------------------------------------------------------
    // 3. IP Group Logic
    // ---------------------------------------------------------
    if (activeResourceType === 'ipgroup') {
      const currentBlock = stack[stack.length - 1];
      if (!currentBlock) continue;

      if (clean === '}' || clean === '},') {
        const name = currentBlock.data.name || 'Unknown IP Group';
        ipGroupChanges.push({
          id: Math.random().toString(36),
          name: name,
          changeType: currentBlock.changeType || DiffType.MODIFIED,
          cidrs: currentBlock.data.cidrs
        });
        stack.pop();
        activeResourceType = null;
        continue;
      }

      if (clean.startsWith('name')) {
        const attr = parseAttribute(clean);
        if (attr) currentBlock.data.name = attr.value || attr.oldVal;
      }

      if (clean.includes('cidrs = [')) {
        currentBlock.data._inCidrs = true;
        continue;
      }
      if (currentBlock.data._inCidrs && (clean === ']' || clean === '],')) {
        currentBlock.data._inCidrs = false;
        continue;
      }
      if (currentBlock.data._inCidrs) {
         let val = clean;
         if (val.endsWith(',')) val = val.slice(0, -1);
         const parsed = parseValue(val);
         if (parsed) {
           if (prefix === '+') currentBlock.data.cidrs.added.push(parsed);
           else if (prefix === '-') currentBlock.data.cidrs.removed.push(parsed);
           else currentBlock.data.cidrs.current.push(parsed);
         }
      }
    }

    // ---------------------------------------------------------
    // 4. ASG Logic
    // ---------------------------------------------------------
    if (activeResourceType === 'asg') {
        const currentBlock = stack[stack.length - 1];
        if (!currentBlock) continue;

        if (clean === '}' || clean === '},') {
            // Check if we captured a name and it was added
            if (currentBlock.changeType === DiffType.ADDED) {
                const name = currentBlock.data.name;
                if (name && typeof name === 'string' && !name.includes('known after apply')) {
                    asgsCreated.push(name);
                }
            }
            stack.pop();
            activeResourceType = null;
            continue;
        }

        if (clean.startsWith('name')) {
            const attr = parseAttribute(clean);
            // prefer new value, then value
            if (attr) currentBlock.data.name = attr.newVal || attr.value;
        }
    }

    // ---------------------------------------------------------
    // 5. NSG Legacy Logic (Fallthrough for array format)
    // ---------------------------------------------------------
    if (!activeResourceType) {
      if (clean === '{') {
        currentNsgRule = {};
        if (prefix === '-') nsgBlockType = 'removed';
        else if (prefix === '+') nsgBlockType = 'added';
        else nsgBlockType = null;
        continue;
      }

      if (clean.startsWith('}') || clean.startsWith('},')) {
        if (currentNsgRule && (currentNsgRule.name || currentNsgRule.priority)) {
          if (nsgBlockType === 'removed') nsgRemoved.push(currentNsgRule as NSGRule);
          else if (nsgBlockType === 'added') nsgAdded.push(currentNsgRule as NSGRule);
        }
        currentNsgRule = null;
        nsgBlockType = null;
        continue;
      }

      if (currentNsgRule) {
        if (clean.endsWith(' = [')) {
          nsgListKey = clean.split(' = ')[0].trim();
          nsgList = [];
          continue;
        }
        if (nsgListKey) {
          if (clean === ']') {
            (currentNsgRule as any)[nsgListKey] = nsgList;
            nsgListKey = null;
            nsgList = [];
          } else {
            let val = clean;
            if (val.endsWith(',')) val = val.slice(0, -1);
            if (val.trim()) nsgList.push(parseValue(val));
          }
          continue;
        }
        if (clean.includes('=')) {
          const [key, valRaw] = clean.split('=').map(s => s.trim());
          let val = valRaw;
          if (val.endsWith(',')) val = val.slice(0, -1);
          if (val === '[]') (currentNsgRule as any)[key] = [];
          else if (val.startsWith('[') && val.endsWith(']')) {
             const content = val.slice(1, -1);
             (currentNsgRule as any)[key] = content.split(',').map(v => parseValue(v.trim())).filter(v => v !== "");
          } else {
             (currentNsgRule as any)[key] = parseValue(val);
          }
        }
      }
    }
  }

  return { nsgAdded, nsgRemoved, firewallChanges, ipGroupChanges, asgsCreated };
};
