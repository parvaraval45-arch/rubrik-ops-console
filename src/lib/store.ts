"use client";

import { create } from "zustand";
import { mockData } from "./mock-data";
import type {
  Alarm,
  AlarmState,
  Alert,
  AuditEvent,
  CompletedOnboarding,
  DetailedAuditEvent,
  IsolationCheck,
  IsolationCheckId,
  JobLogLine,
  JobSession,
  KeyRotationStatus,
  MonthlyConsumption,
  OnboardingDraft,
  Policy,
  PolicyAssignment,
  PolicyOverride,
  PolicyVersion,
  QuotaUsage,
  RestorePoint,
  Tenant,
  ThreatEvent,
  ValidationWindowEntry,
  Workload,
  BackupJobStatus,
} from "@/types";

interface PerTenantState {
  workloads: Record<string, Workload[]>;
  alarms: Record<string, Alarm[]>;
  jobs: Record<string, JobSession[]>;
  restorePoints: Record<string, RestorePoint[]>;
  threats: Record<string, ThreatEvent[]>;
  policyAssignments: Record<string, PolicyAssignment>;
  detailedAudit: Record<string, DetailedAuditEvent[]>;
  monthly: Record<string, MonthlyConsumption[]>;
  quota: Record<string, QuotaUsage>;
  keyRotation: Record<string, KeyRotationStatus>;
}

function bootstrapPerTenant(): PerTenantState {
  const out: PerTenantState = {
    workloads: {},
    alarms: {},
    jobs: {},
    restorePoints: {},
    threats: {},
    policyAssignments: {},
    detailedAudit: {},
    monthly: {},
    quota: {},
    keyRotation: {},
  };
  for (const tenant of mockData.tenants) {
    const detail = mockData.tenantDetails[tenant.id];
    if (!detail) continue;
    out.workloads[tenant.id] = detail.workloads;
    out.alarms[tenant.id] = detail.alarms;
    out.jobs[tenant.id] = detail.jobs;
    out.restorePoints[tenant.id] = detail.restorePoints;
    out.threats[tenant.id] = detail.threats;
    out.policyAssignments[tenant.id] = detail.policy;
    out.detailedAudit[tenant.id] = detail.audit;
    out.monthly[tenant.id] = detail.monthly;
    out.quota[tenant.id] = detail.quota;
    out.keyRotation[tenant.id] = detail.keyRotation;
  }
  return out;
}

export interface SavedView {
  id: string;
  name: string;
  filters: Record<string, string[]>;
}

interface ConsoleState extends PerTenantState {
  tenants: Tenant[];
  policies: Policy[];
  alerts: Alert[];
  isolationChecks: IsolationCheck[];
  auditEvents: AuditEvent[];
  drafts: OnboardingDraft[];
  validationWindow: ValidationWindowEntry[];
  completedOnboardings: CompletedOnboarding[];
  avgOnboardingSeconds: number;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  density: "comfortable" | "compact";
  savedViews: SavedView[];
  activeFilters: Record<string, string[]>;

  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setCommandPaletteOpen: (v: boolean) => void;
  setDensity: (d: "comfortable" | "compact") => void;

  addTenant: (tenant: Tenant) => void;
  acknowledgeAlert: (alertId: string, operatorName: string) => void;

  addPolicyVersion: (policyId: string, version: Omit<PolicyVersion, "id" | "policyId" | "version">) => void;
  setActivePolicyVersion: (policyId: string, version: number) => void;

  remediateIsolationCheck: (tenantId: string, checkId: IsolationCheckId) => void;
  completeRemediation: (tenantId: string, checkId: IsolationCheckId) => void;

  // ── Tenant detail workflow actions ────────────────────────────────────────
  pauseTenant: (tenantId: string, reason: string, resumeDate?: string) => void;
  resumeTenant: (tenantId: string) => void;

  acknowledgeAlarm: (
    tenantId: string,
    alarmId: string,
    operatorName: string,
    note: string,
  ) => void;
  assignAlarm: (tenantId: string, alarmId: string, assignee: string) => void;
  resolveAlarm: (
    tenantId: string,
    alarmId: string,
    operatorName: string,
    note: string,
  ) => void;

  enqueueBackup: (tenantId: string, workloadId: string, operatorName: string) => string;
  updateJobProgress: (tenantId: string, jobId: string, progress: number) => void;
  completeJob: (
    tenantId: string,
    jobId: string,
    finalStatus: BackupJobStatus,
    log?: JobLogLine[],
    errorMessage?: string,
  ) => void;

  retryJob: (tenantId: string, jobId: string, operatorName: string) => string;

  addPolicyOverride: (
    tenantId: string,
    override: Omit<PolicyOverride, "id" | "appliedAt">,
  ) => void;
  resetPolicyOverrides: (tenantId: string, operatorName: string) => void;

  rotateTenantKey: (tenantId: string, operatorName: string) => void;

  recordDetailedAudit: (tenantId: string, event: DetailedAuditEvent) => void;

  // ── Onboarding lifecycle ──────────────────────────────────────────────────
  createDraft: (operatorName: string) => string;
  upsertDraft: (draft: OnboardingDraft) => void;
  deleteDraft: (draftId: string) => void;
  reassignDraft: (draftId: string, toOperator: string, byOperator: string, note?: string) => void;
  completeOnboarding: (params: {
    draft: OnboardingDraft;
    tenant: Tenant;
    durationSec: number;
    deployedBy: string;
  }) => void;
  removeFromValidationWindow: (tenantId: string) => void;
}

function makeAuditId(prefix = "audit") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

const PER_TENANT_INITIAL = bootstrapPerTenant();

export const useConsoleStore = create<ConsoleState>((set, get) => ({
  tenants: mockData.tenants,
  policies: mockData.policies,
  alerts: mockData.alerts,
  isolationChecks: mockData.isolationChecks,
  auditEvents: mockData.auditEvents,
  ...PER_TENANT_INITIAL,
  drafts: mockData.drafts,
  validationWindow: mockData.validationWindow,
  completedOnboardings: mockData.completedOnboardings,
  avgOnboardingSeconds: 18 * 60 + 42,
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  density: "comfortable",
  savedViews: [
    { id: "sv_default", name: "All tenants", filters: {} as Record<string, string[]> },
    {
      id: "sv_critical",
      name: "Critical alerts",
      filters: { severity: ["critical"] } as Record<string, string[]>,
    },
    {
      id: "sv_at_risk",
      name: "Tenants at risk",
      filters: { status: ["Active"], securityScore: ["below_85"] } as Record<string, string[]>,
    },
  ],
  activeFilters: {},

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
  setDensity: (d) => set({ density: d }),

  addTenant: (tenant) =>
    set((s) => ({
      tenants: [tenant, ...s.tenants],
      auditEvents: [
        {
          id: `aud_local_${Date.now()}`,
          actor: "Alex Morrison",
          actorRole: "MSP Admin",
          action: "tenant.create",
          target: tenant.name,
          tenantId: tenant.id,
          outcome: "success",
          occurredAt: new Date().toISOString(),
          ipAddress: "10.0.4.18",
        },
        ...s.auditEvents,
      ],
    })),

  acknowledgeAlert: (alertId, operatorName) =>
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === alertId
          ? { ...a, status: "acknowledged", acknowledgedBy: operatorName, acknowledgedAt: new Date().toISOString() }
          : a,
      ),
    })),

  addPolicyVersion: (policyId, version) =>
    set((s) => ({
      policies: s.policies.map((p) => {
        if (p.id !== policyId) return p;
        const nextVersionNumber = p.currentVersion + 1;
        const newVersion: PolicyVersion = {
          ...version,
          id: `pv_${policyId}_${nextVersionNumber}`,
          policyId,
          version: nextVersionNumber,
        };
        return {
          ...p,
          currentVersion: nextVersionNumber,
          versions: [...p.versions, newVersion],
          updatedAt: new Date().toISOString(),
        };
      }),
    })),

  setActivePolicyVersion: (policyId, version) =>
    set((s) => ({
      policies: s.policies.map((p) =>
        p.id === policyId ? { ...p, currentVersion: version, updatedAt: new Date().toISOString() } : p,
      ),
    })),

  remediateIsolationCheck: (tenantId, checkId) =>
    set((s) => ({
      isolationChecks: s.isolationChecks.map((c) =>
        c.tenantId === tenantId && c.checkId === checkId ? { ...c, status: "remediating" } : c,
      ),
    })),

  completeRemediation: (tenantId, checkId) =>
    set((s) => ({
      isolationChecks: s.isolationChecks.map((c) =>
        c.tenantId === tenantId && c.checkId === checkId
          ? {
              ...c,
              status: "pass",
              evidence: c.evidence + " Remediation applied at " + new Date().toISOString() + ".",
              lastVerifiedAt: new Date().toISOString(),
              remediationAvailable: false,
            }
          : c,
      ),
    })),

  // ── Tenant detail workflows ──────────────────────────────────────────────
  pauseTenant: (tenantId, reason, resumeDate) =>
    set((s) => {
      const tenant = s.tenants.find((t) => t.id === tenantId);
      if (!tenant) return {};
      const event: DetailedAuditEvent = {
        id: makeAuditId(),
        actor: "Alex Morrison",
        actorRole: "MSP Admin",
        action: "tenant.suspend",
        target: tenant.name,
        tenantId,
        outcome: "success",
        occurredAt: new Date().toISOString(),
        ipAddress: "10.0.4.127",
        sessionId: `sess_${Math.random().toString(36).slice(2, 10)}`,
        userAgent: "Mozilla/5.0",
        geo: "San Francisco, CA, US",
        description: `Tenant suspended. Reason: ${reason}${
          resumeDate ? ` · Estimated resume: ${resumeDate}` : ""
        }`,
      };
      return {
        tenants: s.tenants.map((t) =>
          t.id === tenantId ? { ...t, status: "Suspended" as const } : t,
        ),
        detailedAudit: {
          ...s.detailedAudit,
          [tenantId]: [event, ...(s.detailedAudit[tenantId] ?? [])],
        },
        auditEvents: [
          {
            id: event.id,
            actor: event.actor,
            actorRole: event.actorRole,
            action: event.action,
            target: event.target,
            tenantId,
            outcome: event.outcome,
            occurredAt: event.occurredAt,
            ipAddress: event.ipAddress,
          },
          ...s.auditEvents,
        ],
      };
    }),

  resumeTenant: (tenantId) =>
    set((s) => {
      const tenant = s.tenants.find((t) => t.id === tenantId);
      if (!tenant) return {};
      const event: DetailedAuditEvent = {
        id: makeAuditId(),
        actor: "Alex Morrison",
        actorRole: "MSP Admin",
        action: "tenant.resume",
        target: tenant.name,
        tenantId,
        outcome: "success",
        occurredAt: new Date().toISOString(),
        ipAddress: "10.0.4.127",
        sessionId: `sess_${Math.random().toString(36).slice(2, 10)}`,
        userAgent: "Mozilla/5.0",
        geo: "San Francisco, CA, US",
        description: "Tenant resumed. Scheduled backups re-enabled.",
      };
      return {
        tenants: s.tenants.map((t) =>
          t.id === tenantId ? { ...t, status: "Active" as const } : t,
        ),
        detailedAudit: {
          ...s.detailedAudit,
          [tenantId]: [event, ...(s.detailedAudit[tenantId] ?? [])],
        },
        auditEvents: [
          {
            id: event.id,
            actor: event.actor,
            actorRole: event.actorRole,
            action: event.action,
            target: event.target,
            tenantId,
            outcome: event.outcome,
            occurredAt: event.occurredAt,
            ipAddress: event.ipAddress,
          },
          ...s.auditEvents,
        ],
      };
    }),

  acknowledgeAlarm: (tenantId, alarmId, operatorName, note) =>
    set((s) => {
      const alarms = s.alarms[tenantId] ?? [];
      const target = alarms.find((a) => a.id === alarmId);
      if (!target) return {};
      const updated: Alarm = {
        ...target,
        state: "acknowledged" as AlarmState,
        acknowledgedBy: operatorName,
        acknowledgedAt: new Date().toISOString(),
        acknowledgmentNote: note,
      };
      const event: DetailedAuditEvent = {
        id: makeAuditId(),
        actor: operatorName,
        actorRole: "MSP Admin",
        action: "alarm.acknowledge",
        target: target.title,
        tenantId,
        outcome: "success",
        occurredAt: new Date().toISOString(),
        ipAddress: "10.0.4.127",
        sessionId: `sess_${Math.random().toString(36).slice(2, 10)}`,
        userAgent: "Mozilla/5.0",
        geo: "San Francisco, CA, US",
        description: `Acknowledged alarm "${target.title}". Note: ${note}`,
      };
      return {
        alarms: {
          ...s.alarms,
          [tenantId]: alarms.map((a) => (a.id === alarmId ? updated : a)),
        },
        detailedAudit: {
          ...s.detailedAudit,
          [tenantId]: [event, ...(s.detailedAudit[tenantId] ?? [])],
        },
      };
    }),

  assignAlarm: (tenantId, alarmId, assignee) =>
    set((s) => {
      const alarms = s.alarms[tenantId] ?? [];
      const target = alarms.find((a) => a.id === alarmId);
      if (!target) return {};
      const updated: Alarm = {
        ...target,
        assignedTo: assignee,
        assignedAt: new Date().toISOString(),
      };
      const event: DetailedAuditEvent = {
        id: makeAuditId(),
        actor: "Alex Morrison",
        actorRole: "MSP Admin",
        action: "alarm.assign",
        target: target.title,
        tenantId,
        outcome: "success",
        occurredAt: new Date().toISOString(),
        ipAddress: "10.0.4.127",
        sessionId: `sess_${Math.random().toString(36).slice(2, 10)}`,
        userAgent: "Mozilla/5.0",
        geo: "San Francisco, CA, US",
        description: `Assigned alarm "${target.title}" to ${assignee}.`,
      };
      return {
        alarms: {
          ...s.alarms,
          [tenantId]: alarms.map((a) => (a.id === alarmId ? updated : a)),
        },
        detailedAudit: {
          ...s.detailedAudit,
          [tenantId]: [event, ...(s.detailedAudit[tenantId] ?? [])],
        },
      };
    }),

  resolveAlarm: (tenantId, alarmId, operatorName, note) =>
    set((s) => {
      const alarms = s.alarms[tenantId] ?? [];
      const target = alarms.find((a) => a.id === alarmId);
      if (!target) return {};
      const updated: Alarm = {
        ...target,
        state: "resolved" as AlarmState,
        resolvedBy: operatorName,
        resolvedAt: new Date().toISOString(),
        resolutionNote: note,
      };
      const event: DetailedAuditEvent = {
        id: makeAuditId(),
        actor: operatorName,
        actorRole: "MSP Admin",
        action: "alarm.resolve",
        target: target.title,
        tenantId,
        outcome: "success",
        occurredAt: new Date().toISOString(),
        ipAddress: "10.0.4.127",
        sessionId: `sess_${Math.random().toString(36).slice(2, 10)}`,
        userAgent: "Mozilla/5.0",
        geo: "San Francisco, CA, US",
        description: `Resolved alarm "${target.title}". Resolution: ${note}`,
      };
      return {
        alarms: {
          ...s.alarms,
          [tenantId]: alarms.map((a) => (a.id === alarmId ? updated : a)),
        },
        detailedAudit: {
          ...s.detailedAudit,
          [tenantId]: [event, ...(s.detailedAudit[tenantId] ?? [])],
        },
      };
    }),

  enqueueBackup: (tenantId, workloadId, operatorName) => {
    const id = `job_${tenantId}_ondemand_${Date.now().toString(36)}`;
    const workload = (get().workloads[tenantId] ?? []).find((w) => w.id === workloadId);
    if (!workload) return id;
    const session: JobSession = {
      id,
      tenantId,
      workloadId,
      workloadName: workload.name,
      workloadType: workload.type,
      jobType: "On-Demand",
      status: "queued",
      startedAt: new Date().toISOString(),
      durationSec: 0,
      bytesTransferred: 0,
      bytesSource: Math.round(workload.sizeTB * 1_000_000_000_000),
      throughputMBps: 0,
      dedupRatio: 0,
      compressionRatio: 0,
      policyId: workload.policyId,
      log: [
        {
          ts: new Date().toISOString(),
          level: "INFO",
          message: `Job queued by ${operatorName}.`,
        },
      ],
      progress: 0,
    };
    set((s) => {
      const event: DetailedAuditEvent = {
        id: makeAuditId(),
        actor: operatorName,
        actorRole: "MSP Admin",
        action: "backup.run",
        target: workload.name,
        tenantId,
        outcome: "success",
        occurredAt: new Date().toISOString(),
        ipAddress: "10.0.4.127",
        sessionId: `sess_${Math.random().toString(36).slice(2, 10)}`,
        userAgent: "Mozilla/5.0",
        geo: "San Francisco, CA, US",
        description: `On-demand backup queued for ${workload.name}.`,
      };
      return {
        jobs: {
          ...s.jobs,
          [tenantId]: [session, ...(s.jobs[tenantId] ?? [])],
        },
        detailedAudit: {
          ...s.detailedAudit,
          [tenantId]: [event, ...(s.detailedAudit[tenantId] ?? [])],
        },
      };
    });
    return id;
  },

  updateJobProgress: (tenantId, jobId, progress) =>
    set((s) => ({
      jobs: {
        ...s.jobs,
        [tenantId]: (s.jobs[tenantId] ?? []).map((j) =>
          j.id === jobId
            ? {
                ...j,
                progress,
                status: progress > 0 && progress < 100 ? "running" : j.status,
              }
            : j,
        ),
      },
    })),

  completeJob: (tenantId, jobId, finalStatus, log, errorMessage) =>
    set((s) => {
      const jobs = s.jobs[tenantId] ?? [];
      const job = jobs.find((j) => j.id === jobId);
      if (!job) return {};
      const endedAt = new Date().toISOString();
      const durationSec =
        Math.round((Date.parse(endedAt) - Date.parse(job.startedAt)) / 1000) || 1;
      const updated: JobSession = {
        ...job,
        status: finalStatus,
        endedAt,
        durationSec,
        bytesTransferred:
          finalStatus === "succeeded"
            ? Math.round(job.bytesSource / 4.2)
            : 0,
        throughputMBps:
          finalStatus === "succeeded"
            ? Math.max(60, Math.round(job.bytesSource / 1_000_000 / durationSec))
            : 0,
        dedupRatio: finalStatus === "succeeded" ? 2.4 : 0,
        compressionRatio: finalStatus === "succeeded" ? 1.75 : 0,
        progress: finalStatus === "succeeded" ? 100 : job.progress,
        log: log ?? job.log,
        errorMessage,
        errorCode: finalStatus === "failed" ? "RBK-2041" : undefined,
      };
      const next: Partial<ConsoleState> = {
        jobs: {
          ...s.jobs,
          [tenantId]: jobs.map((j) => (j.id === jobId ? updated : j)),
        },
      };
      if (finalStatus === "failed") {
        const alarm: Alarm = {
          id: `alm_${tenantId}_retry_${Date.now().toString(36)}`,
          tenantId,
          title: `Backup job failed: ${job.workloadName}`,
          description:
            errorMessage ?? "On-demand backup did not complete. See job log for details.",
          category: "Backup Failure",
          severity: "critical",
          state: "triggered",
          triggeredAt: endedAt,
          jobId,
          workloadId: job.workloadId,
        };
        next.alarms = {
          ...s.alarms,
          [tenantId]: [alarm, ...(s.alarms[tenantId] ?? [])],
        };
      }
      return next;
    }),

  retryJob: (tenantId, jobId, operatorName) => {
    const job = (get().jobs[tenantId] ?? []).find((j) => j.id === jobId);
    if (!job) return jobId;
    return get().enqueueBackup(tenantId, job.workloadId, operatorName);
  },

  addPolicyOverride: (tenantId, override) =>
    set((s) => {
      const assignment = s.policyAssignments[tenantId];
      if (!assignment) return {};
      const newOverride: PolicyOverride = {
        ...override,
        id: `ovr_${tenantId}_${Date.now().toString(36)}`,
        appliedAt: new Date().toISOString(),
      };
      const event: DetailedAuditEvent = {
        id: makeAuditId(),
        actor: override.appliedBy,
        actorRole: "MSP Admin",
        action: "policy.override",
        target: assignment.policyId,
        tenantId,
        outcome: "success",
        occurredAt: new Date().toISOString(),
        ipAddress: "10.0.4.127",
        sessionId: `sess_${Math.random().toString(36).slice(2, 10)}`,
        userAgent: "Mozilla/5.0",
        geo: "San Francisco, CA, US",
        before: { [override.field]: override.templateValue },
        after: { [override.field]: override.overrideValue },
        description: `Override added on ${override.field}: ${override.templateValue} → ${override.overrideValue}. Reason: ${override.reason}`,
      };
      return {
        policyAssignments: {
          ...s.policyAssignments,
          [tenantId]: {
            ...assignment,
            overrides: [...assignment.overrides, newOverride],
            history: [
              {
                id: `pae_${Date.now().toString(36)}`,
                occurredAt: newOverride.appliedAt,
                actor: override.appliedBy,
                description: `Override added — ${override.field} ${override.templateValue} → ${override.overrideValue}.`,
                kind: "override-added" as const,
              },
              ...assignment.history,
            ],
          },
        },
        detailedAudit: {
          ...s.detailedAudit,
          [tenantId]: [event, ...(s.detailedAudit[tenantId] ?? [])],
        },
      };
    }),

  resetPolicyOverrides: (tenantId, operatorName) =>
    set((s) => {
      const assignment = s.policyAssignments[tenantId];
      if (!assignment || assignment.overrides.length === 0) return {};
      const event: DetailedAuditEvent = {
        id: makeAuditId(),
        actor: operatorName,
        actorRole: "MSP Admin",
        action: "policy.reset",
        target: assignment.policyId,
        tenantId,
        outcome: "success",
        occurredAt: new Date().toISOString(),
        ipAddress: "10.0.4.127",
        sessionId: `sess_${Math.random().toString(36).slice(2, 10)}`,
        userAgent: "Mozilla/5.0",
        geo: "San Francisco, CA, US",
        description: "All policy overrides reset to template defaults.",
      };
      return {
        policyAssignments: {
          ...s.policyAssignments,
          [tenantId]: {
            ...assignment,
            overrides: [],
            history: [
              {
                id: `pae_${Date.now().toString(36)}`,
                occurredAt: event.occurredAt,
                actor: operatorName,
                description: "Reset to template defaults — all overrides cleared.",
                kind: "override-removed" as const,
              },
              ...assignment.history,
            ],
          },
        },
        detailedAudit: {
          ...s.detailedAudit,
          [tenantId]: [event, ...(s.detailedAudit[tenantId] ?? [])],
        },
      };
    }),

  rotateTenantKey: (tenantId, operatorName) =>
    set((s) => {
      const current = s.keyRotation[tenantId];
      if (!current) return {};
      const now = new Date().toISOString();
      const next = new Date(Date.now() + current.rotationDays * 24 * 60 * 60 * 1000).toISOString();
      const event: DetailedAuditEvent = {
        id: makeAuditId(),
        actor: operatorName,
        actorRole: "MSP Admin",
        action: "key.rotate",
        target: tenantId,
        tenantId,
        outcome: "success",
        occurredAt: now,
        ipAddress: "10.0.4.127",
        sessionId: `sess_${Math.random().toString(36).slice(2, 10)}`,
        userAgent: "Mozilla/5.0",
        geo: "San Francisco, CA, US",
        description: "Tenant encryption key rotated manually. New key generated in HSM.",
      };
      return {
        keyRotation: {
          ...s.keyRotation,
          [tenantId]: { ...current, lastRotationAt: now, nextRotationAt: next },
        },
        detailedAudit: {
          ...s.detailedAudit,
          [tenantId]: [event, ...(s.detailedAudit[tenantId] ?? [])],
        },
      };
    }),

  recordDetailedAudit: (tenantId, event) =>
    set((s) => ({
      detailedAudit: {
        ...s.detailedAudit,
        [tenantId]: [event, ...(s.detailedAudit[tenantId] ?? [])],
      },
    })),

  // ── Onboarding lifecycle ──────────────────────────────────────────────────
  createDraft: (operatorName) => {
    const id = `draft_${Math.random().toString(36).slice(2, 10)}`;
    const now = new Date().toISOString();
    const draft: OnboardingDraft = {
      id,
      status: "in-progress",
      currentStep: 1,
      createdAt: now,
      createdBy: operatorName,
      updatedAt: now,
      updatedBy: operatorName,
      assignedTo: operatorName,
      reassignmentHistory: [],
    };
    set((s) => ({ drafts: [draft, ...s.drafts] }));
    return id;
  },

  upsertDraft: (draft) =>
    set((s) => {
      const exists = s.drafts.some((d) => d.id === draft.id);
      const next: OnboardingDraft = {
        ...draft,
        updatedAt: new Date().toISOString(),
      };
      if (!exists) return { drafts: [next, ...s.drafts] };
      return {
        drafts: s.drafts.map((d) => (d.id === draft.id ? next : d)),
      };
    }),

  deleteDraft: (draftId) =>
    set((s) => ({ drafts: s.drafts.filter((d) => d.id !== draftId) })),

  reassignDraft: (draftId, toOperator, byOperator, note) =>
    set((s) => {
      const draft = s.drafts.find((d) => d.id === draftId);
      if (!draft) return {};
      const now = new Date().toISOString();
      const updated: OnboardingDraft = {
        ...draft,
        assignedTo: toOperator,
        updatedAt: now,
        updatedBy: byOperator,
        reassignmentHistory: [
          ...draft.reassignmentHistory,
          { from: draft.assignedTo, to: toOperator, at: now, note },
        ],
      };
      return {
        drafts: s.drafts.map((d) => (d.id === draftId ? updated : d)),
      };
    }),

  completeOnboarding: ({ draft, tenant, durationSec, deployedBy }) =>
    set((s) => {
      const completed: CompletedOnboarding = {
        id: `cmp_${tenant.id}`,
        tenantId: tenant.id,
        tenantName: tenant.name,
        completedAt: new Date().toISOString(),
        totalDurationSec: durationSec,
        deployedBy,
      };
      const validationEntry: ValidationWindowEntry = {
        tenantId: tenant.id,
        tenantName: tenant.name,
        windowEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60_000).toISOString(),
        daysRemaining: 7,
        status: "Healthy",
        lastCheckAt: new Date().toISOString(),
        issuesCount: 0,
      };
      const auditEvent: DetailedAuditEvent = {
        id: makeAuditId(),
        actor: deployedBy,
        actorRole: "MSP Admin",
        action: "tenant.create",
        target: tenant.name,
        tenantId: tenant.id,
        outcome: "success",
        occurredAt: new Date().toISOString(),
        ipAddress: "10.0.4.127",
        sessionId: `sess_${Math.random().toString(36).slice(2, 10)}`,
        userAgent: "Mozilla/5.0",
        geo: "San Francisco, CA, US",
        description: `Tenant deployed and entered 7-day validation window. Cluster: ${tenant.assignedClusterId}, Tier: ${tenant.tier}.`,
      };
      const validationStartedEvent: DetailedAuditEvent = {
        ...auditEvent,
        id: makeAuditId(),
        action: "validation.start",
        description: "7-day post-deploy validation window opened. Daily health checks scheduled.",
      };
      const inviteEvent: DetailedAuditEvent = {
        ...auditEvent,
        id: makeAuditId(),
        action: "tenant.invite",
        description: `Tenant admin invite sent to ${tenant.contactEmail}.`,
      };
      const onboardingAlarm: Alarm = {
        id: `alm_${tenant.id}_onboarded`,
        tenantId: tenant.id,
        title: `Tenant onboarding completed: ${tenant.name}`,
        description: "Validation window: 7 days. Daily health checks active.",
        category: "Configuration",
        severity: "info",
        state: "triggered",
        triggeredAt: new Date().toISOString(),
      };
      return {
        tenants: [tenant, ...s.tenants],
        drafts: s.drafts.filter((d) => d.id !== draft.id),
        validationWindow: [validationEntry, ...s.validationWindow],
        completedOnboardings: [completed, ...s.completedOnboardings],
        avgOnboardingSeconds: Math.round(
          (s.avgOnboardingSeconds * s.completedOnboardings.length + durationSec) /
            (s.completedOnboardings.length + 1),
        ),
        detailedAudit: {
          ...s.detailedAudit,
          [tenant.id]: [auditEvent, validationStartedEvent, inviteEvent],
        },
        alarms: { ...s.alarms, [tenant.id]: [onboardingAlarm] },
        workloads: { ...s.workloads, [tenant.id]: [] },
        jobs: { ...s.jobs, [tenant.id]: [] },
        restorePoints: { ...s.restorePoints, [tenant.id]: [] },
        threats: { ...s.threats, [tenant.id]: [] },
        monthly: { ...s.monthly, [tenant.id]: [] },
        quota: {
          ...s.quota,
          [tenant.id]: {
            storage: { used: 0, limit: tenant.capacityCommittedTB, unit: "TB" },
            workloads: {
              used: 0,
              limit: draft.quotas?.workloads ?? 200,
              unit: "workloads",
            },
            transferOutThisMonth: {
              used: 0,
              limit: draft.quotas?.transferOutTB ?? 10,
              unit: "TB",
            },
            restorePoints: {
              used: 0,
              limit: draft.quotas?.restorePoints ?? 50_000,
              unit: "points",
            },
          },
        },
        keyRotation: {
          ...s.keyRotation,
          [tenant.id]: {
            algorithm: "AES-256-GCM",
            keySource:
              draft.isolation?.keySource === "byok"
                ? "Customer-managed"
                : "Rubrik-managed",
            rotationDays: draft.isolation?.keyRotationDays ?? 90,
            lastRotationAt: new Date().toISOString(),
            nextRotationAt: new Date(
              Date.now() + (draft.isolation?.keyRotationDays ?? 90) * 24 * 60 * 60_000,
            ).toISOString(),
          },
        },
        policyAssignments: {
          ...s.policyAssignments,
          [tenant.id]: {
            tenantId: tenant.id,
            policyId: draft.policyTemplateId ?? "pol_0",
            policyVersion: 4,
            appliedAt: new Date().toISOString(),
            appliedBy: deployedBy,
            overrides: [],
            history: [
              {
                id: `pae_${tenant.id}_initial`,
                occurredAt: new Date().toISOString(),
                actor: deployedBy,
                description: `Policy template applied at onboarding.`,
                kind: "applied",
              },
            ],
          },
        },
        auditEvents: [
          {
            id: auditEvent.id,
            actor: auditEvent.actor,
            actorRole: auditEvent.actorRole,
            action: auditEvent.action,
            target: auditEvent.target,
            tenantId: tenant.id,
            outcome: auditEvent.outcome,
            occurredAt: auditEvent.occurredAt,
            ipAddress: auditEvent.ipAddress,
          },
          ...s.auditEvents,
        ],
      };
    }),

  removeFromValidationWindow: (tenantId) =>
    set((s) => ({
      validationWindow: s.validationWindow.filter(
        (v) => v.tenantId !== tenantId,
      ),
    })),
}));
