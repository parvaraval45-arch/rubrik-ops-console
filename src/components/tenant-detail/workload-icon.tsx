import {
  Boxes,
  Cloud,
  Database,
  FolderTree,
  HardDrive,
  Server,
} from "lucide-react";
import type { WorkloadType } from "@/types";

const ICON: Record<WorkloadType, typeof Server> = {
  VM: Server,
  Database: Database,
  FileShare: FolderTree,
  M365: Cloud,
  Kubernetes: Boxes,
  NAS: HardDrive,
};

interface WorkloadIconProps {
  type: WorkloadType;
  className?: string;
}

export function WorkloadIcon({ type, className }: WorkloadIconProps) {
  const Icon = ICON[type];
  return <Icon className={className} />;
}

export const WORKLOAD_LABEL: Record<WorkloadType, string> = {
  VM: "VM",
  Database: "Database",
  FileShare: "File Share",
  M365: "M365",
  Kubernetes: "Kubernetes",
  NAS: "NAS",
};
