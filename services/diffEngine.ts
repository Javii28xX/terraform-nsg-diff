import { NSGRule, DiffResult, DiffType } from '../types';

// Helper for deep comparison of primitives and arrays
const isEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  
  // Handle arrays (e.g. prefixes, ports)
  // We treat lists as sets for comparison to avoid false positives on reordering
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    const aSorted = [...a].sort();
    const bSorted = [...b].sort();
    return aSorted.every((val, index) => val === bSorted[index]);
  }
  
  return false;
};

const rulesAreIdentical = (r1: NSGRule, r2: NSGRule): boolean => {
  // Get all unique keys excluding internal 'id'
  const keys = new Set([...Object.keys(r1), ...Object.keys(r2)]);
  
  for (const key of keys) {
    if (key === 'id') continue;
    
    const val1 = r1[key];
    const val2 = r2[key];

    // Normalize empty arrays vs undefined/null to prevent false positives 
    // when a field is missing vs empty list in Terraform output
    const isEmpty1 = (val1 === undefined || val1 === null) || (Array.isArray(val1) && val1.length === 0);
    const isEmpty2 = (val2 === undefined || val2 === null) || (Array.isArray(val2) && val2.length === 0);

    if (isEmpty1 && isEmpty2) continue;
    
    // Strict comparison after normalization
    if (!isEqual(val1, val2)) {
      return false;
    }
  }
  
  return true;
};

export const calculateDiff = (added: NSGRule[], removed: NSGRule[]): DiffResult[] => {
  const results: DiffResult[] = [];
  const addedMap = new Map<string, NSGRule>();
  
  // Index added rules by name for quick lookup
  added.forEach(rule => addedMap.set(rule.name, rule));

  const processedAddedIds = new Set<string>();

  // Iterate removed rules to find matches in added (Modifications)
  removed.forEach(prevRule => {
    if (addedMap.has(prevRule.name)) {
      // It's a potential modification
      const newRule = addedMap.get(prevRule.name)!;
      processedAddedIds.add(newRule.name);

      // CRITICAL: Check if it's actually different physically.
      // If rules are identical, we DO NOT add it to results, effectively filtering it out.
      if (!rulesAreIdentical(prevRule, newRule)) {
        results.push({
          type: DiffType.MODIFIED,
          rule: newRule,
          previousRule: prevRule
        });
      }
    } else {
      // It's a pure deletion
      results.push({
        type: DiffType.REMOVED,
        rule: prevRule
      });
    }
  });

  // Process remaining added rules (New additions)
  added.forEach(rule => {
    if (!processedAddedIds.has(rule.name)) {
      results.push({
        type: DiffType.ADDED,
        rule: rule
      });
    }
  });

  // Sort by priority for better visualization
  return results.sort((a, b) => (a.rule.priority || 0) - (b.rule.priority || 0));
};
