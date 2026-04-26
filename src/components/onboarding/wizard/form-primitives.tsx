"use client";

import { Label } from "@/components/ui/label";

export function FormBlock({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border-subtle bg-surface p-5 shadow-card">
      <div className="mb-4">
        <h3 className="text-[14px] font-semibold text-text-primary">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-[12px] text-text-secondary">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  required = true,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[12px] font-medium text-text-primary">
        {label}
        {!required ? (
          <span className="ml-1 font-normal text-text-tertiary">(optional)</span>
        ) : null}
      </Label>
      {children}
      {error ? (
        <span className="text-[11.5px] text-status-critical">{error}</span>
      ) : hint ? (
        <span className="text-[11.5px] text-text-tertiary">{hint}</span>
      ) : null}
    </div>
  );
}

export function ContextPanel({ children }: { children: React.ReactNode }) {
  return (
    <aside className="hidden flex-col gap-4 xl:flex">
      <div className="sticky top-0 flex flex-col gap-4">{children}</div>
    </aside>
  );
}

export function ContextSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border-subtle bg-surface p-4 shadow-card">
      <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
        {title}
      </h4>
      {children}
    </section>
  );
}
