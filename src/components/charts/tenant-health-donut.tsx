"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip } from "./chart-tooltip";
import { ChartFrame } from "./chart-frame";
import { formatPercent } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface Slice {
  status: "Active" | "Onboarding" | "Suspended" | "Churned";
  value: number;
  color: string;
  href: string;
}

interface TenantHealthDonutProps {
  data: Slice[];
}

export function TenantHealthDonut({ data }: TenantHealthDonutProps) {
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row lg:items-center">
      <ChartFrame height={260} className="max-w-[280px]" ariaLabel="Tenant health donut">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="status"
              innerRadius={82}
              outerRadius={118}
              paddingAngle={1.5}
              stroke="var(--surface)"
              strokeWidth={2}
              isAnimationActive
              animationDuration={500}
              onClick={(slice) => {
                const s = slice as unknown as { href?: string };
                if (s.href) router.push(s.href);
              }}
              onMouseEnter={(_, idx) => setActive(data[idx]?.status ?? null)}
              onMouseLeave={() => setActive(null)}
              cursor="pointer"
            >
              {data.map((d) => (
                <Cell
                  key={d.status}
                  fill={d.color}
                  opacity={active === null || active === d.status ? 1 : 0.45}
                />
              ))}
            </Pie>
            <Tooltip
              cursor={false}
              content={({ active: a, payload }) => {
                if (!a || !payload?.length) return null;
                const slice = payload[0]?.payload as Slice;
                return (
                  <ChartTooltip
                    title={slice.status}
                    series={[
                      {
                        label: "Tenants",
                        value: slice.value.toString(),
                        color: slice.color,
                      },
                      {
                        label: "Share",
                        value: formatPercent((slice.value / total) * 100),
                        color: "var(--text-tertiary)",
                      },
                    ]}
                  />
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[36px] font-semibold leading-none tabular-nums text-text-primary">
            {total}
          </span>
          <span className="mt-1 text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
            Total Tenants
          </span>
        </div>
      </ChartFrame>
      <ul className="flex flex-1 flex-col gap-2">
        {data.map((d) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0;
          return (
            <li key={d.status}>
              <button
                type="button"
                onClick={() => router.push(d.href)}
                onMouseEnter={() => setActive(d.status)}
                onMouseLeave={() => setActive(null)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors",
                  "hover:bg-secondary",
                  active === d.status ? "bg-secondary" : "",
                )}
              >
                <span className="flex items-center gap-2.5 text-[13px] text-text-primary">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  {d.status}
                </span>
                <span className="flex items-center gap-3 text-[12px]">
                  <span className="tabular-nums text-text-secondary">{d.value}</span>
                  <span className="tabular-nums text-text-tertiary">{formatPercent(pct)}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
