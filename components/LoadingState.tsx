"use client";

import { ARCHETYPES } from "@/lib/archetypes";
import type { ArchetypeId } from "@/lib/types";

interface LoadingStateProps {
  currentArchetype: ArchetypeId | null;
  completedArchetypes: ArchetypeId[];
  selectedArchetypes: ArchetypeId[];
}

export function LoadingState({
  currentArchetype,
  completedArchetypes,
  selectedArchetypes,
}: LoadingStateProps) {
  const total = selectedArchetypes.length;
  const completed = completedArchetypes.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-mono text-[var(--text-dim)]">
            Simulation progress
          </span>
          <span className="text-xs font-mono text-[var(--blue-google)]">
            {completed}/{total}
          </span>
        </div>
        <div className="h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden relative">
          <div
            className="h-full bg-[var(--blue-google)] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
          {/* Scan animation */}
          {progress < 100 && (
            <div
              className="absolute top-0 left-0 h-full w-16 scan-line"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(77,148,255,0.5), transparent)",
              }}
            />
          )}
        </div>
      </div>

      {/* Archetype status list */}
      <div className="space-y-2">
        {selectedArchetypes.map((id) => {
          const archetype = ARCHETYPES[id];
          const isComplete = completedArchetypes.includes(id);
          const isCurrent = currentArchetype === id;

          return (
            <div
              key={id}
              className={`flex items-center gap-3 px-3 py-2 rounded transition-all duration-300
                ${isCurrent ? "bg-[var(--surface-2)] border border-[var(--border-mid)]" : ""}
              `}
            >
              {/* Status indicator */}
              <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                {isComplete ? (
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: archetype.color }}
                  >
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path
                        d="M1 3L3 5L7 1"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ) : isCurrent ? (
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full animate-pulse"
                        style={{
                          backgroundColor: archetype.color,
                          animationDelay: `${i * 200}ms`,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-[var(--border-mid)]" />
                )}
              </div>

              <span
                className="text-xs font-mono transition-colors"
                style={{
                  color: isComplete
                    ? archetype.color
                    : isCurrent
                    ? "var(--text-primary)"
                    : "var(--text-dim)",
                }}
              >
                {archetype.name}
              </span>

              {isCurrent && (
                <span className="ml-auto text-xs font-mono text-[var(--text-dim)] animate-pulse">
                  Simulating…
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
