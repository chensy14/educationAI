import type { GenerationInput } from "@/lib/lesson-generator";
import type { AiLessonContent, LessonContext } from "@/lib/ai/types";

function joinList(items: string[]) {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- 없음";
}

export function buildGeminiLessonPrompt(input: GenerationInput, context: LessonContext) {
  return `
You are designing Korean elementary classroom materials.

Create a Korean lesson result package for:
- Grade: ${input.grade}
- Subject: ${input.subject}
- Unit/Topic: ${input.unit}

Context from verified local resources:
- Standard code: ${context.standardCode || "미상"}
- Summary: ${context.summary || "없음"}
- Source type: ${context.sourceType || "resource"}
- Source URL: ${context.sourceUrl || "없음"}

Seeded goal points:
${joinList(context.goalPoints)}

Seeded key concepts:
${joinList(context.keyConcepts)}

Seeded misconceptions:
${joinList(context.misconceptions)}

Seeded question ideas:
${joinList(context.questionSeeds)}

Seeded feedback ideas:
${joinList(context.feedbackSeeds)}

Seeded PPT focus ideas:
${joinList(context.pptSeeds)}

Requirements:
- Write everything in Korean.
- Prioritize concept teaching over assessment-heavy content.
- Be practical for a real classroom teacher.
- Keep each bullet concise and natural.
- Avoid textbook copying.
- Use the verified resource context when available.
- If the resource context is weak, be honest in the trust note and keep claims modest.
- The response must stay strictly on this exact grade, subject, and unit/topic.
- Never switch to another subject, another grade, or another unit.
- If you mention a different subject or unit, the response is invalid.
- Include exactly 5 formative assessment questions.
- Include exactly 2 retry questions for students who need another try.
- Each question must include short prompt bullets and short answer/explanation bullets.

Return ONLY one JSON object with this exact shape:
{
  "title": "string",
  "subtitle": "string",
  "trustNote": "string",
  "topicSummary": "string",
  "goals": ["string", "string", "string"],
  "questions": [
    {
      "title": "string",
      "prompt": ["string"],
      "answer": ["string"]
    }
  ],
  "misconceptions": ["string", "string", "string"],
  "feedback": ["string", "string", "string"],
  "retryQuestions": [
    {
      "title": "string",
      "prompt": ["string"],
      "answer": ["string"]
    }
  ],
  "rubric": ["string", "string", "string"]
}
`.trim();
}

export function buildSlidesGptPrompt(input: GenerationInput, lesson: AiLessonContent, context: LessonContext) {
  const standardLine = context.standardCode
    ? `Use the intent of Korean elementary curriculum standard ${context.standardCode}.`
    : "Use the intent of the selected Korean elementary curriculum topic.";

  return `
Create a 7-slide presentation in Korean for Korean elementary school students.

This must be a teacher-facing concept lesson deck, not a quiz deck, worksheet, or exam-prep deck.

Topic:
${input.unit}

Audience:
${input.grade} ${input.subject}

${standardLine}

Teaching goal:
Teach the concept clearly first, then provide only light guided practice.

Important design rules:
- All slide text must be in Korean.
- Use a clean, bright, student-friendly classroom style.
- Use large readable Korean text.
- Prefer simple diagrams, grids, arrows, dots, boxes, and highlights.
- Avoid making the deck feel like a test.
- Slides 1 to 5 should mainly explain and guide.
- Slide 6 may include short concept-check practice.
- Slide 7 must summarize and review.

Lesson summary to reflect:
${lesson.topicSummary}

Learning goals to reflect:
${joinList(lesson.goals)}

Common misconceptions to reflect:
${joinList(lesson.misconceptions)}

Teacher feedback points to reflect:
${joinList(lesson.feedback)}

Suggested PPT focus:
${joinList(context.pptSeeds)}

Build exactly these slides:

Slide 1
Title: ${input.unit}
Subtitle: ${input.grade} ${input.subject}
Purpose: warm classroom opening slide

Slide 2
Title: 오늘 배울 내용
Use the learning goals as short student-friendly bullets.

Slide 3
Title: 핵심 개념
Explain the core idea in a simple classroom way.

Slide 4
Title: 읽는 방법 또는 이해하는 방법
Explain the rules or steps students should follow.

Slide 5
Title: 같이 살펴보기
Show one teacher-led worked example.

Slide 6
Title: 해 볼까요?
Include 2 or 3 short classroom practice tasks.

Slide 7
Title: 정리하기
Summarize the lesson and include common mistakes to avoid.

Output should feel like a real concept-teaching classroom deck.
`.trim();
}
