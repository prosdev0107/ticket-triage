import { ProviderName } from "../providers/provider.interface";

/**
 * Determines if an error is retryable with a fallback provider.
 * Non-retryable errors include authentication and invalid model errors,
 * as these would likely fail with all providers.
 */
export function isRetryableError(error: unknown): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorString = errorMessage.toLowerCase();

  // Non-retryable errors (would fail with all providers)
  if (
    errorString.includes("api key") ||
    errorString.includes("authentication") ||
    errorString.includes("unauthorized") ||
    errorString.includes("401") ||
    errorString.includes("invalid api key") ||
    (errorString.includes("model") && (errorString.includes("not found") || errorString.includes("404") || errorString.includes("unknown")))
  ) {
    return false;
  }

  // Retryable errors (might succeed with another provider)
  // Includes: network errors, rate limits, quota errors, invalid responses, etc.
  return true;
}

/**
 * Gets the fallback chain for a given provider.
 * Returns an array of providers to try in order, excluding the primary provider.
 * This function is kept for potential future use, but the main fallback logic
 * is now handled directly in the route handler with a fixed order.
 */
export function getFallbackProviders(primaryProvider: ProviderName): ProviderName[] {
  const allProviders: ProviderName[] = ["openai", "gemini", "grok"];
  return allProviders.filter((p) => p !== primaryProvider);
}
