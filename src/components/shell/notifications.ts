import type { Alert, AlertSeverity } from "@/types";
import { mockData } from "@/lib/mock-data";

export interface Notification {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  source: string;
  sourceHref: string;
  occurredAt: string;
  category: Alert["category"];
  read: boolean;
  mention: boolean;
}

const NOTIFICATION_DATE_REF = Date.parse("2026-04-27T11:00:00Z");

function relIso(hoursAgo: number): string {
  return new Date(NOTIFICATION_DATE_REF - hoursAgo * 60 * 60 * 1000).toISOString();
}

interface SeedSpec {
  severity: AlertSeverity;
  title: string;
  description: string;
  category: Alert["category"];
  tenant: string;
  hoursAgo: number;
  read: boolean;
  mention: boolean;
}

const SEED: SeedSpec[] = [
  {
    severity: "critical",
    title: "Storage capacity at 102%",
    description: "CrossPoint Engineering exceeded committed capacity. Overage tier engaged.",
    category: "Capacity",
    tenant: "CrossPoint Engineering",
    hoursAgo: 0.4,
    read: false,
    mention: false,
  },
  {
    severity: "critical",
    title: "Ransomware-pattern entropy detected",
    description: "12.4% of files in /finance-share show anomalous encryption rate in last 30 minutes.",
    category: "Threat",
    tenant: "Hawthorne Manufacturing",
    hoursAgo: 1.2,
    read: false,
    mention: true,
  },
  {
    severity: "critical",
    title: "Immutability lock disabled by operator",
    description: "Marcus Chen toggled off compliance lock on workload sox-prod. Investigate.",
    category: "Compliance",
    tenant: "Summit Financial Group",
    hoursAgo: 2.5,
    read: false,
    mention: false,
  },
  {
    severity: "warning",
    title: "@Alex Morrison mentioned you in audit review",
    description: "Need second-pair eyes on the policy override for Sterling Aerospace.",
    category: "Compliance",
    tenant: "Sterling Aerospace",
    hoursAgo: 3.1,
    read: false,
    mention: true,
  },
  {
    severity: "warning",
    title: "Backup window slipped 18 minutes",
    description: "VMware/finance-app exceeded 4h SLA. Next run rescheduled.",
    category: "Backup Failure",
    tenant: "Meridian Pharmaceuticals",
    hoursAgo: 4.5,
    read: false,
    mention: false,
  },
  {
    severity: "warning",
    title: "Policy drift detected",
    description: "Replication target manually changed on EU Data Residency v6 baseline.",
    category: "Policy Drift",
    tenant: "Northbridge Capital",
    hoursAgo: 5.8,
    read: true,
    mention: false,
  },
  {
    severity: "info",
    title: "Quarterly attestation expires in 14 days",
    description: "HIPAA attestation for healthcare tenants needs regeneration.",
    category: "Compliance",
    tenant: "Mercy General Hospital",
    hoursAgo: 8,
    read: true,
    mention: false,
  },
  {
    severity: "info",
    title: "Cold-tier archival recommendation",
    description: "1.4 TB of snapshots older than 270 days are eligible for archival.",
    category: "Capacity",
    tenant: "Pacific Coast Medical Center",
    hoursAgo: 12,
    read: true,
    mention: false,
  },
  {
    severity: "info",
    title: "Key rotation scheduled in 7 days",
    description: "kms-2026-Q1 reaches scheduled rotation window.",
    category: "Configuration",
    tenant: "Vanguard Defense Systems",
    hoursAgo: 18,
    read: true,
    mention: false,
  },
  {
    severity: "info",
    title: "@Alex Morrison: rollout v7 promoted",
    description: "Financial SOX Standard v7 promoted to staged phase.",
    category: "Configuration",
    tenant: "Cornerstone Federal Bank",
    hoursAgo: 22,
    read: true,
    mention: true,
  },
  {
    severity: "warning",
    title: "Anomalous download volume",
    description: "svc-account/etl-runner downloaded 42x baseline over 1h window.",
    category: "Threat",
    tenant: "Bridgewater Analytics",
    hoursAgo: 26,
    read: true,
    mention: false,
  },
  {
    severity: "info",
    title: "Tenant onboarded successfully",
    description: "Lighthouse Pediatrics deployed and entered 7-day validation window.",
    category: "Configuration",
    tenant: "Lighthouse Pediatrics",
    hoursAgo: 30,
    read: true,
    mention: false,
  },
];

function tabFor(category: Alert["category"]): string {
  switch (category) {
    case "Backup Failure":
      return "jobs";
    case "Capacity":
      return "capacity";
    case "Threat":
      return "security";
    case "Compliance":
    case "Policy Drift":
      return "policies";
    default:
      return "alarms";
  }
}

let _cache: Notification[] | null = null;

export function getNotifications(): Notification[] {
  if (_cache) return _cache;
  const tenants = mockData.tenants;
  _cache = SEED.map((spec, i) => {
    const tenant = tenants.find((t) => t.name === spec.tenant);
    return {
      id: `notif_${i.toString().padStart(3, "0")}`,
      severity: spec.severity,
      title: spec.title,
      description: spec.description,
      source: spec.tenant,
      sourceHref: tenant
        ? `/tenants/${tenant.id}?tab=${tabFor(spec.category)}`
        : "/tenants",
      occurredAt: relIso(spec.hoursAgo),
      category: spec.category,
      read: spec.read,
      mention: spec.mention,
    };
  });
  return _cache;
}
