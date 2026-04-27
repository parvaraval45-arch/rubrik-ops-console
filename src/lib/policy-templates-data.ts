import type {
  PolicyTemplate,
  PolicyTemplateAuditEntry,
  PolicyTemplateConfig,
  PolicyTemplateOverride,
  PolicyTemplateRollout,
  PolicyTemplateVersion,
  TenantTemplateAssignment,
  Tenant,
} from "@/types";

const OPERATORS = {
  alex: "Alex Morrison",
  priya: "Priya Patel",
  marcus: "Marcus Chen",
  sofia: "Sofia Reyes",
  daniel: "Daniel Okafor",
} as const;

const NOW = Date.parse("2026-04-26T11:00:00Z");

function daysAgo(d: number): string {
  return new Date(NOW - d * 24 * 60 * 60_000).toISOString();
}

function hoursAgo(h: number): string {
  return new Date(NOW - h * 60 * 60_000).toISOString();
}

function lookupTenantId(tenants: Tenant[], name: string): string {
  const t = tenants.find((x) => x.name === name);
  return t?.id ?? "";
}

function makeBaseConfig(): PolicyTemplateConfig {
  return {
    rpoValue: 1,
    rpoUnit: "hours",
    rtoValue: 4,
    rtoUnit: "hours",
    scheduleType: "Cron",
    scheduleExpression: "0 */1 9-18 * * 1-5",
    scheduleHumanLabel: "Hourly between 9 AM-6 PM, Mon-Fri",
    retentionShortValue: 30,
    retentionShortUnit: "days",
    retentionLongValue: 7,
    retentionLongUnit: "years",
    hardDeleteAfterLongTerm: true,
    primaryRepository: "rsc-repo-east-04",
    archiveTier: "rsc-glacier-tier",
    replicationRegions: ["us-east-1", "us-west-2"],
    replicationMode: "Async",
    encryptionAlgorithm: "AES-256-GCM",
    keyManagement: "Rubrik-Managed",
    keyRotationDays: 90,
    immutabilityLockType: "Compliance",
    immutabilityLockDays: 90,
    quorumOverride: false,
    airGap: true,
    crossTenantBlock: true,
    complianceFrameworks: [],
    attestationCadence: "Quarterly",
    anomalySensitivity: "Medium",
    massDeletionThresholdPerHour: 1000,
    encryptionRateChangePct: 50,
    autoQuarantine: true,
    notifyOnFailure: ["tenant-admin", "msp-operator"],
    notifyOnDrift: ["tenant-admin", "msp-operator"],
    notifyOnComplianceViolation: ["msp-operator", "compliance-team"],
    notificationChannels: ["email", "slack"],
  };
}

function buildHealthcareTemplate(): {
  template: PolicyTemplate;
  audit: PolicyTemplateAuditEntry[];
} {
  const id = "tpl_healthcare_hipaa_gold";

  const v1Config: PolicyTemplateConfig = {
    ...makeBaseConfig(),
    rpoValue: 4,
    rpoUnit: "hours",
    rtoValue: 8,
    rtoUnit: "hours",
    retentionLongValue: 3,
    retentionLongUnit: "years",
    immutabilityLockType: "None",
    immutabilityLockDays: 0,
    airGap: false,
    encryptionAlgorithm: "AES-256-CBC",
    complianceFrameworks: ["HIPAA"],
    notifyOnDrift: ["tenant-admin"],
    notifyOnComplianceViolation: ["compliance-team"],
  };

  const v2Config: PolicyTemplateConfig = {
    ...v1Config,
    rpoValue: 1,
    immutabilityLockType: "Compliance",
    immutabilityLockDays: 60,
    airGap: true,
    encryptionAlgorithm: "AES-256-CBC",
  };

  const v3Config: PolicyTemplateConfig = {
    ...v2Config,
    retentionLongValue: 5,
    encryptionAlgorithm: "AES-256-GCM",
    complianceFrameworks: ["HIPAA", "ISO-27001"],
  };

  const v4Config: PolicyTemplateConfig = {
    ...v3Config,
    retentionLongValue: 7,
    immutabilityLockDays: 90,
    complianceFrameworks: ["HIPAA", "NIST", "ISO-27001", "HITRUST"],
    notifyOnDrift: ["tenant-admin", "msp-operator"],
  };

  const versions: PolicyTemplateVersion[] = [
    {
      id: `${id}_v1`,
      version: 1,
      authoredBy: OPERATORS.marcus,
      authoredAt: daysAgo(335),
      changeSummary: "Initial template based on HIPAA baseline assessment",
      config: v1Config,
    },
    {
      id: `${id}_v2`,
      version: 2,
      authoredBy: OPERATORS.alex,
      authoredAt: daysAgo(184),
      changeSummary:
        "Added immutability lock duration (60 days), enabled air-gap by default",
      config: v2Config,
      migrationOutcome:
        "Migration affected 2 tenants over 7 minutes. All migrations completed successfully.",
    },
    {
      id: `${id}_v3`,
      version: 3,
      authoredBy: OPERATORS.priya,
      authoredAt: daysAgo(89),
      changeSummary:
        "Tightened encryption to AES-256-GCM only, removed legacy AES-256-CBC option",
      config: v3Config,
      migrationOutcome:
        "Migration affected 3 tenants over 9 minutes. Re-encryption completed without retries.",
    },
    {
      id: `${id}_v4`,
      version: 4,
      authoredBy: OPERATORS.alex,
      authoredAt: daysAgo(17),
      changeSummary:
        "Increased retention to 7 years per updated HIPAA Privacy Rule guidance, added NIST 800-171 compliance mapping",
      config: v4Config,
      migrationOutcome:
        "Migration affected 4 tenants over 11 minutes. Mercy General had 1 retry due to retention extension. All migrations completed successfully.",
    },
  ];

  const template: PolicyTemplate = {
    id,
    name: "Healthcare HIPAA Gold",
    description:
      "HIPAA-compliant backup policy for healthcare organizations with 7-year retention and quarterly compliance audits.",
    industry: "Healthcare",
    status: "Active",
    tags: ["healthcare", "hipaa", "regulated"],
    workloadCoverage: ["VM", "SQL", "M365", "NAS", "FileShare"],
    complianceFrameworks: ["HIPAA", "NIST", "ISO-27001", "HITRUST"],
    currentVersion: 4,
    versions,
    createdAt: versions[0].authoredAt,
    updatedAt: versions[3].authoredAt,
    createdBy: OPERATORS.marcus,
  };

  const audit: PolicyTemplateAuditEntry[] = [
    {
      id: `${id}_a1`,
      templateId: id,
      occurredAt: versions[0].authoredAt,
      actor: OPERATORS.marcus,
      actorRole: "MSP Admin",
      action: "template.create",
      targetVersion: 1,
      description: "Initial v1 created from HIPAA baseline",
      outcome: "success",
    },
    {
      id: `${id}_a2`,
      templateId: id,
      occurredAt: versions[1].authoredAt,
      actor: OPERATORS.alex,
      actorRole: "MSP Admin",
      action: "template.version.publish",
      targetVersion: 2,
      description: "v2 published: added immutability lock 60d",
      outcome: "success",
    },
    {
      id: `${id}_a3`,
      templateId: id,
      occurredAt: daysAgo(180),
      actor: OPERATORS.alex,
      actorRole: "MSP Admin",
      action: "template.tenant.apply",
      targetVersion: 2,
      description: "v2 applied to Mercy General Hospital",
      outcome: "success",
    },
    {
      id: `${id}_a4`,
      templateId: id,
      occurredAt: versions[2].authoredAt,
      actor: OPERATORS.priya,
      actorRole: "Security Lead",
      action: "template.version.publish",
      targetVersion: 3,
      description: "v3 published: tightened encryption to AES-256-GCM only",
      outcome: "success",
    },
    {
      id: `${id}_a5`,
      templateId: id,
      occurredAt: hoursAgo(89 * 24 - 0.05 * 24),
      actor: "System",
      actorRole: "Platform",
      action: "template.rollout.start",
      targetVersion: 3,
      description: "v2 to v3 migration for 3 tenants",
      outcome: "success",
    },
    {
      id: `${id}_a6`,
      templateId: id,
      occurredAt: versions[3].authoredAt,
      actor: OPERATORS.alex,
      actorRole: "MSP Admin",
      action: "template.version.publish",
      targetVersion: 4,
      description: "v4 published: extended retention 5y to 7y, added NIST 800-171",
      outcome: "success",
    },
    {
      id: `${id}_a7`,
      templateId: id,
      occurredAt: hoursAgo(17 * 24 - 0.18),
      actor: "System",
      actorRole: "Platform",
      action: "template.rollout.start",
      targetVersion: 4,
      description: "v3 to v4 canary phase, Sunrise Senior Care selected",
      outcome: "success",
    },
    {
      id: `${id}_a8`,
      templateId: id,
      occurredAt: hoursAgo(16 * 24),
      actor: "System",
      actorRole: "Platform",
      action: "template.rollout.promote",
      targetVersion: 4,
      description: "Canary healthy, promoting to staged phase",
      outcome: "success",
    },
    {
      id: `${id}_a9`,
      templateId: id,
      occurredAt: hoursAgo(14 * 24),
      actor: "System",
      actorRole: "Platform",
      action: "template.rollout.complete",
      targetVersion: 4,
      description: "v4 fleet rollout complete, 4 tenants migrated",
      outcome: "success",
    },
  ];

  return { template, audit };
}

function buildFinancialTemplate(): {
  template: PolicyTemplate;
  audit: PolicyTemplateAuditEntry[];
} {
  const id = "tpl_financial_sox_standard";
  const baseConfig = makeBaseConfig();
  const config: PolicyTemplateConfig = {
    ...baseConfig,
    rpoValue: 15,
    rpoUnit: "minutes",
    rtoValue: 2,
    rtoUnit: "hours",
    retentionLongValue: 1,
    retentionLongUnit: "years",
    immutabilityLockDays: 365,
    primaryRepository: "rsc-repo-west-02",
    complianceFrameworks: ["SOX", "PCI-DSS"],
    scheduleHumanLabel: "Every 15 minutes during market hours, hourly otherwise",
    scheduleExpression: "*/15 9-16 * * 1-5",
  };

  const versions: PolicyTemplateVersion[] = Array.from({ length: 6 }).map(
    (_, i) => ({
      id: `${id}_v${i + 1}`,
      version: i + 1,
      authoredBy: i % 2 === 0 ? OPERATORS.alex : OPERATORS.priya,
      authoredAt: daysAgo(180 - i * 25),
      changeSummary:
        i === 5
          ? "Tightened immutability lock to 365 days for SOX 7-year archive baseline"
          : "Iterative refinement of retention and replication targets",
      config,
    }),
  );

  const template: PolicyTemplate = {
    id,
    name: "Financial SOX Standard",
    description:
      "SOX-compliant policy for financial institutions with 1-year retention and chain-of-custody requirements.",
    industry: "Financial",
    status: "Active",
    tags: ["financial", "sox", "regulated"],
    workloadCoverage: ["VM", "SQL", "Oracle", "FileShare"],
    complianceFrameworks: ["SOX", "PCI-DSS"],
    currentVersion: 6,
    versions,
    createdAt: versions[0].authoredAt,
    updatedAt: versions[5].authoredAt,
    createdBy: OPERATORS.alex,
  };

  const audit: PolicyTemplateAuditEntry[] = versions.map((v) => ({
    id: `${id}_a${v.version}`,
    templateId: id,
    occurredAt: v.authoredAt,
    actor: v.authoredBy,
    actorRole: "MSP Admin",
    action: v.version === 1 ? "template.create" : "template.version.publish",
    targetVersion: v.version,
    description:
      v.version === 1
        ? "Initial template forked from SOX baseline reference"
        : v.changeSummary,
    outcome: "success",
  }));

  return { template, audit };
}

function buildLegalTemplate(): {
  template: PolicyTemplate;
  audit: PolicyTemplateAuditEntry[];
} {
  const id = "tpl_legal_document_retention";
  const baseConfig = makeBaseConfig();
  const config: PolicyTemplateConfig = {
    ...baseConfig,
    rpoValue: 24,
    rpoUnit: "hours",
    rtoValue: 24,
    rtoUnit: "hours",
    scheduleType: "Recurring",
    scheduleHumanLabel: "Daily at 02:00 local time",
    scheduleExpression: "0 0 2 * * *",
    retentionLongValue: 5,
    retentionLongUnit: "years",
    immutabilityLockDays: 365 * 5,
    complianceFrameworks: ["GDPR"],
    notificationChannels: ["email"],
  };

  const versions: PolicyTemplateVersion[] = [
    {
      id: `${id}_v1`,
      version: 1,
      authoredBy: OPERATORS.sofia,
      authoredAt: daysAgo(120),
      changeSummary: "Initial template authored to support GDPR Article 17 erasure flows",
      config: { ...config, retentionLongValue: 3 },
    },
    {
      id: `${id}_v2`,
      version: 2,
      authoredBy: OPERATORS.alex,
      authoredAt: daysAgo(28),
      changeSummary: "Extended retention to 5 years, added chain-of-custody attestation",
      config,
    },
  ];

  const template: PolicyTemplate = {
    id,
    name: "Legal Document Retention",
    description:
      "Long-term document retention for legal firms with chain of custody and GDPR data subject rights support.",
    industry: "Legal",
    status: "Active",
    tags: ["legal", "gdpr", "regulated"],
    workloadCoverage: ["M365", "NAS", "FileShare"],
    complianceFrameworks: ["GDPR"],
    currentVersion: 2,
    versions,
    createdAt: versions[0].authoredAt,
    updatedAt: versions[1].authoredAt,
    createdBy: OPERATORS.sofia,
  };

  const audit: PolicyTemplateAuditEntry[] = versions.map((v) => ({
    id: `${id}_a${v.version}`,
    templateId: id,
    occurredAt: v.authoredAt,
    actor: v.authoredBy,
    actorRole: "MSP Admin",
    action: v.version === 1 ? "template.create" : "template.version.publish",
    targetVersion: v.version,
    description: v.changeSummary,
    outcome: "success",
  }));

  return { template, audit };
}

function buildPciTemplate(): {
  template: PolicyTemplate;
  audit: PolicyTemplateAuditEntry[];
} {
  const id = "tpl_pci_dss_cardholder";
  const config: PolicyTemplateConfig = {
    ...makeBaseConfig(),
    rpoValue: 30,
    rpoUnit: "minutes",
    rtoValue: 1,
    rtoUnit: "hours",
    keyRotationDays: 90,
    complianceFrameworks: ["PCI-DSS", "SOX"],
    immutabilityLockDays: 365,
  };
  const versions: PolicyTemplateVersion[] = Array.from({ length: 8 }).map(
    (_, i) => ({
      id: `${id}_v${i + 1}`,
      version: i + 1,
      authoredBy: i % 2 === 0 ? OPERATORS.priya : OPERATORS.alex,
      authoredAt: daysAgo(220 - i * 22),
      changeSummary:
        i === 7
          ? "Quarterly PCI key rotation cadence enforced; cardholder volumes pinned to PCI-validated repositories"
          : "Iterative tightening of network segmentation and key handling controls",
      config,
    }),
  );

  const template: PolicyTemplate = {
    id,
    name: "PCI-DSS Cardholder Data",
    description:
      "Strict PCI-DSS Level 1 policy for cardholder data environments with quarterly key rotation.",
    industry: "Retail",
    status: "Active",
    tags: ["pci", "retail", "regulated"],
    workloadCoverage: ["VM", "SQL", "Kubernetes"],
    complianceFrameworks: ["PCI-DSS", "SOX"],
    currentVersion: 8,
    versions,
    createdAt: versions[0].authoredAt,
    updatedAt: versions[7].authoredAt,
    createdBy: OPERATORS.priya,
  };
  const audit: PolicyTemplateAuditEntry[] = versions.map((v) => ({
    id: `${id}_a${v.version}`,
    templateId: id,
    occurredAt: v.authoredAt,
    actor: v.authoredBy,
    actorRole: "MSP Admin",
    action: v.version === 1 ? "template.create" : "template.version.publish",
    targetVersion: v.version,
    description: v.changeSummary,
    outcome: "success",
  }));
  return { template, audit };
}

function buildGeneralTemplate(): {
  template: PolicyTemplate;
  audit: PolicyTemplateAuditEntry[];
} {
  const id = "tpl_general_silver";
  const config: PolicyTemplateConfig = {
    ...makeBaseConfig(),
    rpoValue: 12,
    rpoUnit: "hours",
    rtoValue: 8,
    rtoUnit: "hours",
    retentionLongValue: 1,
    retentionLongUnit: "years",
    immutabilityLockDays: 60,
    scheduleHumanLabel: "Twice daily at 02:00 and 14:00",
    scheduleExpression: "0 0 2,14 * * *",
    complianceFrameworks: ["ISO-27001"],
  };
  const versions: PolicyTemplateVersion[] = Array.from({ length: 3 }).map(
    (_, i) => ({
      id: `${id}_v${i + 1}`,
      version: i + 1,
      authoredBy: OPERATORS.marcus,
      authoredAt: daysAgo(220 - i * 65),
      changeSummary:
        i === 2
          ? "Added ISO-27001 attestation, unified replication targets to dual-region async"
          : "Baseline tuning for mid-market workloads",
      config,
    }),
  );
  const template: PolicyTemplate = {
    id,
    name: "General Enterprise Silver",
    description:
      "Balanced backup policy suitable for mid-market enterprises with moderate compliance requirements.",
    industry: "General",
    status: "Active",
    tags: ["general", "silver"],
    workloadCoverage: ["VM", "SQL", "M365", "NAS", "FileShare"],
    complianceFrameworks: ["ISO-27001"],
    currentVersion: 3,
    versions,
    createdAt: versions[0].authoredAt,
    updatedAt: versions[2].authoredAt,
    createdBy: OPERATORS.marcus,
  };
  const audit: PolicyTemplateAuditEntry[] = versions.map((v) => ({
    id: `${id}_a${v.version}`,
    templateId: id,
    occurredAt: v.authoredAt,
    actor: v.authoredBy,
    actorRole: "MSP Admin",
    action: v.version === 1 ? "template.create" : "template.version.publish",
    targetVersion: v.version,
    description: v.changeSummary,
    outcome: "success",
  }));
  return { template, audit };
}

function buildEducationTemplate(): {
  template: PolicyTemplate;
  audit: PolicyTemplateAuditEntry[];
} {
  const id = "tpl_education_ferpa";
  const config: PolicyTemplateConfig = {
    ...makeBaseConfig(),
    rpoValue: 6,
    rpoUnit: "hours",
    rtoValue: 12,
    rtoUnit: "hours",
    retentionLongValue: 5,
    retentionLongUnit: "years",
    immutabilityLockDays: 60,
    complianceFrameworks: ["NIST", "ISO-27001", "FERPA"],
  };
  const versions: PolicyTemplateVersion[] = [
    {
      id: `${id}_v1`,
      version: 1,
      authoredBy: OPERATORS.daniel,
      authoredAt: daysAgo(67),
      changeSummary:
        "Initial FERPA-aligned template authored from K-12 baseline guidance",
      config,
    },
  ];
  const template: PolicyTemplate = {
    id,
    name: "Education FERPA Compliance",
    description:
      "FERPA-aligned policy for educational institutions protecting student records with 5-year retention.",
    industry: "Education",
    status: "Active",
    tags: ["education", "ferpa"],
    workloadCoverage: ["M365", "NAS", "FileShare", "VM"],
    complianceFrameworks: ["NIST", "ISO-27001", "FERPA"],
    currentVersion: 1,
    versions,
    createdAt: versions[0].authoredAt,
    updatedAt: versions[0].authoredAt,
    createdBy: OPERATORS.daniel,
  };
  const audit: PolicyTemplateAuditEntry[] = [
    {
      id: `${id}_a1`,
      templateId: id,
      occurredAt: versions[0].authoredAt,
      actor: OPERATORS.daniel,
      actorRole: "Operations",
      action: "template.create",
      targetVersion: 1,
      description: versions[0].changeSummary,
      outcome: "success",
    },
  ];
  return { template, audit };
}

function buildManufacturingTemplate(): {
  template: PolicyTemplate;
  audit: PolicyTemplateAuditEntry[];
} {
  const id = "tpl_manufacturing_otics_bronze";
  const config: PolicyTemplateConfig = {
    ...makeBaseConfig(),
    rpoValue: 24,
    rpoUnit: "hours",
    rtoValue: 24,
    rtoUnit: "hours",
    retentionShortValue: 14,
    retentionShortUnit: "days",
    retentionLongValue: 90,
    retentionLongUnit: "days",
    immutabilityLockDays: 30,
    immutabilityLockType: "Governance",
    airGap: false,
    complianceFrameworks: ["NIST"],
    scheduleHumanLabel: "Daily at 03:30",
    scheduleExpression: "0 30 3 * * *",
  };
  const versions: PolicyTemplateVersion[] = Array.from({ length: 2 }).map(
    (_, i) => ({
      id: `${id}_v${i + 1}`,
      version: i + 1,
      authoredBy: OPERATORS.daniel,
      authoredAt: daysAgo(67 - i * 7),
      changeSummary:
        i === 1
          ? "Adjusted RPO tolerance for OT/ICS shop-floor workloads"
          : "Initial OT/ICS template",
      config,
    }),
  );
  const template: PolicyTemplate = {
    id,
    name: "Manufacturing OT/ICS Bronze",
    description:
      "Lightweight policy for operational technology environments with extended RPO tolerances.",
    industry: "Manufacturing",
    status: "Active",
    tags: ["manufacturing", "ot", "ics", "bronze"],
    workloadCoverage: ["VM", "SQL", "FileShare"],
    complianceFrameworks: ["NIST"],
    currentVersion: 2,
    versions,
    createdAt: versions[0].authoredAt,
    updatedAt: versions[1].authoredAt,
    createdBy: OPERATORS.daniel,
  };
  const audit: PolicyTemplateAuditEntry[] = versions.map((v) => ({
    id: `${id}_a${v.version}`,
    templateId: id,
    occurredAt: v.authoredAt,
    actor: v.authoredBy,
    actorRole: "Operations",
    action: v.version === 1 ? "template.create" : "template.version.publish",
    targetVersion: v.version,
    description: v.changeSummary,
    outcome: "success",
  }));
  return { template, audit };
}

function buildGovernmentTemplate(): {
  template: PolicyTemplate;
  audit: PolicyTemplateAuditEntry[];
} {
  const id = "tpl_government_fedramp_high";
  const config: PolicyTemplateConfig = {
    ...makeBaseConfig(),
    rpoValue: 30,
    rpoUnit: "minutes",
    rtoValue: 2,
    rtoUnit: "hours",
    retentionLongValue: 7,
    retentionLongUnit: "years",
    keyManagement: "BYOK",
    keyRotationDays: 30,
    immutabilityLockDays: 365,
    airGap: true,
    complianceFrameworks: ["NIST", "ISO-27001", "HIPAA", "FedRAMP"],
    primaryRepository: "rsc-repo-govcloud-01",
    archiveTier: "rsc-glacier-fips",
    notificationChannels: ["email", "pagerduty"],
  };
  const versions: PolicyTemplateVersion[] = Array.from({ length: 5 }).map(
    (_, i) => ({
      id: `${id}_v${i + 1}`,
      version: i + 1,
      authoredBy: i < 2 ? OPERATORS.priya : OPERATORS.sofia,
      authoredAt: daysAgo(180 - i * 35),
      changeSummary:
        i === 4
          ? "Mandated BYOK keys via FIPS 140-2 Level 3 HSM, air-gap proxy enforced"
          : "Continuous controls baseline tuning for FedRAMP High",
      config,
    }),
  );
  const template: PolicyTemplate = {
    id,
    name: "Government FedRAMP High",
    description:
      "FedRAMP High baseline policy for government agencies with mandatory air-gapped storage and FIPS 140-2 Level 3.",
    industry: "Government",
    status: "Active",
    tags: ["government", "fedramp", "regulated"],
    workloadCoverage: ["VM", "SQL", "Oracle", "Kubernetes", "FileShare"],
    complianceFrameworks: ["NIST", "ISO-27001", "HIPAA", "FedRAMP"],
    currentVersion: 5,
    versions,
    createdAt: versions[0].authoredAt,
    updatedAt: versions[4].authoredAt,
    createdBy: OPERATORS.priya,
  };
  const audit: PolicyTemplateAuditEntry[] = versions.map((v) => ({
    id: `${id}_a${v.version}`,
    templateId: id,
    occurredAt: v.authoredAt,
    actor: v.authoredBy,
    actorRole: "Security Lead",
    action: v.version === 1 ? "template.create" : "template.version.publish",
    targetVersion: v.version,
    description: v.changeSummary,
    outcome: "success",
  }));
  return { template, audit };
}

export function buildPolicyTemplates(tenants: Tenant[]): {
  templates: PolicyTemplate[];
  assignments: TenantTemplateAssignment[];
  overrides: PolicyTemplateOverride[];
  rollouts: PolicyTemplateRollout[];
  audit: PolicyTemplateAuditEntry[];
} {
  const builds = [
    buildHealthcareTemplate(),
    buildFinancialTemplate(),
    buildLegalTemplate(),
    buildPciTemplate(),
    buildGeneralTemplate(),
    buildEducationTemplate(),
    buildManufacturingTemplate(),
    buildGovernmentTemplate(),
  ];

  const templates = builds.map((b) => b.template);
  const audit = builds.flatMap((b) => b.audit);

  const assignments: TenantTemplateAssignment[] = [];
  const overrides: PolicyTemplateOverride[] = [];

  function assignByName(
    templateId: string,
    version: number,
    names: string[],
    appliedBy: string,
    daysSince: number,
  ): void {
    for (const name of names) {
      const id = lookupTenantId(tenants, name);
      if (!id) continue;
      assignments.push({
        tenantId: id,
        templateId,
        appliedVersion: version,
        appliedAt: daysAgo(daysSince),
        appliedBy,
      });
    }
  }

  // Healthcare HIPAA Gold v4 — 4 tenants
  assignByName(
    "tpl_healthcare_hipaa_gold",
    4,
    [
      "Mercy General Hospital",
      "Pacific Coast Medical Center",
      "Lakewood Community Health",
      "Sunrise Senior Care",
    ],
    OPERATORS.alex,
    14,
  );

  // Legal Document Retention v2 — 3 tenants
  assignByName(
    "tpl_legal_document_retention",
    2,
    ["Crawford & Associates LLP", "Sterling Aerospace", "Stonehaven Legal Partners"],
    OPERATORS.alex,
    24,
  );

  // General Enterprise Silver v3 — 5 tenants
  assignByName(
    "tpl_general_silver",
    3,
    [
      "Hawthorne Manufacturing",
      "Summit Financial Group",
      "Pinnacle Insurance Group",
      "Quantum Data Sciences",
      "CrossPoint Engineering",
    ],
    OPERATORS.marcus,
    32,
  );

  // Education FERPA Compliance v1 — 8 tenants
  assignByName(
    "tpl_education_ferpa",
    1,
    [
      "Redwood School District",
      "Bridgewater Analytics",
      "Northbridge Capital",
      "Highland Community College",
      "Alameda County Schools",
      "Evergreen Public Library",
      "Tidewater Education Trust",
      "Aurora Biotech",
    ],
    OPERATORS.daniel,
    62,
  );

  // Manufacturing OT/ICS Bronze v2 — 3 tenants
  assignByName(
    "tpl_manufacturing_otics_bronze",
    2,
    ["Atlas Logistics Corp", "TerraFirma Construction", "Ironwood Industrial"],
    OPERATORS.daniel,
    58,
  );

  // Government FedRAMP High v5 — 4 tenants
  assignByName(
    "tpl_government_fedramp_high",
    5,
    [
      "Vanguard Defense Systems",
      "Bay Area Transit Authority",
      "Ironclad Security Solutions",
      "Monarch Butterfly Preserve",
    ],
    OPERATORS.priya,
    21,
  );

  // ── Overrides — 9 active across 6 tenants ───────────────────────────────
  function makeOverride(
    templateId: string,
    tenantName: string,
    field: PolicyTemplateOverride["field"],
    fieldLabel: string,
    templateValue: string,
    overrideValue: string,
    appliedBy: string,
    daysSince: number,
    reason: string,
  ): void {
    const id = lookupTenantId(tenants, tenantName);
    if (!id) return;
    overrides.push({
      id: `ovr_${templateId}_${id}_${field}`,
      templateId,
      tenantId: id,
      field,
      fieldLabel,
      templateValue,
      overrideValue,
      appliedBy,
      appliedAt: daysAgo(daysSince),
      reason,
    });
  }

  makeOverride(
    "tpl_legal_document_retention",
    "Sterling Aerospace",
    "retentionLongValue",
    "Long-term Retention",
    "5 years",
    "10 years",
    OPERATORS.alex,
    23,
    "Sterling Aerospace audit requirement per signed contract addendum 2026-03-15",
  );
  makeOverride(
    "tpl_legal_document_retention",
    "Sterling Aerospace",
    "scheduleHumanLabel",
    "Backup Frequency",
    "Daily at 02:00",
    "Hourly",
    OPERATORS.priya,
    18,
    "Compliance ramp-up ahead of regulator review; revert in 60 days",
  );
  makeOverride(
    "tpl_education_ferpa",
    "Bridgewater Analytics",
    "encryptionAlgorithm",
    "Encryption Algorithm",
    "AES-256-GCM",
    "AES-256-CBC",
    OPERATORS.marcus,
    89,
    "Legacy DR system compatibility with on-prem KMS",
  );
  makeOverride(
    "tpl_education_ferpa",
    "Bridgewater Analytics",
    "immutabilityLockDays",
    "Immutability Lock",
    "60 days",
    "30 days",
    OPERATORS.marcus,
    89,
    "Storage cost optimization for non-PII research datasets",
  );
  makeOverride(
    "tpl_education_ferpa",
    "Northbridge Capital",
    "retentionLongValue",
    "Long-term Retention",
    "5 years",
    "7 years",
    OPERATORS.alex,
    47,
    "SOX extension — financial-services subsidiary classified under Northbridge tenant",
  );
  makeOverride(
    "tpl_general_silver",
    "Pinnacle Insurance Group",
    "scheduleHumanLabel",
    "Backup Frequency",
    "Twice daily at 02:00 and 14:00",
    "Every 4 hours",
    OPERATORS.priya,
    31,
    "Tighter SLA per renewed MSA effective 2026-03-25",
  );
  makeOverride(
    "tpl_healthcare_hipaa_gold",
    "Mercy General Hospital",
    "replicationRegions",
    "Replication Targets",
    "us-east-1, us-west-2",
    "us-east-1 only",
    OPERATORS.alex,
    12,
    "Capacity constraint in us-west-2 region; temporary, expires 2026-05-30",
  );
  makeOverride(
    "tpl_legal_document_retention",
    "Crawford & Associates LLP",
    "notifyOnDrift",
    "Drift Notification",
    "Tenant Admin",
    "Tenant Admin + MSP Operator",
    OPERATORS.priya,
    156,
    "Joint compliance review; both sides need drift visibility for the engagement",
  );
  makeOverride(
    "tpl_government_fedramp_high",
    "Vanguard Defense Systems",
    "anomalySensitivity",
    "Anomaly Sensitivity",
    "Medium",
    "High",
    OPERATORS.priya,
    8,
    "Heightened threat posture per CISA advisory 2026-04-18",
  );

  // ── Active rollout — Financial SOX v6 to v7 canary ──────────────────────
  // Create a draft v7 by appending a future version to the financial template
  const fin = templates.find((t) => t.id === "tpl_financial_sox_standard");
  let activeRollout: PolicyTemplateRollout | null = null;
  if (fin) {
    const draftV7Config: PolicyTemplateConfig = {
      ...fin.versions[5].config,
      rpoValue: 5,
      rpoUnit: "minutes",
      complianceFrameworks: ["SOX", "PCI-DSS", "NIST"],
      keyRotationDays: 60,
    };
    fin.versions.push({
      id: `${fin.id}_v7`,
      version: 7,
      authoredBy: OPERATORS.alex,
      authoredAt: hoursAgo(6),
      changeSummary:
        "Tightened RPO to 5m for ledger workloads, added NIST 800-53 attestation, accelerated key rotation to 60d",
      config: draftV7Config,
    });
    fin.updatedAt = hoursAgo(6);

    // Assignments from spec — financial template is rolling out to 3 tenants
    const finTenantNames = [
      "Cornerstone Federal Bank",
      "Mariner's Trust Bank",
      "Beacon Hill Capital Partners",
    ];
    for (const name of finTenantNames) {
      const id = lookupTenantId(tenants, name);
      if (!id) continue;
      assignments.push({
        tenantId: id,
        templateId: fin.id,
        appliedVersion: 6,
        appliedAt: daysAgo(38),
        appliedBy: OPERATORS.alex,
      });
    }

    const tenantIds = finTenantNames
      .map((n) => lookupTenantId(tenants, n))
      .filter((x) => x.length > 0);

    activeRollout = {
      id: `roll_${fin.id}_v7`,
      templateId: fin.id,
      fromVersion: 6,
      toVersion: 7,
      strategy: "canary-staged-fleet",
      status: "running",
      startedBy: OPERATORS.alex,
      startedAt: hoursAgo(2),
      note: "v7 published to address Q2 SOX advisory; canary on smallest tenant first.",
      currentPhase: "canary",
      validation: [
        { id: "v_health", label: "All affected tenants currently in healthy state", status: "pass" },
        { id: "v_alarm", label: "No active alarms on affected tenants", status: "pass" },
        { id: "v_capacity", label: "Sufficient cluster capacity for re-encryption", status: "pass" },
        { id: "v_conflict", label: "No conflicting policy changes in last 24h", status: "pass" },
        { id: "v_compliance", label: "Compliance frameworks remain attested", status: "pass" },
      ],
      totalAffectedTenants: tenantIds.length,
      phases: [
        {
          phase: "canary",
          tenantIds: tenantIds.slice(0, 1),
          observationHours: 24,
          status: "observing",
          startedAt: hoursAgo(2),
          migratedTenantIds: tenantIds.slice(0, 1),
          failedTenantIds: [],
          healthChecks: [
            { id: "h_success", label: "Backup success rate >=95%", status: "pass", detail: "98% (1h window)" },
            { id: "h_alarm", label: "Alarms triggered", status: "pass", detail: "0 new alarms" },
            { id: "h_compliance", label: "Compliance posture", status: "pass", detail: "Unchanged" },
            { id: "h_observe", label: "Observation period", status: "pending", detail: "21h 47m remaining" },
          ],
        },
        {
          phase: "staged",
          tenantIds: tenantIds.slice(1, 2),
          observationHours: 48,
          status: "pending",
          migratedTenantIds: [],
          failedTenantIds: [],
          healthChecks: [],
        },
        {
          phase: "fleet",
          tenantIds: tenantIds.slice(2),
          observationHours: 0,
          status: "pending",
          migratedTenantIds: [],
          failedTenantIds: [],
          healthChecks: [],
        },
      ],
    };

    audit.push({
      id: `${fin.id}_a7`,
      templateId: fin.id,
      occurredAt: hoursAgo(6),
      actor: OPERATORS.alex,
      actorRole: "MSP Admin",
      action: "template.version.publish",
      targetVersion: 7,
      description: "v7 published: tightened RPO to 5m, added NIST 800-53 attestation",
      outcome: "success",
    });
    audit.push({
      id: `${fin.id}_a8`,
      templateId: fin.id,
      occurredAt: hoursAgo(2),
      actor: OPERATORS.alex,
      actorRole: "MSP Admin",
      action: "template.rollout.start",
      targetVersion: 7,
      description: "v6 to v7 canary phase started, smallest tenant selected",
      outcome: "success",
    });
  }

  const rollouts: PolicyTemplateRollout[] = activeRollout ? [activeRollout] : [];

  return { templates, assignments, overrides, rollouts, audit };
}
