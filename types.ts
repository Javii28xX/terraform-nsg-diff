export interface NSGRule {
  id?: string;
  name: string;
  priority: number;
  direction: string;
  access: string;
  protocol: string;
  source_address_prefix?: string;
  source_address_prefixes?: string[];
  destination_address_prefix?: string;
  destination_address_prefixes?: string[];
  source_port_range?: string;
  source_port_ranges?: string[];
  destination_port_ranges?: string[];
  source_application_security_group_ids?: string[];
  destination_application_security_group_ids?: string[];
  description?: string;
  [key: string]: any;
}

export enum DiffType {
  ADDED = 'ADDED',
  REMOVED = 'REMOVED',
  MODIFIED = 'MODIFIED',
  UNCHANGED = 'UNCHANGED'
}

export interface DiffResult {
  type: DiffType;
  rule: NSGRule;
  previousRule?: NSGRule;
}

// --- New Types for Firewall & IP Groups ---

export interface FirewallRuleChange {
  id: string;
  changeType: DiffType;
  ruleCollectionGroupName?: string; // e.g. "customer"
  ruleCollectionName: string;
  ruleCollectionPriority?: number | string;
  ruleName: string;
  priority?: string; // Can be string because of "100 -> 200"
  action?: string; // Allow/Deny
  details: Record<string, { old?: any; new?: any; value?: any }>;
}

export interface IPGroupChange {
  id: string;
  name: string;
  changeType: DiffType;
  cidrs: {
    added: string[];
    removed: string[];
    current: string[];
  };
}

export interface ParseResult {
  nsgAdded: NSGRule[];
  nsgRemoved: NSGRule[];
  firewallChanges: FirewallRuleChange[];
  ipGroupChanges: IPGroupChange[];
}