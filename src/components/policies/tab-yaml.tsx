"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { buildTemplateYaml } from "./policy-helpers";
import type { PolicyTemplate } from "@/types";

interface TabYamlProps {
  template: PolicyTemplate;
}

export function TabYaml({ template }: TabYamlProps) {
  const [copied, setCopied] = useState(false);
  const yaml = buildTemplateYaml(template);

  function handleCopy(): void {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(yaml);
    }
    setCopied(true);
    toast.success("YAML copied to clipboard");
    window.setTimeout(() => setCopied(false), 1600);
  }

  function handleDownload(): void {
    toast.success("YAML download queued", {
      description: `${template.id}-v${template.currentVersion}.yaml`,
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-[12px] text-text-secondary">
          YAML representation of v{template.currentVersion}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 gap-1" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" className="h-7 gap-1" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>
      </div>
      <pre className="max-h-[520px] overflow-auto rounded-lg border border-border-subtle bg-[#0f172a] p-4 font-mono text-[12px] leading-[1.55] text-[#e2e8f0]">
        {yaml.split("\n").map((line, i) => (
          <div key={i} className="flex gap-3">
            <span className="select-none text-right tabular-nums text-[#475569]" style={{ minWidth: 28 }}>
              {i + 1}
            </span>
            <span className="whitespace-pre-wrap">{colorizeYaml(line)}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

function colorizeYaml(line: string): React.ReactNode {
  const trimmed = line.trimStart();
  const indent = line.length - trimmed.length;
  if (trimmed.startsWith("#")) {
    return <span style={{ color: "#64748b" }}>{line}</span>;
  }
  if (trimmed.startsWith("- ")) {
    return (
      <>
        <span>{" ".repeat(indent)}</span>
        <span style={{ color: "#94a3b8" }}>- </span>
        <span style={{ color: "#fbbf24" }}>{trimmed.slice(2)}</span>
      </>
    );
  }
  const colonIdx = trimmed.indexOf(":");
  if (colonIdx === -1) return line;
  const key = trimmed.slice(0, colonIdx);
  const value = trimmed.slice(colonIdx + 1).trim();
  return (
    <>
      <span>{" ".repeat(indent)}</span>
      <span style={{ color: "#7dd3fc" }}>{key}</span>
      <span style={{ color: "#94a3b8" }}>:</span>
      {value ? (
        <>
          {" "}
          <span style={{ color: value.startsWith('"') ? "#86efac" : "#fbbf24" }}>{value}</span>
        </>
      ) : null}
    </>
  );
}
