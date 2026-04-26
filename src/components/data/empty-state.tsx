import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border-default bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary-subtle text-brand-primary">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <h3 className="text-[14px] font-semibold text-text-primary">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-text-secondary">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
