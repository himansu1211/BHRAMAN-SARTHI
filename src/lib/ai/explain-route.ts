import type { TravelRoute } from "@/lib/types/travel";
import { explainRoute } from "@/lib/routing/explain";

export async function generateAiExplanation(route: TravelRoute): Promise<string> {
  const fallback = explainRoute(route);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fallback;
  }

  const payload = {
    price: route.totalPrice,
    duration: route.totalDurationMinutes,
    transfers: route.transfers,
    confidence: route.estimatedArrivalConfidence,
    deadlineBuffer: route.deadlineBufferMinutes,
    missesDeadline: route.missesDeadline,
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 80,
        messages: [
          {
            role: "system",
            content:
              "Write one short sentence explaining a travel route using only the given numbers. Do not invent schedules, prices, or accuracy claims.",
          },
          { role: "user", content: JSON.stringify(payload) },
        ],
      }),
    });

    if (!response.ok) {
      return fallback;
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text || fallback;
  } catch {
    return fallback;
  }
}
