import request from "supertest";
import express from "express";
import { triageRouter } from "../../routes/triage";
import { createProvider } from "../../providers";
import { Provider } from "../../providers/provider.interface";
import { TriageResponse } from "../../types";

// Mock the providers
jest.mock("../../providers", () => ({
  createProvider: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use(triageRouter);

describe("POST /triage-ticket", () => {
  let mockProvider: jest.Mocked<Provider>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProvider = {
      setModel: jest.fn(),
      triageTicket: jest.fn(),
    } as any;
    (createProvider as jest.Mock).mockReturnValue(mockProvider);
  });

  it("should return 400 if subject is missing", async () => {
    const response = await request(app)
      .post("/triage-ticket")
      .send({ body: "Test body" })
      .expect(400);

    expect(response.body).toHaveProperty("error");
    expect(response.body).toHaveProperty("code", "MISSING_SUBJECT_OR_BODY");
  });

  it("should return 400 if body is missing", async () => {
    const response = await request(app)
      .post("/triage-ticket")
      .send({ subject: "Test subject" })
      .expect(400);

    expect(response.body).toHaveProperty("error");
    expect(response.body).toHaveProperty("code", "MISSING_SUBJECT_OR_BODY");
  });

  it("should return 400 if both subject and body are missing", async () => {
    const response = await request(app)
      .post("/triage-ticket")
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty("error");
    expect(response.body).toHaveProperty("code", "MISSING_SUBJECT_OR_BODY");
  });

  it("should return 400 if subject is empty string", async () => {
    const response = await request(app)
      .post("/triage-ticket")
      .send({ subject: "", body: "Test body" })
      .expect(400);

    expect(response.body).toHaveProperty("error");
  });

  it("should return 400 if body is empty string", async () => {
    const response = await request(app)
      .post("/triage-ticket")
      .send({ subject: "Test subject", body: "" })
      .expect(400);

    expect(response.body).toHaveProperty("error");
  });

  it("should return 200 with triage result on success", async () => {
    const mockResult: TriageResponse = {
      category: "billing",
      priority: "urgent",
      flags: {
        requires_human: true,
        is_abusive: false,
        missing_info: false,
        is_vip_customer: false,
      },
      usage: {
        inputTokens: 100,
        outputTokens: 50,
        costUSD: 0.001,
      },
    };

    mockProvider.triageTicket.mockResolvedValue(mockResult);

    const response = await request(app)
      .post("/triage-ticket")
      .send({
        subject: "Payment failed",
        body: "I tried to pay but it was declined.",
      })
      .expect(200);

    expect(response.body).toEqual({
      ...mockResult,
      used_provider: "openai",
    });
    expect(mockProvider.triageTicket).toHaveBeenCalledWith(
      "Payment failed",
      "I tried to pay but it was declined."
    );
  });

  it("should try next provider if first provider fails with retryable error", async () => {
    const mockResult: TriageResponse = {
      category: "technical",
      priority: "high",
      flags: {},
      usage: {
        inputTokens: 100,
        outputTokens: 50,
        costUSD: 0.001,
      },
    };

    // First provider fails with network error (retryable)
    const networkError = new Error("Network error");
    mockProvider.triageTicket
      .mockRejectedValueOnce(networkError)
      .mockResolvedValueOnce(mockResult);

    // Mock createProvider to return different providers
    let callCount = 0;
    (createProvider as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First call fails
        const provider1 = { ...mockProvider };
        provider1.triageTicket.mockRejectedValueOnce(networkError);
        return provider1;
      } else {
        // Second call succeeds
        return mockProvider;
      }
    });

    const response = await request(app)
      .post("/triage-ticket")
      .send({
        subject: "Test",
        body: "Test body",
      })
      .expect(200);

    expect(response.body).toEqual({
      ...mockResult,
      used_provider: "gemini",
    });
  });
});
