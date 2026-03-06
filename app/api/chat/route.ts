import { createProvider } from "@/lib/ai";
import { buildChatSystemPrompt } from "@/lib/prompts";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    messages?: UIMessage[];
    apiKey?: string;
    model?: string;
    references?: string;
    body?: {
      apiKey?: string;
      model?: string;
      references?: string;
    };
  };
  const apiKey = body.apiKey ?? body.body?.apiKey ?? "";
  const model = body.model ?? body.body?.model ?? "";
  const references = body.references ?? body.body?.references ?? "";
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
  const systemPrompt = buildChatSystemPrompt(references || undefined);
  const result = streamText({
    model: provider(model),
    system: systemPrompt,
    messages: modelMessages,
    temperature: 0.3,
  });

  return result.toUIMessageStreamResponse();
}
