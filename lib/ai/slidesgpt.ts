import { requireSlidesGptEnv } from "@/lib/ai/env";
import { buildSlidesGptPrompt } from "@/lib/ai/prompts";
import type { AiLessonContent, LessonContext, SlidesGptPresentation } from "@/lib/ai/types";
import type { GenerationInput } from "@/lib/lesson-generator";

export async function generateSlidesDeckWithSlidesGpt(
  input: GenerationInput,
  lesson: AiLessonContent,
  context: LessonContext,
) {
  const { apiKey } = requireSlidesGptEnv();
  const prompt = buildSlidesGptPrompt(input, lesson, context);

  const generateResponse = await fetch("https://api.slidesgpt.com/v1/presentations/generate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
    }),
  });

  if (!generateResponse.ok) {
    const errorText = await generateResponse.text();
    throw new Error(`SlidesGPT generate failed (${generateResponse.status}): ${errorText}`);
  }

  const presentation = (await generateResponse.json()) as SlidesGptPresentation;

  if (!presentation.id) {
    throw new Error("SlidesGPT did not return a presentation id.");
  }

  const downloadResponse = await fetch(`https://api.slidesgpt.com/v1/presentations/${presentation.id}/download`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!downloadResponse.ok) {
    const errorText = await downloadResponse.text();
    throw new Error(`SlidesGPT download failed (${downloadResponse.status}): ${errorText}`);
  }

  const arrayBuffer = await downloadResponse.arrayBuffer();

  return {
    presentation,
    buffer: Buffer.from(arrayBuffer),
  };
}
