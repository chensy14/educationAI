create extension if not exists pgcrypto;

create table if not exists curriculum_topics (
  id uuid primary key default gen_random_uuid(),
  school_level text not null,
  grade text not null,
  subject text not null,
  unit_title text not null,
  standard_code text,
  summary text,
  source_type text not null default 'resource',
  source_url text,
  confidence text not null default 'medium',
  created_at timestamptz not null default now()
);

create unique index if not exists curriculum_topics_unique_idx
  on curriculum_topics (school_level, grade, subject, unit_title);

create table if not exists lesson_seeds (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references curriculum_topics(id) on delete cascade,
  goal_points jsonb not null default '[]'::jsonb,
  key_concepts jsonb not null default '[]'::jsonb,
  misconceptions jsonb not null default '[]'::jsonb,
  question_seeds jsonb not null default '[]'::jsonb,
  feedback_seeds jsonb not null default '[]'::jsonb,
  ppt_seeds jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists lesson_seeds_topic_id_idx
  on lesson_seeds (topic_id);

create table if not exists textbook_catalog (
  id uuid primary key default gen_random_uuid(),
  school_level text not null,
  school_type text,
  title text not null,
  publisher text,
  author text,
  grade_use text,
  material_type text,
  curriculum_year text,
  source_file text,
  created_at timestamptz not null default now()
);

create table if not exists open_assets (
  id uuid primary key default gen_random_uuid(),
  origin_site text not null,
  origin_url text not null,
  title text not null,
  creator_or_org text,
  asset_type text,
  keyword text,
  license_type text,
  commercial_ok boolean not null default false,
  derivative_ok boolean not null default false,
  attribution_text text,
  allow_for_mvp boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists generation_jobs (
  id uuid primary key default gen_random_uuid(),
  grade text not null,
  subject text not null,
  unit_title text not null,
  purpose text not null,
  difficulty text not null,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

create table if not exists generation_outputs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references generation_jobs(id) on delete cascade,
  markdown_content text not null,
  pptx_storage_path text,
  created_at timestamptz not null default now()
);
