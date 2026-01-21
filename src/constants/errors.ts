// HTTP Status Codes
export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  MISSING_SUBJECT_OR_BODY: "Missing subject or body",
  LLM_PROVIDER_FAILED: "LLM provider failed or returned invalid response",
  NETWORK_ERROR: "Network error occurred while connecting to the LLM provider",
  AUTHENTICATION_ERROR: "API authentication failed",
  RATE_LIMIT_ERROR: "API rate limit exceeded",
  INVALID_MODEL_ERROR: "Invalid or unsupported model",
  INVALID_RESPONSE_ERROR: "LLM provider returned an invalid response format",
  MISSING_USAGE_DATA_ERROR: "LLM provider did not return usage/token information",
  QUOTA_ERROR: "API quota exceeded or billing issue",
} as const;

// Error Codes (for API responses)
export const ERROR_CODES = {
  MISSING_SUBJECT_OR_BODY: "MISSING_SUBJECT_OR_BODY",
  LLM_PROVIDER_FAILED: "LLM_PROVIDER_FAILED",
  NETWORK_ERROR: "NETWORK_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  RATE_LIMIT_ERROR: "RATE_LIMIT_ERROR",
  INVALID_MODEL_ERROR: "INVALID_MODEL_ERROR",
  INVALID_RESPONSE_ERROR: "INVALID_RESPONSE_ERROR",
  MISSING_USAGE_DATA_ERROR: "MISSING_USAGE_DATA_ERROR",
  QUOTA_ERROR: "QUOTA_ERROR",
} as const;
