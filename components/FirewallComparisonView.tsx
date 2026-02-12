import React from 'react';
import { FirewallRuleChange } from '../types';
import { X } from 'lucide-react';

interface FirewallComparisonViewProps {
  change: FirewallRuleChange;
  onClose: () => void;
}

export const FirewallComparisonView: React.FC<FirewallComparisonViewProps> = ({ change, onClose }) => {
  const sortedKeys = Object.keys(change.details).sort();

  const formatValue = (val: any) => {
    if (val === undefined || val === null) return <span className="italic text-gray-300 dark:text-slate-600">undefined</span>;
    if (Array.isArray(val)) {
        if (val.length === 0) return "[]";
        return (
            <ul className="list-disc list-inside">
                {val.map((v, i) => <li key={i}>{String(v)}</li>)}
            </ul>
        );
    }
    return String(val);
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-colors duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border dark:border-slate-800">
        <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
          <div>
             <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                Modification Details
             </h3>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Rule: <span className="font-mono text-blue-600 dark:text-blue-400">{change.ruleName}</span>
                <span className="mx-2">•</span>
                Collection: <span className="font-mono text-gray-700 dark:text-gray-300">{change.ruleCollectionName}</span>
             </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition text-gray-600 dark:text-gray-300">
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 bg-white dark:bg-slate-900">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="w-1/4 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase border-b-2 dark:border-slate-700">Property</th>
                <th className="w-1/3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 uppercase border-b-2 border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 pl-2">Previous Value</th>
                <th className="w-1/3 py-2 text-sm font-semibold text-green-600 dark:text-green-400 uppercase border-b-2 border-green-100 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10 pl-2">New Value</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {sortedKeys.map(key => {
                const detail = change.details[key];
                
                let finalOld: any;
                let finalNew: any;

                if (Array.isArray(detail.value)) {
                    // List Logic: Reconstruct approximate old/new lists for display
                    const common = detail.value || [];
                    const removed = detail.old || []; // items removed
                    const added = detail.new || []; // items added
                    
                    finalOld = [...common, ...(Array.isArray(removed) ? removed : [])].sort();
                    finalNew = [...common, ...(Array.isArray(added) ? added : [])].sort();
                } else {
                    // Scalar Logic
                    finalOld = detail.old !== undefined ? detail.old : detail.value;
                    finalNew = detail.new !== undefined ? detail.new : detail.value;
                }

                const isDiff = JSON.stringify(finalOld) !== JSON.stringify(finalNew);

                if (!isDiff && key !== 'name' && key !== 'priority') return null; 

                return (
                  <tr key={key} className={isDiff ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}>
                    <td className="py-3 pr-4 font-mono text-sm text-gray-600 dark:text-gray-400">{key}</td>
                    <td className={`py-3 px-2 font-mono text-sm break-all align-top ${isDiff ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 dark:text-slate-600'}`}>
                      {formatValue(finalOld)}
                    </td>
                    <td className={`py-3 px-2 font-mono text-sm break-all align-top ${isDiff ? 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 font-bold' : 'text-gray-400 dark:text-slate-600'}`}>
                      {formatValue(finalNew)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};