import { faker } from "@faker-js/faker";
import type {
  AccessRequest,
  AffectedResource,
  DirectorySavedView,
  TenantTag,
  Alarm,
  AlarmCategory,
  Alert,
  AlertSeverity,
  AuditEvent,
  BackupJob,
  BillingDispute,
  BillingLineItem,
  BillingPeriod,
  Cluster,
  CompletedOnboarding,
  ComplianceFrameworkPosture,
  DetailedAuditEvent,
  FrameworkCitation,
  Industry,
  Invoice,
  InvoiceLineItem,
  IsolationCell,
  IsolationCellStatus,
  IsolationCellViolation,
  IsolationCheck,
  IsolationCheckId,
  IsolationControlDef,
  IsolationControlId,
  IsolationStatus,
  IsolationViolation,
  JobLogLevel,
  JobLogLine,
  JobSession,
  JobType,
  KeyRotationStatus,
  MonthlyConsumption,
  OnboardingDraft,
  Operator,
  OperatorAccessRow,
  Policy,
  PolicyAssignment,
  PolicyAssignmentEvent,
  PolicyKind,
  PolicyOverride,
  PolicyVersion,
  QuotaEnforcementRow,
  QuotaUsage,
  RbacRoleSummary,
  Region,
  RemediationStepDef,
  ResellerEntity,
  RestorePoint,
  SecurityScheduleEntry,
  Tenant,
  TenantStatus,
  ThreatDetection,
  ThreatDetectionType,
  ThreatEvent,
  ThreatEventStatus,
  Tier,
  ValidationWindowEntry,
  Workload,
  WorkloadStatus,
  WorkloadType,
} from "@/types";

faker.seed(42);

const TENANT_NAMES = [
  "Mercy General Hospital",
  "Crawford & Associates LLP",
  "Northbridge Capital",
  "Pacific Coast Medical Center",
  "Hawthorne Manufacturing",
  "Summit Financial Group",
  "Redwood School District",
  "Cascade Energy Partners",
  "Atlas Logistics Corp",
  "Pinnacle Insurance Group",
  "Lakewood Community Health",
  "Sterling Aerospace",
  "Ironclad Security Solutions",
  "Meridian Pharmaceuticals",
  "Bay Area Transit Authority",
  "Oakmont Wealth Advisors",
  "TerraFirma Construction",
  "Vanguard Defense Systems",
  "Sapphire Hotels International",
  "Monarch Butterfly Preserve",
  "Quantum Data Sciences",
  "Sunrise Senior Care",
  "CrossPoint Engineering",
  "Bridgewater Analytics",
  "Harborview Medical Group",
  "Clearwater Environmental",
  "Cornerstone Federal Bank",
  "Evergreen Public Library",
  "Riverside Children's Hospital",
  "Beacon Hill Capital Partners",
  "Greystone Property Holdings",
  "Polaris Telecommunications",
  "Alameda County Schools",
  "Kingsbury Distribution",
  "Westfield Retail Group",
  "Aurora Biotech",
  "Highland Community College",
  "Trident Maritime Logistics",
  "Cypress Wealth Management",
  "Regent Insurance Holdings",
  "Lighthouse Pediatrics",
  "Nova Robotics",
  "Mariner's Trust Bank",
  "Cobalt Semiconductor",
  "Stonehaven Legal Partners",
  "Glacier Resort Group",
  "Phoenix Air Cargo",
  "Maplewood Senior Living",
  "Driftwood Hospitality",
  "Cedar Valley Credit Union",
  "Ironwood Industrial",
  "Crescent Telehealth",
  "Westport Marine Insurance",
  "Vermillion Mining",
  "Aspen Family Practice",
  "Oakridge Defense Labs",
  "Brightline Logistics",
  "Granite State Utilities",
  "Sablefish Seafoods",
  "Halcyon Asset Management",
  "Tidewater Education Trust",
  "Rosewood Community Clinics",
];

const REGIONS: Region[] = ["us-east-1", "us-west-2", "eu-west-1", "ap-south-1"];

const TIER_DISTRIBUTION: Tier[] = [
  ...Array<Tier>(8).fill("Platinum"),
  ...Array<Tier>(22).fill("Gold"),
  ...Array<Tier>(24).fill("Silver"),
  ...Array<Tier>(8).fill("Bronze"),
];

const STATUS_DISTRIBUTION: TenantStatus[] = [
  ...Array<TenantStatus>(54).fill("Active"),
  ...Array<TenantStatus>(5).fill("Onboarding"),
  ...Array<TenantStatus>(2).fill("Suspended"),
  ...Array<TenantStatus>(1).fill("Churned"),
];

function inferIndustry(name: string): Industry {
  const n = name.toLowerCase();
  if (/(hospital|medical|clinic|health|pediatric|family practice|telehealth|biotech|pharmaceutical|senior care|senior living)/.test(n)) return "Healthcare";
  if (/(llp|legal|associates)/.test(n)) return "Legal";
  if (/(capital|financial|bank|wealth|credit union|asset management|trust)/.test(n)) return "Financial";
  if (/(school|college|library|education)/.test(n)) return "Education";
  if (/(manufacturing|industrial|construction|mining|semiconductor|robotics|engineering)/.test(n)) return "Manufacturing";
  if (/(data|analytics|biotech|robotics|semiconductor|telehealth)/.test(n)) return "Technology";
  if (/(retail|distribution)/.test(n)) return "Retail";
  if (/(hotel|hospitality|resort)/.test(n)) return "Hospitality";
  if (/(telecommunications|telehealth)/.test(n)) return "Telecommunications";
  if (/(insurance)/.test(n)) return "Insurance";
  if (/(logistics|cargo|maritime|transit)/.test(n)) return "Logistics";
  if (/(aerospace|defense|air)/.test(n)) return "Aerospace";
  return "Technology";
}

function rangeShuffle<T>(arr: T[]): T[] {
  return faker.helpers.shuffle([...arr]);
}

const operators: Operator[] = [
  { id: "op_1", name: "Alex Morrison", email: "alex.morrison@rubrikmsp.io", role: "MSP Admin", initials: "AM" },
  { id: "op_2", name: "Priya Patel", email: "priya.patel@rubrikmsp.io", role: "Security Lead", initials: "PP" },
  { id: "op_3", name: "Marcus Chen", email: "marcus.chen@rubrikmsp.io", role: "Operations", initials: "MC" },
  { id: "op_4", name: "Sofia Reyes", email: "sofia.reyes@rubrikmsp.io", role: "Auditor", initials: "SR" },
  { id: "op_5", name: "Daniel Okafor", email: "daniel.okafor@rubrikmsp.io", role: "Operations", initials: "DO" },
];

const clusters: Cluster[] = [
  { id: "cls_us_east_1", name: "us-east-rsc-cluster-01", region: "us-east-1", capacityTB: 1200, usedTB: 0, tenantCount: 0, status: "healthy" },
  { id: "cls_us_east_2", name: "us-east-rsc-cluster-02", region: "us-east-1", capacityTB: 1200, usedTB: 0, tenantCount: 0, status: "healthy" },
  { id: "cls_us_west_1", name: "us-west-rsc-cluster-01", region: "us-west-2", capacityTB: 1200, usedTB: 0, tenantCount: 0, status: "healthy" },
  { id: "cls_eu_west_1", name: "eu-west-rsc-cluster-01", region: "eu-west-1", capacityTB: 800, usedTB: 0, tenantCount: 0, status: "healthy" },
  { id: "cls_ap_south_1", name: "ap-rsc-cluster-01", region: "ap-south-1", capacityTB: 600, usedTB: 0, tenantCount: 0, status: "degraded" },
];

export const resellers: ResellerEntity[] = [
  { id: "rsl_apex", name: "Apex IT Partners" },
  { id: "rsl_dataguard", name: "DataGuard Solutions Group" },
  { id: "rsl_resilient", name: "Resilient Cloud Services" },
  { id: "rsl_pinnacle", name: "Pinnacle Tech Advisors" },
  { id: "rsl_vertex", name: "Vertex MSP Network" },
];

export const ONBOARDING_REFERENCE = Date.parse("2026-04-26T18:00:00Z");

function generateTenants(): Tenant[] {
  const tiers = rangeShuffle(TIER_DISTRIBUTION);
  const statuses = rangeShuffle(STATUS_DISTRIBUTION);
  const now = Date.now();

  const tenants: Tenant[] = TENANT_NAMES.slice(0, 62).map((name, i) => {
    const industry = inferIndustry(name);
    const tier = tiers[i] ?? "Silver";
    const status = statuses[i] ?? "Active";
    const region = faker.helpers.arrayElement(REGIONS);
    const cluster = faker.helpers.arrayElement(clusters.filter((c) => c.region === region)) ?? clusters[0];

    const tierBaseline: Record<Tier, { committed: number; workloads: number }> = {
      Platinum: { committed: faker.number.int({ min: 80, max: 240 }), workloads: faker.number.int({ min: 90, max: 240 }) },
      Gold: { committed: faker.number.int({ min: 30, max: 90 }), workloads: faker.number.int({ min: 40, max: 100 }) },
      Silver: { committed: faker.number.int({ min: 10, max: 35 }), workloads: faker.number.int({ min: 15, max: 50 }) },
      Bronze: { committed: faker.number.int({ min: 3, max: 12 }), workloads: faker.number.int({ min: 5, max: 20 }) },
    };

    const committed = tierBaseline[tier].committed;
    const utilization = faker.number.float({ min: 0.45, max: 1.18, fractionDigits: 2 });
    const used = Number((committed * utilization).toFixed(1));

    const securityScore =
      tier === "Platinum"
        ? faker.number.int({ min: 92, max: 99 })
        : tier === "Gold"
          ? faker.number.int({ min: 84, max: 96 })
          : tier === "Silver"
            ? faker.number.int({ min: 72, max: 92 })
            : faker.number.int({ min: 60, max: 88 });

    const sla = faker.number.float({ min: 96.4, max: 99.99, fractionDigits: 2 });

    const backupSuccess7d = Array.from({ length: 7 }).map(() =>
      faker.number.float({ min: 92, max: 100, fractionDigits: 1 }),
    );

    const lastBackupOffsetMin = faker.number.int({ min: 5, max: 60 * 24 });
    const lastBackupAt = new Date(now - lastBackupOffsetMin * 60_000).toISOString();
    const createdAt = faker.date.past({ years: 3 }).toISOString();
    const contactName = faker.person.fullName();

    return {
      id: `t_${i.toString().padStart(3, "0")}`,
      name,
      legalEntity: `${name}, Inc.`,
      industry,
      region,
      tier,
      status,
      assignedClusterId: cluster.id,
      namespaceId: `ns-${faker.string.alphanumeric({ length: 10, casing: "lower" })}`,
      workloadCount: tierBaseline[tier].workloads,
      capacityUsedTB: used,
      capacityCommittedTB: committed,
      lastBackupAt,
      securityScore,
      slaCompliance: sla,
      backupSuccess7d,
      createdAt,
      primaryContact: contactName,
      contactEmail: faker.internet
        .email({ firstName: contactName.split(" ")[0], lastName: contactName.split(" ").slice(-1)[0] })
        .toLowerCase(),
      tags: [],
      policyTemplateId: undefined,
    };
  });

  // recompute cluster totals
  for (const c of clusters) {
    const tenantsOnCluster = tenants.filter((t) => t.assignedClusterId === c.id);
    c.tenantCount = tenantsOnCluster.length;
    c.usedTB = Number(tenantsOnCluster.reduce((s, t) => s + t.capacityUsedTB, 0).toFixed(1));
  }

  return tenants;
}

const ALERT_TEMPLATES: Array<{
  category: Alert["category"];
  severity: AlertSeverity;
  title: string;
  description: string;
}> = [
  { category: "Backup Failure", severity: "critical", title: "Snapshot failed for SQL cluster sql-prod-01", description: "Three consecutive snapshots failed with code RBK-2041. Storage target unreachable." },
  { category: "Backup Failure", severity: "warning", title: "Backup window slipped 18 minutes", description: "Job for VMware/finance-app exceeded RPO window. Next run rescheduled." },
  { category: "Policy Drift", severity: "warning", title: "Policy 'EU Data Residency' diverges from baseline", description: "Replication target was changed manually. Drift detected vs. v6 baseline." },
  { category: "Threat", severity: "critical", title: "Anomalous file entropy on /finance-share", description: "8.3% of files in last hour show ransomware-pattern entropy. Recovery isolation engaged." },
  { category: "Threat", severity: "warning", title: "Unusual download volume from svc-account/etl-runner", description: "Download volume 42x baseline over rolling 1h window." },
  { category: "Capacity", severity: "warning", title: "Capacity at 91% of committed", description: "Tenant approaching commit. Overage charges will apply on next reconciliation." },
  { category: "Capacity", severity: "info", title: "Cold-tier archival recommendation", description: "1.4 TB of snapshots older than 270 days are eligible for archival savings." },
  { category: "Configuration", severity: "info", title: "Secondary key rotation due in 7 days", description: "Backup encryption key kms-2026-Q1 reaches scheduled rotation window." },
  { category: "Compliance", severity: "warning", title: "HIPAA attestation report expires in 14 days", description: "Annual attestation export must be re-generated for compliance audit." },
  { category: "Compliance", severity: "critical", title: "Immutability policy disabled by operator", description: "Workload backup-policy 'sox-prod' had immutability flag toggled off. Investigate." },
];

function generateAlerts(tenants: Tenant[]): Alert[] {
  const out: Alert[] = [];
  const now = Date.now();
  const counts: Record<AlertSeverity, number> = { critical: 18, warning: 35, info: 200 - 18 - 35 };

  let i = 0;
  for (const sev of Object.keys(counts) as AlertSeverity[]) {
    for (let n = 0; n < counts[sev]; n += 1) {
      const tenant = faker.helpers.arrayElement(tenants);
      const candidates = ALERT_TEMPLATES.filter((t) => t.severity === sev);
      const tpl = faker.helpers.arrayElement(candidates.length > 0 ? candidates : ALERT_TEMPLATES);
      const minutesAgo = faker.number.int({ min: 1, max: 60 * 26 });
      const status: Alert["status"] =
        sev === "critical"
          ? faker.helpers.weightedArrayElement([
              { value: "open", weight: 6 },
              { value: "acknowledged", weight: 3 },
              { value: "resolved", weight: 1 },
            ])
          : faker.helpers.weightedArrayElement([
              { value: "open", weight: 3 },
              { value: "acknowledged", weight: 4 },
              { value: "resolved", weight: 3 },
            ]);
      out.push({
        id: `al_${(i += 1).toString().padStart(4, "0")}`,
        tenantId: tenant.id,
        severity: sev,
        status,
        title: tpl.title,
        description: tpl.description,
        category: tpl.category,
        createdAt: new Date(now - minutesAgo * 60_000).toISOString(),
        acknowledgedBy: status !== "open" ? faker.helpers.arrayElement(operators).name : undefined,
        acknowledgedAt:
          status !== "open"
            ? new Date(now - faker.number.int({ min: 1, max: minutesAgo - 1 }) * 60_000).toISOString()
            : undefined,
      });
    }
  }
  return out.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

const POLICY_DEFS: Array<{ name: string; kind: PolicyKind; description: string }> = [
  { name: "Healthcare HIPAA Baseline", kind: "Backup", description: "PHI workloads, 1h RPO, 7-year retention, immutable, AES-256-GCM." },
  { name: "Financial SOX Tier-1", kind: "Backup", description: "OLTP and ledger systems, 15-min RPO, immutable, dual-region replication." },
  { name: "EU Data Residency", kind: "Replication", description: "Restricts replication targets to eu-west-1 only. GDPR aligned." },
  { name: "General Workload 24h", kind: "Backup", description: "Standard daily snapshots for non-regulated workloads, 30-day retention." },
  { name: "Long-Term Archive 7y", kind: "Archival", description: "Cold-tier archival policy for compliance retention beyond 1 year." },
  { name: "Air-Gapped Vault", kind: "Replication", description: "Replicates immutable copies to air-gapped vault cluster, weekly." },
  { name: "Bronze Retention", kind: "Retention", description: "30-day retention, no replication, suitable for non-critical workloads." },
  { name: "Quarterly Compliance Snapshot", kind: "Backup", description: "Quarterly point-in-time snapshot held for 7 years for audit replay." },
];

function generatePolicies(): Policy[] {
  const now = new Date();
  return POLICY_DEFS.map((def, i) => {
    const versionCount = faker.number.int({ min: 3, max: 9 });
    const versions: PolicyVersion[] = Array.from({ length: versionCount }).map((_, vi) => {
      const version = vi + 1;
      const authoredAt = faker.date.past({ years: 2, refDate: now }).toISOString();
      return {
        id: `pv_${i}_${version}`,
        policyId: `pol_${i}`,
        version,
        rpoHours:
          def.kind === "Backup"
            ? faker.helpers.arrayElement([0.25, 1, 4, 12, 24])
            : 24,
        retentionDays: faker.helpers.arrayElement([30, 90, 365, 365 * 3, 365 * 7]),
        immutable: def.kind === "Backup" || def.kind === "Replication",
        encryption: faker.helpers.arrayElement(["AES-256", "AES-256-GCM"] as const),
        replicationTargetClusterId:
          def.kind === "Replication" ? faker.helpers.arrayElement(clusters).id : null,
        airGapped: def.name.includes("Air-Gapped"),
        notes: vi === versionCount - 1 ? "Current production version." : faker.lorem.sentence(),
        authoredBy: faker.helpers.arrayElement(operators).name,
        authoredAt,
        appliedTenantCount: faker.number.int({ min: 0, max: 30 }),
      };
    });
    versions.sort((a, b) => a.version - b.version);
    const current = versions[versions.length - 1];
    return {
      id: `pol_${i}`,
      name: def.name,
      kind: def.kind,
      description: def.description,
      currentVersion: current.version,
      versions,
      appliedTenants: [],
      createdAt: versions[0].authoredAt,
      updatedAt: current.authoredAt,
    };
  });
}

const WORKLOAD_NAMES = [
  "vmware/finance-app",
  "vmware/hr-portal",
  "k8s/payments-service",
  "k8s/billing-api",
  "mssql/sql-prod-01",
  "mssql/sql-prod-02",
  "oracle/erp-primary",
  "oracle/dwh-staging",
  "m365/exchange-tenant",
  "m365/sharepoint-legal",
  "aws/rds-customer-db",
  "aws/s3-analytics",
  "azure/sql-finance",
  "azure/files-engineering",
  "nas/research-share",
  "nas/finance-share",
];

function generateBackupJobs(tenants: Tenant[], policies: Policy[]): BackupJob[] {
  const out: BackupJob[] = [];
  const now = Date.now();
  for (let i = 0; i < 500; i += 1) {
    const tenant = faker.helpers.arrayElement(tenants);
    const policy = faker.helpers.arrayElement(policies);
    const status = faker.helpers.weightedArrayElement<BackupJob["status"]>([
      { value: "succeeded", weight: 78 },
      { value: "running", weight: 8 },
      { value: "queued", weight: 5 },
      { value: "failed", weight: 6 },
      { value: "skipped", weight: 3 },
    ]);
    const minutesAgo = faker.number.int({ min: 1, max: 24 * 60 });
    const startedAt = new Date(now - minutesAgo * 60_000).toISOString();
    const durationSec =
      status === "queued" ? 0 : faker.number.int({ min: 22, max: 4200 });
    out.push({
      id: `job_${i.toString().padStart(4, "0")}`,
      tenantId: tenant.id,
      workload: faker.helpers.arrayElement(WORKLOAD_NAMES),
      policyId: policy.id,
      status,
      startedAt,
      durationSec,
      bytesProtected:
        status === "succeeded"
          ? faker.number.int({ min: 2_000_000_000, max: 1_800_000_000_000 })
          : 0,
      errorCode: status === "failed" ? faker.helpers.arrayElement(["RBK-2041", "RBK-3107", "RBK-1188"]) : undefined,
      errorMessage:
        status === "failed"
          ? faker.helpers.arrayElement([
              "Storage target unreachable",
              "Authentication token expired",
              "Source workload offline at snapshot time",
            ])
          : undefined,
    });
  }
  return out.sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt));
}

function generateAuditEvents(tenants: Tenant[]): AuditEvent[] {
  const actions = [
    "policy.update",
    "policy.create",
    "tenant.create",
    "tenant.suspend",
    "key.rotate",
    "isolation.remediate",
    "report.export",
    "user.invite",
    "alert.acknowledge",
    "snapshot.restore",
  ];
  const out: AuditEvent[] = [];
  const now = Date.now();
  for (let i = 0; i < 150; i += 1) {
    const operator = faker.helpers.arrayElement(operators);
    const tenant = faker.helpers.maybe(() => faker.helpers.arrayElement(tenants), { probability: 0.85 });
    const minutesAgo = faker.number.int({ min: 2, max: 60 * 24 * 30 });
    out.push({
      id: `aud_${i.toString().padStart(4, "0")}`,
      actor: operator.name,
      actorRole: operator.role,
      action: faker.helpers.arrayElement(actions),
      target: tenant ? tenant.name : "global",
      tenantId: tenant?.id,
      outcome: faker.helpers.weightedArrayElement([
        { value: "success", weight: 9 },
        { value: "failure", weight: 1 },
      ]),
      occurredAt: new Date(now - minutesAgo * 60_000).toISOString(),
      ipAddress: faker.internet.ipv4(),
    });
  }
  return out.sort((a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt));
}

function generateInvoices(tenants: Tenant[]): Invoice[] {
  const out: Invoice[] = [];
  const now = new Date();
  for (const tenant of tenants) {
    for (let m = 11; m >= 0; m -= 1) {
      const periodEnd = new Date(now.getFullYear(), now.getMonth() - m, 0);
      const periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1);

      const ratePerTB =
        tenant.tier === "Platinum"
          ? 165
          : tenant.tier === "Gold"
            ? 195
            : tenant.tier === "Silver"
              ? 230
              : 260;
      const committed = tenant.capacityCommittedTB;
      const usedThisMonth = Math.max(
        committed * faker.number.float({ min: 0.6, max: 1.2, fractionDigits: 2 }),
        2,
      );
      const overageTB = Math.max(0, usedThisMonth - committed);

      const lineItems: InvoiceLineItem[] = [
        {
          id: `li_commit_${tenant.id}_${m}`,
          label: `${tenant.tier} commit (${committed} TB)`,
          unit: "TB",
          quantity: committed,
          unitPrice: ratePerTB,
          amount: committed * ratePerTB,
        },
      ];
      if (overageTB > 0) {
        lineItems.push({
          id: `li_overage_${tenant.id}_${m}`,
          label: "Capacity overage",
          unit: "TB",
          quantity: Number(overageTB.toFixed(2)),
          unitPrice: Math.round(ratePerTB * 1.4),
          amount: Math.round(overageTB * ratePerTB * 1.4),
        });
      }
      lineItems.push({
        id: `li_support_${tenant.id}_${m}`,
        label: "24x7 support",
        unit: "month",
        quantity: 1,
        unitPrice: tenant.tier === "Platinum" ? 4500 : tenant.tier === "Gold" ? 2200 : tenant.tier === "Silver" ? 950 : 350,
        amount: tenant.tier === "Platinum" ? 4500 : tenant.tier === "Gold" ? 2200 : tenant.tier === "Silver" ? 950 : 350,
      });

      const committedAmount = committed * ratePerTB;
      const overageAmount = lineItems.find((l) => l.label === "Capacity overage")?.amount ?? 0;
      const total = lineItems.reduce((s, l) => s + l.amount, 0);

      out.push({
        id: `inv_${tenant.id}_${m}`,
        tenantId: tenant.id,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        status: m === 0 ? "draft" : m === 1 ? "issued" : faker.helpers.weightedArrayElement([
          { value: "paid", weight: 9 },
          { value: "overdue", weight: 1 },
        ]),
        committedAmount,
        overageAmount,
        total,
        lineItems,
        issuedAt: periodEnd.toISOString(),
      });
    }
  }
  return out;
}

const ISOLATION_CHECK_IDS: IsolationCheckId[] = [
  "namespace_isolation",
  "rbac_separation",
  "key_isolation",
  "network_segmentation",
  "policy_immutability",
  "audit_log_separation",
  "replication_isolation",
  "vault_separation",
];

const ISOLATION_EVIDENCE: Record<IsolationCheckId, string> = {
  namespace_isolation: "Tenant namespace isolated. No shared resource quotas detected.",
  rbac_separation: "Role bindings scoped to tenant namespace. No cross-tenant principals found.",
  key_isolation: "Per-tenant KMS key in use. Last rotation within 90-day SLA.",
  network_segmentation: "VPC peering and ACLs verified. No east-west traffic between tenants.",
  policy_immutability: "All production policies have immutability flag set. WORM compliant.",
  audit_log_separation: "Audit stream filtered by tenant ID. No co-mingling in storage.",
  replication_isolation: "Replication target tenant-scoped. Cross-tenant replication blocked at API.",
  vault_separation: "Air-gapped vault holds separate, signed copy per tenant.",
};

function generateIsolationChecks(tenants: Tenant[]): {
  checks: IsolationCheck[];
  violations: IsolationViolation[];
} {
  const checks: IsolationCheck[] = [];
  const violations: IsolationViolation[] = [];
  const now = Date.now();

  for (const tenant of tenants) {
    for (const checkId of ISOLATION_CHECK_IDS) {
      const status: IsolationStatus = faker.helpers.weightedArrayElement([
        { value: "pass", weight: 88 },
        { value: "warn", weight: 8 },
        { value: "fail", weight: 4 },
      ]);
      const lastVerifiedAt = new Date(now - faker.number.int({ min: 5, max: 60 * 24 * 3 }) * 60_000).toISOString();
      checks.push({
        tenantId: tenant.id,
        checkId,
        status,
        evidence: ISOLATION_EVIDENCE[checkId],
        lastVerifiedAt,
        remediationAvailable: status !== "pass",
      });
      if (status !== "pass") {
        violations.push({
          id: `iv_${tenant.id}_${checkId}`,
          tenantId: tenant.id,
          checkId,
          detail:
            status === "fail"
              ? "Cross-tenant binding detected on principal svc-rbk-replicator. Action required."
              : "Last verification within tolerance but flagged for review.",
          detectedAt: lastVerifiedAt,
          severity: status === "fail" ? "critical" : "warning",
        });
      }
    }
  }
  return { checks, violations };
}

const tenants = generateTenants();
const policies = generatePolicies();
const alerts = generateAlerts(tenants);
const backupJobs = generateBackupJobs(tenants, policies);
const auditEvents = generateAuditEvents(tenants);
const invoices = generateInvoices(tenants);
const { checks: isolationChecks, violations: isolationViolations } = generateIsolationChecks(tenants);

// Map applied tenants on policies
for (const policy of policies) {
  const applied = faker.helpers.arrayElements(tenants, { min: 4, max: 22 }).map((t) => t.id);
  policy.appliedTenants = applied;
}

// ── Directory tags ───────────────────────────────────────────────────────────

const TENANT_TAG_CATALOG: TenantTag[] = [
  { id: "tag_renewal_q2", label: "renewal-q2", tone: "warning" },
  { id: "tag_high_touch", label: "high-touch", tone: "info" },
  { id: "tag_sox_scope", label: "sox-scope", tone: "critical" },
  { id: "tag_p1_customer", label: "p1-customer", tone: "critical" },
  { id: "tag_expansion", label: "expansion-candidate", tone: "success" },
  { id: "tag_migration", label: "migration-2026", tone: "info" },
  { id: "tag_qbr_due", label: "qbr-due", tone: "warning" },
  { id: "tag_compliance", label: "compliance-audit", tone: "critical" },
  { id: "tag_strategic", label: "strategic", tone: "success" },
  { id: "tag_renewal_q3", label: "renewal-q3", tone: "warning" },
];

// Deterministically assign 1-3 tags per tenant based on name hash, with
// industry/tier biasing.
for (const t of tenants) {
  const tagPool: string[] = [];
  if (t.industry === "Financial") tagPool.push("sox-scope");
  if (t.tier === "Platinum") tagPool.push("p1-customer", "high-touch");
  if (t.tier === "Gold" && tenants.indexOf(t) % 4 === 0) tagPool.push("renewal-q2");
  if (t.tier === "Silver" && tenants.indexOf(t) % 5 === 0) tagPool.push("renewal-q3");
  if (t.industry === "Healthcare" || t.industry === "Aerospace") tagPool.push("compliance-audit");
  if (t.capacityUsedTB / Math.max(1, t.capacityCommittedTB) > 0.85) tagPool.push("expansion-candidate");
  if (tenants.indexOf(t) % 7 === 0) tagPool.push("strategic");
  if (tenants.indexOf(t) % 9 === 0) tagPool.push("qbr-due");
  if (tenants.indexOf(t) % 11 === 0) tagPool.push("migration-2026");
  if (t.securityScore < 75) tagPool.push("high-touch");
  // Dedupe + cap to 3
  t.tags = Array.from(new Set(tagPool)).slice(0, 3);
}

// Override cluster utilization to spec values for the onboarding wizard surface.
const CLUSTER_UTIL_SPEC: Record<string, { usedTB: number; tenantCount: number }> = {
  cls_us_east_1: { usedTB: 847, tenantCount: 14 },
  cls_us_east_2: { usedTB: 1102, tenantCount: 23 },
  cls_us_west_1: { usedTB: 543, tenantCount: 8 },
  cls_eu_west_1: { usedTB: 678, tenantCount: 12 },
  cls_ap_south_1: { usedTB: 234, tenantCount: 4 },
};
for (const c of clusters) {
  const spec = CLUSTER_UTIL_SPEC[c.id];
  if (spec) {
    c.usedTB = spec.usedTB;
    c.tenantCount = spec.tenantCount;
  }
}

// ── Onboarding queue seed data ───────────────────────────────────────────────

const DAYS = (n: number) => n * 24 * 60 * 60_000;
const HOURS = (n: number) => n * 60 * 60_000;
const MINUTES = (n: number) => n * 60_000;

const seedDrafts: OnboardingDraft[] = [
  {
    id: "draft_mercy",
    status: "in-progress",
    currentStep: 4,
    tenantName: "Mercy General Hospital",
    legalEntity: "Mercy General Hospital, Inc.",
    industry: "Healthcare",
    region: "us-east-1",
    primaryContact: "Karen Mitchell",
    contactEmail: "karen.mitchell@mercygeneral.org",
    resellerType: "direct",
    isAdditionalSite: false,
    tier: "Gold",
    clusterId: "cls_us_east_1",
    storageTier: "Capacity",
    allocationTB: 25,
    quotas: {
      storageTB: 25,
      storageSoftPct: 80,
      storageHardLimit: "allow-with-notification",
      workloads: 200,
      workloadsHardLimit: "block-new-backups",
      transferOutTB: 10,
      transferOutHardLimit: "allow-with-notification",
      restorePoints: 50_000,
      restorePointsHardLimit: "auto-purge-oldest",
      overrideApprovalRequired: false,
    },
    createdAt: new Date(ONBOARDING_REFERENCE - DAYS(1) - HOURS(2)).toISOString(),
    createdBy: "Alex Morrison",
    updatedAt: new Date(ONBOARDING_REFERENCE - HOURS(2)).toISOString(),
    updatedBy: "Alex Morrison",
    assignedTo: "Lisa Chen",
    reassignmentHistory: [
      {
        from: "Alex Morrison",
        to: "Lisa Chen",
        at: new Date(ONBOARDING_REFERENCE - HOURS(2)).toISOString(),
        note: "Sales-complete. Handing off to tech lead for policy + isolation.",
      },
    ],
  },
  {
    id: "draft_crawford",
    status: "in-progress",
    currentStep: 6,
    tenantName: "Crawford & Associates LLP",
    legalEntity: "Crawford & Associates, LLP",
    industry: "Legal",
    region: "us-east-1",
    primaryContact: "Jonathan Crawford",
    contactEmail: "jcrawford@crawfordlegal.com",
    resellerType: "reseller",
    resellerId: "rsl_apex",
    isAdditionalSite: false,
    tier: "Gold",
    clusterId: "cls_us_east_2",
    storageTier: "Capacity",
    allocationTB: 18,
    quotas: {
      storageTB: 18,
      storageSoftPct: 80,
      storageHardLimit: "allow-with-notification",
      workloads: 120,
      workloadsHardLimit: "block-new-backups",
      transferOutTB: 6,
      transferOutHardLimit: "allow-with-notification",
      restorePoints: 30_000,
      restorePointsHardLimit: "auto-purge-oldest",
      overrideApprovalRequired: false,
    },
    policyTemplateId: "pol_2",
    inheritanceMode: "Override Allowed",
    isolation: {
      namespace: "tenant-crawford-associates-llp-9c1f",
      iam: [
        { operatorId: "op_1", role: "Admin" },
        { operatorId: "op_3", role: "Operator" },
      ],
      tenantAdminEmail: "jcrawford@crawfordlegal.com",
      sendInviteOnDeploy: true,
      mfaMode: "required",
      keySource: "rubrik-managed",
      keyRotationDays: 90,
    },
    createdAt: new Date(ONBOARDING_REFERENCE - DAYS(3) - HOURS(2)).toISOString(),
    createdBy: "Alex Morrison",
    updatedAt: new Date(ONBOARDING_REFERENCE - HOURS(4)).toISOString(),
    updatedBy: "Lisa Chen",
    assignedTo: "Derek Williams",
    reassignmentHistory: [
      {
        from: "Alex Morrison",
        to: "Lisa Chen",
        at: new Date(ONBOARDING_REFERENCE - DAYS(2)).toISOString(),
      },
      {
        from: "Lisa Chen",
        to: "Derek Williams",
        at: new Date(ONBOARDING_REFERENCE - HOURS(4)).toISOString(),
        note: "Tech complete. Billing operator finalizing reseller commission.",
      },
    ],
  },
  {
    id: "draft_northbridge",
    status: "in-progress",
    currentStep: 2,
    tenantName: "Northbridge Capital",
    legalEntity: "Northbridge Capital LLC",
    industry: "Financial",
    region: "us-east-1",
    primaryContact: "Daniel Hayes",
    contactEmail: "dhayes@northbridgecap.com",
    resellerType: "direct",
    isAdditionalSite: false,
    tier: "Platinum",
    createdAt: new Date(ONBOARDING_REFERENCE - DAYS(5)).toISOString(),
    createdBy: "Priya Patel",
    updatedAt: new Date(ONBOARDING_REFERENCE - DAYS(1)).toISOString(),
    updatedBy: "Priya Patel",
    assignedTo: "Priya Patel",
    reassignmentHistory: [],
  },
];

const seedValidationWindow: ValidationWindowEntry[] = [
  {
    tenantId: "t_018",
    tenantName: "Sapphire Hotels International",
    windowEndsAt: new Date(ONBOARDING_REFERENCE + DAYS(3)).toISOString(),
    daysRemaining: 3,
    status: "Healthy",
    lastCheckAt: new Date(ONBOARDING_REFERENCE - HOURS(1)).toISOString(),
    issuesCount: 0,
  },
  {
    tenantId: "t_016",
    tenantName: "TerraFirma Construction",
    windowEndsAt: new Date(ONBOARDING_REFERENCE + DAYS(5)).toISOString(),
    daysRemaining: 5,
    status: "Watch",
    lastCheckAt: new Date(ONBOARDING_REFERENCE - MINUTES(30)).toISOString(),
    issuesCount: 1,
    issueDetail: "1 backup retry occurred Day 1, no further issues.",
  },
];

const COMPLETED_ONBOARDING_NAMES = [
  "Pacific Coast Medical Center",
  "Hawthorne Manufacturing",
  "Summit Financial Group",
  "Redwood School District",
  "Cascade Energy Partners",
  "Atlas Logistics Corp",
  "Pinnacle Insurance Group",
  "Lakewood Community Health",
  "Sterling Aerospace",
];

const seedCompleted: CompletedOnboarding[] = COMPLETED_ONBOARDING_NAMES.map((name, i) => {
  const tenant = tenants.find((t) => t.name === name);
  const baseDuration = i === 0 ? 8 * 60 : i === 8 ? 47 * 60 : 15 * 60 + faker.number.int({ min: 0, max: 10 * 60 });
  return {
    id: `cmp_${i}`,
    tenantId: tenant?.id ?? `t_unknown_${i}`,
    tenantName: name,
    completedAt: new Date(ONBOARDING_REFERENCE - DAYS(faker.number.int({ min: 1, max: 28 }))).toISOString(),
    totalDurationSec: baseDuration,
    deployedBy: faker.helpers.arrayElement(operators).name,
  };
});

// ── Per-tenant detail data ────────────────────────────────────────────────────

const DETAIL_REFERENCE = Date.parse("2026-04-26T18:00:00Z");

const ALARM_TEMPLATES: Array<{ category: AlarmCategory; title: string; description: string; severity: AlertSeverity }> = [
  { category: "Backup Failure", severity: "critical", title: "Backup job failed: prod-db-mercy-01", description: "Repository connection timeout. Job retried twice with no success." },
  { category: "Backup Failure", severity: "warning", title: "Backup window slipped 22 minutes", description: "VMware/finance-app exceeded the 4-hour RPO. Next run rescheduled." },
  { category: "Capacity", severity: "warning", title: "Storage quota at 91%", description: "Tenant approaching commit. Overage charges will apply on next reconciliation." },
  { category: "Threat", severity: "critical", title: "Anomalous file entropy on /finance-share", description: "12.4% of files in last hour show ransomware-pattern entropy. Recovery isolation engaged." },
  { category: "Threat", severity: "warning", title: "Unusual download volume from svc-account/etl-runner", description: "Download volume 42x baseline over rolling 1h window." },
  { category: "Policy Drift", severity: "warning", title: "Policy override active >30 days", description: "Retention override is older than configured review window." },
  { category: "Configuration", severity: "info", title: "Agent version 8.1.2 available", description: "Workload agents on this tenant are 2 minor versions behind current release." },
  { category: "Compliance", severity: "warning", title: "HIPAA attestation expires in 14 days", description: "Annual attestation export must be re-generated for compliance audit." },
  { category: "Connectivity", severity: "warning", title: "Repository link degraded: rsc-repo-east-04", description: "Latency to secondary repository is 2.4x baseline. Failover ready." },
];

const WORKLOAD_HOSTS: Record<WorkloadType, string> = {
  VM: "esx-prod",
  Database: "sql-prod",
  FileShare: "fs-prod",
  M365: "tenant",
  Kubernetes: "k8s-prod",
  NAS: "nas-prod",
};

const WORKLOAD_DISTRIBUTION: Array<{ type: WorkloadType; share: number }> = [
  { type: "VM", share: 0.52 },
  { type: "Database", share: 0.16 },
  { type: "FileShare", share: 0.12 },
  { type: "M365", share: 0.08 },
  { type: "Kubernetes", share: 0.06 },
  { type: "NAS", share: 0.06 },
];

function workloadName(type: WorkloadType, idx: number, tenantSlug: string): string {
  switch (type) {
    case "VM":
      return `vm-${tenantSlug}-app-${idx.toString().padStart(2, "0")}`;
    case "Database":
      return `${faker.helpers.arrayElement(["sql", "ora", "pg"])}-${tenantSlug}-${idx.toString().padStart(2, "0")}`;
    case "FileShare":
      return `${faker.helpers.arrayElement(["finance", "research", "legal", "ops"])}-share-${idx}`;
    case "M365":
      return `m365/${faker.helpers.arrayElement(["exchange", "sharepoint", "onedrive", "teams"])}-${idx}`;
    case "Kubernetes":
      return `k8s/${faker.helpers.arrayElement(["payments", "billing", "checkout", "auth", "etl"])}-svc-${idx}`;
    case "NAS":
      return `nas/${faker.helpers.arrayElement(["archive", "media", "lab"])}-vol-${idx}`;
  }
}

function tenantSlug(tenant: Tenant): string {
  return tenant.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 16);
}

function generateWorkloadsForTenant(tenant: Tenant): Workload[] {
  const slug = tenantSlug(tenant);
  const total = tenant.workloadCount;
  const out: Workload[] = [];
  let idx = 0;
  for (const dist of WORKLOAD_DISTRIBUTION) {
    const count = Math.max(1, Math.round(total * dist.share));
    for (let i = 0; i < count; i += 1) {
      idx += 1;
      const lastBackupOffsetMin = faker.number.int({ min: 5, max: 60 * 24 });
      const lastBackupAt = new Date(DETAIL_REFERENCE - lastBackupOffsetMin * 60_000).toISOString();
      const nextBackupOffsetMin = faker.number.int({ min: 30, max: 60 * 8 });
      const nextBackupAt = new Date(DETAIL_REFERENCE + nextBackupOffsetMin * 60_000).toISOString();
      const status: WorkloadStatus = faker.helpers.weightedArrayElement([
        { value: "Healthy", weight: 86 },
        { value: "Warning", weight: 9 },
        { value: "Failed", weight: 4 },
        { value: "Unprotected", weight: 1 },
      ]);
      const lastBackupStatus =
        status === "Failed"
          ? "failed"
          : status === "Warning"
            ? faker.helpers.arrayElement(["succeeded", "skipped"] as const)
            : "succeeded";
      out.push({
        id: `wl_${tenant.id}_${idx.toString().padStart(3, "0")}`,
        tenantId: tenant.id,
        name: workloadName(dist.type, idx, slug),
        type: dist.type,
        host: `${WORKLOAD_HOSTS[dist.type]}-${slug}-${faker.number.int({ min: 1, max: 9 }).toString().padStart(2, "0")}.${slug}.local`,
        sizeTB: Number(
          faker.number.float({ min: 0.05, max: 8, fractionDigits: 2 }).toFixed(2),
        ),
        policyId: "pol_0",
        policyVersion: 4,
        status,
        lastBackupAt,
        lastBackupStatus,
        nextBackupAt,
        agentVersion: faker.helpers.arrayElement(["8.1.0", "8.1.1", "8.1.2"]),
        lastCheckinAt: new Date(
          DETAIL_REFERENCE - faker.number.int({ min: 1, max: 30 }) * 60_000,
        ).toISOString(),
        connectivity: faker.helpers.weightedArrayElement([
          { value: "online", weight: 92 },
          { value: "degraded", weight: 6 },
          { value: "offline", weight: 2 },
        ]),
      });
    }
  }
  // Trim or pad to tenant.workloadCount exactly
  return out.slice(0, total);
}

function generateAlarmsForTenant(tenant: Tenant, workloads: Workload[]): Alarm[] {
  const count = faker.number.int({ min: 5, max: 10 });
  const out: Alarm[] = [];
  for (let i = 0; i < count; i += 1) {
    const tpl = faker.helpers.arrayElement(ALARM_TEMPLATES);
    const minutesAgo = faker.number.int({ min: 8, max: 60 * 36 });
    const triggeredAt = new Date(DETAIL_REFERENCE - minutesAgo * 60_000).toISOString();
    const state = faker.helpers.weightedArrayElement([
      { value: "triggered" as const, weight: 6 },
      { value: "acknowledged" as const, weight: 3 },
      { value: "resolved" as const, weight: 1 },
    ]);
    const ackBy = state !== "triggered" ? faker.helpers.arrayElement(operators).name : undefined;
    const ackAt = ackBy
      ? new Date(DETAIL_REFERENCE - faker.number.int({ min: 1, max: minutesAgo - 1 }) * 60_000).toISOString()
      : undefined;
    const resolvedBy =
      state === "resolved" ? faker.helpers.arrayElement(operators).name : undefined;
    const resolvedAt = resolvedBy
      ? new Date(
          DETAIL_REFERENCE -
            faker.number.int({ min: 1, max: Math.max(1, minutesAgo - 5) }) * 60_000,
        ).toISOString()
      : undefined;
    out.push({
      id: `alm_${tenant.id}_${i.toString().padStart(3, "0")}`,
      tenantId: tenant.id,
      title: tpl.title,
      description: tpl.description,
      category: tpl.category,
      severity: tpl.severity,
      state,
      triggeredAt,
      workloadId: tpl.category === "Backup Failure" ? faker.helpers.arrayElement(workloads).id : undefined,
      acknowledgedBy: ackBy,
      acknowledgedAt: ackAt,
      acknowledgmentNote:
        ackBy && faker.datatype.boolean()
          ? "Investigating with the platform team. Failover repository ready."
          : undefined,
      assignedTo: faker.datatype.boolean({ probability: 0.4 })
        ? faker.helpers.arrayElement(operators).name
        : undefined,
      assignedAt: undefined,
      resolvedBy,
      resolvedAt,
      resolutionNote: resolvedBy
        ? "Repository link restored after failover. Successor backup completed cleanly."
        : undefined,
    });
  }
  return out.sort((a, b) => +new Date(b.triggeredAt) - +new Date(a.triggeredAt));
}

const JOB_LOG_TEMPLATES = (workload: string, jobId: string, success: boolean): JobLogLine[] => {
  const baseline: Array<{ level: JobLogLevel; message: string; offset: number }> = [
    { level: "INFO", message: `Starting incremental backup of ${workload}`, offset: 0 },
    { level: "INFO", message: "Connecting to source via Envoy proxy", offset: 1 },
    { level: "INFO", message: `Snapshot created: snap-${jobId.slice(-6)}`, offset: 3 },
    { level: "INFO", message: "Reading changed blocks (CBT enabled)", offset: 6 },
    { level: "INFO", message: "Transferred 1.2 TB compressed (3.1 TB raw)", offset: 248 },
    { level: "INFO", message: "Verifying integrity (SHA-256)", offset: 252 },
  ];
  const tail: Array<{ level: JobLogLevel; message: string; offset: number }> = success
    ? [{ level: "INFO", message: "Backup completed successfully via rsc-repo-east-05", offset: 268 }]
    : [
        { level: "ERROR", message: "Repository connection timeout: rsc-repo-east-04", offset: 268 },
        { level: "WARN", message: "Retrying with secondary repository", offset: 268 },
        { level: "ERROR", message: "Secondary repository also unreachable. Aborting job.", offset: 280 },
      ];
  const start = DETAIL_REFERENCE - 60_000 * 5; // arbitrary baseline
  return [...baseline, ...tail].map((l) => ({
    ts: new Date(start + l.offset * 1_000).toISOString(),
    level: l.level,
    message: l.message,
  }));
};

function generateJobsForTenant(tenant: Tenant, workloads: Workload[]): JobSession[] {
  const out: JobSession[] = [];
  const count = 110;
  for (let i = 0; i < count; i += 1) {
    const workload = faker.helpers.arrayElement(workloads);
    const minutesAgo = faker.number.int({ min: 5, max: 60 * 24 * 7 });
    const startedAt = new Date(DETAIL_REFERENCE - minutesAgo * 60_000).toISOString();
    const status = faker.helpers.weightedArrayElement([
      { value: "succeeded" as const, weight: 84 },
      { value: "failed" as const, weight: 8 },
      { value: "running" as const, weight: 2 },
      { value: "queued" as const, weight: 2 },
      { value: "skipped" as const, weight: 4 },
    ]);
    const durationSec =
      status === "running" || status === "queued"
        ? 0
        : faker.number.int({ min: 80, max: 4_800 });
    const endedAt =
      status === "running" || status === "queued"
        ? undefined
        : new Date(new Date(startedAt).getTime() + durationSec * 1_000).toISOString();
    const bytesSource = faker.number.int({ min: 50_000_000, max: 8_000_000_000_000 });
    const ratioDedup = faker.number.float({ min: 1.4, max: 4.6, fractionDigits: 2 });
    const ratioCompression = faker.number.float({ min: 1.6, max: 3.8, fractionDigits: 2 });
    const bytesTransferred = Math.round(
      bytesSource / (ratioDedup * ratioCompression),
    );
    const id = `job_${tenant.id}_${i.toString().padStart(4, "0")}`;
    out.push({
      id,
      tenantId: tenant.id,
      workloadId: workload.id,
      workloadName: workload.name,
      workloadType: workload.type,
      jobType: faker.helpers.arrayElement([
        "Incremental",
        "Incremental",
        "Incremental",
        "Synthetic Full",
        "Full",
        "Active Full",
      ] as JobType[]),
      status,
      startedAt,
      endedAt,
      durationSec,
      bytesTransferred,
      bytesSource,
      throughputMBps:
        durationSec > 0 ? Math.round(bytesTransferred / 1_000_000 / durationSec) : 0,
      dedupRatio: ratioDedup,
      compressionRatio: ratioCompression,
      policyId: workload.policyId,
      errorCode: status === "failed" ? faker.helpers.arrayElement(["RBK-2041", "RBK-3107", "RBK-1188"]) : undefined,
      errorMessage:
        status === "failed"
          ? faker.helpers.arrayElement([
              "Repository connection timeout",
              "Authentication token expired",
              "Source workload offline at snapshot time",
            ])
          : undefined,
      log:
        status === "succeeded" || status === "failed"
          ? JOB_LOG_TEMPLATES(workload.name, id, status === "succeeded")
          : [],
    });
  }
  return out.sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt));
}

function generateRestorePointsForTenant(tenant: Tenant, workloads: Workload[]): RestorePoint[] {
  const out: RestorePoint[] = [];
  for (const wl of workloads.slice(0, 14)) {
    for (let i = 0; i < 30; i += 1) {
      const hoursAgo = i * 6 + faker.number.int({ min: 0, max: 3 });
      const captured = new Date(DETAIL_REFERENCE - hoursAgo * 60 * 60_000).toISOString();
      out.push({
        id: `rp_${wl.id}_${i.toString().padStart(2, "0")}`,
        workloadId: wl.id,
        capturedAt: captured,
        sizeBytes: faker.number.int({ min: 200_000_000, max: 2_000_000_000_000 }),
        retentionExpiresAt: new Date(
          DETAIL_REFERENCE + (2_555 - hoursAgo / 24) * 24 * 60 * 60_000,
        ).toISOString(),
        immutable: hoursAgo > 12,
        jobId: `job_${tenant.id}_${i.toString().padStart(4, "0")}`,
      });
    }
  }
  return out;
}

function generateThreatsForTenant(tenant: Tenant): ThreatEvent[] {
  const detections: Array<{ type: string; severity: AlertSeverity; status: ThreatEventStatus; detail: string }> = [
    { type: "Anomalous Encryption", severity: "critical", status: "Contained", detail: "Surge in entropy across /finance-share. Recovery isolation engaged within 2 minutes." },
    { type: "Suspicious File Modification", severity: "info", status: "Resolved", detail: "Mass rename detected on archive volume. Confirmed scheduled migration job." },
    { type: "Privilege Escalation Attempt", severity: "info", status: "Resolved", detail: "Tenant admin role assigned via approved change ticket CHG-4128." },
    { type: "Unusual Login Pattern", severity: "info", status: "Resolved", detail: "Login from new geo for operator priya.sharma. Verified via MFA + ticket." },
    { type: "Large Outbound Transfer", severity: "info", status: "Investigating", detail: "Transfer-out volume 4.2x baseline triggered review. Awaiting customer confirmation." },
  ];
  return detections.map((d, i) => ({
    id: `thr_${tenant.id}_${i}`,
    tenantId: tenant.id,
    detectionType: d.type,
    severity: d.severity,
    detectedAt: new Date(DETAIL_REFERENCE - (i + 1) * 12 * 60 * 60_000).toISOString(),
    status: d.status,
    analyst: faker.helpers.arrayElement(operators).name,
    detail: d.detail,
  }));
}

function generatePolicyAssignment(tenant: Tenant): PolicyAssignment {
  const onboardedAt = new Date(DETAIL_REFERENCE - 47 * 24 * 60 * 60_000).toISOString();
  const overrideOdds = faker.number.float({ min: 0, max: 1 });
  const overrides: PolicyOverride[] =
    overrideOdds > 0.6
      ? [
          {
            id: `ovr_${tenant.id}_retention`,
            field: "Retention",
            templateValue: "7 years (2,555 days)",
            overrideValue: "10 years (3,650 days)",
            appliedBy: "Alex Morrison",
            appliedAt: new Date(DETAIL_REFERENCE - 23 * 24 * 60 * 60_000).toISOString(),
            reason: `${tenant.name} audit requirement — retention extended per legal hold.`,
          },
        ]
      : [];
  const history: PolicyAssignmentEvent[] = [
    {
      id: `pae_${tenant.id}_1`,
      occurredAt: onboardedAt,
      actor: "Alex Morrison",
      description: "Healthcare HIPAA Gold v3 applied at onboarding.",
      kind: "applied",
    },
    ...(overrides.length
      ? [
          {
            id: `pae_${tenant.id}_2`,
            occurredAt: overrides[0].appliedAt,
            actor: overrides[0].appliedBy,
            description: `Override added — ${overrides[0].field} extended to ${overrides[0].overrideValue}.`,
            kind: "override-added" as const,
          },
        ]
      : []),
    {
      id: `pae_${tenant.id}_3`,
      occurredAt: new Date(DETAIL_REFERENCE - 12 * 24 * 60 * 60_000).toISOString(),
      actor: "System",
      description: "Auto-migrated to template version v4 (template upgrade).",
      kind: "auto-migrated",
    },
  ];
  return {
    tenantId: tenant.id,
    policyId: "pol_0",
    policyVersion: 4,
    appliedAt: onboardedAt,
    appliedBy: "Alex Morrison",
    overrides,
    history,
  };
}

const AUDIT_ACTIONS_DETAIL: Array<{ action: string; description: string }> = [
  { action: "tenant.create", description: "Tenant created and onboarded with Healthcare HIPAA Gold v3 policy." },
  { action: "user.login", description: "Operator logged in via SSO with MFA." },
  { action: "policy.apply", description: "Applied Healthcare HIPAA Gold v3 to all production workloads." },
  { action: "backup.run", description: "Triggered on-demand backup of prod-db-mercy-01." },
  { action: "alarm.acknowledge", description: "Acknowledged alarm: Backup job failed: prod-db-mercy-01." },
  { action: "policy.override", description: "Added override on Retention: 7y → 10y." },
  { action: "key.rotate", description: "Rotated tenant encryption key (scheduled)." },
  { action: "report.export", description: "Exported HIPAA attestation report (PDF)." },
  { action: "capacity.threshold", description: "Capacity crossed 80% soft limit." },
  { action: "restore.initiate", description: "Initiated workload restore for prod-db-mercy-01 to point-in-time." },
  { action: "tenant.update", description: "Updated tenant primary contact email." },
  { action: "policy.migrate", description: "Auto-migrated tenant to template v4." },
];

function generateDetailedAuditForTenant(tenant: Tenant): DetailedAuditEvent[] {
  const out: DetailedAuditEvent[] = [];
  const count = faker.number.int({ min: 22, max: 36 });
  for (let i = 0; i < count; i += 1) {
    const tpl = faker.helpers.arrayElement(AUDIT_ACTIONS_DETAIL);
    const operator = faker.helpers.arrayElement(operators);
    const minutesAgo = faker.number.int({ min: 5, max: 60 * 24 * 47 });
    const occurredAt = new Date(DETAIL_REFERENCE - minutesAgo * 60_000).toISOString();
    const sessionId = `sess_${faker.string.alphanumeric({ length: 8, casing: "lower" })}`;
    const before = tpl.action === "policy.override" ? { Retention: "7 years" } : undefined;
    const after = tpl.action === "policy.override" ? { Retention: "10 years" } : undefined;
    out.push({
      id: `audit_${tenant.id}_${i.toString().padStart(3, "0")}`,
      actor: operator.name,
      actorRole: operator.role,
      action: tpl.action,
      target: tenant.name,
      tenantId: tenant.id,
      outcome: faker.helpers.weightedArrayElement([
        { value: "success", weight: 9 },
        { value: "failure", weight: 1 },
      ]),
      occurredAt,
      ipAddress: faker.internet.ipv4(),
      sessionId,
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
      geo: faker.helpers.arrayElement([
        "San Francisco, CA, US",
        "New York, NY, US",
        "Seattle, WA, US",
        "Austin, TX, US",
      ]),
      before,
      after,
      description: tpl.description,
    });
  }
  return out.sort((a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt));
}

function generateMonthlyConsumption(tenant: Tenant): MonthlyConsumption[] {
  const out: MonthlyConsumption[] = [];
  const now = new Date(DETAIL_REFERENCE);
  for (let m = 11; m >= 0; m -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - m, 1).toISOString();
    const trend = 1 + (11 - m) * 0.018;
    const baseUsed = tenant.capacityUsedTB / trend;
    out.push({
      month: start,
      peakUsageTB: Number((baseUsed * faker.number.float({ min: 1.05, max: 1.15, fractionDigits: 2 })).toFixed(2)),
      avgUsageTB: Number(baseUsed.toFixed(2)),
      restorePoints: faker.number.int({ min: 800, max: 1_400 }),
      transferOutTB: Number(faker.number.float({ min: 0.4, max: 4.6, fractionDigits: 2 }).toFixed(2)),
    });
  }
  return out;
}

function generateQuotaForTenant(tenant: Tenant): QuotaUsage {
  return {
    storage: { used: tenant.capacityUsedTB, limit: tenant.capacityCommittedTB, unit: "TB" },
    workloads: { used: tenant.workloadCount, limit: Math.round(tenant.workloadCount * 1.35), unit: "workloads" },
    transferOutThisMonth: { used: Number(faker.number.float({ min: 1.4, max: 6.8, fractionDigits: 1 }).toFixed(1)), limit: 10, unit: "TB" },
    restorePoints: { used: faker.number.int({ min: 8_000, max: 22_000 }), limit: 50_000, unit: "points" },
  };
}

function generateKeyRotationForTenant(): KeyRotationStatus {
  const lastRotationAt = new Date(DETAIL_REFERENCE - 23 * 24 * 60 * 60_000).toISOString();
  const nextRotationAt = new Date(DETAIL_REFERENCE + 67 * 24 * 60 * 60_000).toISOString();
  return {
    algorithm: "AES-256-GCM",
    keySource: "Rubrik-managed",
    rotationDays: 90,
    lastRotationAt,
    nextRotationAt,
  };
}

export interface TenantDetail {
  workloads: Workload[];
  alarms: Alarm[];
  jobs: JobSession[];
  restorePoints: RestorePoint[];
  threats: ThreatEvent[];
  policy: PolicyAssignment;
  audit: DetailedAuditEvent[];
  monthly: MonthlyConsumption[];
  quota: QuotaUsage;
  keyRotation: KeyRotationStatus;
}

const tenantDetails: Record<string, TenantDetail> = {};
for (const t of tenants) {
  const wls = generateWorkloadsForTenant(t);
  tenantDetails[t.id] = {
    workloads: wls,
    alarms: generateAlarmsForTenant(t, wls),
    jobs: generateJobsForTenant(t, wls),
    restorePoints: generateRestorePointsForTenant(t, wls),
    threats: generateThreatsForTenant(t),
    policy: generatePolicyAssignment(t),
    audit: generateDetailedAuditForTenant(t),
    monthly: generateMonthlyConsumption(t),
    quota: generateQuotaForTenant(t),
    keyRotation: generateKeyRotationForTenant(),
  };
}

// ── Security & isolation surface ─────────────────────────────────────────────

export const ISOLATION_CONTROLS: IsolationControlDef[] = [
  { id: "network", label: "Network", description: "Tenant traffic must not be reachable from outside its namespace." },
  { id: "storage", label: "Storage", description: "Backups land on a tenant-scoped storage pool with dedicated keys." },
  { id: "iam", label: "IAM", description: "No principal can act across tenants without explicit elevation." },
  { id: "encryption", label: "Encryption Key", description: "Tenant data is encrypted with a key never used by any other tenant." },
  { id: "namespace", label: "Namespace", description: "Tenant resources live in a fully scoped logical namespace." },
];

const SECURITY_NOW = Date.parse("2026-04-25T18:00:00Z");

interface CellSeed {
  tenant: string;
  control: IsolationControlId;
  status: IsolationCellStatus;
}

const SEEDED_CELLS: CellSeed[] = [
  { tenant: "Crawford & Associates LLP", control: "storage", status: "fail" },
  { tenant: "Crawford & Associates LLP", control: "iam", status: "fail" },
  { tenant: "Pacific Coast Medical Center", control: "storage", status: "fail" },
  { tenant: "Summit Financial Group", control: "network", status: "fail" },
  { tenant: "Summit Financial Group", control: "encryption", status: "fail" },
  { tenant: "Lakewood Community Health", control: "network", status: "fail" },
  { tenant: "Lakewood Community Health", control: "storage", status: "warn" },
  { tenant: "Sterling Aerospace", control: "storage", status: "warn" },
  { tenant: "Sterling Aerospace", control: "iam", status: "warn" },
  { tenant: "Meridian Pharmaceuticals", control: "network", status: "warn" },
  { tenant: "Meridian Pharmaceuticals", control: "namespace", status: "fail" },
  { tenant: "Pinnacle Insurance Group", control: "namespace", status: "fail" },
  { tenant: "Atlas Logistics Corp", control: "iam", status: "warn" },
  { tenant: "Atlas Logistics Corp", control: "namespace", status: "warn" },
  { tenant: "Redwood School District", control: "storage", status: "warn" },
  { tenant: "Cascade Energy Partners", control: "storage", status: "fail" },
  { tenant: "Cascade Energy Partners", control: "encryption", status: "warn" },
  { tenant: "Mercy General Hospital", control: "encryption", status: "warn" },
  { tenant: "Hawthorne Manufacturing", control: "iam", status: "fail" },
  { tenant: "Vanguard Defense Systems", control: "encryption", status: "fail" },
  { tenant: "Sapphire Hotels International", control: "encryption", status: "warn" },
  { tenant: "Quantum Data Sciences", control: "namespace", status: "warn" },
  { tenant: "Bridgewater Analytics", control: "encryption", status: "warn" },
  { tenant: "Harborview Medical Group", control: "iam", status: "warn" },
  { tenant: "Cornerstone Federal Bank", control: "storage", status: "fail" },
  { tenant: "Cornerstone Federal Bank", control: "encryption", status: "fail" },
  { tenant: "Beacon Hill Capital Partners", control: "encryption", status: "warn" },
  { tenant: "Greystone Property Holdings", control: "iam", status: "warn" },
  { tenant: "Polaris Telecommunications", control: "namespace", status: "warn" },
  { tenant: "Aurora Biotech", control: "encryption", status: "warn" },
  { tenant: "Cobalt Semiconductor", control: "encryption", status: "warn" },
  { tenant: "Stonehaven Legal Partners", control: "iam", status: "fail" },
  { tenant: "Highland Community College", control: "storage", status: "warn" },
  { tenant: "Mariner's Trust Bank", control: "encryption", status: "warn" },
  { tenant: "Maplewood Senior Living", control: "encryption", status: "warn" },
  { tenant: "Crescent Telehealth", control: "network", status: "fail" },
  { tenant: "Tidewater Education Trust", control: "encryption", status: "warn" },
  { tenant: "Halcyon Asset Management", control: "encryption", status: "warn" },
  { tenant: "Glacier Resort Group", control: "encryption", status: "warn" },
  { tenant: "Driftwood Hospitality", control: "encryption", status: "warn" },
  { tenant: "Brightline Logistics", control: "iam", status: "warn" },
];

function buildViolation(
  tenantName: string,
  control: IsolationControlId,
  status: IsolationCellStatus,
): IsolationCellViolation | undefined {
  if (status === "pass") return undefined;
  const severity: AlertSeverity = status === "fail" ? "critical" : "warning";
  const evidenceId = `ev-${faker.string.alphanumeric({ length: 6, casing: "lower" })}-20260425`;
  const firstDetectedAt = new Date(SECURITY_NOW - 26 * 60 * 60_000).toISOString();
  const blueprints = VIOLATION_BLUEPRINTS[control];
  const bp = blueprints[status === "fail" ? "fail" : "warn"];
  return {
    description: bp.description.replace("{tenant}", tenantName),
    severity,
    firstDetectedAt,
    detectionSource: "Continuous scanning: rsc-isolation-engine v3.2",
    frameworkCitations: bp.citations,
    affectedResources: bp.resources(tenantName),
    blastRadius: bp.blastRadius,
    customerNotificationTrigger: bp.customerNotificationTrigger,
    estimatedRemediationLabel: bp.estimatedRemediationLabel,
    likelihood: bp.likelihood,
    recommendedAction: bp.recommendedAction,
    remediationSteps: bp.remediationSteps,
    evidenceLog: bp.evidenceLog(tenantName, evidenceId),
    configurationSnapshot: bp.configSnapshot,
    evidencePackageId: `${evidenceId}.tar.gz`,
    history: {
      firstDetectedAt: new Date(SECURITY_NOW - 14 * 24 * 60 * 60_000).toISOString(),
      failsLast30d: status === "fail" ? 3 : 1,
      successfulRemediations: status === "fail" ? 2 : 0,
      lastSuccessfulPassAt: new Date(SECURITY_NOW - 17 * 24 * 60 * 60_000).toISOString(),
      pattern: "Control consistently fails after policy template updates.",
    },
  };
}

interface ViolationBlueprint {
  description: string;
  citations: FrameworkCitation[];
  resources: (tenant: string) => AffectedResource[];
  blastRadius: string;
  customerNotificationTrigger: string;
  estimatedRemediationLabel: string;
  likelihood: "Low" | "Medium" | "High";
  recommendedAction: string;
  remediationSteps: RemediationStepDef[];
  evidenceLog: (tenant: string, evidenceId: string) => string;
  configSnapshot: string;
}

const STORAGE_REMEDIATION: RemediationStepDef[] = [
  {
    id: "isolate",
    title: "Isolate volume to dedicated pool",
    description: "Allocates a new storage pool exclusively for the affected tenant.",
    estimatedDurationLabel: "~4 minutes",
    completionDurationLabel: "2m 14s",
    substeps: [
      "Locking volume…",
      "Provisioning new storage pool…",
      "Migrating data to dedicated pool…",
      "Verifying volume integrity…",
    ],
  },
  {
    id: "rekey",
    title: "Re-encrypt with tenant-specific key",
    description: "Migrates data using a tenant-scoped KMS key.",
    estimatedDurationLabel: "~3 minutes",
    completionDurationLabel: "2m 41s",
    substeps: [
      "Generating tenant-specific KMS key…",
      "Re-encrypting restore points…",
      "Verifying encryption…",
    ],
  },
  {
    id: "policy",
    title: "Update access policy and remove cross-tenant references",
    description: "Removes shared mount points and updates RBAC scope.",
    estimatedDurationLabel: "~2 minutes",
    completionDurationLabel: "1m 47s",
    substeps: [
      "Removing cross-tenant mount references…",
      "Updating RBAC scope…",
      "Locking pool to tenant boundary…",
    ],
  },
  {
    id: "verify",
    title: "Verify isolation with re-scan",
    description: "Runs full storage isolation check on the affected tenant.",
    estimatedDurationLabel: "~3 minutes",
    completionDurationLabel: "2m 56s",
    substeps: [
      "Running full storage isolation check…",
      "Validating volume references…",
      "Checking encryption key scope…",
      "Confirming pool isolation…",
    ],
  },
  {
    id: "evidence",
    title: "Generate compliance evidence",
    description: "Captures pre/post state for the audit trail.",
    estimatedDurationLabel: "~1 minute",
    completionDurationLabel: "1m 40s",
    substeps: [
      "Capturing remediation evidence…",
      "Generating signed evidence package…",
      "Updating compliance ledger…",
    ],
  },
];

const NETWORK_REMEDIATION: RemediationStepDef[] = [
  { id: "freeze", title: "Freeze affected network rules", description: "Prevents further traffic on the conflicting rule.", estimatedDurationLabel: "~1 minute", completionDurationLabel: "0m 52s", substeps: ["Locking rule set…", "Draining in-flight connections…", "Confirming freeze…"] },
  { id: "fix", title: "Replace with isolated rule set", description: "Applies tenant-scoped Envoy config and policy.", estimatedDurationLabel: "~3 minutes", completionDurationLabel: "2m 38s", substeps: ["Generating tenant-scoped Envoy config…", "Applying ingress/egress policies…", "Restarting Envoy…"] },
  { id: "verify", title: "Verify with synthetic probe", description: "Probes from outside the tenant boundary.", estimatedDurationLabel: "~2 minutes", completionDurationLabel: "1m 49s", substeps: ["Running blackbox probe…", "Validating denial of cross-tenant requests…"] },
  { id: "evidence", title: "Generate compliance evidence", description: "Signs and stores remediation artifacts.", estimatedDurationLabel: "~1 minute", completionDurationLabel: "0m 58s", substeps: ["Capturing evidence…", "Signing package…", "Updating ledger…"] },
];

const IAM_REMEDIATION: RemediationStepDef[] = [
  { id: "audit", title: "Audit principal bindings", description: "Surfaces all cross-tenant role references.", estimatedDurationLabel: "~2 minutes", completionDurationLabel: "1m 22s", substeps: ["Scanning role bindings…", "Identifying cross-tenant scopes…"] },
  { id: "scope", title: "Re-scope offending roles", description: "Limits roles to the affected tenant only.", estimatedDurationLabel: "~3 minutes", completionDurationLabel: "2m 11s", substeps: ["Updating bindings…", "Removing cross-tenant scopes…", "Recreating service principals…"] },
  { id: "rotate", title: "Rotate impacted service principals", description: "Forces credential rotation on affected accounts.", estimatedDurationLabel: "~2 minutes", completionDurationLabel: "1m 47s", substeps: ["Generating new credentials…", "Notifying integrations…"] },
  { id: "verify", title: "Verify with role-bleed scan", description: "Confirms there are no remaining cross-tenant assignments.", estimatedDurationLabel: "~2 minutes", completionDurationLabel: "1m 38s", substeps: ["Running scan…", "Confirming zero cross-tenant bindings…"] },
  { id: "evidence", title: "Generate compliance evidence", description: "Signs and stores remediation artifacts.", estimatedDurationLabel: "~1 minute", completionDurationLabel: "0m 51s", substeps: ["Capturing evidence…", "Signing package…", "Updating ledger…"] },
];

const KEY_REMEDIATION: RemediationStepDef[] = [
  { id: "rotate", title: "Rotate tenant encryption key", description: "Mints a new AES-256 key in the HSM.", estimatedDurationLabel: "~4 minutes", completionDurationLabel: "3m 12s", substeps: ["Generating new key in HSM…", "Re-keying restore points in background…", "Decommissioning old key…"] },
  { id: "verify", title: "Verify key isolation", description: "Confirms key is unique to the tenant.", estimatedDurationLabel: "~2 minutes", completionDurationLabel: "1m 33s", substeps: ["Probing key references across tenants…", "Validating HSM partition isolation…"] },
  { id: "evidence", title: "Generate compliance evidence", description: "Signs and stores remediation artifacts.", estimatedDurationLabel: "~1 minute", completionDurationLabel: "0m 47s", substeps: ["Capturing evidence…", "Signing package…", "Updating ledger…"] },
];

const NAMESPACE_REMEDIATION: RemediationStepDef[] = [
  { id: "lock", title: "Quarantine namespace", description: "Prevents further mutations on the affected namespace.", estimatedDurationLabel: "~1 minute", completionDurationLabel: "0m 41s", substeps: ["Locking namespace mutations…", "Suspending in-flight workflows…"] },
  { id: "rebuild", title: "Rebuild namespace metadata", description: "Resolves orphan references and collisions.", estimatedDurationLabel: "~3 minutes", completionDurationLabel: "2m 33s", substeps: ["Resolving orphan references…", "Detaching cross-tenant resources…", "Re-binding metadata…"] },
  { id: "verify", title: "Verify namespace boundary", description: "Re-runs namespace isolation checks.", estimatedDurationLabel: "~2 minutes", completionDurationLabel: "1m 28s", substeps: ["Running namespace scan…", "Validating boundary integrity…"] },
  { id: "evidence", title: "Generate compliance evidence", description: "Signs and stores remediation artifacts.", estimatedDurationLabel: "~1 minute", completionDurationLabel: "0m 52s", substeps: ["Capturing evidence…", "Signing package…", "Updating ledger…"] },
];

const VIOLATION_BLUEPRINTS: Record<
  IsolationControlId,
  { fail: ViolationBlueprint; warn: ViolationBlueprint }
> = {
  storage: {
    fail: {
      description:
        "Storage volume vol-7a3c2b is shared between {tenant} and another tenant. Cross-tenant data access path detected via shared storage pool reference in repository configuration.",
      citations: [
        { framework: "HIPAA", section: "164.312(a)(1)", description: "Access Control violation" },
        { framework: "SOC 2", section: "CC6.1", description: "Logical access security violation" },
        { framework: "ISO 27001", section: "A.9.4", description: "System and application access control failure" },
      ],
      resources: () => [
        { id: "vol-7a3c2b", type: "Volume", description: "2.4 TB volume — last cross-tenant access 4 hours ago" },
        { id: "repo-pool-east-04", type: "Repository Pool", description: "Repository pool containing the shared volume" },
        { id: "snap-multi-202604240400", type: "Snapshot", description: "Snapshot present in shared scope" },
        { id: "rp-batch-7a3c2b", type: "Restore Point", description: "8 backup restore points stored on affected volume" },
      ],
      blastRadius: "If exploited: data exfiltration risk across 2 tenants.",
      customerNotificationTrigger: "Yes (within 72 hours per HIPAA Breach Notification Rule).",
      estimatedRemediationLabel: "12 minutes",
      likelihood: "Medium",
      recommendedAction: "Isolate immediately; do not delay for change window.",
      remediationSteps: STORAGE_REMEDIATION,
      evidenceLog: (tenant, ev) => `[2026-04-25 14:22:03 UTC] storage-isolation-check started
[2026-04-25 14:22:03 UTC] tenant=${slugifyName(tenant)} scope=storage_isolation
[2026-04-25 14:22:04 UTC] checking volume references in repo-pool-east-04
[2026-04-25 14:22:05 UTC] WARN volume vol-7a3c2b has 2 tenant references
[2026-04-25 14:22:05 UTC] cross-reference: tenant-mercy-general (last_access=2026-04-25 10:18:42)
[2026-04-25 14:22:06 UTC] ERROR storage isolation FAIL: shared volume detected
[2026-04-25 14:22:06 UTC] generating evidence package: ${ev}
[2026-04-25 14:22:07 UTC] check completed in 4.2s status=FAIL`,
      configSnapshot: `repo_pool: pool-east-04
access_scope:
  - tenant-affected           # expected
  - tenant-mercy-general      # UNEXPECTED — cross-tenant reference
volumes:
  vol-7a3c2b:
    size_tb: 2.4
    encryption_key: kms-shared-east-04   # SHOULD BE tenant-specific
    mount_scope: pool-wide                # SHOULD BE tenant-scoped`,
    },
    warn: {
      description: "Storage volume vol-9c1f4b approaching cross-tenant exposure threshold. Encryption key reuse detected on legacy snapshots.",
      citations: [
        { framework: "SOC 2", section: "CC6.7", description: "Data classification handling exception" },
        { framework: "ISO 27001", section: "A.10.1", description: "Cryptographic controls drift" },
      ],
      resources: () => [
        { id: "vol-9c1f4b", type: "Volume", description: "1.1 TB volume with legacy encryption metadata" },
        { id: "kms-shared-east-04", type: "KMS Key", description: "Legacy shared key still referenced" },
      ],
      blastRadius: "Data classification mismatch but no active cross-tenant access.",
      customerNotificationTrigger: "No, internal-only review.",
      estimatedRemediationLabel: "8 minutes",
      likelihood: "Low",
      recommendedAction: "Schedule remediation within next change window.",
      remediationSteps: STORAGE_REMEDIATION,
      evidenceLog: (tenant, ev) => `[2026-04-25 12:08:12 UTC] storage-isolation-check tenant=${slugifyName(tenant)} status=WARN
[2026-04-25 12:08:14 UTC] kms-shared-east-04 referenced by 4 legacy restore points
[2026-04-25 12:08:14 UTC] generating evidence package: ${ev}
[2026-04-25 12:08:15 UTC] check completed status=WARN`,
      configSnapshot: `volumes:
  vol-9c1f4b:
    encryption_key: kms-shared-east-04    # WARN — legacy shared key
    mount_scope: tenant-scoped`,
    },
  },
  network: {
    fail: {
      description:
        "Envoy proxy misconfigured for {tenant}. Outbound deny-by-default policy disabled by an automation drift event 18 hours ago.",
      citations: [
        { framework: "SOC 2", section: "CC6.6", description: "Boundary defense control failure" },
        { framework: "PCI-DSS", section: "1.2.1", description: "Restricted inbound/outbound traffic violation" },
        { framework: "ISO 27001", section: "A.13.1", description: "Network security failure" },
      ],
      resources: () => [
        { id: "envoy-tenant-affected", type: "Network Rule", description: "Envoy proxy configuration" },
        { id: "rule-egress-default", type: "Network Rule", description: "Outbound deny-by-default rule disabled" },
      ],
      blastRadius: "If exploited: lateral movement across the tenant control plane.",
      customerNotificationTrigger: "No (internal control failure, no customer data exposure).",
      estimatedRemediationLabel: "8 minutes",
      likelihood: "Medium",
      recommendedAction: "Restore Envoy config from baseline immediately.",
      remediationSteps: NETWORK_REMEDIATION,
      evidenceLog: (tenant, ev) => `[2026-04-25 09:11:01 UTC] network-isolation-check tenant=${slugifyName(tenant)}
[2026-04-25 09:11:02 UTC] envoy_proxy.outbound_deny=false  # EXPECTED true
[2026-04-25 09:11:02 UTC] ERROR network isolation FAIL: deny-by-default disabled
[2026-04-25 09:11:03 UTC] evidence package: ${ev}`,
      configSnapshot: `envoy_proxy:
  enabled: true
  version: v2.4.7
outbound_rules:
  - deny: all_default            # CURRENT: disabled — should be enabled
  - allow: rsc-repo-east-04`,
    },
    warn: {
      description: "Envoy version v2.4.5 in use; current baseline is v2.4.7. Patch lag exceeds policy.",
      citations: [
        { framework: "SOC 2", section: "CC7.1", description: "Patch management exception" },
      ],
      resources: () => [
        { id: "envoy-tenant-affected", type: "Network Rule", description: "Envoy proxy v2.4.5" },
      ],
      blastRadius: "Patch lag only — no functional exposure.",
      customerNotificationTrigger: "No.",
      estimatedRemediationLabel: "6 minutes",
      likelihood: "Low",
      recommendedAction: "Upgrade to v2.4.7 in next maintenance window.",
      remediationSteps: NETWORK_REMEDIATION,
      evidenceLog: (tenant, ev) => `[2026-04-25 09:11:01 UTC] network-isolation-check tenant=${slugifyName(tenant)} status=WARN
[2026-04-25 09:11:01 UTC] envoy_version=v2.4.5 baseline=v2.4.7
[2026-04-25 09:11:02 UTC] evidence package: ${ev}`,
      configSnapshot: `envoy_proxy:
  version: v2.4.5    # WARN — lagging baseline v2.4.7`,
    },
  },
  iam: {
    fail: {
      description:
        "Cross-tenant role binding detected on principal svc-rbk-replicator-east. Principal has scope across {tenant} and one other tenant.",
      citations: [
        { framework: "SOC 2", section: "CC6.1", description: "Logical access — separation of duties failure" },
        { framework: "HIPAA", section: "164.312(a)(2)(i)", description: "Unique user identification violation" },
        { framework: "ISO 27001", section: "A.9.2", description: "User access management failure" },
      ],
      resources: () => [
        { id: "svc-rbk-replicator-east", type: "IAM Role", description: "Service principal with cross-tenant binding" },
        { id: "role-replicator-shared", type: "IAM Role", description: "Role with shared scope across tenants" },
      ],
      blastRadius: "Compromise of svc account = full read across two tenants.",
      customerNotificationTrigger: "Conditional (depends on whether principal was used).",
      estimatedRemediationLabel: "10 minutes",
      likelihood: "Medium",
      recommendedAction: "Re-scope role and rotate principal credentials immediately.",
      remediationSteps: IAM_REMEDIATION,
      evidenceLog: (tenant, ev) => `[2026-04-25 11:47:22 UTC] iam-isolation-check tenant=${slugifyName(tenant)}
[2026-04-25 11:47:23 UTC] principal=svc-rbk-replicator-east scope=multi-tenant
[2026-04-25 11:47:24 UTC] ERROR iam isolation FAIL: cross-tenant binding
[2026-04-25 11:47:24 UTC] evidence package: ${ev}`,
      configSnapshot: `principal: svc-rbk-replicator-east
bindings:
  - tenant-affected
  - tenant-other          # UNEXPECTED — must be tenant-affected only`,
    },
    warn: {
      description: "Read-only auditor role assigned >90 days ago without periodic review.",
      citations: [
        { framework: "SOC 2", section: "CC6.3", description: "Access review cadence exception" },
      ],
      resources: () => [
        { id: "role-auditor-readonly", type: "IAM Role", description: "Auditor role pending periodic review" },
      ],
      blastRadius: "Stale role assignment, low risk.",
      customerNotificationTrigger: "No.",
      estimatedRemediationLabel: "5 minutes",
      likelihood: "Low",
      recommendedAction: "Re-attest the role assignment.",
      remediationSteps: IAM_REMEDIATION,
      evidenceLog: (tenant, ev) => `[2026-04-25 11:47:22 UTC] iam-review tenant=${slugifyName(tenant)} status=WARN
[2026-04-25 11:47:23 UTC] role-auditor-readonly age_days=104  # WARN — review threshold 90
[2026-04-25 11:47:24 UTC] evidence package: ${ev}`,
      configSnapshot: `role: auditor-readonly
last_reviewed: 2026-01-12
review_threshold_days: 90`,
    },
  },
  encryption: {
    fail: {
      description:
        "Tenant encryption key kms-key-{slug} is overdue for rotation by 14 days. Compliance requires 90-day rotation.",
      citations: [
        { framework: "SOC 2", section: "CC6.7", description: "Cryptographic controls failure" },
        { framework: "PCI-DSS", section: "3.6.4", description: "Cryptographic key changes failure" },
        { framework: "HIPAA", section: "164.312(e)(2)(ii)", description: "Encryption integrity exception" },
      ],
      resources: () => [
        { id: "kms-key-affected", type: "KMS Key", description: "Tenant-scoped key overdue for rotation" },
      ],
      blastRadius: "Compliance failure but no active data exposure.",
      customerNotificationTrigger: "No.",
      estimatedRemediationLabel: "7 minutes",
      likelihood: "Low",
      recommendedAction: "Rotate key immediately to return to compliance.",
      remediationSteps: KEY_REMEDIATION,
      evidenceLog: (tenant, ev) => `[2026-04-25 04:00:00 UTC] key-rotation-check tenant=${slugifyName(tenant)}
[2026-04-25 04:00:01 UTC] kms-key-affected age_days=104  # threshold 90
[2026-04-25 04:00:02 UTC] ERROR encryption FAIL: rotation overdue
[2026-04-25 04:00:02 UTC] evidence package: ${ev}`,
      configSnapshot: `key_id: kms-key-affected
algorithm: AES-256-GCM
last_rotated: 2026-01-12
rotation_threshold_days: 90`,
    },
    warn: {
      description: "Encryption key rotation due in 7 days.",
      citations: [{ framework: "SOC 2", section: "CC6.7", description: "Approaching rotation threshold" }],
      resources: () => [{ id: "kms-key-affected", type: "KMS Key", description: "Key approaching rotation" }],
      blastRadius: "None yet, advisory only.",
      customerNotificationTrigger: "No.",
      estimatedRemediationLabel: "7 minutes",
      likelihood: "Low",
      recommendedAction: "Schedule rotation within the next 7 days.",
      remediationSteps: KEY_REMEDIATION,
      evidenceLog: (tenant, ev) => `[2026-04-25 04:00:00 UTC] key-rotation-check tenant=${slugifyName(tenant)} status=WARN
[2026-04-25 04:00:01 UTC] kms-key-affected age_days=83  # threshold 90 in 7 days
[2026-04-25 04:00:02 UTC] evidence package: ${ev}`,
      configSnapshot: `key_id: kms-key-affected
last_rotated: 2026-02-01
rotation_threshold_days: 90`,
    },
  },
  namespace: {
    fail: {
      description:
        "Orphaned namespace tenant-{slug}-legacy detected with active resource bindings. Namespace collision in lookup table.",
      citations: [
        { framework: "SOC 2", section: "CC6.1", description: "Resource isolation failure" },
        { framework: "ISO 27001", section: "A.13.1", description: "Network segregation failure" },
      ],
      resources: () => [
        { id: "ns-legacy-orphan", type: "Namespace", description: "Orphaned namespace with bindings" },
      ],
      blastRadius: "Cross-tenant lookup ambiguity.",
      customerNotificationTrigger: "No.",
      estimatedRemediationLabel: "9 minutes",
      likelihood: "Medium",
      recommendedAction: "Quarantine and rebuild namespace metadata.",
      remediationSteps: NAMESPACE_REMEDIATION,
      evidenceLog: (tenant, ev) => `[2026-04-25 02:14:08 UTC] namespace-isolation-check tenant=${slugifyName(tenant)}
[2026-04-25 02:14:09 UTC] WARN orphaned namespace detected: tenant-${slugifyName(tenant)}-legacy
[2026-04-25 02:14:10 UTC] ERROR namespace isolation FAIL: collision in lookup table
[2026-04-25 02:14:10 UTC] evidence package: ${ev}`,
      configSnapshot: `namespace: tenant-affected
status: collision
collision_with: tenant-affected-legacy   # ORPHANED — must be removed`,
    },
    warn: {
      description: "Namespace label drift detected. Some resources still reference deprecated label.",
      citations: [{ framework: "SOC 2", section: "CC6.1", description: "Metadata drift advisory" }],
      resources: () => [{ id: "ns-tenant-affected", type: "Namespace", description: "Namespace label drift" }],
      blastRadius: "Metadata only.",
      customerNotificationTrigger: "No.",
      estimatedRemediationLabel: "5 minutes",
      likelihood: "Low",
      recommendedAction: "Re-label resources via background sweep.",
      remediationSteps: NAMESPACE_REMEDIATION,
      evidenceLog: (tenant, ev) => `[2026-04-25 02:14:08 UTC] namespace-check tenant=${slugifyName(tenant)} status=WARN
[2026-04-25 02:14:09 UTC] label_drift_count=3
[2026-04-25 02:14:10 UTC] evidence package: ${ev}`,
      configSnapshot: `namespace: tenant-affected
labels:
  - tenant-affected      # ok
  - tenant-affected-old  # WARN — deprecated label`,
    },
  },
};

function slugifyName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateMatrixCells(): IsolationCell[] {
  const cells: IsolationCell[] = [];
  for (const tenant of tenants) {
    for (const control of ISOLATION_CONTROLS) {
      const seed = SEEDED_CELLS.find(
        (s) => s.tenant === tenant.name && s.control === control.id,
      );
      const status: IsolationCellStatus = seed?.status ?? "pass";
      const lastEvalMin = faker.number.int({ min: 30, max: 60 * 6 });
      cells.push({
        tenantId: tenant.id,
        controlId: control.id,
        status,
        lastEvaluatedAt: new Date(SECURITY_NOW - lastEvalMin * 60_000).toISOString(),
        evidence:
          status === "pass"
            ? `Last verification confirmed ${control.label} isolation across all bindings.`
            : `Issue detected during ${control.label} isolation sweep.`,
        violation: buildViolation(tenant.name, control.id, status),
      });
    }
  }
  return cells;
}

const matrixCells = generateMatrixCells();

const THREAT_TEMPLATES: Array<{
  type: ThreatDetectionType;
  severity: AlertSeverity;
  detail: string;
}> = [
  { type: "Unusual Access Pattern", severity: "info", detail: "Login pattern from new geo for operator priya.sharma. Verified via MFA + ticket." },
  { type: "Mass Deletion", severity: "critical", detail: "12,400 file deletions detected on /finance-share within a 9 minute window. Recovery isolation engaged." },
  { type: "Ransomware Signature", severity: "critical", detail: "Encrypted-file entropy spike across /research-share. Hash match against known TTPs." },
  { type: "Anomalous Encryption", severity: "warning", detail: "Sudden encryption volume on archive volume. Confirmed scheduled migration." },
  { type: "Data Exfiltration Pattern", severity: "warning", detail: "Outbound transfer 4.2x baseline triggered review. Awaiting customer confirmation." },
  { type: "Privilege Escalation Attempt", severity: "info", detail: "Tenant admin role assigned via approved change ticket CHG-4128." },
];

const THREAT_NARRATIVE = [
  { tenantName: "Bay Area Transit Authority", type: "Mass Deletion" as ThreatDetectionType, severity: "critical" as AlertSeverity, status: "Contained" as ThreatEventStatus, analyst: "Marcus Chen", detail: "12,400 file deletions detected on /transit-ops-share within a 9 minute window. Recovery isolation engaged." },
  { tenantName: "Oakmont Wealth Advisors", type: "Ransomware Signature" as ThreatDetectionType, severity: "critical" as AlertSeverity, status: "Investigating" as ThreatEventStatus, analyst: "Priya Patel", detail: "Encrypted-file entropy spike with TTP hash match. Snapshot 0418-0400 confirmed clean." },
  { tenantName: "Atlas Logistics Corp", type: "Mass Deletion" as ThreatDetectionType, severity: "critical" as AlertSeverity, status: "Investigating" as ThreatEventStatus, analyst: "Marcus Chen", detail: "8,200 file deletions on /shipping-historical. Investigating tenant intent." },
  { tenantName: "Vanguard Defense Systems", type: "Privilege Escalation Attempt" as ThreatDetectionType, severity: "info" as AlertSeverity, status: "Resolved" as ThreatEventStatus, analyst: "Sofia Reyes", detail: "Service principal escalated to admin via approved ticket CHG-4128." },
  { tenantName: "Crawford & Associates LLP", type: "Unusual Access Pattern" as ThreatDetectionType, severity: "info" as AlertSeverity, status: "Resolved" as ThreatEventStatus, analyst: "Sofia Reyes", detail: "Login from a new geo for jcrawford@crawfordlegal.com. MFA verified." },
  { tenantName: "Mercy General Hospital", type: "Data Exfiltration Pattern" as ThreatDetectionType, severity: "warning" as AlertSeverity, status: "Investigating" as ThreatEventStatus, analyst: "Daniel Okafor", detail: "Outbound transfer 4.1x baseline. Awaiting tenant confirmation of clinical export." },
  { tenantName: "Quantum Data Sciences", type: "Anomalous Encryption" as ThreatDetectionType, severity: "warning" as AlertSeverity, status: "Contained" as ThreatEventStatus, analyst: "Priya Patel", detail: "Encryption volume spike on /research-share matched scheduled archive migration." },
  { tenantName: "Sunrise Senior Care", type: "Unusual Access Pattern" as ThreatDetectionType, severity: "info" as AlertSeverity, status: "Resolved" as ThreatEventStatus, analyst: "Sofia Reyes", detail: "Operator action outside business hours. Verified via on-call rotation." },
];

function generateThreatDetections(): ThreatDetection[] {
  const out: ThreatDetection[] = [];
  THREAT_NARRATIVE.forEach((n, i) => {
    const tenant = tenants.find((t) => t.name === n.tenantName);
    if (!tenant) return;
    const detectedAt = new Date(SECURITY_NOW - (i + 1) * 90 * 60_000).toISOString();
    out.push({
      id: `thr_${i}`,
      tenantId: tenant.id,
      detectionType: n.type,
      severity: n.severity,
      status: n.status,
      detectedAt,
      analyst: n.analyst,
      detail: n.detail,
      history: [
        {
          at: detectedAt,
          by: "rsc-threat-engine",
          from: null,
          to: "Investigating",
          note: "Detection triggered by continuous scanning.",
        },
        ...(n.status !== "Investigating"
          ? [
              {
                at: new Date(Date.parse(detectedAt) + 25 * 60_000).toISOString(),
                by: n.analyst,
                from: "Investigating" as ThreatEventStatus,
                to: n.status,
                note:
                  n.status === "Contained"
                    ? "Recovery isolation engaged; affected workloads quarantined."
                    : n.status === "Resolved"
                      ? "Confirmed benign by tenant; closing detection."
                      : "False positive after cross-checking with change tickets.",
              },
            ]
          : []),
      ],
    });
  });
  // Pad with shorter info-level entries
  for (let i = THREAT_NARRATIVE.length; i < 25; i += 1) {
    const tenant = faker.helpers.arrayElement(tenants);
    const tpl = faker.helpers.arrayElement(THREAT_TEMPLATES.filter((t) => t.severity === "info"));
    const detectedAt = new Date(SECURITY_NOW - i * 35 * 60_000).toISOString();
    out.push({
      id: `thr_${i}`,
      tenantId: tenant.id,
      detectionType: tpl.type,
      severity: "info",
      status: "Resolved",
      detectedAt,
      analyst: faker.helpers.arrayElement(operators).name,
      detail: tpl.detail,
      history: [
        { at: detectedAt, by: "rsc-threat-engine", from: null, to: "Investigating", note: "Detection triggered by continuous scanning." },
        { at: new Date(Date.parse(detectedAt) + 12 * 60_000).toISOString(), by: faker.helpers.arrayElement(operators).name, from: "Investigating", to: "Resolved", note: "Confirmed benign." },
      ],
    });
  }
  return out;
}

const securityThreats = generateThreatDetections();

const rbacRoles: RbacRoleSummary[] = [
  { id: "msp_admin", name: "MSP Admin", userCount: 3, scope: "All tenants · All operations" },
  { id: "backup_operator", name: "Backup Operator", userCount: 8, scope: "Assigned tenants · Backup/Restore" },
  { id: "readonly_auditor", name: "Read-Only Auditor", userCount: 5, scope: "All tenants · Read only" },
  { id: "compliance_auditor", name: "Compliance Auditor", userCount: 2, scope: "Reports · Audit logs" },
  { id: "billing_manager", name: "Billing Manager", userCount: 2, scope: "Billing data · Invoices" },
];

const operatorAccess: OperatorAccessRow[] = [
  { operatorId: "op_1", operatorName: "Alex Morrison", initials: "AM", tenantsAssigned: 18, role: "Admin", mfaEnforced: true },
  { operatorId: "op_2", operatorName: "Priya Patel", initials: "PP", tenantsAssigned: 12, role: "Operator", mfaEnforced: true },
  { operatorId: "op_3", operatorName: "Marcus Chen", initials: "MC", tenantsAssigned: 9, role: "Operator", mfaEnforced: true },
  { operatorId: "op_4", operatorName: "Sofia Reyes", initials: "SR", tenantsAssigned: 15, role: "Auditor", mfaEnforced: true },
  { operatorId: "op_5", operatorName: "Daniel Okafor", initials: "DO", tenantsAssigned: 7, role: "Operator", mfaEnforced: true },
];

const accessRequests: AccessRequest[] = [
  {
    id: "req_1",
    requesterName: "Casey Park",
    requesterInitials: "CP",
    requestedRole: "Backup Operator",
    scope: "Mercy General Hospital",
    requestedAt: new Date(SECURITY_NOW - 4 * 60 * 60_000).toISOString(),
    justification: "Joining the healthcare delivery pod, need backup/restore on Mercy clinical workloads. Approved by Lisa Chen (manager).",
    status: "pending",
  },
  {
    id: "req_2",
    requesterName: "Jordan Reilly",
    requesterInitials: "JR",
    requestedRole: "Compliance Auditor",
    scope: "All tenants · Read only",
    requestedAt: new Date(SECURITY_NOW - 7 * 60 * 60_000).toISOString(),
    justification: "Quarterly SOC 2 audit prep. Requires read access to audit logs for all tenants for the next 30 days.",
    status: "pending",
  },
  {
    id: "req_3",
    requesterName: "Mira Okonkwo",
    requesterInitials: "MO",
    requestedRole: "Read-Only Auditor",
    scope: "Financial-tier tenants",
    requestedAt: new Date(SECURITY_NOW - 22 * 60 * 60_000).toISOString(),
    justification: "Internal audit covering financial-tier tenants for HIPAA and SOX compliance evidence collection.",
    status: "pending",
  },
];

const COMPLIANCE_DEFAULTS: Array<{ framework: string; full: string }> = [
  { framework: "HIPAA", full: "Health Insurance Portability and Accountability Act" },
  { framework: "SOC 2", full: "SOC 2 Type II Trust Services Criteria" },
  { framework: "ISO 27001", full: "ISO/IEC 27001:2022 Information Security" },
  { framework: "PCI-DSS", full: "Payment Card Industry Data Security Standard v4.0" },
  { framework: "GDPR", full: "General Data Protection Regulation" },
];

function generateCompliancePosture(): ComplianceFrameworkPosture[] {
  const findingsCells = matrixCells.filter((c) => c.status !== "pass");
  return COMPLIANCE_DEFAULTS.map((f) => {
    const total = tenants.length;
    const compliant =
      f.framework === "HIPAA"
        ? 56
        : f.framework === "SOC 2"
          ? 58
          : f.framework === "ISO 27001"
            ? 53
            : f.framework === "PCI-DSS"
              ? 47
              : 60;
    const findingsByTenant: Record<string, string[]> = {};
    findingsCells.slice(0, 14).forEach((c) => {
      const tenant = tenants.find((t) => t.id === c.tenantId);
      if (!tenant) return;
      const citations = c.violation?.frameworkCitations.filter((cit) => cit.framework.startsWith(f.framework));
      if (!citations || citations.length === 0) return;
      if (!findingsByTenant[tenant.id]) findingsByTenant[tenant.id] = [];
      citations.forEach((cit) => {
        findingsByTenant[tenant.id].push(`${cit.framework} ${cit.section} — ${cit.description}`);
      });
    });
    const findings = Object.entries(findingsByTenant).map(([tenantId, items]) => {
      const tenant = tenants.find((t) => t.id === tenantId);
      return { tenantId, tenantName: tenant?.name ?? tenantId, findings: items };
    });
    return {
      framework: f.framework,
      fullLabel: f.full,
      compliancePct: Math.round((compliant / total) * 1000) / 10,
      compliantCount: compliant,
      totalCount: total,
      findings,
    };
  });
}

const compliancePosture = generateCompliancePosture();

const securitySchedule: SecurityScheduleEntry[] = [
  { controlId: "network", label: "Network", frequencyHours: 4, lastRunAt: new Date(SECURITY_NOW - 2.5 * 60 * 60_000).toISOString(), nextRunAt: new Date(SECURITY_NOW + 1.5 * 60 * 60_000).toISOString() },
  { controlId: "storage", label: "Storage", frequencyHours: 6, lastRunAt: new Date(SECURITY_NOW - 4 * 60 * 60_000).toISOString(), nextRunAt: new Date(SECURITY_NOW + 2 * 60 * 60_000).toISOString() },
  { controlId: "iam", label: "IAM", frequencyHours: 4, lastRunAt: new Date(SECURITY_NOW - 0.5 * 60 * 60_000).toISOString(), nextRunAt: new Date(SECURITY_NOW + 3.5 * 60 * 60_000).toISOString() },
  { controlId: "encryption", label: "Encryption Key", frequencyHours: 24, lastRunAt: new Date(SECURITY_NOW - 14 * 60 * 60_000).toISOString(), nextRunAt: new Date(SECURITY_NOW + 6 * 60 * 60_000).toISOString() },
  { controlId: "namespace", label: "Namespace", frequencyHours: 12, lastRunAt: new Date(SECURITY_NOW - 6 * 60 * 60_000).toISOString(), nextRunAt: new Date(SECURITY_NOW + 6 * 60 * 60_000).toISOString() },
  { controlId: "full-sweep", label: "Full Sweep", frequencyHours: 24, lastRunAt: new Date(SECURITY_NOW - 4 * 60 * 60_000).toISOString(), nextRunAt: new Date(SECURITY_NOW + 18 * 60 * 60_000).toISOString() },
];

// ── Billing & capacity ───────────────────────────────────────────────────────

interface SeedBillingRow {
  name: string;
  industry: Industry;
  tier: Tier;
  committedTB: number;
  usedTB: number;
  overageTB: number;
  utilizationPct: number;
  ratePerTB: number;
  totalCharge: number;
  status: "Draft" | "Approved" | "Invoiced" | "Paid" | "Disputed";
}

const SEED_BILLING_ROWS: SeedBillingRow[] = [
  { name: "Harborview Medical Group", industry: "Aerospace", tier: "Gold", committedTB: 78, usedTB: 67, overageTB: 0, utilizationPct: 86, ratePerTB: 85, totalCharge: 5_695, status: "Draft" },
  { name: "Bridgewater Analytics", industry: "Education", tier: "Gold", committedTB: 71, usedTB: 68, overageTB: 0, utilizationPct: 96, ratePerTB: 85, totalCharge: 5_780, status: "Approved" },
  { name: "Ironclad Security Solutions", industry: "Retail", tier: "Gold", committedTB: 77, usedTB: 62, overageTB: 0, utilizationPct: 80, ratePerTB: 65, totalCharge: 4_030, status: "Approved" },
  { name: "Cascade Energy Partners", industry: "Hospitality", tier: "Gold", committedTB: 53, usedTB: 47, overageTB: 0, utilizationPct: 89, ratePerTB: 85, totalCharge: 3_995, status: "Draft" },
  { name: "Commonwealth Legal Services", industry: "Retail", tier: "Silver", committedTB: 46, usedTB: 58, overageTB: 12, utilizationPct: 126, ratePerTB: 65, totalCharge: 4_550, status: "Disputed" },
  { name: "Meridian Pharmaceuticals", industry: "Hospitality", tier: "Silver", committedTB: 69, usedTB: 39, overageTB: 0, utilizationPct: 57, ratePerTB: 50, totalCharge: 1_950, status: "Invoiced" },
  { name: "Lakewood Community Health", industry: "Education", tier: "Silver", committedTB: 59, usedTB: 65, overageTB: 6, utilizationPct: 110, ratePerTB: 50, totalCharge: 3_550, status: "Paid" },
  { name: "Vanguard Defense Systems", industry: "Telecommunications", tier: "Silver", committedTB: 69, usedTB: 44, overageTB: 0, utilizationPct: 64, ratePerTB: 45, totalCharge: 1_980, status: "Invoiced" },
  { name: "Sterling Aerospace", industry: "Legal", tier: "Bronze", committedTB: 67, usedTB: 67, overageTB: 0, utilizationPct: 100, ratePerTB: 45, totalCharge: 3_015, status: "Draft" },
  { name: "Mercy General Hospital", industry: "Logistics", tier: "Silver", committedTB: 45, usedTB: 32, overageTB: 0, utilizationPct: 71, ratePerTB: 50, totalCharge: 1_600, status: "Paid" },
  { name: "Nexus Biotech Labs", industry: "Logistics", tier: "Bronze", committedTB: 75, usedTB: 37, overageTB: 0, utilizationPct: 49, ratePerTB: 30, totalCharge: 1_110, status: "Paid" },
  { name: "Pinnacle Insurance Group", industry: "Technology", tier: "Gold", committedTB: 41, usedTB: 37, overageTB: 0, utilizationPct: 90, ratePerTB: 65, totalCharge: 2_405, status: "Approved" },
  { name: "Atlas Logistics Corp", industry: "Manufacturing", tier: "Silver", committedTB: 30, usedTB: 27, overageTB: 0, utilizationPct: 90, ratePerTB: 50, totalCharge: 1_350, status: "Approved" },
  { name: "Northbridge Capital", industry: "Education", tier: "Platinum", committedTB: 50, usedTB: 48, overageTB: 0, utilizationPct: 96, ratePerTB: 85, totalCharge: 4_080, status: "Approved" },
  { name: "Crawford & Associates LLP", industry: "Legal", tier: "Gold", committedTB: 22, usedTB: 19, overageTB: 0, utilizationPct: 86, ratePerTB: 85, totalCharge: 1_615, status: "Approved" },
  { name: "Hawthorne Manufacturing", industry: "Technology", tier: "Silver", committedTB: 80, usedTB: 39, overageTB: 0, utilizationPct: 49, ratePerTB: 50, totalCharge: 1_950, status: "Approved" },
  { name: "Summit Financial Group", industry: "Technology", tier: "Gold", committedTB: 70, usedTB: 23, overageTB: 0, utilizationPct: 33, ratePerTB: 85, totalCharge: 1_955, status: "Draft" },
  { name: "Sapphire Hotels International", industry: "Hospitality", tier: "Bronze", committedTB: 65, usedTB: 22, overageTB: 0, utilizationPct: 34, ratePerTB: 30, totalCharge: 660, status: "Invoiced" },
  { name: "Quantum Data Sciences", industry: "Technology", tier: "Platinum", committedTB: 22, usedTB: 12, overageTB: 0, utilizationPct: 55, ratePerTB: 85, totalCharge: 1_020, status: "Invoiced" },
  { name: "CrossPoint Engineering", industry: "Hospitality", tier: "Bronze", committedTB: 35, usedTB: 12, overageTB: 0, utilizationPct: 34, ratePerTB: 30, totalCharge: 360, status: "Paid" },
];

const WORKLOAD_BREAKDOWN_PRESETS: Array<Array<{ type: WorkloadType; pct: number }>> = [
  [
    { type: "VM", pct: 0.55 },
    { type: "Database", pct: 0.24 },
    { type: "FileShare", pct: 0.14 },
    { type: "M365", pct: 0.05 },
    { type: "Kubernetes", pct: 0.02 },
  ],
  [
    { type: "VM", pct: 0.42 },
    { type: "Database", pct: 0.28 },
    { type: "FileShare", pct: 0.16 },
    { type: "M365", pct: 0.08 },
    { type: "NAS", pct: 0.06 },
  ],
];

function buildLineItem(seed: SeedBillingRow): BillingLineItem {
  const tenant = tenants.find((t) => t.name === seed.name);
  const baseCharge = seed.usedTB * seed.ratePerTB - seed.overageTB * seed.ratePerTB;
  const overageCharge = seed.overageTB * seed.ratePerTB;

  const adjustments =
    seed.name === "Commonwealth Legal Services"
      ? [
          {
            id: "adj_commonwealth_sla",
            description: "SLA credit",
            amount: -420,
            reason: "Credit applied for SLA breach incident #INC-2026-03-218",
            appliedBy: "Lisa Chen",
            appliedAt: "2026-04-02T09:14:00Z",
          },
        ]
      : [];

  const dispute: BillingDispute | undefined =
    seed.status === "Disputed"
      ? {
          id: "DISPUTE-2026-04-007",
          filedAt: "2026-04-22T09:14:00Z",
          filedBy: "Casey Park",
          contactEmail: "casey.park@commonwealthlegal.com",
          status: "Awaiting Review",
          disputedAmount: 780,
          reason:
            "Overage charges were not communicated proactively. Per our service agreement section 4.2, MSP must notify tenant before allowing overage. We received no notification.",
          activity: [
            { at: "2026-04-22T09:14:00Z", by: "Casey Park", note: "Dispute filed by tenant billing contact." },
            { at: "2026-04-22T14:23:00Z", by: "Lisa Chen", note: "Acknowledged. Pulling notification logs." },
            { at: "2026-04-23T11:02:00Z", by: "Lisa Chen", note: "Notification logs retrieved. See evidence package." },
            { at: "2026-04-24T16:45:00Z", by: "Lisa Chen", note: "Awaiting tenant response with evidence package." },
          ],
          evidence: [
            {
              id: "ev-notif-2026-04-14",
              description: "Notification log Apr 14 — Email to billing@commonwealthlegal.com sent at threshold breach (delivery confirmed)",
            },
            {
              id: "ev-policy-onboard",
              description: "Tenant overage policy: Allow with notification (configured during onboarding, signed by Casey Park)",
            },
          ],
        }
      : undefined;

  const usedForBreakdown = seed.usedTB;
  const preset = WORKLOAD_BREAKDOWN_PRESETS[Math.abs(seed.name.length) % 2];
  const workloadBreakdown = preset.map((p) => ({
    type: p.type,
    consumedTB: Math.max(0.5, Number((usedForBreakdown * p.pct).toFixed(1))),
  }));
  const storageTierBreakdown = [
    { tier: "Performance" as const, consumedTB: Number((seed.usedTB * 0.2).toFixed(1)) },
    { tier: "Capacity" as const, consumedTB: Number((seed.usedTB * 0.65).toFixed(1)) },
    { tier: "Archive" as const, consumedTB: Number((seed.usedTB * 0.15).toFixed(1)) },
  ];

  const taxNote =
    seed.industry === "Healthcare" || seed.name.toLowerCase().includes("hospital") || seed.name.toLowerCase().includes("medical")
      ? "Tax exempt: Healthcare entity, valid exemption certificate on file"
      : "Subject to applicable sales tax (calculated at invoice generation)";

  const isReseller = seed.name === "Crawford & Associates LLP" || seed.name === "Commonwealth Legal Services";
  const resellerCommissionPct = isReseller ? 15 : undefined;

  return {
    id: `bli_${seed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-2026-04`,
    tenantId: tenant?.id ?? `t_unknown_${seed.name}`,
    tenantName: seed.name,
    industry: seed.industry,
    tier: seed.tier,
    resellerId: isReseller ? "rsl_apex" : undefined,
    committedTB: seed.committedTB,
    usedTB: seed.usedTB,
    overageTB: seed.overageTB,
    utilizationPct: seed.utilizationPct,
    ratePerTB: seed.ratePerTB,
    baseCharge,
    overageCharge,
    adjustments,
    resellerCommissionPct,
    totalCharge: seed.totalCharge,
    status: seed.status,
    invoiceId: seed.status === "Invoiced" || seed.status === "Paid" ? `INV-2026-03-${String(Math.abs(seed.name.length) % 100).padStart(3, "0")}` : undefined,
    invoicedAt: seed.status === "Invoiced" || seed.status === "Paid" ? "2026-04-02T09:00:00Z" : undefined,
    paidAt: seed.status === "Paid" ? "2026-04-08T15:24:00Z" : undefined,
    dispute,
    workloadBreakdown,
    storageTierBreakdown,
    metrics: {
      totalRestorePoints: 1_400 + Math.abs(seed.usedTB * 47) | 0,
      transferOutTB: Number((seed.usedTB * 0.03 + 0.5).toFixed(1)),
      backupJobsExecuted: 600 + (seed.usedTB * 16) | 0,
    },
    taxNote,
  };
}

const billingLineItems: BillingLineItem[] = SEED_BILLING_ROWS.map(buildLineItem);

const billingPeriod: BillingPeriod = {
  periodStart: "2026-04-01T00:00:00Z",
  periodEnd: "2026-04-30T23:59:59Z",
  label: "April 2026",
  status: "open",
  reconciledAt: new Date(Date.parse("2026-04-25T18:00:00Z") - 4 * 60 * 60_000).toISOString(),
};

const quotaEnforcement: QuotaEnforcementRow[] = [
  {
    id: "qer_lakewood",
    tenantId: tenants.find((t) => t.name === "Lakewood Community Health")?.id ?? "",
    tenantName: "Lakewood Community Health",
    quotaType: "Storage",
    currentUsage: "65 TB",
    softLimit: "47 TB",
    hardLimit: "59 TB",
    hardLimitBehavior: "Notify",
    status: "Hard Breach",
    detail: "HARD BREACH +6 TB · notification sent",
  },
  {
    id: "qer_commonwealth",
    tenantId: tenants.find((t) => t.name === "Commonwealth Legal Services")?.id ?? "",
    tenantName: "Commonwealth Legal Services",
    quotaType: "Storage",
    currentUsage: "58 TB",
    softLimit: "37 TB",
    hardLimit: "46 TB",
    hardLimitBehavior: "Notify",
    status: "Hard Breach",
    detail: "HARD BREACH +12 TB · dispute filed",
  },
  {
    id: "qer_sterling",
    tenantId: tenants.find((t) => t.name === "Sterling Aerospace")?.id ?? "",
    tenantName: "Sterling Aerospace",
    quotaType: "Storage",
    currentUsage: "67 TB",
    softLimit: "54 TB",
    hardLimit: "67 TB",
    hardLimitBehavior: "Block",
    status: "Hard Breach",
    detail: "HARD BREACH AT LIMIT · backups blocked",
  },
  {
    id: "qer_pinnacle",
    tenantId: tenants.find((t) => t.name === "Pinnacle Insurance Group")?.id ?? "",
    tenantName: "Pinnacle Insurance Group",
    quotaType: "Storage",
    currentUsage: "37 TB",
    softLimit: "33 TB",
    hardLimit: "41 TB",
    hardLimitBehavior: "Notify",
    status: "Approaching Soft",
    detail: "Approaching soft limit",
  },
  {
    id: "qer_sapphire",
    tenantId: tenants.find((t) => t.name === "Sapphire Hotels International")?.id ?? "",
    tenantName: "Sapphire Hotels International",
    quotaType: "Workload Count",
    currentUsage: "178 / 200",
    softLimit: "160",
    hardLimit: "200",
    hardLimitBehavior: "Block",
    status: "Approaching Hard",
    detail: "Approaching hard limit · plan tier upgrade",
  },
];

// 12-month historical billing per tenant for trend chart
function buildBillingHistory(): Record<string, Array<{ month: string; total: number }>> {
  const out: Record<string, Array<{ month: string; total: number }>> = {};
  for (const li of billingLineItems) {
    const months: Array<{ month: string; total: number }> = [];
    for (let i = 11; i >= 1; i -= 1) {
      const d = new Date(Date.UTC(2026, 4 - i, 1));
      const drift = (12 - i) * 0.04;
      const noise = ((Math.abs(li.tenantName.length) % 7) - 3) * 0.015;
      const factor = Math.max(0.3, 1 - drift + noise);
      months.push({
        month: d.toISOString(),
        total: Math.round(li.totalCharge * factor),
      });
    }
    months.push({ month: "2026-04-01T00:00:00Z", total: li.totalCharge });
    out[li.tenantId] = months;
  }
  return out;
}

const billingHistory = buildBillingHistory();

// ── Directory saved views ────────────────────────────────────────────────────

const directorySavedViews: DirectorySavedView[] = [
  {
    id: "view_all",
    name: "All Tenants",
    pinned: true,
    visibility: "team",
    filters: {},
    isSystem: true,
  },
  {
    id: "view_active",
    name: "Active",
    pinned: true,
    visibility: "team",
    filters: { status: ["Active"] },
    isSystem: true,
  },
  {
    id: "view_at_risk",
    name: "At Risk",
    pinned: true,
    visibility: "team",
    filters: { slaStatus: ["At Risk", "Breached"], capacityStatus: ["Approaching Limit", "Over Commit"] },
    sortKey: "securityScore",
    sortDir: "asc",
    isSystem: true,
  },
  {
    id: "view_renewal",
    name: "Up for Renewal",
    pinned: true,
    visibility: "team",
    filters: { tags: ["renewal-q2", "renewal-q3"] },
    isSystem: true,
  },
  {
    id: "view_onboarding",
    name: "Onboarding",
    pinned: true,
    visibility: "team",
    filters: { status: ["Onboarding"] },
    isSystem: true,
  },
  {
    id: "view_healthcare",
    name: "Healthcare",
    pinned: true,
    visibility: "team",
    filters: { industry: ["Healthcare"] },
    isSystem: true,
  },
  {
    id: "view_financial",
    name: "Financial Services",
    pinned: true,
    visibility: "team",
    filters: { industry: ["Financial"] },
    isSystem: true,
  },
];

export const mockData = {
  tenants,
  policies,
  alerts,
  backupJobs,
  auditEvents,
  invoices,
  isolationChecks,
  isolationViolations,
  clusters,
  operators,
  tenantDetails,
  resellers,
  drafts: seedDrafts,
  validationWindow: seedValidationWindow,
  completedOnboardings: seedCompleted,
  matrixCells,
  securityThreats,
  rbacRoles,
  operatorAccess,
  accessRequests,
  compliancePosture,
  securitySchedule,
  billingLineItems,
  billingPeriod,
  quotaEnforcement,
  billingHistory,
  directorySavedViews,
  tenantTagCatalog: TENANT_TAG_CATALOG,
};

export const currentOperator: Operator = operators[0];
