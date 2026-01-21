import { BaseProvider } from "../../providers/baseProvider";
import { ModelConfig } from "../../providers/types";

// Create a concrete implementation for testing
class TestProvider extends BaseProvider {
  protected get defaultModel(): string {
    return "test-model";
  }

  protected getModelConfig(modelName: string): ModelConfig {
    const configs: Record<string, ModelConfig> = {
      "test-model": {
        name: "test-model",
        inputCostPer1M: 1.0,
        outputCostPer1M: 2.0,
      },
    };
    const config = configs[modelName];
    if (!config) {
      throw new Error(`Unknown model: ${modelName}`);
    }
    return config;
  }

  async triageTicket(subject: string, body: string): Promise<any> {
    return { category: "test", priority: "normal" };
  }
}

describe("BaseProvider", () => {
  let provider: TestProvider;

  beforeEach(() => {
    provider = new TestProvider();
  });

  describe("calculateCost", () => {
    beforeEach(() => {
      // Set the model before calculating cost
      provider.setModel("test-model");
    });

    it("should calculate cost correctly for 1M input tokens", () => {
      const cost = (provider as any).calculateCost(1_000_000, 0);
      expect(cost).toBe(1.0);
    });

    it("should calculate cost correctly for 1M output tokens", () => {
      const cost = (provider as any).calculateCost(0, 1_000_000);
      expect(cost).toBe(2.0);
    });

    it("should calculate cost correctly for both input and output tokens", () => {
      const cost = (provider as any).calculateCost(1_000_000, 1_000_000);
      expect(cost).toBe(3.0);
    });

    it("should calculate cost correctly for partial tokens", () => {
      const cost = (provider as any).calculateCost(500_000, 250_000);
      expect(cost).toBe(1.0); // (0.5 * 1.0) + (0.25 * 2.0) = 0.5 + 0.5 = 1.0
    });

    it("should round to 6 decimal places", () => {
      const cost = (provider as any).calculateCost(123, 456);
      // (123/1M * 1.0) + (456/1M * 2.0) = 0.000123 + 0.000912 = 0.001035
      expect(cost).toBe(0.001035);
    });
  });

  describe("setModel", () => {
    it("should set model if valid", () => {
      provider.setModel("test-model");
      expect(provider["model"]).toBe("test-model");
    });

    it("should throw error for invalid model", () => {
      expect(() => provider.setModel("invalid-model")).toThrow("Unknown model: invalid-model");
    });
  });
});
