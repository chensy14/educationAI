import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

async function loadEnvFile() {
  const envPath = path.join(rootDir, ".env.local");
  const raw = await readFile(envPath, "utf8");

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex < 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    process.env[key] = value;
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set.`);
  }

  return value;
}

function parseYesNo(value) {
  return value === "yes";
}

async function readCsv(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  const content = await readFile(absolutePath, "utf8");
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
  });
}

function buildCuratedTopics() {
  return [
    {
      school_level: "초등학교",
      grade: "4학년",
      subject: "수학",
      unit_title: "평면에서 점의 이동",
      standard_code: "[4 수 03-05]",
      summary:
        "평면에서 점의 이동은 격자를 따라 위, 아래, 오른쪽, 왼쪽으로 몇 칸 또는 몇 cm 이동하는 수준에서 다루며, 위치와 방향을 함께 설명하는 데 초점을 둔다.",
      source_type: "resource",
      source_url: "https://www.edunet.net/clssFlTbl/list/18",
      confidence: "high",
    },
    {
      school_level: "초등학교",
      grade: "4학년",
      subject: "수학",
      unit_title: "컴퍼스를 이용하여 여러 가지 크기의 원 그리기",
      standard_code: "[4 수 03-07]",
      summary: "컴퍼스를 이용하여 여러 가지 크기의 원을 그리고, 중심과 반지름 개념을 함께 익히는 주제다.",
      source_type: "resource",
      source_url: "https://www.edunet.net/clssFlTbl/list/18",
      confidence: "high",
    },
    {
      school_level: "초등학교",
      grade: "4학년",
      subject: "수학",
      unit_title: "그림그래프와 막대그래프로 나타내고 해석하기",
      standard_code: "[4 수 04-01]",
      summary: "자료를 수집하여 그림그래프와 막대그래프로 나타내고, 그래프를 해석하는 활동을 다루는 주제다.",
      source_type: "resource",
      source_url: "https://www.edunet.net/clssFlTbl/list/18",
      confidence: "high",
    },
    {
      school_level: "초등학교",
      grade: "4학년",
      subject: "수학",
      unit_title: "막대그래프와 꺾은선그래프에 공학 도구 활용",
      standard_code: null,
      summary: "막대그래프와 꺾은선그래프를 그릴 때 공학 도구를 활용하는 확장 활동을 다루는 주제다.",
      source_type: "resource",
      source_url: "https://www.edunet.net/clssFlTbl/list/18",
      confidence: "medium",
    },
    {
      school_level: "초등학교",
      grade: "2학년",
      subject: "국어",
      unit_title: "겪은 일을 순서대로 말하고 쓰기",
      standard_code: null,
      summary: "겪은 일을 차례가 드러나게 말하고 쓰는 활동을 중심으로 한 내부 샘플 주제다.",
      source_type: "sample",
      source_url: "https://ncic.re.kr/",
      confidence: "medium",
    },
  ];
}

function buildLessonSeedMap() {
  return {
    "4학년::수학::평면에서 점의 이동": {
      goal_points: [
        "시작 위치를 정확히 읽는다.",
        "방향과 칸 수를 함께 설명한다.",
        "최종 위치를 좌표나 말로 표현한다.",
      ],
      key_concepts: ["격자", "위치", "방향", "몇 칸 이동", "최종 위치"],
      misconceptions: ["오른쪽/왼쪽 혼동", "위/아래 혼동", "칸 수를 잘못 셈"],
      question_seeds: ["시작점에서 이동 후 위치 쓰기", "두 단계 이동 경로 설명하기"],
      feedback_seeds: ["방향을 먼저 말하게 하기", "가로 이동과 세로 이동을 분리해 설명하기"],
      ppt_seeds: ["성취기준 요약", "격자 예시", "형성평가 4문항", "오개념 점검"],
    },
    "4학년::수학::컴퍼스를 이용하여 여러 가지 크기의 원 그리기": {
      goal_points: ["컴퍼스 사용법을 익힌다.", "중심과 반지름을 구분한다.", "조건에 맞는 원을 그린다."],
      key_concepts: ["컴퍼스", "중심", "반지름", "원의 크기"],
      misconceptions: ["바늘 고정이 흔들림", "반지름 길이 유지 실패", "중심과 원 위 점 혼동"],
      question_seeds: ["반지름 길이가 다른 원 비교하기", "조건에 맞는 원 고르기"],
      feedback_seeds: ["컴퍼스 벌림을 먼저 확인하기", "중심을 표시한 뒤 그리기"],
      ppt_seeds: ["컴퍼스 사용 순서", "반지름 설명", "실습 안내", "형성평가"],
    },
    "4학년::수학::그림그래프와 막대그래프로 나타내고 해석하기": {
      goal_points: ["자료를 정리한다.", "그래프로 나타낸다.", "그래프를 읽고 해석한다."],
      key_concepts: ["자료 수집", "그림그래프", "막대그래프", "해석"],
      misconceptions: ["그림 한 개가 뜻하는 양을 놓침", "막대 높이 읽기 오류", "비교 문장 서술 부족"],
      question_seeds: ["자료를 그래프로 바꾸기", "그래프를 보고 비교 문장 쓰기"],
      feedback_seeds: ["그래프 범례를 먼저 읽게 하기", "가장 많음/적음을 문장으로 말하게 하기"],
      ppt_seeds: ["자료표", "그림그래프 예시", "막대그래프 예시", "해석 질문"],
    },
    "4학년::수학::막대그래프와 꺾은선그래프에 공학 도구 활용": {
      goal_points: ["공학 도구로 그래프를 만든다.", "그래프 표현 차이를 이해한다.", "상황에 맞는 그래프를 고른다."],
      key_concepts: ["막대그래프", "꺾은선그래프", "공학 도구", "표현 방식"],
      misconceptions: ["도구 사용 단계에만 집중", "그래프 종류 선택 이유 설명 부족"],
      question_seeds: ["상황에 맞는 그래프 고르기", "공학 도구 사용 절차 정리하기"],
      feedback_seeds: ["그래프 목적을 먼저 말하게 하기", "도구 사용과 해석을 분리해 확인하기"],
      ppt_seeds: ["도구 활용 장점", "그래프 비교", "실습 흐름", "형성평가"],
    },
    "2학년::국어::겪은 일을 순서대로 말하고 쓰기": {
      goal_points: ["겪은 일을 차례대로 말한다.", "순서를 나타내는 표현을 쓴다.", "짧은 문장으로 자연스럽게 쓴다."],
      key_concepts: ["차례", "먼저", "그리고", "마지막에", "짧은 문장"],
      misconceptions: ["시간 순서가 섞임", "연결 표현이 빠짐", "핵심 사건 없이 길게 씀"],
      question_seeds: ["문장을 순서대로 배열하기", "빈칸에 순서 표현 넣기"],
      feedback_seeds: ["무엇을 먼저 했는지 질문하기", "한 문장에 사건 하나만 담게 하기"],
      ppt_seeds: ["순서 표현 소개", "예시 사건 배열", "형성평가", "다시 쓰기 활동"],
    },
  };
}

async function main() {
  await loadEnvFile();

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseSecretKey = requireEnv("SUPABASE_SECRET_KEY");
  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const textbookRows = await readCsv("resources/edu_source_check_20260327_113100/seeds/textbook_catalog_seed.csv");
  const openAssetRows = await readCsv("resources/edu_source_check_20260327_113100/seeds/open_asset_seed.csv");
  const curatedTopics = buildCuratedTopics();
  const lessonSeedMap = buildLessonSeedMap();

  console.log(`Parsed ${textbookRows.length} textbook rows.`);
  console.log(`Parsed ${openAssetRows.length} open asset rows.`);
  console.log(`Prepared ${curatedTopics.length} curated topics.`);

  const { error: topicError } = await supabase.from("curriculum_topics").upsert(curatedTopics, {
    onConflict: "school_level,grade,subject,unit_title",
  });

  if (topicError) {
    throw topicError;
  }

  const { data: insertedTopics, error: topicSelectError } = await supabase
    .from("curriculum_topics")
    .select("id, grade, subject, unit_title")
    .in(
      "unit_title",
      curatedTopics.map((topic) => topic.unit_title),
    );

  if (topicSelectError) {
    throw topicSelectError;
  }

  const lessonSeedRows = insertedTopics.map((topic) => {
    const key = `${topic.grade}::${topic.subject}::${topic.unit_title}`;
    const seed = lessonSeedMap[key];

    if (!seed) {
      throw new Error(`Missing lesson seed for ${key}`);
    }

    return {
      topic_id: topic.id,
      ...seed,
    };
  });

  const { error: lessonSeedError } = await supabase.from("lesson_seeds").upsert(lessonSeedRows, {
    onConflict: "topic_id",
  });

  if (lessonSeedError) {
    throw lessonSeedError;
  }

  const { count: textbookCount, error: textbookCountError } = await supabase
    .from("textbook_catalog")
    .select("*", { count: "exact", head: true });

  if (textbookCountError) {
    throw textbookCountError;
  }

  if (!textbookCount) {
    const { error: textbookInsertError } = await supabase.from("textbook_catalog").insert(
      textbookRows.map((row) => ({
        school_level: row.school_level,
        school_type: row.school_type,
        title: row.title,
        publisher: row.publisher,
        author: row.author,
        grade_use: row.grade_use,
        material_type: row.material_type,
        curriculum_year: row.curriculum_year,
        source_file: row.source_file,
      })),
    );

    if (textbookInsertError) {
      throw textbookInsertError;
    }
  } else {
    console.log("Skipped textbook_catalog insert because data already exists.");
  }

  const { count: openAssetCount, error: openAssetCountError } = await supabase
    .from("open_assets")
    .select("*", { count: "exact", head: true });

  if (openAssetCountError) {
    throw openAssetCountError;
  }

  if (!openAssetCount) {
    const { error: openAssetInsertError } = await supabase.from("open_assets").insert(
      openAssetRows.map((row) => ({
        origin_site: row.origin_site,
        origin_url: row.origin_url,
        title: row.title,
        creator_or_org: row.creator_or_org,
        asset_type: row.asset_type,
        keyword: row.keyword,
        license_type: row.license_type,
        commercial_ok: parseYesNo(row.commercial_ok),
        derivative_ok: parseYesNo(row.derivative_ok),
        attribution_text: row.attribution_text,
        allow_for_mvp: parseYesNo(row.allow_for_mvp),
      })),
    );

    if (openAssetInsertError) {
      throw openAssetInsertError;
    }
  } else {
    console.log("Skipped open_assets insert because data already exists.");
  }

  console.log("Supabase seed completed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
