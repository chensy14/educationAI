"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { SUBJECT_OPTIONS, SUBJECTS_BY_GRADE, type Subject } from "@/lib/subjects";
import type { UnitOption } from "@/lib/unit-options";
import { getPendingUnitOptions } from "@/lib/unit-options";

type LessonQuestion = {
  title: string;
  prompt: string[];
  answer: string[];
};

type Lesson = {
  title: string;
  subtitle: string;
  trustNote?: string;
  topicSummary: string;
  goals: string[];
  questions: LessonQuestion[];
  misconceptions: string[];
  feedback: string[];
  retryQuestions: LessonQuestion[];
  rubric: string[];
};

type GenerateResponse = {
  ok: true;
  input: {
    grade: string;
    subject: Subject;
    unit: string;
  };
  lesson: Lesson;
  files: {
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
const initialUnitOptions = getPendingUnitOptions();

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
  const [unitOptions, setUnitOptions] = useState<UnitOption[]>(initialUnitOptions);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedUnitOption = useMemo(
    () => unitOptions.find((option) => option.value === unit),
    [unit, unitOptions],
  );
  const subjectOptions = useMemo(() => SUBJECTS_BY_GRADE[grade] ?? [...SUBJECT_OPTIONS], [grade]);
  const canGenerate = Boolean(unit.trim()) && !selectedUnitOption?.disabled;

  useEffect(() => {
    if (!subjectOptions.includes(subject)) {
      setSubject(subjectOptions[0] ?? SUBJECT_OPTIONS[0]);
    }
  }, [grade, subject, subjectOptions]);

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
        <h1>개쩌는 Education AI</h1>
        <p>수업용 ppt와 형성평가 문제를 한번에 만들어 보세요.</p>
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
                <button
                  type="button"
                  className="secondary-button button-single"
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
                <h4>형성평가 5문항</h4>
                <div className="question-stack">
                  {result.lesson.questions.map((question) => (
                    <article key={question.title} className="question-card">
                      <h5>{question.title}</h5>
                      <ul>
                        {question.prompt.map((item) => (
                          <li key={`${question.title}-prompt-${item}`}>{item}</li>
                        ))}
                      </ul>
                      <div className="answer-block">
                        <strong>정답·해설</strong>
                        <ul>
                          {question.answer.map((item) => (
                            <li key={`${question.title}-answer-${item}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  ))}
                </div>
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

              <div className="result-card">
                <h4>재도전 문제</h4>
                <div className="question-stack">
                  {result.lesson.retryQuestions.map((question) => (
                    <article key={question.title} className="question-card">
                      <h5>{question.title}</h5>
                      <ul>
                        {question.prompt.map((item) => (
                          <li key={`${question.title}-prompt-${item}`}>{item}</li>
                        ))}
                      </ul>
                      <div className="answer-block">
                        <strong>정답·해설</strong>
                        <ul>
                          {question.answer.map((item) => (
                            <li key={`${question.title}-answer-${item}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="result-card">
                <h4>간단 평가 기준</h4>
                <ul>
                  {result.lesson.rubric.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="result-card">
                <h4>결과 문서</h4>
                <pre className="markdown-preview">{result.files.markdown}</pre>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>학년, 과목, 단원을 고른 뒤 결과물 만들기를 눌러 주세요.</p>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
