import type { AiLessonContent, AiQuestion } from "@/lib/ai/types";
import type { GenerationInput } from "@/lib/lesson-generator";

function pushQuestionBlock(lines: string[], question: AiQuestion) {
  lines.push(`#### ${question.title}`);
  lines.push("");
  question.prompt.forEach((item) => lines.push(`- ${item}`));
  lines.push("");
  question.answer.forEach((item) => lines.push(`- ${item}`));
  lines.push("");
}

export function buildMarkdown(input: GenerationInput, lesson: AiLessonContent): string {
  const lines: string[] = [];

  lines.push(`# ${lesson.title}`);
  lines.push("");
  lines.push("## 5. 결과물");
  lines.push("");
  lines.push("### 5.1 수업 주제 요약");
  lines.push("");
  lines.push(lesson.topicSummary);
  lines.push("");
  lines.push("### 5.2 학습 목표");
  lines.push("");
  lesson.goals.forEach((goal) => lines.push(`- ${goal}`));
  lines.push("");
  lines.push("### 5.3 형성평가 5문항");
  lines.push("");
  lesson.questions.forEach((question) => pushQuestionBlock(lines, question));
  lines.push("### 5.4 예상 오개념");
  lines.push("");
  lesson.misconceptions.forEach((item) => lines.push(`- ${item}`));
  lines.push("");
  lines.push("### 5.5 교사용 피드백 포인트");
  lines.push("");
  lesson.feedback.forEach((item) => lines.push(`- ${item}`));
  lines.push("");
  lines.push("### 5.6 재도전 문제");
  lines.push("");
  lesson.retryQuestions.forEach((question) => pushQuestionBlock(lines, question));
  lines.push("### 5.7 간단 평가 기준");
  lines.push("");
  lesson.rubric.forEach((item) => lines.push(`- ${item}`));
  lines.push("");

  if (lesson.trustNote) {
    lines.push("> 참고: " + lesson.trustNote);
    lines.push("");
  }

  lines.push(`<!-- ${input.grade} ${input.subject} ${input.unit} -->`);

  return lines.join("\n");
}
