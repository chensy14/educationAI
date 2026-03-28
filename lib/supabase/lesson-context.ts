import type { LessonContext } from "@/lib/ai/types";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

type TopicRow = {
  id: string;
  standard_code: string | null;
  summary: string | null;
  source_type: string | null;
  source_url: string | null;
};

type SeedRow = {
  goal_points: string[] | null;
  key_concepts: string[] | null;
  misconceptions: string[] | null;
  question_seeds: string[] | null;
  feedback_seeds: string[] | null;
  ppt_seeds: string[] | null;
};

export async function getLessonContext(grade: string, subject: string, unit: string): Promise<LessonContext> {
  const supabase = createAdminSupabaseClient();

  const { data: topic, error: topicError } = await supabase
    .from("curriculum_topics")
    .select("id, standard_code, summary, source_type, source_url")
    .eq("grade", grade)
    .eq("subject", subject)
    .eq("unit_title", unit)
    .maybeSingle<TopicRow>();

  if (topicError) {
    throw topicError;
  }

  if (!topic) {
    return {
      standardCode: null,
      summary: null,
      sourceType: null,
      sourceUrl: null,
      goalPoints: [],
      keyConcepts: [],
      misconceptions: [],
      questionSeeds: [],
      feedbackSeeds: [],
      pptSeeds: [],
    };
  }

  const { data: seed, error: seedError } = await supabase
    .from("lesson_seeds")
    .select("goal_points, key_concepts, misconceptions, question_seeds, feedback_seeds, ppt_seeds")
    .eq("topic_id", topic.id)
    .maybeSingle<SeedRow>();

  if (seedError) {
    throw seedError;
  }

  return {
    standardCode: topic.standard_code,
    summary: topic.summary,
    sourceType: topic.source_type,
    sourceUrl: topic.source_url,
    goalPoints: seed?.goal_points || [],
    keyConcepts: seed?.key_concepts || [],
    misconceptions: seed?.misconceptions || [],
    questionSeeds: seed?.question_seeds || [],
    feedbackSeeds: seed?.feedback_seeds || [],
    pptSeeds: seed?.ppt_seeds || [],
  };
}
