export type Tier = "Platinum" | "Gold" | "Silver" | "Bronze";

export type TenantStatus = "Active" | "Onboarding" | "Suspended" | "Churned";

export type Industry =
  | "Healthcare"
  | "Legal"
  | "Financial"
  | "Education"
  | "Manufacturing"
  | "Technology"
  | "Retail"
  | "Hospitality"
  | "Telecommunications"
  | "Insurance"
  | "Logistics"
  | "Aerospace";

export type Region = "us-east-1" | "us-west-2" | "eu-west-1" | "ap-south-1";

export interface Tenant {
  id: string;
  name: string;
  legalEntity: string;
  industry: Industry;
  region: Region;
  tier: Tier;
  status: TenantStatus;
  assignedClusterId: string;
  namespaceId: string;
  workloadCount: number;
  capacityUsedTB: number;
  capacityCommittedTB: number;
  lastBackupAt: string;
  securityScore: number;
  slaCompliance: number;
  backupSuccess7d: number[];
  createdAt: string;
  primaryContact: string;
  contactEmail: string;
}

export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "open" | "acknowledged" | "resolved";

export interface Alert {
  id: string;
  tenantId: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  category:
    | "Backup Failure"
    | "Policy Drift"
    | "Capacity"
    | "Threat"
    | "Configuration"
    | "Compliance";
  createdAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export type PolicyKind = "Backup" | "Retention" | "Replication" | "Archival";

export interface Policy {
  id: string;
  name: string;
  kind: PolicyKind;
  description: string;
  currentVersion: number;
  versions: PolicyVersion[];
  appliedTenants: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PolicyVersion {
  id: string;
  policyId: string;
  version: number;
  rpoHours: number;
  retentionDays: number;
  immutable: boolean;
  encryption: "AES-256" | "AES-256-GCM";
  replicationTargetClusterId: string | null;
  airGapped: boolean;
  notes: string;
  authoredBy: string;
  authoredAt: string;
  appliedTenantCount: number;
}

export type BackupJobStatus =
  | "succeeded"
  | "failed"
  | "running"
  | "queued"
  | "skipped";

export interface BackupJob {
  id: string;
  tenantId: string;
  workload: string;
  policyId: string;
  status: BackupJobStatus;
  startedAt: string;
  durationSec: number;
  bytesProtected: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface AuditEvent {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  tenantId?: string;
  outcome: "success" | "failure";
  occurredAt: string;
  ipAddress: string;
}

export interface Cluster {
  id: string;
  name: string;
  region: Region;
  capacityTB: number;
  usedTB: number;
  tenantCount: number;
  status: "healthy" | "degraded" | "maintenance";
}

export interface InvoiceLineItem {
  id: string;
  label: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  tenantId: string;
  periodStart: string;
  periodEnd: string;
  status: "draft" | "issued" | "paid" | "overdue";
  committedAmount: number;
  overageAmount: number;
  total: number;
  lineItems: InvoiceLineItem[];
  issuedAt: string;
}

export type IsolationCheckId =
  | "namespace_isolation"
  | "rbac_separation"
  | "key_isolation"
  | "network_segmentation"
  | "policy_immutability"
  | "audit_log_separation"
  | "replication_isolation"
  | "vault_separation";

export type IsolationStatus = "pass" | "warn" | "fail" | "remediating";

export interface IsolationCheck {
  tenantId: string;
  checkId: IsolationCheckId;
  status: IsolationStatus;
  evidence: string;
  lastVerifiedAt: string;
  remediationAvailable: boolean;
}

export interface IsolationViolation {
  id: string;
  tenantId: string;
  checkId: IsolationCheckId;
  detail: string;
  detectedAt: string;
  severity: AlertSeverity;
}

export type OperatorRole =
  | "MSP Admin"
  | "Security Lead"
  | "Operations"
  | "Auditor";

export interface Operator {
  id: string;
  name: string;
  email: string;
  role: OperatorRole;
  initials: string;
}

export interface OnboardingDraft {
  step: number;
  legalEntity?: string;
  displayName?: string;
  industry?: Industry;
  region?: Region;
  tier?: Tier;
  primaryContact?: string;
  contactEmail?: string;
  workloads?: string[];
  policyTemplateId?: string;
  isolationConfirmed?: boolean;
}
