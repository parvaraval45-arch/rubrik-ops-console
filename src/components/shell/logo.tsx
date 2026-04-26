import { cn } from "@/lib/utils";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export function Logo({ collapsed = false, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {!collapsed ? (
        <div className="flex flex-col leading-none">
          <span className="text-[13px] font-semibold tracking-tight text-text-primary">
            Rubrik MSP
          </span>
          <span className="text-[11px] font-medium text-text-tertiary">
            Operations Console
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Rubrik logo"
      role="img"
    >
      <defs>
        <linearGradient id="rbk-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00B67A" />
          <stop offset="100%" stopColor="#009966" />
        </linearGradient>
      </defs>
      <path
        d="M16 2.5l11.6 6.7v13.6L16 29.5 4.4 22.8V9.2L16 2.5z"
        fill="url(#rbk-grad)"
      />
      <path
        d="M16 9.2l5.5 3.2v6.4L16 22l-5.5-3.2v-6.4L16 9.2z"
        fill="#FFFFFF"
        opacity="0.9"
      />
    </svg>
  );
}
