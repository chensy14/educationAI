import type { Subject } from "@/lib/lesson-generator";

export type UnitOption = {
  value: string;
  label: string;
  source: "resource" | "sample" | "pending";
  note?: string;
  disabled?: boolean;
};

type UnitMap = Record<string, UnitOption[]>;

const unitMap: UnitMap = {
  "4학년::수학": [
    {
      value: "평면에서 점의 이동",
      label: "평면에서 점의 이동",
      source: "resource",
      note: "에듀넷 초등 수학 연수자료 슬라이드 54 기반",
    },
    {
      value: "컴퍼스로 여러 가지 크기의 원 그리기",
      label: "컴퍼스로 여러 가지 크기의 원 그리기",
      source: "resource",
      note: "에듀넷 초등 수학 연수자료 슬라이드 56 기반",
    },
    {
      value: "그림그래프와 막대그래프",
      label: "그림그래프와 막대그래프로 나타내고 해석하기",
      source: "resource",
      note: "에듀넷 초등 수학 연수자료 슬라이드 63 기반",
    },
    {
      value: "막대그래프와 꺾은선그래프에 공학 도구 활용",
      label: "막대그래프와 꺾은선그래프에 공학 도구 활용",
      source: "resource",
      note: "에듀넷 초등 수학 연수자료 슬라이드 64 기반",
    },
  ],
  "2학년::국어": [
    {
      value: "겪은 일을 순서대로 말하고 쓰기",
      label: "겪은 일을 순서대로 말하고 쓰기",
      source: "sample",
      note: "국어 자료 존재 확인 기반의 내부 샘플 주제",
    },
  ],
};

export function getUnitOptions(grade: string, subject: Subject): UnitOption[] {
  const key = `${grade}::${subject}`;
  const found = unitMap[key];

  if (found && found.length > 0) {
    return found;
  }

  return [
    {
      value: "",
      label: "현재 리소스 기준 주제 준비 중",
      source: "pending",
      note: "이 조합은 아직 리소스 기반 드롭다운을 만들 만한 근거가 부족합니다.",
      disabled: true,
    },
  ];
}

export function getSupportMessage(grade: string, subject: Subject): string {
  const options = getUnitOptions(grade, subject);
  const first = options[0];

  if (first?.source === "pending") {
    return "현재 공개 리소스 기준으로는 이 학년/과목 조합의 단원 드롭다운을 아직 확정하지 못했습니다.";
  }

  if (options.every((option) => option.source === "resource")) {
    return "현재 선택지는 리소스 파일에서 직접 근거를 확인한 주제들입니다.";
  }

  return "현재 선택지에는 리소스 기반 항목과 내부 샘플 항목이 함께 포함될 수 있습니다.";
}
