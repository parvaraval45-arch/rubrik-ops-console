import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 pb-6", className)}>
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          {eyebrow ? (
            <span className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-text-primary">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-[13px] leading-relaxed text-text-secondary">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
