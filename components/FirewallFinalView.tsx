import React from 'react';
import { FirewallRuleChange, DiffType } from '../types';
import { Flame, Shield, List } from 'lucide-react';

interface FirewallFinalViewProps {
  changes: FirewallRuleChange[];
}

interface ProcessedCollection {
  name: string;
  priority: string | number;
  rules: FirewallRuleChange[];
}

interface ProcessedGroup {
  name: string;
  collections: ProcessedCollection[];
}

export const FirewallFinalView: React.FC<FirewallFinalViewProps> = ({ changes }) => {
  // Group by Rule Collection Group
  const groups: ProcessedGroup[] = [];

  // Grouping Logic
  changes.forEach(change => {
    const groupName = change.ruleCollectionGroupName || 'Unknown Group';
    let group = groups.find(g => g.name === groupName);
    if (!group) {
      group = { name: groupName, collections: [] };
      groups.push(group);
    }

    let collection = group.collections.find(c => c.name === change.ruleCollectionName);
    if (!collection) {
      collection = { 
        name: change.ruleCollectionName, 
        priority: change.ruleCollectionPriority || 'N/A',
        rules: [] 
      };
      group.collections.push(collection);
    }
    collection.rules.push(change);
  });

  // Sort groups and collections
  groups.sort((a, b) => a.name.localeCompare(b.name));
  groups.forEach(g => {
    g.collections.sort((a, b) => {
      if (typeof a.priority === 'number' && typeof b.priority === 'number') return a.priority - b.priority;
      return a.name.localeCompare(b.name);
    });
    // Sort rules inside collection usually by Priority if available, or Name
    g.collections.forEach(c => {
       c.rules.sort((r1, r2) => {
         const p1 = Number(r1.priority) || 0;
         const p2 = Number(r2.priority) || 0;
         if (p1 && p2) return p1 - p2;
         return r1.ruleName.localeCompare(r2.ruleName);
       });
    });
  });

  // Helper to extract the "Final" value (Prefer New > Value > Old (if not replaced))
  const getFinalValue = (details: any, key: string, isList = false): any => {
    if (!details[key]) return undefined;
    const item = details[key];
    
    // If it's a list, we combine 'value' (unchanged) and 'new' (added). 
    // If 'new' replaced 'old' (using ->), 'value' might be empty or contain unchanged items.
    if (isList) {
        // Final List = value (unchanged) + new (added/replaced).
        const current = item.value || [];
        const added = item.new || [];
        return [...current, ...added];
    }

    // Scalar
    if (item.new !== undefined) return item.new;
    if (item.value !== undefined) return item.value;
    return undefined;
  };

  const formatList = (val: any[]) => {
     if (!val || val.length === 0) return null;
     if (val.length === 1 && (val[0] === "*" || String(val[0]).toLowerCase() === "any")) return "* (Any)";
     return val.join(', ');
  };

  return (
    <div className="mt-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
           <Shield className="text-blue-500" /> 
           Final State Preview
        </h2>
        <span className="text-sm text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            Active Rules Snapshot
        </span>
      </div>

      {groups.length === 0 && (
         <p className="text-gray-500 italic">No firewall group changes detected.</p>
      )}

      {groups.map((group, gIdx) => (
        <div key={gIdx} className="border dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
           {/* Group Header */}
           <div className="bg-slate-100 dark:bg-slate-800/80 p-4 border-b dark:border-slate-700 flex items-center gap-2">
              <Flame className="text-orange-500" size={20} />
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                 Firewall Policy Rule Collection Group: <span className="text-blue-600 dark:text-blue-400 font-mono">{group.name}</span>
              </h3>
           </div>

           <div className="p-6 space-y-8">
              {group.collections.map((collection, cIdx) => (
                <div key={cIdx} className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                   <div className="flex items-baseline gap-3 mb-4">
                      <h4 className="font-bold text-md text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <List size={16} className="text-slate-400" />
                        {collection.name}
                      </h4>
                      <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded">
                         Priority: {collection.priority}
                      </span>
                   </div>

                   <div className="space-y-6">
                      {collection.rules
                        .filter(rule => rule.changeType !== DiffType.REMOVED)
                        .map((rule, rIdx) => {
                         // Extract Final Values
                         const description = getFinalValue(rule.details, 'description');
                         const sourceAddrs = getFinalValue(rule.details, 'source_addresses', true);
                         const sourceIps = getFinalValue(rule.details, 'source_ip_groups', true);
                         const destAddrs = getFinalValue(rule.details, 'destination_addresses', true);
                         const destFqdns = getFinalValue(rule.details, 'destination_fqdns', true);
                         const destPorts = getFinalValue(rule.details, 'destination_ports', true);
                         const protocols = getFinalValue(rule.details, 'protocols', true);

                         return (
                            <div key={rule.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                               <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-bold text-blue-700 dark:text-blue-400 font-mono text-sm">
                                     {rIdx + 1}) {rule.ruleName}
                                  </h5>
                                </div>

                               {description && (
                                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 italic">
                                     "{description}"
                                  </p>
                               )}

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                  {/* Source */}
                                  <div className="space-y-1">
                                     <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Source</span>
                                     <div className="font-mono text-slate-800 dark:text-slate-200">
                                        {formatList(sourceAddrs) && <div>Addr: {formatList(sourceAddrs)}</div>}
                                        {sourceIps && sourceIps.length > 0 && (
                                           <div className="mt-1">
                                              <span className="text-xs text-slate-400">IP Groups:</span>
                                              <ul className="list-disc list-inside pl-1 text-xs">
                                                 {sourceIps.map((ip: string) => {
                                                    const shortName = ip.split('/').pop();
                                                    return <li key={ip} title={ip}>{shortName}</li>;
                                                 })}
                                              </ul>
                                           </div>
                                        )}
                                        {!formatList(sourceAddrs) && (!sourceIps || sourceIps.length === 0) && <span className="text-slate-400 italic">No changes</span>}
                                     </div>
                                  </div>

                                  {/* Destination */}
                                  <div className="space-y-1">
                                     <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Destination</span>
                                     <div className="font-mono text-slate-800 dark:text-slate-200">
                                        {formatList(destAddrs) && <div>Addr: {formatList(destAddrs)}</div>}
                                        {formatList(destFqdns) && <div>FQDN: {formatList(destFqdns)}</div>}
                                        {!formatList(destAddrs) && !formatList(destFqdns) && <span className="text-slate-400 italic">No changes</span>}
                                     </div>
                                  </div>

                                  {/* Ports & Proto */}
                                  <div className="space-y-1 mt-2">
                                     <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Port</span>
                                     <div className="font-mono text-slate-800 dark:text-slate-200">
                                        {formatList(destPorts) || <span className="text-slate-400 italic">No changes</span>}
                                     </div>
                                  </div>

                                  <div className="space-y-1 mt-2">
                                     <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Protocol</span>
                                     <div className="font-mono text-slate-800 dark:text-slate-200">
                                        {formatList(protocols) || <span className="text-slate-400 italic">No changes</span>}
                                     </div>
                                  </div>
                               </div>
                            </div>
                         );
                      })}
                      {collection.rules.filter(r => r.changeType !== DiffType.REMOVED).length === 0 && (
                        <div className="text-slate-400 italic text-sm">No active/modified rules in this collection view.</div>
                      )}
                   </div>
                </div>
              ))}
           </div>
        </div>
      ))}
    </div>
  );
};