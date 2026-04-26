"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Bell,
  Check,
  CircleCheck,
  UserPlus,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useConsoleStore } from "@/lib/store";
import { mockData, currentOperator } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Alarm, AlertSeverity } from "@/types";

const SEVERITY_DOT: Record<AlertSeverity, string> = {
  critical: "bg-status-critical",
  warning: "bg-status-warning",
  info: "bg-status-info",
};

const STATE_BADGE: Record<Alarm["state"], string> = {
  triggered: "bg-status-critical-subtle text-status-critical",
  acknowledged: "bg-status-warning-subtle text-status-warning",
  resolved: "bg-status-success-subtle text-status-success",
};

type Filter = "All" | "Critical" | "Warning" | "Info" | "Acknowledged";

interface ActiveAlarmsProps {
  tenantId: string;
  alarms: Alarm[];
}

export function ActiveAlarms({ tenantId, alarms }: ActiveAlarmsProps) {
  const acknowledgeAlarm = useConsoleStore((s) => s.acknowledgeAlarm);
  const assignAlarm = useConsoleStore((s) => s.assignAlarm);
  const resolveAlarm = useConsoleStore((s) => s.resolveAlarm);

  const [filter, setFilter] = useState<Filter>("All");
  const [ackOpen, setAckOpen] = useState<string | null>(null);
  const [resolveTarget, setResolveTarget] = useState<Alarm | null>(null);

  const open = alarms.filter((a) => a.state !== "resolved");
  const visible = open
    .filter((a) => {
      if (filter === "All") return true;
      if (filter === "Acknowledged") return a.state === "acknowledged";
      return a.severity.toLowerCase() === filter.toLowerCase();
    })
    .sort((a, b) => {
      const aiAck = a.state === "acknowledged" ? 1 : 0;
      const biAck = b.state === "acknowledged" ? 1 : 0;
      if (aiAck !== biAck) return aiAck - biAck;
      return +new Date(b.triggeredAt) - +new Date(a.triggeredAt);
    });

  const counts = {
    All: open.length,
    Critical: open.filter((a) => a.severity === "critical").length,
    Warning: open.filter((a) => a.severity === "warning").length,
    Info: open.filter((a) => a.severity === "info").length,
    Acknowledged: open.filter((a) => a.state === "acknowledged").length,
  };

  return (
    <section className="rounded-lg border border-border-subtle bg-surface shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
        <h2 className="text-[14px] font-semibold text-text-primary">
          Active Alarms · <span className="tabular-nums text-text-secondary">{open.length} open</span>
        </h2>
        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.keys(counts) as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "h-7 rounded-full px-2.5 text-[11px] font-medium transition-colors",
                filter === f
                  ? "bg-brand-primary-subtle text-brand-primary-hover"
                  : "text-text-secondary hover:bg-secondary",
              )}
            >
              {f} <span className="ml-1 tabular-nums">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-status-success-subtle">
            <CircleCheck className="h-5 w-5 text-status-success" />
          </span>
          <span className="text-[14px] font-semibold text-text-primary">
            No active alarms
          </span>
          <span className="mt-1 text-[12px] text-text-tertiary">
            Last alarm resolved 2 days ago.
          </span>
        </div>
      ) : (
        <ul className="flex flex-col">
          {visible.map((alarm) => (
            <AlarmRow
              key={alarm.id}
              alarm={alarm}
              expanded={ackOpen === alarm.id}
              onToggleAck={() => setAckOpen((cur) => (cur === alarm.id ? null : alarm.id))}
              onAcknowledge={(note) => {
                acknowledgeAlarm(tenantId, alarm.id, currentOperator.name, note);
                toast.success("Alarm acknowledged");
                setAckOpen(null);
              }}
              onAssign={(name) => {
                assignAlarm(tenantId, alarm.id, name);
                toast.success(`Assigned to ${name}`);
              }}
              onResolveStart={() => setResolveTarget(alarm)}
            />
          ))}
        </ul>
      )}

      <ResolveAlarmDialog
        alarm={resolveTarget}
        onConfirm={(note) => {
          if (!resolveTarget) return;
          resolveAlarm(tenantId, resolveTarget.id, currentOperator.name, note);
          toast.success("Alarm resolved");
          setResolveTarget(null);
        }}
        onClose={() => setResolveTarget(null)}
      />
    </section>
  );
}

interface AlarmRowProps {
  alarm: Alarm;
  expanded: boolean;
  onToggleAck: () => void;
  onAcknowledge: (note: string) => void;
  onAssign: (assignee: string) => void;
  onResolveStart: () => void;
}

function AlarmRow({
  alarm,
  expanded,
  onToggleAck,
  onAcknowledge,
  onAssign,
  onResolveStart,
}: AlarmRowProps) {
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const noteError =
    touched && note.trim().length < 4
      ? "Add a brief acknowledgment note."
      : null;

  const dim = alarm.state === "acknowledged";

  return (
    <li
      className={cn(
        "border-b border-border-subtle px-5 py-3 last:border-0",
        dim && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", SEVERITY_DOT[alarm.severity])} aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-semibold text-text-primary">{alarm.title}</span>
            <Badge
              variant="outline"
              className={cn(
                "border-transparent text-[10px] font-medium uppercase",
                STATE_BADGE[alarm.state],
              )}
            >
              {alarm.state}
            </Badge>
          </div>
          <div className="mt-0.5 text-[12px] text-text-secondary line-clamp-1">
            {alarm.description}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-text-tertiary">
            <span suppressHydrationWarning>
              Triggered {formatRelativeTime(alarm.triggeredAt)}
            </span>
            {alarm.acknowledgedBy ? (
              <>
                <span>·</span>
                <span suppressHydrationWarning>
                  ack {alarm.acknowledgedAt ? formatRelativeTime(alarm.acknowledgedAt) : "moments ago"} by {alarm.acknowledgedBy}
                </span>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {alarm.assignedTo ? (
            <Avatar className="h-6 w-6" title={`Assigned to ${alarm.assignedTo}`}>
              <AvatarFallback className="bg-brand-primary-subtle text-[10px] font-semibold text-brand-primary-hover">
                {alarm.assignedTo
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </AvatarFallback>
            </Avatar>
          ) : null}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Assign">
                <UserPlus className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-2">
              <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                Assign to
              </div>
              <ul className="flex flex-col">
                {mockData.operators.map((op) => (
                  <li key={op.id}>
                    <button
                      type="button"
                      onClick={() => onAssign(op.name)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] hover:bg-secondary"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="bg-brand-primary-subtle text-[9px] font-semibold text-brand-primary-hover">
                          {op.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-text-primary">{op.name}</span>
                        <span className="text-[10px] text-text-tertiary">{op.role}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
          {alarm.state === "triggered" ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onToggleAck}
              title="Acknowledge"
            >
              <Bell className="h-3.5 w-3.5" />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onResolveStart}
            title="Resolve"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-3 flex flex-col gap-2 rounded-md bg-canvas p-3">
          <Label htmlFor={`ack-${alarm.id}`} className="text-[12px] font-medium text-text-primary">
            Acknowledgment note
          </Label>
          <Textarea
            id={`ack-${alarm.id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => setTouched(true)}
            rows={2}
            placeholder="e.g., Investigating with the platform team. Failover repository ready."
            className={noteError ? "border-status-critical" : ""}
          />
          {noteError ? (
            <span className="text-[12px] text-status-critical">{noteError}</span>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onToggleAck}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-brand-primary text-white hover:bg-brand-primary-hover"
              onClick={() => {
                if (note.trim().length < 4) {
                  setTouched(true);
                  return;
                }
                onAcknowledge(note.trim());
                setNote("");
                setTouched(false);
              }}
            >
              Acknowledge
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  );
}

function ResolveAlarmDialog({
  alarm,
  onConfirm,
  onClose,
}: {
  alarm: Alarm | null;
  onConfirm: (note: string) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const error =
    touched && note.trim().length < 6
      ? "Resolution note must be at least 6 characters."
      : null;

  return (
    <AlertDialog
      open={alarm !== null}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          setNote("");
          setTouched(false);
        }
      }}
    >
      <AlertDialogContent className="max-w-[460px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Resolve this alarm?</AlertDialogTitle>
          <AlertDialogDescription className="text-[13px] leading-relaxed text-text-secondary">
            This indicates the underlying issue has been fixed. The alarm
            moves to the audit log.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2 py-2">
          <Label htmlFor="resolve-note" className="text-[12px] font-medium text-text-primary">
            Resolution note
          </Label>
          <Textarea
            id="resolve-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => setTouched(true)}
            rows={3}
            placeholder="e.g., Repository link restored. Successor backup completed cleanly."
            className={error ? "border-status-critical" : ""}
          />
          {error ? <span className="text-[12px] text-status-critical">{error}</span> : null}
        </div>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-brand-primary text-white hover:bg-brand-primary-hover"
            onClick={() => {
              if (note.trim().length < 6) {
                setTouched(true);
                return;
              }
              onConfirm(note.trim());
              setNote("");
              setTouched(false);
            }}
          >
            Resolve
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
