"use client";

import type { InterventionBoundary as IB } from "@/lib/types";

interface InterventionBoundaryProps {
  boundary: IB;
  color: string;
}

const TIERS = [
  {
    key: "silentAutonomy" as const,
    label: "Silent Autonomy",
    sublabel: "acts without notification when:",
    icon: "◆",
    dimColor: "rgba(52,168,83,0.1)",
    textColor: "#34A853",
  },
  {
    key: "notifyAndProceed" as const,
    label: "Notify & Proceed",
    sublabel: "acts but notifies when:",
    icon: "◈",
    dimColor: "rgba(251,188,4,0.1)",
    textColor: "#FBBC04",
  },
  {
    key: "confirmBeforeActing" as const,
    label: "Confirm Before Acting",
    sublabel: "pauses for explicit confirmation when:",
    icon: "◉",
    dimColor: "rgba(234,67,53,0.1)",
    textColor: "#EA4335",
  },
] as const;

export function InterventionBoundary({ boundary, color }: InterventionBoundaryProps) {
  return (
    <div className="space-y-3">
      {TIERS.map((tier) => {
        const conditions = boundary[tier.key];
        return (
          <div
            key={tier.key}
            className="rounded border border-[var(--border-dim)] overflow-hidden"
          >
            {/* Tier header */}
            <div
              className="px-4 py-2.5 flex items-center gap-2.5"
              style={{ backgroundColor: tier.dimColor }}
            >
              <span
                className="text-sm font-mono"
                style={{ color: tier.textColor }}
              >
                {tier.icon}
              </span>
              <div>
                <p
                  className="text-xs font-mono font-medium uppercase tracking-wider"
                  style={{ color: tier.textColor }}
                >
                  {tier.label}
                </p>
                <p className="text-xs font-mono text-[var(--text-dim)]">
                  {tier.sublabel}
                </p>
              </div>
            </div>

            {/* Conditions */}
            <div className="bg-[var(--surface-1)] px-4 py-3 space-y-2">
              {conditions.map((condition, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-[var(--text-dim)] font-mono text-xs mt-0.5 flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-xs text-[var(--text-secondary)] font-mono leading-relaxed">
                    {condition}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
