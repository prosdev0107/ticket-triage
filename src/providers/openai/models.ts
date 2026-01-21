import { ModelConfig } from "../types";

export const OPENAI_MODELS: Record<string, ModelConfig> = {
  "gpt-4o-mini": {
    name: "gpt-4o-mini",
    inputCostPer1M: 0.15, 
    outputCostPer1M: 0.6, 
  },
} as const;

// Default OpenAI model
export const DEFAULT_OPENAI_MODEL: keyof typeof OPENAI_MODELS = "gpt-4o-mini";

