import { createProvider } from "@/lib/ai";
import { TERM_GLOSSARY_TEXT } from "@/lib/glossary";
import {
  POLISH_EDITOR_PROMPT,
  POLISH_REFINE_PROMPT,
  POLISH_TRANSLATE_PROMPT,
  REFERENCE_RECOMMEND_PROMPT,
  REFERENCE_SEARCH_PROMPT,
  WRITING_PROMPT,
} from "@/lib/prompts";
import { EditorReview, PolishResult, Reference } from "@/types";
import { generateText } from "ai";
import { z } from "zod";

const bodySchema = z.object({
  type: z.enum(["polish", "writing", "references"]),
  apiKey: z.string().min(1),
  model: z.string().optional(),
  payload: z.record(z.string(), z.any()),
});

function tryParseJson<T>(raw: string): T | null {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced?.[1]) {
      try {
        return JSON.parse(fenced[1].trim()) as T;
      } catch {
        // continue with fallback
      }
    }

    const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]) as T;
      } catch {
        // continue with object fallback
      }
    }

    const objectMatch = trimmed.match(/\{[\s\S]*\}/);
    if (!objectMatch) return null;
    try {
      return JSON.parse(objectMatch[0]) as T;
    } catch {
      return null;
    }
  }
}

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ ok: false, error: "参数错误" }, { status: 400 });
  }

  const { type, apiKey, model, payload } = parsed.data;
  const provider = createProvider(apiKey);

  try {
    if (type === "polish") {
      const sourceText = String(payload.sourceText ?? "");
      const models = (payload.models as string[]) ?? [];
      const editorModel = String(payload.editorModel ?? model ?? models[0]);

      const results: PolishResult[] = [];
      for (const m of models) {
        const translation = await generateText({
          model: provider(m),
          system: POLISH_TRANSLATE_PROMPT,
          prompt: `术语表：\n${TERM_GLOSSARY_TEXT}\n\n中文原文：\n${sourceText}`,
        });

        const polished = await generateText({
          model: provider(m),
          system: POLISH_REFINE_PROMPT,
          prompt: `请润色以下英文文本：\n${translation.text}`,
        });

        results.push({
          model: m,
          translatedText: translation.text,
          polishedText: polished.text,
          status: "done",
        });
      }

      let review: EditorReview | null = null;
      if (results.length > 0 && editorModel) {
        const reviewText = await generateText({
          model: provider(editorModel),
          system: POLISH_EDITOR_PROMPT,
          prompt: JSON.stringify(
            {
              sourceText,
              outputs: results.map((r) => ({ model: r.model, polishedText: r.polishedText })),
            },
            null,
            2
          ),
        });
        review = tryParseJson<EditorReview>(reviewText.text);
      }

      return Response.json({ ok: true, data: { results, review } });
    }

    if (type === "writing") {
      const mode = String(payload.mode ?? "discussion");
      const inputSummary = String(payload.inputSummary ?? "");
      const existingDraft = String(payload.existingDraft ?? "");
      const references = String(payload.references ?? "");
      const requirements = String(payload.requirements ?? "");
      const outputLanguage = String(payload.outputLanguage ?? "en");
      const targetSections = Array.isArray(payload.targetSections)
        ? payload.targetSections.map((item) => String(item)).filter(Boolean)
        : [];
      const selectedModel = model ?? String(payload.model ?? "");

      const text = await generateText({
        model: provider(selectedModel),
        system: WRITING_PROMPT,
        prompt: `章节模式: ${mode}
输出语言: ${outputLanguage}
目标板块: ${targetSections.join("、") || "按模式自动"}

研究摘要:
${inputSummary}

用户已有内容（可为空）:
${existingDraft}

参考文献要点:
${references}

写作要求:
${requirements}`,
      });

      return Response.json({ ok: true, data: { text: text.text } });
    }

    const mode = String(payload.mode ?? "search");
    const inputText = String(payload.inputText ?? "");
    const selectedModel = model ?? String(payload.model ?? "");

    const text = await generateText({
      model: provider(selectedModel),
      system: mode === "search" ? REFERENCE_SEARCH_PROMPT : REFERENCE_RECOMMEND_PROMPT,
      prompt: `请返回 JSON 数组，每项字段包含：
title,authors,journal,year,doi,abstract,relevance,confidence(可选)。
输入内容：
${inputText}`,
    });

    const parsedReferences = tryParseJson<Reference[]>(text.text);
    return Response.json({
      ok: true,
      data: { references: parsedReferences ?? [], raw: text.text },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "请求失败";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
