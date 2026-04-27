import type {
  ComplianceFramework,
  PolicyTemplate,
  PolicyTemplateConfig,
  PolicyTemplateOverride,
  PolicyTemplateRollout,
  RpoUnit,
  Region,
  TemplateIndustry,
  TenantTemplateAssignment,
  WorkloadCoverageType,
} from "@/types";

export interface TemplateRollupStatus {
  inSync: boolean;
  pendingMigration: number;
  hasActiveRollout: boolean;
  overrideCount: number;
  totalAssignments: number;
}

export function rollupTemplateStatus(
  template: PolicyTemplate,
  assignments: TenantTemplateAssignment[],
  overrides: PolicyTemplateOverride[],
  rollouts: PolicyTemplateRollout[],
): TemplateRollupStatus {
  const tenantAssignments = assignments.filter((a) => a.templateId === template.id);
  const pending = tenantAssignments.filter(
    (a) => a.appliedVersion < template.currentVersion,
  ).length;
  const overrideCount = overrides.filter((o) => o.templateId === template.id).length;
  const hasRollout = rollouts.some(
    (r) =>
      r.templateId === template.id &&
      (r.status === "running" || r.status === "paused" || r.status === "validating"),
  );
  return {
    inSync: pending === 0 && overrideCount === 0 && !hasRollout,
    pendingMigration: pending,
    hasActiveRollout: hasRollout,
    overrideCount,
    totalAssignments: tenantAssignments.length,
  };
}

export function ageInDays(iso: string, now: number): number {
  return (now - Date.parse(iso)) / (24 * 60 * 60_000);
}

export function ageInMs(iso: string, now: number): number {
  return now - Date.parse(iso);
}

export function formatRpo(value: number, unit: RpoUnit): string {
  if (value === 0) return "Continuous";
  const label = value === 1 ? unit.slice(0, -1) : unit;
  return `${value} ${label}`;
}

export function formatRetention(value: number, unit: string): string {
  const label = value === 1 ? unit.slice(0, -1) : unit;
  return `${value} ${label}`;
}

export function configFieldValue(
  config: PolicyTemplateConfig,
  field: keyof PolicyTemplateConfig,
): string {
  const v = config[field];
  if (Array.isArray(v)) {
    if (v.length === 0) return "None";
    return v.join(", ");
  }
  if (typeof v === "boolean") return v ? "Enabled" : "Disabled";
  if (typeof v === "number") return v.toLocaleString();
  return String(v);
}

export const FIELD_LABELS: Record<keyof PolicyTemplateConfig, string> = {
  rpoValue: "RPO Value",
  rpoUnit: "RPO Unit",
  rtoValue: "RTO Value",
  rtoUnit: "RTO Unit",
  scheduleType: "Schedule Type",
  scheduleExpression: "Schedule Expression",
  scheduleHumanLabel: "Backup Frequency",
  retentionShortValue: "Short-term Retention",
  retentionShortUnit: "Short-term Unit",
  retentionLongValue: "Long-term Retention",
  retentionLongUnit: "Long-term Unit",
  hardDeleteAfterLongTerm: "Hard Delete After Long-term",
  primaryRepository: "Primary Repository",
  archiveTier: "Archive Tier",
  replicationRegions: "Replication Regions",
  replicationMode: "Replication Mode",
  encryptionAlgorithm: "Encryption Algorithm",
  keyManagement: "Key Management",
  keyRotationDays: "Key Rotation (days)",
  immutabilityLockType: "Immutability Lock Type",
  immutabilityLockDays: "Immutability Lock Duration",
  quorumOverride: "Quorum Override",
  airGap: "Air-Gap",
  crossTenantBlock: "Cross-tenant Block",
  complianceFrameworks: "Compliance Mappings",
  attestationCadence: "Attestation Cadence",
  anomalySensitivity: "Anomaly Sensitivity",
  massDeletionThresholdPerHour: "Mass Deletion Threshold (per hour)",
  encryptionRateChangePct: "Encryption Rate Change (%)",
  autoQuarantine: "Auto-quarantine",
  notifyOnFailure: "Notify on Failure",
  notifyOnDrift: "Notify on Drift",
  notifyOnComplianceViolation: "Notify on Compliance Violation",
  notificationChannels: "Notification Channels",
};

export const ALL_FIELDS: Array<keyof PolicyTemplateConfig> = [
  "rpoValue",
  "rpoUnit",
  "rtoValue",
  "rtoUnit",
  "scheduleHumanLabel",
  "scheduleExpression",
  "retentionShortValue",
  "retentionShortUnit",
  "retentionLongValue",
  "retentionLongUnit",
  "hardDeleteAfterLongTerm",
  "primaryRepository",
  "archiveTier",
  "replicationRegions",
  "replicationMode",
  "encryptionAlgorithm",
  "keyManagement",
  "keyRotationDays",
  "immutabilityLockType",
  "immutabilityLockDays",
  "quorumOverride",
  "airGap",
  "crossTenantBlock",
  "complianceFrameworks",
  "attestationCadence",
  "anomalySensitivity",
  "massDeletionThresholdPerHour",
  "encryptionRateChangePct",
  "autoQuarantine",
  "notifyOnFailure",
  "notifyOnDrift",
  "notifyOnComplianceViolation",
  "notificationChannels",
];

export const ALL_FRAMEWORKS: Array<{ id: ComplianceFramework; label: string }> = [
  { id: "HIPAA", label: "HIPAA — Section 164.312" },
  { id: "SOX", label: "SOX — Section 404" },
  { id: "GDPR", label: "GDPR — Articles 17, 32" },
  { id: "PCI-DSS", label: "PCI-DSS — Requirement 3, 9, 10" },
  { id: "NIST", label: "NIST — 800-53, 800-66" },
  { id: "ISO-27001", label: "ISO-27001 — Annex A.8, A.12" },
  { id: "HITRUST", label: "HITRUST" },
  { id: "FedRAMP", label: "FedRAMP — High / Moderate / Low" },
  { id: "FERPA", label: "FERPA" },
];

export const ALL_INDUSTRIES: TemplateIndustry[] = [
  "Healthcare",
  "Legal",
  "Financial",
  "Education",
  "Manufacturing",
  "Retail",
  "Government",
  "General",
];

export const ALL_WORKLOAD_TYPES: WorkloadCoverageType[] = [
  "VM",
  "SQL",
  "M365",
  "NAS",
  "Oracle",
  "Kubernetes",
  "FileShare",
];

export const ALL_REGIONS: Region[] = [
  "us-east-1",
  "us-west-2",
  "eu-west-1",
  "ap-south-1",
];

export function buildTemplateYaml(template: PolicyTemplate): string {
  const v = template.versions[template.versions.length - 1];
  const c = v.config;
  const lines: string[] = [
    "apiVersion: rubrik.io/v1",
    "kind: PolicyTemplate",
    "metadata:",
    `  name: ${template.id}`,
    `  version: v${v.version}`,
    `  industry: ${template.industry.toLowerCase()}`,
    `  created: ${template.createdAt}`,
    `  modified: ${v.authoredAt}`,
    `  author: ${v.authoredBy.toLowerCase().replace(/\s+/g, ".")}@rubrikmsp.io`,
    "",
    "spec:",
    "  protection:",
    `    rpo: ${c.rpoValue}${c.rpoUnit.charAt(0)}`,
    `    rto: ${c.rtoValue}${c.rtoUnit.charAt(0)}`,
    "    backupFrequency:",
    `      schedule: ${c.scheduleType.toLowerCase()}`,
    `      expression: "${c.scheduleExpression}"`,
    "    retention:",
    `      shortTerm: ${c.retentionShortValue}${c.retentionShortUnit.charAt(0)}`,
    `      longTerm: ${c.retentionLongValue}${c.retentionLongUnit.charAt(0)}`,
    `      hardDeleteAfter: ${c.hardDeleteAfterLongTerm}`,
    "",
    "  storage:",
    `    primary: ${c.primaryRepository}`,
    `    archive: ${c.archiveTier}`,
    "    replication:",
    `      regions: [${c.replicationRegions.join(", ")}]`,
    `      mode: ${c.replicationMode.toLowerCase()}`,
    "",
    "  security:",
    "    encryption:",
    `      algorithm: ${c.encryptionAlgorithm}`,
    `      keyManagement: ${c.keyManagement.toLowerCase()}`,
    `      keyRotation: ${c.keyRotationDays}d`,
    "    immutability:",
    `      enabled: ${c.immutabilityLockType !== "None"}`,
    `      lockType: ${c.immutabilityLockType.toLowerCase()}`,
    `      lockDuration: ${c.immutabilityLockDays}d`,
    `      quorumOverride: ${c.quorumOverride}`,
    "    airGap:",
    `      enabled: ${c.airGap}`,
    "      proxy: envoy",
    `    crossTenantBlock: ${c.crossTenantBlock ? "enforced" : "disabled"}`,
    "",
    "  compliance:",
    "    frameworks:",
    ...c.complianceFrameworks.map((f) => `      - ${f.toLowerCase()}`),
    "    attestation:",
    "      required: true",
    `      cadence: ${c.attestationCadence.toLowerCase()}`,
    "",
    "  anomalyDetection:",
    `    sensitivity: ${c.anomalySensitivity.toLowerCase()}`,
    `    massDeletionThreshold: ${c.massDeletionThresholdPerHour}_per_hour`,
    `    encryptionRateChangeThreshold: ${c.encryptionRateChangePct}`,
    `    autoQuarantine: ${c.autoQuarantine}`,
    "",
    "  notifications:",
    "    onFailure:",
    ...c.notifyOnFailure.map((n) => `      - ${n}`),
    "    onDrift:",
    ...c.notifyOnDrift.map((n) => `      - ${n}`),
    "    onComplianceViolation:",
    ...c.notifyOnComplianceViolation.map((n) => `      - ${n}`),
    "    channels:",
    ...c.notificationChannels.map((ch) => `      - ${ch}`),
  ];
  return lines.join("\n");
}
