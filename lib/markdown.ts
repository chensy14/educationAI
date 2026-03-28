import type { GenerationInput, LessonDeck } from "@/lib/lesson-generator";

export function buildMarkdown(input: GenerationInput, deck: LessonDeck): string {
  const lines: string[] = [];

  lines.push(`# ${deck.title}`);
  lines.push("");
  lines.push(`- 학교급/학년: 초등학교 ${input.grade}`);
  lines.push(`- 과목: ${input.subject}`);
  lines.push(`- 단원: ${input.unit}`);
  lines.push(`- 수업 목적: ${input.purpose}`);
  lines.push(`- 난이도: ${input.difficulty}`);
  if (deck.trustNote) {
    lines.push(`- 비고: ${deck.trustNote}`);
  }
  lines.push("");
  lines.push("## 5. 결과물");
  lines.push("");
  lines.push("### 5.1 수업 주제 요약");
  lines.push("");
  lines.push(deck.topicSummary);
  lines.push("");
  lines.push("### 5.2 학습 목표");
  lines.push("");
  deck.goals.forEach((goal) => lines.push(`- ${goal}`));
  lines.push("");
  lines.push("### 5.3 형성평가 문항");
  lines.push("");

  deck.questions.forEach((question) => {
    lines.push(`#### ${question.title}`);
    lines.push("");
    question.prompt.forEach((prompt) => lines.push(`- ${prompt}`));
    lines.push("");
    question.answer.forEach((answer) => lines.push(`- ${answer}`));
    lines.push("");
  });

  lines.push("### 5.4 예상 오개념");
  lines.push("");
  deck.misconceptions.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
  lines.push("");
  lines.push("### 5.5 교사용 피드백 포인트");
  lines.push("");
  deck.feedback.forEach((item) => lines.push(`- ${item}`));
  lines.push("");
  lines.push("### 5.6 재도전 활동");
  lines.push("");
  deck.retryActivities.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
  lines.push("");
  lines.push("### 5.7 간단 평가 기준");
  lines.push("");
  deck.rubric.forEach((item) => lines.push(`- ${item}`));
  lines.push("");

  return lines.join("\n");
}
