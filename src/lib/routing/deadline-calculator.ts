export interface DeadlineEvaluation {
  bufferMinutes: number;
  isMet: boolean;
  formattedBuffer: string;
  urgency: "comfortable" | "tight" | "critical" | "missed";
}

/**
 * Calculates buffer in minutes between arrival time and user deadline
 * buffer = deadline - arrivalTime
 * Positive means arrives before deadline.
 * Negative means arrival time is after deadline.
 */
export function calculateDeadlineBufferMinutes(
  arrivalTimeISO: string,
  deadlineISO: string
): number {
  let deadlineMs = new Date(deadlineISO).getTime();
  if (isNaN(deadlineMs) && deadlineISO && deadlineISO.includes(":")) {
    // Handle HH:mm or HH:mm:ss format by attaching the arrival date
    const datePart = arrivalTimeISO.split("T")[0];
    const timeWithSec = deadlineISO.length === 5 ? `${deadlineISO}:00` : deadlineISO;
    deadlineMs = new Date(`${datePart}T${timeWithSec}+05:30`).getTime();
  }
  const arrival = new Date(arrivalTimeISO).getTime();
  return Math.floor((deadlineMs - arrival) / (60 * 1000));
}

/**
 * Evaluates deadline compliance and human-readable formatting
 */
export function evaluateDeadlineToArrival(
  arrivalTimeISO: string,
  deadlineISO: string
): DeadlineEvaluation {
  const bufferMinutes = calculateDeadlineBufferMinutes(arrivalTimeISO, deadlineISO);
  const isMet = bufferMinutes >= 0;

  const absMinutes = Math.abs(bufferMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;

  const durationStr =
    hours > 0 ? (minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`) : `${minutes}m`;

  const formattedBuffer = isMet
    ? `${durationStr} before deadline`
    : `${durationStr} past deadline`;

  let urgency: DeadlineEvaluation["urgency"] = "comfortable";
  if (!isMet) {
    urgency = "missed";
  } else if (bufferMinutes < 45) {
    urgency = "critical";
  } else if (bufferMinutes < 120) {
    urgency = "tight";
  }

  return {
    bufferMinutes,
    isMet,
    formattedBuffer,
    urgency,
  };
}
