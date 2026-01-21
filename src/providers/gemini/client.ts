import { GoogleGenerativeAI } from "@google/generative-ai";
import { BaseProvider } from "../baseProvider";
import { buildTriagePrompt } from "../../prompts/triagePrompt";
import { parseJsonFromMessage } from "../../utils/jsonParser";
import { TriageResponse } from "../../types";
import { ModelConfig } from "../types";
import { GEMINI_MODELS, DEFAULT_GEMINI_MODEL } from "./models";
import { getModelConfigWithValidation } from "../helpers/modelConfigHelper";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class GeminiProvider extends BaseProvider {
  protected get defaultModel(): string {
    return DEFAULT_GEMINI_MODEL;
  }

  constructor() {
    super();
    this.model = this.defaultModel;
  }

  protected getModelConfig(modelName: string): ModelConfig {
    return getModelConfigWithValidation(modelName, GEMINI_MODELS, "Gemini");
  }

  async triageTicket(subject: string, body: string): Promise<TriageResponse> {
    try {
      const model = genAI.getGenerativeModel({ model: this.model });
      const prompt = buildTriagePrompt(subject, body);
      const result = await model.generateContent(prompt);

      if (!result.response) {
        throw new Error("Gemini API returned no response");
      }

      const message = result.response.text();
      if (!message) {
        throw new Error("Gemini API returned empty response text");
      }

      const parsed = parseJsonFromMessage(message);

      const usage = result.response.usageMetadata;
      if (!usage) {
        throw new Error("Gemini API did not return usage metadata");
      }

      return this.buildResponse(
        parsed,
        usage.promptTokenCount || 0,
        usage.candidatesTokenCount || 0
      );
    } catch (error) {
      // Re-throw with context for better error handling
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Gemini API error: ${String(error)}`);
    }
  }
}
