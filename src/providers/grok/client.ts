import OpenAI from "openai";
import { OpenAICompatibleProvider } from "../openaiCompatibleProvider";
import { ModelConfig } from "../types";
import { GROK_MODELS, DEFAULT_GROK_MODEL } from "./models";
import { getModelConfigWithValidation } from "../helpers/modelConfigHelper";

// Grok uses OpenAI-compatible API
const grok = new OpenAI({
  apiKey: process.env.GROK_API_KEY!,
  baseURL: "https://api.x.ai/v1",
});

export class GrokProvider extends OpenAICompatibleProvider {
  protected get defaultModel(): string {
    return DEFAULT_GROK_MODEL;
  }

  constructor() {
    super();
    this.model = this.defaultModel;
  }

  protected getModelConfig(modelName: string): ModelConfig {
    return getModelConfigWithValidation(modelName, GROK_MODELS, "Grok");
  }

  protected getClient(): OpenAI {
    return grok;
  }

  protected getProviderName(): string {
    return "Grok";
  }
}
