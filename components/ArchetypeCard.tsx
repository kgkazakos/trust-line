"use client";

import { useState } from "react";
import { ARCHETYPES } from "@/lib/archetypes";
import { InterventionBoundary } from "./InterventionBoundary";
import type { ArchetypeResult } from "@/lib/types";

interface ArchetypeCardProps {
  result: ArchetypeResult;
  index: number;
}

export function ArchetypeCard({ result, index }: ArchetypeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const archetype = ARCHETYPES[result.archetypeId];

  if (result.loading) {
    return (
      <div
        className="glass-card border border-[var(--border-dim)] rounded-lg p-5 animate-pulse"
        style={{ borderLeftColor: archetype.color, borderLeftWidth: "3px" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: archetype.color }}
          />
          <div className="h-4 w-40 bg-[var(--surface-2)] rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-[var(--surface-2)] rounded" />
          <div className="h-3 w-3/4 bg-[var(--surface-2)] rounded" />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{
                  backgroundColor: archetype.color,
                  animationDelay: `${i * 200}ms`,
                }}
              />
            ))}
          </div>
          <span className="text-xs font-mono" style={{ color: archetype.color }}>
            Simulating…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass-card border border-[var(--border-dim)] rounded-lg overflow-hidden animate-fade-in-up opacity-0"
      style={{
        borderLeftColor: archetype.color,
        borderLeftWidth: "3px",
        animationDelay: `${index * 100}ms`,
        animationFillMode: "forwards",
        boxShadow: `0 0 24px ${archetype.glowColor}`,
      }}
    >
      {/* Card header */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
              style={{ backgroundColor: archetype.color }}
            />
            <div>
              <h3
                className="text-sm font-medium font-mono"
                style={{ color: archetype.color }}
              >
                {archetype.name}
              </h3>
              <p className="text-xs text-[var(--text-dim)] font-mono mt-0.5">
                Trust position
              </p>
            </div>
          </div>

          {/* Trust score */}
          <div className="text-right flex-shrink-0">
            <p
              className="text-2xl font-mono font-medium"
              style={{ color: archetype.color }}
            >
              {(result.trustPosition * 100).toFixed(0)}
            </p>
            <p className="text-xs font-mono text-[var(--text-dim)]">/ 100</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${result.trustPosition * 100}%`,
              backgroundColor: archetype.color,
            }}
          />
        </div>

        {/* Rationale */}
        <p className="text-xs font-mono text-[var(--text-secondary)] leading-relaxed">
          {result.rationale}
        </p>

        {/* Error badge */}
        {result.error && (
          <div className="mt-2 text-xs font-mono text-red-400 bg-red-400/10 border border-red-400/20 rounded px-2 py-1">
            ⚠ {result.error} — showing archetype defaults
          </div>
        )}
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full px-5 py-3 border-t border-[var(--border-dim)] flex items-center justify-between text-xs font-mono text-[var(--text-dim)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
      >
        <span>Intervention Boundary specification</span>
        <span
          className="transition-transform duration-200"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ↓
        </span>
      </button>

      {/* Expandable boundary section */}
      {expanded && (
        <div className="px-5 pb-5 pt-4 border-t border-[var(--border-dim)] bg-[var(--surface-1)]">
          <InterventionBoundary
            boundary={result.interventionBoundary}
            color={archetype.color}
          />
        </div>
      )}
    </div>
  );
}
