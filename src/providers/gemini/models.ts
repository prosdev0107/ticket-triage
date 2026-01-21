import { ModelConfig } from "../types";

export const GEMINI_MODELS: Record<string, ModelConfig> = {
  "gemini-2.5-pro": {
    name: "gemini-2.5-pro",
    inputCostPer1M: 1.25, 
    outputCostPer1M: 10.00,
  },
} as const;

// Default Gemini model
export const DEFAULT_GEMINI_MODEL: keyof typeof GEMINI_MODELS = "gemini-2.5-pro";

