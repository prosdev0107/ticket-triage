/**
 * Shared types for providers
 */
export interface ModelConfig {
  name: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
}

export interface UsageMetadata {
  inputTokens: number;
  outputTokens: number;
}
