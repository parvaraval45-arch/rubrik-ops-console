"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/formatters";
import { getNotifications, type Notification } from "./notifications";

const SEVERITY_DOT: Record<Notification["severity"], string> = {
  critical: "bg-status-critical",
  warning: "bg-status-warning",
  info: "bg-status-info",
};

type Tab = "all" | "mentions" | "critical";

export function NotificationBell() {
  const [tab, setTab] = useState<Tab>("all");
  const [items, setItems] = useState<Notification[]>(() => getNotifications());

  const visible = useMemo(() => {
    if (tab === "mentions") return items.filter((n) => n.mention);
    if (tab === "critical") return items.filter((n) => n.severity === "critical");
    return items;
  }, [items, tab]);

  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () => {
    setItems((cur) => cur.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setItems((cur) => cur.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${unread} unread notifications`}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 ? (
            <Badge className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-critical px-1 text-[10px] font-semibold text-white tabular-nums">
              {unread > 99 ? "99+" : unread}
            </Badge>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] p-0"
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-semibold text-text-primary">
              Notifications
            </h3>
            {unread > 0 ? (
              <Badge
                variant="outline"
                className="border-transparent bg-status-critical-subtle px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide text-status-critical"
              >
                {unread} new
              </Badge>
            ) : null}
          </div>
          <button
            type="button"
            onClick={markAllRead}
            disabled={unread === 0}
            className="inline-flex items-center gap-1 text-[11.5px] font-medium text-brand-primary-hover hover:underline disabled:cursor-not-allowed disabled:text-text-tertiary disabled:no-underline"
          >
            <CheckCheck className="h-3 w-3" />
            Mark all read
          </button>
        </div>

        <div className="flex items-center gap-1 border-b border-border-subtle px-2 py-1.5">
          <TabBtn active={tab === "all"} onClick={() => setTab("all")} count={items.length}>
            All
          </TabBtn>
          <TabBtn
            active={tab === "mentions"}
            onClick={() => setTab("mentions")}
            count={items.filter((n) => n.mention).length}
          >
            Mentions
          </TabBtn>
          <TabBtn
            active={tab === "critical"}
            onClick={() => setTab("critical")}
            count={items.filter((n) => n.severity === "critical").length}
          >
            Critical
          </TabBtn>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {visible.length === 0 ? (
            <div className="px-6 py-12 text-center text-[12px] text-text-tertiary">
              No notifications in this view.
            </div>
          ) : (
            <ul>
              {visible.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "border-b border-border-subtle last:border-b-0",
                    !n.read && "bg-status-info-subtle/40",
                  )}
                >
                  <Link
                    href={n.sourceHref}
                    onClick={() => markRead(n.id)}
                    className="flex items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-secondary/60"
                  >
                    <span
                      className={cn(
                        "mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full",
                        SEVERITY_DOT[n.severity],
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={cn(
                            "line-clamp-1 text-[12.5px] leading-snug",
                            !n.read
                              ? "font-semibold text-text-primary"
                              : "font-medium text-text-secondary",
                          )}
                        >
                          {n.title}
                        </span>
                        {!n.read ? (
                          <span
                            aria-hidden
                            className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary"
                          />
                        ) : null}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-relaxed text-text-secondary">
                        {n.description}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-text-tertiary">
                        <span className="truncate font-medium text-text-secondary">
                          {n.source}
                        </span>
                        <span>·</span>
                        <span className="tabular-nums" suppressHydrationWarning>
                          {formatRelativeTime(n.occurredAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border-subtle px-4 py-2 text-center">
          <Link
            href="/security"
            className="text-[12px] font-medium text-brand-primary-hover hover:underline"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TabBtn({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[12px] font-medium transition-colors",
        active
          ? "bg-secondary text-text-primary"
          : "text-text-secondary hover:bg-secondary/60",
      )}
    >
      {children}
      <span className="rounded-full bg-canvas px-1.5 py-px text-[10px] tabular-nums text-text-tertiary">
        {count}
      </span>
    </button>
  );
}
