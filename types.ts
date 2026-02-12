export interface NSGRule {
  id?: string; // Generated ID for internal tracking
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
  previousRule?: NSGRule; // For modifications
}

export interface ParseResult {
  added: NSGRule[];
  removed: NSGRule[];
}
