import { minutesBetween } from "@/lib/time";

export function calculateDeadlineBuffer(
  arrivalIso: string,
  deadlineIso: string,
): number {
  return minutesBetween(arrivalIso, deadlineIso);
}

export function missesDeadline(arrivalIso: string, deadlineIso: string): boolean {
  return new Date(arrivalIso).getTime() > new Date(deadlineIso).getTime();
}
