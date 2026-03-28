"use client";

import { useState, useTransition } from "react";

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

const gradeOptions = ["1학년", "2학년", "3학년", "4학년", "5학년", "6학년"];
const subjectOptions: Subject[] = ["국어", "수학", "사회", "과학", "영어"];
const purposeOptions: Purpose[] = ["도입", "형성평가", "복습", "재수업"];
const difficultyOptions: Difficulty[] = ["쉬움", "보통", "도전"];

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
  const [unit, setUnit] = useState("평면에서 점의 이동");
  const [purpose, setPurpose] = useState<Purpose>("형성평가");
  const [difficulty, setDifficulty] = useState<Difficulty>("보통");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

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
        <h1>학년·과목·단원을 선택하면 바로 수업 결과물을 생성하는 데모</h1>
        <p>
          지금 버전은 AI 없이도 돌아가는 템플릿 생성형 MVP입니다. 입력값을 제출하면 결과물 요약 화면과 함께
          마크다운 파일과 PPTX 파일을 내려받을 수 있습니다.
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
            <select
              value={subject}
              onChange={(event) => {
                const nextSubject = event.target.value as Subject;
                setSubject(nextSubject);
                if (nextSubject === "수학") {
                  setUnit("평면에서 점의 이동");
                } else if (nextSubject === "국어") {
                  setUnit("겪은 일을 순서대로 말하고 쓰기");
                } else {
                  setUnit("");
                }
              }}
            >
              {subjectOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            단원 또는 주제
            <input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="예: 평면에서 점의 이동" />
          </label>

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

          <button type="submit" disabled={isPending || !unit.trim()}>
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
                <button type="button" className="secondary-button" onClick={() => downloadPptx(result.files.pptxFileName, result.files.pptxBase64)}>
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
              <p>왼쪽에서 학년, 과목, 단원을 선택한 뒤 생성 버튼을 눌러 주세요.</p>
              <p>예시 입력: `4학년 / 수학 / 평면에서 점의 이동` 또는 `2학년 / 국어 / 겪은 일을 순서대로 말하고 쓰기`</p>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
