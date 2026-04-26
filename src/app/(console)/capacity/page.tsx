"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/data/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OverageBanner } from "@/components/capacity/overage-banner";
import { BillingKpis } from "@/components/capacity/billing-kpis";
import { PeriodStatusBar } from "@/components/capacity/period-status-bar";
import { BillingTable } from "@/components/capacity/billing-table";
import { TenantBillingSheet } from "@/components/capacity/tenant-billing-sheet";
import { GenerateInvoicesDialog } from "@/components/capacity/generate-invoices-dialog";
import { ForecastPanel } from "@/components/capacity/forecast-panel";
import { QuotaEnforcementTable } from "@/components/capacity/quota-enforcement-table";
import { ExportDropdown } from "@/components/capacity/export-dropdown";
import { useConsoleStore } from "@/lib/store";
import type { BillingLineItem, BillingStatus } from "@/types";

export default function CapacityPage() {
  const lineItems = useConsoleStore((s) => s.billingLineItems);
  const billingPeriod = useConsoleStore((s) => s.billingPeriod);
  const [period, setPeriod] = useState("2026-04");
  const [selected, setSelected] = useState<BillingLineItem | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "All" | BillingStatus
  >("All");
  const [overageOnly, setOverageOnly] = useState(false);
  const [tableKey, setTableKey] = useState(0);

  const handleKpiClick = (target: "mrr" | "overage" | "underutilized" | "disputed") => {
    if (target === "disputed") {
      setFilterStatus("Disputed");
      setOverageOnly(false);
      setTableKey((k) => k + 1);
    } else if (target === "overage") {
      setOverageOnly(true);
      setFilterStatus("All");
      setTableKey((k) => k + 1);
    }
  };

  const handleViewAll = () => {
    setOverageOnly(true);
    setFilterStatus("All");
    setTableKey((k) => k + 1);
  };

  const handleTenantOpen = (lineItemId: string) => {
    const li = lineItems.find((x) => x.id === lineItemId);
    if (li) setSelected(li);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Finance"
        title="Capacity & Billing"
        description="Infrastructure utilization and tenant billing"
        actions={
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-9 w-[170px]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026-04">April 2026</SelectItem>
                <SelectItem value="2026-03">March 2026</SelectItem>
                <SelectItem value="2026-02">February 2026</SelectItem>
                <SelectItem value="2026-01">January 2026</SelectItem>
              </SelectContent>
            </Select>
            <ExportDropdown />
            <Button
              onClick={() => setInvoiceOpen(true)}
              className="gap-2 bg-brand-primary text-white hover:bg-brand-primary-hover"
            >
              <FileText className="h-4 w-4" />
              Generate Invoices
            </Button>
          </div>
        }
      />

      <OverageBanner
        rows={lineItems}
        onTenantClick={handleTenantOpen}
        onViewAll={handleViewAll}
      />

      <BillingKpis lineItems={lineItems} onClick={handleKpiClick} />

      <PeriodStatusBar period={billingPeriod} />

      <BillingTable
        key={tableKey}
        filterStatus={filterStatus}
        filterOverage={overageOnly}
        onRowClick={setSelected}
      />

      <ForecastPanel />

      <QuotaEnforcementTable />

      <TenantBillingSheet
        lineItem={selected}
        open={selected !== null}
        onOpenChange={(o) => {
          if (!o) setSelected(null);
        }}
      />

      <GenerateInvoicesDialog open={invoiceOpen} onOpenChange={setInvoiceOpen} />
    </div>
  );
}
