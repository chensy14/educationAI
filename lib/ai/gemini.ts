import { z } from "zod";

import { requireGeminiEnv } from "@/lib/ai/env";
import type { AiLessonContent, LessonContext } from "@/lib/ai/types";
import type { GenerationInput } from "@/lib/lesson-generator";
import { buildGeminiLessonPrompt } from "@/lib/ai/prompts";

const lessonSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  trustNote: z.string().optional().default("AI 생성 결과"),
  topicSummary: z.string().min(1),
  goals: z.array(z.string().min(1)).min(3).max(6),
  questions: z
    .array(
      z.object({
        title: z.string().min(1),
        prompt: z.array(z.string().min(1)).min(1).max(4),
        answer: z.array(z.string().min(1)).min(1).max(4),
      }),
    )
    .length(5),
  misconceptions: z.array(z.string().min(1)).min(3).max(6),
  feedback: z.array(z.string().min(1)).min(3).max(6),
  retryQuestions: z
    .array(
      z.object({
        title: z.string().min(1),
        prompt: z.array(z.string().min(1)).min(1).max(4),
        answer: z.array(z.string().min(1)).min(1).max(4),
      }),
    )
    .length(2),
  rubric: z.array(z.string().min(1)).min(3).max(4),
});

function extractJson(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced) {
    return fenced[1].trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  return text.trim();
}

export async function generateLessonWithGemini(input: GenerationInput, context: LessonContext): Promise<AiLessonContent> {
  const { apiKey, model } = requireGeminiEnv();
  const prompt = buildGeminiLessonPrompt(input, context);

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${errorText}`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
  };

  const rawText = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n").trim();

  if (!rawText) {
    throw new Error("Gemini returned an empty response.");
  }

  const parsed = lessonSchema.parse(JSON.parse(extractJson(rawText)));

  return parsed;
}
