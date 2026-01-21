import { Router, Request, Response } from "express";
import { ProviderName } from "../providers";
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from "../constants/errors";
import { validateRequired } from "../utils/validation";
import { handleProviderError } from "../utils/errorHandler";
import { logger } from "../utils/logger";
import { getRequestId } from "../utils/requestHelpers";
import {
  sendValidationError,
  sendProviderError,
  sendUnexpectedError,
} from "../utils/responseHelpers";
import {
  tryProvidersWithFallback,
  FallbackResult,
} from "../services/providerFallbackService";

export const triageRouter = Router();

/**
 * Fallback order for providers. Tries providers in this order until one succeeds.
 */
const FALLBACK_ORDER: ProviderName[] = ["openai", "gemini", "grok"];

/**
 * Validates request body and returns validated data or throws
 */
function validateRequest(body: unknown): { subject: string; body: string } {
  const { subject, body: bodyText } = body as { subject?: unknown; body?: unknown };
  validateRequired(subject, "subject");
  validateRequired(bodyText, "body");
  return { subject: subject as string, body: bodyText as string };
}

/**
 * Logs successful triage result
 */
function logSuccess(
  requestId: string,
  result: FallbackResult,
  hadFallback: boolean
): void {
  const logData = {
    requestId,
    provider: result.provider,
    providerExecutionTimeMs: result.providerExecutionTimeMs,
    totalExecutionTimeMs: result.totalExecutionTimeMs,
    inputTokens: result.result.usage.inputTokens,
    outputTokens: result.result.usage.outputTokens,
    costUSD: result.result.usage.costUSD,
    category: result.result.category,
    priority: result.result.priority,
  };

  if (hadFallback) {
    const attemptedProviders = result.attempts.map((a) => a.provider).join(", ");
    logger.info("Provider fallback succeeded", {
      ...logData,
      attemptedProviders,
      successfulProvider: result.provider,
    });
  } else {
    logger.info("Triage ticket processed successfully", logData);
  }
}

async function handleTriageTicket(req: Request, res: Response): Promise<void> {
  const requestId = getRequestId(req);
  const startTime = Date.now();

  try {
    logger.info("Processing triage ticket request", {
      requestId,
      subjectLength: (req.body?.subject as string)?.length || 0,
      bodyLength: (req.body?.body as string)?.length || 0,
    });

    // Validate request
    let validatedData: { subject: string; body: string };
    try {
      validatedData = validateRequest(req.body);
    } catch (validationError) {
      const executionTimeMs = Date.now() - startTime;
      logger.warn("Validation failed", {
        requestId,
        error:
          validationError instanceof Error
            ? validationError.message
            : String(validationError),
        executionTimeMs,
      });
      sendValidationError(res, validationError, requestId);
      return;
    }

    // Try providers with fallback
    try {
      const outcome = await tryProvidersWithFallback(
        FALLBACK_ORDER,
        validatedData.subject,
        validatedData.body,
        requestId,
        startTime
      );

      if (outcome.success) {
        logSuccess(requestId, outcome, outcome.attempts.length > 0);
        // Include which provider was used in the response
        res.json({
          ...outcome.result,
          used_provider: outcome.provider,
        });
        return;
      } else {
        // All providers failed
        const allProvidersFailed = outcome.attempts
          .map((a) => a.provider)
          .join(", ");
        const apiError = handleProviderError(
          outcome.lastError,
          allProvidersFailed
        );

        logger.error("All providers failed", {
          requestId,
          attemptedProviders: allProvidersFailed,
          totalExecutionTimeMs: outcome.totalExecutionTimeMs,
          errorCode: apiError.code,
          error: apiError.message,
          details: apiError.details,
        });

        res.status(apiError.status).json({
          error: "All LLM providers failed",
          code: ERROR_CODES.LLM_PROVIDER_FAILED,
          details: `Attempted providers: ${allProvidersFailed}. Last error: ${apiError.details}`,
        });
      }
    } catch (nonRetryableError: unknown) {
      // Non-retryable error thrown from tryProvidersWithFallback
      if (
        nonRetryableError &&
        typeof nonRetryableError === "object" &&
        "apiError" in nonRetryableError
      ) {
        const { apiError } = nonRetryableError as {
          apiError: ReturnType<typeof handleProviderError>;
          providerName: string;
          totalExecutionTimeMs: number;
        };
        sendProviderError(res, apiError, requestId);
        return;
      }
      throw nonRetryableError;
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    const totalExecutionTimeMs = Date.now() - startTime;

    logger.error("Unexpected error in triage handler", {
      requestId,
      totalExecutionTimeMs,
      error: error.message,
      stack: error.stack,
    });

    sendUnexpectedError(res, error, requestId);
  }
}

triageRouter.post("/triage-ticket", handleTriageTicket);
