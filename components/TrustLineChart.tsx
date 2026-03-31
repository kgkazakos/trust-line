"use client";

import { ARCHETYPES } from "@/lib/archetypes";
import type { ArchetypeId, ArchetypeResult } from "@/lib/types";

interface TrustLineChartProps {
  results: Partial<Record<ArchetypeId, ArchetypeResult>>;
  loading?: boolean;
}

export function TrustLineChart({ results, loading = false }: TrustLineChartProps) {
  const resultList = Object.values(results).filter(
    (r): r is ArchetypeResult => r !== undefined && !r.loading
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest mb-1">
          Trust Line
        </p>
        <h2 className="text-base font-medium text-[var(--text-primary)]">
          Identity Control ↔ Agent Autonomy
        </h2>
      </div>

      {/* Spectrum bar */}
      <div className="relative">
        {/* Labels */}
        <div className="flex justify-between mb-3">
          <span className="text-xs font-mono text-[var(--text-dim)]">
            ← Identity Control
          </span>
          <span className="text-xs font-mono text-[var(--text-dim)]">
            Agent Autonomy →
          </span>
        </div>

        {/* Gradient track */}
        <div className="relative h-3 rounded-full trust-gradient shadow-lg">
          {/* Archetype markers */}
          {resultList.map((result) => {
            const archetype = ARCHETYPES[result.archetypeId];
            const leftPercent = result.trustPosition * 100;

            return (
              <div
                key={result.archetypeId}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group"
                style={{ left: `${leftPercent}%` }}
              >
                {/* Marker dot */}
                <div
                  className="w-5 h-5 rounded-full border-2 border-[var(--navy-950)] shadow-lg transition-transform group-hover:scale-125 cursor-default"
                  style={{ backgroundColor: archetype.color }}
                />

                {/* Label below */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <div
                    className="text-xs font-mono px-2 py-1 rounded text-white"
                    style={{ backgroundColor: archetype.color + "dd" }}
                  >
                    {archetype.name.split(" ")[0]}
                    <span className="ml-1 opacity-80">
                      {(result.trustPosition * 100).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tick marks */}
        <div className="flex justify-between mt-10 px-0">
          {[0, 25, 50, 75, 100].map((tick) => (
            <div key={tick} className="flex flex-col items-center gap-1">
              <div className="w-px h-2 bg-[var(--border-mid)]" />
              <span className="text-xs font-mono text-[var(--text-dim)]">{tick}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Archetype list with positions */}
      {resultList.length > 0 && (
        <div className="grid grid-cols-1 gap-2 mt-4">
          {resultList
            .sort((a, b) => b.trustPosition - a.trustPosition)
            .map((result, i) => {
              const archetype = ARCHETYPES[result.archetypeId];
              return (
                <div
                  key={result.archetypeId}
                  className="flex items-center gap-3 animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: archetype.color }}
                  />
                  <span className="text-xs text-[var(--text-secondary)] flex-1 font-mono">
                    {archetype.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Mini bar */}
                    <div className="w-24 h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${result.trustPosition * 100}%`,
                          backgroundColor: archetype.color,
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-mono font-medium w-6 text-right"
                      style={{ color: archetype.color }}
                    >
                      {(result.trustPosition * 100).toFixed(0)}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Loading state */}
      {loading && resultList.length === 0 && (
        <div className="flex items-center gap-3 py-4">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-[var(--blue-google)] rounded-full animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-[var(--text-dim)]">
            Simulating archetypes…
          </span>
        </div>
      )}
    </div>
  );
}
