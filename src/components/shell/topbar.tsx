"use client";

import { useEffect, useState } from "react";
import { Bell, Command as CmdIcon, Search } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConsoleStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { currentOperator, mockData } from "@/lib/mock-data";

export function AppTopbar() {
  const setCommandPaletteOpen = useConsoleStore((s) => s.setCommandPaletteOpen);
  const openAlertCount = mockData.alerts.filter((a) => a.status === "open").length;
  const [syncedSeconds, setSyncedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncedSeconds((prev) => (prev >= 30 ? 0 : prev + 2));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border-subtle bg-surface/80 px-6 backdrop-blur">
      <div className="flex flex-1 items-center">
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className={cn(
            "group inline-flex h-9 w-full max-w-md items-center gap-2 rounded-md border border-border-default bg-canvas px-3 text-left text-[13px] text-text-tertiary transition-colors",
            "hover:border-border-default hover:bg-secondary/40 hover:text-text-secondary",
          )}
        >
          <Search className="h-4 w-4" />
          <span className="flex-1">Search tenants, jobs, alerts…</span>
          <kbd className="flex items-center gap-0.5 rounded border border-border-default bg-surface px-1.5 py-0.5 text-[11px] font-medium text-text-secondary">
            <CmdIcon className="h-3 w-3" />K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <LiveStatus seconds={syncedSeconds} />

        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-secondary hover:text-text-primary"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {openAlertCount > 0 ? (
                  <Badge className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-critical px-1 text-[10px] font-semibold text-white tabular-nums">
                    {openAlertCount > 99 ? "99+" : openAlertCount}
                  </Badge>
                ) : null}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{openAlertCount} open alerts</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md py-1 pl-1 pr-2 text-left transition-colors hover:bg-secondary"
              aria-label="Account menu"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-brand-primary-subtle text-[11px] font-semibold text-brand-primary-hover">
                  {currentOperator.initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col leading-tight md:flex">
                <span className="text-[12px] font-semibold text-text-primary">
                  {currentOperator.name}
                </span>
                <span className="text-[11px] text-text-tertiary">{currentOperator.role}</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span>{currentOperator.name}</span>
              <span className="text-[11px] font-normal text-text-tertiary">
                {currentOperator.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Workspace settings</DropdownMenuItem>
            <DropdownMenuItem>API tokens</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function LiveStatus({ seconds }: { seconds: number }) {
  const label =
    seconds === 0 ? (
      <>just now</>
    ) : (
      <>
        <span className="tabular-nums text-text-primary">{seconds}s</span> ago
      </>
    );
  return (
    <div className="hidden items-center gap-2 rounded-full border border-border-subtle bg-canvas px-2.5 py-1 lg:flex">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-primary" />
      </span>
      <span className="text-[11px] font-medium text-text-secondary">
        Live · synced {label}
      </span>
    </div>
  );
}
