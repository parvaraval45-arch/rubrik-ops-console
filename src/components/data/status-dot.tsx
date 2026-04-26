import { cn } from "@/lib/utils";

export type StatusTone =
  | "success"
  | "warning"
  | "critical"
  | "info"
  | "neutral";

const TONE: Record<StatusTone, string> = {
  success: "bg-status-success",
  warning: "bg-status-warning",
  critical: "bg-status-critical",
  info: "bg-status-info",
  neutral: "bg-text-tertiary",
};

const TEXT: Record<StatusTone, string> = {
  success: "text-status-success",
  warning: "text-status-warning",
  critical: "text-status-critical",
  info: "text-status-info",
  neutral: "text-text-secondary",
};

interface StatusDotProps {
  tone: StatusTone;
  label?: string;
  pulse?: boolean;
  className?: string;
}

export function StatusDot({ tone, label, pulse, className }: StatusDotProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium", className)}>
      <span className="relative flex h-2 w-2 shrink-0">
        {pulse ? (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-50",
              TONE[tone],
            )}
            aria-hidden
          />
        ) : null}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", TONE[tone])} aria-hidden />
      </span>
      {label ? <span className={TEXT[tone]}>{label}</span> : null}
    </span>
  );
}
