export interface PaymentScenario {
  featureName: string;
  autonomousAction: string;
  confirmationAction: string;
  marketContext: string;
}

export type ArchetypeId =
  | "autonomous-delegator"
  | "supervised-controller"
  | "privacy-sceptic"
  | "convenience-maximiser"
  | "risk-avoider";

export interface ArchetypeDefinition {
  id: ArchetypeId;
  name: string;
  description: string;
  color: string;
  borderColor: string;
  glowColor: string;
  defaultPosition: number; // 0 = identity control, 1 = agent autonomy
}

export interface InterventionBoundary {
  silentAutonomy: string[];
  notifyAndProceed: string[];
  confirmBeforeActing: string[];
}

export interface ArchetypeResult {
  archetypeId: ArchetypeId;
  trustPosition: number; // 0–1
  interventionBoundary: InterventionBoundary;
  rationale: string;
  loading: boolean;
  error: string | null;
}

export interface SimulationState {
  status: "idle" | "running" | "complete" | "error";
  scenario: PaymentScenario | null;
  selectedArchetypes: ArchetypeId[];
  results: Record<ArchetypeId, ArchetypeResult>;
  currentlyProcessing: ArchetypeId | null;
  errorMessage: string | null;
}

export interface StreamChunk {
  archetypeId: ArchetypeId;
  type: "start" | "result" | "error" | "done";
  data?: ArchetypeResult;
  error?: string;
}
