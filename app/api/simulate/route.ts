import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";
import { ARCHETYPE_ORDER, ARCHETYPES } from "@/lib/archetypes";
import { buildArchetypePrompt, buildDesignBriefPrompt, SYSTEM_PROMPT } from "@/lib/prompts";
import type { ArchetypeId, ArchetypeResult, PaymentScenario, StreamChunk } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

function encodeChunk(chunk: StreamChunk): string {
  return `data: ${JSON.stringify(chunk)}\n\n`;
}

async function generateArchetypeResult(
  ai: GoogleGenAI,
  scenario: PaymentScenario,
  archetypeId: ArchetypeId
): Promise<ArchetypeResult> {
  const prompt = buildArchetypePrompt(scenario, archetypeId);

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      thinkingConfig: { thinkingBudget: 8000 },
      temperature: 0.7,
    },
  });

  const text = response.text ?? "";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  const parsed = JSON.parse(cleaned) as {
    archetypeId: ArchetypeId;
    trustPosition: number;
    interventionBoundary: {
      silentAutonomy: string[];
      notifyAndProceed: string[];
      confirmBeforeActing: string[];
    };
    rationale: string;
  };

  return {
    archetypeId,
    trustPosition: Math.max(0, Math.min(1, parsed.trustPosition)),
    interventionBoundary: parsed.interventionBoundary,
    rationale: parsed.rationale,
    loading: false,
    error: null,
  };
}

async function generateDesignBrief(
  ai: GoogleGenAI,
  scenario: PaymentScenario,
  results: Record<ArchetypeId, ArchetypeResult>
): Promise<string> {
  const resultsJson = JSON.stringify(
    Object.values(results).map((r) => ({
      archetype: ARCHETYPES[r.archetypeId].name,
      trustPosition: r.trustPosition,
      interventionBoundary: r.interventionBoundary,
      rationale: r.rationale,
    })),
    null,
    2
  );

  const prompt = buildDesignBriefPrompt(scenario, resultsJson);

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction:
        "You are a senior UX researcher writing a design brief for engineering handoff. Be precise, direct, and immediately actionable. Return plain text only.",
      thinkingConfig: { thinkingBudget: 4000 },
      temperature: 0.5,
    },
  });

  return response.text ?? "";
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let scenario: PaymentScenario;
  let selectedArchetypes: ArchetypeId[];

  try {
    const body = await req.json() as { scenario: PaymentScenario; selectedArchetypes: ArchetypeId[] };
    scenario = body.scenario;
    selectedArchetypes = body.selectedArchetypes;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!scenario?.featureName || !selectedArchetypes?.length) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ai = new GoogleGenAI({ apiKey });

  const orderedArchetypes = ARCHETYPE_ORDER.filter((id) =>
    selectedArchetypes.includes(id)
  );

  const encoder = new TextEncoder();
  const results: Record<ArchetypeId, ArchetypeResult> = {} as Record<ArchetypeId, ArchetypeResult>;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for (const archetypeId of orderedArchetypes) {
          // Signal start
          controller.enqueue(
            encoder.encode(
              encodeChunk({ archetypeId, type: "start" })
            )
          );

          try {
            const result = await generateArchetypeResult(ai, scenario, archetypeId);
            results[archetypeId] = result;

            controller.enqueue(
              encoder.encode(
                encodeChunk({ archetypeId, type: "result", data: result })
              )
            );
          } catch (err) {
            const errorMessage =
              err instanceof Error ? err.message : "Simulation failed";
            const fallback: ArchetypeResult = {
              archetypeId,
              trustPosition: ARCHETYPES[archetypeId].defaultPosition,
              interventionBoundary: {
                silentAutonomy: ["Unable to generate — using archetype defaults"],
                notifyAndProceed: ["Unable to generate — using archetype defaults"],
                confirmBeforeActing: ["Unable to generate — using archetype defaults"],
              },
              rationale: "Simulation failed. Showing archetype default position.",
              loading: false,
              error: errorMessage,
            };
            results[archetypeId] = fallback;
            controller.enqueue(
              encoder.encode(
                encodeChunk({ archetypeId, type: "error", error: errorMessage, data: fallback })
              )
            );
          }
        }

        // Generate design brief if we have results
        if (Object.keys(results).length > 0) {
          try {
            const brief = await generateDesignBrief(ai, scenario, results);
            controller.enqueue(
              encoder.encode(
                encodeChunk({
                  archetypeId: "autonomous-delegator", // sentinel — client ignores archetypeId for done
                  type: "done",
                  data: { designBrief: brief } as unknown as ArchetypeResult,
                })
              )
            );
          } catch {
            controller.enqueue(
              encoder.encode(
                encodeChunk({
                  archetypeId: "autonomous-delegator",
                  type: "done",
                  data: { designBrief: "" } as unknown as ArchetypeResult,
                })
              )
            );
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
