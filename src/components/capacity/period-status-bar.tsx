"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useConsoleStore } from "@/lib/store";
import { currentOperator } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { BillingPeriod } from "@/types";

interface PeriodStatusBarProps {
  period: BillingPeriod;
}

export function PeriodStatusBar({ period }: PeriodStatusBarProps) {
  const lockPeriod = useConsoleStore((s) => s.lockBillingPeriod);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isOpen = period.status === "open";
  const isLocked = period.status === "locked" || period.status === "invoiced" || period.status === "paid";

  const steps: Array<{ label: string; date: string; state: "done" | "current" | "pending" }> = [
    { label: "Period Open", date: "Apr 1", state: "done" },
    { label: "Currently Open", date: "Apr 25, today", state: "current" },
    { label: "Auto-Lock", date: "Apr 30, 23:59", state: isLocked ? "done" : "pending" },
    { label: "Invoice Dispatch", date: "May 2, 09:00", state: period.status === "invoiced" || period.status === "paid" ? "done" : "pending" },
  ];

  return (
    <section className="rounded-lg border border-border-subtle bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-semibold text-text-primary">
            Billing Period: {period.label}
          </h2>
          <p className="mt-0.5 text-[12px] text-text-secondary">
            Editable while period is open. Once locked, line-item changes require admin override.
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "border-transparent text-[11px] font-medium uppercase tracking-wide",
            isOpen
              ? "bg-status-success-subtle text-status-success"
              : "bg-status-warning-subtle text-status-warning",
          )}
        >
          {isOpen ? "Open · Closes Apr 30, 2026 23:59 UTC" : period.status}
        </Badge>
      </div>

      <ol className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {steps.map((step, i) => (
          <li
            key={step.label}
            className={cn(
              "flex items-start gap-2 rounded-md border px-3 py-2.5",
              step.state === "current"
                ? "border-brand-primary/40 bg-brand-primary-subtle"
                : "border-border-subtle bg-canvas",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                step.state === "done" && "bg-brand-primary text-white",
                step.state === "current" && "border-2 border-brand-primary text-brand-primary-hover bg-surface",
                step.state === "pending" && "border border-border-default text-text-tertiary",
              )}
            >
              {i + 1}
            </span>
            <div className="flex flex-col text-[12px]">
              <span className={cn(
                "font-medium",
                step.state === "pending" ? "text-text-tertiary" : "text-text-primary",
              )}>
                {step.label}
              </span>
              <span className="text-[11px] text-text-tertiary tabular-nums">{step.date}</span>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex justify-end">
        <Button
          variant="outline"
          className="gap-2"
          disabled={!isOpen}
          onClick={() => setConfirmOpen(true)}
        >
          <Lock className="h-4 w-4" />
          {isLocked ? "Period Locked" : "Lock Period Now"}
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lock the {period.label} period?</AlertDialogTitle>
            <AlertDialogDescription>
              Locking will prevent further edits to this period&apos;s line items.
              Approvals, dispute filing, and adjustments will require admin override.
              Proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-status-warning text-white hover:bg-status-warning/90"
              onClick={() => {
                lockPeriod(currentOperator.name);
                toast.success(`${period.label} locked`, {
                  description: "Line-item edits now require admin override.",
                });
                setConfirmOpen(false);
              }}
            >
              Lock Period
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
