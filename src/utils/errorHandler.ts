import { HTTP_STATUS, ERROR_MESSAGES, ERROR_CODES } from "../constants/errors";
import { classifyError } from "./errorPatterns";

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: string;
}

/**
 * Classifies and formats errors from LLM providers
 * Uses pattern matching for cleaner, more maintainable error classification
 */
export function handleProviderError(error: unknown, providerName: string): ApiError {
  const classified = classifyError(error, providerName);
  
  if (classified) {
    return classified;
  }

  // Generic provider error fallback
  const errorMessage = error instanceof Error ? error.message : String(error);
  return {
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: ERROR_CODES.LLM_PROVIDER_FAILED,
    message: ERROR_MESSAGES.LLM_PROVIDER_FAILED,
    details: `${providerName} error: ${errorMessage}`,
  };
}
