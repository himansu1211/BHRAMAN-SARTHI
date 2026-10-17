import type { TravelRoute } from "@/lib/types/travel";
import { formatBuffer, formatDuration } from "@/lib/time";
import { formatInr } from "@/lib/format";

export function explainRoute(route: TravelRoute, cheapestPrice?: number): string {
  const buffer = formatBuffer(route.deadlineBufferMinutes);
  const duration = formatDuration(route.totalDurationMinutes);
  const price = formatInr(route.totalPrice);
  const transferText =
    route.transfers === 0
      ? "It has no transfers"
      : `It has ${route.transfers} transfer`;

  if (route.missesDeadline) {
    return `This option arrives after your deadline (${buffer.replace("after deadline", "late")}). It is hidden from main recommendations unless you choose to view missed-deadline routes.`;
  }

  if (cheapestPrice !== undefined && route.totalPrice > cheapestPrice) {
    return `This route costs more than the cheapest option (${formatInr(cheapestPrice)}), but ${transferText.toLowerCase()} and leaves ${buffer}. Total time is ${duration} for ${price}.`;
  }

  return `${transferText} and leaves ${buffer}. Total time is ${duration} for ${price}, with ${route.estimatedArrivalConfidence}% estimated arrival confidence.`;
}
