"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { useConsoleStore } from "@/lib/store";
import { formatRelativeTime } from "@/lib/formatters";
import type { IsolationControlId } from "@/types";

const FREQUENCIES = [1, 4, 6, 12, 24] as const;

export function ScheduleSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const schedule = useConsoleStore((s) => s.securitySchedule);
  const updateSchedule = useConsoleStore((s) => s.updateScheduleEntry);
  const rerunControl = useConsoleStore((s) => s.rerunControlSweep);
  const [running, setRunning] = useState<string | null>(null);

  const onRunNow = (controlId: IsolationControlId | "full-sweep") => {
    setRunning(controlId);
    setTimeout(() => {
      if (controlId !== "full-sweep") rerunControl(controlId as IsolationControlId);
      setRunning(null);
      toast.success(`${controlId === "full-sweep" ? "Full sweep" : controlId} re-run`, {
        description: "Schedule advanced.",
      });
    }, 1_400);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden p-0 sm:max-w-[480px]">
        <SheetHeader className="border-b border-border-subtle p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-text-primary">
                Continuous Assessment Schedule
              </h2>
              <p className="mt-0.5 text-[12px] text-text-secondary">
                Configure how often each isolation control is re-verified.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <ul className="flex flex-col gap-3">
            {schedule
              .filter((s) => s.controlId !== "full-sweep")
              .map((s) => (
                <li
                  key={s.controlId}
                  className="rounded-md border border-border-subtle bg-surface p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[13px] font-semibold text-text-primary">
                        {s.label}
                      </div>
                      <div className="mt-0.5 text-[11.5px] text-text-tertiary tabular-nums" suppressHydrationWarning>
                        Last run {formatRelativeTime(s.lastRunAt)} · next run {formatRelativeTime(s.nextRunAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={String(s.frequencyHours)}
                        onValueChange={(v) =>
                          updateSchedule(s.controlId as IsolationControlId, Number(v))
                        }
                      >
                        <SelectTrigger size="sm" className="h-8 w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FREQUENCIES.map((f) => (
                            <SelectItem key={f} value={String(f)}>
                              every {f}h
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRunNow(s.controlId as IsolationControlId)}
                        disabled={running === s.controlId}
                      >
                        {running === s.controlId ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Run Now"
                        )}
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
          </ul>

          <section className="rounded-md border border-border-subtle bg-surface p-4">
            <h3 className="text-[13px] font-semibold text-text-primary">Full Sweep Schedule</h3>
            <p className="mt-0.5 text-[11.5px] text-text-secondary">
              The full sweep re-verifies all controls across all tenants.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-[12px]">
              <div>
                <Label className="text-[11px] font-medium text-text-primary">Time</Label>
                <Select defaultValue="04">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <SelectItem key={i} value={String(i).padStart(2, "0")}>
                        {String(i).padStart(2, "0")}:00 UTC
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px] font-medium text-text-primary">Days</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All days</SelectItem>
                    <SelectItem value="weekdays">Weekdays</SelectItem>
                    <SelectItem value="weekends">Weekends</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section className="rounded-md border border-border-subtle bg-surface p-4">
            <h3 className="text-[13px] font-semibold text-text-primary">Notifications</h3>
            <ul className="mt-2 flex flex-col gap-2 text-[12px]">
              <li className="flex items-center justify-between rounded-md bg-canvas px-3 py-2">
                <span className="text-text-primary">Notify on FAIL</span>
                <span className="text-[11px] text-text-tertiary">Alex Morrison · Priya Patel</span>
              </li>
              <li className="flex items-center justify-between rounded-md bg-canvas px-3 py-2">
                <span className="text-text-primary">Notify on WARN escalation</span>
                <span className="text-[11px] text-text-tertiary">Alex Morrison</span>
              </li>
              <li className="flex items-center justify-between rounded-md bg-canvas px-3 py-2">
                <span className="text-text-primary">Daily digest email</span>
                <span className="text-[11px] text-text-tertiary">07:00 UTC</span>
              </li>
            </ul>
          </section>
        </div>

        <div className="flex justify-end gap-2 border-t border-border-subtle p-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-brand-primary text-white hover:bg-brand-primary-hover"
            onClick={() => {
              toast.success("Schedule saved");
              onOpenChange(false);
            }}
          >
            Save Schedule
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
