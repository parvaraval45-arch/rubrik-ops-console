"use client";

import { useState } from "react";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useConsoleStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { DirectoryFilters, DirectorySavedView } from "@/types";

interface SavedViewsBarProps {
  activeViewId: string;
  onSelectView: (view: DirectorySavedView) => void;
  currentFilters: DirectoryFilters;
  countForView: (view: DirectorySavedView) => number;
}

export function SavedViewsBar({
  activeViewId,
  onSelectView,
  currentFilters,
  countForView,
}: SavedViewsBarProps) {
  const views = useConsoleStore((s) => s.directorySavedViews);
  const saveView = useConsoleStore((s) => s.saveDirectoryView);
  const [saveOpen, setSaveOpen] = useState(false);

  return (
    <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1">
      {views.map((view) => {
        const active = activeViewId === view.id;
        return (
          <button
            type="button"
            key={view.id}
            onClick={() => onSelectView(view)}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium transition-colors",
              active
                ? "bg-brand-primary text-white shadow-sm"
                : "text-text-secondary hover:bg-secondary",
            )}
          >
            {view.name}
            <Badge
              variant="outline"
              className={cn(
                "border-transparent text-[10.5px] tabular-nums",
                active
                  ? "bg-white/15 text-white"
                  : "bg-secondary text-text-tertiary",
              )}
            >
              {countForView(view)}
            </Badge>
          </button>
        );
      })}
      <Button
        variant="ghost"
        size="sm"
        className="ml-1 shrink-0 gap-1.5 text-text-secondary"
        onClick={() => setSaveOpen(true)}
      >
        <Plus className="h-3.5 w-3.5" />
        Save Current View
      </Button>

      <SaveViewDialog
        open={saveOpen}
        onCancel={() => setSaveOpen(false)}
        onConfirm={(payload) => {
          const id = `view_custom_${Math.random().toString(36).slice(2, 8)}`;
          const view: DirectorySavedView = {
            id,
            name: payload.name,
            pinned: payload.pinned,
            visibility: payload.visibility,
            description: payload.description,
            filters: currentFilters,
            isSystem: false,
          };
          saveView(view);
          toast.success("View saved", {
            description: `"${view.name}" pinned to your saved views.`,
          });
          setSaveOpen(false);
          onSelectView(view);
        }}
      />
    </div>
  );
}

function SaveViewDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: (payload: {
    name: string;
    pinned: boolean;
    visibility: "private" | "team";
    description?: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [pinned, setPinned] = useState(true);
  const [visibility, setVisibility] = useState<"private" | "team">("team");
  const [description, setDescription] = useState("");
  const [touched, setTouched] = useState(false);
  const error =
    touched && name.trim().length < 2
      ? "Name must be at least 2 characters."
      : null;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          onCancel();
          setName("");
          setDescription("");
          setTouched(false);
        }
      }}
    >
      <AlertDialogContent className="max-w-[480px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Save View</AlertDialogTitle>
          <AlertDialogDescription>
            Captures the current filters, sort, and density. Pinned views
            appear in the saved views bar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div>
            <Label className="text-[12px] font-medium text-text-primary">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="e.g., 'EU Healthcare At Risk'"
              className={error ? "border-status-critical" : ""}
            />
            {error ? (
              <span className="text-[11.5px] text-status-critical">{error}</span>
            ) : null}
          </div>
          <div className="flex items-center justify-between rounded-md border border-border-subtle bg-canvas px-3 py-2.5">
            <div>
              <div className="text-[12.5px] font-medium text-text-primary">Pin to top</div>
              <div className="text-[11px] text-text-tertiary">
                Visible in saved views bar.
              </div>
            </div>
            <Switch checked={pinned} onCheckedChange={setPinned} />
          </div>
          <div>
            <Label className="text-[12px] font-medium text-text-primary">Visibility</Label>
            <RadioGroup
              value={visibility}
              onValueChange={(v) => setVisibility(v as "private" | "team")}
              className="mt-1 grid grid-cols-2 gap-2"
            >
              {[
                { v: "team" as const, label: "Team", hint: "Shared with all operators" },
                { v: "private" as const, label: "Private", hint: "Only visible to you" },
              ].map((opt) => (
                <label
                  key={opt.v}
                  className={cn(
                    "flex items-start gap-2 rounded-md border p-3 transition-all",
                    visibility === opt.v
                      ? "border-brand-primary bg-brand-primary-subtle"
                      : "border-border-subtle bg-surface",
                  )}
                >
                  <RadioGroupItem value={opt.v} className="mt-0.5" />
                  <div>
                    <div className="text-[12.5px] font-medium text-text-primary">
                      {opt.label}
                    </div>
                    <div className="text-[11px] text-text-tertiary">{opt.hint}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>
          <div>
            <Label className="text-[12px] font-medium text-text-primary">
              Description{" "}
              <span className="font-normal text-text-tertiary">(optional)</span>
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What is this view for?"
            />
          </div>
        </div>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="gap-2 bg-brand-primary text-white hover:bg-brand-primary-hover"
            onClick={() => {
              if (name.trim().length < 2) {
                setTouched(true);
                return;
              }
              onConfirm({
                name: name.trim(),
                pinned,
                visibility,
                description: description.trim() || undefined,
              });
              setName("");
              setDescription("");
              setTouched(false);
            }}
          >
            <Save className="h-4 w-4" />
            Save View
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
