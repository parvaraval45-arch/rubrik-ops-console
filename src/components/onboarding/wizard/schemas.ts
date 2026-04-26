import { z } from "zod";

export const INDUSTRIES = [
  "Healthcare",
  "Legal",
  "Financial",
  "Education",
  "Manufacturing",
  "Technology",
  "Retail",
  "Hospitality",
  "Telecommunications",
  "Insurance",
  "Logistics",
  "Aerospace",
] as const;

export const REGIONS = [
  { id: "us-east-1", label: "us-east-1 (Virginia)" },
  { id: "us-west-2", label: "us-west-2 (Oregon)" },
  { id: "eu-west-1", label: "eu-west-1 (Ireland)" },
  { id: "ap-south-1", label: "ap-southeast-1 (Singapore)" },
] as const;

export const TIERS = ["Platinum", "Gold", "Silver", "Bronze"] as const;

export const STORAGE_TIERS = ["Performance", "Capacity", "Archive"] as const;

export const QUOTA_HARD_LIMITS = [
  "block-new-backups",
  "allow-with-notification",
  "allow-with-auto-upgrade",
  "block-restore",
  "auto-purge-oldest",
  "notify-only",
] as const;

export const QUOTA_HARD_LIMIT_LABELS: Record<(typeof QUOTA_HARD_LIMITS)[number], string> = {
  "block-new-backups": "Block new backups",
  "allow-with-notification": "Allow with notification",
  "allow-with-auto-upgrade": "Allow with auto-upgrade",
  "block-restore": "Block restore operations",
  "auto-purge-oldest": "Auto-purge oldest",
  "notify-only": "Notify only",
};

export const INHERITANCE_MODES = ["Locked", "Override Allowed"] as const;

export const MFA_MODES = ["required", "optional", "disabled"] as const;

export const IAM_ROLES = ["Admin", "Operator", "Read-Only"] as const;

export const KEY_SOURCES = ["rubrik-managed", "byok"] as const;

export const ROTATION_DAYS = [30, 60, 90] as const;

export const INVOICE_CADENCES = ["Monthly", "Quarterly", "Annual"] as const;
export const PAYMENT_TERMS = ["Net 15", "Net 30", "Net 60", "Net 90"] as const;
export const CURRENCIES = ["USD", "EUR", "GBP", "SGD"] as const;

const tierSchema = z.enum(TIERS);

export const step1Schema = z.object({
  tenantName: z
    .string()
    .min(3, { message: "Tenant name must be at least 3 characters" })
    .max(80, { message: "Tenant name must be 80 characters or fewer" }),
  legalEntity: z
    .string()
    .min(3, { message: "Legal entity must be at least 3 characters" }),
  industry: z.enum(INDUSTRIES, { message: "Choose an industry" }),
  region: z.enum(["us-east-1", "us-west-2", "eu-west-1", "ap-south-1"], {
    message: "Choose a region",
  }),
  primaryContact: z
    .string()
    .min(2, { message: "Primary contact name must be at least 2 characters" }),
  contactEmail: z
    .string()
    .email({ message: "Enter a valid email address" }),
  resellerType: z.enum(["direct", "reseller"]),
  resellerId: z.string().optional(),
  isAdditionalSite: z.boolean(),
  parentTenantId: z.string().optional(),
  tier: tierSchema,
});

export type Step1Values = z.infer<typeof step1Schema>;

export const step2Schema = z.object({
  clusterId: z.string().min(1, { message: "Choose a cluster" }),
  storageTier: z.enum(STORAGE_TIERS),
  allocationTB: z
    .number({ message: "Capacity allocation is required" })
    .min(10, { message: "Allocation must be at least 10 TB" }),
});

export type Step2Values = z.infer<typeof step2Schema>;

export const step3Schema = z.object({
  storageTB: z.number().min(1),
  storageSoftPct: z.number().min(50).max(99),
  storageHardLimit: z.enum(QUOTA_HARD_LIMITS),
  workloads: z.number().min(1),
  workloadsHardLimit: z.enum(QUOTA_HARD_LIMITS),
  transferOutTB: z.number().min(0),
  transferOutHardLimit: z.enum(QUOTA_HARD_LIMITS),
  restorePoints: z.number().min(0),
  restorePointsHardLimit: z.enum(QUOTA_HARD_LIMITS),
  overrideApprovalRequired: z.boolean(),
});

export type Step3Values = z.infer<typeof step3Schema>;

export const step4Schema = z.object({
  policyTemplateId: z.string().min(1, { message: "Choose a policy template" }),
  inheritanceMode: z.enum(INHERITANCE_MODES),
});

export type Step4Values = z.infer<typeof step4Schema>;

export const step5BaseSchema = z.object({
  namespace: z
    .string()
    .min(8, { message: "Namespace must be at least 8 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Namespace must be lowercase alphanumeric or dashes",
    }),
  iam: z
    .array(
      z.object({
        operatorId: z.string(),
        role: z.enum(IAM_ROLES),
      }),
    )
    .min(1, { message: "Assign at least one operator" }),
  tenantAdminEmail: z
    .string()
    .email({ message: "Enter a valid tenant admin email" }),
  sendInviteOnDeploy: z.boolean(),
  mfaMode: z.enum(MFA_MODES),
  mfaDisabledReason: z.string().optional(),
  keySource: z.enum(KEY_SOURCES),
  keyRotationDays: z
    .number()
    .refine((v) => ([30, 60, 90] as number[]).includes(v), {
      message: "Choose a rotation cadence",
    }),
  byokKmsEndpoint: z.string().optional(),
});

export const step5Schema = step5BaseSchema.superRefine((v, ctx) => {
  if (v.mfaMode === "disabled" && (!v.mfaDisabledReason || v.mfaDisabledReason.trim().length < 10)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["mfaDisabledReason"],
      message: "Provide at least 10 characters of justification when MFA is disabled",
    });
  }
  if (v.keySource === "byok" && (!v.byokKmsEndpoint || v.byokKmsEndpoint.trim().length < 6)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["byokKmsEndpoint"],
      message: "BYOK requires a KMS endpoint",
    });
  }
});

export type Step5Values = z.infer<typeof step5Schema>;

export const step6Schema = z.object({
  contactName: z.string().min(2),
  billingEmail: z.string().email({ message: "Enter a valid billing email" }),
  poNumber: z.string().optional(),
  ratePerTB: z.number().min(1),
  rateOverrideReason: z.string().optional(),
  capacityCommitTB: z.number().min(1),
  annualMinimumCommit: z.boolean(),
  overagePolicy: z.enum(QUOTA_HARD_LIMITS),
  cadence: z.enum(INVOICE_CADENCES),
  paymentTerms: z.enum(PAYMENT_TERMS),
  currency: z.enum(CURRENCIES),
  resellerCommissionPct: z.number().min(0).max(100).optional(),
  resellerCommissionReason: z.string().optional(),
});

export type Step6Values = z.infer<typeof step6Schema>;
