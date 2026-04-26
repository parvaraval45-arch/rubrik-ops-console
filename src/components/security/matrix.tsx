"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  XOctagon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ISOLATION_CONTROLS } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/formatters";
import type {
  IsolationCell,
  IsolationCellStatus,
  IsolationControlId,
  Tenant,
  Tier,
} from "@/types";

const STATUS_LABEL: Record<IsolationCellStatus, string> = {
  pass: "Pass",
  warn: "Warn",
  fail: "Fail",
  remediating: "Remediating",
};

const STATUS_TEXT: Record<IsolationCellStatus, string> = {
  pass: "text-status-success",
  warn: "text-status-warning",
  fail: "text-status-critical",
  remediating: "text-brand-primary-hover",
};

const STATUS_BG: Record<IsolationCellStatus, string> = {
  pass: "bg-surface hover:bg-status-success-subtle/40",
  warn: "bg-status-warning-subtle/40 hover:bg-status-warning-subtle",
  fail: "bg-status-critical-subtle hover:bg-status-critical-subtle/80",
  remediating: "bg-brand-primary-subtle hover:bg-brand-primary-subtle/80",
};

const TIER_BADGE: Record<Tier, string> = {
  Platinum: "bg-slate-900 text-white",
  Gold: "bg-amber-100 text-amber-900",
  Silver: "bg-slate-200 text-slate-700",
  Bronze: "bg-orange-100 text-orange-900",
};

interface MatrixProps {
  tenants: Tenant[];
  cells: IsolationCell[];
  initialDisplayCount?: number;
  onCellClick: (tenantId: string, controlId: IsolationControlId) => void;
  selectedKey?: string;
}

type View = "all" | "failures" | "industry";
type Sort = "name" | "score" | "violations";

export function IsolationMatrix({
  tenants,
  cells,
  initialDisplayCount = 30,
  onCellClick,
  selectedKey,
}: MatrixProps) {
  const [view, setView] = useState<View>("all");
  const [sort, setSort] = useState<Sort>("violations");
  const [displayCount, setDisplayCount] = useState(initialDisplayCount);
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusCell, setFocusCell] = useState<{ rowIdx: number; colIdx: number }>({
    rowIdx: 0,
    colIdx: 0,
  });

  const cellLookup = useMemo(() => {
    const map = new Map<string, IsolationCell>();
    cells.forEach((c) => map.set(`${c.tenantId}:${c.controlId}`, c));
    return map;
  }, [cells]);

  const tenantsWithStats = useMemo(() => {
    return tenants.map((t) => {
      const myCells = ISOLATION_CONTROLS.map(
        (ctrl) => cellLookup.get(`${t.id}:${ctrl.id}`),
      );
      const fails = myCells.filter((c) => c?.status === "fail").length;
      const warns = myCells.filter((c) => c?.status === "warn").length;
      const score = Math.max(0, 100 - fails * 15 - warns * 6);
      return { tenant: t, fails, warns, score, cells: myCells };
    });
  }, [tenants, cellLookup]);

  const visible = useMemo(() => {
    let arr = tenantsWithStats;
    if (view === "failures") {
      arr = arr.filter((t) => t.fails > 0 || t.warns > 0);
    }
    if (sort === "name") {
      arr = [...arr].sort((a, b) => a.tenant.name.localeCompare(b.tenant.name));
    } else if (sort === "score") {
      arr = [...arr].sort((a, b) => b.score - a.score);
    } else {
      arr = [...arr].sort((a, b) => b.fails * 2 + b.warns - (a.fails * 2 + a.warns));
    }
    return arr.slice(0, displayCount);
  }, [tenantsWithStats, view, sort, displayCount]);

  const totalFails = useMemo(
    () => cells.filter((c) => c.status === "fail").length,
    [cells],
  );
  const totalWarns = useMemo(
    () => cells.filter((c) => c.status === "warn").length,
    [cells],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    const max = visible.length - 1;
    let { rowIdx, colIdx } = focusCell;
    if (e.key === "ArrowRight") {
      colIdx = Math.min(4, colIdx + 1);
    } else if (e.key === "ArrowLeft") {
      colIdx = Math.max(0, colIdx - 1);
    } else if (e.key === "ArrowDown") {
      rowIdx = Math.min(max, rowIdx + 1);
    } else if (e.key === "ArrowUp") {
      rowIdx = Math.max(0, rowIdx - 1);
    } else if (e.key === "Home") {
      colIdx = 0;
    } else if (e.key === "End") {
      colIdx = 4;
    } else if (e.key === "Enter" || e.key === " ") {
      const tenant = visible[rowIdx]?.tenant;
      const control = ISOLATION_CONTROLS[colIdx];
      if (tenant && control) onCellClick(tenant.id, control.id);
      e.preventDefault();
      return;
    } else {
      return;
    }
    e.preventDefault();
    setFocusCell({ rowIdx, colIdx });
    requestAnimationFrame(() => {
      const cell = gridRef.current?.querySelector<HTMLButtonElement>(
        `button[data-cell-row="${rowIdx}"][data-cell-col="${colIdx}"]`,
      );
      cell?.focus();
    });
  };

  return (
    <section className="rounded-lg border border-border-subtle bg-surface shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
        <div>
          <h2 className="text-[14px] font-semibold text-text-primary">
            Tenant Isolation Matrix
          </h2>
          <p className="mt-0.5 text-[12px] text-text-secondary">
            {visible.length} tenants displayed · {totalFails} failures · {totalWarns} warnings
            {tenantsWithStats.length > displayCount ? (
              <>
                {" "}
                ·{" "}
                <button
                  type="button"
                  className="font-medium text-brand-primary-hover hover:underline"
                  onClick={() => setDisplayCount((c) => c + 32)}
                >
                  Load {Math.min(32, tenantsWithStats.length - displayCount)} more
                </button>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as View)}>
            <TabsList>
              <TabsTrigger value="all">All Tenants</TabsTrigger>
              <TabsTrigger value="failures">Failures Only</TabsTrigger>
              <TabsTrigger value="industry">By Industry</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="h-9 w-[160px]" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="violations">Sort: Violations</SelectItem>
              <SelectItem value="score">Sort: Score</SelectItem>
              <SelectItem value="name">Sort: Name</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" className="text-brand-primary-hover">
            Export Matrix as CSV
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-5 pt-3 text-[11px] text-text-tertiary">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-status-success" />
          Pass
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-status-warning" />
          Warn
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-status-critical" />
          Fail
        </span>
        <span>·</span>
        <span>Click any cell for details and evidence</span>
      </div>

      <div
        ref={gridRef}
        role="grid"
        aria-label="Tenant isolation posture matrix"
        onKeyDown={onKeyDown}
        className="grid gap-px bg-border-subtle px-5 py-4"
        style={{
          gridTemplateColumns:
            "240px repeat(5, minmax(140px, 1fr)) 120px 140px",
        }}
      >
        <div className="contents" role="row">
          <HeaderCell label="Tenant" align="left" />
          {ISOLATION_CONTROLS.map((c) => (
            <HeaderCell key={c.id} label={c.label} />
          ))}
          <HeaderCell label="Score" />
          <HeaderCell label="Last Check" />
        </div>

        {visible.map((row, rowIdx) => (
          <div key={row.tenant.id} role="row" className="contents">
            <div
              role="rowheader"
              className="sticky left-0 z-[1] flex items-center justify-between gap-2 bg-surface px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium text-text-primary">
                  {row.tenant.name}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-transparent text-[10px] font-semibold uppercase",
                      TIER_BADGE[row.tenant.tier],
                    )}
                  >
                    {row.tenant.tier}
                  </Badge>
                  {row.fails > 0 ? (
                    <span className="text-[10.5px] tabular-nums text-status-critical">
                      {row.fails} failed
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            {ISOLATION_CONTROLS.map((control, colIdx) => {
              const cell = cellLookup.get(`${row.tenant.id}:${control.id}`);
              if (!cell) return <div key={control.id} className="bg-surface" />;
              const cellKey = `${row.tenant.id}:${control.id}`;
              const tabIdx =
                rowIdx === focusCell.rowIdx && colIdx === focusCell.colIdx ? 0 : -1;
              return (
                <button
                  key={control.id}
                  role="gridcell"
                  data-cell-row={rowIdx}
                  data-cell-col={colIdx}
                  tabIndex={tabIdx}
                  aria-label={`${row.tenant.name} ${control.label}: ${STATUS_LABEL[cell.status]}`}
                  aria-selected={selectedKey === cellKey}
                  onClick={() => onCellClick(row.tenant.id, control.id)}
                  onFocus={() => setFocusCell({ rowIdx, colIdx })}
                  className={cn(
                    "relative flex items-center justify-center gap-1.5 px-3 py-2.5 text-[12px] transition-colors duration-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary",
                    STATUS_BG[cell.status],
                    cell.acknowledged && cell.status !== "pass" && "ring-1 ring-inset ring-status-warning",
                  )}
                >
                  <CellIcon status={cell.status} />
                  <span className={cn("font-medium", STATUS_TEXT[cell.status])}>
                    {STATUS_LABEL[cell.status]}
                  </span>
                  {cell.acknowledged && cell.status !== "pass" ? (
                    <span
                      className="absolute right-1 top-1 rounded-sm bg-status-warning/80 px-1 text-[8.5px] font-semibold uppercase text-white"
                      title="Acknowledged"
                    >
                      ack
                    </span>
                  ) : null}
                </button>
              );
            })}
            <div className="flex items-center justify-end gap-2 bg-surface px-3 py-2.5">
              <span className="tabular-nums text-text-primary">{row.score}</span>
              <div className="h-1 w-12 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    "h-full",
                    row.score >= 85
                      ? "bg-status-success"
                      : row.score >= 70
                        ? "bg-status-warning"
                        : "bg-status-critical",
                  )}
                  style={{ width: `${row.score}%` }}
                />
              </div>
            </div>
            <div className="flex items-center bg-surface px-3 py-2.5 text-[11.5px] text-text-tertiary tabular-nums" suppressHydrationWarning>
              {formatRelativeTime(
                row.cells.find((c) => c)?.lastEvaluatedAt ?? new Date().toISOString(),
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HeaderCell({
  label,
  align = "center",
}: {
  label: string;
  align?: "left" | "center" | "right";
}) {
  return (
    <div
      role="columnheader"
      className={cn(
        "bg-surface px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary",
        align === "left" && "text-left",
        align === "center" && "text-center",
        align === "right" && "text-right",
      )}
    >
      {label}
    </div>
  );
}

function CellIcon({ status }: { status: IsolationCellStatus }) {
  if (status === "pass") return <CheckCircle2 className="h-3 w-3 text-status-success" />;
  if (status === "warn") return <AlertTriangle className="h-3 w-3 text-status-warning" />;
  if (status === "remediating") return <Loader2 className="h-3 w-3 animate-spin text-brand-primary" />;
  return <XOctagon className="h-3 w-3 text-status-critical" />;
}
