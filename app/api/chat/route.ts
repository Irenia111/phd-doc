import { createProvider } from "@/lib/ai";
import { GEOLOGY_SYSTEM_PROMPT } from "@/lib/prompts";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    messages?: UIMessage[];
    apiKey?: string;
    model?: string;
    body?: {
      apiKey?: string;
      model?: string;
    };
  };
  const apiKey = body.apiKey ?? body.body?.apiKey ?? "";
  const model = body.model ?? body.body?.model ?? "";
  const messages = body.messages ?? [];

  if (!apiKey) {
    return new Response("Missing API key", { status: 400 });
  }
  if (!model) {
    return new Response("Missing model", { status: 400 });
  }
  if (!messages.length) {
    return new Response("Missing messages", { status: 400 });
  }

  const provider = createProvider(apiKey);
  const modelMessages = await convertToModelMessages(messages);
  const result = streamText({
    model: provider(model),
    system: GEOLOGY_SYSTEM_PROMPT,
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
