import { NextResponse } from "next/server";
import { z } from "zod";

import { generateLessonWithGemini } from "@/lib/ai/gemini";
import { generateSlidesDeckWithSlidesGpt } from "@/lib/ai/slidesgpt";
import type { AiLessonContent } from "@/lib/ai/types";
import { generateLessonDeck, type Difficulty, type Purpose, type Subject } from "@/lib/lesson-generator";
import { buildMarkdown } from "@/lib/markdown";
import { buildPptxBuffer } from "@/lib/pptx";
import { getLessonContext } from "@/lib/supabase/lesson-context";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const requestSchema = z.object({
  grade: z.string().min(1),
  subject: z.enum(["국어", "수학", "사회", "과학", "영어"] satisfies [Subject, ...Subject[]]),
  unit: z.string().min(1).max(80),
  purpose: z.enum(["도입", "형성평가", "복습", "재수업"] satisfies [Purpose, ...Purpose[]]).default("형성평가"),
  difficulty: z.enum(["쉬움", "보통", "도전"] satisfies [Difficulty, ...Difficulty[]]).default("보통"),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "")
    .slice(0, 48);
}

export async function POST(request: Request) {
  try {
    const parsed = requestSchema.parse(await request.json());
    const fileStem = slugify(`${parsed.grade}-${parsed.subject}-${parsed.unit || "lesson"}`);
    const context = await getLessonContext(parsed.grade, parsed.subject, parsed.unit);

    let lessonContent: AiLessonContent;
    let pptxBuffer: Buffer;
    let pptSourcePath = `${fileStem}.pptx`;

    try {
      lessonContent = await generateLessonWithGemini(parsed, context);
    } catch (geminiError) {
      console.error("Gemini generation failed, using local fallback for markdown/content:", geminiError);
      const fallbackDeck = generateLessonDeck(parsed);
      fallbackDeck.trustNote = "Gemini 호출 실패로 템플릿 결과를 대신 제공";
      lessonContent = {
        title: fallbackDeck.title,
        subtitle: fallbackDeck.subtitle,
        trustNote: fallbackDeck.trustNote,
        topicSummary: fallbackDeck.topicSummary,
        goals: fallbackDeck.goals,
        misconceptions: fallbackDeck.misconceptions,
        feedback: fallbackDeck.feedback,
        retryActivities: fallbackDeck.retryActivities,
        rubric: fallbackDeck.rubric,
        markdown: buildMarkdown(parsed, fallbackDeck),
      };
    }

    try {
      const slides = await generateSlidesDeckWithSlidesGpt(parsed, lessonContent, context);
      pptxBuffer = slides.buffer;
      pptSourcePath = `slidesgpt:${slides.presentation.id}`;
    } catch (slidesError) {
      console.error("SlidesGPT generation failed, using local fallback PPT:", slidesError);

      const fallbackDeck = generateLessonDeck(parsed);
      if (lessonContent.trustNote) {
        fallbackDeck.trustNote = `${lessonContent.trustNote} / SlidesGPT 실패로 로컬 PPT 사용`;
      } else {
        fallbackDeck.trustNote = "SlidesGPT 실패로 로컬 PPT 사용";
      }
      pptxBuffer = await buildPptxBuffer(parsed, fallbackDeck);
    }

    try {
      const supabase = createAdminSupabaseClient();
      const { data: job, error: jobError } = await supabase
        .from("generation_jobs")
        .insert({
          grade: parsed.grade,
          subject: parsed.subject,
          unit_title: parsed.unit,
          purpose: parsed.purpose,
          difficulty: parsed.difficulty,
        })
        .select("id")
        .single();

      if (jobError) {
        throw jobError;
      }

      const { error: outputError } = await supabase.from("generation_outputs").insert({
        job_id: job.id,
        markdown_content: lessonContent.markdown,
        pptx_storage_path: pptSourcePath,
      });

      if (outputError) {
        throw outputError;
      }
    } catch (storageError) {
      console.error("Failed to persist generation result:", storageError);
    }

    return NextResponse.json({
      ok: true,
      input: parsed,
      lesson: {
        title: lessonContent.title,
        subtitle: lessonContent.subtitle,
        trustNote: lessonContent.trustNote,
        topicSummary: lessonContent.topicSummary,
        goals: lessonContent.goals,
        misconceptions: lessonContent.misconceptions,
        feedback: lessonContent.feedback,
        retryActivities: lessonContent.retryActivities,
        rubric: lessonContent.rubric,
      },
      files: {
        markdownFileName: `${fileStem}.md`,
        markdown: lessonContent.markdown,
        pptxFileName: `${fileStem}.pptx`,
        pptxBase64: pptxBuffer.toString("base64"),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, message: "입력값을 다시 확인해 주세요.", issues: error.flatten() },
        { status: 400 },
      );
    }

    console.error(error);
    return NextResponse.json({ ok: false, message: "결과물 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
