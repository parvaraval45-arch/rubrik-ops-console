"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useConsoleStore } from "@/lib/store";
import { currentOperator } from "@/lib/mock-data";
import type {
  IsolationControlId,
  RemediationStepDef,
  Tenant,
} from "@/types";

type StepStatus = "pending" | "running" | "complete";

interface RemediationPanelProps {
  tenant: Tenant;
  controlId: IsolationControlId;
  steps: RemediationStepDef[];
  beforeScore: number;
  beforeStatusLabel: string;
  note: string;
  onComplete: () => void;
}

export function RemediationPanel({
  tenant,
  controlId,
  steps,
  beforeScore,
  beforeStatusLabel,
  note,
  onComplete,
}: RemediationPanelProps) {
  const remediateMatrixCell = useConsoleStore((s) => s.remediateMatrixCell);

  const [stepStates, setStepStates] = useState<StepStatus[]>(() =>
    steps.map(() => "pending"),
  );
  const [stepDurations, setStepDurations] = useState<string[]>(() =>
    steps.map(() => ""),
  );
  const [currentSubstepIdx, setCurrentSubstepIdx] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [doneFlag, setDoneFlag] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [finalElapsed, setFinalElapsed] = useState<number | null>(null);

  useEffect(() => {
    if (doneFlag) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [doneFlag]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      for (let i = 0; i < steps.length; i += 1) {
        if (cancelled) return;
        setActiveStep(i);
        setStepStates((prev) => prev.map((s, idx) => (idx === i ? "running" : s)));
        const step = steps[i];
        const totalMs = 1500 + Math.random() * 1500;
        const subDelay = totalMs / step.substeps.length;
        for (let s = 0; s < step.substeps.length; s += 1) {
          if (cancelled) return;
          setCurrentSubstepIdx(s);
          await delay(subDelay);
        }
        if (cancelled) return;
        setStepStates((prev) => prev.map((st, idx) => (idx === i ? "complete" : st)));
        setStepDurations((prev) =>
          prev.map((d, idx) => (idx === i ? step.completionDurationLabel : d)),
        );
      }
      if (cancelled) return;
      remediateMatrixCell(tenant.id, controlId, currentOperator.name, note);
      setFinalElapsed(Date.now() - startedAt);
      setDoneFlag(true);
      onComplete();
    };
    run();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const elapsed = doneFlag
    ? finalElapsed ?? now - startedAt
    : now - startedAt;
  const elapsedSec = Math.floor(elapsed / 1000);
  const elapsedDisplay = `${Math.floor(elapsedSec / 60)}m ${elapsedSec % 60}s`;

  if (doneFlag) {
    const afterScore = Math.min(99, beforeScore + 24);
    return (
      <div className="flex flex-col gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="flex flex-col items-center gap-2 rounded-lg border border-status-success/30 bg-status-success-subtle p-5 text-center"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-status-success">
            <ShieldCheck className="h-6 w-6 text-white" />
          </span>
          <div>
            <div className="text-[15px] font-semibold text-text-primary">
              Remediation Successful
            </div>
            <div className="text-[12px] text-text-secondary">
              Isolation restored for {tenant.name}.
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-2 text-[12px]">
          <Stat label="Total time" value="11m 18s" />
          <Stat label="Steps" value={`${steps.length}/${steps.length}`} />
          <Stat label="Evidence" value="ev-rem-7a3c2b" tone="info" />
        </div>

        <div className="rounded-md border border-border-subtle bg-canvas p-3 text-[12.5px]">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
            Pre / Post comparison
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-status-critical/30 bg-status-critical-subtle p-2">
              <div className="text-[10.5px] uppercase text-status-critical">Before</div>
              <div className="mt-1 text-text-primary">
                Status: <span className="font-semibold">{beforeStatusLabel}</span>
              </div>
              <div className="tabular-nums">Score: {beforeScore}</div>
            </div>
            <div className="rounded-md border border-status-success/30 bg-status-success-subtle p-2">
              <div className="text-[10.5px] uppercase text-status-success">After</div>
              <div className="mt-1 text-text-primary">
                Status: <span className="font-semibold">PASS</span>
              </div>
              <div className="tabular-nums">Score: {afterScore}</div>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-status-info/30 bg-status-info-subtle p-3 text-[12px] text-text-primary">
          Verify Again in 4 Hours — scheduled re-check on the next isolation sweep.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-brand-primary/30 bg-brand-primary-subtle p-4">
        <div className="text-[13px] font-semibold text-text-primary">
          Remediation in Progress
        </div>
        <div className="mt-0.5 text-[11.5px] text-text-secondary">
          Started {Math.max(0, elapsedSec)}s ago by {currentOperator.name}
        </div>
        <div className="mt-2 text-[20px] font-semibold tabular-nums text-text-primary">
          {elapsedDisplay}
        </div>
      </div>

      <ol className="flex flex-col gap-2.5">
        {steps.map((step, idx) => {
          const status = stepStates[idx];
          const isActive = idx === activeStep && status === "running";
          return (
            <li
              key={step.id}
              className={cn(
                "rounded-md border p-3 text-[12.5px]",
                status === "complete" && "border-status-success/30 bg-status-success-subtle/50",
                status === "running" && "border-brand-primary/40 bg-brand-primary-subtle/40",
                status === "pending" && "border-border-subtle bg-canvas",
              )}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5">
                  {status === "complete" ? (
                    <CheckCircle2 className="h-4 w-4 text-status-success" />
                  ) : status === "running" ? (
                    <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
                  ) : (
                    <span className="block h-4 w-4 rounded-full border border-border-default" />
                  )}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-text-primary">
                      {idx + 1}. {step.title}
                    </span>
                    <span className="text-[11px] text-text-tertiary tabular-nums">
                      {status === "complete"
                        ? stepDurations[idx]
                        : status === "running"
                          ? "running…"
                          : step.estimatedDurationLabel}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-text-secondary">
                    {isActive
                      ? step.substeps[currentSubstepIdx]
                      : status === "complete"
                        ? `Complete: ${step.substeps[step.substeps.length - 1]}`
                        : step.description}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "info";
}) {
  return (
    <div className="rounded-md border border-border-subtle bg-canvas p-2.5">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-text-primary",
          tone === "info" && "font-mono text-[11.5px]",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
