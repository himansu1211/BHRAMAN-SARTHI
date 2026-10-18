import "server-only";
import type { LiveOption } from "../live/types";
import type { Suggestion } from "../live/suggestions";

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export interface Roadmap {
  summary: string;
  steps: { optionId: string; instruction: string }[]; // optionId MUST exist in the verified list
  warnings: string[];
}

async function call(body: unknown): Promise<any> {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  if (!key) throw new Error("GEMINI_API_KEY / GEMINI_MODEL not set");
  const r = await fetch(`${BASE}/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Gemini HTTP ${r.status}`);
  return r.json();
}

const text = (j: any) =>
  j?.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? "").join("") ?? "";

/** Step 1 (optional): grounded web lookup for urgent disruptions (strikes, floods, cancellations). */
export async function fetchAdvisories(
  fromCity: string,
  toCity: string,
  date: string
): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return "none found";
  try {
    const j = await call({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `List only confirmed, current travel disruptions affecting travel from ${fromCity} to ${toCity} around ${date} in India. If none found, say "none found". No speculation.`,
            },
          ],
        },
      ],
      tools: [{ google_search: {} }],
    });
    return text(j) || "none found";
  } catch (err) {
    console.warn("fetchAdvisories failed:", err);
    return "none found";
  }
}

/** Step 2: Build verified AI travel roadmap from options and smart suggestions. */
export async function buildRoadmap(
  options: LiveOption[],
  suggestions: Suggestion[],
  fromCity: string,
  toCity: string,
  date: string,
  deadlineISO?: string
): Promise<Roadmap> {
  const validOptionIds = new Set(options.map((o) => o.id));

  // Deterministic generator helper
  const createDeterministicRoadmap = (extraWarning?: string): Roadmap => {
    const warnings = suggestions.map((s) => s.reason);
    if (extraWarning) warnings.push(extraWarning);
    return {
      summary: `Verified travel roadmap from ${fromCity} to ${toCity} for ${date}.${
        deadlineISO ? ` Target arrival before ${new Date(deadlineISO).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.` : ""
      }`,
      steps: options.map((opt) => ({
        optionId: opt.id,
        instruction: `Board ${opt.mode.toUpperCase()} ${opt.number} (${opt.name} via ${opt.source}) from ${opt.fromCode} departing ${opt.departISO.substring(11, 16)}, arriving ${opt.toCode} at ${opt.arriveISO.substring(11, 16)}.`,
      })),
      warnings,
    };
  };

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return createDeterministicRoadmap();
  }

  try {
    const factsList = options
      .map(
        (o) =>
          `ID: "${o.id}" | Mode: ${o.mode} | Source: ${o.source} | Number: ${o.number} | Name: ${o.name} | Route: ${o.fromCode} (${o.fromLabel}) -> ${o.toCode} (${o.toLabel}) | Depart: ${o.departISO} | Arrive: ${o.arriveISO}`
      )
      .join("\n");

    const suggestionsText = suggestions
      .map((s) => `[${s.kind}] ${s.title}: ${s.reason}`)
      .join("\n");

    const promptText = `You are Google Gemini AI travel navigator for BHRAMAN SARTHI (भ्रमण सारथी).
Analyze these verified live travel options and suggestions for travel from ${fromCity} to ${toCity} on ${date}${deadlineISO ? ` with deadline ${deadlineISO}` : ""}.

VERIFIED OPTIONS (Use ONLY these option IDs):
${factsList || "None"}

SUGGESTIONS & ADVISORIES:
${suggestionsText || "None"}

STRICT RULES:
1. ONLY refer to verified option IDs listed above in the "steps" array.
2. DO NOT invent or hallucinate new option IDs, flight/train numbers, schedules, or prices.
3. Return valid JSON matching this schema:
{
  "summary": "Concise journey summary explaining why these options work",
  "steps": [
    { "optionId": "<EXACT_ID_FROM_VERIFIED_OPTIONS>", "instruction": "Concise step-by-step guidance for this leg" }
  ],
  "warnings": ["Any advisories, transfer buffers, or weather/traffic warnings"]
}`;

    const j = await call({
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const rawJsonText = text(j);
    if (!rawJsonText) return createDeterministicRoadmap("AI roadmap generated empty response.");

    const parsed = JSON.parse(rawJsonText) as Roadmap;
    const validatedSteps: { optionId: string; instruction: string }[] = [];
    const warnings = Array.isArray(parsed.warnings) ? parsed.warnings : [];
    let discardedCount = 0;

    if (Array.isArray(parsed.steps)) {
      for (const step of parsed.steps) {
        if (step?.optionId && validOptionIds.has(step.optionId)) {
          validatedSteps.push({
            optionId: step.optionId,
            instruction: String(step.instruction || ""),
          });
        } else {
          discardedCount++;
        }
      }
    }

    if (discardedCount > 0) {
      warnings.push(`Discarded ${discardedCount} unverified AI option reference(s).`);
    }

    // If all steps were filtered out, supply default verified steps
    if (validatedSteps.length === 0 && options.length > 0) {
      options.forEach((opt) => {
        validatedSteps.push({
          optionId: opt.id,
          instruction: `Board ${opt.mode.toUpperCase()} ${opt.number} (${opt.name} via ${opt.source}) from ${opt.fromCode} departing ${opt.departISO.substring(11, 16)}, arriving ${opt.toCode} at ${opt.arriveISO.substring(11, 16)}.`,
        });
      });
    }

    return {
      summary: String(parsed.summary || `Travel roadmap for ${fromCity} to ${toCity}`),
      steps: validatedSteps,
      warnings,
    };
  } catch (err) {
    console.warn("Gemini buildRoadmap call failed, using deterministic fallback:", err);
    return createDeterministicRoadmap();
  }
}
