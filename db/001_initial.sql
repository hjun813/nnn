CREATE TYPE application_status AS ENUM ('SAVED', 'IN_PROGRESS', 'APPLIED', 'EXPIRED', 'ARCHIVED');
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'NOT_REQUIRED');
CREATE TYPE task_type AS ENUM ('RESUME', 'PORTFOLIO', 'ESSAY', 'ASSIGNMENT', 'CODING_TEST', 'CUSTOM');
CREATE TYPE deadline_type AS ENUM ('FIXED', 'ALWAYS_OPEN', 'UNKNOWN');

CREATE TABLE app_user (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  timezone TEXT NOT NULL DEFAULT 'Asia/Seoul',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE job_posting (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  position_title TEXT NOT NULL,
  source_url TEXT,
  normalized_url TEXT,
  platform TEXT,
  deadline_type deadline_type NOT NULL DEFAULT 'UNKNOWN',
  actual_deadline TIMESTAMPTZ,
  target_deadline TIMESTAMPTZ,
  status application_status NOT NULL DEFAULT 'SAVED',
  status_before_expiry application_status,
  memo TEXT,
  applied_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  version INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT target_before_actual CHECK (
    target_deadline IS NULL OR actual_deadline IS NULL OR target_deadline <= actual_deadline
  )
);

CREATE UNIQUE INDEX job_posting_user_normalized_url_unique
  ON job_posting(user_id, normalized_url)
  WHERE normalized_url IS NOT NULL;
CREATE INDEX job_posting_user_status_target_idx ON job_posting(user_id, status, target_deadline);
CREATE INDEX job_posting_user_status_actual_idx ON job_posting(user_id, status, actual_deadline);

CREATE TABLE application_task (
  id UUID PRIMARY KEY,
  job_posting_id UUID NOT NULL REFERENCES job_posting(id) ON DELETE CASCADE,
  type task_type NOT NULL,
  title TEXT NOT NULL,
  status task_status NOT NULL DEFAULT 'TODO',
  is_required BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX application_task_job_order_idx ON application_task(job_posting_id, sort_order);

CREATE TABLE essay_question (
  id UUID PRIMARY KEY,
  job_posting_id UUID NOT NULL REFERENCES job_posting(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE status_history (
  id UUID PRIMARY KEY,
  job_posting_id UUID NOT NULL REFERENCES job_posting(id) ON DELETE CASCADE,
  from_status application_status,
  to_status application_status NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
