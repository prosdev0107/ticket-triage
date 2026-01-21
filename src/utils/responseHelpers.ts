import { Response } from "express";
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from "../constants/errors";
import { ApiError } from "./errorHandler";

/**
 * Sends a validation error response
 */
export function sendValidationError(
  res: Response,
  error: unknown,
  requestId: string
): void {
  const errorMessage =
    error instanceof Error ? error.message : ERROR_MESSAGES.MISSING_SUBJECT_OR_BODY;

  res.status(HTTP_STATUS.BAD_REQUEST).json({
    error: errorMessage,
    code: ERROR_CODES.MISSING_SUBJECT_OR_BODY,
  });
}

/**
 * Sends a provider error response
 */
export function sendProviderError(
  res: Response,
  apiError: ApiError,
  requestId: string
): void {
  res.status(apiError.status).json({
    error: apiError.message,
    code: apiError.code,
    details: apiError.details,
  });
}

/**
 * Sends an unexpected error response
 */
export function sendUnexpectedError(
  res: Response,
  error: Error,
  requestId: string
): void {
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: ERROR_MESSAGES.LLM_PROVIDER_FAILED,
    code: ERROR_CODES.LLM_PROVIDER_FAILED,
    details: error.message,
  });
}
