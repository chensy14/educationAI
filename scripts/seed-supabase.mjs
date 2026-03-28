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

function buildTopicKey(grade, subject, unitTitle) {
  return `${grade}::${subject}::${unitTitle}`;
}

function tokenizeUnitTitle(unitTitle) {
  return Array.from(
    new Set(
      unitTitle
        .replace(/[()]/g, " ")
        .split(/[\s,·/]+/)
        .map((token) => token.trim())
        .filter((token) => token.length >= 2),
    ),
  ).slice(0, 5);
}

function buildGenericSeed(topic) {
  const keywords = tokenizeUnitTitle(topic.unit_title);
  const bySubject = {
    통합교과: {
      misconceptions: ["생활 경험과 학습 내용을 연결하지 못함", "활동 순서를 놓침", "주변 사례 설명이 짧아짐"],
      feedback: ["친숙한 장면부터 떠올리게 하기", "탐색-표현-실천 흐름으로 정리하게 하기", "생활 맥락을 먼저 말하게 하기"],
      ppt: ["생활 장면", "핵심 개념", "함께 해보기", "정리 활동"],
    },
    국어: {
      misconceptions: ["핵심 내용을 놓침", "표현은 있으나 구조가 약함", "자료와 생각 연결이 약함"],
      feedback: ["핵심어를 먼저 찾게 하기", "자료를 자신의 말로 바꾸게 하기", "예시 문장을 짧게 반복하게 하기"],
      ppt: ["표현 소개", "예시 자료", "형성평가", "피드백 포인트"],
    },
    수학: {
      misconceptions: ["조건을 일부 놓침", "풀이 과정을 설명하지 못함", "개념과 문제 상황 연결이 약함"],
      feedback: ["조건을 표시하며 읽게 하기", "풀이 과정을 말로 설명하게 하기", "오답 이유를 짚어 다시 연결하기"],
      ppt: ["개념 설명", "예시 문제", "형성평가", "오개념 점검"],
    },
    사회: {
      misconceptions: ["사례는 기억하지만 의미 설명이 부족함", "변화의 원인과 결과를 혼동함", "지역 맥락을 놓침"],
      feedback: ["비교 기준을 먼저 정하게 하기", "사례와 사회 변화의 관계를 말하게 하기", "지역 맥락을 함께 떠올리게 하기"],
      ppt: ["사례 자료", "비교 분석", "형성평가", "정리 질문"],
    },
    과학: {
      misconceptions: ["관찰 사실과 추론을 혼동함", "탐구 과정 설명이 약함", "핵심 용어 사용이 불안정함"],
      feedback: ["관찰한 사실과 생각을 구분하게 하기", "탐구 순서를 다시 말하게 하기", "용어를 그림과 연결해 확인하기"],
      ppt: ["관찰 자료", "탐구 절차", "형성평가", "정리 활동"],
    },
    영어: {
      misconceptions: ["단어는 알지만 문장으로 확장하지 못함", "듣기와 말하기 상황을 연결하지 못함", "매체 단서를 활용하지 못함"],
      feedback: ["상황 전체를 먼저 이해하게 하기", "소리·철자·의미를 함께 확인하기", "짧은 문장으로 반복 연습하게 하기"],
      ppt: ["표현 소개", "듣기·읽기 예시", "형성평가", "다시 말해보기"],
    },
    도덕: {
      misconceptions: ["가치 판단의 이유를 충분히 말하지 못함", "실천 계획이 약함", "개인과 공동체 관점을 연결하지 못함"],
      feedback: ["판단 이유를 말하게 하기", "실천 가능한 행동으로 연결하게 하기", "다른 사람의 입장을 함께 생각하게 하기"],
      ppt: ["상황 제시", "가치 판단", "형성평가", "실천 계획"],
    },
    실과: {
      misconceptions: ["생활 사례와 실천 방법 연결이 약함", "절차는 알지만 이유 설명이 부족함", "지속가능성 관점을 놓침"],
      feedback: ["생활 장면과 연결해 실천하게 하기", "과정을 단계별로 나눠 확인하기", "안전과 지속가능성을 함께 묻게 하기"],
      ppt: ["생활 기술 소개", "절차 안내", "형성평가", "실천 점검"],
    },
    체육: {
      misconceptions: ["동작만 기억하고 규칙은 놓침", "협력과 태도 요소를 빠뜨림", "안전 요소를 충분히 인식하지 못함"],
      feedback: ["동작과 규칙을 함께 확인하기", "활동 전후 안전 점검을 습관화하기", "협력 태도도 함께 평가하기"],
      ppt: ["활동 규칙", "동작 이해", "형성평가", "안전 점검"],
    },
    음악: {
      misconceptions: ["느낌은 말하지만 표현 방법 설명이 약함", "주법과 표현 기법을 함께 생각하지 못함", "함께 표현하는 역할을 놓침"],
      feedback: ["소리와 느낌을 연결해 말하게 하기", "바른 주법을 함께 점검하기", "친구와의 어울림을 듣고 표현하게 하기"],
      ppt: ["감상 또는 표현", "모방·연주 예시", "형성평가", "함께 표현하기"],
    },
    미술: {
      misconceptions: ["표현 의도를 구체화하지 못함", "재료 선택 이유가 약함", "작품 특징 설명이 단편적임"],
      feedback: ["관찰한 특징을 먼저 말하게 하기", "재료 선택 이유를 설명하게 하기", "감상의 근거를 함께 말하게 하기"],
      ppt: ["관찰 활동", "표현 방법", "형성평가", "감상 활동"],
    },
  };

  const defaults = bySubject[topic.subject];
  return {
    goal_points: [
      `${topic.unit_title}의 핵심 내용을 이해한다.`,
      `${topic.unit_title}와 관련된 표현이나 과정을 설명한다.`,
      `${topic.unit_title}를 실제 활동이나 문제에 적용한다.`,
    ],
    key_concepts: keywords.length > 0 ? keywords : [topic.subject, "핵심 개념", "적용"],
    misconceptions: defaults.misconceptions,
    question_seeds: [`${topic.unit_title}의 핵심 내용 확인하기`, `${topic.unit_title}를 사례에 적용하기`],
    feedback_seeds: defaults.feedback,
    ppt_seeds: defaults.ppt,
  };
}

function buildCuratedTopics() {
  const sourceUrl = "https://www.edunet.net/clssFlTbl/list/18";
  const rows = [
    ["1학년", "통합교과", "학교 안팎의 모습과 생활을 탐색하며 안전한 학교생활 하기", "[2 슬 01-01]", "학교 안팎의 모습과 생활을 탐색하며 안전하게 학교생활하는 주제다.", "resource", "high"],
    ["1학년", "통합교과", "우리가 살고 있는 마을과 사람들의 생활 모습 살펴보기", "[2 슬 02-01]", "마을과 사람들의 생활 모습을 살펴보며 삶의 공간을 이해하는 주제다.", "resource", "high"],
    ["2학년", "통합교과", "궁금한 세계를 다양한 매체로 탐색하기", "[2 슬 02-04]", "주변 세계를 다양한 매체를 활용해 탐색하는 주제다.", "resource", "high"],
    ["2학년", "통합교과", "공동체에서 내가 할 수 있는 일 찾아 실천하기", "[2 바 02-01]", "공동체 속에서 내가 할 수 있는 일을 찾아보고 실천하는 주제다.", "resource", "high"],
    ["2학년", "국어", "자신의 경험이나 생각을 바른 자세로 발표하기", "[2 국 01-04]", "자신의 경험이나 생각을 바른 자세로 발표하는 주제다.", "resource", "high"],
    ["2학년", "국어", "글자와 단어를 바르게 쓰기", "[2 국 03-01]", "글자와 단어를 바르게 쓰는 기초 문식성 주제다.", "resource", "high"],
    ["2학년", "국어", "작품을 듣거나 읽으면서 느끼거나 생각한 점 말하기", "[2 국 05-02]", "작품을 듣거나 읽고 느끼거나 생각한 점을 나누는 주제다.", "resource", "high"],
    ["2학년", "국어", "겪은 일을 순서대로 말하고 쓰기", null, "겪은 일을 차례가 드러나게 말하고 쓰는 활동을 중심으로 한 초기 주제다.", "sample", "medium"],
    ["2학년", "수학", "배열에서 규칙을 찾아 여러 가지 방법으로 표현하기", "[2 수 02-01]", "물체와 무늬, 수의 배열에서 규칙을 찾고 표현하는 주제다.", "resource", "high"],
    ["2학년", "수학", "자신이 정한 규칙에 따라 배열하기", "[2 수 02-02]", "스스로 만든 규칙에 따라 물체, 무늬, 수를 배열하는 주제다.", "resource", "high"],
    ["3학년", "과학", "동물과 식물의 생활 탐구하기", null, "초등 과학의 생명 영역을 바탕으로 동물과 식물의 생활을 탐구하는 초기 큐레이션 주제다.", "sample", "medium"],
    ["3학년", "과학", "물체와 그림자 현상 살펴보기", null, "초등 과학의 탐구 활동을 바탕으로 물체와 그림자 현상을 살펴보는 초기 큐레이션 주제다.", "sample", "medium"],
    ["4학년", "국어", "목적과 주제에 알맞게 자료를 정리하여 발표하기", "[4 국 01-05]", "목적과 주제에 맞게 자료를 정리하고 자신감 있게 발표하는 주제다.", "resource", "high"],
    ["4학년", "국어", "문단과 글에서 중심 생각을 파악하고 내용을 간추리기", "[4 국 02-02]", "문단과 글의 중심 생각을 파악하고 내용을 간추리는 읽기 주제다.", "resource", "high"],
    ["4학년", "국어", "절차와 결과가 드러나게 정확한 표현으로 보고하는 글 쓰기", "[4 국 03-02]", "절차와 결과가 드러나게 보고하는 글을 쓰는 주제다.", "resource", "high"],
    ["4학년", "국어", "글이나 자료의 출처가 믿을 만한지 판단하기", "[4 국 02-05]", "글이나 자료의 출처가 믿을 만한지 판단하는 읽기 주제다.", "resource", "high"],
    ["4학년", "수학", "계산식의 배열에서 규칙을 찾고 계산 결과를 추측하기", "[4 수 02-02]", "계산식의 배열에서 규칙을 찾고 계산 결과를 추측하는 주제다.", "resource", "high"],
    ["4학년", "수학", "등호를 사용하여 크기가 같은 두 양의 관계 나타내기", "[4 수 02-03]", "등호를 사용하여 크기가 같은 두 양의 관계를 식으로 나타내는 주제다.", "resource", "high"],
    ["4학년", "수학", "평면에서 점의 이동", "[4 수 03-05]", "격자를 따라 위치와 방향을 설명하며 점의 이동을 이해하는 주제다.", "resource", "high"],
    ["4학년", "수학", "컴퍼스를 이용하여 여러 가지 크기의 원 그리기", "[4 수 03-07]", "컴퍼스를 이용해 여러 가지 크기의 원을 그리고 중심과 반지름을 이해하는 주제다.", "resource", "high"],
    ["4학년", "수학", "그림그래프와 막대그래프로 나타내고 해석하기", "[4 수 04-01]", "자료를 수집하여 그림그래프와 막대그래프로 나타내고 해석하는 주제다.", "resource", "high"],
    ["4학년", "수학", "막대그래프와 꺾은선그래프에 공학 도구 활용", null, "막대그래프와 꺾은선그래프를 그릴 때 공학 도구를 활용하는 확장 활동을 다루는 주제다.", "resource", "medium"],
    ["4학년", "사회", "주변 장소의 경험과 느낌을 표현하며 장소감 이해하기", "[4 사 01-01]", "주변 장소의 경험과 느낌을 다양한 방식으로 표현하며 장소감을 이해하는 주제다.", "resource", "high"],
    ["4학년", "사회", "교통의 변화에 따른 이동과 생활 모습 이해하기", "[4 사 04-02]", "교통의 변화에 따른 이동과 생활 모습의 변화를 이해하는 주제다.", "resource", "high"],
    ["4학년", "사회", "생활 주변 문제를 파악하고 합리적으로 해결하기", "[4 사 09-01]", "생활 주변 문제를 파악하고 이를 합리적으로 해결하는 능력을 기르는 주제다.", "resource", "high"],
    ["4학년", "도덕", "자신의 감정을 소중히 여기며 내가 누구인가 탐구하기", "[4 도 01-01]", "자신의 감정을 소중히 여기며 내가 누구인가를 탐구하는 주제다.", "resource", "high"],
    ["4학년", "도덕", "공감의 태도가 필요한 이유와 감정 나누는 방법 탐구하기", "[4 도 02-03]", "공감의 태도가 필요한 이유를 이해하고 감정을 나누는 방법을 탐구하는 주제다.", "resource", "high"],
    ["4학년", "과학", "물질의 변화와 상태 변화 탐구하기", null, "과학과 원본 PPT 다운로드를 바탕으로 물질의 변화와 상태 변화를 다루는 초기 큐레이션 주제다.", "sample", "medium"],
    ["4학년", "과학", "지구와 우주 현상 살펴보기", null, "지구와 우주 관련 현상을 관찰하고 이해하는 초기 큐레이션 주제다.", "sample", "medium"],
    ["4학년", "영어", "자기 주변 주제에 관한 담화나 문장을 듣거나 읽기", "[4 영 01-06]", "자기 주변 주제에 관한 담화나 문장을 듣거나 읽는 주제다.", "resource", "high"],
    ["4학년", "영어", "시 노래 이야기를 공감하며 듣기", "[4 영 01-09]", "시와 노래, 이야기를 공감하며 듣는 주제다.", "resource", "high"],
    ["4학년", "영어", "소리와 철자의 관계를 이해하며 단어 어구 문장 읽기", "[4 영 01-04]", "소리와 철자의 관계를 이해하며 단어와 어구, 문장을 읽는 주제다.", "resource", "high"],
    ["4학년", "체육", "기본 움직임과 신체활동 익히기", null, "기본 움직임과 신체활동을 익히는 초기 큐레이션 주제다.", "sample", "medium"],
    ["4학년", "음악", "생활 주변의 소리나 장면을 모방하여 음악으로 나타내기", "[4 음 03-04]", "생활 주변의 소리나 장면을 모방하여 음악으로 나타내고 새로움을 즐기는 주제다.", "resource", "high"],
    ["4학년", "미술", "자연물과 인공물을 탐색하는 데 다양한 감각 활용하기", "[4 미 01-01]", "자연물과 인공물을 탐색하는 데 다양한 감각을 활용하는 주제다.", "resource", "high"],
    ["4학년", "미술", "관찰과 상상으로 아이디어를 떠올려 표현 주제 구체화하기", "[4 미 02-01]", "관찰과 상상으로 아이디어를 떠올려 표현 주제를 구체화하는 주제다.", "resource", "high"],
    ["5학년", "과학", "생태계와 환경의 관계 탐구하기", null, "생태계와 환경의 관계를 탐구하는 초기 큐레이션 주제다.", "sample", "medium"],
    ["6학년", "국어", "면담의 절차를 이해하고 상대와 매체를 고려하여 면담하기", "[6 국 01-04]", "면담의 절차를 이해하고 상대와 매체를 고려해 면담하는 주제다.", "resource", "high"],
    ["6학년", "국어", "자료를 선별하여 핵심 정보를 중심으로 내용을 구성하고 발표하기", "[6 국 01-05]", "자료를 선별해 핵심 정보를 중심으로 내용을 구성하고 발표하는 주제다.", "resource", "high"],
    ["6학년", "국어", "작품을 읽고 자신의 삶과 연관 지어 성찰하기", "[6 국 05-06]", "작품을 읽고 자신의 삶과 연관 지어 성찰하는 태도를 기르는 주제다.", "resource", "high"],
    ["6학년", "수학", "수의 범위를 나타내기", "[6 수 01-02]", "이상, 이하, 초과, 미만의 의미와 쓰임을 알고 수의 범위를 나타내는 주제다.", "resource", "high"],
    ["6학년", "수학", "올림 버림 반올림을 실생활에 활용하기", "[6 수 01-03]", "올림, 버림, 반올림의 의미와 필요성을 알고 실생활에 활용하는 주제다.", "resource", "high"],
    ["6학년", "수학", "약수 공약수 최대공약수 이해하고 구하기", "[6 수 01-04]", "약수와 공약수, 최대공약수를 이해하고 구하는 주제다.", "resource", "high"],
    ["6학년", "사회", "민주주의에서 미디어의 의미와 역할 이해하기", "[6 사 08-03]", "민주주의에서 미디어의 의미와 역할을 이해하고 올바른 이용 태도를 기르는 주제다.", "resource", "high"],
    ["6학년", "사회", "시장경제에서 가계와 기업의 역할 이해하기", "[6 사 11-01]", "시장경제에서 가계와 기업의 역할을 이해하고 근로자의 권리와 기업의 책임을 탐색하는 주제다.", "resource", "high"],
    ["6학년", "도덕", "도덕적 고려와 자신의 특기를 바탕으로 진로 계획 세우기", "[6 도 01-03]", "도덕적 고려의 필요성을 알고 자신의 특기와 적성을 탐색해 진로 계획을 수립하는 주제다.", "resource", "high"],
    ["6학년", "도덕", "지속가능한 삶의 의미를 탐구하고 미래를 위한 실천 방안 찾기", "[6 도 04-02]", "지속가능한 삶의 의미를 탐구하고 미래 세대를 위한 실천 방안을 찾는 주제다.", "resource", "high"],
    ["6학년", "과학", "에너지와 생활의 관계 이해하기", null, "에너지와 생활의 관계를 이해하는 초기 큐레이션 주제다.", "sample", "medium"],
    ["6학년", "영어", "다양한 매체로 표현된 담화나 글을 듣거나 읽기", "[6 영 01-08]", "다양한 매체로 표현된 담화나 글을 흥미와 자신감을 가지고 듣거나 읽는 주제다.", "resource", "high"],
    ["6학년", "영어", "자신의 감정이나 의견 경험이나 계획을 표현하기", "[6 영 02-06]", "자신의 감정과 의견, 경험이나 계획을 간단한 문장으로 표현하는 주제다.", "resource", "high"],
    ["6학년", "영어", "적절한 매체와 전략을 활용하여 의미를 생성하고 표현하기", "[6 영 02-09]", "적절한 매체와 전략을 활용하여 의미를 생성하고 표현하는 주제다.", "resource", "high"],
    ["6학년", "실과", "아동기의 발달 특징과 성장 발달 방법 탐색하기", "[6 실 01-01]", "아동기의 발달 특징을 이해하고 성장 발달에 필요한 조건과 방법을 탐색하는 주제다.", "resource", "high"],
    ["6학년", "실과", "식재료 생산과 선택의 중요성 이해하기", "[6 실 02-04]", "식재료 생산과 선택의 중요성을 인식하고 자신의 식사에 적용하는 주제다.", "resource", "high"],
    ["6학년", "실과", "생태 지향적 삶을 위한 의식주 생활 실천하기", "[6 실 02-11]", "생태 지향적 삶을 위해 의식주 생활에서 할 수 있는 행동을 계획하고 실천하는 주제다.", "resource", "high"],
    ["6학년", "실과", "인공지능이 만들어지는 과정을 체험하고 사회적 영향 탐색하기", "[6 실 05-05]", "인공지능이 만들어지는 과정을 체험하고 인공지능이 사회에 미치는 영향을 탐색하는 주제다.", "resource", "high"],
    ["6학년", "체육", "안전하게 운동하고 스포츠맨십 실천하기", null, "안전하게 운동하고 스포츠맨십을 실천하는 초기 큐레이션 주제다.", "sample", "medium"],
    ["6학년", "음악", "바른 주법과 표현 기법으로 느낌을 담아 연주하기", "[6 음 01-01]", "바른 주법과 표현 기법을 익혀 노래나 악기로 느낌을 담아 연주하는 주제다.", "resource", "high"],
    ["6학년", "음악", "소리의 어울림을 생각하며 다양한 방법으로 함께 표현하기", "[6 음 01-03]", "소리의 어울림을 생각하며 다양한 방법으로 함께 표현하는 주제다.", "resource", "high"],
    ["6학년", "미술", "다양한 감각과 매체를 활용하여 자신과 대상을 탐색하기", "[6 미 01-01]", "다양한 감각과 매체를 활용하여 자신과 대상을 탐색하는 주제다.", "resource", "high"],
    ["6학년", "미술", "미술 작품의 내용과 형식을 분석하여 특징 설명하기", "[6 미 03-02]", "미술 작품의 내용과 형식을 분석하여 작품의 특징을 설명하는 주제다.", "resource", "high"],
  ];

  const explicitTopics = rows.map(([grade, subject, unit_title, standard_code, summary, source_type, confidence]) => ({
    school_level: "초등학교",
    grade,
    subject,
    unit_title,
    standard_code,
    summary,
    source_type,
    source_url: sourceUrl,
    confidence,
  }));

  const subjectGradeCoverage = {
    통합교과: ["1학년", "2학년"],
    국어: ["1학년", "2학년", "3학년", "4학년", "5학년", "6학년"],
    수학: ["1학년", "2학년", "3학년", "4학년", "5학년", "6학년"],
    사회: ["3학년", "4학년", "5학년", "6학년"],
    과학: ["3학년", "4학년", "5학년", "6학년"],
    영어: ["3학년", "4학년", "5학년", "6학년"],
    도덕: ["3학년", "4학년", "5학년", "6학년"],
    실과: ["5학년", "6학년"],
    체육: ["1학년", "2학년", "3학년", "4학년", "5학년", "6학년"],
    음악: ["1학년", "2학년", "3학년", "4학년", "5학년", "6학년"],
    미술: ["1학년", "2학년", "3학년", "4학년", "5학년", "6학년"],
  };

  const sampleTopicsBySubject = {
    통합교과: [
      ["학교와 마을을 탐색하며 함께 살아가기", "학교와 마을에서 만나는 사람과 장소를 살펴보며 함께 살아가는 방법을 배우는 초기 큐레이션 주제다."],
      ["주변 세계를 관찰하고 궁금한 것을 표현하기", "주변 세계를 관찰하고 궁금한 것을 여러 방법으로 표현하는 초기 큐레이션 주제다."],
    ],
    국어: [
      ["경험을 떠올려 짧은 글 쓰기", "자신의 경험을 떠올려 차례와 중심 내용이 드러나는 짧은 글을 쓰는 초기 큐레이션 주제다."],
      ["중심 내용을 듣고 말하기", "듣거나 읽은 내용의 중심을 파악하고 자신의 말로 표현하는 초기 큐레이션 주제다."],
    ],
    수학: [
      ["규칙을 찾고 설명하기", "수와 도형, 배열 속 규칙을 찾고 자신의 말과 식으로 설명하는 초기 큐레이션 주제다."],
      ["문제를 해결하는 방법 설명하기", "문제를 푸는 과정을 단계별로 말하고 다른 방법과 비교하는 초기 큐레이션 주제다."],
    ],
    사회: [
      ["지역의 모습과 생활 이해하기", "지역의 자연환경과 생활 모습을 비교하며 사회 현상을 이해하는 초기 큐레이션 주제다."],
      ["공동체 문제를 탐구하고 해결하기", "생활 주변의 문제를 찾아보고 공동체의 관점에서 해결 방법을 탐구하는 초기 큐레이션 주제다."],
    ],
    과학: [
      ["주변 자연 현상 관찰하기", "주변 자연 현상을 관찰하고 특징을 설명하는 초기 큐레이션 주제다."],
      ["탐구 과정을 따라 결과 설명하기", "관찰과 실험을 통해 얻은 결과를 정리하고 설명하는 초기 큐레이션 주제다."],
    ],
    영어: [
      ["일상 표현 듣고 말하기", "일상생활에서 자주 쓰는 표현을 듣고 말하며 의미를 이해하는 초기 큐레이션 주제다."],
      ["짧은 글 읽고 핵심 내용 이해하기", "짧은 영어 글을 읽고 주제와 핵심 내용을 파악하는 초기 큐레이션 주제다."],
    ],
    도덕: [
      ["서로를 존중하는 태도 기르기", "나와 다른 사람을 존중하는 태도를 기르고 실천 방법을 생각하는 초기 큐레이션 주제다."],
      ["공동체를 위한 실천 찾기", "공동체 안에서 할 수 있는 바람직한 행동을 찾아 실천하는 초기 큐레이션 주제다."],
    ],
    실과: [
      ["생활 속 문제 해결 아이디어 찾기", "생활 속 문제를 발견하고 해결 아이디어를 구상하는 초기 큐레이션 주제다."],
      ["지속가능한 생활 실천 계획 세우기", "지속가능한 삶을 위해 실천할 수 있는 생활 계획을 세우는 초기 큐레이션 주제다."],
    ],
    체육: [
      ["기본 움직임과 건강한 활동 익히기", "기본 움직임을 익히고 건강한 신체활동 습관을 기르는 초기 큐레이션 주제다."],
      ["안전한 신체활동과 협력 익히기", "안전 수칙을 지키며 친구와 협력하는 신체활동을 익히는 초기 큐레이션 주제다."],
    ],
    음악: [
      ["리듬과 가락을 느끼며 표현하기", "리듬과 가락의 특징을 느끼고 노래나 연주로 표현하는 초기 큐레이션 주제다."],
      ["소리의 느낌을 살려 함께 연주하기", "소리의 어울림을 생각하며 함께 연주하고 표현하는 초기 큐레이션 주제다."],
    ],
    미술: [
      ["관찰을 바탕으로 표현 아이디어 만들기", "관찰한 대상의 특징을 바탕으로 표현 아이디어를 만드는 초기 큐레이션 주제다."],
      ["다양한 재료와 방법으로 표현하기", "다양한 재료와 방법을 활용해 자신의 생각을 표현하는 초기 큐레이션 주제다."],
    ],
  };

  const explicitKeys = new Set(
    explicitTopics.map((topic) => buildTopicKey(topic.grade, topic.subject, topic.unit_title)),
  );

  const fallbackTopics = [];

  for (const [subject, grades] of Object.entries(subjectGradeCoverage)) {
    const sampleTopics = sampleTopicsBySubject[subject];

    for (const grade of grades) {
      for (const [unitTitle, summary] of sampleTopics) {
        const key = buildTopicKey(grade, subject, unitTitle);

        if (explicitKeys.has(key)) {
          continue;
        }

        fallbackTopics.push({
          school_level: "초등학교",
          grade,
          subject,
          unit_title: unitTitle,
          standard_code: null,
          summary,
          source_type: "sample",
          source_url: sourceUrl,
          confidence: "medium",
        });
      }
    }
  }

  return [...explicitTopics, ...fallbackTopics];
}

function buildLessonSeedMap() {
  return {
    [buildTopicKey("4학년", "수학", "평면에서 점의 이동")]: {
      goal_points: ["시작 위치를 정확히 읽는다.", "방향과 칸 수를 함께 설명한다.", "최종 위치를 좌표나 말로 표현한다."],
      key_concepts: ["격자", "위치", "방향", "몇 칸 이동", "최종 위치"],
      misconceptions: ["오른쪽/왼쪽 혼동", "위/아래 혼동", "칸 수를 잘못 셈"],
      question_seeds: ["시작점에서 이동 후 위치 쓰기", "두 단계 이동 경로 설명하기"],
      feedback_seeds: ["방향을 먼저 말하게 하기", "가로 이동과 세로 이동을 분리해 설명하기"],
      ppt_seeds: ["성취기준 요약", "격자 예시", "형성평가 4문항", "오개념 점검"],
    },
    [buildTopicKey("2학년", "국어", "겪은 일을 순서대로 말하고 쓰기")]: {
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
    .eq("school_level", "초등학교");

  if (topicSelectError) {
    throw topicSelectError;
  }

  const curatedTopicMap = new Map(
    curatedTopics.map((topic) => [buildTopicKey(topic.grade, topic.subject, topic.unit_title), topic]),
  );

  const lessonSeedRows = insertedTopics.map((topic) => {
    const key = buildTopicKey(topic.grade, topic.subject, topic.unit_title);
    const topicRecord = curatedTopicMap.get(key);

    if (!topicRecord) {
      throw new Error(`Missing curated topic for ${key}`);
    }

    const seed = lessonSeedMap[key] || buildGenericSeed(topicRecord);

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
