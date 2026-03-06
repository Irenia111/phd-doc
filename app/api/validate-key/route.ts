import { createProvider } from "@/lib/ai";
import { generateText } from "ai";

export async function POST(req: Request) {
  const body = (await req.json()) as { apiKey?: string };
  const apiKey = body.apiKey?.trim() ?? "";

  if (!apiKey.startsWith("sk-or-v1-")) {
    return Response.json({ ok: false, error: "API Key 格式错误" }, { status: 400 });
  }

  try {
    const provider = createProvider(apiKey);
    await generateText({
      model: provider("google/gemini-2.0-flash-001"),
      prompt: "Reply with OK only.",
      maxOutputTokens: 8,
    });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "API Key 无效或网络不可用" }, { status: 400 });
  }
}
