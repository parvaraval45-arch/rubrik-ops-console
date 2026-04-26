"use client";

import { ArrowUpRight } from "lucide-react";
import { Sparkline } from "@/components/data/sparkline";
import { formatCurrency, formatNumber, formatTB } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { BillingLineItem } from "@/types";

interface BillingKpisProps {
  lineItems: BillingLineItem[];
  onClick?: (target: "mrr" | "overage" | "underutilized" | "disputed") => void;
}

export function BillingKpis({ lineItems, onClick }: BillingKpisProps) {
  const totalUsed = lineItems.reduce((s, li) => s + li.usedTB, 0);
  const totalCharge = lineItems.reduce((s, li) => s + li.totalCharge, 0);
  const overageTenants = lineItems.filter((li) => li.overageTB > 0);
  const overageDollars = overageTenants.reduce((s, li) => s + li.overageCharge, 0);
  const underUtilized = lineItems.filter(
    (li) => li.committedTB > 0 && li.usedTB / li.committedTB < 0.5,
  );
  const disputed = lineItems.filter((li) => li.status === "Disputed");

  const trendSparkline = Array.from({ length: 12 }).map((_, i) => 580 + i * 14 + (i % 3) * 6);
  const mrrSparkline = Array.from({ length: 12 }).map((_, i) => 38000 + i * 1100 + (i % 4) * 320);

  const kpis = [
    {
      key: "billable",
      label: "Total Billable TB",
      value: formatTB(totalUsed),
      subtitle: `Across ${lineItems.length} active billing tenants`,
      trend: "+47 TB vs last month",
      trendTone: "positive" as const,
      sparkline: trendSparkline,
    },
    {
      key: "mrr",
      label: "MRR",
      value: formatCurrency(totalCharge),
      subtitle: "Net of reseller commissions",
      trend: "+$3,847 vs last month",
      trendTone: "positive" as const,
      sparkline: mrrSparkline,
      onClick: () => onClick?.("mrr"),
    },
    {
      key: "overage",
      label: "Over Commit",
      value: `${overageTenants.length} ${overageTenants.length === 1 ? "tenant" : "tenants"}`,
      valueTone: "critical" as const,
      subtitle: "Generating overage charges",
      subtitle2: `${formatCurrency(overageDollars)} in overage this period`,
      onClick: () => onClick?.("overage"),
    },
    {
      key: "underutilized",
      label: "Under-Utilized",
      value: `${underUtilized.length} ${underUtilized.length === 1 ? "tenant" : "tenants"}`,
      subtitle: "Below 50% commit utilization",
      subtitle2: "Candidates for tier downgrade at QBR",
      onClick: () => onClick?.("underutilized"),
    },
    {
      key: "disputed",
      label: "Disputed Items",
      value: disputed.length.toString(),
      valueTone: disputed.length > 0 ? ("warning" as const) : undefined,
      subtitle: "Awaiting review",
      subtitle2: disputed.length > 0 ? "Oldest: 3 days" : "No active disputes",
      onClick: () => onClick?.("disputed"),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {kpis.map((k) => (
        <button
          type="button"
          key={k.key}
          onClick={k.onClick}
          className={cn(
            "group flex flex-col gap-2 rounded-lg border border-border-subtle bg-surface p-4 text-left shadow-card transition-shadow",
            k.onClick ? "cursor-pointer hover:shadow-md" : "cursor-default",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
              {k.label}
            </span>
            {k.onClick ? (
              <ArrowUpRight className="h-3.5 w-3.5 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100" />
            ) : null}
          </div>
          <div className="flex items-end justify-between gap-2">
            <span
              className={cn(
                "text-[24px] font-semibold leading-none tabular-nums",
                k.valueTone === "critical" && "text-status-critical",
                k.valueTone === "warning" && "text-status-warning",
                !k.valueTone && "text-text-primary",
              )}
            >
              {k.value}
            </span>
            {k.sparkline ? (
              <Sparkline values={k.sparkline} width={56} height={28} stroke="var(--brand-primary)" />
            ) : null}
          </div>
          {k.subtitle ? (
            <span className="text-[11.5px] text-text-secondary">{k.subtitle}</span>
          ) : null}
          {k.subtitle2 ? (
            <span className="text-[11.5px] text-text-tertiary tabular-nums">{k.subtitle2}</span>
          ) : null}
          {k.trend ? (
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-status-success-subtle px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-status-success">
              <ArrowUpRight className="h-3 w-3" />
              {k.trend}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function billingTotals(lineItems: BillingLineItem[]) {
  return {
    totalUsed: lineItems.reduce((s, li) => s + li.usedTB, 0),
    totalCharge: lineItems.reduce((s, li) => s + li.totalCharge, 0),
    overageCount: lineItems.filter((li) => li.overageTB > 0).length,
    overageDollars: lineItems.reduce((s, li) => s + li.overageCharge, 0),
    underutilizedCount: lineItems.filter(
      (li) => li.committedTB > 0 && li.usedTB / li.committedTB < 0.5,
    ).length,
    disputedCount: lineItems.filter((li) => li.status === "Disputed").length,
  };
}

void formatNumber;
