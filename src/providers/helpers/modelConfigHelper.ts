import { ModelConfig } from "../types";

/**
 * Helper to get model config with consistent error messaging
 */
export function getModelConfigWithValidation(
  modelName: string,
  models: Record<string, ModelConfig>,
  providerName: string
): ModelConfig {
  const config = models[modelName];
  if (!config) {
    const availableModels = Object.keys(models).join(", ");
    throw new Error(
      `Unknown ${providerName} model: ${modelName}. Available: ${availableModels}`
    );
  }
  return config;
}
