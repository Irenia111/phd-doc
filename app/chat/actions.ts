"use server";

import { createProvider } from "@/lib/ai";
import { GEOLOGY_SYSTEM_PROMPT } from "@/lib/prompts";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export async function chatAction(apiKey: string, model: string, messages: UIMessage[]) {
  const provider = createProvider(apiKey);
  const modelMessages = await convertToModelMessages(messages);
  const result = streamText({
    model: provider(model),
    system: GEOLOGY_SYSTEM_PROMPT,
    messages: modelMessages,
  });
  return result.toUIMessageStreamResponse();
}
