import { faker } from "@faker-js/faker";
import type {
  Alert,
  AlertSeverity,
  AuditEvent,
  BackupJob,
  Cluster,
  Industry,
  Invoice,
  InvoiceLineItem,
  IsolationCheck,
  IsolationCheckId,
  IsolationStatus,
  IsolationViolation,
  Operator,
  Policy,
  PolicyKind,
  PolicyVersion,
  Region,
  Tenant,
  Tier,
  TenantStatus,
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
  { id: "cls_us_east_1", name: "rbk-prod-use1", region: "us-east-1", capacityTB: 4800, usedTB: 0, tenantCount: 0, status: "healthy" },
  { id: "cls_us_west_2", name: "rbk-prod-usw2", region: "us-west-2", capacityTB: 3600, usedTB: 0, tenantCount: 0, status: "healthy" },
  { id: "cls_eu_west_1", name: "rbk-prod-euw1", region: "eu-west-1", capacityTB: 2400, usedTB: 0, tenantCount: 0, status: "healthy" },
  { id: "cls_ap_south_1", name: "rbk-prod-aps1", region: "ap-south-1", capacityTB: 1800, usedTB: 0, tenantCount: 0, status: "degraded" },
  { id: "cls_eu_west_1_b", name: "rbk-prod-euw1-b", region: "eu-west-1", capacityTB: 2400, usedTB: 0, tenantCount: 0, status: "healthy" },
];

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
};

export const currentOperator: Operator = operators[0];
