"use client";

import { useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileDown,
  Flag,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { VisuallyHidden } from "radix-ui";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartFrame } from "@/components/charts/chart-frame";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { useConsoleStore } from "@/lib/store";
import { currentOperator } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { BillingDispute, BillingLineItem } from "@/types";

interface TenantBillingSheetProps {
  lineItem: BillingLineItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_PILL = {
  Draft: "bg-secondary text-text-secondary",
  Approved: "bg-status-info-subtle text-status-info",
  Invoiced: "bg-status-warning-subtle text-status-warning",
  Paid: "bg-status-success-subtle text-status-success",
  Disputed: "bg-status-critical-subtle text-status-critical",
};

export function TenantBillingSheet({
  lineItem,
  open,
  onOpenChange,
}: TenantBillingSheetProps) {
  const approveLineItems = useConsoleStore((s) => s.approveLineItems);
  const billingHistoryMap = useConsoleStore((s) => s.billingHistory);
  const history = lineItem ? billingHistoryMap[lineItem.tenantId] ?? [] : [];
  const [tab, setTab] = useState<"line-items" | "daily" | "trend" | "disputes">("line-items");

  if (!lineItem) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full p-0 sm:max-w-[580px]">
          <VisuallyHidden.Root>
            <SheetTitle>Tenant billing detail</SheetTitle>
          </VisuallyHidden.Root>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden p-0 sm:max-w-[580px]"
      >
        <SheetHeader className="border-b border-border-subtle p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <Badge
                variant="outline"
                className={cn(
                  "w-fit border-transparent text-[10.5px] uppercase tracking-wide",
                  STATUS_PILL[lineItem.status],
                )}
              >
                {lineItem.status}
              </Badge>
              <SheetTitle className="text-[16px] font-semibold text-text-primary">
                <Link
                  href={`/tenants/${lineItem.tenantId}?tab=capacity`}
                  className="underline-offset-2 hover:text-brand-primary-hover hover:underline"
                >
                  {lineItem.tenantName}
                </Link>
              </SheetTitle>
              <SheetDescription className="text-[12px] text-text-tertiary">
                Period: April 2026 · Total {formatCurrency(lineItem.totalCharge)}
              </SheetDescription>
              <Link
                href={`/tenants/${lineItem.tenantId}?tab=capacity`}
                className="mt-1 inline-flex w-fit items-center gap-1 text-[11.5px] font-medium text-brand-primary-hover underline-offset-2 hover:underline"
              >
                View tenant
                <span aria-hidden>&rarr;</span>
              </Link>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-secondary hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </SheetHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="mx-6 mt-3 w-fit bg-canvas">
            <TabsTrigger value="line-items">Line Items</TabsTrigger>
            <TabsTrigger value="daily">Daily Usage</TabsTrigger>
            <TabsTrigger value="trend">12-Month Trend</TabsTrigger>
            <TabsTrigger value="disputes">
              Disputes
              {lineItem.dispute ? (
                <Badge
                  variant="outline"
                  className="ml-1.5 border-transparent bg-status-critical-subtle text-[9.5px] text-status-critical"
                >
                  1
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="line-items" className="flex-1 overflow-y-auto p-6 pt-3">
            <LineItemsTab lineItem={lineItem} onApprove={() => approveLineItems([lineItem.id], currentOperator.name, "Approved from tenant detail.")} />
          </TabsContent>
          <TabsContent value="daily" className="flex-1 overflow-y-auto p-6 pt-3">
            <DailyUsageTab lineItem={lineItem} />
          </TabsContent>
          <TabsContent value="trend" className="flex-1 overflow-y-auto p-6 pt-3">
            <TrendTab lineItem={lineItem} history={history ?? []} />
          </TabsContent>
          <TabsContent value="disputes" className="flex-1 overflow-y-auto p-6 pt-3">
            <DisputesTab lineItem={lineItem} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function LineItemsTab({
  lineItem,
  onApprove,
}: {
  lineItem: BillingLineItem;
  onApprove: () => void;
}) {
  const adjustmentTotal = lineItem.adjustments.reduce((s, a) => s + a.amount, 0);
  const commissionAmount = lineItem.resellerCommissionPct
    ? Math.round(lineItem.totalCharge * (lineItem.resellerCommissionPct / 100))
    : 0;
  const netToMsp = lineItem.totalCharge - commissionAmount;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border-subtle bg-canvas p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
              Period
            </div>
            <div className="mt-0.5 text-[14px] font-semibold text-text-primary">
              April 2026
            </div>
            <div className="mt-1 text-[11.5px] text-text-tertiary">
              Last reconciled 4 hours ago
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
              Total Charge
            </div>
            <div className="mt-0.5 text-[20px] font-semibold tabular-nums text-text-primary">
              {formatCurrency(lineItem.totalCharge)}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="mt-1 h-6 text-brand-primary-hover"
              onClick={() => toast.success("Reconciliation up to date")}
            >
              Recalculate
            </Button>
          </div>
        </div>
      </div>

      <Section title="Base Capacity Charge">
        <LineRow label={`Committed Capacity: ${lineItem.committedTB} TB × $${lineItem.ratePerTB}/TB`} value={formatCurrency(lineItem.baseCharge)} />
      </Section>

      {lineItem.overageTB > 0 ? (
        <Section
          title="Overage Charges"
          subtitle="Overage policy: Allow with notification. Multiplier: 1.0× base rate."
        >
          <LineRow
            label={`Overage: ${lineItem.overageTB} TB × $${lineItem.ratePerTB}/TB × 1.0 multiplier`}
            value={formatCurrency(lineItem.overageCharge)}
          />
        </Section>
      ) : null}

      <Section title="Workload Type Breakdown" subtitle="Informational — no separate charge.">
        <ul className="flex flex-col gap-1 text-[12.5px]">
          {lineItem.workloadBreakdown.map((w) => (
            <li
              key={w.type}
              className="flex items-center justify-between border-b border-border-subtle pb-1 last:border-0 last:pb-0"
            >
              <span className="text-text-secondary">{w.type}</span>
              <span className="tabular-nums text-text-primary">{w.consumedTB} TB consumed</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Storage Tier Breakdown" subtitle="All tiers included in base rate at this commit level.">
        <ul className="flex flex-col gap-1 text-[12.5px]">
          {lineItem.storageTierBreakdown.map((t) => (
            <li
              key={t.tier}
              className="flex items-center justify-between border-b border-border-subtle pb-1 last:border-0 last:pb-0"
            >
              <span className="text-text-secondary">{t.tier} tier</span>
              <span className="tabular-nums text-text-primary">{t.consumedTB} TB · included</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Usage Metrics" subtitle="Informational only.">
        <ul className="flex flex-col gap-1 text-[12.5px]">
          <li className="flex items-center justify-between border-b border-border-subtle pb-1">
            <span className="text-text-secondary">Total restore points stored</span>
            <span className="tabular-nums text-text-primary">{lineItem.metrics.totalRestorePoints.toLocaleString()}</span>
          </li>
          <li className="flex items-center justify-between border-b border-border-subtle pb-1">
            <span className="text-text-secondary">Transfer-out this period</span>
            <span className="tabular-nums text-text-primary">{lineItem.metrics.transferOutTB} TB · within quota</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-text-secondary">Backup jobs executed</span>
            <span className="tabular-nums text-text-primary">{lineItem.metrics.backupJobsExecuted.toLocaleString()}</span>
          </li>
        </ul>
      </Section>

      <Section
        title="Adjustments"
        action={
          lineItem.status === "Draft" ? (
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-brand-primary-hover"
              onClick={() =>
                toast("Add adjustment", {
                  description: "Adjustment editor lands in Phase 1 polish.",
                })
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Add Adjustment
            </Button>
          ) : null
        }
      >
        {lineItem.adjustments.length === 0 ? (
          <div className="text-[12px] text-text-tertiary">No adjustments applied this period.</div>
        ) : (
          <ul className="flex flex-col gap-1.5 text-[12.5px]">
            {lineItem.adjustments.map((a) => (
              <li key={a.id} className="rounded-md border border-border-subtle bg-canvas p-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text-primary">{a.description}</span>
                  <span
                    className={cn(
                      "tabular-nums",
                      a.amount < 0 ? "text-status-success" : "text-text-primary",
                    )}
                  >
                    {a.amount < 0 ? "" : "+"}
                    {formatCurrency(a.amount)}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-text-tertiary">
                  {a.reason} · Applied by {a.appliedBy}, {format(parseISO(a.appliedAt), "MMM d, yyyy")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {lineItem.resellerCommissionPct ? (
        <Section title="Reseller Commission" subtitle="Apex IT Partners — 15% commission">
          <LineRow
            label="Commission deduction"
            value={`-${formatCurrency(commissionAmount)}`}
            tone="negative"
          />
          <LineRow label="Net to MSP" value={formatCurrency(netToMsp)} bold />
        </Section>
      ) : null}

      <Section title="Tax">
        <div className="text-[12.5px] text-text-secondary">{lineItem.taxNote}</div>
      </Section>

      <div className="rounded-lg border border-brand-primary/30 bg-brand-primary-subtle p-4">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-brand-primary-hover">
            Grand Total
          </span>
          <span className="text-[20px] font-semibold tabular-nums text-text-primary">
            {formatCurrency(lineItem.totalCharge)}
          </span>
        </div>
        {adjustmentTotal !== 0 ? (
          <div className="mt-1 text-[11px] text-text-tertiary">
            Includes net adjustments of {formatCurrency(adjustmentTotal)}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {lineItem.status === "Draft" ? (
          <Button
            onClick={onApprove}
            className="gap-2 bg-brand-primary text-white hover:bg-brand-primary-hover"
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve
          </Button>
        ) : null}
        <Button variant="outline" className="gap-2" onClick={() =>
          toast.success("Line items exported", {
            description: `Saved as ${lineItem.tenantName.toLowerCase().replace(/\s+/g, "-")}-line-items.csv`,
          })
        }>
          <Download className="h-4 w-4" />
          Export Line Items as CSV
        </Button>
      </div>
    </div>
  );
}

function DailyUsageTab({ lineItem }: { lineItem: BillingLineItem }) {
  const data = Array.from({ length: 30 }).map((_, i) => {
    const day = i + 1;
    const overageDay = lineItem.overageTB > 0 && day === 14;
    const baseTB = (lineItem.usedTB / 30) * (1 + Math.sin(day / 4) * 0.18 + (overageDay ? 0.4 : 0));
    return {
      day,
      label: `Apr ${day}`,
      vms: Number((baseTB * 0.55).toFixed(2)),
      databases: Number((baseTB * 0.28).toFixed(2)),
      fileShares: Number((baseTB * 0.17).toFixed(2)),
    };
  });

  const peakDay = data.reduce((acc, d) => (d.vms + d.databases + d.fileShares > acc.total ? { day: d.day, total: d.vms + d.databases + d.fileShares } : acc), { day: 1, total: 0 });
  const lowDay = data.reduce(
    (acc, d) => {
      const sum = d.vms + d.databases + d.fileShares;
      if (acc.total < 0 || sum < acc.total) return { day: d.day, total: sum };
      return acc;
    },
    { day: 1, total: -1 },
  );
  const avg = data.reduce((s, d) => s + d.vms + d.databases + d.fileShares, 0) / data.length;

  return (
    <div className="flex flex-col gap-4">
      <ChartFrame height={240} ariaLabel="Daily usage by workload type">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              {[
                { id: "vms-grad", color: "var(--brand-primary)" },
                { id: "dbs-grad", color: "var(--status-info)" },
                { id: "fs-grad", color: "var(--text-tertiary)" },
              ].map((g) => (
                <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={g.color} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={g.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10.5, fill: "var(--text-secondary)" }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fontSize: 10.5, fill: "var(--text-secondary)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v.toFixed(1)}`}
              width={36}
            />
            <Tooltip
              cursor={{ stroke: "var(--border-default)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <ChartTooltip
                    title={String(label)}
                    series={payload.map((p) => ({
                      label: String(p.name ?? p.dataKey),
                      value: `${Number(p.value).toFixed(2)} TB`,
                      color: String(p.color ?? "var(--brand-primary)"),
                    }))}
                  />
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} iconType="circle" />
            {lineItem.overageTB > 0 ? (
              <ReferenceLine
                x="Apr 14"
                stroke="var(--status-critical)"
                strokeDasharray="3 3"
                label={{ value: "Overage triggered", fontSize: 10.5, fill: "var(--status-critical)", position: "top" }}
              />
            ) : null}
            <Area name="VMs" type="monotone" dataKey="vms" stackId="1" stroke="var(--brand-primary)" fill="url(#vms-grad)" strokeWidth={1.5} />
            <Area name="Databases" type="monotone" dataKey="databases" stackId="1" stroke="var(--status-info)" fill="url(#dbs-grad)" strokeWidth={1.5} />
            <Area name="File Shares" type="monotone" dataKey="fileShares" stackId="1" stroke="var(--text-tertiary)" fill="url(#fs-grad)" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartFrame>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 text-[12px]">
        <Stat label="Avg daily" value={`${avg.toFixed(2)} TB`} />
        <Stat label="Peak day" value={`Apr ${peakDay.day} · ${peakDay.total.toFixed(2)} TB`} />
        <Stat label="Low day" value={`Apr ${lowDay.day} · ${lowDay.total.toFixed(2)} TB`} />
        <Stat label="Growth rate" value="+0.6 TB / day" />
      </div>

      {lineItem.overageTB > 0 ? (
        <div className="rounded-md border border-status-warning/30 bg-status-warning-subtle px-3 py-2 text-[12.5px] text-text-primary">
          <span className="inline-flex items-center gap-1.5 font-semibold text-status-warning">
            <AlertTriangle className="h-3.5 w-3.5" />
            Apr 18 had 3.2× normal consumption — investigate?
          </span>
          <Button asChild variant="ghost" size="sm" className="ml-1 h-6 text-brand-primary-hover">
            <Link href={`/tenants/${lineItem.tenantId}?tab=audit`}>View audit log →</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function TrendTab({
  lineItem,
  history,
}: {
  lineItem: BillingLineItem;
  history: Array<{ month: string; total: number }>;
}) {
  const data = history.map((h) => ({
    label: format(parseISO(h.month), "MMM"),
    actual: h.total,
    forecast: null as number | null,
  }));
  // Add forecast extension for next 3 months using simple linear regression on the last 6 points
  const last = history.slice(-6);
  if (last.length >= 2) {
    const slope =
      (last[last.length - 1].total - last[0].total) / Math.max(1, last.length - 1);
    let prev = last[last.length - 1].total;
    for (let i = 1; i <= 3; i += 1) {
      prev += slope * 1.05;
      const d = new Date(parseISO(history[history.length - 1].month));
      d.setUTCMonth(d.getUTCMonth() + i);
      data.push({
        label: format(d, "MMM"),
        actual: null as unknown as number,
        forecast: Math.round(prev),
      });
    }
  }

  const lastActual = history[history.length - 1]?.total ?? lineItem.totalCharge;
  const prevActual = history[history.length - 2]?.total ?? lastActual;
  const momPct = prevActual > 0 ? ((lastActual - prevActual) / prevActual) * 100 : 0;
  const forecastedNext = data.find((d) => d.forecast !== null)?.forecast ?? lastActual;

  return (
    <div className="flex flex-col gap-4">
      <ChartFrame height={240} ariaLabel="12-month billing trend">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
              width={48}
            />
            <Tooltip
              cursor={{ stroke: "var(--border-default)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <ChartTooltip
                    title={String(label)}
                    series={payload
                      .filter((p) => typeof p.value === "number")
                      .map((p) => ({
                        label: String(p.name ?? p.dataKey),
                        value: formatCurrency(Number(p.value)),
                        color: String(p.color ?? "var(--brand-primary)"),
                      }))}
                  />
                );
              }}
            />
            <Line
              name="Actual"
              type="monotone"
              dataKey="actual"
              stroke="var(--brand-primary)"
              strokeWidth={1.75}
              dot={{ r: 3, fill: "var(--brand-primary)" }}
              connectNulls
            />
            <Line
              name="Forecast"
              type="monotone"
              dataKey="forecast"
              stroke="var(--brand-primary)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={{ r: 3, fill: "var(--surface)", strokeWidth: 1.5 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <div className="rounded-md border border-status-info/30 bg-status-info-subtle p-3 text-[12.5px] text-text-primary">
        <div className="font-semibold">Insights</div>
        <ul className="mt-1 space-y-0.5">
          <li>Average monthly growth: <span className="font-medium tabular-nums">{momPct >= 0 ? "+" : ""}{momPct.toFixed(1)}% MoM</span></li>
          <li>
            Forecasted next month: <span className="font-medium tabular-nums">{formatCurrency(forecastedNext)}</span>
          </li>
          <li>
            At current growth, this tenant will exceed Gold tier threshold in 3 months. Consider Platinum at next QBR.
          </li>
        </ul>
      </div>

      <Button
        variant="outline"
        className="w-fit"
        onClick={() =>
          toast.success("QBR scheduled", {
            description: "Calendar invite sent to billing + customer success.",
          })
        }
      >
        Schedule QBR Discussion
      </Button>
    </div>
  );
}

function DisputesTab({ lineItem }: { lineItem: BillingLineItem }) {
  const appendComment = useConsoleStore((s) => s.appendDisputeComment);
  const updateStatus = useConsoleStore((s) => s.updateDisputeStatus);
  const applyCredit = useConsoleStore((s) => s.applyDisputeCredit);

  const [comment, setComment] = useState("");
  const [statusUpdate, setStatusUpdate] = useState<BillingDispute["status"] | "">("");
  const [statusNote, setStatusNote] = useState("");
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [creditReason, setCreditReason] = useState("");

  if (!lineItem.dispute) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-border-subtle bg-canvas px-6 py-12 text-center">
        <CheckCircle2 className="h-7 w-7 text-status-success" />
        <div className="text-[13px] font-semibold text-text-primary">
          No active disputes for this tenant
        </div>
        <div className="text-[12px] text-text-tertiary">
          Last dispute resolved Mar 2026 (DISPUTE-2026-03-012).
        </div>
      </div>
    );
  }

  const dispute = lineItem.dispute;

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-md border border-status-critical/30 bg-status-critical-subtle p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[10.5px] font-semibold uppercase tracking-wide text-status-critical">
              Active dispute
            </div>
            <div className="mt-0.5 text-[14px] font-semibold text-text-primary">
              {dispute.id}
            </div>
            <div className="mt-1 text-[12px] text-text-secondary">
              Filed {format(parseISO(dispute.filedAt), "MMM d, yyyy")} by {dispute.filedBy}
            </div>
            <Badge
              variant="outline"
              className="mt-2 border-transparent bg-status-warning-subtle text-[11px] uppercase text-status-warning"
            >
              {dispute.status}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
              Disputed Amount
            </div>
            <div className="mt-0.5 text-[18px] font-semibold tabular-nums text-status-critical">
              {formatCurrency(dispute.disputedAmount)}
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-md bg-surface p-3 text-[12.5px] text-text-primary">
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
            Tenant&apos;s reason
          </div>
          <p className="mt-1 leading-relaxed">{dispute.reason}</p>
        </div>
      </section>

      <Section title="Activity timeline">
        <ol className="flex flex-col gap-2 text-[12.5px]">
          {dispute.activity.map((a, i) => (
            <li key={i} className="flex items-start gap-2">
              <Avatar className="mt-0.5 h-5 w-5">
                <AvatarFallback className="bg-brand-primary-subtle text-[9px] font-semibold text-brand-primary-hover">
                  {a.by
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-text-primary">{a.note}</div>
                <div className="text-[11px] text-text-tertiary tabular-nums">
                  {format(parseISO(a.at), "MMM d HH:mm 'UTC'")} · {a.by}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {dispute.evidence.length > 0 ? (
        <Section title="Evidence attached">
          <ul className="flex flex-col gap-1.5 text-[12.5px]">
            {dispute.evidence.map((e) => (
              <li key={e.id} className="flex items-start gap-2 rounded-md border border-border-subtle bg-canvas p-2.5">
                <FileDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-tertiary" />
                <div>
                  <div className="font-mono text-[11px] text-text-secondary">{e.id}</div>
                  <div className="text-text-primary">{e.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title="Add comment">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Add a comment for the dispute thread…"
        />
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            className="gap-1.5 bg-brand-primary text-white hover:bg-brand-primary-hover"
            onClick={() => {
              if (!comment.trim()) return;
              appendComment(lineItem.id, currentOperator.name, comment.trim());
              toast.success("Comment added");
              setComment("");
            }}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Send
          </Button>
        </div>
      </Section>

      <Section title="Update status">
        <div className="flex flex-col gap-2">
          <Select value={statusUpdate} onValueChange={(v) => setStatusUpdate(v as BillingDispute["status"])}>
            <SelectTrigger>
              <SelectValue placeholder="Choose next status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Acknowledged">Acknowledged</SelectItem>
              <SelectItem value="Under Review">Under Review</SelectItem>
              <SelectItem value="Resolved (Adjusted)">Resolved (Adjusted)</SelectItem>
              <SelectItem value="Resolved (Denied)">Resolved (Denied)</SelectItem>
              <SelectItem value="Escalated">Escalated</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            rows={2}
            placeholder="Status change note (required)…"
          />
          <Button
            size="sm"
            className="w-fit gap-1.5 bg-brand-primary text-white hover:bg-brand-primary-hover"
            onClick={() => {
              if (!statusUpdate || statusNote.trim().length < 6) {
                toast.error("Status note required (≥6 chars)");
                return;
              }
              updateStatus(lineItem.id, currentOperator.name, statusUpdate, statusNote.trim());
              toast.success(`Status updated: ${statusUpdate}`);
              setStatusUpdate("");
              setStatusNote("");
            }}
          >
            <Send className="h-3.5 w-3.5" />
            Apply Status
          </Button>
        </div>
      </Section>

      <Section title="Apply credit (admin only)">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={0}
              max={dispute.disputedAmount}
              value={creditAmount || ""}
              onChange={(e) => setCreditAmount(Number(e.target.value) || 0)}
              className="h-9 rounded-md border border-border-default bg-surface px-3 text-[12.5px]"
              placeholder="Amount"
            />
            <span className="self-center text-[11.5px] text-text-tertiary">
              Max: {formatCurrency(dispute.disputedAmount)}
            </span>
          </div>
          <Textarea
            value={creditReason}
            onChange={(e) => setCreditReason(e.target.value)}
            rows={2}
            placeholder="Reason for credit (audit-logged)…"
          />
          <Button
            size="sm"
            variant="outline"
            className="w-fit gap-1.5"
            onClick={() => {
              if (creditAmount <= 0 || creditReason.trim().length < 6) {
                toast.error("Amount and reason (≥6 chars) required");
                return;
              }
              applyCredit(lineItem.id, currentOperator.name, creditAmount, creditReason.trim());
              toast.success(`Credit applied: ${formatCurrency(creditAmount)}`);
              setCreditAmount(0);
              setCreditReason("");
            }}
          >
            <Flag className="h-3.5 w-3.5" />
            Apply Credit
          </Button>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border-subtle bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-[12.5px] font-semibold text-text-primary">{title}</h3>
          {subtitle ? (
            <p className="mt-0.5 text-[11.5px] text-text-tertiary">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function LineRow({
  label,
  value,
  tone,
  bold,
}: {
  label: string;
  value: string;
  tone?: "negative";
  bold?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border-subtle py-1 text-[12.5px] last:border-0 last:pb-0",
        bold && "border-t border-t-border-default pt-2 font-semibold",
      )}
    >
      <span className={bold ? "text-text-primary" : "text-text-secondary"}>{label}</span>
      <span
        className={cn(
          "tabular-nums",
          tone === "negative" ? "text-status-success" : "text-text-primary",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-canvas p-2.5">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
        {label}
      </div>
      <div className="mt-1 tabular-nums text-text-primary">{value}</div>
    </div>
  );
}

void Loader2;
