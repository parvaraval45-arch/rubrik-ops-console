"use client";

import { useMemo, useState } from "react";
import { ChevronRight, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useConsoleStore } from "@/lib/store";
import { formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type {
  PolicyTemplate,
  PolicyTemplateAuditAction,
  PolicyTemplateAuditEntry,
} from "@/types";

interface TabAuditProps {
  template: PolicyTemplate;
}

const ACTION_LABELS: Record<PolicyTemplateAuditAction, string> = {
  "template.create": "Template Created",
  "template.version.publish": "Version Published",
  "template.tenant.apply": "Tenant Applied",
  "template.tenant.remove": "Tenant Removed",
  "template.override.add": "Override Added",
  "template.override.remove": "Override Removed",
  "template.rollout.start": "Rollout Started",
  "template.rollout.promote": "Rollout Promoted",
  "template.rollout.complete": "Rollout Completed",
  "template.rollout.abort": "Rollout Aborted",
  "template.rollback": "Rolled Back",
  "template.archive": "Template Archived",
};

export function TabAudit({ template }: TabAuditProps) {
  const allAudit = useConsoleStore((s) => s.policyTemplateAudit);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [operatorFilter, setOperatorFilter] = useState<string>("");

  const events = useMemo(() => {
    const filtered = allAudit
      .filter((e) => e.templateId === template.id)
      .filter((e) => actionFilter === "all" || e.action === actionFilter)
      .filter((e) =>
        operatorFilter ? e.actor.toLowerCase().includes(operatorFilter.toLowerCase()) : true,
      );
    return filtered.sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
  }, [allAudit, template.id, actionFilter, operatorFilter]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="h-8 w-[200px]" size="sm">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {Object.entries(ACTION_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={operatorFilter}
          onChange={(e) => setOperatorFilter(e.target.value)}
          placeholder="Filter by operator name"
          className="h-8 w-[220px] text-[13px]"
        />
        <span className="ml-auto text-[12px] tabular-nums text-text-tertiary">
          {events.length} events
        </span>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-default bg-secondary/50 p-10 text-center">
          <FileText className="h-6 w-6 text-text-tertiary" />
          <div className="text-[13px] font-medium text-text-secondary">
            No matching audit events
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
          <div className="grid grid-cols-[180px_180px_180px_1fr_90px] gap-3 border-b border-border-subtle bg-secondary px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
            <span>Timestamp</span>
            <span>Operator</span>
            <span>Action</span>
            <span>Details</span>
            <span className="text-right">Result</span>
          </div>
          <div className="divide-y divide-border-subtle">
            {events.map((event) => (
              <AuditRow key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AuditRow({ event }: { event: PolicyTemplateAuditEntry }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="grid w-full grid-cols-[180px_180px_180px_1fr_90px] items-center gap-3 px-4 py-2.5 text-left text-[12px] transition-colors hover:bg-secondary/50"
      >
        <span className="tabular-nums text-text-secondary">
          {formatDateTime(event.occurredAt)}
        </span>
        <span className="truncate font-medium text-text-primary">{event.actor}</span>
        <span className="truncate text-text-secondary">
          {ACTION_LABELS[event.action]}
        </span>
        <span className="flex min-w-0 items-center gap-1 truncate text-text-secondary">
          <ChevronRight
            className={cn(
              "h-3 w-3 shrink-0 transition-transform",
              open && "rotate-90",
            )}
          />
          <span className="truncate">{event.description}</span>
        </span>
        <span className="text-right">
          <Badge
            variant="outline"
            className={cn(
              "px-1.5 py-0 text-[10px] capitalize",
              event.outcome === "success"
                ? "border-status-success-subtle bg-status-success-subtle text-status-success"
                : "border-status-critical-subtle bg-status-critical-subtle text-status-critical",
            )}
          >
            {event.outcome}
          </Badge>
        </span>
      </button>
      {open ? (
        <div className="border-t border-border-subtle bg-secondary/30 px-4 py-3 text-[12px] text-text-secondary">
          <dl className="grid grid-cols-[140px_1fr] gap-y-1.5">
            <dt className="text-text-tertiary">Event ID</dt>
            <dd className="tabular-nums">{event.id}</dd>
            <dt className="text-text-tertiary">Actor role</dt>
            <dd>{event.actorRole}</dd>
            {event.targetVersion ? (
              <>
                <dt className="text-text-tertiary">Target version</dt>
                <dd className="tabular-nums">v{event.targetVersion}</dd>
              </>
            ) : null}
            <dt className="text-text-tertiary">Description</dt>
            <dd className="leading-relaxed">{event.description}</dd>
          </dl>
        </div>
      ) : null}
    </div>
  );
}
