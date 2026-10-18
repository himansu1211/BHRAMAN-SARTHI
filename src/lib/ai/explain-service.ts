import { generateDeterministicExplanation } from "../routing/route-score";
import { TravelRoute } from "../types";

export async function explainRouteWithFallback(route: TravelRoute): Promise<string> {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

  if (geminiApiKey) {
    try {
      const promptText = `You are Google Gemini AI travel expert for BHRAMAN SARTHI (भ्रमण सारथी • Your Journey Navigator).
Analyze this multimodal travel route in India and provide a crisp breakdown and Travel Roadmap for the passenger:

- Overall Fare: ₹${route.totalPrice}
- Duration: ${Math.floor(route.totalDurationMinutes / 60)}h ${route.totalDurationMinutes % 60}m
- Transfers: ${route.transfers}
- Target Deadline Buffer: ${route.deadlineBufferMinutes} minutes
- Estimated Arrival Confidence: ${route.estimatedArrivalConfidence}%

Segments:
${route.segments
  .map(
    (s, i) =>
      `Leg ${i + 1} (${s.type.toUpperCase()}): ${s.operator} (${s.segmentNumber}) from ${s.fromName} (${s.fromCode}) to ${s.toName} (${s.toCode}). Departs ${s.departureTime}, Arrives ${s.arrivalTime}. ${s.seatAvailability?.label || ""} ${s.trainOrigin ? `[Train run: ${s.trainOrigin} ➔ ${s.trainTerminus}, ${s.stopsBetween || 0} stops]` : ""}`
  )
  .join("\n")}

Interchanges:
${(route.interchanges || []).map((i) => `- ${i.description} (${i.durationMinutes}m, est ₹${i.estCost})`).join("\n") || "Direct transfers"}

Please format your response into two sections:
1. 💡 WHY THIS ROUTE: A concise 2-sentence rationale on why this route guarantees arrival before deadline.
2. 🗺️ STEP-BY-STEP TRAVEL ROADMAP: Concise bullet points outlining check-in times, transfer buffers at stations, and arrival advisory.`;

      const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
      for (const model of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (text) {
            return text;
          }
        }
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to deterministic explanation:", err);
    }
  }

  // Fallback to OpenAI if configured
  const openAiApiKey = process.env.OPENAI_API_KEY;
  if (openAiApiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `Summarize why this multimodal route was selected: Fare ₹${route.totalPrice}, Duration ${Math.floor(route.totalDurationMinutes / 60)}h, Buffer ${route.deadlineBufferMinutes}m.`,
            },
          ],
          max_tokens: 150,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch (err) {
      console.warn("OpenAI API call failed:", err);
    }
  }

  // Fallback to deterministic template
  return generateDeterministicExplanation({
    totalPrice: route.totalPrice,
    totalDurationMinutes: route.totalDurationMinutes,
    transfers: route.transfers,
    deadlineBufferMinutes: route.deadlineBufferMinutes,
    estimatedArrivalConfidence: route.estimatedArrivalConfidence,
    categoryBadge: route.categoryBadge,
  });
}
