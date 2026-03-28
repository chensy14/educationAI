export type Subject = "국어" | "수학" | "사회" | "과학" | "영어";
export type Difficulty = "쉬움" | "보통" | "도전";
export type Purpose = "도입" | "형성평가" | "복습" | "재수업";

export type GenerationInput = {
  grade: string;
  subject: Subject;
  unit: string;
  purpose: Purpose;
  difficulty: Difficulty;
};

export type Question = {
  title: string;
  prompt: string[];
  answer: string[];
  concept?: string[];
  example?: string[];
};

export type LessonDeck = {
  title: string;
  subtitle: string;
  trustNote?: string;
  topicSummary: string;
  goals: string[];
  questions: Question[];
  misconceptions: string[];
  feedback: string[];
  retryActivities: string[];
  rubric: string[];
  palette: {
    bandRgb: string;
    accentRgb: string;
  };
};

const subjectPalette: Record<Subject, { bandRgb: string; accentRgb: string }> = {
  국어: { bandRgb: "5F8F00", accentRgb: "1D4ED8" },
  수학: { bandRgb: "D9480F", accentRgb: "0284C7" },
  사회: { bandRgb: "7C3AED", accentRgb: "F59E0B" },
  과학: { bandRgb: "047857", accentRgb: "0EA5E9" },
  영어: { bandRgb: "1D4ED8", accentRgb: "DB2777" },
};

function createMathPointMovement(input: GenerationInput): LessonDeck {
  return {
    title: `${input.grade} ${input.subject} - 평면에서 점의 이동`,
    subtitle: "2022 개정 교육과정 공개 연수자료를 참고한 MVP 샘플",
    trustNote: "공개 자료 기반 생성형 샘플",
    topicSummary:
      "격자판이나 평면 위에서 한 점이 어느 위치에서 시작해서 어느 방향으로 얼마나 이동했는지를 말하고, 그 결과 위치를 설명하는 활동이다.",
    goals: [
      "점의 시작 위치를 말할 수 있다.",
      "점이 이동한 방향을 말할 수 있다.",
      "이동한 칸 수를 세어 설명할 수 있다.",
      "최종 위치를 설명할 수 있다.",
    ],
    questions: [
      {
        title: "문항 1",
        concept: [
          "점의 시작 위치를 확인한다.",
          "오른쪽/왼쪽은 가로 이동, 위/아래는 세로 이동이다.",
          "몇 칸 이동했는지 정확히 센다.",
        ],
        example: [
          "(2, 3)에서 오른쪽으로 2칸 이동하면 (4, 3)이다.",
          "가로값만 변하고 세로값은 그대로다.",
        ],
        prompt: ["점 A가 (2, 3)에 있다.", "오른쪽으로 4칸 이동한 점의 위치를 말해 보자."],
        answer: ["정답: (6, 3)", "해설: 가로 방향으로만 4칸 이동했으므로 첫 번째 위치값만 4 커진다."],
      },
      {
        title: "문항 2",
        prompt: ["점 B가 (5, 4)에 있다.", "아래로 2칸 이동한 점의 위치를 말해 보자."],
        answer: ["정답: (5, 2)", "해설: 세로 방향으로 아래로 2칸 이동했으므로 두 번째 위치값이 2 줄어든다."],
      },
      {
        title: "문항 3",
        prompt: ["점 C가 (1, 2)에 있다.", "오른쪽으로 3칸, 위로 2칸 이동하였다. 최종 위치를 말해 보자."],
        answer: ["정답: (4, 4)", "해설: 오른쪽 이동은 가로값 변화, 위로 이동은 세로값 변화를 뜻한다."],
      },
      {
        title: "문항 4",
        prompt: ["점 D가 (4, 5)에서 (2, 5)로 이동했다.", "어느 방향으로 몇 칸 이동했는가."],
        answer: ["정답: 왼쪽으로 2칸", "해설: 세로값은 같고 가로값만 4에서 2로 줄었다."],
      },
    ],
    misconceptions: [
      "오른쪽/왼쪽 이동과 위/아래 이동을 바꾸어 이해함",
      "칸 수를 셀 때 시작 칸까지 포함해서 세는 오류",
      "위치 설명과 이동 설명을 구분하지 못함",
      "최종 위치를 말해야 하는데 과정만 말함",
    ],
    feedback: [
      "학생이 방향어를 정확히 쓰는지 본다.",
      "시작점과 도착점을 구분하는지 확인한다.",
      "칸 수를 셀 때 시작 칸을 포함하지 않도록 지도한다.",
      "두 단계 이동은 한 단계씩 분리해 설명하게 한다.",
    ],
    retryActivities: [
      "재도전 1: 점 F가 (2, 2)에 있다. 위로 1칸, 오른쪽으로 2칸 이동하면 어디에 있는가.",
      "재도전 2: 점 G가 (6, 3)에서 (4, 1)로 이동했다. 왼쪽으로 몇 칸, 아래로 몇 칸 이동했는가.",
    ],
    rubric: [
      "상: 위치, 방향, 칸 수를 모두 정확히 설명할 수 있다.",
      "중: 한 번 이동 문제는 해결하지만 두 단계 이동에서 설명이 흔들린다.",
      "하: 방향과 칸 수를 자주 혼동하거나 위치 표현이 불안정하다.",
    ],
    palette: subjectPalette.수학,
  };
}

function createKoreanSequence(input: GenerationInput): LessonDeck {
  return {
    title: `${input.grade} ${input.subject} - 겪은 일을 순서대로 말하고 쓰기`,
    subtitle: "국어 자료 존재 확인을 바탕으로 만든 MVP 저신뢰 샘플",
    trustNote: "자료 존재 기반 샘플",
    topicSummary: "자신이 겪은 일을 떠올려, 일어난 차례가 드러나게 말하고 짧게 쓰는 활동이다.",
    goals: [
      "겪은 일을 시간 순서에 맞게 말할 수 있다.",
      "순서 표현을 사용할 수 있다.",
      "중요한 일을 빠뜨리지 않고 간단한 문장으로 쓸 수 있다.",
      "듣는 사람이 이해하기 쉽게 차례를 살려 말할 수 있다.",
    ],
    questions: [
      {
        title: "문항 1",
        concept: [
          "겪은 일은 차례가 드러나게 말하고 쓴다.",
          "먼저, 그리고, 다음에, 마지막에 같은 순서 표현을 사용할 수 있다.",
          "한 문장에는 한 가지 일을 중심으로 쓴다.",
        ],
        example: ["먼저 놀이터에 갔다.", "그리고 그네를 탔다.", "마지막에 집에 돌아왔다."],
        prompt: ["다음 문장을 차례에 맞게 다시 배열해 보자.", "놀이터에 갔다 / 그네를 탔다 / 집에 돌아왔다"],
        answer: ["정답: 놀이터에 갔다 -> 그네를 탔다 -> 집에 돌아왔다", "해설: 일이 일어난 순서대로 배열한다."],
      },
      {
        title: "문항 2",
        prompt: ["빈칸에 알맞은 말을 넣어 보자.", "나는 토요일에 공원에 갔다. _____ 친구를 만났다. _____ 같이 놀았다."],
        answer: ["예시 정답: 먼저 / 그리고", "해설: 앞뒤 사건의 차례가 자연스럽게 이어지면 된다."],
      },
      {
        title: "문항 3",
        prompt: [
          "다음 중 겪은 일을 순서대로 말한 것을 고르자.",
          "1) 재미있었다. 학교에 갔다. 아침을 먹었다.",
          "2) 아침을 먹었다. 학교에 갔다. 재미있는 일이 있었다.",
        ],
        answer: ["정답: 2번", "해설: 일어난 차례가 자연스럽게 이어진다."],
      },
      {
        title: "문항 4",
        prompt: ["다음 상황을 보고 두 문장으로 써 보자.", "운동장에 갔다 / 공을 찼다"],
        answer: ["예시 답안: 나는 운동장에 갔다. 그리고 공을 찼다.", "해설: 순서 표현을 써서 두 문장으로 나누면 더 분명하다."],
      },
    ],
    misconceptions: [
      "시간 순서가 섞임",
      "먼저/그리고/마지막 같은 연결 표현을 쓰지 않음",
      "느낌만 말하고 실제 사건은 빠짐",
      "한 문장에 너무 많은 일을 넣어 뜻이 흐려짐",
    ],
    feedback: [
      "학생이 사건의 순서를 지키는지 본다.",
      "한 문장에 한 가지 일 중심으로 쓰게 돕는다.",
      "언제, 어디서, 무엇을 질문으로 내용을 확장한다.",
      "결과보다 과정이 드러나는지 살핀다.",
    ],
    retryActivities: [
      "재도전 1: 그림 3장을 보고 먼저-그리고-마지막을 넣어 한 번 말해 보자.",
      "재도전 2: 오늘 아침에 한 일을 세 문장으로 써 보자.",
    ],
    rubric: [
      "상: 차례가 분명하고 순서 표현을 알맞게 사용한다.",
      "중: 차례는 대체로 맞지만 표현이 단순하거나 일부 빠진다.",
      "하: 사건의 순서가 섞이거나 문장이 끊겨 의미 전달이 어렵다.",
    ],
    palette: subjectPalette.국어,
  };
}

function createGenericDeck(input: GenerationInput): LessonDeck {
  const unit = input.unit.trim() || "선택한 단원";
  const topicBySubject: Record<Subject, string> = {
    국어: `${unit}와 관련된 핵심 표현을 말하고 쓰는 활동`,
    수학: `${unit}의 핵심 개념을 이해하고 적용하는 활동`,
    사회: `${unit}의 주요 내용을 살펴보고 설명하는 활동`,
    과학: `${unit}의 핵심 개념과 탐구 과정을 확인하는 활동`,
    영어: `${unit}와 관련된 핵심 표현을 듣고 말하는 활동`,
  };

  return {
    title: `${input.grade} ${input.subject} - ${unit}`,
    subtitle: `데모용 템플릿 결과물 · ${input.purpose} · ${input.difficulty}`,
    trustNote: "AI 연결 전 템플릿 데모",
    topicSummary: topicBySubject[input.subject],
    goals: [
      `${unit}의 핵심 내용을 말할 수 있다.`,
      `${unit}와 관련된 기본 활동을 수행할 수 있다.`,
      `${input.difficulty} 수준에 맞는 문제를 해결할 수 있다.`,
      `${input.purpose} 상황에서 필요한 표현이나 개념을 다시 설명할 수 있다.`,
    ],
    questions: [
      {
        title: "문항 1",
        concept: [`${unit}의 핵심 개념을 한 문장으로 정리한다.`, "중요한 낱말이나 표현을 확인한다.", `${input.purpose}에 맞는 학습 포인트를 점검한다.`],
        example: [`${unit}에서 중요한 표현 1개를 찾아본다.`, "핵심 내용을 짧게 말해 본다."],
        prompt: [`${unit}에서 가장 중요한 내용 한 가지를 써 보자.`, `${input.purpose} 시간에 꼭 기억할 내용을 말해 보자.`],
        answer: ["예시 정답: 단원 핵심을 한 문장으로 정리한 답", "해설: 핵심 낱말과 단원 목표가 드러나면 된다."],
      },
      {
        title: "문항 2",
        prompt: [`${unit}와 관련된 예시 상황을 보고 알맞은 설명을 해 보자.`],
        answer: ["예시 정답: 주어진 상황에 맞는 설명", "해설: 단원 개념을 상황에 연결하면 된다."],
      },
      {
        title: "문항 3",
        prompt: [`${unit}에서 배운 내용을 활용해 짧은 답을 만들어 보자.`],
        answer: ["예시 정답: 핵심 개념이 드러나는 짧은 답", "해설: 배운 내용이 빠지지 않게 정리하면 된다."],
      },
      {
        title: "문항 4",
        prompt: [`${unit}와 관련해 친구에게 설명하듯 한 문장으로 말해 보자.`],
        answer: ["예시 정답: 친구에게 설명하는 자연스러운 문장", "해설: 쉬운 말로 정확하게 설명하면 된다."],
      },
    ],
    misconceptions: [
      "핵심 개념보다 겉보기 예시만 기억함",
      "배운 내용과 활동 예시를 연결하지 못함",
      "설명은 가능하지만 정확한 낱말 사용이 부족함",
      "문제를 읽고도 무엇을 묻는지 놓침",
    ],
    feedback: [
      "핵심 낱말을 먼저 짚어 준다.",
      "예시와 개념을 연결해서 말하게 한다.",
      "정답보다 설명 과정을 다시 말하게 한다.",
      "학생 수준에 맞게 문장을 짧게 나눠 확인한다.",
    ],
    retryActivities: [
      `${unit} 핵심 단어 3개를 다시 정리해 보자.`,
      `${unit} 내용을 친구에게 설명하는 한 문장을 다시 써 보자.`,
    ],
    rubric: [
      "상: 단원 핵심을 정확하고 자연스럽게 설명한다.",
      "중: 핵심은 이해했지만 표현이나 연결이 조금 부족하다.",
      "하: 핵심 개념과 예시를 연결하는 데 어려움이 있다.",
    ],
    palette: subjectPalette[input.subject],
  };
}

export function generateLessonDeck(input: GenerationInput): LessonDeck {
  const normalizedUnit = input.unit.replace(/\s+/g, "");

  if (input.grade === "4학년" && input.subject === "수학" && /점|이동/.test(normalizedUnit)) {
    return createMathPointMovement(input);
  }

  if (input.grade === "2학년" && input.subject === "국어" && /겪은일|순서|말하고쓰기|차례/.test(normalizedUnit)) {
    return createKoreanSequence(input);
  }

  return createGenericDeck(input);
}
