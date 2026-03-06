import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export function createProvider(apiKey: string) {
  return createOpenRouter({ apiKey });
}
