"use client";

import { toast } from "sonner";

/**
 * Centralised feedback helpers built on sonner. All workflow toasts in the app
 * should go through one of these so duration, tone, and action affordances
 * stay consistent.
 *
 * Standards (locked):
 *   - Success: 4s, green check (sonner default icon)
 *   - Warning: 6s, amber triangle
 *   - Error:   no auto-dismiss, red octagon, optional Retry action
 *   - Info:    4s, blue info
 *   - Destructive success: 6s + Undo when an undo handler is supplied
 */

interface BaseOpts {
  description?: string;
  id?: string | number;
}

interface ErrorOpts extends BaseOpts {
  retry?: () => void;
}

interface DestructiveOpts extends BaseOpts {
  undo?: () => void;
}

export const feedback = {
  success(title: string, opts: BaseOpts = {}): string | number {
    return toast.success(title, {
      duration: 4000,
      description: opts.description,
      id: opts.id,
    });
  },

  warning(title: string, opts: BaseOpts = {}): string | number {
    return toast.warning(title, {
      duration: 6000,
      description: opts.description,
      id: opts.id,
    });
  },

  error(title: string, opts: ErrorOpts = {}): string | number {
    return toast.error(title, {
      duration: Infinity,
      description: opts.description,
      id: opts.id,
      action: opts.retry
        ? { label: "Retry", onClick: opts.retry }
        : undefined,
      closeButton: true,
    });
  },

  info(title: string, opts: BaseOpts = {}): string | number {
    return toast.info(title, {
      duration: 4000,
      description: opts.description,
      id: opts.id,
    });
  },

  loading(title: string, opts: BaseOpts = {}): string | number {
    return toast.loading(title, {
      description: opts.description,
      id: opts.id,
    });
  },

  /**
   * For destructive actions where the user might want to undo. The toast
   * stays up longer and includes an Undo affordance when provided.
   */
  destructive(title: string, opts: DestructiveOpts = {}): string | number {
    return toast(title, {
      duration: 6000,
      description: opts.description,
      id: opts.id,
      action: opts.undo
        ? { label: "Undo", onClick: opts.undo }
        : undefined,
    });
  },
};
