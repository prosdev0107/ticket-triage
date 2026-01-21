import { ProviderName, Provider } from "../providers/provider.interface";
import { createProvider } from "../providers";
import { TriageResponse } from "../types";
import { isRetryableError } from "../utils/providerFallback";
import { handleProviderError } from "../utils/errorHandler";
import { logger } from "../utils/logger";

export interface ProviderAttempt {
  provider: ProviderName;
  error: unknown;
}

export interface FallbackResult {
  success: true;
  result: TriageResponse;
  provider: ProviderName;
  attempts: ProviderAttempt[];
  providerExecutionTimeMs: number;
  totalExecutionTimeMs: number;
}

export interface FallbackFailure {
  success: false;
  attempts: ProviderAttempt[];
  lastError: unknown;
  totalExecutionTimeMs: number;
}

export type FallbackOutcome = FallbackResult | FallbackFailure;

/**
 * Tries providers in fallback order until one succeeds
 */
export async function tryProvidersWithFallback(
  providers: ProviderName[],
  subject: string,
  body: string,
  requestId: string,
  startTime: number
): Promise<FallbackOutcome> {
  const attempts: ProviderAttempt[] = [];

  for (const providerName of providers) {
    const providerStartTime = Date.now();
    try {
      const providerInstance = createProvider(providerName);
      const result = await providerInstance.triageTicket(subject, body);
      const providerExecutionTimeMs = Date.now() - providerStartTime;
      const totalExecutionTimeMs = Date.now() - startTime;

      return {
        success: true,
        result,
        provider: providerName,
        attempts,
        providerExecutionTimeMs,
        totalExecutionTimeMs,
      };
    } catch (providerError) {
      const providerExecutionTimeMs = Date.now() - providerStartTime;

      if (isRetryableError(providerError)) {
        attempts.push({ provider: providerName, error: providerError });
        logger.warn("Provider failed (retryable), trying next", {
          requestId,
          provider: providerName,
          providerExecutionTimeMs,
          error:
            providerError instanceof Error
              ? providerError.message
              : String(providerError),
        });
        continue;
      } else {
        // Non-retryable error - return immediately
        const apiError = handleProviderError(providerError, providerName);
        const totalExecutionTimeMs = Date.now() - startTime;

        logger.error("Provider failed (non-retryable)", {
          requestId,
          provider: providerName,
          providerExecutionTimeMs,
          totalExecutionTimeMs,
          errorCode: apiError.code,
          error: apiError.message,
          details: apiError.details,
        });

        // Throw to be handled by caller
        throw { apiError, providerName, totalExecutionTimeMs };
      }
    }
  }

  // All providers failed
  const totalExecutionTimeMs = Date.now() - startTime;
  return {
    success: false,
    attempts,
    lastError: attempts[attempts.length - 1]?.error || new Error("All providers failed"),
    totalExecutionTimeMs,
  };
}
