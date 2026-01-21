import OpenAI from "openai";
import { BaseProvider } from "./baseProvider";
import { buildTriagePrompt } from "../prompts/triagePrompt";
import { parseJsonFromMessage } from "../utils/jsonParser";
import { TriageResponse } from "../types";
import { ModelConfig } from "./types";

/**
 * Base class for OpenAI-compatible providers (OpenAI and Grok)
 * Reduces code duplication between OpenAI and Grok providers
 */
export abstract class OpenAICompatibleProvider extends BaseProvider {
  protected abstract getClient(): OpenAI;
  protected abstract getProviderName(): string;

  async triageTicket(subject: string, body: string): Promise<TriageResponse> {
    try {
      const client = this.getClient();
      const completion = await client.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: buildTriagePrompt(subject, body) }],
        temperature: 0,
      });

      if (!completion.choices || completion.choices.length === 0) {
        throw new Error(`${this.getProviderName()} API returned no completion choices`);
      }

      const message = completion.choices[0].message.content;
      if (!message) {
        throw new Error(`${this.getProviderName()} API returned empty message content`);
      }

      const parsed = parseJsonFromMessage(message);

      if (!completion.usage) {
        throw new Error(`${this.getProviderName()} API did not return usage information`);
      }

      return this.buildResponse(
        parsed,
        completion.usage.prompt_tokens,
        completion.usage.completion_tokens
      );
    } catch (error) {
      // Re-throw with context for better error handling
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`${this.getProviderName()} API error: ${String(error)}`);
    }
  }
}
