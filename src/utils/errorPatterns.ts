import { HTTP_STATUS, ERROR_MESSAGES, ERROR_CODES } from "../constants/errors";
import { ApiError } from "./errorHandler";

export interface ErrorPattern {
  keywords: string[];
  status: number;
  code: string;
  message: string;
  getDetails: (providerName: string, errorMessage: string) => string;
}

/**
 * Error classification patterns in priority order
 */
export const ERROR_PATTERNS: ErrorPattern[] = [
  {
    keywords: ["network", "connection", "timeout", "econnrefused", "enotfound"],
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: ERROR_CODES.NETWORK_ERROR,
    message: ERROR_MESSAGES.NETWORK_ERROR,
    getDetails: (providerName) =>
      `Failed to connect to ${providerName} API. Please check your network connection.`,
  },
  {
    keywords: ["api key", "authentication", "unauthorized", "401", "invalid api key"],
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: ERROR_CODES.AUTHENTICATION_ERROR,
    message: ERROR_MESSAGES.AUTHENTICATION_ERROR,
    getDetails: (providerName) =>
      `${providerName} API authentication failed. Please check your API key.`,
  },
  {
    keywords: ["rate limit", "429", "too many requests"],
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: ERROR_CODES.RATE_LIMIT_ERROR,
    message: ERROR_MESSAGES.RATE_LIMIT_ERROR,
    getDetails: (providerName) =>
      `${providerName} API rate limit exceeded. Please try again later.`,
  },
  {
    keywords: ["model", "not found", "404", "unknown"],
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: ERROR_CODES.INVALID_MODEL_ERROR,
    message: ERROR_MESSAGES.INVALID_MODEL_ERROR,
    getDetails: (_providerName, errorMessage) => errorMessage,
  },
  {
    keywords: ["json", "parse", "invalid response", "syntaxerror"],
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: ERROR_CODES.INVALID_RESPONSE_ERROR,
    message: ERROR_MESSAGES.INVALID_RESPONSE_ERROR,
    getDetails: (providerName) =>
      `${providerName} returned an invalid response format.`,
  },
  {
    keywords: ["usage", "metadata"],
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: ERROR_CODES.MISSING_USAGE_DATA_ERROR,
    message: ERROR_MESSAGES.MISSING_USAGE_DATA_ERROR,
    getDetails: (providerName) =>
      `${providerName} did not return usage/token information.`,
  },
  {
    keywords: ["quota", "billing", "insufficient", "payment"],
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: ERROR_CODES.QUOTA_ERROR,
    message: ERROR_MESSAGES.QUOTA_ERROR,
    getDetails: (providerName) =>
      `${providerName} API quota exceeded or billing issue.`,
  },
];

/**
 * Checks if error message matches any keywords in the pattern
 */
function matchesPattern(errorString: string, pattern: ErrorPattern): boolean {
  return pattern.keywords.some((keyword) => errorString.includes(keyword));
}

/**
 * Classifies error using pattern matching
 */
export function classifyError(
  error: unknown,
  providerName: string
): ApiError | null {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorString = errorMessage.toLowerCase();

  for (const pattern of ERROR_PATTERNS) {
    if (matchesPattern(errorString, pattern)) {
      return {
        status: pattern.status,
        code: pattern.code,
        message: pattern.message,
        details: pattern.getDetails(providerName, errorMessage),
      };
    }
  }

  return null;
}
