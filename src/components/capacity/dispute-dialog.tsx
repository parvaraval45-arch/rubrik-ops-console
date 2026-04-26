"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useConsoleStore } from "@/lib/store";
import { currentOperator } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/formatters";
import type { BillingLineItem } from "@/types";

interface DisputeDialogProps {
  lineItem: BillingLineItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DisputeDialog({ lineItem, open, onOpenChange }: DisputeDialogProps) {
  const flagDispute = useConsoleStore((s) => s.flagDispute);
  const [amount, setAmount] = useState<number>(lineItem?.totalCharge ?? 0);
  const [reason, setReason] = useState("");
  const [contact, setContact] = useState(`${lineItem?.tenantName.split(" ")[0] ?? "Tenant"} Billing Contact`);
  const [estimatedDate, setEstimatedDate] = useState("");
  const [touched, setTouched] = useState(false);

  const reasonError =
    touched && reason.trim().length < 20
      ? "Reason must be at least 20 characters."
      : null;
  const amountError =
    touched && (!amount || amount <= 0)
      ? "Disputed amount must be greater than zero."
      : null;

  // Sync defaults when the line item changes
  if (lineItem && amount === 0) {
    setAmount(lineItem.totalCharge);
  }

  const onSubmit = () => {
    if (!lineItem) return;
    if (reason.trim().length < 20 || !amount) {
      setTouched(true);
      return;
    }
    flagDispute(lineItem.id, currentOperator.name, {
      contactName: contact.trim() || "Tenant Billing Contact",
      disputedAmount: amount,
      reason: reason.trim(),
      estimatedResolutionAt: estimatedDate || undefined,
    });
    toast.success(`Dispute filed for ${lineItem.tenantName}`, {
      description: "Assigned to Lisa Chen for review.",
    });
    setReason("");
    setTouched(false);
    setEstimatedDate("");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[520px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Flag Line Item for Dispute</AlertDialogTitle>
          <AlertDialogDescription className="text-[12.5px] text-text-secondary">
            {lineItem?.tenantName} · {lineItem?.tier} · April 2026 · Total{" "}
            {lineItem ? formatCurrency(lineItem.totalCharge) : "—"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[12px] font-medium text-text-primary">Disputed amount</Label>
              <Input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                onBlur={() => setTouched(true)}
                className={amountError ? "border-status-critical" : ""}
              />
              {amountError ? (
                <span className="text-[11.5px] text-status-critical">{amountError}</span>
              ) : null}
            </div>
            <div>
              <Label className="text-[12px] font-medium text-text-primary">
                Estimated resolution{" "}
                <span className="font-normal text-text-tertiary">(optional)</span>
              </Label>
              <Input
                type="date"
                value={estimatedDate}
                onChange={(e) => setEstimatedDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label className="text-[12px] font-medium text-text-primary">
              Tenant contact filing dispute
            </Label>
            <Input value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>
          <div>
            <Label className="text-[12px] font-medium text-text-primary">Disputed reason</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setTouched(true)}
              rows={4}
              placeholder="Describe the dispute in tenant's words. At least 20 characters."
              className={reasonError ? "border-status-critical" : ""}
            />
            {reasonError ? (
              <span className="text-[11.5px] text-status-critical">{reasonError}</span>
            ) : null}
          </div>
          <div>
            <Label className="text-[12px] font-medium text-text-primary">
              Attach evidence{" "}
              <span className="font-normal text-text-tertiary">(optional, mock)</span>
            </Label>
            <div className="mt-1 flex h-9 items-center gap-2 rounded-md border border-dashed border-border-default px-3 text-[12px] text-text-tertiary">
              <Paperclip className="h-3.5 w-3.5" />
              Drop files here or click to attach
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            className="bg-status-critical text-white hover:bg-status-critical/90"
          >
            File Dispute
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
