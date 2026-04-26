import type { WizardStepNumber } from "@/types";

export interface StepDef {
  number: WizardStepNumber;
  title: string;
  subtitle: string;
  shortLabel: string;
}

export const WIZARD_STEPS: StepDef[] = [
  {
    number: 1,
    title: "Customer Profile",
    shortLabel: "Customer Profile",
    subtitle: "Identity, region, tier",
  },
  {
    number: 2,
    title: "Infrastructure",
    shortLabel: "Infrastructure",
    subtitle: "Cluster, storage tier, allocation",
  },
  {
    number: 3,
    title: "Quotas",
    shortLabel: "Quotas",
    subtitle: "Soft and hard limits",
  },
  {
    number: 4,
    title: "Policy",
    shortLabel: "Policy",
    subtitle: "Protection template",
  },
  {
    number: 5,
    title: "Isolation & Access",
    shortLabel: "Isolation & Access",
    subtitle: "Namespace, IAM, encryption",
  },
  {
    number: 6,
    title: "Billing",
    shortLabel: "Billing",
    subtitle: "Rate, commit, invoicing",
  },
  {
    number: 7,
    title: "Review",
    shortLabel: "Review & Deploy",
    subtitle: "Pre-flight checks",
  },
];
