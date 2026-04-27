"use client";

import { create } from "zustand";
import { mockData } from "./mock-data";
import type {
  AccessRequest,
  AccessRequestStatus,
  Alarm,
  DirectorySavedView,
  AlarmState,
  Alert,
  AttestationReport,
  AuditEvent,
  BillingAdjustment,
  BillingDispute,
  BillingLineItem,
  BillingPeriod,
  BillingStatus,
  CompletedOnboarding,
  ComplianceFrameworkPosture,
  DetailedAuditEvent,
  IsolationCell,
  IsolationCellStatus,
  IsolationCheck,
  IsolationCheckId,
  IsolationControlId,
  JobLogLine,
  JobSession,
  KeyRotationStatus,
  MonthlyConsumption,
  OnboardingDraft,
  OperatorAccessRow,
  Policy,
  PolicyAssignment,
  PolicyOverride,
  PolicyTemplate,
  PolicyTemplateAuditAction,
  PolicyTemplateAuditEntry,
  PolicyTemplateConfig,
  PolicyTemplateOverride,
  PolicyTemplateRollout,
  PolicyTemplateVersion,
  PolicyVersion,
  QuotaEnforcementRow,
  QuotaUsage,
  RbacRoleSummary,
  RestorePoint,
  RolloutPhase,
  SecurityBannerState,
  SecurityScheduleEntry,
  Tenant,
  TenantTemplateAssignment,
  ThreatDetection,
  ThreatEvent,
  ThreatEventStatus,
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
  matrixCells: IsolationCell[];
  securityThreats: ThreatDetection[];
  rbacRoles: RbacRoleSummary[];
  operatorAccess: OperatorAccessRow[];
  accessRequests: AccessRequest[];
  compliancePosture: ComplianceFrameworkPosture[];
  securitySchedule: SecurityScheduleEntry[];
  securityBanner: SecurityBannerState;
  attestationReports: AttestationReport[];
  billingLineItems: BillingLineItem[];
  billingPeriod: BillingPeriod;
  quotaEnforcement: QuotaEnforcementRow[];
  billingHistory: Record<string, Array<{ month: string; total: number }>>;
  directorySavedViews: DirectorySavedView[];
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

  // ── Security & isolation surface ─────────────────────────────────────────
  acknowledgeSecurityBanner: (
    operatorName: string,
    note: string,
    estimatedResolution: string,
  ) => void;
  setMatrixCellStatus: (
    tenantId: string,
    controlId: IsolationControlId,
    status: IsolationCellStatus,
  ) => void;
  remediateMatrixCell: (
    tenantId: string,
    controlId: IsolationControlId,
    operatorName: string,
    note: string,
  ) => void;
  markCellFalsePositive: (
    tenantId: string,
    controlId: IsolationControlId,
    operatorName: string,
    reason: string,
  ) => void;
  snoozeCell: (
    tenantId: string,
    controlId: IsolationControlId,
    operatorName: string,
    reason: string,
  ) => void;
  rerunPostureSweep: () => void;
  rerunControlSweep: (controlId: IsolationControlId) => void;
  updateThreatStatus: (
    threatId: string,
    nextStatus: ThreatEventStatus,
    operatorName: string,
    note: string,
  ) => void;
  resolveAccessRequest: (
    requestId: string,
    decision: "approved" | "denied",
    operatorName: string,
    note: string,
  ) => void;
  recordAttestationReport: (report: AttestationReport) => void;
  updateScheduleEntry: (
    controlId: IsolationControlId | "full-sweep",
    frequencyHours: number,
  ) => void;

  // ── Capacity & Billing ───────────────────────────────────────────────────
  approveLineItems: (lineItemIds: string[], operatorName: string, note: string) => void;
  flagDispute: (
    lineItemId: string,
    operatorName: string,
    payload: {
      contactName: string;
      disputedAmount: number;
      reason: string;
      estimatedResolutionAt?: string;
    },
  ) => void;
  appendDisputeComment: (lineItemId: string, operatorName: string, note: string) => void;
  updateDisputeStatus: (
    lineItemId: string,
    operatorName: string,
    nextStatus: BillingDispute["status"],
    note: string,
  ) => void;
  applyDisputeCredit: (
    lineItemId: string,
    operatorName: string,
    amount: number,
    reason: string,
  ) => void;
  addLineItemAdjustment: (
    lineItemId: string,
    operatorName: string,
    adjustment: Omit<BillingAdjustment, "id" | "appliedAt">,
  ) => void;
  generateInvoices: (operatorName: string, note: string) => string[];
  lockBillingPeriod: (operatorName: string) => void;
  recordBillingExport: (
    operatorName: string,
    format: "csv" | "json" | "connectwise" | "autotask",
    filename: string,
  ) => void;

  // ── Directory bulk actions ───────────────────────────────────────────────
  bulkSuspendTenants: (tenantIds: string[], operatorName: string, reason: string, resumeDate?: string) => void;
  bulkApplyPolicy: (tenantIds: string[], policyId: string, operatorName: string, reason: string) => void;
  bulkChangeTier: (tenantIds: string[], tier: Tenant["tier"], operatorName: string) => void;
  bulkAddTag: (tenantIds: string[], tagLabel: string, operatorName: string) => void;
  saveDirectoryView: (view: DirectorySavedView) => void;
  deleteDirectoryView: (viewId: string) => void;
  updateDirectoryView: (viewId: string, patch: Partial<DirectorySavedView>) => void;

  // ── Policy template lifecycle ────────────────────────────────────────────
  policyTemplates: PolicyTemplate[];
  policyTemplateAssignments: TenantTemplateAssignment[];
  policyTemplateOverrides: PolicyTemplateOverride[];
  policyTemplateRollouts: PolicyTemplateRollout[];
  policyTemplateAudit: PolicyTemplateAuditEntry[];

  createPolicyTemplate: (
    template: Omit<PolicyTemplate, "id" | "currentVersion" | "versions" | "createdAt" | "updatedAt"> & {
      initialConfig: PolicyTemplateConfig;
      initialChangeSummary: string;
      operatorName: string;
      tenantIdsToAssign: string[];
    },
  ) => string;
  savePolicyTemplateVersion: (
    templateId: string,
    config: PolicyTemplateConfig,
    changeSummary: string,
    operatorName: string,
  ) => number;
  startPolicyTemplateRollout: (
    templateId: string,
    note: string,
    operatorName: string,
  ) => string;
  promoteRolloutPhase: (rolloutId: string, operatorName: string) => void;
  pausePolicyRollout: (rolloutId: string, operatorName: string) => void;
  abortPolicyRollout: (
    rolloutId: string,
    reason: string,
    operatorName: string,
  ) => void;
  completePolicyRollout: (rolloutId: string, operatorName: string) => void;
  applyPolicyTemplateToTenant: (
    templateId: string,
    tenantId: string,
    version: number,
    operatorName: string,
  ) => void;
  removePolicyTemplateFromTenant: (
    templateId: string,
    tenantId: string,
    operatorName: string,
  ) => void;
  addPolicyTemplateOverride: (
    override: Omit<PolicyTemplateOverride, "id" | "appliedAt">,
  ) => void;
  removePolicyTemplateOverride: (
    overrideId: string,
    operatorName: string,
  ) => void;

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
  matrixCells: mockData.matrixCells,
  securityThreats: mockData.securityThreats,
  rbacRoles: mockData.rbacRoles,
  operatorAccess: mockData.operatorAccess,
  accessRequests: mockData.accessRequests,
  compliancePosture: mockData.compliancePosture,
  securitySchedule: mockData.securitySchedule,
  securityBanner: { acknowledged: false } as SecurityBannerState,
  attestationReports: [] as AttestationReport[],
  billingLineItems: mockData.billingLineItems,
  billingPeriod: mockData.billingPeriod,
  quotaEnforcement: mockData.quotaEnforcement,
  billingHistory: mockData.billingHistory,
  directorySavedViews: mockData.directorySavedViews,
  policyTemplates: mockData.policyTemplates,
  policyTemplateAssignments: mockData.policyTemplateAssignments,
  policyTemplateOverrides: mockData.policyTemplateOverrides,
  policyTemplateRollouts: mockData.policyTemplateRollouts,
  policyTemplateAudit: mockData.policyTemplateAudit,
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

  // ── Security & isolation workflows ────────────────────────────────────────
  acknowledgeSecurityBanner: (operatorName, note, estimatedResolution) =>
    set((s) => {
      const now = new Date().toISOString();
      const event: AuditEvent = {
        id: makeAuditId("audit"),
        actor: operatorName,
        actorRole: "MSP Admin",
        action: "isolation.banner.acknowledge",
        target: "global isolation banner",
        outcome: "success",
        occurredAt: now,
        ipAddress: "10.0.4.127",
      };
      return {
        securityBanner: {
          acknowledged: true,
          acknowledgedBy: operatorName,
          acknowledgedAt: now,
          acknowledgmentNote: note,
          estimatedResolution,
        },
        matrixCells: s.matrixCells.map((c) =>
          c.status === "fail" || c.status === "warn"
            ? { ...c, acknowledged: true }
            : c,
        ),
        auditEvents: [event, ...s.auditEvents],
      };
    }),

  setMatrixCellStatus: (tenantId, controlId, status) =>
    set((s) => ({
      matrixCells: s.matrixCells.map((c) =>
        c.tenantId === tenantId && c.controlId === controlId
          ? { ...c, status, lastEvaluatedAt: new Date().toISOString() }
          : c,
      ),
    })),

  remediateMatrixCell: (tenantId, controlId, operatorName, note) =>
    set((s) => {
      const tenant = s.tenants.find((t) => t.id === tenantId);
      const now = new Date().toISOString();
      const event: DetailedAuditEvent = {
        id: makeAuditId("audit"),
        actor: operatorName,
        actorRole: "MSP Admin",
        action: "isolation.remediate",
        target: tenant?.name ?? tenantId,
        tenantId,
        outcome: "success",
        occurredAt: now,
        ipAddress: "10.0.4.127",
        sessionId: `sess_${Math.random().toString(36).slice(2, 10)}`,
        userAgent: "Mozilla/5.0",
        geo: "San Francisco, CA, US",
        description: `Remediation executed: ${controlId} isolation. Note: ${note}`,
      };
      const tenantBumpedScore = tenant
        ? { ...tenant, securityScore: Math.min(99, tenant.securityScore + 12) }
        : null;
      return {
        matrixCells: s.matrixCells.map((c) =>
          c.tenantId === tenantId && c.controlId === controlId
            ? {
                ...c,
                status: "pass",
                lastEvaluatedAt: now,
                acknowledged: false,
                violation: undefined,
                evidence: `Remediated by ${operatorName}. Re-scan confirmed pass.`,
              }
            : c,
        ),
        tenants: tenantBumpedScore
          ? s.tenants.map((t) => (t.id === tenantId ? tenantBumpedScore : t))
          : s.tenants,
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

  markCellFalsePositive: (tenantId, controlId, operatorName, reason) =>
    set((s) => {
      const event: AuditEvent = {
        id: makeAuditId("audit"),
        actor: operatorName,
        actorRole: "MSP Admin",
        action: "isolation.false_positive",
        target: `${tenantId}/${controlId}`,
        tenantId,
        outcome: "success",
        occurredAt: new Date().toISOString(),
        ipAddress: "10.0.4.127",
      };
      return {
        matrixCells: s.matrixCells.map((c) =>
          c.tenantId === tenantId && c.controlId === controlId
            ? {
                ...c,
                status: "pass",
                violation: undefined,
                evidence: `Marked false positive: ${reason}`,
                lastEvaluatedAt: new Date().toISOString(),
              }
            : c,
        ),
        auditEvents: [event, ...s.auditEvents],
      };
    }),

  snoozeCell: (tenantId, controlId, operatorName, reason) =>
    set((s) => {
      const event: AuditEvent = {
        id: makeAuditId("audit"),
        actor: operatorName,
        actorRole: "MSP Admin",
        action: "isolation.snooze",
        target: `${tenantId}/${controlId}`,
        tenantId,
        outcome: "success",
        occurredAt: new Date().toISOString(),
        ipAddress: "10.0.4.127",
      };
      void reason;
      return { auditEvents: [event, ...s.auditEvents] };
    }),

  rerunPostureSweep: () =>
    set((s) => {
      const now = new Date().toISOString();
      return {
        matrixCells: s.matrixCells.map((c) => ({ ...c, lastEvaluatedAt: now })),
        securitySchedule: s.securitySchedule.map((entry) => ({
          ...entry,
          lastRunAt: now,
          nextRunAt: new Date(
            Date.now() + entry.frequencyHours * 60 * 60_000,
          ).toISOString(),
        })),
      };
    }),

  rerunControlSweep: (controlId) =>
    set((s) => {
      const now = new Date().toISOString();
      return {
        matrixCells: s.matrixCells.map((c) =>
          c.controlId === controlId ? { ...c, lastEvaluatedAt: now } : c,
        ),
        securitySchedule: s.securitySchedule.map((entry) =>
          entry.controlId === controlId
            ? {
                ...entry,
                lastRunAt: now,
                nextRunAt: new Date(
                  Date.now() + entry.frequencyHours * 60 * 60_000,
                ).toISOString(),
              }
            : entry,
        ),
      };
    }),

  updateThreatStatus: (threatId, nextStatus, operatorName, note) =>
    set((s) => {
      const target = s.securityThreats.find((t) => t.id === threatId);
      if (!target) return {};
      const updated: ThreatDetection = {
        ...target,
        status: nextStatus,
        history: [
          ...target.history,
          {
            at: new Date().toISOString(),
            by: operatorName,
            from: target.status,
            to: nextStatus,
            note,
          },
        ],
      };
      const event: AuditEvent = {
        id: makeAuditId("audit"),
        actor: operatorName,
        actorRole: "MSP Admin",
        action: "threat.status",
        target: target.detectionType,
        tenantId: target.tenantId,
        outcome: "success",
        occurredAt: new Date().toISOString(),
        ipAddress: "10.0.4.127",
      };
      return {
        securityThreats: s.securityThreats.map((t) =>
          t.id === threatId ? updated : t,
        ),
        auditEvents: [event, ...s.auditEvents],
      };
    }),

  resolveAccessRequest: (requestId, decision, operatorName, note) =>
    set((s) => {
      const target = s.accessRequests.find((r) => r.id === requestId);
      if (!target) return {};
      const status: AccessRequestStatus = decision;
      const now = new Date().toISOString();
      const event: AuditEvent = {
        id: makeAuditId("audit"),
        actor: operatorName,
        actorRole: "MSP Admin",
        action: `access.${decision}`,
        target: `${target.requesterName} → ${target.requestedRole}`,
        outcome: "success",
        occurredAt: now,
        ipAddress: "10.0.4.127",
      };
      return {
        accessRequests: s.accessRequests.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status,
                resolvedAt: now,
                resolvedBy: operatorName,
                resolutionNote: note,
              }
            : r,
        ),
        auditEvents: [event, ...s.auditEvents],
      };
    }),

  recordAttestationReport: (report) =>
    set((s) => {
      const event: AuditEvent = {
        id: makeAuditId("audit"),
        actor: report.generatedBy,
        actorRole: "MSP Admin",
        action: "attestation.export",
        target: report.id,
        outcome: "success",
        occurredAt: report.generatedAt,
        ipAddress: "10.0.4.127",
      };
      return {
        attestationReports: [report, ...s.attestationReports],
        auditEvents: [event, ...s.auditEvents],
      };
    }),

  updateScheduleEntry: (controlId, frequencyHours) =>
    set((s) => ({
      securitySchedule: s.securitySchedule.map((entry) =>
        entry.controlId === controlId
          ? {
              ...entry,
              frequencyHours,
              nextRunAt: new Date(
                Date.parse(entry.lastRunAt) + frequencyHours * 60 * 60_000,
              ).toISOString(),
            }
          : entry,
      ),
    })),

  // ── Capacity & Billing workflows ──────────────────────────────────────────
  approveLineItems: (lineItemIds, operatorName, note) =>
    set((s) => {
      const setIds = new Set(lineItemIds);
      const events: AuditEvent[] = [];
      const updated = s.billingLineItems.map((li) => {
        if (!setIds.has(li.id) || li.status !== "Draft") return li;
        events.push({
          id: makeAuditId("audit"),
          actor: operatorName,
          actorRole: "MSP Admin",
          action: "billing.approve",
          target: li.tenantName,
          tenantId: li.tenantId,
          outcome: "success",
          occurredAt: new Date().toISOString(),
          ipAddress: "10.0.4.127",
        });
        return { ...li, status: "Approved" as BillingStatus };
      });
      void note;
      return {
        billingLineItems: updated,
        auditEvents: [...events, ...s.auditEvents],
      };
    }),

  flagDispute: (lineItemId, operatorName, payload) =>
    set((s) => {
      const li = s.billingLineItems.find((x) => x.id === lineItemId);
      if (!li) return {};
      const disputeNumber = String(s.billingLineItems.filter((x) => x.dispute).length + 7).padStart(3, "0");
      const now = new Date().toISOString();
      const dispute: BillingDispute = {
        id: `DISPUTE-2026-04-${disputeNumber}`,
        filedAt: now,
        filedBy: payload.contactName,
        contactEmail: `${payload.contactName.toLowerCase().replace(/\s+/g, ".")}@${li.tenantName.toLowerCase().split(/\s+/).slice(0, 2).join("")}.com`,
        status: "Awaiting Review",
        disputedAmount: payload.disputedAmount,
        reason: payload.reason,
        estimatedResolutionAt: payload.estimatedResolutionAt,
        activity: [
          { at: now, by: operatorName, note: `Dispute filed for ${li.tenantName}.` },
        ],
        evidence: [],
      };
      const event: AuditEvent = {
        id: makeAuditId("audit"),
        actor: operatorName,
        actorRole: "MSP Admin",
        action: "billing.dispute.flag",
        target: li.tenantName,
        tenantId: li.tenantId,
        outcome: "success",
        occurredAt: now,
        ipAddress: "10.0.4.127",
      };
      return {
        billingLineItems: s.billingLineItems.map((x) =>
          x.id === lineItemId
            ? { ...x, status: "Disputed" as BillingStatus, dispute }
            : x,
        ),
        auditEvents: [event, ...s.auditEvents],
      };
    }),

  appendDisputeComment: (lineItemId, operatorName, note) =>
    set((s) => ({
      billingLineItems: s.billingLineItems.map((x) => {
        if (x.id !== lineItemId || !x.dispute) return x;
        return {
          ...x,
          dispute: {
            ...x.dispute,
            activity: [
              ...x.dispute.activity,
              { at: new Date().toISOString(), by: operatorName, note },
            ],
          },
        };
      }),
    })),

  updateDisputeStatus: (lineItemId, operatorName, nextStatus, note) =>
    set((s) => ({
      billingLineItems: s.billingLineItems.map((x) => {
        if (x.id !== lineItemId || !x.dispute) return x;
        const resolved = nextStatus === "Resolved (Adjusted)" || nextStatus === "Resolved (Denied)";
        return {
          ...x,
          status: resolved ? ("Approved" as BillingStatus) : x.status,
          dispute: {
            ...x.dispute,
            status: nextStatus,
            activity: [
              ...x.dispute.activity,
              { at: new Date().toISOString(), by: operatorName, note },
            ],
          },
        };
      }),
    })),

  applyDisputeCredit: (lineItemId, operatorName, amount, reason) =>
    set((s) => {
      const now = new Date().toISOString();
      return {
        billingLineItems: s.billingLineItems.map((x) => {
          if (x.id !== lineItemId) return x;
          const adj: BillingAdjustment = {
            id: `adj_${Math.random().toString(36).slice(2, 10)}`,
            description: "Dispute credit",
            amount: -Math.abs(amount),
            reason,
            appliedBy: operatorName,
            appliedAt: now,
          };
          return {
            ...x,
            adjustments: [...x.adjustments, adj],
            totalCharge: Math.max(0, x.totalCharge - Math.abs(amount)),
          };
        }),
      };
    }),

  addLineItemAdjustment: (lineItemId, operatorName, adjustment) =>
    set((s) => ({
      billingLineItems: s.billingLineItems.map((x) => {
        if (x.id !== lineItemId) return x;
        const adj: BillingAdjustment = {
          ...adjustment,
          id: `adj_${Math.random().toString(36).slice(2, 10)}`,
          appliedAt: new Date().toISOString(),
          appliedBy: operatorName,
        };
        return {
          ...x,
          adjustments: [...x.adjustments, adj],
          totalCharge: x.totalCharge + adjustment.amount,
        };
      }),
    })),

  generateInvoices: (operatorName, note) => {
    const ids: string[] = [];
    set((s) => {
      const events: AuditEvent[] = [];
      let counter = 1;
      const updated = s.billingLineItems.map((li) => {
        if (li.status !== "Approved") return li;
        const invoiceId = `INV-2026-04-${String(counter).padStart(3, "0")}`;
        counter += 1;
        ids.push(invoiceId);
        events.push({
          id: makeAuditId("audit"),
          actor: operatorName,
          actorRole: "MSP Admin",
          action: "billing.invoice.generate",
          target: invoiceId,
          tenantId: li.tenantId,
          outcome: "success",
          occurredAt: new Date().toISOString(),
          ipAddress: "10.0.4.127",
        });
        return {
          ...li,
          status: "Invoiced" as BillingStatus,
          invoiceId,
          invoicedAt: new Date().toISOString(),
        };
      });
      void note;
      return {
        billingLineItems: updated,
        auditEvents: [...events, ...s.auditEvents],
      };
    });
    return ids;
  },

  lockBillingPeriod: (operatorName) =>
    set((s) => {
      const event: AuditEvent = {
        id: makeAuditId("audit"),
        actor: operatorName,
        actorRole: "MSP Admin",
        action: "billing.period.lock",
        target: s.billingPeriod.label,
        outcome: "success",
        occurredAt: new Date().toISOString(),
        ipAddress: "10.0.4.127",
      };
      return {
        billingPeriod: {
          ...s.billingPeriod,
          status: "locked",
          lockedAt: new Date().toISOString(),
        },
        auditEvents: [event, ...s.auditEvents],
      };
    }),

  recordBillingExport: (operatorName, format, filename) =>
    set((s) => ({
      auditEvents: [
        {
          id: makeAuditId("audit"),
          actor: operatorName,
          actorRole: "MSP Admin",
          action: `billing.export.${format}`,
          target: filename,
          outcome: "success",
          occurredAt: new Date().toISOString(),
          ipAddress: "10.0.4.127",
        },
        ...s.auditEvents,
      ],
    })),

  // ── Directory bulk actions ───────────────────────────────────────────────
  bulkSuspendTenants: (tenantIds, operatorName, reason, resumeDate) =>
    set((s) => {
      const ids = new Set(tenantIds);
      const now = new Date().toISOString();
      const events: AuditEvent[] = tenantIds.map((id) => {
        const t = s.tenants.find((x) => x.id === id);
        return {
          id: makeAuditId("audit"),
          actor: operatorName,
          actorRole: "MSP Admin",
          action: "tenant.suspend",
          target: t?.name ?? id,
          tenantId: id,
          outcome: "success",
          occurredAt: now,
          ipAddress: "10.0.4.127",
        };
      });
      void reason;
      void resumeDate;
      return {
        tenants: s.tenants.map((t) =>
          ids.has(t.id) ? { ...t, status: "Suspended" as const } : t,
        ),
        auditEvents: [...events, ...s.auditEvents],
      };
    }),

  bulkApplyPolicy: (tenantIds, policyId, operatorName, reason) =>
    set((s) => {
      const ids = new Set(tenantIds);
      const now = new Date().toISOString();
      const events: AuditEvent[] = tenantIds.map((id) => {
        const t = s.tenants.find((x) => x.id === id);
        return {
          id: makeAuditId("audit"),
          actor: operatorName,
          actorRole: "MSP Admin",
          action: "policy.apply",
          target: t?.name ?? id,
          tenantId: id,
          outcome: "success",
          occurredAt: now,
          ipAddress: "10.0.4.127",
        };
      });
      void reason;
      return {
        tenants: s.tenants.map((t) =>
          ids.has(t.id) ? { ...t, policyTemplateId: policyId } : t,
        ),
        auditEvents: [...events, ...s.auditEvents],
      };
    }),

  bulkChangeTier: (tenantIds, tier, operatorName) =>
    set((s) => {
      const ids = new Set(tenantIds);
      const now = new Date().toISOString();
      const events: AuditEvent[] = tenantIds.map((id) => {
        const t = s.tenants.find((x) => x.id === id);
        return {
          id: makeAuditId("audit"),
          actor: operatorName,
          actorRole: "MSP Admin",
          action: "tenant.tier",
          target: t?.name ?? id,
          tenantId: id,
          outcome: "success",
          occurredAt: now,
          ipAddress: "10.0.4.127",
        };
      });
      return {
        tenants: s.tenants.map((t) => (ids.has(t.id) ? { ...t, tier } : t)),
        auditEvents: [...events, ...s.auditEvents],
      };
    }),

  bulkAddTag: (tenantIds, tagLabel, operatorName) =>
    set((s) => {
      const ids = new Set(tenantIds);
      const now = new Date().toISOString();
      const events: AuditEvent[] = tenantIds.map((id) => {
        const t = s.tenants.find((x) => x.id === id);
        return {
          id: makeAuditId("audit"),
          actor: operatorName,
          actorRole: "MSP Admin",
          action: "tenant.tag",
          target: t?.name ?? id,
          tenantId: id,
          outcome: "success",
          occurredAt: now,
          ipAddress: "10.0.4.127",
        };
      });
      return {
        tenants: s.tenants.map((t) =>
          ids.has(t.id)
            ? {
                ...t,
                tags: Array.from(new Set([...(t.tags ?? []), tagLabel])),
              }
            : t,
        ),
        auditEvents: [...events, ...s.auditEvents],
      };
    }),

  saveDirectoryView: (view) =>
    set((s) => ({
      directorySavedViews: s.directorySavedViews.some((v) => v.id === view.id)
        ? s.directorySavedViews.map((v) => (v.id === view.id ? view : v))
        : [...s.directorySavedViews, view],
    })),

  deleteDirectoryView: (viewId) =>
    set((s) => ({
      directorySavedViews: s.directorySavedViews.filter(
        (v) => v.id !== viewId || v.isSystem,
      ),
    })),

  updateDirectoryView: (viewId, patch) =>
    set((s) => ({
      directorySavedViews: s.directorySavedViews.map((v) =>
        v.id === viewId ? { ...v, ...patch } : v,
      ),
    })),

  // ── Policy template lifecycle ─────────────────────────────────────────────
  createPolicyTemplate: ({
    initialConfig,
    initialChangeSummary,
    operatorName,
    tenantIdsToAssign,
    ...rest
  }) => {
    const id = `tpl_${Math.random().toString(36).slice(2, 10)}`;
    const now = new Date().toISOString();
    const version: PolicyTemplateVersion = {
      id: `${id}_v1`,
      version: 1,
      authoredBy: operatorName,
      authoredAt: now,
      changeSummary: initialChangeSummary || "Initial template version",
      config: initialConfig,
    };
    const template: PolicyTemplate = {
      ...rest,
      id,
      currentVersion: 1,
      versions: [version],
      createdAt: now,
      updatedAt: now,
    };
    const assignments: TenantTemplateAssignment[] = tenantIdsToAssign.map((tid) => ({
      tenantId: tid,
      templateId: id,
      appliedVersion: 1,
      appliedAt: now,
      appliedBy: operatorName,
    }));
    set((s) => ({
      policyTemplates: [template, ...s.policyTemplates],
      policyTemplateAssignments: [...s.policyTemplateAssignments, ...assignments],
      policyTemplateAudit: [
        {
          id: makeAuditId("ptaud"),
          templateId: id,
          occurredAt: now,
          actor: operatorName,
          actorRole: "MSP Admin",
          action: "template.create" as PolicyTemplateAuditAction,
          targetVersion: 1,
          description: `Template created: ${template.name}`,
          outcome: "success",
        },
        ...s.policyTemplateAudit,
      ],
    }));
    return id;
  },

  savePolicyTemplateVersion: (templateId, config, changeSummary, operatorName) => {
    let nextVersion = 0;
    set((s) => {
      const template = s.policyTemplates.find((t) => t.id === templateId);
      if (!template) return {};
      nextVersion = template.currentVersion + 1;
      const now = new Date().toISOString();
      const version: PolicyTemplateVersion = {
        id: `${templateId}_v${nextVersion}`,
        version: nextVersion,
        authoredBy: operatorName,
        authoredAt: now,
        changeSummary,
        config,
      };
      const updatedTemplate: PolicyTemplate = {
        ...template,
        currentVersion: nextVersion,
        versions: [...template.versions, version],
        updatedAt: now,
      };
      return {
        policyTemplates: s.policyTemplates.map((t) =>
          t.id === templateId ? updatedTemplate : t,
        ),
        policyTemplateAudit: [
          {
            id: makeAuditId("ptaud"),
            templateId,
            occurredAt: now,
            actor: operatorName,
            actorRole: "MSP Admin",
            action: "template.version.publish" as PolicyTemplateAuditAction,
            targetVersion: nextVersion,
            description: `v${nextVersion} published: ${changeSummary}`,
            outcome: "success",
          },
          ...s.policyTemplateAudit,
        ],
      };
    });
    return nextVersion;
  },

  startPolicyTemplateRollout: (templateId, note, operatorName) => {
    const id = `roll_${templateId}_${Date.now().toString(36)}`;
    set((s) => {
      const template = s.policyTemplates.find((t) => t.id === templateId);
      if (!template) return {};
      const assigned = s.policyTemplateAssignments.filter(
        (a) => a.templateId === templateId,
      );
      const olderTenantIds = assigned
        .filter((a) => a.appliedVersion < template.currentVersion)
        .map((a) => a.tenantId);
      if (olderTenantIds.length === 0) return {};
      const fromVersion = Math.min(
        ...assigned.filter((a) => a.appliedVersion < template.currentVersion).map((a) => a.appliedVersion),
      );
      const tenantsByCapacity = [...olderTenantIds].sort((a, b) => {
        const ta = s.tenants.find((t) => t.id === a)?.capacityCommittedTB ?? 0;
        const tb = s.tenants.find((t) => t.id === b)?.capacityCommittedTB ?? 0;
        return ta - tb;
      });
      const canaryCount = 1;
      const remaining = tenantsByCapacity.slice(canaryCount);
      const stagedCount = Math.max(1, Math.ceil(remaining.length / 2));
      const canaryIds = tenantsByCapacity.slice(0, canaryCount);
      const stagedIds = remaining.slice(0, stagedCount);
      const fleetIds = remaining.slice(stagedCount);
      const now = new Date().toISOString();
      const rollout: PolicyTemplateRollout = {
        id,
        templateId,
        fromVersion,
        toVersion: template.currentVersion,
        strategy: "canary-staged-fleet",
        status: "running",
        startedBy: operatorName,
        startedAt: now,
        note,
        currentPhase: "canary",
        validation: [
          { id: "v_health", label: "All affected tenants currently in healthy state", status: "pass" },
          { id: "v_alarm", label: "No active alarms on affected tenants", status: "pass" },
          { id: "v_capacity", label: "Sufficient cluster capacity for re-encryption", status: "pass" },
          { id: "v_conflict", label: "No conflicting policy changes in last 24h", status: "pass" },
          { id: "v_compliance", label: "Compliance frameworks remain attested", status: "pass" },
        ],
        totalAffectedTenants: tenantsByCapacity.length,
        phases: [
          {
            phase: "canary",
            tenantIds: canaryIds,
            observationHours: 24,
            status: "running",
            startedAt: now,
            migratedTenantIds: [],
            failedTenantIds: [],
            healthChecks: [
              { id: "h_success", label: "Backup success rate >=95%", status: "pending" },
              { id: "h_alarm", label: "Alarms triggered", status: "pending" },
              { id: "h_compliance", label: "Compliance posture", status: "pending" },
              { id: "h_observe", label: "Observation period", status: "pending" },
            ],
          },
          {
            phase: "staged",
            tenantIds: stagedIds,
            observationHours: 48,
            status: "pending",
            migratedTenantIds: [],
            failedTenantIds: [],
            healthChecks: [],
          },
          {
            phase: "fleet",
            tenantIds: fleetIds,
            observationHours: 0,
            status: "pending",
            migratedTenantIds: [],
            failedTenantIds: [],
            healthChecks: [],
          },
        ],
      };
      return {
        policyTemplateRollouts: [rollout, ...s.policyTemplateRollouts],
        policyTemplateAudit: [
          {
            id: makeAuditId("ptaud"),
            templateId,
            occurredAt: now,
            actor: operatorName,
            actorRole: "MSP Admin",
            action: "template.rollout.start" as PolicyTemplateAuditAction,
            targetVersion: template.currentVersion,
            description: `Rollout started: v${fromVersion} to v${template.currentVersion}, ${tenantsByCapacity.length} tenants affected. Note: ${note}`,
            outcome: "success",
          },
          ...s.policyTemplateAudit,
        ],
      };
    });
    return id;
  },

  promoteRolloutPhase: (rolloutId, operatorName) =>
    set((s) => {
      const rollout = s.policyTemplateRollouts.find((r) => r.id === rolloutId);
      if (!rollout) return {};
      const phaseOrder: RolloutPhase[] = ["canary", "staged", "fleet"];
      const currentIdx = phaseOrder.findIndex((p) => p === rollout.currentPhase);
      if (currentIdx === -1) return {};
      const now = new Date().toISOString();
      const completedPhase = {
        ...rollout.phases[currentIdx],
        status: "complete" as const,
        completedAt: now,
        migratedTenantIds: rollout.phases[currentIdx].tenantIds,
      };
      const nextIdx = currentIdx + 1;
      let updatedRollout: PolicyTemplateRollout;
      if (nextIdx >= rollout.phases.length || rollout.phases[nextIdx].tenantIds.length === 0) {
        updatedRollout = {
          ...rollout,
          status: "complete",
          completedAt: now,
          currentPhase: null,
          phases: rollout.phases.map((p, i) => (i === currentIdx ? completedPhase : p)),
        };
      } else {
        const nextPhase = {
          ...rollout.phases[nextIdx],
          status: "running" as const,
          startedAt: now,
          healthChecks: [
            { id: "h_success", label: "Backup success rate >=95%", status: "pending" as const },
            { id: "h_alarm", label: "Alarms triggered", status: "pending" as const },
            { id: "h_compliance", label: "Compliance posture", status: "pending" as const },
          ],
        };
        updatedRollout = {
          ...rollout,
          currentPhase: phaseOrder[nextIdx],
          phases: rollout.phases.map((p, i) =>
            i === currentIdx ? completedPhase : i === nextIdx ? nextPhase : p,
          ),
        };
      }
      const newAssignments = s.policyTemplateAssignments.map((a) => {
        if (
          a.templateId === rollout.templateId &&
          completedPhase.tenantIds.includes(a.tenantId)
        ) {
          return { ...a, appliedVersion: rollout.toVersion, appliedAt: now, appliedBy: operatorName };
        }
        return a;
      });
      return {
        policyTemplateRollouts: s.policyTemplateRollouts.map((r) =>
          r.id === rolloutId ? updatedRollout : r,
        ),
        policyTemplateAssignments: newAssignments,
        policyTemplateAudit: [
          {
            id: makeAuditId("ptaud"),
            templateId: rollout.templateId,
            occurredAt: now,
            actor: operatorName,
            actorRole: "MSP Admin",
            action:
              updatedRollout.status === "complete"
                ? ("template.rollout.complete" as PolicyTemplateAuditAction)
                : ("template.rollout.promote" as PolicyTemplateAuditAction),
            targetVersion: rollout.toVersion,
            description:
              updatedRollout.status === "complete"
                ? `Rollout complete: ${rollout.totalAffectedTenants} tenants migrated to v${rollout.toVersion}`
                : `Promoted to ${updatedRollout.currentPhase} phase`,
            outcome: "success",
          },
          ...s.policyTemplateAudit,
        ],
      };
    }),

  pausePolicyRollout: (rolloutId, operatorName) =>
    set((s) => ({
      policyTemplateRollouts: s.policyTemplateRollouts.map((r) =>
        r.id === rolloutId ? { ...r, status: "paused" } : r,
      ),
      policyTemplateAudit: [
        {
          id: makeAuditId("ptaud"),
          templateId:
            s.policyTemplateRollouts.find((r) => r.id === rolloutId)?.templateId ?? "",
          occurredAt: new Date().toISOString(),
          actor: operatorName,
          actorRole: "MSP Admin",
          action: "template.rollout.start" as PolicyTemplateAuditAction,
          description: "Rollout paused by operator",
          outcome: "success",
        },
        ...s.policyTemplateAudit,
      ],
    })),

  abortPolicyRollout: (rolloutId, reason, operatorName) =>
    set((s) => {
      const rollout = s.policyTemplateRollouts.find((r) => r.id === rolloutId);
      if (!rollout) return {};
      const now = new Date().toISOString();
      const migratedSoFar = rollout.phases.flatMap((p) => p.migratedTenantIds);
      const restoredAssignments = s.policyTemplateAssignments.map((a) => {
        if (
          a.templateId === rollout.templateId &&
          migratedSoFar.includes(a.tenantId) &&
          rollout.fromVersion !== null
        ) {
          return { ...a, appliedVersion: rollout.fromVersion, appliedAt: now, appliedBy: operatorName };
        }
        return a;
      });
      return {
        policyTemplateRollouts: s.policyTemplateRollouts.map((r) =>
          r.id === rolloutId
            ? {
                ...r,
                status: "rolled-back",
                abortedAt: now,
                abortReason: reason,
                currentPhase: null,
              }
            : r,
        ),
        policyTemplateAssignments: restoredAssignments,
        policyTemplateAudit: [
          {
            id: makeAuditId("ptaud"),
            templateId: rollout.templateId,
            occurredAt: now,
            actor: operatorName,
            actorRole: "MSP Admin",
            action: "template.rollout.abort" as PolicyTemplateAuditAction,
            targetVersion: rollout.toVersion,
            description: `Rollout aborted. ${migratedSoFar.length} tenants restored to v${rollout.fromVersion}. Reason: ${reason}`,
            outcome: "success",
          },
          ...s.policyTemplateAudit,
        ],
      };
    }),

  completePolicyRollout: (rolloutId, operatorName) =>
    set((s) => {
      const rollout = s.policyTemplateRollouts.find((r) => r.id === rolloutId);
      if (!rollout) return {};
      const now = new Date().toISOString();
      const allTenantIds = rollout.phases.flatMap((p) => p.tenantIds);
      const updatedAssignments = s.policyTemplateAssignments.map((a) => {
        if (a.templateId === rollout.templateId && allTenantIds.includes(a.tenantId)) {
          return { ...a, appliedVersion: rollout.toVersion, appliedAt: now, appliedBy: operatorName };
        }
        return a;
      });
      return {
        policyTemplateRollouts: s.policyTemplateRollouts.map((r) =>
          r.id === rolloutId
            ? { ...r, status: "complete", completedAt: now, currentPhase: null }
            : r,
        ),
        policyTemplateAssignments: updatedAssignments,
        policyTemplateAudit: [
          {
            id: makeAuditId("ptaud"),
            templateId: rollout.templateId,
            occurredAt: now,
            actor: operatorName,
            actorRole: "MSP Admin",
            action: "template.rollout.complete" as PolicyTemplateAuditAction,
            targetVersion: rollout.toVersion,
            description: `Rollout complete: ${allTenantIds.length} tenants migrated to v${rollout.toVersion}`,
            outcome: "success",
          },
          ...s.policyTemplateAudit,
        ],
      };
    }),

  applyPolicyTemplateToTenant: (templateId, tenantId, version, operatorName) =>
    set((s) => {
      const now = new Date().toISOString();
      const existing = s.policyTemplateAssignments.find(
        (a) => a.tenantId === tenantId,
      );
      const next: TenantTemplateAssignment = {
        tenantId,
        templateId,
        appliedVersion: version,
        appliedAt: now,
        appliedBy: operatorName,
      };
      const tenant = s.tenants.find((t) => t.id === tenantId);
      const template = s.policyTemplates.find((t) => t.id === templateId);
      return {
        policyTemplateAssignments: existing
          ? s.policyTemplateAssignments.map((a) =>
              a.tenantId === tenantId ? next : a,
            )
          : [...s.policyTemplateAssignments, next],
        policyTemplateAudit: [
          {
            id: makeAuditId("ptaud"),
            templateId,
            occurredAt: now,
            actor: operatorName,
            actorRole: "MSP Admin",
            action: "template.tenant.apply" as PolicyTemplateAuditAction,
            targetVersion: version,
            description: `${template?.name ?? templateId} v${version} applied to ${tenant?.name ?? tenantId}`,
            outcome: "success",
          },
          ...s.policyTemplateAudit,
        ],
      };
    }),

  removePolicyTemplateFromTenant: (templateId, tenantId, operatorName) =>
    set((s) => {
      const tenant = s.tenants.find((t) => t.id === tenantId);
      const template = s.policyTemplates.find((t) => t.id === templateId);
      return {
        policyTemplateAssignments: s.policyTemplateAssignments.filter(
          (a) => !(a.tenantId === tenantId && a.templateId === templateId),
        ),
        policyTemplateOverrides: s.policyTemplateOverrides.filter(
          (o) => !(o.tenantId === tenantId && o.templateId === templateId),
        ),
        policyTemplateAudit: [
          {
            id: makeAuditId("ptaud"),
            templateId,
            occurredAt: new Date().toISOString(),
            actor: operatorName,
            actorRole: "MSP Admin",
            action: "template.tenant.remove" as PolicyTemplateAuditAction,
            description: `${template?.name ?? templateId} unassigned from ${tenant?.name ?? tenantId}`,
            outcome: "success",
          },
          ...s.policyTemplateAudit,
        ],
      };
    }),

  addPolicyTemplateOverride: (override) =>
    set((s) => {
      const id = `ovr_${override.templateId}_${override.tenantId}_${Date.now().toString(36)}`;
      const now = new Date().toISOString();
      const tenant = s.tenants.find((t) => t.id === override.tenantId);
      return {
        policyTemplateOverrides: [
          ...s.policyTemplateOverrides,
          { ...override, id, appliedAt: now },
        ],
        policyTemplateAudit: [
          {
            id: makeAuditId("ptaud"),
            templateId: override.templateId,
            occurredAt: now,
            actor: override.appliedBy,
            actorRole: "MSP Admin",
            action: "template.override.add" as PolicyTemplateAuditAction,
            description: `Override on ${override.fieldLabel} for ${tenant?.name ?? override.tenantId}: ${override.templateValue} to ${override.overrideValue}. Reason: ${override.reason}`,
            outcome: "success",
          },
          ...s.policyTemplateAudit,
        ],
      };
    }),

  removePolicyTemplateOverride: (overrideId, operatorName) =>
    set((s) => {
      const override = s.policyTemplateOverrides.find((o) => o.id === overrideId);
      if (!override) return {};
      const tenant = s.tenants.find((t) => t.id === override.tenantId);
      return {
        policyTemplateOverrides: s.policyTemplateOverrides.filter((o) => o.id !== overrideId),
        policyTemplateAudit: [
          {
            id: makeAuditId("ptaud"),
            templateId: override.templateId,
            occurredAt: new Date().toISOString(),
            actor: operatorName,
            actorRole: "MSP Admin",
            action: "template.override.remove" as PolicyTemplateAuditAction,
            description: `Override removed: ${override.fieldLabel} for ${tenant?.name ?? override.tenantId} restored to template default`,
            outcome: "success",
          },
          ...s.policyTemplateAudit,
        ],
      };
    }),
}));
