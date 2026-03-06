"use server";

import { createProvider } from "@/lib/ai";
import { WRITING_PROMPT } from "@/lib/prompts";
import { generateText } from "ai";

export async function writingAction(args: {
  apiKey: string;
  model: string;
  mode: string;
  inputSummary: string;
  references: string;
  requirements: string;
  outputLanguage: string;
}) {
  const provider = createProvider(args.apiKey);
  const result = await generateText({
    model: provider(args.model),
    system: WRITING_PROMPT,
    prompt: `mode=${args.mode}\noutputLanguage=${args.outputLanguage}\n${args.inputSummary}\n${args.references}\n${args.requirements}`,
  });
  return result.text;
}
