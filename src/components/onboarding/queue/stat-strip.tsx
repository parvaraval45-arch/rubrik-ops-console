import { cn } from "@/lib/utils";

export interface StatStripItem {
  label: string;
  value: string;
  subtitle?: string;
  tone?: "default" | "info" | "warning" | "success";
}

const TONE: Record<NonNullable<StatStripItem["tone"]>, string> = {
  default: "text-text-primary",
  info: "text-status-info",
  warning: "text-status-warning",
  success: "text-status-success",
};

export function StatStrip({ items }: { items: StatStripItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-border-subtle bg-surface p-4 shadow-card"
        >
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
            {item.label}
          </div>
          <div
            className={cn(
              "mt-1 text-[22px] font-semibold leading-none tabular-nums",
              TONE[item.tone ?? "default"],
            )}
          >
            {item.value}
          </div>
          {item.subtitle ? (
            <div className="mt-1 text-[12px] text-text-secondary">{item.subtitle}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
