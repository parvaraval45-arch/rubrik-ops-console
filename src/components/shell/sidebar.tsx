"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  ChevronsLeft,
  LayoutDashboard,
  Lock,
  Settings,
  Shield,
  UserPlus,
  Wallet,
} from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import { useConsoleStore } from "@/lib/store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const NAV_PRIMARY: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tenants", href: "/tenants", icon: Building2 },
  { label: "Onboarding", href: "/onboarding", icon: UserPlus },
  { label: "Policies", href: "/policies", icon: Shield },
  { label: "Capacity & Billing", href: "/capacity", icon: Wallet },
  { label: "Security", href: "/security", icon: Lock },
];

const NAV_SECONDARY: NavItem[] = [{ label: "Settings", href: "/settings", icon: Settings }];

export function AppSidebar() {
  const collapsed = useConsoleStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useConsoleStore((s) => s.toggleSidebar);

  return (
    <TooltipProvider delayDuration={120}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ type: "spring", stiffness: 320, damping: 36 }}
        className="relative z-30 flex h-screen flex-col border-r border-border-subtle bg-surface"
      >
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-border-subtle",
            collapsed ? "justify-center px-0" : "justify-between px-4",
          )}
        >
          <Logo collapsed={collapsed} />
          {!collapsed ? (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-secondary hover:text-text-primary"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3">
          {NAV_PRIMARY.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="px-2 pb-3">
          <div className="mx-2 mb-2 h-px bg-border-subtle" />
          {NAV_SECONDARY.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} />
          ))}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleSidebar}
                  aria-label="Expand sidebar"
                  className="mt-2 inline-flex h-9 w-full items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-secondary hover:text-text-primary"
                >
                  <ChevronsLeft className="h-4 w-4 rotate-180" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const Icon = item.icon;
  const active =
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href);

  const content = (
    <Link
      href={item.href}
      className={cn(
        "group relative flex h-9 items-center gap-3 rounded-md text-[13px] font-medium transition-colors",
        collapsed ? "justify-center px-0" : "px-3",
        active
          ? "bg-brand-primary-subtle text-brand-primary-hover"
          : "text-text-secondary hover:bg-secondary hover:text-text-primary",
      )}
      aria-current={active ? "page" : undefined}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-brand-primary"
        />
      ) : null}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          active ? "text-brand-primary" : "text-text-tertiary group-hover:text-text-secondary",
        )}
      />
      <AnimatePresence initial={false}>
        {!collapsed ? (
          <motion.span
            key="label"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.12 }}
            className="truncate"
          >
            {item.label}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </Link>
  );

  if (!collapsed) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right" className="font-medium">
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}
