"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Sparkline } from "./sparkline";
import { cn } from "@/lib/utils";

export type KpiTone = "positive" | "negative" | "neutral";

export interface KpiCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: KpiTone;
  deltaDirection?: "up" | "down";
  sparkline?: number[];
  href?: string;
  index?: number;
}

const TONE_TEXT: Record<KpiTone, string> = {
  positive: "text-status-success",
  negative: "text-status-critical",
  neutral: "text-text-secondary",
};

const TONE_BG: Record<KpiTone, string> = {
  positive: "bg-status-success-subtle",
  negative: "bg-status-critical-subtle",
  neutral: "bg-secondary",
};

export function KpiCard({
  label,
  value,
  delta,
  deltaTone = "neutral",
  deltaDirection,
  sparkline,
  href,
  index = 0,
}: KpiCardProps) {
  const stroke =
    deltaTone === "negative"
      ? "var(--status-critical)"
      : "var(--brand-primary)";

  const Body = (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex h-full flex-col gap-3 rounded-lg border border-border-subtle bg-surface p-4 shadow-card transition-shadow",
        href ? "cursor-pointer hover:shadow-md" : "",
      )}
    >
      <span className="line-clamp-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
        {label}
      </span>
      <div className="flex items-end justify-between gap-2">
        <span className="text-[26px] font-semibold leading-none tracking-tight tabular-nums text-text-primary">
          {value}
        </span>
        {sparkline ? (
          <Sparkline
            values={sparkline}
            width={56}
            height={28}
            stroke={stroke}
            ariaLabel={`${label} trend`}
            className="shrink-0"
          />
        ) : null}
      </div>
      {delta ? (
        <span
          className={cn(
            "inline-flex w-fit items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
            TONE_BG[deltaTone],
            TONE_TEXT[deltaTone],
          )}
        >
          {deltaDirection === "up" ? (
            <ArrowUpRight className="h-3 w-3 shrink-0" />
          ) : deltaDirection === "down" ? (
            <ArrowDownRight className="h-3 w-3 shrink-0" />
          ) : null}
          <span className="whitespace-nowrap">{delta}</span>
        </span>
      ) : null}
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none">
        {Body}
      </Link>
    );
  }
  return Body;
}
