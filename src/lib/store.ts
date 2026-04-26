"use client";

import { create } from "zustand";
import { mockData } from "./mock-data";
import type {
  Alert,
  AuditEvent,
  IsolationCheck,
  IsolationCheckId,
  Policy,
  PolicyVersion,
  Tenant,
} from "@/types";

export interface SavedView {
  id: string;
  name: string;
  filters: Record<string, string[]>;
}

interface ConsoleState {
  tenants: Tenant[];
  policies: Policy[];
  alerts: Alert[];
  isolationChecks: IsolationCheck[];
  auditEvents: AuditEvent[];
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
}

export const useConsoleStore = create<ConsoleState>((set) => ({
  tenants: mockData.tenants,
  policies: mockData.policies,
  alerts: mockData.alerts,
  isolationChecks: mockData.isolationChecks,
  auditEvents: mockData.auditEvents,
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
}));
