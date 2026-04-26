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

// ── Tenant detail surface ────────────────────────────────────────────────────

export type AlarmState = "triggered" | "acknowledged" | "resolved";

export type AlarmCategory =
  | "Backup Failure"
  | "Capacity"
  | "Threat"
  | "Policy Drift"
  | "Configuration"
  | "Compliance"
  | "Connectivity";

export interface Alarm {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  category: AlarmCategory;
  severity: AlertSeverity;
  state: AlarmState;
  triggeredAt: string;
  workloadId?: string;
  jobId?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  acknowledgmentNote?: string;
  assignedTo?: string;
  assignedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export type WorkloadType =
  | "VM"
  | "Database"
  | "FileShare"
  | "M365"
  | "Kubernetes"
  | "NAS";

export type WorkloadStatus = "Healthy" | "Warning" | "Failed" | "Unprotected";

export interface Workload {
  id: string;
  tenantId: string;
  name: string;
  type: WorkloadType;
  host: string;
  sizeTB: number;
  policyId: string;
  policyVersion: number;
  status: WorkloadStatus;
  lastBackupAt: string;
  lastBackupStatus: BackupJobStatus;
  nextBackupAt: string;
  agentVersion: string;
  lastCheckinAt: string;
  connectivity: "online" | "degraded" | "offline";
}

export type JobType =
  | "Full"
  | "Incremental"
  | "Synthetic Full"
  | "Active Full"
  | "On-Demand";

export interface JobSession {
  id: string;
  tenantId: string;
  workloadId: string;
  workloadName: string;
  workloadType: WorkloadType;
  jobType: JobType;
  status: BackupJobStatus;
  startedAt: string;
  endedAt?: string;
  durationSec: number;
  bytesTransferred: number;
  bytesSource: number;
  throughputMBps: number;
  dedupRatio: number;
  compressionRatio: number;
  policyId: string;
  errorCode?: string;
  errorMessage?: string;
  log: JobLogLine[];
  progress?: number;
}

export type JobLogLevel = "INFO" | "WARN" | "ERROR";

export interface JobLogLine {
  ts: string;
  level: JobLogLevel;
  message: string;
}

export interface RestorePoint {
  id: string;
  workloadId: string;
  capturedAt: string;
  sizeBytes: number;
  retentionExpiresAt: string;
  immutable: boolean;
  jobId: string;
}

export type ThreatEventStatus =
  | "Investigating"
  | "Contained"
  | "Resolved"
  | "False Positive";

export interface ThreatEvent {
  id: string;
  tenantId: string;
  detectionType: string;
  severity: AlertSeverity;
  detectedAt: string;
  status: ThreatEventStatus;
  analyst: string;
  detail: string;
}

export interface PolicyOverride {
  id: string;
  field: string;
  templateValue: string;
  overrideValue: string;
  appliedBy: string;
  appliedAt: string;
  reason: string;
}

export interface PolicyAssignment {
  tenantId: string;
  policyId: string;
  policyVersion: number;
  appliedAt: string;
  appliedBy: string;
  overrides: PolicyOverride[];
  history: PolicyAssignmentEvent[];
}

export interface PolicyAssignmentEvent {
  id: string;
  occurredAt: string;
  actor: string;
  description: string;
  kind: "applied" | "override-added" | "override-removed" | "auto-migrated";
}

export interface DetailedAuditEvent extends AuditEvent {
  sessionId: string;
  userAgent: string;
  geo: string;
  before?: Record<string, string>;
  after?: Record<string, string>;
  description?: string;
}

export interface QuotaUsage {
  storage: { used: number; limit: number; unit: "TB" };
  workloads: { used: number; limit: number; unit: "workloads" };
  transferOutThisMonth: { used: number; limit: number; unit: "TB" };
  restorePoints: { used: number; limit: number; unit: "points" };
}

export interface MonthlyConsumption {
  month: string; // ISO start of month
  peakUsageTB: number;
  avgUsageTB: number;
  restorePoints: number;
  transferOutTB: number;
}

export interface KeyRotationStatus {
  algorithm: "AES-256-GCM";
  keySource: "Rubrik-managed" | "Customer-managed";
  rotationDays: number;
  lastRotationAt: string;
  nextRotationAt: string;
}
