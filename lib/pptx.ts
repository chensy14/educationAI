import PptxGenJS from "pptxgenjs";

import type { GenerationInput, LessonDeck, Question } from "@/lib/lesson-generator";

function addTitleBand(slide: PptxGenJS.Slide, title: string, subtitle: string, bandColor: string, accentColor: string) {
  slide.background = { color: "F7F8FA" };
  slide.addShape(PptxGenJS.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 1.05,
    line: { color: bandColor, transparency: 100 },
    fill: { color: bandColor },
  });
  slide.addShape(PptxGenJS.ShapeType.rect, {
    x: 0.52,
    y: 1.32,
    w: 2.5,
    h: 0.08,
    line: { color: accentColor, transparency: 100 },
    fill: { color: accentColor },
  });
  slide.addText(title, {
    x: 0.62,
    y: 0.28,
    w: 10.8,
    h: 0.34,
    fontFace: "Malgun Gothic",
    color: "FFFFFF",
    fontSize: 24,
    bold: true,
    margin: 0,
  });
  slide.addText(subtitle, {
    x: 0.62,
    y: 1.46,
    w: 11.5,
    h: 0.3,
    fontFace: "Malgun Gothic",
    color: "6B5F57",
    fontSize: 13,
    margin: 0,
  });
}

function addPanel(slide: PptxGenJS.Slide, title: string, items: string[], x: number, y: number, w: number, h: number, titleColor: string) {
  slide.addShape(PptxGenJS.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    line: { color: "E5E7EB", transparency: 100 },
    fill: { color: "FFFFFF" },
  });
  slide.addText(title, {
    x: x + 0.28,
    y: y + 0.24,
    w: w - 0.4,
    h: 0.28,
    fontFace: "Malgun Gothic",
    color: titleColor,
    bold: true,
    fontSize: 16,
    margin: 0,
  });
  slide.addText(items.map((text) => ({ text, options: { bullet: { indent: 12 } } })), {
    x: x + 0.28,
    y: y + 0.68,
    w: w - 0.42,
    h: h - 0.82,
    fontFace: "Malgun Gothic",
    color: "2B2119",
    fontSize: 15,
    breakLine: true,
    paraSpaceAfter: 8,
    valign: "top",
    fit: "shrink",
    margin: 0,
  });
}

function addQuestionSlide(pptx: PptxGenJS, deck: LessonDeck, question: Question) {
  const slide = pptx.addSlide();
  addTitleBand(slide, `${deck.title} - 형성평가`, question.title, deck.palette.bandRgb, deck.palette.accentRgb);
  addPanel(slide, "문항", question.prompt, 0.52, 1.95, 5.5, 4.15, deck.palette.accentRgb);
  addPanel(slide, "정답과 해설", question.answer, 6.32, 1.95, 5.98, 4.15, deck.palette.accentRgb);
}

export async function buildPptxBuffer(input: GenerationInput, deck: LessonDeck): Promise<Buffer> {
  const pptx = new PptxGenJS();

  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Codex";
  pptx.company = "EducationAI";
  pptx.subject = `${input.grade} ${input.subject} ${input.unit}`;
  pptx.title = deck.title;
  pptx.theme = {
    headFontFace: "Malgun Gothic",
    bodyFontFace: "Malgun Gothic",
  };

  const slide1 = pptx.addSlide();
  addTitleBand(slide1, deck.title, deck.subtitle, deck.palette.bandRgb, deck.palette.accentRgb);
  addPanel(slide1, "학습 목표", deck.goals, 0.52, 1.95, 5.35, 4.15, deck.palette.accentRgb);
  addPanel(slide1, "오늘의 흐름", ["개념 확인", "예제 살펴보기", "형성평가", "오개념 점검", "재도전 활동"], 6.42, 1.95, 5.9, 4.15, deck.palette.accentRgb);

  const slide2 = pptx.addSlide();
  addTitleBand(slide2, deck.title, "핵심 개념과 예시", deck.palette.bandRgb, deck.palette.accentRgb);
  addPanel(slide2, "핵심 개념", deck.questions[0]?.concept ?? deck.goals, 0.52, 1.95, 5.5, 4.15, deck.palette.accentRgb);
  addPanel(slide2, "예시", deck.questions[0]?.example ?? [deck.topicSummary], 6.32, 1.95, 5.98, 4.15, deck.palette.accentRgb);

  deck.questions.forEach((question) => addQuestionSlide(pptx, deck, question));

  const slideLast1 = pptx.addSlide();
  addTitleBand(slideLast1, deck.title, "오개념과 교사용 피드백", deck.palette.bandRgb, deck.palette.accentRgb);
  addPanel(slideLast1, "예상 오개념", deck.misconceptions, 0.52, 1.95, 5.5, 4.15, deck.palette.accentRgb);
  addPanel(slideLast1, "교사용 피드백", deck.feedback, 6.32, 1.95, 5.98, 4.15, deck.palette.accentRgb);

  const slideLast2 = pptx.addSlide();
  addTitleBand(slideLast2, deck.title, "재도전 활동과 평가 기준", deck.palette.bandRgb, deck.palette.accentRgb);
  addPanel(slideLast2, "재도전 활동", deck.retryActivities, 0.52, 1.95, 5.5, 4.15, deck.palette.accentRgb);
  addPanel(slideLast2, "간단 평가 기준", deck.rubric, 6.32, 1.95, 5.98, 4.15, deck.palette.accentRgb);

  const output = await pptx.write({ outputType: "nodebuffer" as const });
  return output as Buffer;
}
