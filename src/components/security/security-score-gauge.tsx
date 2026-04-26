"use client";

import { useEffect, useState } from "react";

interface SecurityScoreGaugeProps {
  score: number;
  size?: number;
  lastAssessmentLabel?: string;
}

export function SecurityScoreGauge({
  score,
  size = 88,
  lastAssessmentLabel,
}: SecurityScoreGaugeProps) {
  const [drawnScore, setDrawnScore] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawnScore(score));
    return () => cancelAnimationFrame(id);
  }, [score]);

  const stroke =
    score >= 85
      ? "var(--status-success)"
      : score >= 70
        ? "var(--status-warning)"
        : "var(--status-critical)";

  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (drawnScore / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`Security score ${score} of 100`}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border-default)"
            strokeWidth={6}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 800ms ease-out, stroke 400ms" }}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-baseline justify-center pt-[34%]">
          <span className="text-[22px] font-semibold leading-none tabular-nums text-text-primary">
            {score}
          </span>
          <span className="ml-0.5 text-[11px] font-medium text-text-tertiary">/100</span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-text-tertiary">
          Security Score
        </span>
        {lastAssessmentLabel ? (
          <span className="text-[11px] text-text-tertiary">{lastAssessmentLabel}</span>
        ) : null}
      </div>
    </div>
  );
}
