export type AiLessonContent = {
  title: string;
  subtitle: string;
  trustNote?: string;
  topicSummary: string;
  goals: string[];
  misconceptions: string[];
  feedback: string[];
  retryActivities: string[];
  rubric: string[];
  markdown: string;
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
