"use client";

import { useState } from "react";
import { AlertOctagon } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useConsoleStore } from "@/lib/store";
import { currentOperator } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/formatters";

interface CriticalBannerProps {
  failures: number;
  warnings: number;
  onFilterFailures: () => void;
}

export function CriticalBanner({
  failures,
  warnings,
  onFilterFailures,
}: CriticalBannerProps) {
  const banner = useConsoleStore((s) => s.securityBanner);
  const acknowledge = useConsoleStore((s) => s.acknowledgeSecurityBanner);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [note, setNote] = useState("");
  const [estimatedResolution, setEstimatedResolution] = useState("24 hours");
  const [longerJustification, setLongerJustification] = useState("");
  const [touched, setTouched] = useState(false);

  const noteError =
    touched && note.trim().length < 8
      ? "Acknowledgment note must be at least 8 characters."
      : null;
  const longerError =
    touched && estimatedResolution === "longer" && longerJustification.trim().length < 12
      ? "Provide at least 12 characters of justification for a longer resolution window."
      : null;

  const onConfirm = () => {
    if (
      note.trim().length < 8 ||
      (estimatedResolution === "longer" && longerJustification.trim().length < 12)
    ) {
      setTouched(true);
      return;
    }
    const finalEstimate =
      estimatedResolution === "longer"
        ? `Longer (${longerJustification.trim()})`
        : estimatedResolution;
    acknowledge(currentOperator.name, note.trim(), finalEstimate);
    toast.success("Banner acknowledged", {
      description: "Compliance team notified. Each violation must still be remediated.",
    });
    setDialogOpen(false);
    setNote("");
    setLongerJustification("");
    setTouched(false);
  };

  const acknowledged = banner.acknowledged;

  return (
    <>
      <div
        className={
          acknowledged
            ? "flex flex-wrap items-start gap-3 rounded-md border border-l-4 border-status-warning/30 border-l-status-warning bg-status-warning-subtle px-4 py-3"
            : "flex flex-wrap items-start gap-3 rounded-md border border-l-4 border-status-critical/30 border-l-status-critical bg-status-critical-subtle px-4 py-3"
        }
      >
        <AlertOctagon
          className={
            acknowledged
              ? "mt-0.5 h-5 w-5 shrink-0 text-status-warning"
              : "mt-0.5 h-5 w-5 shrink-0 text-status-critical"
          }
        />
        <div className="flex-1">
          <div
            className={
              acknowledged
                ? "text-[13px] font-semibold text-status-warning"
                : "text-[13px] font-semibold text-status-critical"
            }
          >
            {failures} Isolation Violations Detected · {warnings} active warnings
          </div>
          <div className="mt-0.5 text-[12px] leading-relaxed text-text-secondary">
            One or more tenants have failed isolation checks. Review the matrix
            below and remediate immediately. Remediations are logged for audit.
          </div>
          {acknowledged ? (
            <div className="mt-1 text-[11.5px] text-text-tertiary">
              Acknowledged{" "}
              <span suppressHydrationWarning>
                {banner.acknowledgedAt ? formatRelativeTime(banner.acknowledgedAt) : "moments ago"}
              </span>{" "}
              by {banner.acknowledgedBy} · ETA: {banner.estimatedResolution}
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!acknowledged ? (
            <Button
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="bg-status-critical text-white hover:bg-status-critical/90"
            >
              Acknowledge All
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            className="text-status-critical-hover"
            onClick={onFilterFailures}
          >
            Filter to Failures →
          </Button>
        </div>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="max-w-[520px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Acknowledge {failures} Isolation Violations?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] leading-relaxed text-text-secondary">
              This indicates the operations team is aware of these violations
              and is actively addressing them. Acknowledgment does NOT resolve
              the violations — each cell must be remediated individually. This
              action is logged for audit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div>
              <Label htmlFor="ack-note" className="text-[12px] font-medium text-text-primary">
                Acknowledgment note
              </Label>
              <Textarea
                id="ack-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={() => setTouched(true)}
                rows={3}
                placeholder="e.g., Operations team coordinating remediation across affected tenants. Tracking in INC-2026-04-25."
                className={noteError ? "border-status-critical" : ""}
              />
              {noteError ? (
                <span className="text-[11.5px] text-status-critical">{noteError}</span>
              ) : (
                <span className="text-[11.5px] text-text-tertiary">
                  Visible to compliance team. Logged in audit trail.
                </span>
              )}
            </div>
            <div>
              <Label className="text-[12px] font-medium text-text-primary">
                Estimated resolution time
              </Label>
              <Select value={estimatedResolution} onValueChange={setEstimatedResolution}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4 hours">4 hours</SelectItem>
                  <SelectItem value="24 hours">24 hours</SelectItem>
                  <SelectItem value="1 week">1 week</SelectItem>
                  <SelectItem value="longer">Longer (justification required)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {estimatedResolution === "longer" ? (
              <div>
                <Label className="text-[12px] font-medium text-text-primary">
                  Justification
                </Label>
                <Textarea
                  value={longerJustification}
                  onChange={(e) => setLongerJustification(e.target.value)}
                  onBlur={() => setTouched(true)}
                  rows={2}
                  placeholder="Why is the resolution window longer than one week?"
                  className={longerError ? "border-status-critical" : ""}
                />
                {longerError ? (
                  <span className="text-[11.5px] text-status-critical">{longerError}</span>
                ) : null}
              </div>
            ) : null}
          </div>
          <AlertDialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="bg-brand-primary text-white hover:bg-brand-primary-hover"
            >
              Acknowledge
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
