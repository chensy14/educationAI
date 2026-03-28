import { NextResponse } from "next/server";
import { z } from "zod";

import { generateLessonDeck, type Difficulty, type Purpose, type Subject } from "@/lib/lesson-generator";
import { buildMarkdown } from "@/lib/markdown";
import { buildPptxBuffer } from "@/lib/pptx";

export const runtime = "nodejs";

const requestSchema = z.object({
  grade: z.string().min(1),
  subject: z.enum(["국어", "수학", "사회", "과학", "영어"] satisfies [Subject, ...Subject[]]),
  unit: z.string().min(1).max(80),
  purpose: z.enum(["도입", "형성평가", "복습", "재수업"] satisfies [Purpose, ...Purpose[]]),
  difficulty: z.enum(["쉬움", "보통", "도전"] satisfies [Difficulty, ...Difficulty[]]),
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
    const deck = generateLessonDeck(parsed);
    const markdown = buildMarkdown(parsed, deck);
    const pptxBuffer = await buildPptxBuffer(parsed, deck);
    const fileStem = slugify(`${parsed.grade}-${parsed.subject}-${parsed.unit || "lesson"}`);

    return NextResponse.json({
      ok: true,
      input: parsed,
      lesson: deck,
      files: {
        markdownFileName: `${fileStem}.md`,
        markdown,
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
