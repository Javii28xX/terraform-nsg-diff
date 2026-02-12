import React from 'react';
import { NSGRule } from '../types';
import { X } from 'lucide-react';

interface ComparisonViewProps {
  oldRule: NSGRule;
  newRule: NSGRule;
  onClose: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ oldRule, newRule, onClose }) => {
  // Get all unique keys from both rules
  const allKeys = Array.from(new Set([...Object.keys(oldRule), ...Object.keys(newRule)]));
  
  // Filter out internal keys or irrelevant ones
  const keys = allKeys.filter(k => k !== 'id' && !k.startsWith('_')).sort();

  const formatValue = (val: any) => {
    if (Array.isArray(val)) return JSON.stringify(val, null, 1);
    return String(val);
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-colors duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border dark:border-slate-800">
        <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Modification Details: <span className="text-blue-600 dark:text-blue-400 font-mono">{newRule.name}</span>
          </h3>
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
              {keys.map(key => {
                const oldVal = oldRule[key];
                const newVal = newRule[key];
                const oldStr = formatValue(oldVal);
                const newStr = formatValue(newVal);
                const isDiff = oldStr !== newStr;

                if (!isDiff && key === 'priority') return null; // Skip non-diff priority usually

                return (
                  <tr key={key} className={isDiff ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}>
                    <td className="py-3 pr-4 font-mono text-sm text-gray-600 dark:text-gray-400">{key}</td>
                    <td className={`py-3 px-2 font-mono text-sm break-all ${isDiff ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 dark:text-slate-600'}`}>
                      {oldVal !== undefined ? oldStr : <span className="italic text-gray-300 dark:text-slate-600">undefined</span>}
                    </td>
                    <td className={`py-3 px-2 font-mono text-sm break-all ${isDiff ? 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 font-bold' : 'text-gray-400 dark:text-slate-600'}`}>
                      {newVal !== undefined ? newStr : <span className="italic text-gray-300 dark:text-slate-600">undefined</span>}
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