export type UnitSource = "resource" | "sample" | "pending";

export type UnitOption = {
  value: string;
  label: string;
  source: UnitSource;
  note?: string;
  disabled?: boolean;
};

export function getPendingUnitOptions(): UnitOption[] {
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

export function buildSupportMessage(options: UnitOption[]): string {
  const first = options[0];

  if (!first || first.source === "pending") {
    return "현재 공개 리소스 기준으로는 이 학년/과목 조합의 단원 드롭다운이 아직 준비되지 않았습니다.";
  }

  if (options.every((option) => option.source === "resource")) {
    return "현재 선택지는 리소스 파일에서 직접 근거를 확인한 주제들입니다.";
  }

  return "현재 선택지에는 리소스 기반 항목과 내부 샘플 항목이 함께 포함되어 있습니다.";
}
