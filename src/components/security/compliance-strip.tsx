"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useConsoleStore } from "@/lib/store";
import { formatPercent } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { ComplianceFrameworkPosture } from "@/types";

export function ComplianceStrip() {
  const posture = useConsoleStore((s) => s.compliancePosture);
  const [active, setActive] = useState<ComplianceFrameworkPosture | null>(null);

  return (
    <section className="rounded-lg border border-border-subtle bg-surface shadow-card">
      <div className="border-b border-border-subtle px-5 py-4">
        <h2 className="text-[14px] font-semibold text-text-primary">
          Compliance Framework Posture
        </h2>
        <p className="mt-0.5 text-[12px] text-text-secondary">
          Per-framework attestation status across all tenants.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-3 xl:grid-cols-5">
        {posture.map((p) => {
          const tone =
            p.compliancePct >= 90
              ? "success"
              : p.compliancePct >= 75
                ? "warning"
                : "critical";
          return (
            <button
              key={p.framework}
              type="button"
              onClick={() => setActive(p)}
              className="flex flex-col gap-2 rounded-lg border border-border-subtle bg-canvas p-4 text-left transition-shadow hover:shadow-md"
            >
              <span className="text-[12px] font-semibold uppercase tracking-wide text-text-tertiary">
                {p.framework}
              </span>
              <div
                className={cn(
                  "text-[24px] font-semibold leading-none tabular-nums",
                  tone === "success" && "text-status-success",
                  tone === "warning" && "text-status-warning",
                  tone === "critical" && "text-status-critical",
                )}
              >
                {formatPercent(p.compliancePct)}
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    "h-full",
                    tone === "success" && "bg-status-success",
                    tone === "warning" && "bg-status-warning",
                    tone === "critical" && "bg-status-critical",
                  )}
                  style={{ width: `${p.compliancePct}%` }}
                />
              </div>
              <div className="text-[11.5px] text-text-secondary">
                {p.compliantCount} of {p.totalCount} tenants compliant
              </div>
              <div className="text-[11px] text-brand-primary-hover">View Details →</div>
            </button>
          );
        })}
      </div>

      <Dialog open={active !== null} onOpenChange={(o) => { if (!o) setActive(null); }}>
        <DialogContent className="max-w-[640px]">
          {active ? (
            <>
              <DialogHeader>
                <DialogTitle>{active.fullLabel}</DialogTitle>
                <DialogDescription className="text-[12.5px] text-text-secondary">
                  {active.compliantCount} of {active.totalCount} tenants compliant — {formatPercent(active.compliancePct)}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[400px] overflow-y-auto rounded-md border border-border-subtle">
                {active.findings.length === 0 ? (
                  <div className="px-5 py-8 text-center text-[12.5px] text-text-tertiary">
                    No tenants with findings under {active.framework}.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border-subtle">
                        <TableHead className="px-5 text-[10.5px] font-semibold uppercase text-text-tertiary">
                          Tenant
                        </TableHead>
                        <TableHead className="text-[10.5px] font-semibold uppercase text-text-tertiary">
                          Findings
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {active.findings.map((f) => (
                        <TableRow key={f.tenantId} className="border-border-subtle text-[12.5px]">
                          <TableCell className="px-5 align-top text-text-primary">
                            {f.tenantName}
                          </TableCell>
                          <TableCell>
                            <ul className="flex flex-col gap-0.5">
                              {f.findings.map((finding, i) => (
                                <li key={i} className="text-text-secondary">
                                  {finding}
                                </li>
                              ))}
                            </ul>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast.success("Framework attestation generated", {
                      description: `${active.framework} attestation queued for download.`,
                    })
                  }
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export {active.framework} Attestation
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
