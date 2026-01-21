import OpenAI from "openai";
import { OpenAICompatibleProvider } from "../openaiCompatibleProvider";
import { ModelConfig } from "../types";
import { OPENAI_MODELS, DEFAULT_OPENAI_MODEL } from "./models";
import { getModelConfigWithValidation } from "../helpers/modelConfigHelper";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export class OpenAIProvider extends OpenAICompatibleProvider {
  protected get defaultModel(): string {
    return DEFAULT_OPENAI_MODEL;
  }

  constructor() {
    super();
    this.model = this.defaultModel;
  }

  protected getModelConfig(modelName: string): ModelConfig {
    return getModelConfigWithValidation(modelName, OPENAI_MODELS, "OpenAI");
  }

  protected getClient(): OpenAI {
    return openai;
  }

  protected getProviderName(): string {
    return "OpenAI";
  }
}
