"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { differenceInDays, parseISO } from "date-fns";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/data/page-header";
import { StatStrip } from "@/components/onboarding/queue/stat-strip";
import { WIZARD_STEPS } from "@/components/onboarding/wizard/steps";
import { useConsoleStore } from "@/lib/store";
import { mockData } from "@/lib/mock-data";
import {
  formatDuration,
  formatRelativeTime,
  formatShortDate,
} from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type {
  CompletedOnboarding,
  OnboardingDraft,
  ValidationWindowEntry,
} from "@/types";

export default function OnboardingPage() {
  const router = useRouter();
  const drafts = useConsoleStore((s) => s.drafts);
  const validationWindow = useConsoleStore((s) => s.validationWindow);
  const completed = useConsoleStore((s) => s.completedOnboardings);
  const avgSec = useConsoleStore((s) => s.avgOnboardingSeconds);
  const reassignDraft = useConsoleStore((s) => s.reassignDraft);
  const deleteDraft = useConsoleStore((s) => s.deleteDraft);
  const removeFromValidation = useConsoleStore((s) => s.removeFromValidationWindow);
  const [completedOpen, setCompletedOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Lifecycle"
        title="Onboarding"
        description={`Tenant lifecycle queue · ${drafts.length} in progress`}
        actions={
          <Button asChild className="gap-2 bg-brand-primary text-white hover:bg-brand-primary-hover">
            <Link href="/onboarding/new">
              <Plus className="h-4 w-4" />
              Start New Onboarding
            </Link>
          </Button>
        }
      />

      <StatStrip
        items={[
          {
            label: "In Progress",
            value: drafts.length.toString(),
            subtitle: `${drafts.length === 1 ? "draft" : "drafts"} editing`,
          },
          {
            label: "Provisioning",
            value: "0",
            subtitle: "tenants currently deploying",
            tone: "info",
          },
          {
            label: "Validation Window",
            value: validationWindow.length.toString(),
            subtitle: "in 7-day post-deploy validation",
            tone: "info",
          },
          {
            label: "Avg Onboarding Time",
            value: formatDuration(avgSec),
            subtitle: "last 30 days",
            tone: "success",
          },
        ]}
      />

      <DraftsSection
        drafts={drafts}
        onResume={(id) => router.push(`/onboarding/draft/${id}`)}
        onReassign={(id, to) =>
          reassignDraft(id, to, "Alex Morrison", "Reassigned from queue.")
        }
        onDelete={(id) => {
          deleteDraft(id);
          toast.success("Draft deleted");
        }}
      />

      <ProvisioningSection />

      <ValidationSection
        entries={validationWindow}
        onMarkValidated={(tenantId, name) => {
          removeFromValidation(tenantId);
          toast.success(`${name} validated early`, {
            description: "Removed from 7-day validation window with admin override.",
          });
        }}
      />

      <CompletedSection
        completed={completed.slice(0, 10)}
        open={completedOpen}
        onToggle={() => setCompletedOpen((o) => !o)}
      />
    </div>
  );
}

function DraftsSection({
  drafts,
  onResume,
  onReassign,
  onDelete,
}: {
  drafts: OnboardingDraft[];
  onResume: (id: string) => void;
  onReassign: (id: string, to: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Section
      title="Drafts"
      count={drafts.length}
      subtitle="Pick up where you (or another operator) left off."
    >
      {drafts.length === 0 ? (
        <Empty message="No drafts in progress. Start a new onboarding to begin." />
      ) : (
        <Table>
          <Header
            columns={[
              "Tenant Name",
              "Current Stage",
              "Assigned To",
              "Last Edited",
              "Time in Draft",
              "Actions",
            ]}
          />
          <TableBody>
            {drafts.map((d) => {
              const step = WIZARD_STEPS.find((s) => s.number === d.currentStep);
              const days = differenceInDays(new Date(), parseISO(d.createdAt));
              const tone =
                days >= 7 ? "critical" : days >= 2 ? "warning" : "success";
              const operator = mockData.operators.find(
                (o) => o.name === d.assignedTo,
              );
              return (
                <TableRow
                  key={d.id}
                  className="border-border-subtle text-[13px] hover:bg-secondary/40"
                >
                  <TableCell className="px-5 font-medium text-text-primary">
                    {d.tenantName ?? <span className="italic text-text-tertiary">Untitled draft</span>}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-transparent bg-brand-primary-subtle text-[10px] font-semibold uppercase text-brand-primary-hover"
                      >
                        Step {d.currentStep} of 7
                      </Badge>
                      <span className="text-text-secondary">{step?.title ?? "—"}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-brand-primary-subtle text-[10px] font-semibold text-brand-primary-hover">
                          {operator?.initials ??
                            d.assignedTo
                              .split(" ")
                              .map((p) => p[0])
                              .slice(0, 2)
                              .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-text-primary">{d.assignedTo}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-text-secondary tabular-nums">
                    <span suppressHydrationWarning>
                      {formatRelativeTime(d.updatedAt)}
                    </span>{" "}
                    by {d.updatedBy}
                  </TableCell>
                  <TableCell>
                    <DraftAgeChip tone={tone} days={days} />
                  </TableCell>
                  <TableCell className="px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        className="bg-brand-primary text-white hover:bg-brand-primary-hover"
                        onClick={() => onResume(d.id)}
                      >
                        Resume
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel className="text-[11px] font-semibold uppercase text-text-tertiary">
                            Reassign to
                          </DropdownMenuLabel>
                          {mockData.operators
                            .filter((op) => op.name !== d.assignedTo)
                            .map((op) => (
                              <DropdownMenuItem
                                key={op.id}
                                onSelect={() => {
                                  onReassign(d.id, op.name);
                                  toast.success(`Reassigned to ${op.name}`);
                                }}
                                className="gap-2"
                              >
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="bg-brand-primary-subtle text-[9px] font-semibold text-brand-primary-hover">
                                    {op.initials}
                                  </AvatarFallback>
                                </Avatar>
                                {op.name}{" "}
                                <span className="text-[11px] text-text-tertiary">{op.role}</span>
                              </DropdownMenuItem>
                            ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => onDelete(d.id)}
                            className="gap-2 text-status-critical focus:bg-status-critical-subtle focus:text-status-critical"
                          >
                            Delete draft
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Section>
  );
}

function ProvisioningSection() {
  return (
    <Section title="Currently Provisioning" subtitle="Tenants mid-deploy with live progress.">
      <Empty message="No tenants currently deploying. Pre-flight checks run before each deploy." />
    </Section>
  );
}

function ValidationSection({
  entries,
  onMarkValidated,
}: {
  entries: ValidationWindowEntry[];
  onMarkValidated: (tenantId: string, name: string) => void;
}) {
  return (
    <Section
      title="7-Day Validation Window"
      count={entries.length}
      subtitle="Tenants under post-deploy health monitoring. Daily checks run automatically."
    >
      {entries.length === 0 ? (
        <Empty message="No tenants currently in validation. New deploys enter this window automatically." />
      ) : (
        <Table>
          <Header
            columns={[
              "Tenant Name",
              "Days Remaining",
              "Validation Status",
              "Last Health Check",
              "Issues",
              "Actions",
            ]}
          />
          <TableBody>
            {entries.map((v) => (
              <TableRow key={v.tenantId} className="border-border-subtle text-[13px]">
                <TableCell className="px-5 font-medium text-text-primary">
                  {v.tenantName}
                </TableCell>
                <TableCell className="tabular-nums text-text-secondary">
                  {v.daysRemaining} days remaining
                </TableCell>
                <TableCell>
                  <ValidationStatusBadge status={v.status} />
                </TableCell>
                <TableCell className="text-text-secondary tabular-nums" suppressHydrationWarning>
                  {formatRelativeTime(v.lastCheckAt)}
                </TableCell>
                <TableCell className="text-text-secondary">
                  {v.issuesCount === 0 ? (
                    <span className="text-status-success">0 issues detected</span>
                  ) : (
                    <span className="text-status-warning">
                      {v.issuesCount} · {v.issueDetail}
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild variant="ghost" size="sm" className="text-brand-primary-hover">
                      <Link href={`/tenants/${v.tenantId}`}>View Health Report</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMarkValidated(v.tenantId, v.tenantName)}
                    >
                      Mark Validated Early
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Section>
  );
}

function CompletedSection({
  completed,
  open,
  onToggle,
}: {
  completed: CompletedOnboarding[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="rounded-lg border border-border-subtle bg-surface shadow-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between border-b border-border-subtle px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronDown className="h-4 w-4 text-text-tertiary" />
          ) : (
            <ChevronRight className="h-4 w-4 text-text-tertiary" />
          )}
          <h3 className="text-[14px] font-semibold text-text-primary">
            Recently Completed
          </h3>
          <Badge
            variant="outline"
            className="border-transparent bg-secondary text-[11px] tabular-nums text-text-secondary"
          >
            {completed.length}
          </Badge>
        </div>
        <span className="text-[12px] text-text-tertiary">Last 30 days</span>
      </button>
      {open ? (
        <Table>
          <Header
            columns={["Tenant", "Completed", "Total Duration", "Deployed By", ""]}
          />
          <TableBody>
            {completed.map((c) => (
              <TableRow key={c.id} className="border-border-subtle text-[13px]">
                <TableCell className="px-5 text-text-primary">{c.tenantName}</TableCell>
                <TableCell className="text-text-secondary tabular-nums" suppressHydrationWarning>
                  {formatShortDate(c.completedAt)}
                </TableCell>
                <TableCell className="tabular-nums text-text-secondary">
                  {formatDuration(c.totalDurationSec)}
                </TableCell>
                <TableCell className="text-text-secondary">{c.deployedBy}</TableCell>
                <TableCell className="px-5 text-right">
                  <Button asChild variant="ghost" size="sm" className="text-brand-primary-hover">
                    <Link href={`/tenants/${c.tenantId}`}>View Tenant</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </section>
  );
}

function Section({
  title,
  subtitle,
  count,
  children,
}: {
  title: string;
  subtitle?: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border-subtle bg-surface shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle px-5 py-4">
        <div className="flex items-center gap-3">
          <h2 className="text-[14px] font-semibold text-text-primary">{title}</h2>
          {typeof count === "number" ? (
            <Badge
              variant="outline"
              className="border-transparent bg-brand-primary-subtle text-[11px] tabular-nums text-brand-primary-hover"
            >
              {count}
            </Badge>
          ) : null}
        </div>
        {subtitle ? <p className="text-[12px] text-text-secondary">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Header({ columns }: { columns: string[] }) {
  return (
    <TableHeader>
      <TableRow className="border-border-subtle">
        {columns.map((c, i) => (
          <TableHead
            key={c + i}
            className={cn(
              "text-[11px] font-semibold uppercase tracking-wide text-text-tertiary",
              i === 0 && "px-5",
              i === columns.length - 1 && "px-5 text-right",
            )}
          >
            {c}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="px-5 py-10 text-center text-[13px] text-text-tertiary">
      {message}
    </div>
  );
}

function DraftAgeChip({
  tone,
  days,
}: {
  tone: "success" | "warning" | "critical";
  days: number;
}) {
  const cls =
    tone === "critical"
      ? "bg-status-critical-subtle text-status-critical"
      : tone === "warning"
        ? "bg-status-warning-subtle text-status-warning"
        : "bg-status-success-subtle text-status-success";
  const label =
    days <= 0
      ? "today"
      : days === 1
        ? "1 day"
        : `${days} days`;
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent text-[11px] font-medium tabular-nums", cls)}
    >
      {label}
    </Badge>
  );
}

function ValidationStatusBadge({
  status,
}: {
  status: ValidationWindowEntry["status"];
}) {
  if (status === "Healthy") {
    return (
      <span className="inline-flex items-center gap-1.5 text-status-success">
        <ShieldCheck className="h-3.5 w-3.5" />
        Healthy
      </span>
    );
  }
  if (status === "Watch") {
    return (
      <span className="inline-flex items-center gap-1.5 text-status-warning">
        <Loader2 className="h-3.5 w-3.5" />
        Watch
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-status-critical">
      Issue Detected
    </span>
  );
}
