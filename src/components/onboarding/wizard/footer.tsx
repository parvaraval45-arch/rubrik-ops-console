"use client";

import { ArrowLeft, ArrowRight, Save, ShieldCheck, UserCog } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockData } from "@/lib/mock-data";

interface WizardFooterProps {
  step: number;
  canGoBack: boolean;
  canGoNext: boolean;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onReassign?: (operatorName: string) => void;
  saving?: boolean;
  nextLabel?: string;
  showReassign?: boolean;
}

export function WizardFooter({
  step,
  canGoBack,
  canGoNext,
  onBack,
  onNext,
  onSaveDraft,
  onReassign,
  saving = false,
  nextLabel,
  showReassign = true,
}: WizardFooterProps) {
  return (
    <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-border-subtle bg-surface px-6 py-3">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        disabled={!canGoBack}
        className="gap-2 text-text-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onSaveDraft}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save Draft"}
        </Button>
        {showReassign && onReassign ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="gap-2">
                <UserCog className="h-4 w-4" />
                Reassign
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-[11px] font-semibold uppercase text-text-tertiary">
                Reassign to
              </DropdownMenuLabel>
              {mockData.operators.map((op) => (
                <DropdownMenuItem
                  key={op.id}
                  onSelect={() => onReassign(op.name)}
                  className="gap-2"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="bg-brand-primary-subtle text-[9px] font-semibold text-brand-primary-hover">
                      {op.initials}
                    </AvatarFallback>
                  </Avatar>
                  {op.name}{" "}
                  <span className="text-[11px] text-text-tertiary">{op.role}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        <Button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="gap-2 bg-brand-primary text-white hover:bg-brand-primary-hover"
        >
          {step === 7 ? <ShieldCheck className="h-4 w-4" /> : null}
          {nextLabel ?? (step === 7 ? "Run Pre-Flight Checks" : "Next")}
          {step !== 7 ? <ArrowRight className="h-4 w-4" /> : null}
        </Button>
      </div>
    </div>
  );
}
