"use server";

import { createProvider } from "@/lib/ai";
import { REFERENCE_RECOMMEND_PROMPT, REFERENCE_SEARCH_PROMPT } from "@/lib/prompts";
import { generateText } from "ai";

export async function referenceAction(args: {
  apiKey: string;
  model: string;
  mode: "search" | "recommend";
  inputText: string;
}) {
  const provider = createProvider(args.apiKey);
  const result = await generateText({
    model: provider(args.model),
    system: args.mode === "search" ? REFERENCE_SEARCH_PROMPT : REFERENCE_RECOMMEND_PROMPT,
    prompt: args.inputText,
  });
  return result.text;
}
