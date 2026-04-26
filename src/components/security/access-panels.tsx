"use client";

import { useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { useConsoleStore } from "@/lib/store";
import { currentOperator } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { AccessRequest } from "@/types";

export function AccessPanels() {
  const rbac = useConsoleStore((s) => s.rbacRoles);
  const operatorAccess = useConsoleStore((s) => s.operatorAccess);
  const requests = useConsoleStore((s) => s.accessRequests);
  const resolveRequest = useConsoleStore((s) => s.resolveAccessRequest);

  const pending = requests.filter((r) => r.status === "pending");

  const [resolving, setResolving] = useState<{
    request: AccessRequest;
    decision: "approved" | "denied";
  } | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Panel title="RBAC Role Summary">
        <ul className="flex flex-col">
          {rbac.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-2 border-b border-border-subtle px-5 py-2.5 text-[12.5px] last:border-0"
            >
              <div className="flex flex-col">
                <span className="font-medium text-text-primary">{r.name}</span>
                <span className="text-[11px] text-text-tertiary">{r.scope}</span>
              </div>
              <Badge
                variant="outline"
                className="border-transparent bg-secondary text-[10.5px] tabular-nums text-text-secondary"
              >
                {r.userCount}
              </Badge>
            </li>
          ))}
        </ul>
        <div className="px-5 py-3">
          <Button variant="ghost" size="sm" className="text-brand-primary-hover">
            Manage Roles →
          </Button>
        </div>
      </Panel>

      <Panel title="Operator Coverage">
        <ul className="flex flex-col">
          {operatorAccess.map((o) => (
            <li
              key={o.operatorId}
              className="flex items-center gap-2 border-b border-border-subtle px-5 py-2 text-[12px] last:border-0"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-brand-primary-subtle text-[10px] font-semibold text-brand-primary-hover">
                  {o.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col">
                <span className="font-medium text-text-primary">{o.operatorName}</span>
                <span className="text-[10.5px] text-text-tertiary">
                  {o.role} · {o.tenantsAssigned} tenants
                </span>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10.5px]",
                  o.mfaEnforced ? "text-status-success" : "text-status-warning",
                )}
              >
                <ShieldCheck className="h-3 w-3" />
                {o.mfaEnforced ? "Enforced" : "Optional"}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title={`Pending Access Requests (${pending.length})`}>
        {pending.length === 0 ? (
          <div className="px-5 py-10 text-center text-[12.5px] text-text-tertiary">
            No pending requests.
          </div>
        ) : (
          <ul className="flex flex-col">
            {pending.map((req) => (
              <li
                key={req.id}
                className="border-b border-border-subtle px-5 py-3 last:border-0"
              >
                <div className="flex items-start gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-brand-primary-subtle text-[10px] font-semibold text-brand-primary-hover">
                      {req.requesterInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-[12.5px]">
                    <div className="font-medium text-text-primary">{req.requesterName}</div>
                    <div className="text-[11.5px] text-text-secondary">
                      <span className="font-medium text-text-primary">{req.requestedRole}</span>{" "}
                      · {req.scope}
                    </div>
                    <div className="mt-1 text-[11px] text-text-tertiary tabular-nums" suppressHydrationWarning>
                      {formatRelativeTime(req.requestedAt)}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11.5px] text-text-secondary">
                      {req.justification}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-status-critical"
                    onClick={() => setResolving({ request: req, decision: "denied" })}
                  >
                    <X className="h-3.5 w-3.5" />
                    Deny
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setResolving({ request: req, decision: "approved" })}
                    className="gap-1 bg-brand-primary text-white hover:bg-brand-primary-hover"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <ResolveRequestDialog
        target={resolving}
        onCancel={() => setResolving(null)}
        onConfirm={(note) => {
          if (!resolving) return;
          resolveRequest(
            resolving.request.id,
            resolving.decision,
            currentOperator.name,
            note,
          );
          if (resolving.decision === "approved") {
            toast.success(`${resolving.request.requesterName} approved`, {
              description: `Granted ${resolving.request.requestedRole}.`,
            });
          } else {
            toast(`${resolving.request.requesterName} notified of denial`, {
              description: note,
            });
          }
          setResolving(null);
        }}
      />
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border-subtle bg-surface shadow-card">
      <div className="border-b border-border-subtle px-5 py-3">
        <h3 className="text-[13px] font-semibold text-text-primary">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function ResolveRequestDialog({
  target,
  onCancel,
  onConfirm,
}: {
  target: { request: AccessRequest; decision: "approved" | "denied" } | null;
  onCancel: () => void;
  onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const requireNote = target?.decision === "denied";
  const error =
    touched && requireNote && note.trim().length < 8
      ? "Denial reason must be at least 8 characters."
      : null;

  return (
    <AlertDialog
      open={target !== null}
      onOpenChange={(o) => {
        if (!o) {
          onCancel();
          setNote("");
          setTouched(false);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {target?.decision === "approved" ? "Approve" : "Deny"} access request
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[13px] text-text-secondary">
            {target?.request.requesterName} requesting {target?.request.requestedRole} for{" "}
            {target?.request.scope}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2 py-2">
          <Label className="text-[12px] font-medium text-text-primary">
            {target?.decision === "approved" ? "Note (optional)" : "Denial reason"}
          </Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => setTouched(true)}
            rows={3}
            placeholder={
              target?.decision === "approved"
                ? "e.g., Confirmed with manager."
                : "e.g., Scope is too broad — request narrower role."
            }
            className={error ? "border-status-critical" : ""}
          />
          {error ? <span className="text-[11.5px] text-status-critical">{error}</span> : null}
        </div>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (requireNote && note.trim().length < 8) {
                setTouched(true);
                return;
              }
              onConfirm(note.trim());
            }}
            className={
              target?.decision === "approved"
                ? "bg-brand-primary text-white hover:bg-brand-primary-hover"
                : "bg-status-critical text-white hover:bg-status-critical/90"
            }
          >
            {target?.decision === "approved" ? "Approve" : "Deny"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
