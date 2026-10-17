import { getPlace } from "@/lib/data/locations";
import type { SegmentTemplate } from "@/lib/providers/catalog";
import { combineDateAndTime } from "@/lib/time";
import type { TravelSegment } from "@/lib/types/travel";

export function instantiateTemplate(
  template: SegmentTemplate,
  date: string,
): TravelSegment {
  const departure = combineDateAndTime(date, template.depart);
  const arrivalDate = new Date(
    new Date(departure).getTime() + template.durationMinutes * 60_000,
  );
  const from = getPlace(template.from);
  const to = getPlace(template.to);
  const price = template.baseFare + template.taxes + template.fees;

  return {
    id: `${template.id}-${date}`,
    type: template.type,
    operator: template.operator,
    operatorId: template.operatorId,
    from,
    to,
    departure,
    arrival: arrivalDate.toISOString(),
    durationMinutes: template.durationMinutes,
    price,
    currency: "INR",
    baseFare: template.baseFare,
    taxes: template.taxes,
    fees: template.fees,
    reliability: template.reliability,
  };
}

export function sanitizeSegment(segment: TravelSegment): TravelSegment | null {
  if (!segment.id || !segment.operator || !segment.from?.id || !segment.to?.id) {
    return null;
  }
  if (!(segment.type === "flight" || segment.type === "train")) {
    return null;
  }
  if (segment.price <= 0 || segment.durationMinutes <= 0) {
    return null;
  }
  if (new Date(segment.arrival).getTime() <= new Date(segment.departure).getTime()) {
    return null;
  }
  const reliability = Math.min(1, Math.max(0, segment.reliability));
  return { ...segment, reliability };
}
