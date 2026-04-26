"use client";

import type { ReactNode } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChartFrameProps {
  height: number | string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function ChartFrame({ height, children, className, ariaLabel }: ChartFrameProps) {
  const mounted = useMounted();
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn("relative w-full", className)}
      style={{ height }}
    >
      {mounted ? children : <Skeleton className="h-full w-full rounded-md" />}
    </div>
  );
}
