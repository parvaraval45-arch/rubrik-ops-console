"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  Shield,
  Tag,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { feedback } from "@/lib/feedback";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useConsoleStore } from "@/lib/store";
import { mockData, currentOperator } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Tenant } from "@/types";

interface BulkActionsBarProps {
  selected: Tenant[];
  onClearSelection: () => void;
}

export function BulkActionsBar({ selected, onClearSelection }: BulkActionsBarProps) {
  const bulkSuspend = useConsoleStore((s) => s.bulkSuspendTenants);
  const resumeTenant = useConsoleStore((s) => s.resumeTenant);
  const bulkApplyPolicy = useConsoleStore((s) => s.bulkApplyPolicy);
  const bulkChangeTier = useConsoleStore((s) => s.bulkChangeTier);
  const bulkAddTag = useConsoleStore((s) => s.bulkAddTag);

  const [policyOpen, setPolicyOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [tierOpen, setTierOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);

  const visible = selected.length > 0;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 30 }}
          className="pointer-events-auto fixed inset-x-0 bottom-6 z-40 flex justify-center px-4"
        >
          <div className="flex max-w-[760px] flex-wrap items-center gap-3 rounded-lg border border-l-4 border-border-default border-l-brand-primary bg-surface px-4 py-2.5 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {selected.slice(0, 3).map((t) => (
                  <Avatar key={t.id} className="h-7 w-7 border border-surface">
                    <AvatarFallback className="bg-brand-primary-subtle text-[10.5px] font-semibold text-brand-primary-hover">
                      {initials(t.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {selected.length > 3 ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-surface bg-canvas text-[10px] font-medium text-text-secondary">
                    +{selected.length - 3}
                  </span>
                ) : null}
              </div>
              <span className="text-[13px] font-medium text-text-primary tabular-nums">
                {selected.length} {selected.length === 1 ? "tenant" : "tenants"} selected
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  toast.success(`Backup queued for ${selected.length} tenants`, {
                    description: "Jobs starting within 30 seconds.",
                  });
                  onClearSelection();
                }}
              >
                <PlayCircle className="h-3.5 w-3.5" />
                Run Backup
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setPolicyOpen(true)}
              >
                <Shield className="h-3.5 w-3.5" />
                Apply Policy
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setTierOpen(true)}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Change Tier
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setTagOpen(true)}
              >
                <Tag className="h-3.5 w-3.5" />
                Add Tag
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  toast.success(`Exporting ${selected.length} tenants`, {
                    description: "tenants-export.csv downloaded.",
                  });
                }}
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-status-warning hover:bg-status-warning-subtle"
                onClick={() => setSuspendOpen(true)}
              >
                <PauseCircle className="h-3.5 w-3.5" />
                Suspend
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onSelect={() => toast("Reassign Cluster", { description: "Cluster reassignment lands in capacity admin." })}>
                    Reassign Cluster
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => toast.success(`Reports queued for ${selected.length} tenants.`)}>
                    Generate Reports
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => toast.success(`Communication sent to ${selected.length} tenant admins.`)}>
                    Send Communication
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={onClearSelection}
                    className="text-text-tertiary"
                  >
                    Clear selection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <button
              type="button"
              onClick={onClearSelection}
              className="ml-1 text-[11.5px] text-text-tertiary hover:text-text-primary hover:underline"
            >
              Clear selection
            </button>
          </div>

          <ApplyPolicyDialog
            open={policyOpen}
            selected={selected}
            onCancel={() => setPolicyOpen(false)}
            onConfirm={(policyId, reason) => {
              bulkApplyPolicy(selected.map((t) => t.id), policyId, currentOperator.name, reason);
              toast.success(`Policy applied to ${selected.length} tenants.`, {
                description: "Migration scheduled.",
              });
              setPolicyOpen(false);
              onClearSelection();
            }}
          />

          <SuspendDialog
            open={suspendOpen}
            selected={selected}
            onCancel={() => setSuspendOpen(false)}
            onConfirm={(reason, resumeDate) => {
              const ids = selected.map((t) => t.id);
              const count = ids.length;
              bulkSuspend(ids, currentOperator.name, reason, resumeDate);
              feedback.destructive(
                `${count} tenant${count === 1 ? "" : "s"} suspended`,
                {
                  description: "Tenant admins notified by email.",
                  undo: () => {
                    for (const id of ids) resumeTenant(id);
                    feedback.info("Suspension undone", {
                      description: `${count} tenant${count === 1 ? "" : "s"} restored to active.`,
                    });
                  },
                },
              );
              setSuspendOpen(false);
              onClearSelection();
            }}
          />

          <TierDialog
            open={tierOpen}
            selected={selected}
            onCancel={() => setTierOpen(false)}
            onConfirm={(tier) => {
              bulkChangeTier(selected.map((t) => t.id), tier, currentOperator.name);
              toast.success(`${selected.length} tenants moved to ${tier}.`);
              setTierOpen(false);
              onClearSelection();
            }}
          />

          <TagDialog
            open={tagOpen}
            selected={selected}
            onCancel={() => setTagOpen(false)}
            onConfirm={(tag) => {
              bulkAddTag(selected.map((t) => t.id), tag, currentOperator.name);
              toast.success(`Tag "${tag}" added to ${selected.length} tenants.`);
              setTagOpen(false);
              onClearSelection();
            }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter((c) => /[A-Za-z]/.test(c))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ApplyPolicyDialog({
  open,
  selected,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  selected: Tenant[];
  onCancel: () => void;
  onConfirm: (policyId: string, reason: string) => void;
}) {
  const [policyId, setPolicyId] = useState("");
  const [strategy, setStrategy] = useState<"immediate" | "staged" | "manual">("staged");
  const [reason, setReason] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [touched, setTouched] = useState(false);
  const error =
    touched && reason.trim().length < 6
      ? "Reason must be at least 6 characters."
      : null;
  const policyErr = touched && !policyId ? "Choose a policy template." : null;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          onCancel();
          setReason("");
          setPolicyId("");
          setTouched(false);
        }
      }}
    >
      <AlertDialogContent className="max-w-[520px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Apply Policy to {selected.length} Tenants</AlertDialogTitle>
          <AlertDialogDescription>
            All selected tenants will be migrated to the selected policy
            template. Migration is staged by default.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div>
            <Label className="text-[12px] font-medium text-text-primary">Selected tenants</Label>
            <ul className="mt-1 max-h-[80px] overflow-y-auto rounded-md border border-border-subtle bg-canvas p-2 text-[11.5px] text-text-secondary">
              {selected.slice(0, 3).map((t) => (
                <li key={t.id}>· {t.name}</li>
              ))}
              {selected.length > 3 ? (
                <li className="text-text-tertiary">+ {selected.length - 3} more</li>
              ) : null}
            </ul>
          </div>
          <div>
            <Label className="text-[12px] font-medium text-text-primary">Policy template</Label>
            <Select value={policyId} onValueChange={setPolicyId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose a policy template" />
              </SelectTrigger>
              <SelectContent>
                {mockData.policies.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {policyErr ? <span className="text-[11.5px] text-status-critical">{policyErr}</span> : null}
          </div>
          <div>
            <Label className="text-[12px] font-medium text-text-primary">Rollout strategy</Label>
            <RadioGroup
              value={strategy}
              onValueChange={(v) => setStrategy(v as typeof strategy)}
              className="mt-1 grid grid-cols-1 gap-1.5"
            >
              {[
                { v: "immediate" as const, l: "Immediate — apply to all at once" },
                { v: "staged" as const, l: "Staged Canary — 5% wave, then full rollout" },
                { v: "manual" as const, l: "Manual per-tenant — operator confirms each" },
              ].map((opt) => (
                <label
                  key={opt.v}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2 text-[12.5px]",
                    strategy === opt.v
                      ? "border-brand-primary bg-brand-primary-subtle"
                      : "border-border-subtle bg-surface",
                  )}
                >
                  <RadioGroupItem value={opt.v} />
                  <span>{opt.l}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
          <div>
            <Label className="text-[12px] font-medium text-text-primary">Reason</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setTouched(true)}
              rows={3}
              placeholder="e.g., Quarterly compliance refresh — moving Healthcare cohort to HIPAA Gold v4."
              className={error ? "border-status-critical" : ""}
            />
            {error ? <span className="text-[11.5px] text-status-critical">{error}</span> : null}
          </div>
          <label className="flex items-start gap-2 rounded-md border border-border-subtle bg-canvas px-3 py-2.5 text-[12.5px]">
            <Switch checked={dryRun} onCheckedChange={setDryRun} />
            <div>
              <div className="font-medium text-text-primary">Dry Run First</div>
              <div className="text-[11px] text-text-tertiary">
                Shows impact preview before applying.
              </div>
            </div>
          </label>
        </div>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="bg-brand-primary text-white hover:bg-brand-primary-hover"
            onClick={() => {
              if (!policyId || reason.trim().length < 6) {
                setTouched(true);
                return;
              }
              if (dryRun) {
                toast.success("Dry run complete", {
                  description: `${selected.length} tenants pre-validated. Applying for real…`,
                });
              }
              onConfirm(policyId, reason.trim());
            }}
          >
            {dryRun ? "Run Dry Run + Apply" : "Apply Policy"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SuspendDialog({
  open,
  selected,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  selected: Tenant[];
  onCancel: () => void;
  onConfirm: (reason: string, resumeDate: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [resumeDate, setResumeDate] = useState("");
  const [touched, setTouched] = useState(false);
  const reasonError = touched && reason.trim().length < 10 ? "Reason must be at least 10 characters." : null;
  const dateError = touched && !resumeDate ? "Estimated resume date is required." : null;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          onCancel();
          setReason("");
          setTouched(false);
        }
      }}
    >
      <AlertDialogContent className="max-w-[480px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-status-critical">
            Suspend {selected.length} Tenants?
          </AlertDialogTitle>
          <AlertDialogDescription>
            All scheduled backups halt immediately. Existing backup data is
            preserved. Each tenant admin is notified by email. Action is logged
            for audit per tenant.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div>
            <Label className="text-[12px] font-medium text-text-primary">Reason</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setTouched(true)}
              rows={3}
              placeholder="e.g., Coordinated maintenance window for cluster failover. Resume after Apr 30."
              className={reasonError ? "border-status-critical" : ""}
            />
            {reasonError ? <span className="text-[11.5px] text-status-critical">{reasonError}</span> : null}
          </div>
          <div>
            <Label className="text-[12px] font-medium text-text-primary">Estimated resume date</Label>
            <Input
              type="date"
              value={resumeDate}
              onChange={(e) => setResumeDate(e.target.value)}
              onBlur={() => setTouched(true)}
              className={dateError ? "border-status-critical" : ""}
            />
            {dateError ? <span className="text-[11.5px] text-status-critical">{dateError}</span> : null}
          </div>
        </div>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="bg-status-critical text-white hover:bg-status-critical/90"
            onClick={() => {
              if (reason.trim().length < 10 || !resumeDate) {
                setTouched(true);
                return;
              }
              onConfirm(reason.trim(), resumeDate);
            }}
          >
            Suspend {selected.length}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function TierDialog({
  open,
  selected,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  selected: Tenant[];
  onCancel: () => void;
  onConfirm: (tier: Tenant["tier"]) => void;
}) {
  const [tier, setTier] = useState<Tenant["tier"]>("Gold");
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change Tier for {selected.length} Tenants</AlertDialogTitle>
          <AlertDialogDescription>
            Tier changes alter rate cards, RPO/RTO targets, and SLA on next
            billing period.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Select value={tier} onValueChange={(v) => setTier(v as Tenant["tier"])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Platinum">Platinum</SelectItem>
            <SelectItem value="Gold">Gold</SelectItem>
            <SelectItem value="Silver">Silver</SelectItem>
            <SelectItem value="Bronze">Bronze</SelectItem>
          </SelectContent>
        </Select>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="bg-brand-primary text-white hover:bg-brand-primary-hover"
            onClick={() => onConfirm(tier)}
          >
            Move to {tier}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function TagDialog({
  open,
  selected,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  selected: Tenant[];
  onCancel: () => void;
  onConfirm: (tag: string) => void;
}) {
  const [tag, setTag] = useState("");
  const [custom, setCustom] = useState("");
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add Tag to {selected.length} Tenants</AlertDialogTitle>
          <AlertDialogDescription>
            Tags are searchable and can be saved as views.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <Label className="text-[12px] font-medium text-text-primary">Existing tag</Label>
          <Select value={tag} onValueChange={setTag}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an existing tag" />
            </SelectTrigger>
            <SelectContent>
              {mockData.tenantTagCatalog.map((t) => (
                <SelectItem key={t.id} value={t.label}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label className="text-[12px] font-medium text-text-primary">Or new tag</Label>
          <Input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="e.g., q3-renewal"
          />
        </div>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="bg-brand-primary text-white hover:bg-brand-primary-hover"
            onClick={() => {
              const next = (custom.trim() || tag).trim();
              if (!next) return;
              onConfirm(next);
              setTag("");
              setCustom("");
            }}
          >
            Add Tag
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

void Checkbox;
