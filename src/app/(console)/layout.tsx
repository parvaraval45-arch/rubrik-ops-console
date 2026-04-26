import type { ReactNode } from "react";
import { AppSidebar } from "@/components/shell/sidebar";
import { AppTopbar } from "@/components/shell/topbar";
import { CommandPalette } from "@/components/shell/command-palette";

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1440px] px-8 py-8">{children}</div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
