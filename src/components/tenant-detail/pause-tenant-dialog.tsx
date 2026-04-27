"use client";

import { useState } from "react";
import { feedback } from "@/lib/feedback";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useConsoleStore } from "@/lib/store";
import type { Tenant } from "@/types";

interface PauseTenantDialogProps {
  tenant: Tenant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PauseTenantDialog({ tenant, open, onOpenChange }: PauseTenantDialogProps) {
  const pauseTenant = useConsoleStore((s) => s.pauseTenant);
  const resumeTenant = useConsoleStore((s) => s.resumeTenant);
  const [reason, setReason] = useState("");
  const [resumeDate, setResumeDate] = useState("");
  const [touched, setTouched] = useState(false);

  const reasonError =
    touched && reason.trim().length < 10
      ? "Reason must be at least 10 characters."
      : null;

  const onConfirm = () => {
    if (reason.trim().length < 10) {
      setTouched(true);
      return;
    }
    pauseTenant(tenant.id, reason.trim(), resumeDate || undefined);
    feedback.destructive(`${tenant.name} paused`, {
      description: `Tenant admin notified at ${tenant.contactEmail}.`,
      undo: () => {
        resumeTenant(tenant.id);
        feedback.info("Pause undone", {
          description: `${tenant.name} restored to active.`,
        });
      },
    });
    setReason("");
    setResumeDate("");
    setTouched(false);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[480px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Pause {tenant.name}?</AlertDialogTitle>
          <AlertDialogDescription className="text-[13px] leading-relaxed text-text-secondary">
            Pausing will halt all scheduled backups and restore operations.
            Existing backup data is preserved. The tenant admin will be
            notified by email. This action requires a reason for audit logging.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pause-reason" className="text-[12px] font-medium text-text-primary">
              Reason for pause
            </Label>
            <Textarea
              id="pause-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="e.g., Customer requested temporary suspension during data center migration."
              rows={3}
              aria-invalid={!!reasonError}
              className={reasonError ? "border-status-critical" : ""}
            />
            {reasonError ? (
              <span className="text-[12px] text-status-critical">{reasonError}</span>
            ) : (
              <span className="text-[12px] text-text-tertiary">
                Minimum 10 characters. This is logged in the audit trail.
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pause-resume" className="text-[12px] font-medium text-text-primary">
              Estimated resume date{" "}
              <span className="font-normal text-text-tertiary">(optional)</span>
            </Label>
            <Input
              id="pause-resume"
              type="date"
              value={resumeDate}
              onChange={(e) => setResumeDate(e.target.value)}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-status-critical text-white hover:bg-status-critical/90"
          >
            Pause Tenant
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
