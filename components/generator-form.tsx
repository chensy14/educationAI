"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import type { UnitOption } from "@/lib/unit-options";
import { buildSupportMessage, getPendingUnitOptions } from "@/lib/unit-options";

type Subject = "국어" | "수학" | "사회" | "과학" | "영어";
type Purpose = "도입" | "형성평가" | "복습" | "재수업";
type Difficulty = "쉬움" | "보통" | "도전";

type Lesson = {
  title: string;
  subtitle: string;
  trustNote?: string;
  topicSummary: string;
  goals: string[];
  misconceptions: string[];
  feedback: string[];
  retryActivities: string[];
  rubric: string[];
};

type GenerateResponse = {
  ok: true;
  input: {
    grade: string;
    subject: Subject;
    unit: string;
    purpose: Purpose;
    difficulty: Difficulty;
  };
  lesson: Lesson;
  files: {
    markdownFileName: string;
    markdown: string;
    pptxFileName: string;
    pptxBase64: string;
  };
};

type UnitsResponse =
  | {
      ok: true;
      options: UnitOption[];
      supportMessage: string;
    }
  | {
      ok: false;
      options: UnitOption[];
      supportMessage: string;
      message?: string;
    };

const gradeOptions = ["1학년", "2학년", "3학년", "4학년", "5학년", "6학년"];
const subjectOptions: Subject[] = ["국어", "수학", "사회", "과학", "영어"];
const purposeOptions: Purpose[] = ["도입", "형성평가", "복습", "재수업"];
const difficultyOptions: Difficulty[] = ["쉬움", "보통", "도전"];
const initialUnitOptions = getPendingUnitOptions();

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadPptx(filename: string, base64: string) {
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function GeneratorForm() {
  const [grade, setGrade] = useState("4학년");
  const [subject, setSubject] = useState<Subject>("수학");
  const [unit, setUnit] = useState("");
  const [purpose, setPurpose] = useState<Purpose>("형성평가");
  const [difficulty, setDifficulty] = useState<Difficulty>("보통");
  const [unitOptions, setUnitOptions] = useState<UnitOption[]>(initialUnitOptions);
  const [supportMessage, setSupportMessage] = useState(buildSupportMessage(initialUnitOptions));
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedUnitOption = useMemo(
    () => unitOptions.find((option) => option.value === unit),
    [unit, unitOptions],
  );
  const canGenerate = Boolean(unit.trim()) && !selectedUnitOption?.disabled;

  useEffect(() => {
    let isCancelled = false;

    async function loadUnits() {
      setUnitsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ grade, subject });
        const response = await fetch(`/api/units?${params.toString()}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as UnitsResponse;

        if (isCancelled) {
          return;
        }

        const nextOptions = payload.options?.length ? payload.options : getPendingUnitOptions();
        setUnitOptions(nextOptions);
        setSupportMessage(payload.supportMessage || buildSupportMessage(nextOptions));

        const firstEnabled = nextOptions.find((option) => !option.disabled);
        setUnit((current) =>
          nextOptions.some((option) => option.value === current && !option.disabled)
            ? current
            : firstEnabled?.value ?? "",
        );

        if (!response.ok && payload.ok === false && payload.message) {
          setError(payload.message);
        }
      } catch (loadError) {
        console.error(loadError);

        if (isCancelled) {
          return;
        }

        const fallbackOptions = getPendingUnitOptions();
        setUnitOptions(fallbackOptions);
        setSupportMessage(buildSupportMessage(fallbackOptions));
        setUnit("");
        setError("단원 목록을 불러오지 못했습니다.");
      } finally {
        if (!isCancelled) {
          setUnitsLoading(false);
        }
      }
    }

    void loadUnits();

    return () => {
      isCancelled = true;
    };
  }, [grade, subject]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!canGenerate) {
      setError("현재 선택한 학년/과목 조합은 아직 생성 가능한 단원 데이터가 준비되지 않았습니다.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            grade,
            subject,
            unit,
            purpose,
            difficulty,
          }),
        });

        const payload = (await response.json()) as GenerateResponse | { ok: false; message?: string };

        if (!response.ok || !("ok" in payload) || payload.ok === false) {
          setError(("message" in payload && payload.message) || "생성에 실패했습니다.");
          setResult(null);
          return;
        }

        setResult(payload);
      } catch (submitError) {
        console.error(submitError);
        setError("네트워크 오류가 발생했습니다.");
        setResult(null);
      }
    });
  }

  return (
    <div className="page-shell">
      <section className="hero-card">
        <div className="eyebrow">EducationAI Demo</div>
        <h1>학년과 과목에 맞는 주제를 고르면 바로 결과물을 생성하는 데모</h1>
        <p>
          지금 버전은 Supabase에 적재한 공개 리소스 기반 단원 목록을 읽어와서 드롭다운으로 보여주는 데모입니다.
          지금은 템플릿 기반으로 결과물을 만들고, 다음 단계에서 AI 생성만 붙일 수 있게 구조를 먼저 정리했습니다.
        </p>
      </section>

      <section className="content-grid">
        <form className="panel" onSubmit={handleSubmit}>
          <h2>입력</h2>

          <label>
            학년
            <select value={grade} onChange={(event) => setGrade(event.target.value)}>
              {gradeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            과목
            <select value={subject} onChange={(event) => setSubject(event.target.value as Subject)}>
              {subjectOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            단원 또는 주제
            <select value={unit} onChange={(event) => setUnit(event.target.value)} disabled={unitsLoading}>
              {unitsLoading ? (
                <option value="">단원 목록 불러오는 중...</option>
              ) : (
                unitOptions.map((option) => (
                  <option key={`${grade}-${subject}-${option.label}`} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </option>
                ))
              )}
            </select>
          </label>

          <div className="support-box">
            <strong>지원 상태</strong>
            <p>{supportMessage}</p>
            {selectedUnitOption?.note ? <p className="support-note">{selectedUnitOption.note}</p> : null}
          </div>

          <label>
            수업 목적
            <select value={purpose} onChange={(event) => setPurpose(event.target.value as Purpose)}>
              {purposeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            난이도
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
              {difficultyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" disabled={isPending || !canGenerate || unitsLoading}>
            {isPending ? "생성 중..." : "결과물 만들기"}
          </button>

          {error ? <p className="error-text">{error}</p> : null}
        </form>

        <section className="panel">
          <h2>결과</h2>
          {result ? (
            <div className="result-stack">
              <div className="result-header">
                <h3>{result.lesson.title}</h3>
                <p>{result.lesson.subtitle}</p>
                {result.lesson.trustNote ? <span className="trust-chip">{result.lesson.trustNote}</span> : null}
              </div>

              <div className="button-row">
                <button type="button" onClick={() => downloadText(result.files.markdownFileName, result.files.markdown)}>
                  MD 다운로드
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => downloadPptx(result.files.pptxFileName, result.files.pptxBase64)}
                >
                  PPTX 다운로드
                </button>
              </div>

              <div className="result-card">
                <h4>수업 주제 요약</h4>
                <p>{result.lesson.topicSummary}</p>
              </div>

              <div className="result-card">
                <h4>학습 목표</h4>
                <ul>
                  {result.lesson.goals.map((goal) => (
                    <li key={goal}>{goal}</li>
                  ))}
                </ul>
              </div>

              <div className="result-card">
                <h4>예상 오개념</h4>
                <ul>
                  {result.lesson.misconceptions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="result-card">
                <h4>교사용 피드백</h4>
                <ul>
                  {result.lesson.feedback.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>왼쪽에서 학년과 과목을 고르면 Supabase에 적재된 단원 목록을 불러옵니다.</p>
              <p>현재 추천 조합은 `4학년 / 수학` 또는 `2학년 / 국어`입니다.</p>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
