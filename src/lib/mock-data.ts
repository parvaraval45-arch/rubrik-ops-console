import { faker } from "@faker-js/faker";
import type {
  Alarm,
  AlarmCategory,
  Alert,
  AlertSeverity,
  AuditEvent,
  BackupJob,
  Cluster,
  CompletedOnboarding,
  DetailedAuditEvent,
  Industry,
  Invoice,
  InvoiceLineItem,
  IsolationCheck,
  IsolationCheckId,
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
  Policy,
  PolicyAssignment,
  PolicyAssignmentEvent,
  PolicyKind,
  PolicyOverride,
  PolicyVersion,
  QuotaUsage,
  Region,
  ResellerEntity,
  RestorePoint,
  Tenant,
  TenantStatus,
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
};

export const currentOperator: Operator = operators[0];
