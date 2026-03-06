"use server";

import { createProvider } from "@/lib/ai";
import { TERM_GLOSSARY_TEXT } from "@/lib/glossary";
import { POLISH_EDITOR_PROMPT, POLISH_REFINE_PROMPT, POLISH_TRANSLATE_PROMPT } from "@/lib/prompts";
import { EditorReview, PolishResult } from "@/types";
import { generateText } from "ai";

function tryParseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function runPolishModel(args: {
  apiKey: string;
  sourceText: string;
  model: string;
}) {
  const provider = createProvider(args.apiKey);
  const translated = await generateText({
    model: provider(args.model),
    system: POLISH_TRANSLATE_PROMPT,
    prompt: `术语表:\n${TERM_GLOSSARY_TEXT}\n\n${args.sourceText}`,
  });
  const polished = await generateText({
    model: provider(args.model),
    system: POLISH_REFINE_PROMPT,
    prompt: translated.text,
  });

  return {
    model: args.model,
    translatedText: translated.text,
    polishedText: polished.text,
    status: "done",
  } satisfies PolishResult;
}

export async function runEditorReview(args: {
  apiKey: string;
  editorModel: string;
  sourceText: string;
  results: PolishResult[];
}) {
  const provider = createProvider(args.apiKey);
  const reviewResult = await generateText({
    model: provider(args.editorModel),
    system: POLISH_EDITOR_PROMPT,
    prompt: JSON.stringify(
      {
        sourceText: args.sourceText,
        outputs: args.results.map((result) => ({
          model: result.model,
          polishedText: result.polishedText,
        })),
      },
      null,
      2
    ),
  });

  return tryParseJson<EditorReview>(reviewResult.text);
}
