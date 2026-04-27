"use client";

import { useState } from "react";
import Link from "next/link";
import { differenceInDays, parseISO } from "date-fns";
import {
  ChevronRight,
  FileDown,
  MoreHorizontal,
  PauseCircle,
  PencilLine,
  PlayCircle,
  Repeat,
  Server,
  ShieldOff,
  Trash2,
  UserCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusDot } from "@/components/data/status-dot";
import { PauseTenantDialog } from "./pause-tenant-dialog";
import { RunBackupDialog } from "./run-backup-dialog";
import { useConsoleStore } from "@/lib/store";
import { mockData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Tenant, Workload } from "@/types";

const TIER_BADGE: Record<Tenant["tier"], string> = {
  Platinum: "bg-slate-900 text-white",
  Gold: "bg-amber-100 text-amber-900",
  Silver: "bg-slate-200 text-slate-700",
  Bronze: "bg-orange-100 text-orange-900",
};

const STATUS_TONE: Record<Tenant["status"], "success" | "info" | "warning" | "critical"> = {
  Active: "success",
  Onboarding: "info",
  Suspended: "warning",
  Churned: "critical",
};

export interface TenantHeaderProps {
  tenant: Tenant;
  workloads: Workload[];
}

export function TenantHeader({ tenant, workloads }: TenantHeaderProps) {
  const cluster = mockData.clusters.find((c) => c.id === tenant.assignedClusterId);
  const onboardedDays = differenceInDays(
    new Date(),
    parseISO(tenant.createdAt),
  );
  const onboardedLabel =
    onboardedDays > 0
      ? `Onboarded ${onboardedDays} days ago by Alex Morrison`
      : "Onboarded today by Alex Morrison";

  const [pauseOpen, setPauseOpen] = useState(false);
  const [runBackupOpen, setRunBackupOpen] = useState(false);
  const resumeTenant = useConsoleStore((s) => s.resumeTenant);

  const isSuspended = tenant.status === "Suspended";

  const onResume = () => {
    resumeTenant(tenant.id);
    toast.success(`${tenant.name} resumed`, {
      description: "Scheduled backups re-enabled.",
    });
  };

  return (
    <div className="flex flex-col gap-4 pb-4">
      <nav className="flex items-center gap-1 text-[12px] text-text-tertiary">
        <Link href="/tenants" className="hover:text-text-primary">
          Tenants
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-text-secondary">{tenant.name}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-[24px] font-semibold tracking-tight text-text-primary">
            {tenant.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-text-secondary">
            <Badge
              variant="outline"
              className={cn(
                "border-transparent text-[11px] font-semibold uppercase tracking-wide",
                TIER_BADGE[tenant.tier],
              )}
            >
              {tenant.tier}
            </Badge>
            <StatusDot tone={STATUS_TONE[tenant.status]} label={tenant.status} />
            <Sep />
            <span className="inline-flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5 text-text-tertiary" />
              Cluster: {cluster?.name ?? tenant.assignedClusterId}
            </span>
            <Sep />
            <span>Namespace: {tenant.namespaceId}</span>
            <Sep />
            <span className="inline-flex items-center gap-1.5">
              <UserCircle className="h-3.5 w-3.5 text-text-tertiary" />
              {onboardedLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setRunBackupOpen(true)}
            className="gap-2 bg-brand-primary text-white hover:bg-brand-primary-hover"
            disabled={isSuspended}
            title={isSuspended ? "Cannot run backup: tenant suspended" : "Queue an on-demand backup"}
          >
            <PlayCircle className="h-4 w-4" />
            Run Backup Now
          </Button>
          <Button variant="outline" className="gap-2 border-border-default text-text-primary hover:bg-secondary">
            <PencilLine className="h-4 w-4" />
            Edit Policy
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-border-default text-text-secondary hover:bg-secondary"
                aria-label="More tenant actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isSuspended ? (
                <DropdownMenuItem onSelect={onResume} className="gap-2">
                  <PlayCircle className="h-4 w-4 text-status-success" />
                  Resume Tenant
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onSelect={() => setPauseOpen(true)}
                  className="gap-2"
                >
                  <PauseCircle className="h-4 w-4 text-status-warning" />
                  Pause Tenant
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="gap-2" onSelect={() =>
                toast("Edit Tier", { description: "Tier editor opens in policy phase." })
              }>
                <PencilLine className="h-4 w-4" />
                Edit Tier
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onSelect={() =>
                toast("Reassign Cluster", {
                  description: "Cluster reassignment requires capacity check.",
                })
              }>
                <Repeat className="h-4 w-4" />
                Reassign Cluster
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onSelect={() => {
                  const tid = toast.loading("Generating attestation report…");
                  setTimeout(() => {
                    toast.success("Attestation ready", {
                      id: tid,
                      duration: 4000,
                      description: `Compiled across ${tenant.workloadCount} workloads.`,
                    });
                  }, 1100);
                }}
              >
                <FileDown className="h-4 w-4" />
                Generate Attestation Report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-status-critical focus:bg-status-critical-subtle focus:text-status-critical"
                onSelect={() =>
                  toast("Offboard Tenant", {
                    description: "Tenant offboarding flow lands in Phase 1 polish.",
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
                Offboard Tenant
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isSuspended ? (
        <div className="flex items-center justify-between gap-4 rounded-md border border-status-warning/30 bg-status-warning-subtle px-4 py-3">
          <div className="flex items-center gap-3">
            <ShieldOff className="h-5 w-5 text-status-warning" />
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-status-warning">
                This tenant is suspended.
              </span>
              <span className="text-[12px] text-text-secondary">
                Scheduled backups are halted. Resume to restore operations.
              </span>
            </div>
          </div>
          <Button
            onClick={onResume}
            className="bg-brand-primary text-white hover:bg-brand-primary-hover"
          >
            Resume Tenant
          </Button>
        </div>
      ) : null}

      <PauseTenantDialog tenant={tenant} open={pauseOpen} onOpenChange={setPauseOpen} />
      <RunBackupDialog
        tenant={tenant}
        workloads={workloads}
        open={runBackupOpen}
        onOpenChange={setRunBackupOpen}
      />
    </div>
  );
}

function Sep() {
  return <span className="select-none text-text-tertiary">·</span>;
}
