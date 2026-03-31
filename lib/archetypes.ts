import type { ArchetypeDefinition, ArchetypeId } from "./types";

export const ARCHETYPES: Record<ArchetypeId, ArchetypeDefinition> = {
  "autonomous-delegator": {
    id: "autonomous-delegator",
    name: "Autonomous Delegator",
    description:
      "Comfortable with agents acting on their behalf for routine financial tasks. Values speed and frictionlessness over control.",
    color: "#1A73E8",
    borderColor: "#1A73E8",
    glowColor: "rgba(26,115,232,0.25)",
    defaultPosition: 0.82,
  },
  "supervised-controller": {
    id: "supervised-controller",
    name: "Supervised Controller",
    description:
      "Wants visibility and confirmation for anything above a personal threshold. Trust is earned incrementally through demonstrated reliability.",
    color: "#34A853",
    borderColor: "#34A853",
    glowColor: "rgba(52,168,83,0.25)",
    defaultPosition: 0.45,
  },
  "privacy-sceptic": {
    id: "privacy-sceptic",
    name: "Privacy Sceptic",
    description:
      "Concerned about data use and agent access to financial context. Wants explicit consent at each autonomous step regardless of transaction size.",
    color: "#EA4335",
    borderColor: "#EA4335",
    glowColor: "rgba(234,67,53,0.25)",
    defaultPosition: 0.2,
  },
  "convenience-maximiser": {
    id: "convenience-maximiser",
    name: "Convenience Maximiser",
    description:
      "Prioritises the frictionless path. Tolerates autonomous action provided errors are recoverable and the agent is transparent after the fact.",
    color: "#FBBC04",
    borderColor: "#FBBC04",
    glowColor: "rgba(251,188,4,0.25)",
    defaultPosition: 0.72,
  },
  "risk-avoider": {
    id: "risk-avoider",
    name: "Risk Avoider",
    description:
      "Treats financial decisions as inherently high-stakes regardless of amount. Defaults to confirmation over autonomy as a stable preference.",
    color: "#FF6D00",
    borderColor: "#FF6D00",
    glowColor: "rgba(255,109,0,0.25)",
    defaultPosition: 0.12,
  },
};

export const ARCHETYPE_ORDER: ArchetypeId[] = [
  "autonomous-delegator",
  "convenience-maximiser",
  "supervised-controller",
  "privacy-sceptic",
  "risk-avoider",
];
