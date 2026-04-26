import type { LucideIcon } from "lucide-react";
import { PageHeader } from "./page-header";
import { EmptyState } from "./empty-state";

interface PlaceholderPageProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
}

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  icon,
  emptyTitle,
  emptyDescription,
}: PlaceholderPageProps) {
  return (
    <div className="flex flex-col">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <EmptyState icon={icon} title={emptyTitle} description={emptyDescription} />
    </div>
  );
}
