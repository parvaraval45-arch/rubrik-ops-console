"use client";

import type { TooltipContentProps } from "recharts";
import { cn } from "@/lib/utils";

export interface ChartTooltipSeries {
  label: string;
  value: string;
  color: string;
}

interface ChartTooltipProps {
  title?: string;
  subtitle?: string;
  series: ChartTooltipSeries[];
  className?: string;
}

export function ChartTooltip({ title, subtitle, series, className }: ChartTooltipProps) {
  return (
    <div
      className={cn(
        "min-w-[180px] rounded-lg bg-surface p-3 text-[12px] shadow-md",
        className,
      )}
    >
      {title ? (
        <div className="text-[11px] font-medium text-text-secondary">{title}</div>
      ) : null}
      {subtitle ? (
        <div className="mt-0.5 text-[11px] text-text-tertiary">{subtitle}</div>
      ) : null}
      {title || subtitle ? <div className="my-2 h-px bg-border-subtle" /> : null}
      <div className="flex flex-col gap-1">
        {series.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-text-secondary">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: s.color }}
                aria-hidden
              />
              {s.label}
            </span>
            <span className="font-medium tabular-nums text-text-primary">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface RechartsTooltipPayloadEntry {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
  dataKey?: string;
}

type RechartsTooltipProps = TooltipContentProps<number, string>;
export type { RechartsTooltipProps };
