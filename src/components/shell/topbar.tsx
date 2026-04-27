"use client";

import { Command as CmdIcon, Search } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
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
import { feedback } from "@/lib/feedback";
import { cn } from "@/lib/utils";
import { currentOperator } from "@/lib/mock-data";
import { NotificationBell } from "./notification-bell";
import { SyncStatus } from "./sync-status";

export function AppTopbar() {
  const setCommandPaletteOpen = useConsoleStore((s) => s.setCommandPaletteOpen);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border-subtle bg-surface/80 px-6 backdrop-blur">
      <div className="flex flex-1 items-center">
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className={cn(
            "group inline-flex h-9 w-full max-w-md items-center gap-2 rounded-md border border-border-default bg-canvas px-3 text-left text-[13px] text-text-tertiary transition-colors",
            "hover:border-border-default hover:bg-secondary/40 hover:text-text-secondary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
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
        <SyncStatus />
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md py-1 pl-1 pr-2 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
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
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span>{currentOperator.name}</span>
              <span className="text-[11px] font-normal text-text-tertiary">
                {currentOperator.email}
              </span>
              <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-brand-primary-subtle px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-primary-hover">
                {currentOperator.role}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                feedback.info("Profile", {
                  description: "Profile page is on the Phase 2 roadmap.",
                })
              }
            >
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                feedback.info("Workspace settings", {
                  description: "Settings surface ships next iteration.",
                })
              }
            >
              Workspace settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                feedback.info("Keyboard shortcuts", {
                  description: "Press Cmd+K to open the command palette.",
                })
              }
            >
              Keyboard shortcuts
              <span className="ml-auto inline-flex items-center gap-0.5 rounded border border-border-default bg-canvas px-1 text-[10px] font-medium text-text-tertiary">
                <CmdIcon className="h-2.5 w-2.5" />K
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                feedback.info("Documentation", {
                  description: "Opening Rubrik Security Cloud admin docs in a new tab.",
                })
              }
            >
              Documentation
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="block">
                    <DropdownMenuItem
                      disabled
                      className="opacity-60"
                      onSelect={(e) => e.preventDefault()}
                    >
                      Switch organisation
                    </DropdownMenuItem>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left">
                  Multi-org support coming soon
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                feedback.info("Sign out", {
                  description: "Demo session — sign-out is a no-op.",
                })
              }
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
