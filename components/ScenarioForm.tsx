"use client";

import { useState } from "react";
import type { PaymentScenario } from "@/lib/types";

interface ScenarioFormProps {
  onSubmit: (scenario: PaymentScenario) => void;
  disabled?: boolean;
}

const EXAMPLE_SCENARIO: PaymentScenario = {
  featureName: "Predictive Transit Funding",
  autonomousAction:
    "Automatically top up a transit wallet when balance falls below a threshold, without user initiation",
  confirmationAction:
    "When top-up amount exceeds 3× the average top-up, or when the linked card has insufficient funds",
  marketContext:
    "Southeast Asia, commuter populations, transit cards used 2–5× daily",
};

export function ScenarioForm({ onSubmit, disabled = false }: ScenarioFormProps) {
  const [scenario, setScenario] = useState<PaymentScenario>({
    featureName: "",
    autonomousAction: "",
    confirmationAction: "",
    marketContext: "",
  });

  const [touched, setTouched] = useState(false);

  const isValid =
    scenario.featureName.trim() &&
    scenario.autonomousAction.trim() &&
    scenario.confirmationAction.trim() &&
    scenario.marketContext.trim();

  function handleChange(field: keyof PaymentScenario, value: string) {
    setScenario((prev) => ({ ...prev, [field]: value }));
  }

  function loadExample() {
    setScenario(EXAMPLE_SCENARIO);
  }

  function handleSubmit() {
    setTouched(true);
    if (!isValid) return;
    onSubmit(scenario);
  }

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest mb-1">
            Step 01 — Scenario
          </p>
          <h2 className="text-sm font-medium text-[var(--text-secondary)]">
            Define the payment feature
          </h2>
        </div>
        <button
          onClick={loadExample}
          disabled={disabled}
          className="text-xs font-mono text-[var(--blue-google)] hover:text-[var(--blue-bright)] transition-colors border border-[var(--border-mid)] hover:border-[var(--blue-google)] px-3 py-1.5 rounded disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Load example →
        </button>
      </div>

      {/* Feature name */}
      <div>
        <label className="block text-xs font-mono text-[var(--text-dim)] mb-2 uppercase tracking-wider">
          Feature name
        </label>
        <input
          type="text"
          value={scenario.featureName}
          onChange={(e) => handleChange("featureName", e.target.value)}
          disabled={disabled}
          placeholder="e.g. Predictive Transit Funding"
          className={`w-full bg-[var(--surface-1)] border rounded px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-dim)] transition-colors font-mono
            ${touched && !scenario.featureName.trim() ? "border-red-500/50" : "border-[var(--border-mid)] focus:border-[var(--blue-google)]"}
            disabled:opacity-40 disabled:cursor-not-allowed`}
        />
      </div>

      {/* Autonomous action */}
      <div>
        <label className="block text-xs font-mono text-[var(--text-dim)] mb-2 uppercase tracking-wider">
          What the agent does autonomously
        </label>
        <textarea
          value={scenario.autonomousAction}
          onChange={(e) => handleChange("autonomousAction", e.target.value)}
          disabled={disabled}
          placeholder="Describe what the agent does without asking the user…"
          rows={3}
          className={`w-full bg-[var(--surface-1)] border rounded px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-dim)] transition-colors font-mono leading-relaxed
            ${touched && !scenario.autonomousAction.trim() ? "border-red-500/50" : "border-[var(--border-mid)] focus:border-[var(--blue-google)]"}
            disabled:opacity-40 disabled:cursor-not-allowed`}
        />
      </div>

      {/* Confirmation trigger */}
      <div>
        <label className="block text-xs font-mono text-[var(--text-dim)] mb-2 uppercase tracking-wider">
          What triggers a confirmation request
        </label>
        <textarea
          value={scenario.confirmationAction}
          onChange={(e) => handleChange("confirmationAction", e.target.value)}
          disabled={disabled}
          placeholder="Describe the conditions where the agent asks before acting…"
          rows={3}
          className={`w-full bg-[var(--surface-1)] border rounded px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-dim)] transition-colors font-mono leading-relaxed
            ${touched && !scenario.confirmationAction.trim() ? "border-red-500/50" : "border-[var(--border-mid)] focus:border-[var(--blue-google)]"}
            disabled:opacity-40 disabled:cursor-not-allowed`}
        />
      </div>

      {/* Market context */}
      <div>
        <label className="block text-xs font-mono text-[var(--text-dim)] mb-2 uppercase tracking-wider">
          Target market context
        </label>
        <input
          type="text"
          value={scenario.marketContext}
          onChange={(e) => handleChange("marketContext", e.target.value)}
          disabled={disabled}
          placeholder="e.g. Southeast Asia, commuter populations, transit cards used 2–5× daily"
          className={`w-full bg-[var(--surface-1)] border rounded px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-dim)] transition-colors font-mono
            ${touched && !scenario.marketContext.trim() ? "border-red-500/50" : "border-[var(--border-mid)] focus:border-[var(--blue-google)]"}
            disabled:opacity-40 disabled:cursor-not-allowed`}
        />
      </div>

      {touched && !isValid && (
        <p className="text-xs font-mono text-red-400">
          All fields are required to run the simulation.
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={disabled}
        className="w-full bg-[var(--blue-google)] hover:bg-[var(--blue-bright)] text-white font-mono text-sm py-3 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium tracking-wide"
      >
        {disabled ? "Simulation running…" : "Map the Trust Line →"}
      </button>
    </div>
  );
}
