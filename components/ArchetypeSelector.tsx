"use client";

import { ARCHETYPES, ARCHETYPE_ORDER } from "@/lib/archetypes";
import type { ArchetypeId } from "@/lib/types";

interface ArchetypeSelectorProps {
  selected: ArchetypeId[];
  onChange: (selected: ArchetypeId[]) => void;
  disabled?: boolean;
}

export function ArchetypeSelector({
  selected,
  onChange,
  disabled = false,
}: ArchetypeSelectorProps) {
  function toggle(id: ArchetypeId) {
    if (disabled) return;
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  function selectAll() {
    if (disabled) return;
    onChange([...ARCHETYPE_ORDER]);
  }

  function clearAll() {
    if (disabled) return;
    onChange([]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest mb-1">
            Step 02 — Archetypes
          </p>
          <h2 className="text-sm font-medium text-[var(--text-secondary)]">
            Select archetypes to simulate
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            disabled={disabled}
            className="text-xs font-mono text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            All
          </button>
          <span className="text-[var(--border-mid)]">·</span>
          <button
            onClick={clearAll}
            disabled={disabled}
            className="text-xs font-mono text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            None
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {ARCHETYPE_ORDER.map((id) => {
          const archetype = ARCHETYPES[id];
          const isSelected = selected.includes(id);

          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              disabled={disabled}
              className={`w-full text-left px-4 py-3 rounded border transition-all duration-200 group
                ${isSelected
                  ? "bg-[var(--surface-2)] border-[var(--border-bright)]"
                  : "bg-[var(--surface-1)] border-[var(--border-dim)] hover:border-[var(--border-mid)]"
                }
                disabled:opacity-40 disabled:cursor-not-allowed`}
              style={{
                borderLeftColor: isSelected ? archetype.color : undefined,
                borderLeftWidth: isSelected ? "3px" : undefined,
              }}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <div
                  className={`mt-0.5 w-4 h-4 rounded-sm border flex-shrink-0 flex items-center justify-center transition-all duration-200
                    ${isSelected ? "border-transparent" : "border-[var(--border-mid)]"}`}
                  style={{
                    backgroundColor: isSelected ? archetype.color : "transparent",
                  }}
                >
                  {isSelected && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium mb-0.5 transition-colors"
                    style={{ color: isSelected ? archetype.color : "var(--text-primary)" }}
                  >
                    {archetype.name}
                  </p>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed font-mono">
                    {archetype.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selected.length === 0 && (
        <p className="text-xs font-mono text-[var(--text-dim)] text-center pt-1">
          Select at least one archetype to run the simulation.
        </p>
      )}
    </div>
  );
}
