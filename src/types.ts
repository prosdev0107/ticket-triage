export interface TriageRequest {
  subject: string;
  body: string;
}

export interface TriageResponse {
  category: string;
  priority: string;
  flags: Record<string, boolean>;
  usage: {
    inputTokens: number;
    outputTokens: number;
    costUSD: number;
  };
  used_provider?: string; // Which provider was used (useful when fallback occurs)
}
