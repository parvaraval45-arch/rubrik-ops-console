"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "./chart-tooltip";
import { ChartFrame } from "./chart-frame";
import { formatNumber } from "@/lib/formatters";

export interface BackupJobsHourBucket {
  hour: string;
  succeeded: number;
  running: number;
  failed: number;
}

const SERIES = [
  { key: "succeeded", label: "Success", color: "var(--brand-primary)", gradientId: "rbk-area-success" },
  { key: "running", label: "Running", color: "var(--status-info)", gradientId: "rbk-area-running" },
  { key: "failed", label: "Failed", color: "var(--status-critical)", gradientId: "rbk-area-failed" },
] as const;

export function BackupJobsArea({ data }: { data: BackupJobsHourBucket[] }) {
  return (
    <div className="flex h-full flex-col">
      <ChartFrame height={260} ariaLabel="Backup jobs over the last 24 hours, three series">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              {SERIES.map((s) => (
                <linearGradient
                  key={s.gradientId}
                  id={s.gradientId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              stroke="var(--border-subtle)"
              strokeDasharray="0"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
              tickLine={false}
              axisLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => formatNumber(v)}
              width={36}
            />
            <Tooltip
              cursor={{ stroke: "var(--border-default)", strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <ChartTooltip
                    title={label as string}
                    series={SERIES.map((s) => ({
                      label: s.label,
                      value: formatNumber(
                        Number(payload.find((p) => p.dataKey === s.key)?.value ?? 0),
                      ),
                      color: s.color,
                    }))}
                  />
                );
              }}
            />
            {SERIES.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stackId="1"
                stroke={s.color}
                strokeWidth={1.5}
                fill={`url(#${s.gradientId})`}
                isAnimationActive
                animationDuration={420}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </ChartFrame>
      <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-text-secondary">
        {SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
