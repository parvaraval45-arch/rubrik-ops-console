"use client";

import { useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GitCommit, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/formatters";
import { toast } from "sonner";
import { ALL_FIELDS, FIELD_LABELS, configFieldValue } from "./policy-helpers";
import { useConsoleStore } from "@/lib/store";
import { currentOperator } from "@/lib/mock-data";
import type { PolicyTemplate, PolicyTemplateConfig } from "@/types";

interface TabVersionHistoryProps {
  template: PolicyTemplate;
  onSwitchToRollout: () => void;
}

export function TabVersionHistory({
  template,
  onSwitchToRollout,
}: TabVersionHistoryProps) {
  const sorted = [...template.versions].sort((a, b) => b.version - a.version);
  const currentVersion = template.currentVersion;
  const initialCompareTo = sorted.length > 1 ? sorted[1].version : sorted[0].version;
  const [selectedVersion, setSelectedVersion] = useState<number>(currentVersion);
  const [compareToVersion, setCompareToVersion] = useState<number>(initialCompareTo);
  const [revertOpen, setRevertOpen] = useState(false);
  const [revertReason, setRevertReason] = useState("");
  const [revertStrategy, setRevertStrategy] = useState<
    "Immediate" | "Staged" | "Manual"
  >("Staged");

  const savePolicyTemplateVersion = useConsoleStore((s) => s.savePolicyTemplateVersion);

  const left = template.versions.find((v) => v.version === compareToVersion);
  const right = template.versions.find((v) => v.version === selectedVersion);

  const diffRows = useMemo(() => {
    if (!left || !right) return [];
    return ALL_FIELDS.map((field) => {
      const leftVal = configFieldValue(left.config, field);
      const rightVal = configFieldValue(right.config, field);
      const status: "unchanged" | "modified" | "added" | "removed" =
        leftVal === rightVal
          ? "unchanged"
          : leftVal === "None" || leftVal === ""
            ? "added"
            : rightVal === "None" || rightVal === ""
              ? "removed"
              : "modified";
      return { field, leftVal, rightVal, status };
    });
  }, [left, right]);

  const changedRows = diffRows.filter((r) => r.status !== "unchanged");

  function handleRevert(): void {
    if (!left || !revertReason.trim()) return;
    const newVersion = savePolicyTemplateVersion(
      template.id,
      left.config,
      `Rolled back to v${left.version} configuration. Reason: ${revertReason.trim()}`,
      currentOperator.name,
    );
    setRevertOpen(false);
    setRevertReason("");
    toast.success(`v${newVersion} created from v${left.version}`, {
      description: "Configure rollout in the Rollout Manager tab.",
    });
    onSwitchToRollout();
  }

  return (
    <div className="grid grid-cols-[300px_1fr] gap-4">
      <div className="flex flex-col gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
          Versions
        </div>
        <div className="flex max-h-[560px] flex-col gap-1.5 overflow-y-auto pr-1">
          {sorted.map((v) => {
            const isCurrent = v.version === currentVersion;
            const isSelected = v.version === selectedVersion;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVersion(v.version)}
                className={cn(
                  "group flex flex-col gap-1.5 rounded-md border p-2.5 text-left transition-colors",
                  isSelected
                    ? "border-brand-primary bg-brand-primary-subtle"
                    : "border-border-subtle bg-surface hover:bg-secondary",
                )}
              >
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1 px-1.5 py-0 text-[11px] font-medium tabular-nums",
                      isCurrent
                        ? "border-brand-primary bg-white text-brand-primary-hover"
                        : "border-border-default bg-secondary text-text-secondary",
                    )}
                  >
                    <GitCommit className="h-2.5 w-2.5" />v{v.version}
                  </Badge>
                  {isCurrent ? (
                    <span className="text-[10px] uppercase tracking-wide text-brand-primary-hover">
                      Current
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-5 w-5 text-[9px]">
                    <AvatarFallback className="bg-secondary text-text-secondary">
                      {v.authoredBy
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-[11px] font-medium text-text-primary">
                    {v.authoredBy}
                  </span>
                </div>
                <div
                  className="text-[11px] tabular-nums text-text-tertiary"
                  title={formatDateTime(v.authoredAt)}
                >
                  {formatRelativeAbbr(v.authoredAt)}
                </div>
                <div className="line-clamp-2 text-[11.5px] leading-snug text-text-secondary">
                  {v.changeSummary}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-subtle bg-surface p-2.5">
          <div className="text-[12px] text-text-secondary">
            Comparing{" "}
            <span className="font-semibold text-text-primary">
              v{compareToVersion}
            </span>{" "}
            vs{" "}
            <span className="font-semibold text-text-primary">
              v{selectedVersion}
              {selectedVersion === currentVersion ? " (current)" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-[11px] text-text-tertiary">Compare with:</Label>
            <Select
              value={String(compareToVersion)}
              onValueChange={(v) => setCompareToVersion(Number(v))}
            >
              <SelectTrigger className="h-7 w-[110px] text-[12px]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sorted.map((v) => (
                  <SelectItem key={v.id} value={String(v.version)}>
                    v{v.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {left && left.version !== currentVersion ? (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 border-status-warning text-status-warning hover:bg-status-warning-subtle"
                onClick={() => setRevertOpen(true)}
              >
                <RotateCcw className="h-3 w-3" />
                Revert to v{left.version}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
          <div className="grid grid-cols-[200px_1fr_1fr] border-b border-border-subtle bg-secondary text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
            <div className="px-3 py-2">Field</div>
            <div className="px-3 py-2">
              {left ? `v${left.version} — ${formatRelativeAbbr(left.authoredAt)} by ${left.authoredBy}` : "—"}
            </div>
            <div className="px-3 py-2">
              {right ? `v${right.version} — ${formatRelativeAbbr(right.authoredAt)} by ${right.authoredBy}` : "—"}
            </div>
          </div>
          <div className="max-h-[480px] overflow-y-auto">
            {diffRows.map((row) => (
              <DiffRow
                key={row.field}
                field={row.field}
                leftVal={row.leftVal}
                rightVal={row.rightVal}
                status={row.status}
              />
            ))}
          </div>
        </div>

        {right ? (
          <div className="rounded-lg border border-border-subtle bg-secondary/40 p-3 text-[12px] text-text-secondary">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
              v{right.version} change summary
            </div>
            <p className="leading-relaxed">{right.changeSummary}</p>
            {right.migrationOutcome ? (
              <p className="mt-2 leading-relaxed text-text-tertiary">
                <span className="font-medium text-text-secondary">
                  Migration outcome:
                </span>{" "}
                {right.migrationOutcome}
              </p>
            ) : null}
            <div className="mt-2 flex items-center gap-2 text-[11px] text-text-tertiary">
              <span>{changedRows.length} field changes</span>
            </div>
          </div>
        ) : null}
      </div>

      <AlertDialog open={revertOpen} onOpenChange={setRevertOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Revert template to v{left?.version ?? "?"}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] leading-relaxed">
              This will create a new version (v{template.currentVersion + 1}) that matches v
              {left?.version} configuration. Current v{template.currentVersion} remains in
              history. All tenants currently on v{template.currentVersion} will be migrated to
              v{template.currentVersion + 1} (which is identical to v{left?.version}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div className="flex flex-col gap-1">
              <Label className="text-[12px] font-medium text-text-secondary">
                Reason for rollback
              </Label>
              <Textarea
                value={revertReason}
                onChange={(e) => setRevertReason(e.target.value)}
                rows={3}
                placeholder="Required for compliance audit"
                className="text-[12px]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-[12px] font-medium text-text-secondary">
                Rollout strategy
              </Label>
              <Select
                value={revertStrategy}
                onValueChange={(v) =>
                  setRevertStrategy(v as "Immediate" | "Staged" | "Manual")
                }
              >
                <SelectTrigger className="h-9 text-[13px]" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Immediate">Immediate</SelectItem>
                  <SelectItem value="Staged">Staged (canary first)</SelectItem>
                  <SelectItem value="Manual">Manual per-tenant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevert}
              disabled={!revertReason.trim()}
              className="bg-status-warning text-white hover:bg-status-warning/90"
            >
              Create v{template.currentVersion + 1} from v{left?.version}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface DiffRowProps {
  field: keyof PolicyTemplateConfig;
  leftVal: string;
  rightVal: string;
  status: "unchanged" | "modified" | "added" | "removed";
}

function DiffRow({ field, leftVal, rightVal, status }: DiffRowProps) {
  const baseRowCls = "grid grid-cols-[200px_1fr_1fr] border-b border-border-subtle text-[12.5px]";
  const fieldCls = "px-3 py-2 font-medium text-text-secondary";

  if (status === "unchanged") {
    return (
      <div className={baseRowCls}>
        <div className={fieldCls}>{FIELD_LABELS[field]}</div>
        <div className="px-3 py-2 tabular-nums text-text-tertiary">{leftVal}</div>
        <div className="px-3 py-2 tabular-nums text-text-tertiary">{rightVal}</div>
      </div>
    );
  }
  if (status === "added") {
    return (
      <div className={baseRowCls}>
        <div className={fieldCls}>{FIELD_LABELS[field]}</div>
        <div className="px-3 py-2 text-text-tertiary">—</div>
        <div className="bg-status-success-subtle px-3 py-2">
          <Badge
            variant="outline"
            className="mr-2 border-status-success bg-white px-1 py-0 text-[10px] uppercase tracking-wide text-status-success"
          >
            + new
          </Badge>
          <span className="tabular-nums font-medium text-status-success">{rightVal}</span>
        </div>
      </div>
    );
  }
  if (status === "removed") {
    return (
      <div className={baseRowCls}>
        <div className={fieldCls}>{FIELD_LABELS[field]}</div>
        <div className="bg-status-critical-subtle px-3 py-2">
          <Badge
            variant="outline"
            className="mr-2 border-status-critical bg-white px-1 py-0 text-[10px] uppercase tracking-wide text-status-critical"
          >
            deprecated
          </Badge>
          <span className="tabular-nums text-status-critical line-through">{leftVal}</span>
        </div>
        <div className="px-3 py-2 text-text-tertiary">—</div>
      </div>
    );
  }
  return (
    <div className={baseRowCls}>
      <div className={fieldCls}>{FIELD_LABELS[field]}</div>
      <div className="bg-status-warning-subtle px-3 py-2 tabular-nums text-status-warning">
        {leftVal}
      </div>
      <div className="bg-status-warning-subtle px-3 py-2 tabular-nums font-medium text-status-warning">
        {rightVal}
      </div>
    </div>
  );
}

function formatRelativeAbbr(date: string): string {
  const ms = Date.now() - Date.parse(date);
  const days = Math.round(ms / (24 * 60 * 60_000));
  if (days < 1) {
    const hours = Math.max(1, Math.round(ms / (60 * 60_000)));
    return `${hours}h ago`;
  }
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.round(days / 30)} months ago`;
  return `${Math.round(days / 365)} years ago`;
}
