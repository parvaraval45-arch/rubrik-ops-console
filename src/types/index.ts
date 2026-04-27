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
  tags?: string[];
  policyTemplateId?: string;
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

export type WizardStepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface ResellerEntity {
  id: string;
  name: string;
}

export type StorageTier = "Performance" | "Capacity" | "Archive";

export type QuotaHardLimit =
  | "block-new-backups"
  | "allow-with-notification"
  | "allow-with-auto-upgrade"
  | "block-restore"
  | "auto-purge-oldest"
  | "notify-only";

export interface QuotaConfig {
  storageTB: number;
  storageSoftPct: number;
  storageHardLimit: QuotaHardLimit;
  workloads: number;
  workloadsHardLimit: QuotaHardLimit;
  transferOutTB: number;
  transferOutHardLimit: QuotaHardLimit;
  restorePoints: number;
  restorePointsHardLimit: QuotaHardLimit;
  overrideApprovalRequired: boolean;
}

export type PolicyInheritanceMode = "Locked" | "Override Allowed";

export type MFAMode = "required" | "optional" | "disabled";

export type IamRole = "Admin" | "Operator" | "Read-Only";

export interface IamAssignment {
  operatorId: string;
  role: IamRole;
}

export type EncryptionKeySource = "rubrik-managed" | "byok";

export interface IsolationConfig {
  namespace: string;
  iam: IamAssignment[];
  tenantAdminEmail: string;
  sendInviteOnDeploy: boolean;
  mfaMode: MFAMode;
  mfaDisabledReason?: string;
  keySource: EncryptionKeySource;
  keyRotationDays: 30 | 60 | 90;
  byokKmsEndpoint?: string;
}

export type InvoiceCadence = "Monthly" | "Quarterly" | "Annual";
export type InvoicePaymentTerms = "Net 15" | "Net 30" | "Net 60" | "Net 90";
export type InvoiceCurrency = "USD" | "EUR" | "GBP" | "SGD";

export interface BillingConfig {
  contactName: string;
  billingEmail: string;
  poNumber?: string;
  ratePerTB: number;
  rateOverrideReason?: string;
  capacityCommitTB: number;
  annualMinimumCommit: boolean;
  overagePolicy: QuotaHardLimit;
  cadence: InvoiceCadence;
  paymentTerms: InvoicePaymentTerms;
  currency: InvoiceCurrency;
  resellerCommissionPct?: number;
  resellerCommissionReason?: string;
}

export type DraftStatus = "in-progress" | "provisioning" | "completed" | "failed";

export interface OnboardingDraft {
  id: string;
  status: DraftStatus;
  currentStep: WizardStepNumber;
  // Step 1
  tenantName?: string;
  legalEntity?: string;
  industry?: Industry;
  region?: Region;
  primaryContact?: string;
  contactEmail?: string;
  resellerType?: "direct" | "reseller";
  resellerId?: string;
  isAdditionalSite?: boolean;
  parentTenantId?: string;
  tier?: Tier;
  // Step 2
  clusterId?: string;
  storageTier?: StorageTier;
  allocationTB?: number;
  // Step 3
  quotas?: QuotaConfig;
  // Step 4
  policyTemplateId?: string;
  inheritanceMode?: PolicyInheritanceMode;
  // Step 5
  isolation?: IsolationConfig;
  // Step 6
  billing?: BillingConfig;

  // Workflow metadata
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  assignedTo: string;
  reassignmentHistory: Array<{
    from: string;
    to: string;
    at: string;
    note?: string;
  }>;
}

export type ProvisioningTaskStatus =
  | "pending"
  | "running"
  | "complete"
  | "failed"
  | "rolling-back"
  | "rolled-back";

export interface ProvisioningTaskState {
  id: string;
  title: string;
  status: ProvisioningTaskStatus;
  substepIndex: number;
  startedAt?: number;
  endedAt?: number;
  durationMs?: number;
  errorMessage?: string;
  warning?: string;
}

export interface PreFlightCheck {
  id: string;
  title: string;
  status: "pending" | "running" | "pass" | "fail";
  detail?: string;
  fixStep?: WizardStepNumber;
  durationMs?: number;
}

export interface ProvisioningRun {
  id: string;
  draftId: string;
  tenantName: string;
  startedAt: string;
  endedAt?: string;
  tasks: ProvisioningTaskState[];
  finalTenantId?: string;
  failed?: boolean;
  rollbackReason?: string;
}

export interface ValidationWindowEntry {
  tenantId: string;
  tenantName: string;
  windowEndsAt: string;
  daysRemaining: number;
  status: "Healthy" | "Watch" | "Issue Detected";
  lastCheckAt: string;
  issuesCount: number;
  issueDetail?: string;
}

export interface CompletedOnboarding {
  id: string;
  tenantId: string;
  tenantName: string;
  completedAt: string;
  totalDurationSec: number;
  deployedBy: string;
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

// ── Security & Isolation surface ─────────────────────────────────────────────

export type IsolationControlId =
  | "network"
  | "storage"
  | "iam"
  | "encryption"
  | "namespace";

export interface IsolationControlDef {
  id: IsolationControlId;
  label: string;
  description: string;
}

export type IsolationCellStatus = "pass" | "warn" | "fail" | "remediating";

export interface FrameworkCitation {
  framework: string; // e.g., "HIPAA", "SOC 2", "ISO 27001"
  section: string; // e.g., "164.312(a)(1)"
  description: string;
}

export interface AffectedResource {
  id: string;
  type: "Volume" | "Repository Pool" | "Restore Point" | "Snapshot" | "IAM Role" | "Network Rule" | "KMS Key" | "Namespace";
  description: string;
  ownerTenantId?: string;
  lastAccessedAt?: string;
}

export interface RemediationStepDef {
  id: string;
  title: string;
  description: string;
  estimatedDurationLabel: string;
  substeps: string[];
  completionDurationLabel: string;
}

export interface IsolationCellViolation {
  description: string;
  severity: AlertSeverity;
  firstDetectedAt: string;
  detectionSource: string;
  frameworkCitations: FrameworkCitation[];
  affectedResources: AffectedResource[];
  blastRadius: string;
  customerNotificationTrigger: string;
  estimatedRemediationLabel: string;
  likelihood: "Low" | "Medium" | "High";
  recommendedAction: string;
  remediationSteps: RemediationStepDef[];
  evidenceLog: string;
  configurationSnapshot: string;
  evidencePackageId: string;
  history: {
    firstDetectedAt: string;
    failsLast30d: number;
    successfulRemediations: number;
    lastSuccessfulPassAt: string;
    pattern: string;
  };
}

export interface IsolationCell {
  tenantId: string;
  controlId: IsolationControlId;
  status: IsolationCellStatus;
  lastEvaluatedAt: string;
  evidence: string;
  violation?: IsolationCellViolation;
  acknowledged?: boolean;
}

export type ThreatDetectionType =
  | "Unusual Access Pattern"
  | "Mass Deletion"
  | "Ransomware Signature"
  | "Anomalous Encryption"
  | "Data Exfiltration Pattern"
  | "Privilege Escalation Attempt";

export interface ThreatDetection {
  id: string;
  tenantId: string;
  detectionType: ThreatDetectionType;
  severity: AlertSeverity;
  status: ThreatEventStatus;
  detectedAt: string;
  analyst: string;
  detail: string;
  history: Array<{
    at: string;
    by: string;
    from: ThreatEventStatus | null;
    to: ThreatEventStatus;
    note: string;
  }>;
}

export interface RbacRoleSummary {
  id: string;
  name: string;
  userCount: number;
  scope: string;
}

export interface OperatorAccessRow {
  operatorId: string;
  operatorName: string;
  initials: string;
  tenantsAssigned: number;
  role: string;
  mfaEnforced: boolean;
}

export type AccessRequestStatus = "pending" | "approved" | "denied";

export interface AccessRequest {
  id: string;
  requesterName: string;
  requesterInitials: string;
  requestedRole: string;
  scope: string;
  requestedAt: string;
  justification: string;
  status: AccessRequestStatus;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
}

export interface ComplianceFrameworkPosture {
  framework: string;
  fullLabel: string;
  compliancePct: number;
  compliantCount: number;
  totalCount: number;
  findings: Array<{ tenantId: string; tenantName: string; findings: string[] }>;
}

export interface SecurityScheduleEntry {
  controlId: IsolationControlId | "full-sweep";
  label: string;
  frequencyHours: number; // for full-sweep, derived
  lastRunAt: string;
  nextRunAt: string;
}

export interface SecurityBannerState {
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  acknowledgmentNote?: string;
  estimatedResolution?: string;
}

export interface AttestationReport {
  id: string;
  title: string;
  generatedAt: string;
  generatedBy: string;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  frameworks: string[];
  tenantCount: number;
  distributionList: string[];
}

// ── Capacity & Billing ───────────────────────────────────────────────────────

export type BillingStatus = "Draft" | "Approved" | "Invoiced" | "Paid" | "Disputed";

export type BillingPeriodStatus = "open" | "locked" | "invoiced" | "paid";

export interface BillingAdjustment {
  id: string;
  description: string;
  amount: number; // negative for credits
  reason: string;
  appliedBy: string;
  appliedAt: string;
}

export interface BillingDispute {
  id: string;
  filedAt: string;
  filedBy: string;
  contactEmail: string;
  status: "Awaiting Review" | "Acknowledged" | "Under Review" | "Resolved (Adjusted)" | "Resolved (Denied)" | "Escalated";
  disputedAmount: number;
  reason: string;
  estimatedResolutionAt?: string;
  activity: Array<{
    at: string;
    by: string;
    note: string;
  }>;
  evidence: Array<{ id: string; description: string }>;
}

export interface BillingLineItem {
  id: string;
  tenantId: string;
  tenantName: string;
  industry: Industry;
  tier: Tier;
  resellerId?: string;
  committedTB: number;
  usedTB: number;
  overageTB: number;
  utilizationPct: number;
  ratePerTB: number;
  baseCharge: number;
  overageCharge: number;
  adjustments: BillingAdjustment[];
  resellerCommissionPct?: number;
  totalCharge: number;
  status: BillingStatus;
  invoiceId?: string;
  invoicedAt?: string;
  paidAt?: string;
  dispute?: BillingDispute;
  workloadBreakdown: Array<{ type: WorkloadType; consumedTB: number }>;
  storageTierBreakdown: Array<{ tier: "Performance" | "Capacity" | "Archive"; consumedTB: number }>;
  metrics: {
    totalRestorePoints: number;
    transferOutTB: number;
    backupJobsExecuted: number;
  };
  taxNote: string;
}

export interface BillingPeriod {
  periodStart: string;
  periodEnd: string;
  label: string;
  status: BillingPeriodStatus;
  lockedAt?: string;
  invoicedAt?: string;
  paidAt?: string;
  reconciledAt: string;
}

export interface QuotaEnforcementRow {
  id: string;
  tenantId: string;
  tenantName: string;
  quotaType: "Storage" | "Workload Count" | "Transfer-Out" | "Restore Points";
  currentUsage: string;
  softLimit: string;
  hardLimit: string;
  hardLimitBehavior: "Block" | "Notify" | "Auto-Upgrade";
  status: "Approaching Soft" | "Soft Breach" | "Approaching Hard" | "Hard Breach";
  detail: string;
}

export type ExportFormat = "csv" | "json" | "connectwise" | "autotask";

// ── Tenant Directory ─────────────────────────────────────────────────────────

export type TenantDirectoryDensity = "compact" | "comfortable" | "spacious";
export type TenantDirectoryView = "table" | "cards";

export interface TenantTag {
  id: string;
  label: string;
  tone: "neutral" | "info" | "success" | "warning" | "critical";
}

export interface DirectoryFilters {
  status?: string[];
  tier?: string[];
  industry?: string[];
  region?: string[];
  cluster?: string[];
  policyTemplate?: string[];
  securityScoreMin?: number;
  securityScoreMax?: number;
  slaStatus?: string[];
  capacityStatus?: string[];
  tags?: string[];
  search?: string;
}

export interface DirectorySavedView {
  id: string;
  name: string;
  icon?: string;
  pinned: boolean;
  visibility: "private" | "team";
  description?: string;
  filters: DirectoryFilters;
  sortKey?: string;
  sortDir?: "asc" | "desc";
  density?: TenantDirectoryDensity;
  isSystem: boolean;
}

// ── Policy Template lifecycle (the /policies surface) ────────────────────────

export type PolicyTemplateStatus = "Active" | "Draft" | "Deprecated";

export type ComplianceFramework =
  | "HIPAA"
  | "SOX"
  | "GDPR"
  | "PCI-DSS"
  | "NIST"
  | "ISO-27001"
  | "HITRUST"
  | "FERPA"
  | "FedRAMP";

export type WorkloadCoverageType =
  | "VM"
  | "SQL"
  | "M365"
  | "NAS"
  | "Oracle"
  | "Kubernetes"
  | "FileShare";

export type RpoUnit = "minutes" | "hours" | "days";
export type RetentionUnit = "days" | "months" | "years";
export type LockType = "Compliance" | "Governance" | "None";
export type ScheduleType = "Cron" | "Recurring" | "Continuous";
export type EncryptionAlgorithm = "AES-256-GCM" | "AES-256-CBC";
export type ReplicationMode = "Async" | "Sync" | "On-demand";
export type AnomalySensitivity = "Low" | "Medium" | "High";
export type NotificationTarget = "tenant-admin" | "msp-operator" | "compliance-team";
export type NotificationChannel = "email" | "slack" | "teams" | "pagerduty";

export interface PolicyTemplateConfig {
  rpoValue: number;
  rpoUnit: RpoUnit;
  rtoValue: number;
  rtoUnit: RpoUnit;
  scheduleType: ScheduleType;
  scheduleExpression: string;
  scheduleHumanLabel: string;
  retentionShortValue: number;
  retentionShortUnit: RetentionUnit;
  retentionLongValue: number;
  retentionLongUnit: RetentionUnit;
  hardDeleteAfterLongTerm: boolean;
  primaryRepository: string;
  archiveTier: string;
  replicationRegions: Region[];
  replicationMode: ReplicationMode;
  encryptionAlgorithm: EncryptionAlgorithm;
  keyManagement: "Rubrik-Managed" | "BYOK";
  keyRotationDays: number;
  immutabilityLockType: LockType;
  immutabilityLockDays: number;
  quorumOverride: boolean;
  airGap: boolean;
  crossTenantBlock: boolean;
  complianceFrameworks: ComplianceFramework[];
  attestationCadence: "Quarterly" | "Annual" | "Monthly";
  anomalySensitivity: AnomalySensitivity;
  massDeletionThresholdPerHour: number;
  encryptionRateChangePct: number;
  autoQuarantine: boolean;
  notifyOnFailure: NotificationTarget[];
  notifyOnDrift: NotificationTarget[];
  notifyOnComplianceViolation: NotificationTarget[];
  notificationChannels: NotificationChannel[];
}

export interface PolicyTemplateVersion {
  id: string;
  version: number;
  authoredBy: string;
  authoredAt: string;
  changeSummary: string;
  config: PolicyTemplateConfig;
  migrationOutcome?: string;
}

export interface PolicyTemplateOverride {
  id: string;
  templateId: string;
  tenantId: string;
  field: keyof PolicyTemplateConfig;
  fieldLabel: string;
  templateValue: string;
  overrideValue: string;
  appliedBy: string;
  appliedAt: string;
  reason: string;
}

export interface TenantTemplateAssignment {
  tenantId: string;
  templateId: string;
  appliedVersion: number;
  appliedAt: string;
  appliedBy: string;
}

export type RolloutStrategy =
  | "canary-staged-fleet"
  | "all-at-once"
  | "manual-per-tenant";

export type RolloutPhase = "canary" | "staged" | "fleet";

export type RolloutPhaseStatus =
  | "pending"
  | "running"
  | "observing"
  | "ready-to-promote"
  | "complete"
  | "aborted";

export type RolloutOverallStatus =
  | "draft"
  | "validating"
  | "running"
  | "paused"
  | "complete"
  | "aborted"
  | "rolled-back";

export interface RolloutHealthCheck {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail" | "pending";
  detail?: string;
}

export interface RolloutPhasePlan {
  phase: RolloutPhase;
  tenantIds: string[];
  observationHours: number;
  status: RolloutPhaseStatus;
  startedAt?: string;
  completedAt?: string;
  migratedTenantIds: string[];
  failedTenantIds: string[];
  healthChecks: RolloutHealthCheck[];
}

export interface PolicyTemplateRollout {
  id: string;
  templateId: string;
  fromVersion: number | null;
  toVersion: number;
  strategy: RolloutStrategy;
  status: RolloutOverallStatus;
  startedBy: string;
  startedAt: string;
  completedAt?: string;
  abortedAt?: string;
  abortReason?: string;
  note: string;
  phases: RolloutPhasePlan[];
  currentPhase: RolloutPhase | null;
  validation: RolloutHealthCheck[];
  totalAffectedTenants: number;
}

export type PolicyTemplateAuditAction =
  | "template.create"
  | "template.version.publish"
  | "template.tenant.apply"
  | "template.tenant.remove"
  | "template.override.add"
  | "template.override.remove"
  | "template.rollout.start"
  | "template.rollout.promote"
  | "template.rollout.complete"
  | "template.rollout.abort"
  | "template.rollback"
  | "template.archive";

export interface PolicyTemplateAuditEntry {
  id: string;
  templateId: string;
  occurredAt: string;
  actor: string;
  actorRole: string;
  action: PolicyTemplateAuditAction;
  targetVersion?: number;
  description: string;
  outcome: "success" | "failure";
}

export type TemplateIndustry =
  | "Healthcare"
  | "Legal"
  | "Financial"
  | "Education"
  | "Manufacturing"
  | "Retail"
  | "Government"
  | "General";

export interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  industry: TemplateIndustry;
  status: PolicyTemplateStatus;
  tags: string[];
  workloadCoverage: WorkloadCoverageType[];
  complianceFrameworks: ComplianceFramework[];
  currentVersion: number;
  versions: PolicyTemplateVersion[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
