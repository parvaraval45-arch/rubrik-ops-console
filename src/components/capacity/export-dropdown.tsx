"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConsoleStore } from "@/lib/store";
import { currentOperator } from "@/lib/mock-data";
import type { BillingLineItem } from "@/types";

const FILE_PREFIX = "rubrik-msp-billing-april-2026";

export function ExportDropdown() {
  const lineItems = useConsoleStore((s) => s.billingLineItems);
  const recordExport = useConsoleStore((s) => s.recordBillingExport);

  const triggerDownload = (filename: string, content: string, mime: string) => {
    if (typeof window === "undefined") return;
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const filename = `${FILE_PREFIX}.csv`;
    const header = [
      "tenant",
      "industry",
      "tier",
      "committed_tb",
      "used_tb",
      "overage_tb",
      "utilization_pct",
      "rate_per_tb",
      "base_charge",
      "overage_charge",
      "total_charge",
      "status",
      "invoice_id",
    ];
    const rows = lineItems.map((li) => [
      li.tenantName,
      li.industry,
      li.tier,
      li.committedTB,
      li.usedTB,
      li.overageTB,
      li.utilizationPct,
      li.ratePerTB,
      li.baseCharge,
      li.overageCharge,
      li.totalCharge,
      li.status,
      li.invoiceId ?? "",
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    triggerDownload(filename, csv, "text/csv");
    recordExport(currentOperator.name, "csv", filename);
    toast.success("CSV exported", { description: filename });
  };

  const exportJson = () => {
    const filename = `${FILE_PREFIX}.json`;
    const payload = {
      period: "April 2026",
      generatedAt: new Date().toISOString(),
      generatedBy: currentOperator.name,
      lineItems,
    };
    triggerDownload(filename, JSON.stringify(payload, null, 2), "application/json");
    recordExport(currentOperator.name, "json", filename);
    toast.success("JSON exported", { description: filename });
  };

  const exportConnectWise = () => {
    const filename = "rubrik-billing-cw-import-april-2026.csv";
    const header = [
      "Company_RecID",
      "Company_Name",
      "Agreement",
      "Item",
      "Description",
      "Quantity",
      "Unit_Price",
      "Extended_Price",
      "Tax_Code",
      "Status",
    ];
    const rows = lineItems.map((li) => [
      `cw_${li.tenantName.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`,
      li.tenantName,
      `${li.tier} Backup-as-a-Service`,
      "RBK-CAPACITY",
      `Capacity ${li.committedTB} TB · April 2026`,
      li.usedTB,
      li.ratePerTB,
      li.totalCharge,
      "TAX-EXEMPT",
      li.status,
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    triggerDownload(filename, csv, "text/csv");
    recordExport(currentOperator.name, "connectwise", filename);
    toast.success("ConnectWise import file generated", {
      description: "Drop into your PSA's import workflow.",
    });
  };

  const exportAutotask = () => {
    const filename = "rubrik-billing-autotask-import-april-2026.csv";
    const header = [
      "Account_ID",
      "Account_Name",
      "Contract",
      "ServiceID",
      "Service_Description",
      "Units",
      "Unit_Price",
      "Total",
      "Period",
      "Status",
    ];
    const rows = lineItems.map((li: BillingLineItem) => [
      `at_${li.tenantId}`,
      li.tenantName,
      `Rubrik MSP — ${li.tier}`,
      "RBK-MSP-CAP",
      `Backup capacity · ${li.committedTB} TB committed`,
      li.usedTB,
      li.ratePerTB,
      li.totalCharge,
      "2026-04",
      li.status,
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    triggerDownload(filename, csv, "text/csv");
    recordExport(currentOperator.name, "autotask", filename);
    toast.success("Autotask import file generated", {
      description: "Drop into your PSA's import workflow.",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Billing Data
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
          Choose format
        </DropdownMenuLabel>
        <DropdownMenuItem onSelect={exportCsv} className="gap-2">
          CSV — generic
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={exportJson} className="gap-2">
          JSON — for integrations
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
          PSA imports
        </DropdownMenuLabel>
        <DropdownMenuItem onSelect={exportConnectWise} className="gap-2">
          ConnectWise format
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={exportAutotask} className="gap-2">
          Autotask format
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
