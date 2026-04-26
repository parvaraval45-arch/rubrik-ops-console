"use client";

import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "./chart-tooltip";
import { ChartFrame } from "./chart-frame";
import { formatPercent, formatTB } from "@/lib/formatters";

export interface TopTenantBarRow {
  tenantId: string;
  name: string;
  protected: number;
  allocated: number;
}

function truncate(name: string, max = 18) {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

export function TopTenantsBar({ data }: { data: TopTenantBarRow[] }) {
  const router = useRouter();
  const max = Math.max(...data.map((d) => d.allocated), 1);

  return (
    <ChartFrame height={320} ariaLabel="Top 10 tenants by protected capacity">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 12, bottom: 0 }}
          barCategoryGap={6}
          onClick={(state) => {
            const s = state as unknown as
              | { activePayload?: Array<{ payload?: TopTenantBarRow }> }
              | undefined;
            const payload = s?.activePayload?.[0]?.payload;
            if (payload?.tenantId) router.push(`/tenants/${payload.tenantId}`);
          }}
        >
          <CartesianGrid
            stroke="var(--border-subtle)"
            strokeDasharray="0"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, Math.ceil(max * 1.05)]}
            tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => formatTB(v)}
          />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 12, fill: "var(--text-primary)" }}
            tickLine={false}
            axisLine={false}
            width={150}
            tickFormatter={(v: string) => truncate(v)}
          />
          <Tooltip
            cursor={{ fill: "var(--brand-primary-subtle)", opacity: 0.5 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0]?.payload as TopTenantBarRow;
              const usage = row.allocated > 0 ? (row.protected / row.allocated) * 100 : 0;
              return (
                <ChartTooltip
                  title={row.name}
                  subtitle="Click to open tenant"
                  series={[
                    {
                      label: "Protected",
                      value: formatTB(row.protected),
                      color: "var(--brand-primary)",
                    },
                    {
                      label: "Allocated",
                      value: formatTB(row.allocated),
                      color: "var(--brand-primary-subtle)",
                    },
                    {
                      label: "Utilization",
                      value: formatPercent(usage),
                      color: "var(--text-tertiary)",
                    },
                  ]}
                />
              );
            }}
          />
          <Bar
            dataKey="allocated"
            fill="var(--brand-primary)"
            fillOpacity={0.18}
            radius={[2, 2, 2, 2]}
            barSize={6}
            isAnimationActive
            animationDuration={460}
          >
            {data.map((d) => (
              <Cell key={`alloc-${d.tenantId}`} cursor="pointer" />
            ))}
          </Bar>
          <Bar
            dataKey="protected"
            fill="var(--brand-primary)"
            radius={[2, 2, 2, 2]}
            barSize={6}
            isAnimationActive
            animationDuration={520}
          >
            {data.map((d) => (
              <Cell key={`prot-${d.tenantId}`} cursor="pointer" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
