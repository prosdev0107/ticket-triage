import { isRetryableError, getFallbackProviders } from "../../utils/providerFallback";
import { ProviderName } from "../../providers/provider.interface";

describe("isRetryableError", () => {
  it("should return false for authentication errors", () => {
    const error = new Error("Invalid API key");
    expect(isRetryableError(error)).toBe(false);
  });

  it("should return false for unauthorized errors", () => {
    const error = new Error("Unauthorized");
    expect(isRetryableError(error)).toBe(false);
  });

  it("should return false for 401 errors", () => {
    const error = new Error("401 Unauthorized");
    expect(isRetryableError(error)).toBe(false);
  });

  it("should return false for invalid model errors", () => {
    const error = new Error("Model not found");
    expect(isRetryableError(error)).toBe(false);
  });

  it("should return true for network errors", () => {
    const error = new Error("Network error");
    expect(isRetryableError(error)).toBe(true);
  });

  it("should return true for timeout errors", () => {
    const error = new Error("Request timeout");
    expect(isRetryableError(error)).toBe(true);
  });

  it("should return true for rate limit errors", () => {
    const error = new Error("Rate limit exceeded");
    expect(isRetryableError(error)).toBe(true);
  });

  it("should return true for quota errors", () => {
    const error = new Error("Quota exceeded");
    expect(isRetryableError(error)).toBe(true);
  });

  it("should return true for generic errors", () => {
    const error = new Error("Some other error");
    expect(isRetryableError(error)).toBe(true);
  });
});

describe("getFallbackProviders", () => {
  it("should return all providers except the primary for openai", () => {
    const fallbacks = getFallbackProviders("openai");
    expect(fallbacks).toEqual(["gemini", "grok"]);
    expect(fallbacks).not.toContain("openai");
  });

  it("should return all providers except the primary for gemini", () => {
    const fallbacks = getFallbackProviders("gemini");
    expect(fallbacks).toEqual(["openai", "grok"]);
    expect(fallbacks).not.toContain("gemini");
  });

  it("should return all providers except the primary for grok", () => {
    const fallbacks = getFallbackProviders("grok");
    expect(fallbacks).toEqual(["openai", "gemini"]);
    expect(fallbacks).not.toContain("grok");
  });
});
