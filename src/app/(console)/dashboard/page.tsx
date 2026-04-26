"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { PageHeader } from "@/components/data/page-header";
import { Button } from "@/components/ui/button";
import { KpiCard, type KpiCardProps } from "@/components/data/kpi-card";
import { TenantHealthDonut } from "@/components/charts/tenant-health-donut";
import { TopAlertsList } from "@/components/dashboard/top-alerts-list";
import { BackupJobsArea } from "@/components/charts/backup-jobs-area";
import { TopTenantsBar } from "@/components/charts/top-tenants-bar";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import {
  DateRangePills,
  type DateRange,
} from "@/components/dashboard/date-range-pills";
import { useConsoleStore } from "@/lib/store";
import { formatPercent, formatTB } from "@/lib/formatters";
import type { Alert } from "@/types";

const RANGE_MULTIPLIER: Record<DateRange, number> = {
  "7d": 1,
  "30d": 1.18,
  "90d": 1.36,
};

const RANGE_DELTA_MULTIPLIER: Record<DateRange, number> = {
  "7d": 1,
  "30d": 1.4,
  "90d": 2.05,
};

function curve(seed: number, length: number, base: number, amp: number) {
  return Array.from({ length }).map((_, i) => {
    const angle = (i / length) * Math.PI * 2 + seed;
    return base + Math.sin(angle) * amp + Math.cos(angle * 0.5 + seed) * amp * 0.4;
  });
}

// Stable demo reference — keeps SSR and client render in agreement and frees us
// from Date.now() during render (which would trigger a hydration mismatch).
const DEMO_NOW = Date.parse("2026-04-26T18:00:00Z");

interface FeaturedAlertSpec {
  title: string;
  severity: Alert["severity"];
  tenant: string;
  category: Alert["category"];
  description: string;
  relativeLabel: string;
  daysAgo: number;
}

const FEATURED_ALERTS: FeaturedAlertSpec[] = [
  {
    title: "Storage Capacity Critical",
    severity: "critical",
    tenant: "CrossPoint Engineering",
    category: "Capacity",
    description:
      "Tenant has consumed 102% of committed capacity. Overage tier engaged. Tier upgrade recommended.",
    relativeLabel: "14 days ago",
    daysAgo: 14,
  },
  {
    title: "Ransomware Activity Detected",
    severity: "critical",
    tenant: "Hawthorne Manufacturing",
    category: "Threat",
    description:
      "12.4% of files in /finance-share show ransomware-pattern entropy in the last 30 minutes.",
    relativeLabel: "14 days ago",
    daysAgo: 14,
  },
  {
    title: "SLA Breach Detected",
    severity: "warning",
    tenant: "Meridian Pharmaceuticals",
    category: "Compliance",
    description:
      "Backup window exceeded 4h SLA on the regulated workload class. Three jobs missed in the last 24h.",
    relativeLabel: "15 days ago",
    daysAgo: 15,
  },
  {
    title: "Ransomware Activity Detected",
    severity: "critical",
    tenant: "Quantum Data Sciences",
    category: "Threat",
    description:
      "Anomalous file modification rate detected on tenant namespace. Recovery isolation engaged.",
    relativeLabel: "15 days ago",
    daysAgo: 15,
  },
  {
    title: "SLA Breach Detected",
    severity: "warning",
    tenant: "Sunrise Senior Care",
    category: "Compliance",
    description:
      "Tenant SLA dropped below 96% threshold for the second consecutive day. Investigate scheduled jobs.",
    relativeLabel: "15 days ago",
    daysAgo: 15,
  },
];

export default function DashboardPage() {
  const tenants = useConsoleStore((s) => s.tenants);
  const auditEvents = useConsoleStore((s) => s.auditEvents);

  const [range, setRange] = useState<DateRange>("7d");

  const dashboardData = useMemo(() => {
    const mult = RANGE_MULTIPLIER[range];
    const deltaMult = RANGE_DELTA_MULTIPLIER[range];

    const protectedTotalTB = tenants.reduce((s, t) => s + t.capacityUsedTB, 0);
    const allocatedTotalTB = tenants.reduce(
      (s, t) => s + t.capacityCommittedTB,
      0,
    );

    const kpis: KpiCardProps[] = [
      {
        index: 0,
        label: "Total Tenants",
        value: tenants.length.toString(),
        delta: `+${Math.round(3 * deltaMult)} vs prior`,
        deltaTone: "positive",
        deltaDirection: "up",
        sparkline: curve(0.3, 12, 60, 1.6).map((v, i) => v + i * 0.16),
        href: "/tenants",
      },
      {
        index: 1,
        label: "Active Alerts",
        value: Math.round(81 * (range === "7d" ? 1 : range === "30d" ? 1.16 : 1.32)).toString(),
        delta: `+${Math.round(18 * deltaMult)} critical`,
        deltaTone: "negative",
        deltaDirection: "up",
        sparkline: curve(1.1, 12, 60, 12).map((v, i) => v + i * 0.6),
        href: "/security",
      },
      {
        index: 2,
        label: "Backup Success",
        value: formatPercent(94.2),
        delta: `+${(1.2 * deltaMult).toFixed(1)}% vs prior`,
        deltaTone: "positive",
        deltaDirection: "up",
        sparkline: curve(2.4, 12, 95, 0.8),
        href: "/tenants",
      },
      {
        index: 3,
        label: "Protected Capacity",
        value: `${(2.0 * mult).toFixed(1)} PB`,
        delta: `+${Math.round(12 * deltaMult)} TB`,
        deltaTone: "positive",
        deltaDirection: "up",
        sparkline: curve(3.2, 12, 1900, 22).map((v, i) => v + i * 4 * mult),
        href: "/capacity",
      },
      {
        index: 4,
        label: "SLA Compliance",
        value: formatPercent(96.8),
        delta: `-${(0.4 * deltaMult).toFixed(1)}% vs prior`,
        deltaTone: "negative",
        deltaDirection: "down",
        sparkline: curve(4.1, 12, 97, 0.6).map((v, i) => v - i * 0.04),
        href: "/security",
      },
      {
        index: 5,
        label: "Open Incidents",
        value: Math.round(18 * (range === "7d" ? 1 : range === "30d" ? 1.22 : 1.55)).toString(),
        delta: `-${Math.max(2, Math.round(2 * deltaMult))} vs prior`,
        deltaTone: "positive",
        deltaDirection: "down",
        sparkline: curve(5.7, 12, 22, 4).map((v, i) => v - i * 0.4),
        href: "/security",
      },
    ];

    // Demo-narrative status distribution — 56/2/0/4 totals 62, matching the strategy doc.
    const donut = [
      {
        status: "Active" as const,
        value: 56,
        color: "var(--brand-primary)",
        href: "/tenants?status=Active",
      },
      {
        status: "Onboarding" as const,
        value: 2,
        color: "var(--status-info)",
        href: "/tenants?status=Onboarding",
      },
      {
        status: "Suspended" as const,
        value: 0,
        color: "var(--text-tertiary)",
        href: "/tenants?status=Suspended",
      },
      {
        status: "Churned" as const,
        value: 4,
        color: "var(--status-critical)",
        href: "/tenants?status=Churned",
      },
    ];

    const featuredAlertRows = FEATURED_ALERTS.map((spec, i) => {
      const tenant = tenants.find((t) => t.name === spec.tenant) ?? null;
      const id = `dash_alert_${i}`;
      const createdAt = new Date(
        DEMO_NOW - spec.daysAgo * 24 * 60 * 60 * 1000,
      ).toISOString();
      return {
        title: spec.title,
        relativeLabel: spec.relativeLabel,
        tenant,
        alert: {
          id,
          tenantId: tenant?.id ?? "",
          severity: spec.severity,
          status: "open" as const,
          title: spec.title,
          description: spec.description,
          category: spec.category,
          createdAt,
        } satisfies Alert,
      };
    });

    const hourBuckets = Array.from({ length: 24 }).map((_, hour) => {
      const base = 32 + Math.sin((hour / 24) * Math.PI * 2) * 14;
      const peak = hour > 1 && hour < 6 ? 22 : hour > 19 ? 18 : 0;
      const succeeded = Math.max(8, Math.round((base + peak) * mult));
      const running = Math.max(1, Math.round(((base * 0.18) + (hour % 4 === 0 ? 4 : 0)) * mult));
      const failed = Math.max(0, Math.round(((hour === 9 || hour === 17 ? 4 : 1) + (hour % 7 === 0 ? 3 : 0)) * mult));
      return {
        hour: `${hour.toString().padStart(2, "0")}:00`,
        succeeded,
        running,
        failed,
      };
    });

    const topTenants = [...tenants]
      .sort((a, b) => b.capacityUsedTB - a.capacityUsedTB)
      .slice(0, 10)
      .map((t) => ({
        tenantId: t.id,
        name: t.name,
        protected: Number((t.capacityUsedTB * mult).toFixed(1)),
        allocated: Number((t.capacityCommittedTB * mult).toFixed(1)),
      }));

    const recentActivity = auditEvents.slice(0, 8);

    return {
      kpis,
      donut,
      featuredAlertRows,
      hourBuckets,
      topTenants,
      recentActivity,
      protectedTotalTB,
      allocatedTotalTB,
    };
  }, [tenants, auditEvents, range]);

  const onExport = () => {
    const filename = `platform-overview-${format(new Date(), "yyyy-MM-dd")}.pdf`;
    const tid = toast.loading("Generating report…", {
      description: "Compiling KPIs, alerts, and capacity for the selected range.",
    });
    setTimeout(() => {
      toast.success("Report ready", {
        id: tid,
        description: `Downloaded as ${filename}`,
      });
    }, 1100);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Platform Overview"
        description={`Real-time view across ${tenants.length} tenants`}
        actions={
          <div className="flex items-center gap-3">
            <DateRangePills value={range} onChange={setRange} />
            <Button
              variant="outline"
              onClick={onExport}
              className="gap-2 border-border-default text-text-primary hover:bg-secondary"
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {dashboardData.kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Panel className="lg:col-span-3">
          <PanelHeader
            title="Tenant Health"
            subtitle={`${formatTB(dashboardData.protectedTotalTB)} protected of ${formatTB(
              dashboardData.allocatedTotalTB,
            )} committed`}
          />
          <div className="px-5 pb-5">
            <TenantHealthDonut data={dashboardData.donut} />
          </div>
        </Panel>
        <Panel className="lg:col-span-2 overflow-hidden">
          <TopAlertsList rows={dashboardData.featuredAlertRows} />
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          title="Backup Jobs"
          subtitle={`Last 24 hours · ${dashboardData.hourBuckets.reduce(
            (s, b) => s + b.succeeded + b.running + b.failed,
            0,
          )} jobs across the fleet`}
        />
        <div className="px-5 pb-5">
          <BackupJobsArea data={dashboardData.hourBuckets} />
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Top 10 Tenants by Protected Capacity"
            subtitle="Click a tenant to drill in"
          />
          <div className="px-5 pb-5">
            <TopTenantsBar data={dashboardData.topTenants} />
          </div>
        </Panel>
        <Panel className="overflow-hidden">
          <RecentActivity events={dashboardData.recentActivity} />
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={
        "rounded-lg border border-border-subtle bg-surface shadow-card " + (className ?? "")
      }
    >
      {children}
    </section>
  );
}

function PanelHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[14px] font-semibold text-text-primary">{title}</h2>
        {subtitle ? (
          <p className="text-[12px] text-text-secondary">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
