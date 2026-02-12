import { NSGRule, ParseResult } from '../types';

// Helper to strip ANSI codes and timestamps
const stripAnsiAndTimestamp = (line: string): { clean: string; prefix: string } => {
  // Remove timestamp at start (e.g., 2026-02-12T09:10:55.6332177Z)
  let clean = line.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z\s+/, '');
  
  // Extract the Terraform diff marker (+, -, or ~) often colored
  // The log often has [31m- [0m or [32m+ [0m
  // We want to capture the +/- if it exists as a semantic marker
  
  let prefix = '';
  
  // Check for explicit + or - indicators in the raw ANSI soup
  if (clean.includes('[31m-') || clean.trim().startsWith('-')) prefix = '-';
  else if (clean.includes('[32m+') || clean.trim().startsWith('+')) prefix = '+';
  else if (clean.includes('[33m~') || clean.trim().startsWith('~')) prefix = '~';

  // Strip all ANSI codes
  // eslint-disable-next-line no-control-regex
  clean = clean.replace(/\x1B\[\d+;?\d*m/g, ''); // Standard ANSI
  // eslint-disable-next-line no-control-regex
  clean = clean.replace(/\x1B\[0m/g, ''); // Reset

  // Also strip the literal +/- from the text for parsing the content
  clean = clean.trim();
  if (clean.startsWith('+') || clean.startsWith('-') || clean.startsWith('~')) {
    clean = clean.substring(1).trim();
  }

  return { clean, prefix };
};

const parseValue = (val: string): any => {
  val = val.trim();
  if (val.startsWith('"') && val.endsWith('"')) {
    return val.slice(1, -1);
  }
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (!isNaN(Number(val))) return Number(val);
  return val;
};

export const parseTerraformLog = (log: string): ParseResult => {
  const lines = log.split('\n');
  const added: NSGRule[] = [];
  const removed: NSGRule[] = [];

  let currentRule: Partial<NSGRule> | null = null;
  let currentListKey: string | null = null;
  let currentList: any[] = [];
  
  // State to track if we are processing a Removed (-) or Added (+) block
  let blockType: 'added' | 'removed' | null = null; 

  for (const rawLine of lines) {
    const { clean, prefix } = stripAnsiAndTimestamp(rawLine);
    
    // Detect start of a rule block
    if (clean === '{') {
      currentRule = {};
      if (prefix === '-') blockType = 'removed';
      else if (prefix === '+') blockType = 'added';
      else blockType = null; // Should not happen in this specific context ideally
      continue;
    }

    // Detect end of a rule block
    if (clean.startsWith('}') || clean.startsWith('},')) {
      if (currentRule && (currentRule.name || currentRule.priority)) {
        if (blockType === 'removed') {
          removed.push(currentRule as NSGRule);
        } else if (blockType === 'added') {
          added.push(currentRule as NSGRule);
        }
      }
      currentRule = null;
      blockType = null;
      continue;
    }

    // Processing inside a rule
    if (currentRule) {
      // Handle List Arrays [ ... ]
      if (clean.endsWith(' = [')) {
        currentListKey = clean.split(' = ')[0].trim();
        currentList = [];
        continue;
      }

      if (currentListKey) {
        if (clean === ']') {
          // End of list
          (currentRule as any)[currentListKey] = currentList;
          currentListKey = null;
          currentList = [];
        } else {
          // List item
          // Usually formatted like: "value", or value,
          let val = clean;
          if (val.endsWith(',')) val = val.slice(0, -1);
          if (val.trim()) {
              currentList.push(parseValue(val));
          }
        }
        continue;
      }

      // Simple Key-Value pairs
      if (clean.includes('=')) {
        const [key, valRaw] = clean.split('=').map(s => s.trim());
        let val = valRaw;
        if (val.endsWith(',')) val = val.slice(0, -1); // remove trailing comma
        
        // Sometimes valid arrays are one-liners: key = []
        if (val === '[]') {
            (currentRule as any)[key] = [];
        } else if (val.startsWith('[') && val.endsWith(']')) {
             // Basic single line array parsing
             const content = val.slice(1, -1);
             (currentRule as any)[key] = content.split(',').map(v => parseValue(v.trim())).filter(v => v !== "");
        } else {
            (currentRule as any)[key] = parseValue(val);
        }
      }
    }
  }

  return { added, removed };
};
