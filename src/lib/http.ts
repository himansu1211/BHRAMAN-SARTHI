import { toPublicError } from "@/lib/errors";

export function jsonError(error: unknown): Response {
  const publicError = toPublicError(error);
  return Response.json(
    { error: { code: publicError.code, message: publicError.message } },
    { status: publicError.status },
  );
}
