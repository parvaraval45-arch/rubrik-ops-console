"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartFrame } from "@/components/charts/chart-frame";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { Button } from "@/components/ui/button";
import { useConsoleStore } from "@/lib/store";
import { mockData } from "@/lib/mock-data";
import { formatPercent, formatTB } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Tier } from "@/types";

const TIER_COLORS: Record<Tier, string> = {
  Platinum: "#7C3AED",
  Gold: "#D97706",
  Silver: "#94A3B8",
  Bronze: "#9CA3AF",
};

export function ForecastPanel() {
  const lineItems = useConsoleStore((s) => s.billingLineItems);

  const data = useMemo(() => {
    const out: Array<{
      day: number;
      label: string;
      Platinum: number;
      Gold: number;
      Silver: number;
      Bronze: number;
      forecast: boolean;
    }> = [];
    const tierTotals: Record<Tier, number> = {
      Platinum: 0,
      Gold: 0,
      Silver: 0,
      Bronze: 0,
    };
    for (const li of lineItems) {
      tierTotals[li.tier] += li.usedTB;
    }
    for (let d = -29; d <= 90; d += 1) {
      const isForecast = d >= 0;
      const drift = (d + 30) / 30;
      const platinum = tierTotals.Platinum * (0.95 + drift * 0.04);
      const gold = tierTotals.Gold * (0.92 + drift * 0.06);
      const silver = tierTotals.Silver * (0.94 + drift * 0.05);
      const bronze = tierTotals.Bronze * (0.96 + drift * 0.03);
      out.push({
        day: d,
        label: d === 0 ? "Now" : d > 0 ? `+${d}d` : `${d}d`,
        Platinum: Number(platinum.toFixed(1)),
        Gold: Number(gold.toFixed(1)),
        Silver: Number(silver.toFixed(1)),
        Bronze: Number(bronze.toFixed(1)),
        forecast: isForecast,
      });
    }
    return out;
  }, [lineItems]);

  const currentTotal = data.find((d) => d.day === 0);
  const day30 = data.find((d) => d.day === 30);
  const day60 = data.find((d) => d.day === 60);
  const day90 = data.find((d) => d.day === 90);

  const total = (d?: typeof data[number]) =>
    d ? d.Platinum + d.Gold + d.Silver + d.Bronze : 0;

  return (
    <section className="rounded-lg border border-border-subtle bg-surface shadow-card">
      <div className="border-b border-border-subtle px-5 py-4">
        <h2 className="text-[14px] font-semibold text-text-primary">
          90-Day Capacity Forecast
        </h2>
        <p className="mt-0.5 text-[12px] text-text-secondary">
          Projected billable TB by tier · Updated daily
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[1fr_280px]">
        <ChartFrame height={260} ariaLabel="90-day capacity forecast by tier">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                {(["Platinum", "Gold", "Silver", "Bronze"] as Tier[]).map((tier) => (
                  <linearGradient
                    key={tier}
                    id={`grad-${tier}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={TIER_COLORS[tier]} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={TIER_COLORS[tier]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10.5, fill: "var(--text-secondary)" }}
                tickLine={false}
                axisLine={false}
                interval={20}
              />
              <YAxis
                tick={{ fontSize: 10.5, fill: "var(--text-secondary)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v.toFixed(0)}`}
                width={42}
              />
              <Tooltip
                cursor={{ stroke: "var(--border-default)" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <ChartTooltip
                      title={String(label)}
                      series={(["Platinum", "Gold", "Silver", "Bronze"] as Tier[]).map((tier) => ({
                        label: tier,
                        value: `${Number(payload.find((p) => p.dataKey === tier)?.value ?? 0).toFixed(1)} TB`,
                        color: TIER_COLORS[tier],
                      }))}
                    />
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} iconType="circle" />
              {(["Platinum", "Gold", "Silver", "Bronze"] as Tier[]).map((tier) => (
                <Area
                  key={tier}
                  name={tier}
                  type="monotone"
                  dataKey={tier}
                  stackId="1"
                  stroke={TIER_COLORS[tier]}
                  fill={`url(#grad-${tier})`}
                  strokeWidth={1.5}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartFrame>

        <div className="flex flex-col gap-3 text-[12.5px]">
          <Stat label="Current billable" value={`${total(currentTotal).toFixed(0)} TB`} />
          <Stat
            label="Forecasted day 30"
            value={`${total(day30).toFixed(0)} TB (+${(((total(day30) - total(currentTotal)) / Math.max(1, total(currentTotal))) * 100).toFixed(1)}%)`}
          />
          <Stat
            label="Forecasted day 60"
            value={`${total(day60).toFixed(0)} TB (+${(((total(day60) - total(currentTotal)) / Math.max(1, total(currentTotal))) * 100).toFixed(1)}%)`}
          />
          <Stat
            label="Forecasted day 90"
            value={`${total(day90).toFixed(0)} TB (+${(((total(day90) - total(currentTotal)) / Math.max(1, total(currentTotal))) * 100).toFixed(1)}%)`}
          />
          <Stat label="Confidence" value="±8% (12-mo variance)" />
        </div>
      </div>

      <section className="border-t border-border-subtle p-5">
        <h3 className="text-[12.5px] font-semibold text-text-primary">
          Capacity Headroom Across All Clusters
        </h3>
        <ul className="mt-3 flex flex-col gap-2 text-[12.5px]">
          {mockData.clusters.map((c) => {
            const util = (c.usedTB / c.capacityTB) * 100;
            const tone = util > 90 ? "critical" : util > 80 ? "warning" : "ok";
            return (
              <li
                key={c.id}
                className="rounded-md border border-border-subtle bg-canvas p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] text-text-primary">{c.name}</span>
                  <span className="tabular-nums text-text-secondary">
                    {formatPercent(util, 0)} used · {formatPercent(100 - util, 0)} headroom
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      "h-full",
                      tone === "critical"
                        ? "bg-status-critical"
                        : tone === "warning"
                          ? "bg-status-warning"
                          : "bg-brand-primary",
                    )}
                    style={{ width: `${Math.min(100, util)}%` }}
                  />
                </div>
                <div className="mt-1 text-[11px] text-text-tertiary tabular-nums">
                  {formatTB(c.usedTB)} of {formatTB(c.capacityTB)}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 rounded-md border border-status-warning/30 bg-status-warning-subtle p-3 text-[12.5px] text-text-primary">
          <span className="font-semibold text-status-warning">
            us-east-rsc-cluster-02 will require expansion in approximately 47 days at current growth.
          </span>{" "}
          Place capacity order by May 28.
        </div>

        <Button
          variant="outline"
          className="mt-3"
          onClick={() => toast.success("Capacity review scheduled with infra team.")}
        >
          Schedule Capacity Review
        </Button>
      </section>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-canvas p-3">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
        {label}
      </div>
      <div className="mt-1 tabular-nums text-text-primary">{value}</div>
    </div>
  );
}
