import { Request } from "express";

/**
 * Extracts request ID from request object
 */
export function getRequestId(req: Request): string {
  return (req as Request & { requestId?: string }).requestId || "unknown";
}
