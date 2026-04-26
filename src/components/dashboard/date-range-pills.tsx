"use client";

import { cn } from "@/lib/utils";

export type DateRange = "7d" | "30d" | "90d";

const OPTIONS: { value: DateRange; label: string }[] = [
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
];

export function DateRangePills({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (value: DateRange) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-md border border-border-default bg-surface p-0.5">
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "h-7 min-w-[40px] rounded-[4px] px-3 text-[12px] font-medium tabular-nums transition-colors",
              active
                ? "bg-brand-primary-subtle text-brand-primary-hover"
                : "text-text-secondary hover:bg-secondary hover:text-text-primary",
            )}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
