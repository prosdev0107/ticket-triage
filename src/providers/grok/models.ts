import { ModelConfig } from "../types";

export const GROK_MODELS: Record<string, ModelConfig> = {
  "grok-4-1-fast-reasoning": {
    name: "grok-4-1-fast-reasoning",
    inputCostPer1M: 0.20, 
    outputCostPer1M: 0.50,
  },
} as const;

// Default Grok model
export const DEFAULT_GROK_MODEL: keyof typeof GROK_MODELS = "grok-4-1-fast-reasoning";
