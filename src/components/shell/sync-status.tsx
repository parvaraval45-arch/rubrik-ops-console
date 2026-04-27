"use client";

import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SyncSource {
  label: string;
  detail: string;
  // 0-100 — how recently this source synced (relative to its full window)
  lastSyncSeconds: number;
}

const SOURCES: SyncSource[] = [
  { label: "Tenants", detail: "Identity, capacity, status", lastSyncSeconds: 8 },
  { label: "Alarms", detail: "Real-time event stream", lastSyncSeconds: 2 },
  { label: "Jobs", detail: "Backup & restore sessions", lastSyncSeconds: 3 },
  { label: "Capacity", detail: "Storage utilization & overage", lastSyncSeconds: 14 },
  { label: "Security", detail: "Isolation matrix & threat feed", lastSyncSeconds: 6 },
];

export function SyncStatus() {
  const [seconds, setSeconds] = useState(0);
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev >= 30) {
          setFlashing(true);
          setTimeout(() => setFlashing(false), 280);
          return 0;
        }
        return prev + 2;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const label =
    seconds === 0 ? (
      "just now"
    ) : (
      <>
        <span className="tabular-nums text-text-primary">{seconds}s</span> ago
      </>
    );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Sync status"
          className={cn(
            "hidden items-center gap-2 rounded-full border border-border-subtle bg-canvas px-2.5 py-1 transition-all lg:flex",
            "hover:border-border-default hover:bg-secondary/40",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
            flashing && "ring-2 ring-brand-primary ring-offset-1",
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-primary" />
          </span>
          <span className="text-[11px] font-medium text-text-secondary">
            Live · synced {label}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[300px] p-0">
        <div className="border-b border-border-subtle px-4 py-3">
          <h3 className="text-[13px] font-semibold text-text-primary">
            Sync Status
          </h3>
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-text-secondary">
            Real-time sync from Rubrik Security Cloud. Last full refresh 4 hours ago.
          </p>
        </div>
        <ul className="divide-y divide-border-subtle">
          {SOURCES.map((src) => (
            <li
              key={src.label}
              className="flex items-center justify-between gap-3 px-4 py-2.5"
            >
              <div className="flex items-start gap-2 text-[12px]">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-success" />
                <div className="flex flex-col">
                  <span className="font-medium text-text-primary">{src.label}</span>
                  <span className="text-[11px] text-text-tertiary">
                    {src.detail}
                  </span>
                </div>
              </div>
              <span
                className="shrink-0 text-[11px] tabular-nums text-text-tertiary"
                suppressHydrationWarning
              >
                {src.lastSyncSeconds}s ago
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-border-subtle bg-canvas px-4 py-2 text-[11px] text-text-tertiary">
          Sync is automatic. Manual refresh can be triggered from each surface.
        </div>
      </PopoverContent>
    </Popover>
  );
}
