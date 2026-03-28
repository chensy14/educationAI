export type AiQuestion = {
  title: string;
  prompt: string[];
  answer: string[];
};

export type AiLessonContent = {
  title: string;
  subtitle: string;
  trustNote?: string;
  topicSummary: string;
  goals: string[];
  questions: AiQuestion[];
  misconceptions: string[];
  feedback: string[];
  retryQuestions: AiQuestion[];
  rubric: string[];
};

export type LessonContext = {
  standardCode?: string | null;
  summary?: string | null;
  sourceType?: string | null;
  sourceUrl?: string | null;
  goalPoints: string[];
  keyConcepts: string[];
  misconceptions: string[];
  questionSeeds: string[];
  feedbackSeeds: string[];
  pptSeeds: string[];
};

export type SlidesGptPresentation = {
  id: string;
  embed: string;
  download: string;
};
