import { Provider } from "./provider.interface";
import { TriageResponse } from "../types";
import { ModelConfig } from "./types";

/**
 * Base provider class implementing common functionality
 * Follows Template Method pattern for code reuse
 */
export abstract class BaseProvider implements Provider {
  protected model: string;
  protected abstract get defaultModel(): string;
  protected abstract getModelConfig(modelName: string): ModelConfig;

  constructor() {
    // Model will be initialized by subclass constructor
    this.model = "";
  }

  setModel(model: string): void {
    this.getModelConfig(model); // Validate model exists
    this.model = model;
  }

  protected calculateCost(inputTokens: number, outputTokens: number): number {
    const config = this.getModelConfig(this.model);
    const inputCost = (inputTokens / 1_000_000) * config.inputCostPer1M;
    const outputCost = (outputTokens / 1_000_000) * config.outputCostPer1M;
    return Number((inputCost + outputCost).toFixed(6));
  }

  protected buildResponse(
    parsed: {
      category: string;
      priority: string;
      flags: Record<string, boolean>;
    },
    inputTokens: number,
    outputTokens: number
  ): TriageResponse {
    return {
      ...parsed,
      usage: {
        inputTokens,
        outputTokens,
        costUSD: this.calculateCost(inputTokens, outputTokens),
      },
    };
  }

  abstract triageTicket(subject: string, body: string): Promise<TriageResponse>;
}
