import { z } from "zod";

import { requireGeminiEnv } from "@/lib/ai/env";
import type { AiLessonContent, LessonContext } from "@/lib/ai/types";
import type { GenerationInput } from "@/lib/lesson-generator";
import { buildGeminiHtmlDeckPrompt, buildGeminiLessonPrompt } from "@/lib/ai/prompts";

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

function extractHtml(text: string) {
  const fenced = text.match(/```html\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/i);
  if (fenced) {
    return fenced[1].trim();
  }

  const doctypeIndex = text.search(/<!doctype html>/i);
  if (doctypeIndex >= 0) {
    return text.slice(doctypeIndex).trim();
  }

  const htmlIndex = text.search(/<html[\s>]/i);
  if (htmlIndex >= 0) {
    return text.slice(htmlIndex).trim();
  }

  return text.trim();
}

function ensureHtmlDocument(html: string, title: string) {
  const trimmed = html.trim();
  if (/<!doctype html>/i.test(trimmed) || /<html[\s>]/i.test(trimmed)) {
    return trimmed;
  }

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body>
${trimmed}
</body>
</html>`;
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

function getUnitKeywords(unit: string) {
  return unit
    .split(/[,\-/·()]/)
    .flatMap((part) => part.split(/\s+/))
    .map((part) => part.trim())
    .filter((part) => part.length >= 2)
    .slice(0, 6);
}

function lessonMatchesInput(input: GenerationInput, lesson: AiLessonContent) {
  const haystack = normalizeText(
    [
      lesson.title,
      lesson.subtitle,
      lesson.topicSummary,
      ...lesson.goals,
      ...lesson.questions.flatMap((question) => [...question.prompt, ...question.answer]),
      ...lesson.retryQuestions.flatMap((question) => [...question.prompt, ...question.answer]),
    ].join(" "),
  );

  const normalizedSubject = normalizeText(input.subject);
  const normalizedGrade = normalizeText(input.grade);
  const unitKeywords = getUnitKeywords(input.unit).map(normalizeText);

  const subjectMatches = haystack.includes(normalizedSubject);
  const gradeMatches = haystack.includes(normalizedGrade) || haystack.includes(normalizeText(input.unit));
  const unitMatches = unitKeywords.some((keyword) => haystack.includes(keyword));

  return subjectMatches && gradeMatches && unitMatches;
}

async function requestGemini(apiKey: string, model: string, prompt: string, responseMimeType?: string) {
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
        ...(responseMimeType ? { responseMimeType } : {}),
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

  return rawText;
}

async function requestLesson(apiKey: string, model: string, prompt: string) {
  const rawText = await requestGemini(apiKey, model, prompt, "application/json");

  const parsed = lessonSchema.parse(JSON.parse(extractJson(rawText)));

  return parsed;
}

export async function generateLessonWithGemini(input: GenerationInput, context: LessonContext): Promise<AiLessonContent> {
  const { apiKey, model } = requireGeminiEnv();
  const basePrompt = buildGeminiLessonPrompt(input, context);

  const firstAttempt = await requestLesson(apiKey, model, basePrompt);
  if (lessonMatchesInput(input, firstAttempt)) {
    return firstAttempt;
  }

  const retryPrompt = `${basePrompt}\n\nCritical correction:\nYour previous response may have drifted to a different unit or subject. Regenerate the JSON and stay strictly on ${input.grade} ${input.subject} - ${input.unit}.`;
  const secondAttempt = await requestLesson(apiKey, model, retryPrompt);

  if (!lessonMatchesInput(input, secondAttempt)) {
    throw new Error("Gemini topic mismatch: generated content drifted away from the selected unit.");
  }

  return secondAttempt;
}

export async function generateLessonHtmlWithGemini(
  input: GenerationInput,
  lesson: AiLessonContent,
  context: LessonContext,
): Promise<string> {
  const { apiKey, model } = requireGeminiEnv();
  const prompt = buildGeminiHtmlDeckPrompt(input, lesson, context);
  const rawText = await requestGemini(apiKey, model, prompt, "text/plain");
  return ensureHtmlDocument(extractHtml(rawText), lesson.title);
}
