"use client";

import { AlertCircle, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SecurityKpi {
  label: string;
  value: string;
  valueTone?: "default" | "critical" | "warning" | "success";
  subtitle?: string;
  trend?: { direction: "up" | "down" | "neutral"; tone: "positive" | "negative" | "neutral"; label: string };
  progress?: number;
  onClick?: () => void;
}

const VALUE_TONE: Record<NonNullable<SecurityKpi["valueTone"]>, string> = {
  default: "text-text-primary",
  critical: "text-status-critical",
  warning: "text-status-warning",
  success: "text-status-success",
};

const TREND_TONE: Record<NonNullable<SecurityKpi["trend"]>["tone"], string> = {
  positive: "text-status-success bg-status-success-subtle",
  negative: "text-status-critical bg-status-critical-subtle",
  neutral: "text-status-warning bg-status-warning-subtle",
};

export function SecurityKpiRow({ kpis }: { kpis: SecurityKpi[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
      {kpis.map((k) => (
        <button
          key={k.label}
          type="button"
          onClick={k.onClick}
          className={cn(
            "group flex flex-col gap-2 rounded-lg border border-border-subtle bg-surface p-4 text-left shadow-card transition-shadow",
            k.onClick ? "cursor-pointer hover:shadow-md" : "cursor-default",
          )}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
            {k.label}
          </span>
          <span
            className={cn(
              "text-[26px] font-semibold leading-none tabular-nums",
              VALUE_TONE[k.valueTone ?? "default"],
            )}
          >
            {k.value}
          </span>
          {typeof k.progress === "number" ? (
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  k.progress >= 90
                    ? "bg-status-success"
                    : k.progress >= 75
                      ? "bg-status-warning"
                      : "bg-status-critical",
                )}
                style={{ width: `${Math.min(100, Math.max(0, k.progress))}%` }}
              />
            </div>
          ) : null}
          {k.subtitle ? (
            <span className="text-[12px] text-text-secondary">{k.subtitle}</span>
          ) : null}
          {k.trend ? (
            <span
              className={cn(
                "inline-flex w-fit items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
                TREND_TONE[k.trend.tone],
              )}
            >
              {k.trend.direction === "up" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : k.trend.direction === "down" ? (
                <ArrowDownRight className="h-3 w-3" />
              ) : (
                <AlertCircle className="h-3 w-3" />
              )}
              {k.trend.label}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
