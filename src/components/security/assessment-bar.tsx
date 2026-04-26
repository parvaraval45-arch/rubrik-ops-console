"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConsoleStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { SecurityScheduleEntry } from "@/types";

interface AssessmentBarProps {
  schedule: SecurityScheduleEntry[];
  onOpenSchedule: () => void;
}

export function AssessmentBar({ schedule, onOpenSchedule }: AssessmentBarProps) {
  const rerunPosture = useConsoleStore((s) => s.rerunPostureSweep);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [accordionOpen, setAccordionOpen] = useState(false);

  const fullSweep = schedule.find((s) => s.controlId === "full-sweep");
  const controls = schedule.filter((s) => s.controlId !== "full-sweep");

  const onRunNow = () => {
    setRunning(true);
    setProgress(0);
    const start = Date.now();
    const total = 8_000;
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / total) * 100);
      setProgress(pct);
      if (pct < 100) requestAnimationFrame(tick);
      else {
        rerunPosture();
        setRunning(false);
        toast.success("Full posture sweep complete", {
          description: "All 5 controls re-evaluated across 62 tenants.",
        });
      }
    };
    requestAnimationFrame(tick);
  };

  return (
    <section className="rounded-lg border border-border-subtle bg-surface shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
        <div>
          <h2 className="text-[14px] font-semibold text-text-primary">
            Continuous Assessment Schedule
          </h2>
          <p className="mt-0.5 text-[12px] text-text-secondary">
            Isolation controls are re-verified on a rolling schedule. Last full
            sweep: {fullSweep ? formatHoursAgo(fullSweep.lastRunAt) : "—"}.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={onRunNow}
          disabled={running}
        >
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {running ? `Running ${Math.round(progress)}%` : "Re-Run Now"}
        </Button>
      </div>

      <div className="px-5 py-4">
        <Timeline schedule={schedule} />
      </div>

      <div className="border-t border-border-subtle px-5 py-3">
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={() => setAccordionOpen((o) => !o)}
            className="flex flex-1 items-center gap-2 text-left text-[12.5px] font-medium text-text-primary"
          >
            {accordionOpen ? (
              <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />
            )}
            Schedule frequency
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSchedule}
            className="text-brand-primary-hover"
          >
            Edit Schedule
          </Button>
        </div>
        {accordionOpen ? (
          <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 text-[12.5px]">
            {controls.map((c) => (
              <li
                key={c.controlId}
                className="flex items-center justify-between rounded-md border border-border-subtle bg-canvas px-3 py-2"
              >
                <span className="font-medium text-text-primary">{c.label}</span>
                <span className="tabular-nums text-text-secondary">
                  every {c.frequencyHours}h
                </span>
              </li>
            ))}
            {fullSweep ? (
              <li className="flex items-center justify-between rounded-md border border-brand-primary/30 bg-brand-primary-subtle px-3 py-2 lg:col-span-3">
                <span className="font-medium text-brand-primary-hover">
                  Full sweep · daily at 04:00 UTC
                </span>
                <span className="tabular-nums text-text-secondary" suppressHydrationWarning>
                  next: {formatHoursFromNow(fullSweep.nextRunAt)}
                </span>
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function Timeline({ schedule }: { schedule: SecurityScheduleEntry[] }) {
  const sorted = schedule
    .filter((e) => e.controlId !== "full-sweep")
    .map((e) => ({
      label: e.label,
      offsetHours: Math.max(
        0,
        (Date.parse(e.nextRunAt) - Date.parse(e.lastRunAt)) / (60 * 60_000),
      ),
      runAt: e.nextRunAt,
    }))
    .sort((a, b) => a.offsetHours - b.offsetHours);

  // approximate 24-hour timeline of upcoming events
  const positions: Array<{ pct: number; label: string; runLabel: string }> = [
    { pct: 0, label: "Now", runLabel: "current" },
  ];
  let cumulative = 0;
  for (const item of sorted) {
    cumulative += item.offsetHours;
    if (cumulative > 24) break;
    positions.push({
      pct: Math.min(96, (cumulative / 24) * 100),
      label: item.label,
      runLabel: formatOffset(cumulative * 60),
    });
  }
  positions.push({ pct: 96, label: "Full posture re-assessment", runLabel: "+18h" });

  return (
    <TooltipProvider delayDuration={120}>
      <div className="relative h-12">
        <div className="absolute inset-x-0 top-1/2 h-px bg-border-default" />
        {positions.map((p, i) => (
          <Tooltip key={`${p.label}-${i}`}>
            <TooltipTrigger asChild>
              <button
                type="button"
                style={{ left: `${p.pct}%` }}
                className={cn(
                  "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full",
                  i === 0
                    ? "h-3 w-3 bg-brand-primary"
                    : "h-2 w-2 bg-status-info",
                )}
                aria-label={`${p.label} ${p.runLabel}`}
              />
            </TooltipTrigger>
            <TooltipContent side="top">
              <span className="text-[12px] font-medium">{p.label}</span>
              <br />
              <span className="text-[11px] text-text-tertiary">{p.runLabel}</span>
            </TooltipContent>
          </Tooltip>
        ))}
        <div className="absolute inset-x-0 -bottom-0.5 flex justify-between text-[10.5px] text-text-tertiary">
          <span>Now</span>
          <span>+24h</span>
        </div>
      </div>
    </TooltipProvider>
  );
}

function formatOffset(minutes: number) {
  if (minutes < 60) return `+${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m === 0 ? `+${h}h` : `+${h}h ${m}m`;
}

function formatHoursAgo(iso: string) {
  const ms = Date.now() - Date.parse(iso);
  const hours = Math.max(1, Math.round(ms / (60 * 60_000)));
  return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
}

function formatHoursFromNow(iso: string) {
  const ms = Date.parse(iso) - Date.now();
  if (ms <= 0) return "imminent";
  const hours = Math.max(1, Math.round(ms / (60 * 60_000)));
  return hours === 1 ? "in 1 hour" : `in ${hours} hours`;
}
