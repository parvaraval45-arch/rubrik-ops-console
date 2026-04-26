"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { WIZARD_STEPS } from "./steps";
import { cn } from "@/lib/utils";
import type { WizardStepNumber } from "@/types";

interface StepperProps {
  currentStep: WizardStepNumber;
  completedThrough: WizardStepNumber;
  onStepClick: (step: WizardStepNumber) => void;
}

export function WizardStepper({
  currentStep,
  completedThrough,
  onStepClick,
}: StepperProps) {
  return (
    <ol className="flex flex-col">
      {WIZARD_STEPS.map((step, idx) => {
        const isCurrent = step.number === currentStep;
        const isComplete = step.number <= completedThrough && !isCurrent;
        const isPending = step.number > completedThrough && !isCurrent;

        const clickable = isComplete;

        return (
          <li key={step.number} className="relative">
            {idx < WIZARD_STEPS.length - 1 ? (
              <span
                className={cn(
                  "absolute left-3.5 top-7 h-[calc(100%-12px)] w-px",
                  step.number <= completedThrough
                    ? "bg-brand-primary"
                    : "bg-border-default",
                )}
                aria-hidden
              />
            ) : null}
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick(step.number)}
              className={cn(
                "group flex w-full items-start gap-3 px-3 py-3 text-left transition-colors",
                clickable
                  ? "cursor-pointer hover:bg-secondary/40"
                  : "cursor-default",
              )}
            >
              <span
                className={cn(
                  "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold transition-colors",
                  isComplete &&
                    "border border-brand-primary bg-brand-primary text-white",
                  isCurrent &&
                    "border-2 border-brand-primary bg-brand-primary-subtle text-brand-primary-hover",
                  isPending && "border border-border-default bg-surface text-text-tertiary",
                )}
              >
                {isComplete ? (
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Check className="h-4 w-4" />
                  </motion.span>
                ) : (
                  step.number
                )}
              </span>
              <div className="flex flex-col gap-0.5">
                <span
                  className={cn(
                    "text-[13px] font-medium",
                    isPending ? "text-text-tertiary" : "text-text-primary",
                    isCurrent && "font-semibold",
                  )}
                >
                  {step.title}
                </span>
                <span className="text-[11px] text-text-tertiary">{step.subtitle}</span>
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
