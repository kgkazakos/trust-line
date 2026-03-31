"use client";

import { useState, useCallback } from "react";
import { ScenarioForm } from "@/components/ScenarioForm";
import { ArchetypeSelector } from "@/components/ArchetypeSelector";
import { TrustLineChart } from "@/components/TrustLineChart";
import { ArchetypeCard } from "@/components/ArchetypeCard";
import { DesignBrief } from "@/components/DesignBrief";
import { LoadingState } from "@/components/LoadingState";
import { ARCHETYPE_ORDER } from "@/lib/archetypes";
import type {
  ArchetypeId,
  ArchetypeResult,
  PaymentScenario,
  StreamChunk,
} from "@/lib/types";

type SimStatus = "idle" | "running" | "complete" | "error";

export default function Home() {
  const [status, setStatus] = useState<SimStatus>("idle");
  const [scenario, setScenario] = useState<PaymentScenario | null>(null);
  const [selectedArchetypes, setSelectedArchetypes] = useState<ArchetypeId[]>([
    ...ARCHETYPE_ORDER,
  ]);
  const [results, setResults] = useState<Partial<Record<ArchetypeId, ArchetypeResult>>>({});
  const [currentlyProcessing, setCurrentlyProcessing] = useState<ArchetypeId | null>(null);
  const [completedArchetypes, setCompletedArchetypes] = useState<ArchetypeId[]>([]);
  const [designBrief, setDesignBrief] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runSimulation = useCallback(
    async (submittedScenario: PaymentScenario) => {
      if (selectedArchetypes.length === 0) return;

      setScenario(submittedScenario);
      setStatus("running");
      setResults({});
      setCompletedArchetypes([]);
      setCurrentlyProcessing(null);
      setDesignBrief("");
      setErrorMessage(null);

      // Pre-populate loading states
      const loadingResults: Partial<Record<ArchetypeId, ArchetypeResult>> = {};
      for (const id of selectedArchetypes) {
        loadingResults[id] = {
          archetypeId: id,
          trustPosition: 0,
          interventionBoundary: {
            silentAutonomy: [],
            notifyAndProceed: [],
            confirmBeforeActing: [],
          },
          rationale: "",
          loading: true,
          error: null,
        };
      }
      setResults(loadingResults);

      try {
        const response = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenario: submittedScenario,
            selectedArchetypes,
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: "Simulation failed" })) as { error?: string };
          throw new Error(err.error ?? "Simulation failed");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const chunk = JSON.parse(jsonStr) as StreamChunk;

              if (chunk.type === "start") {
                setCurrentlyProcessing(chunk.archetypeId);
              } else if (chunk.type === "result" && chunk.data) {
                setResults((prev) => ({
                  ...prev,
                  [chunk.archetypeId]: chunk.data,
                }));
                setCompletedArchetypes((prev) => [...prev, chunk.archetypeId]);
                setCurrentlyProcessing(null);
              } else if (chunk.type === "error" && chunk.data) {
                setResults((prev) => ({
                  ...prev,
                  [chunk.archetypeId]: chunk.data,
                }));
                setCompletedArchetypes((prev) => [...prev, chunk.archetypeId]);
                setCurrentlyProcessing(null);
              } else if (chunk.type === "done") {
                const doneData = chunk.data as unknown as { designBrief?: string };
                if (doneData?.designBrief) {
                  setDesignBrief(doneData.designBrief);
                }
                setStatus("complete");
                setCurrentlyProcessing(null);
              }
            } catch {
              // malformed chunk — skip
            }
          }
        }

        setStatus("complete");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Simulation failed";
        setErrorMessage(msg);
        setStatus("error");
        setCurrentlyProcessing(null);
        // Clear loading states
        setResults((prev) => {
          const updated = { ...prev };
          for (const id of selectedArchetypes) {
            if (updated[id]?.loading) {
              updated[id] = { ...updated[id]!, loading: false, error: msg };
            }
          }
          return updated;
        });
      }
    },
    [selectedArchetypes]
  );

  function reset() {
    setStatus("idle");
    setScenario(null);
    setResults({});
    setCompletedArchetypes([]);
    setCurrentlyProcessing(null);
    setDesignBrief("");
    setErrorMessage(null);
  }

  const isRunning = status === "running";
  const hasResults = status === "complete" || (status === "running" && Object.keys(results).length > 0);

  const completedResults = Object.values(results).filter(
    (r): r is ArchetypeResult => r !== undefined && !r.loading
  );

  return (
    <main className="relative z-10 min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border-dim)] bg-[var(--navy-950)]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[var(--blue-google)] tracking-widest uppercase">
                  CPR
                </span>
                <span className="text-[var(--border-mid)]">·</span>
                <h1 className="text-sm font-mono font-medium text-[var(--text-primary)] tracking-wide">
                  trust-line
                </h1>
              </div>
              <p className="text-xs font-mono text-[var(--text-dim)] mt-0.5">
                Agentic Payment Trust Mapping
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {status !== "idle" && (
              <button
                onClick={reset}
                disabled={isRunning}
                className="text-xs font-mono text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← New scenario
              </button>
            )}
            <a
              href="https://github.com/kgkazakos/trust-line"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-[var(--text-dim)] hover:text-[var(--blue-google)] transition-colors border border-[var(--border-dim)] hover:border-[var(--blue-google)] px-3 py-1.5 rounded"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </header>

      {/* Hero — shown only on idle */}
      {status === "idle" && (
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-[var(--surface-1)] border border-[var(--border-mid)] rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--blue-google)] animate-pulse" />
            <span className="text-xs font-mono text-[var(--text-dim)]">
              Powered by Gemini 3.1 Pro · Computational Prototyping
            </span>
          </div>

          <h2 className="text-3xl font-medium text-[var(--text-primary)] leading-tight mb-4">
            When should the agent act silently,
            <br />
            <span className="text-[var(--blue-google)]">and when should it ask?</span>
          </h2>

          <p className="text-sm font-mono text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto mb-4">
            trust-line maps the Trust Line for any autonomous payment feature —
            showing exactly where five user archetypes sit on the{" "}
            <span className="text-[var(--text-primary)]">Identity Control ↔ Agent Autonomy</span>{" "}
            spectrum, and generating an Intervention Boundary specification
            your designers and engineers can act on directly.
          </p>

          <div className="flex items-center justify-center gap-6 text-xs font-mono text-[var(--text-dim)]">
            <span>Input a scenario</span>
            <span className="text-[var(--border-mid)]">→</span>
            <span>Watch the Trust Line build</span>
            <span className="text-[var(--border-mid)]">→</span>
            <span>Export a design brief</span>
          </div>
        </section>
      )}

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {!hasResults ? (
          /* Input layout — two column */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="glass-card border border-[var(--border-dim)] rounded-xl p-6">
              <ScenarioForm onSubmit={runSimulation} disabled={isRunning} />
            </div>
            <div className="glass-card border border-[var(--border-dim)] rounded-xl p-6">
              <ArchetypeSelector
                selected={selectedArchetypes}
                onChange={setSelectedArchetypes}
                disabled={isRunning}
              />
            </div>
          </div>
        ) : (
          /* Results layout — three column */
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left sidebar — controls */}
            <div className="xl:col-span-3 space-y-4">
              <div className="glass-card border border-[var(--border-dim)] rounded-xl p-5">
                {isRunning ? (
                  <LoadingState
                    currentArchetype={currentlyProcessing}
                    completedArchetypes={completedArchetypes}
                    selectedArchetypes={selectedArchetypes}
                  />
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest mb-3">
                        Scenario
                      </p>
                      {scenario && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-[var(--text-primary)] font-mono">
                            {scenario.featureName}
                          </p>
                          <p className="text-xs font-mono text-[var(--text-dim)] leading-relaxed">
                            {scenario.marketContext}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-dim)]">
                      <div>
                        <p className="text-xs font-mono text-[var(--text-dim)] mb-0.5">Archetypes</p>
                        <p className="text-lg font-mono font-medium text-[var(--blue-google)]">
                          {completedResults.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-mono text-[var(--text-dim)] mb-0.5">Spread</p>
                        <p className="text-lg font-mono font-medium text-[var(--blue-google)]">
                          {completedResults.length >= 2
                            ? (
                                (Math.max(...completedResults.map((r) => r.trustPosition)) -
                                  Math.min(...completedResults.map((r) => r.trustPosition))) *
                                100
                              ).toFixed(0)
                            : "—"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={reset}
                      className="w-full text-xs font-mono text-[var(--text-dim)] hover:text-[var(--text-secondary)] border border-[var(--border-dim)] hover:border-[var(--border-mid)] py-2 rounded transition-colors"
                    >
                      ← New scenario
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Centre — Trust Line chart + archetype cards */}
            <div className="xl:col-span-5 space-y-5">
              {/* Trust Line chart */}
              <div className="glass-card border border-[var(--border-dim)] rounded-xl p-6">
                <TrustLineChart results={results} loading={isRunning} />
              </div>

              {/* Archetype cards */}
              <div className="space-y-4">
                {selectedArchetypes.map((id, i) => {
                  const result = results[id];
                  if (!result) return null;
                  return (
                    <ArchetypeCard key={id} result={result} index={i} />
                  );
                })}
              </div>
            </div>

            {/* Right — Design Brief */}
            <div className="xl:col-span-4">
              {status === "complete" && scenario ? (
                <div className="glass-card border border-[var(--border-dim)] rounded-xl p-6 sticky top-24">
                  <DesignBrief
                    brief={designBrief}
                    scenario={scenario}
                    results={results}
                  />
                </div>
              ) : (
                <div className="glass-card border border-[var(--border-dim)] rounded-xl p-6 sticky top-24">
                  <p className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest mb-4">
                    Design Brief
                  </p>
                  <div className="space-y-3">
                    {[80, 60, 90, 70, 50, 75].map((w, i) => (
                      <div
                        key={i}
                        className="h-2.5 bg-[var(--surface-2)] rounded animate-pulse"
                        style={{
                          width: `${w}%`,
                          animationDelay: `${i * 150}ms`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-mono text-[var(--text-dim)] mt-4">
                    Generated after all archetypes are simulated…
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error state */}
        {status === "error" && errorMessage && (
          <div className="max-w-xl mx-auto mt-8 bg-red-500/10 border border-red-500/30 rounded-lg px-5 py-4">
            <p className="text-xs font-mono text-red-400 mb-1 font-medium">Simulation error</p>
            <p className="text-xs font-mono text-red-300/80">{errorMessage}</p>
            <button
              onClick={reset}
              className="mt-3 text-xs font-mono text-red-400 hover:text-red-300 transition-colors"
            >
              ← Try again
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--border-dim)] py-6 mt-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <p className="text-xs font-mono text-[var(--text-dim)]">
            trust-line · Computational Product Research ·{" "}
            <a
              href="https://github.com/kgkazakos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--blue-google)] hover:text-[var(--blue-bright)] transition-colors"
            >
              @kgkazakos
            </a>
          </p>
          <p className="text-xs font-mono text-[var(--text-dim)]">
            Independent CPR research.
          </p>
        </div>
      </footer>
    </main>
  );
}
