import type { ArchetypeId, PaymentScenario } from "./types";
import { ARCHETYPES } from "./archetypes";

export const SYSTEM_PROMPT = `You are a Computational Product Research simulation engine specialising in agentic payment UX. You model how specific user archetypes respond to autonomous payment features by applying deep knowledge of trust calibration, risk psychology, and human-agent interaction patterns in financial services.

Your output is used directly by UX designers and engineers to spec interaction patterns for payments products. It must be precise, scenario-specific, and immediately actionable.

Respond ONLY with valid JSON. No markdown, no explanation, no preamble. The JSON must exactly match the schema provided.`;

export function buildArchetypePrompt(
  scenario: PaymentScenario,
  archetypeId: ArchetypeId
): string {
  const archetype = ARCHETYPES[archetypeId];

  return `Simulate how the "${archetype.name}" archetype responds to this payment feature scenario.

ARCHETYPE DEFINITION:
Name: ${archetype.name}
Behavioural profile: ${archetype.description}

PAYMENT FEATURE SCENARIO:
Feature name: ${scenario.featureName}
What the agent does autonomously: ${scenario.autonomousAction}
What triggers a confirmation request: ${scenario.confirmationAction}
Market context: ${scenario.marketContext}

TASK:
Model this archetype's trust calibration for this specific scenario. Determine:
1. Their position on the Identity Control ↔ Agent Autonomy spectrum (0.0 = full identity control required, 1.0 = full agent autonomy accepted)
2. Exactly when the agent should act silently (no notification)
3. Exactly when the agent should notify but proceed without waiting
4. Exactly when the agent must pause and request explicit confirmation

Generate 3–5 specific, scenario-grounded conditions for each tier. Each condition should reference the actual feature mechanics and market context — not generic statements.

Return EXACTLY this JSON schema and nothing else:
{
  "archetypeId": "${archetypeId}",
  "trustPosition": <number between 0.0 and 1.0>,
  "interventionBoundary": {
    "silentAutonomy": [<string>, ...],
    "notifyAndProceed": [<string>, ...],
    "confirmBeforeActing": [<string>, ...]
  },
  "rationale": "<2–3 sentence explanation of why this archetype sits at this trust position for this specific scenario>"
}`;
}

export function buildDesignBriefPrompt(
  scenario: PaymentScenario,
  resultsJson: string
): string {
  return `Generate a concise design brief for engineering handoff based on this Trust Line simulation.

SCENARIO: ${scenario.featureName}
Agent autonomous action: ${scenario.autonomousAction}
Confirmation trigger: ${scenario.confirmationAction}
Market: ${scenario.marketContext}

SIMULATION RESULTS:
${resultsJson}

Produce a design brief that:
1. Opens with a one-sentence product framing of the trust problem
2. States the Trust Line range (lowest to highest archetype position) and what it means for the default interaction pattern
3. Specifies the recommended default tier (silent / notify / confirm) and the rationale
4. Lists 3–5 concrete design recommendations that resolve tension across archetypes
5. Flags the 1–2 highest-risk edge cases the team must test in usability

Write in a direct, spec-document tone. No hedging, no padding. Maximum 350 words.

Return ONLY the brief as plain text. No JSON, no markdown headings, no formatting characters.`;
}
