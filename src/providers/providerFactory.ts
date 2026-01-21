import { Provider, ProviderName } from "./provider.interface";
import { OpenAIProvider } from "./openai";
import { GeminiProvider } from "./gemini";
import { GrokProvider } from "./grok";

type ProviderConstructor = new () => Provider;

const PROVIDERS: Record<ProviderName, ProviderConstructor> = {
  openai: OpenAIProvider,
  gemini: GeminiProvider,
  grok: GrokProvider,
};

export function createProvider(providerName?: ProviderName): Provider {
  const provider = providerName || "openai";
  const ProviderClass = PROVIDERS[provider];
  
  if (!ProviderClass) {
    throw new Error(
      `Unknown provider: ${provider}. Available: ${Object.keys(PROVIDERS).join(", ")}`
    );
  }
  
  return new ProviderClass();
}
