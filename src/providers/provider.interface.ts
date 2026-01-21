import { TriageResponse } from "../types";

export type ProviderName = "openai" | "gemini" | "grok";

export interface Provider {
  setModel(model: string): void;
  triageTicket(subject: string, body: string): Promise<TriageResponse>;
}
