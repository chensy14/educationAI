import { NextResponse } from "next/server";
import { z } from "zod";

import { SUBJECT_OPTIONS } from "@/lib/subjects";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { buildSupportMessage, getPendingUnitOptions, type UnitOption } from "@/lib/unit-options";

export const runtime = "nodejs";

const subjectEnumOptions = [...SUBJECT_OPTIONS] as [typeof SUBJECT_OPTIONS[number], ...typeof SUBJECT_OPTIONS[number][]];

const querySchema = z.object({
  grade: z.string().min(1),
  subject: z.enum(subjectEnumOptions),
});

function buildSourceNote(sourceType: string, standardCode: string | null) {
  if (sourceType === "resource") {
    return standardCode ? `${standardCode} · 공개 리소스 기반` : "공개 리소스 기반";
  }

  if (sourceType === "sample") {
    return "원본 다운로드 완료 기반 초기 큐레이션 샘플";
  }

  return undefined;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = querySchema.parse({
      grade: url.searchParams.get("grade"),
      subject: url.searchParams.get("subject"),
    });

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("curriculum_topics")
      .select("unit_title, source_type, standard_code")
      .eq("grade", parsed.grade)
      .eq("subject", parsed.subject)
      .order("unit_title");

    if (error) {
      throw error;
    }

    const options: UnitOption[] =
      data && data.length > 0
        ? data.map((item) => ({
            value: item.unit_title,
            label: item.unit_title,
            source: item.source_type === "sample" ? "sample" : "resource",
            note: buildSourceNote(item.source_type, item.standard_code),
          }))
        : getPendingUnitOptions();

    return NextResponse.json({
      ok: true,
      options,
      supportMessage: buildSupportMessage(options),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, message: "학년 또는 과목 입력이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    console.error(error);

    const options = getPendingUnitOptions();
    return NextResponse.json(
      {
        ok: false,
        options,
        supportMessage: buildSupportMessage(options),
        message: "단원 목록을 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
