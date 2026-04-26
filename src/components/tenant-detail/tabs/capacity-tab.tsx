"use client";

import { format, parseISO } from "date-fns";
import {
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
import { ChartFrame } from "@/components/charts/chart-frame";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPercent, formatTB } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { MonthlyConsumption, QuotaUsage, Tenant } from "@/types";
import { toast } from "sonner";

interface CapacityTabProps {
  tenant: Tenant;
  quota: QuotaUsage;
  monthly: MonthlyConsumption[];
}

export function CapacityTab({ tenant, quota, monthly }: CapacityTabProps) {
  const trend = build90dTrend(tenant);

  const projectedDaysToSoftLimit = computeDaysToSoftLimit(tenant);

  return (
    <div className="flex flex-col gap-4">
      <Panel title="Capacity Trend (90 days)" subtitle="Used, committed line, and 30-day forecast">
        <ChartFrame height={260} ariaLabel="Capacity trend over last 90 days with forecast">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart data={trend} margin={{ top: 10, right: 16, left: 6, bottom: 0 }}>
              <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                tickLine={false}
                axisLine={false}
                interval={Math.floor(trend.length / 6)}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v.toFixed(0)} TB`}
                width={56}
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
                          label: String(p.name ?? p.dataKey ?? ""),
                          value: formatTB(Number(p.value)),
                          color: String(p.color ?? "var(--brand-primary)"),
                        }))}
                    />
                  );
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }}
                iconSize={8}
                iconType="circle"
              />
              <ReferenceLine
                y={tenant.capacityCommittedTB}
                stroke="var(--text-tertiary)"
                strokeDasharray="4 4"
                label={{ value: "Committed", fontSize: 11, fill: "var(--text-tertiary)", position: "right" }}
              />
              <Line
                name="Used"
                type="monotone"
                dataKey="used"
                stroke="var(--brand-primary)"
                strokeWidth={1.75}
                dot={false}
              />
              <Line
                name="Forecast"
                type="monotone"
                dataKey="forecast"
                stroke="var(--brand-primary)"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartFrame>
      </Panel>

      <Panel title="Quota Status" subtitle="Soft limit at 80%, hard limit at 100%">
        <div className="flex flex-col gap-4">
          <QuotaRow
            label="Storage Quota"
            used={quota.storage.used}
            limit={quota.storage.limit}
            unit="TB"
            format={(v) => formatTB(v)}
          />
          <QuotaRow
            label="Workload Count"
            used={quota.workloads.used}
            limit={quota.workloads.limit}
            unit="workloads"
            format={(v) => `${v.toLocaleString()}`}
          />
          <QuotaRow
            label="Transfer-Out (this month)"
            used={quota.transferOutThisMonth.used}
            limit={quota.transferOutThisMonth.limit}
            unit="TB"
            format={(v) => formatTB(v)}
          />
          <QuotaRow
            label="Restore Points"
            used={quota.restorePoints.used}
            limit={quota.restorePoints.limit}
            unit="points"
            format={(v) => v.toLocaleString()}
          />
        </div>
      </Panel>

      <Panel title="Capacity Forecast Insights">
        <div className="rounded-md border border-status-info/30 bg-status-info-subtle px-4 py-3 text-[13px] leading-relaxed text-text-primary">
          At current growth rate, this tenant will reach 80% of committed
          capacity in approximately{" "}
          <span className="font-semibold tabular-nums">
            {projectedDaysToSoftLimit} days
          </span>
          . Recommended action: discuss tier upgrade to Platinum at next QBR
          (scheduled May 12).
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            className="bg-brand-primary text-white hover:bg-brand-primary-hover"
            onClick={() =>
              toast.success("Calendar invite sent", {
                description: "Tier upgrade discussion scheduled.",
              })
            }
          >
            Schedule Upgrade Discussion
          </Button>
          <Button
            variant="outline"
            className="border-border-default"
            onClick={() =>
              toast("Allocation adjustment", {
                description: "Cluster reassignment opens in capacity admin.",
              })
            }
          >
            Adjust Allocation
          </Button>
        </div>
      </Panel>

      <Panel title="Monthly Consumption" subtitle="Last 12 months">
        <Table>
          <TableHeader>
            <TableRow className="border-border-subtle">
              <TableHead className="px-5 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                Month
              </TableHead>
              <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                Peak Used
              </TableHead>
              <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                Avg Used
              </TableHead>
              <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                Restore Points
              </TableHead>
              <TableHead className="px-5 text-right text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                Transfer-Out
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthly.map((m) => (
              <TableRow key={m.month} className="border-border-subtle text-[13px]">
                <TableCell className="px-5 text-text-primary tabular-nums" suppressHydrationWarning>
                  {format(parseISO(m.month), "MMM yyyy")}
                </TableCell>
                <TableCell className="text-right tabular-nums text-text-primary">
                  {formatTB(m.peakUsageTB)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-text-secondary">
                  {formatTB(m.avgUsageTB)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-text-secondary">
                  {m.restorePoints.toLocaleString()}
                </TableCell>
                <TableCell className="px-5 text-right tabular-nums text-text-secondary">
                  {formatTB(m.transferOutTB)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}

function QuotaRow({
  label,
  used,
  limit,
  format,
}: {
  label: string;
  used: number;
  limit: number;
  unit: string;
  format: (v: number) => string;
}) {
  const pct = limit > 0 ? (used / limit) * 100 : 0;
  const tone = pct >= 100 ? "critical" : pct >= 80 ? "warning" : "ok";
  const barColor =
    tone === "critical"
      ? "bg-status-critical"
      : tone === "warning"
        ? "bg-status-warning"
        : "bg-brand-primary";
  return (
    <div>
      <div className="flex items-center justify-between text-[12.5px]">
        <span className="font-medium text-text-primary">{label}</span>
        <span className="tabular-nums text-text-secondary">
          {format(used)} / {format(limit)} ({formatPercent(pct, 0)})
        </span>
      </div>
      <div className="relative mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
        <span
          className="absolute top-0 h-full w-px bg-status-warning"
          style={{ left: "80%" }}
          aria-label="Soft limit"
        />
        <span
          className="absolute top-0 h-full w-px bg-status-critical"
          style={{ left: "100%" }}
          aria-label="Hard limit"
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-text-tertiary">
        <span>Soft limit 80%</span>
        <span>Hard limit 100%</span>
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border-subtle bg-surface shadow-card">
      <div className="border-b border-border-subtle px-5 py-4">
        <h3 className="text-[14px] font-semibold text-text-primary">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-[12px] text-text-secondary">{subtitle}</p>
        ) : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function build90dTrend(tenant: Tenant) {
  const out: Array<{ label: string; used: number | null; forecast: number | null }> = [];
  const now = Date.parse("2026-04-26T00:00:00Z");
  const dailyGrowth = (tenant.capacityUsedTB / 90) * 0.012;
  for (let d = 89; d >= 0; d -= 1) {
    const date = new Date(now - d * 24 * 60 * 60_000);
    const noise = Math.sin((90 - d) / 8) * 0.6;
    const used = tenant.capacityUsedTB - d * dailyGrowth + noise;
    out.push({
      label: format(date, "MMM d"),
      used: Number(used.toFixed(2)),
      forecast: null,
    });
  }
  // forecast next 30 days
  for (let d = 1; d <= 30; d += 1) {
    const date = new Date(now + d * 24 * 60 * 60_000);
    const projected = tenant.capacityUsedTB + d * dailyGrowth;
    out.push({
      label: format(date, "MMM d"),
      used: null,
      forecast: Number(projected.toFixed(2)),
    });
  }
  return out;
}

function computeDaysToSoftLimit(tenant: Tenant) {
  const target = tenant.capacityCommittedTB * 0.8;
  const dailyGrowth = (tenant.capacityUsedTB / 90) * 0.012;
  if (dailyGrowth <= 0) return 365;
  const days = Math.ceil((target - tenant.capacityUsedTB) / dailyGrowth);
  return Math.max(7, Math.min(365, days));
}
