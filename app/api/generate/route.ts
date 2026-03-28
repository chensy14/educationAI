import { NextResponse } from "next/server";
import { z } from "zod";

import { generateLessonWithGemini } from "@/lib/ai/gemini";
import { generateSlidesDeckWithSlidesGpt } from "@/lib/ai/slidesgpt";
import type { AiLessonContent } from "@/lib/ai/types";
import { type Difficulty, type Purpose, type Subject } from "@/lib/lesson-generator";
import { buildMarkdown } from "@/lib/markdown";
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

    const lessonContent: AiLessonContent = await generateLessonWithGemini(parsed, context);
    const markdown = buildMarkdown(parsed, lessonContent);
    const slides = await generateSlidesDeckWithSlidesGpt(parsed, lessonContent, context);
    const pptxBuffer = slides.buffer;
    const pptSourcePath = `slidesgpt:${slides.presentation.id}`;

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
        markdown_content: markdown,
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
        questions: lessonContent.questions,
        misconceptions: lessonContent.misconceptions,
        feedback: lessonContent.feedback,
        retryQuestions: lessonContent.retryQuestions,
        rubric: lessonContent.rubric,
      },
      files: {
        markdown: markdown,
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

    if (error instanceof Error) {
      const message = error.message;

      if (message.includes("is not set")) {
        return NextResponse.json(
          { ok: false, message: "배포 환경변수가 설정되지 않았습니다. Vercel 환경변수를 다시 확인해 주세요." },
          { status: 500 },
        );
      }

      if (message.includes("Gemini request failed")) {
        return NextResponse.json(
          { ok: false, message: "Gemini 생성이 실패했습니다. 잠시 후 다시 시도해 주세요." },
          { status: 502 },
        );
      }

      if (message.includes("SlidesGPT")) {
        return NextResponse.json(
          { ok: false, message: "SlidesGPT PPT 생성이 실패했습니다. 잠시 후 다시 시도해 주세요." },
          { status: 502 },
        );
      }

      if (message.includes("fetch failed")) {
        return NextResponse.json(
          { ok: false, message: "외부 AI 서비스 연결에 실패했습니다. 잠시 후 다시 시도해 주세요." },
          { status: 502 },
        );
      }
    }

    console.error(error);
    return NextResponse.json({ ok: false, message: "결과물 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
