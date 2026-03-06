"use server";

import { createProvider } from "@/lib/ai";
import { buildChatSystemPrompt } from "@/lib/prompts";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export async function chatAction(apiKey: string, model: string, messages: UIMessage[], references?: string) {
  const provider = createProvider(apiKey);
  const modelMessages = await convertToModelMessages(messages);
  const systemPrompt = buildChatSystemPrompt(references || undefined);
  const result = streamText({
    model: provider(model),
    system: systemPrompt,
    messages: modelMessages,
    temperature: 0.3,
  });
  return result.toUIMessageStreamResponse();
}
