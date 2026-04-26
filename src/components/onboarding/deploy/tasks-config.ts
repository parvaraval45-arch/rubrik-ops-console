export interface TaskConfig {
  id: string;
  title: string;
  durationMs: [number, number]; // min, max
  substeps: string[];
  dependsOn: string[];
  warningSubstep?: { afterMs: number; warning: string; recovery: string };
}

export const TASKS: TaskConfig[] = [
  {
    id: "capacity",
    title: "Reserving cluster capacity",
    durationMs: [4_000, 6_000],
    substeps: [
      "Acquiring lock on selected cluster…",
      "Reserving capacity allocation…",
      "Initializing storage pool…",
      "Capacity reservation confirmed",
    ],
    dependsOn: [],
  },
  {
    id: "namespace",
    title: "Creating tenant namespace",
    durationMs: [5_000, 7_000],
    substeps: [
      "Generating namespace…",
      "Configuring tenant boundary in cluster…",
      "Setting up metadata isolation…",
      "Namespace provisioned and locked",
    ],
    dependsOn: ["capacity"],
  },
  {
    id: "key",
    title: "Provisioning encryption key",
    durationMs: [3_000, 5_000],
    substeps: [
      "Generating tenant-specific AES-256-GCM key…",
      "Storing key in HSM partition (FIPS 140-2 Level 3)…",
      "Configuring 90-day rotation schedule…",
      "Key minted and registered",
    ],
    dependsOn: ["namespace"],
  },
  {
    id: "network",
    title: "Configuring network isolation",
    durationMs: [6_000, 8_000],
    substeps: [
      "Applying VPC isolation rules…",
      "Provisioning Envoy OVA v2.4.7…",
      "Configuring outbound deny-by-default…",
      "Establishing control-plane allowlist…",
      "Generating Envoy deployment package",
    ],
    dependsOn: ["namespace"],
    warningSubstep: {
      afterMs: 3_500,
      warning: "Network isolation rule conflict detected… Auto-resolving via priority routing…",
      recovery: "Conflict resolved via priority routing.",
    },
  },
  {
    id: "policy",
    title: "Applying policy template",
    durationMs: [4_000, 6_000],
    substeps: [
      "Loading policy template…",
      "Configuring retention with compliance lock…",
      "Setting RPO and RTO targets…",
      "Enabling immutability locks…",
      "Configuring replication target",
    ],
    dependsOn: ["namespace", "key"],
  },
  {
    id: "iam",
    title: "Configuring IAM and operators",
    durationMs: [5_000, 7_000],
    substeps: [
      "Creating IAM roles for tenant…",
      "Assigning operators…",
      "Generating service principals…",
      "Provisioning MFA enforcement…",
      "Sending tenant admin invite",
    ],
    dependsOn: ["namespace"],
  },
  {
    id: "license",
    title: "Generating license and registering tenant",
    durationMs: [3_000, 5_000],
    substeps: [
      "Generating per-tenant license key…",
      "Pushing license to tenant environment…",
      "Registering with billing system…",
      "Creating audit log entry",
    ],
    dependsOn: ["capacity", "policy", "iam"],
  },
  {
    id: "validation",
    title: "Running post-deploy validation",
    durationMs: [8_000, 10_000],
    substeps: [
      "Running connectivity check from tenant environment…",
      "Verifying management agent reporting…",
      "Executing test backup of canary workload…",
      "Validating isolation matrix (5 controls)…",
      "Checking encryption key accessibility…",
      "Confirming policy enforcement…",
      "Generating onboarding health report",
    ],
    dependsOn: ["capacity", "namespace", "key", "network", "policy", "iam", "license"],
  },
];
