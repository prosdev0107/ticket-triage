import { Request, Response, NextFunction } from "express";
import { generateRequestId, logger } from "../utils/logger";

/**
 * Middleware to add request ID and track execution time
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = generateRequestId();
  const startTime = Date.now();

  // Add request ID to request object for use in route handlers
  (req as Request & { requestId: string }).requestId = requestId;

  // Log incoming request
  logger.info("Incoming request", {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  // Track response
  const originalSend = res.send;
  res.send = function (body) {
    const executionTimeMs = Date.now() - startTime;

    // Log response
    logger.info("Request completed", {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      executionTimeMs,
    });

    return originalSend.call(this, body);
  };

  next();
}
