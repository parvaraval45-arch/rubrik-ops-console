"use client";

import { useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { useConsoleStore } from "@/lib/store";

export function CommandPalette() {
  const open = useConsoleStore((s) => s.commandPaletteOpen);
  const setOpen = useConsoleStore((s) => s.setCommandPaletteOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command palette"
      description="Search tenants, jobs, and alerts."
      className="overflow-hidden rounded-lg border border-border-default shadow-xl"
    >
      <CommandInput placeholder="Search tenants, jobs, alerts…" autoFocus />
      <CommandList className="max-h-[420px]">
        <CommandEmpty className="py-12 text-center text-[13px] text-text-tertiary">
          Search across tenants, alerts, policies, and audit events.
        </CommandEmpty>
      </CommandList>
    </CommandDialog>
  );
}
