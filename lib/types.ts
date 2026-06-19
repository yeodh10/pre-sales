export type Industry =
  | "manufacturing"
  | "manufacturing_ot"
  | "finance"
  | "public"
  | "retail"
  | "healthcare"
  | "education"
  | "ecommerce"
  | "etc";

export type CompanySize = "smb" | "mid" | "enterprise";

export type Compliance =
  | "ismsp"
  | "isms"
  | "pims"
  | "csap"
  | "finance_supervisory"
  | "critical_infra"
  | "network_separation";

export type PainPoint =
  | "ransomware"
  | "apt"
  | "insider_leak"
  | "ot_legacy"
  | "soc_shortage"
  | "cloud_misconfig"
  | "ddos"
  | "compliance_audit";

export interface Infrastructure {
  hasAv: boolean;
  hasFirewall: boolean;
  hasEdr: boolean;
  hasSoc: boolean;
  networkSeparation: boolean;
  cloudUsage: "none" | "single" | "multi" | "hybrid";
  otEnvironment: boolean;
}

export interface CustomerProfile {
  companyName?: string;
  industry: Industry;
  size: CompanySize;
  employeeCount?: number;
  endpointCount?: number;
  infrastructure: Infrastructure;
  painPoints: PainPoint[];
  compliance: Compliance[];
  notes?: string;
}
