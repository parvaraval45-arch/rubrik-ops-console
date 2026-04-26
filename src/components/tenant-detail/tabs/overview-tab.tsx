"use client";

import { format, subDays } from "date-fns";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartFrame } from "@/components/charts/chart-frame";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { ActiveAlarms } from "../active-alarms";
import { WORKLOAD_LABEL, WorkloadIcon } from "../workload-icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration, formatPercent, formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type {
  Alarm,
  JobSession,
  Tenant,
  Workload,
  WorkloadType,
} from "@/types";

interface OverviewTabProps {
  tenant: Tenant;
  workloads: Workload[];
  alarms: Alarm[];
  jobs: JobSession[];
  onSwitchTab: (tab: string, params?: Record<string, string>) => void;
  onJobClick: (jobId: string) => void;
}

const STATUS_PILL: Record<JobSession["status"], string> = {
  succeeded: "bg-status-success-subtle text-status-success",
  failed: "bg-status-critical-subtle text-status-critical",
  running: "bg-status-info-subtle text-status-info",
  queued: "bg-secondary text-text-secondary",
  skipped: "bg-secondary text-text-secondary",
};

const TYPE_COLOR: Record<WorkloadType, string> = {
  VM: "var(--brand-primary)",
  Database: "var(--status-info)",
  FileShare: "var(--status-warning)",
  M365: "#6366F1",
  Kubernetes: "#0EA5E9",
  NAS: "#94A3B8",
};

export function OverviewTab({
  tenant,
  workloads,
  alarms,
  jobs,
  onSwitchTab,
  onJobClick,
}: OverviewTabProps) {
  const recent = jobs.slice(0, 10);

  const timeline = Array.from({ length: 30 }).map((_, i) => {
    const date = subDays(new Date(), 29 - i);
    const seed = (i * 17 + 11) % 23;
    return {
      date: format(date, "MMM d"),
      iso: date.toISOString(),
      backupSuccess: Math.min(100, Math.max(82, 96 + Math.sin(i / 3) * 4 - (seed % 5))),
      slaCompliance: Math.min(100, Math.max(94, 99 + Math.cos(i / 4) * 1.2)),
    };
  });

  const distribution = workloads.reduce<Record<WorkloadType, number>>(
    (acc, w) => {
      acc[w.type] = (acc[w.type] ?? 0) + 1;
      return acc;
    },
    { VM: 0, Database: 0, FileShare: 0, M365: 0, Kubernetes: 0, NAS: 0 },
  );
  const distributionData = (Object.keys(distribution) as WorkloadType[])
    .filter((t) => distribution[t] > 0)
    .map((t) => ({ type: t, value: distribution[t], color: TYPE_COLOR[t] }));

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
      <div className="flex flex-col gap-4 xl:col-span-3">
        <Panel title="Health Timeline (30 days)">
          <ChartFrame height={240} ariaLabel="Backup success and SLA compliance over 30 days">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={timeline} margin={{ top: 10, right: 12, left: 4, bottom: 0 }}>
                <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                  domain={[80, 100]}
                  width={42}
                />
                <Tooltip
                  cursor={{ stroke: "var(--border-default)" }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <ChartTooltip
                        title={String(label)}
                        subtitle="Click to view jobs from this day"
                        series={[
                          {
                            label: "Backup Success",
                            value: formatPercent(Number(payload[0]?.value ?? 0)),
                            color: "var(--brand-primary)",
                          },
                          {
                            label: "SLA Compliance",
                            value: formatPercent(Number(payload[1]?.value ?? 0)),
                            color: "var(--status-info)",
                          },
                        ]}
                      />
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }}
                  iconSize={8}
                  iconType="circle"
                />
                <Line
                  name="Backup Success"
                  type="monotone"
                  dataKey="backupSuccess"
                  stroke="var(--brand-primary)"
                  strokeWidth={1.75}
                  dot={false}
                  activeDot={{ r: 4, fill: "var(--brand-primary)" }}
                />
                <Line
                  name="SLA Compliance"
                  type="monotone"
                  dataKey="slaCompliance"
                  stroke="var(--status-info)"
                  strokeWidth={1.75}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={{ r: 4, fill: "var(--status-info)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Panel>

        <ActiveAlarms tenantId={tenant.id} alarms={alarms} />
      </div>

      <div className="flex flex-col gap-4 xl:col-span-2">
        <Panel
          title="Recent Backup Jobs"
          subtitle="Last 10 across all workloads"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSwitchTab("backups")}
              className="text-brand-primary-hover"
            >
              View all jobs →
            </Button>
          }
          bodyClassName=""
        >
          <ul className="flex flex-col">
            {recent.length === 0 ? (
              <li className="px-5 py-10 text-center text-[13px] text-text-tertiary">
                No backup jobs yet for this tenant.
              </li>
            ) : (
              recent.map((job) => (
                <li
                  key={job.id}
                  className="border-b border-border-subtle last:border-0"
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-secondary/40"
                    onClick={() => onJobClick(job.id)}
                  >
                    <WorkloadIcon
                      type={job.workloadType}
                      className="h-4 w-4 shrink-0 text-text-tertiary"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[12.5px] font-medium text-text-primary">
                        {job.workloadName}
                      </span>
                      <span className="text-[11px] text-text-tertiary tabular-nums" suppressHydrationWarning>
                        {formatRelativeTime(job.startedAt)} ·{" "}
                        {job.durationSec > 0 ? formatDuration(job.durationSec) : "—"}{" "}
                        ·{" "}
                        {job.status === "succeeded"
                          ? `${(job.bytesTransferred / 1_000_000_000).toFixed(1)} GB`
                          : job.errorMessage ?? "—"}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 border-transparent text-[10px] font-medium uppercase",
                        STATUS_PILL[job.status],
                        job.status === "running" && "animate-pulse",
                      )}
                    >
                      {job.status}
                    </Badge>
                  </button>
                </li>
              ))
            )}
          </ul>
        </Panel>

        <Panel
          title="Workload Distribution"
          subtitle={`${workloads.length} protected workloads`}
        >
          <div>
            <ChartFrame height={220} ariaLabel="Workload distribution by type">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    dataKey="value"
                    nameKey="type"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={1.5}
                    stroke="var(--surface)"
                    strokeWidth={2}
                    onClick={(slice) => {
                      const s = slice as unknown as { type?: WorkloadType };
                      if (s.type) onSwitchTab("workloads", { type: s.type });
                    }}
                    cursor="pointer"
                    isAnimationActive
                    animationDuration={420}
                  >
                    {distributionData.map((d) => (
                      <Cell key={d.type} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const slice = payload[0]?.payload as { type: WorkloadType; value: number; color: string };
                      return (
                        <ChartTooltip
                          title={WORKLOAD_LABEL[slice.type]}
                          series={[
                            {
                              label: "Workloads",
                              value: slice.value.toString(),
                              color: slice.color,
                            },
                            {
                              label: "Click",
                              value: "filter table",
                              color: "var(--text-tertiary)",
                            },
                          ]}
                        />
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartFrame>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
              {distributionData.map((d) => (
                <button
                  key={d.type}
                  type="button"
                  onClick={() => onSwitchTab("workloads", { type: d.type })}
                  className="flex items-center justify-between rounded-md px-1 py-0.5 text-left hover:bg-secondary"
                >
                  <span className="flex items-center gap-2 text-text-primary">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    {WORKLOAD_LABEL[d.type]}
                  </span>
                  <span className="tabular-nums text-text-secondary">{d.value}</span>
                </button>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
  bodyClassName = "px-5 pb-5 pt-3",
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  bodyClassName?: string;
}) {
  return (
    <section className="rounded-lg border border-border-subtle bg-surface shadow-card">
      <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
        <div>
          <h2 className="text-[14px] font-semibold text-text-primary">{title}</h2>
          {subtitle ? (
            <p className="text-[12px] text-text-secondary">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
