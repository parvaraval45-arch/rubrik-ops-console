"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useConsoleStore } from "@/lib/store";
import { currentOperator } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface GenerateInvoicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PROGRESS_STEPS = [
  "Compiling line items…",
  "Generating PDF invoices…",
  "Applying digital signatures…",
  "Dispatching to billing contacts…",
  "Updating period status…",
];

export function GenerateInvoicesDialog({
  open,
  onOpenChange,
}: GenerateInvoicesDialogProps) {
  const lineItems = useConsoleStore((s) => s.billingLineItems);
  const generateInvoices = useConsoleStore((s) => s.generateInvoices);
  const [note, setNote] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState(PROGRESS_STEPS[0]);
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState<{ ids: string[]; total: number } | null>(null);

  const approved = lineItems.filter((li) => li.status === "Approved");
  const drafts = lineItems.filter((li) => li.status === "Draft");
  const disputed = lineItems.filter((li) => li.status === "Disputed");
  const total = approved.reduce((s, li) => s + li.totalCharge, 0);

  const noteError =
    touched && note.trim().length < 6
      ? "Generation note must be at least 6 characters."
      : null;

  const reset = () => {
    setRunning(false);
    setProgress(0);
    setProgressLabel(PROGRESS_STEPS[0]);
    setNote("");
    setTouched(false);
    setDone(null);
  };

  const onGenerate = () => {
    if (note.trim().length < 6) {
      setTouched(true);
      return;
    }
    setRunning(true);
    let i = 0;
    const tick = () => {
      const stepIdx = Math.min(PROGRESS_STEPS.length - 1, Math.floor((i / 100) * PROGRESS_STEPS.length));
      setProgressLabel(PROGRESS_STEPS[stepIdx]);
      setProgress(i);
      if (i < 100) {
        i += 4;
        setTimeout(tick, 90);
      } else {
        const ids = generateInvoices(currentOperator.name, note.trim());
        setDone({ ids, total });
        setRunning(false);
        toast.success("Invoice run complete", {
          description: `${ids.length} invoices generated and dispatched.`,
        });
      }
    };
    tick();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && !running) {
          reset();
          onOpenChange(false);
        }
      }}
    >
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Generate Invoices for April 2026</DialogTitle>
          <DialogDescription className="text-[12.5px] text-text-secondary">
            Pre-flight runs before invoice dispatch. Disputed and Paid items are
            excluded from this run.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col gap-3 py-2">
            <div className="flex flex-col items-center gap-2 rounded-md border border-status-success/30 bg-status-success-subtle p-5 text-center">
              <CheckCircle2 className="h-9 w-9 text-status-success" />
              <div className="text-[14px] font-semibold text-text-primary">
                {done.ids.length} invoices generated and dispatched
              </div>
              <div className="text-[12px] text-text-secondary tabular-nums">
                Total invoiced: {formatCurrency(done.total)} · Distributed via email + ConnectWise sync
              </div>
            </div>
            <ul className="rounded-md border border-border-subtle bg-canvas p-3 text-[11.5px] text-text-tertiary tabular-nums">
              {done.ids.slice(0, 4).map((id) => (
                <li key={id}>· {id}</li>
              ))}
              {done.ids.length > 4 ? (
                <li>… {done.ids.length - 4} more invoices distributed.</li>
              ) : null}
            </ul>
            <DialogFooter>
              <Button
                onClick={() => {
                  reset();
                  onOpenChange(false);
                }}
                className="bg-brand-primary text-white hover:bg-brand-primary-hover"
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 py-2">
              <ul className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-canvas p-3 text-[12.5px]">
                <PreFlight passed icon={CheckCircle2} label={`${drafts.length === 0 ? "All Draft items reviewed" : `${drafts.length} Draft items remain — they will not be invoiced`} (${approved.length} approved)`} />
                <PreFlight passed={disputed.length === 0} icon={disputed.length === 0 ? CheckCircle2 : X} label={
                  disputed.length === 0
                    ? "No disputed items"
                    : `${disputed.length} disputed item${disputed.length === 1 ? "" : "s"} — will be excluded from invoice run`
                } warn={disputed.length > 0} />
                <PreFlight passed icon={CheckCircle2} label="Period reconciled (4 hours ago)" />
                <PreFlight passed icon={CheckCircle2} label="All approvals in place" />
                <PreFlight passed icon={CheckCircle2} label="Payment terms confirmed" />
              </ul>

              <div className="rounded-md border border-status-info/30 bg-status-info-subtle px-3 py-2 text-[12.5px] text-text-primary">
                Will generate{" "}
                <span className="font-semibold tabular-nums">{approved.length} invoices</span>{" "}
                totaling{" "}
                <span className="font-semibold tabular-nums">{formatCurrency(total)}</span>.
                Disputed and Paid items excluded.
              </div>

              <div>
                <Label className="text-[12px] font-medium text-text-primary">
                  Generation note (logged for audit)
                </Label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onBlur={() => setTouched(true)}
                  rows={2}
                  placeholder="e.g., April invoice run — period locked Apr 30; Commonwealth dispute excluded pending resolution."
                  className={noteError ? "border-status-critical" : ""}
                />
                {noteError ? (
                  <span className="text-[11.5px] text-status-critical">{noteError}</span>
                ) : null}
              </div>

              {running ? (
                <div className="flex flex-col gap-1 rounded-md border border-brand-primary/30 bg-brand-primary-subtle px-3 py-2 text-[12px] text-text-primary">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-primary" />
                    {progressLabel}
                  </span>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn("h-full rounded-full bg-brand-primary transition-all duration-150")}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                disabled={running}
                onClick={() => {
                  reset();
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={running || approved.length === 0}
                onClick={onGenerate}
                className="bg-brand-primary text-white hover:bg-brand-primary-hover"
              >
                {running ? "Generating…" : `Generate ${approved.length} Invoices`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PreFlight({
  passed,
  warn,
  label,
  icon: Icon,
}: {
  passed: boolean;
  warn?: boolean;
  label: string;
  icon: typeof CheckCircle2;
}) {
  return (
    <li className="flex items-start gap-2">
      <Icon
        className={cn(
          "mt-0.5 h-3.5 w-3.5 shrink-0",
          passed && !warn
            ? "text-status-success"
            : warn
              ? "text-status-warning"
              : "text-status-critical",
        )}
      />
      <span className={cn(passed && !warn ? "text-text-primary" : "text-status-warning")}>
        {label}
      </span>
    </li>
  );
}
