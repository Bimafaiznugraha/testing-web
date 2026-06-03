-- ============================================================
-- COLLABOARD — Academic Project Management
-- Database Schema v1.0
-- Designed for: Supabase (PostgreSQL)
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fast text search

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT UNIQUE NOT NULL,
  full_name       TEXT NOT NULL,
  avatar_url      TEXT,
  university      TEXT,               -- "Universitas Brawijaya"
  faculty         TEXT,               -- "Fakultas Ekonomi dan Bisnis"
  student_id      TEXT,               -- NIM / NPM
  semester        SMALLINT,           -- 1–14
  whatsapp_number TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. PROJECTS
-- ============================================================
CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT,
  course_name     TEXT,               -- "Manajemen Pemasaran Digital"
  course_code     TEXT,               -- "MKT401"
  lecturer_name   TEXT,
  lecturer_email  TEXT,
  university_id   TEXT,               -- Institution identifier
  status          TEXT DEFAULT 'active'
                  CHECK (status IN ('active','completed','archived')),
  visibility      TEXT DEFAULT 'private'
                  CHECK (visibility IN ('private','university')),
  deadline        DATE NOT NULL,
  internal_deadline DATE,             -- auto-adjusted for UTS/UAS clashes
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. PROJECT MEMBERS (join table)
-- ============================================================
CREATE TYPE member_role AS ENUM ('owner','member','viewer');

CREATE TABLE project_members (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        member_role DEFAULT 'member',
  display_role TEXT,                  -- e.g. "Ketua", "Desainer", "Analis"
  invited_at  TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,            -- NULL = pending invite
  UNIQUE (project_id, user_id)
);

-- ============================================================
-- 4. TASKS
-- ============================================================
CREATE TYPE task_status AS ENUM ('todo','in_progress','done','blocked');
CREATE TYPE task_priority AS ENUM ('low','medium','high','urgent');

CREATE TABLE tasks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  status       task_status DEFAULT 'todo',
  priority     task_priority DEFAULT 'medium',
  assigned_to  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date     DATE,
  estimated_hours NUMERIC(5,1),
  actual_hours    NUMERIC(5,1),
  tags         TEXT[],
  position     INT DEFAULT 0,         -- for drag-and-drop ordering
  parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL, -- subtasks
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. INTEGRATIONS (GDrive, Canva, Notion, etc.)
-- ============================================================
CREATE TYPE integration_type AS ENUM (
  'gdrive','canva','notion','figma','miro','github','overleaf','email'
);

CREATE TABLE integrations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type          integration_type NOT NULL,
  label         TEXT NOT NULL,        -- "Folder Utama Drive", "Canva Poster"
  url           TEXT NOT NULL,
  icon_url      TEXT,
  added_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. ACADEMIC SCHEDULES (UTS / UAS / Holidays)
-- ============================================================
CREATE TYPE academic_event_type AS ENUM (
  'uts','uas','holiday','class','event','submission'
);

CREATE TABLE academic_schedules (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,         -- "UTS Manajemen Keuangan"
  type         academic_event_type NOT NULL,
  course_code  TEXT,
  start_date   DATE NOT NULL,
  end_date     DATE,                  -- NULL = single day
  all_day      BOOLEAN DEFAULT TRUE,
  start_time   TIME,
  end_time     TIME,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. CONTRIBUTION EVENTS (immutable activity log)
-- ============================================================
CREATE TYPE contribution_type AS ENUM (
  'task_created','task_completed','task_updated',
  'file_uploaded','file_edited',
  'comment_posted','mention',
  'integration_added','meeting_attended'
);

CREATE TABLE contributions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type           contribution_type NOT NULL,
  task_id        UUID REFERENCES tasks(id) ON DELETE SET NULL,
  metadata       JSONB DEFAULT '{}',  -- flexible: {file_name, comment_preview…}
  weight         NUMERIC(3,1) DEFAULT 1.0, -- contribution score weight
  occurred_at    TIMESTAMPTZ DEFAULT NOW()
  -- intentionally no updated_at — this table is append-only
);

-- ============================================================
-- 8. COMMENTS (on tasks)
-- ============================================================
CREATE TABLE comments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id      UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body         TEXT NOT NULL,
  mentions     UUID[],                -- user IDs mentioned with @
  is_edited    BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. NOTIFICATIONS
-- ============================================================
CREATE TYPE notification_type AS ENUM (
  'task_assigned','task_due_soon','task_overdue',
  'mention','comment','deadline_adjusted',
  'member_joined','schedule_conflict'
);

CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE,
  type         notification_type NOT NULL,
  title        TEXT NOT NULL,
  body         TEXT,
  link_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  is_read      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. PROOF OF CONTRIBUTION REPORTS
-- ============================================================
CREATE TABLE contribution_reports (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  generated_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  period_start   DATE NOT NULL,
  period_end     DATE NOT NULL,
  report_data    JSONB NOT NULL,      -- snapshot of scores at generation time
  file_url       TEXT,               -- exported PDF URL (Supabase Storage)
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================

-- Projects
CREATE INDEX idx_projects_deadline     ON projects(deadline);
CREATE INDEX idx_projects_created_by   ON projects(created_by);

-- Members
CREATE INDEX idx_members_project       ON project_members(project_id);
CREATE INDEX idx_members_user          ON project_members(user_id);

-- Tasks
CREATE INDEX idx_tasks_project         ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to     ON tasks(assigned_to);
CREATE INDEX idx_tasks_status          ON tasks(project_id, status);
CREATE INDEX idx_tasks_due_date        ON tasks(due_date);

-- Contributions (heatmap queries are date-range heavy)
CREATE INDEX idx_contributions_project_user  ON contributions(project_id, user_id);
CREATE INDEX idx_contributions_occurred      ON contributions(occurred_at);
CREATE INDEX idx_contributions_date_trunc    ON contributions(DATE_TRUNC('week', occurred_at));

-- Academic Schedules (clash detection)
CREATE INDEX idx_schedules_user_dates  ON academic_schedules(user_id, start_date, end_date);
CREATE INDEX idx_schedules_type        ON academic_schedules(user_id, type);

-- Notifications
CREATE INDEX idx_notifications_user    ON notifications(user_id, is_read, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (Supabase)
-- ============================================================

ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects             ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks                ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_schedules   ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_reports ENABLE ROW LEVEL SECURITY;

-- Users: see own record or fellow project members
CREATE POLICY "users_self_read" ON users FOR SELECT
  USING (auth.uid() = id);

-- Projects: visible to members only
CREATE POLICY "projects_member_access" ON projects FOR ALL
  USING (
    id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid()
    )
  );

-- Tasks: accessible within joined projects
CREATE POLICY "tasks_member_access" ON tasks FOR ALL
  USING (
    project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid()
    )
  );

-- Contributions: members of the project can read; only own inserts
CREATE POLICY "contributions_read" ON contributions FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "contributions_insert_own" ON contributions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Academic Schedules: private per user
CREATE POLICY "schedules_own" ON academic_schedules FOR ALL
  USING (user_id = auth.uid());

-- Notifications: private per user
CREATE POLICY "notifications_own" ON notifications FOR ALL
  USING (user_id = auth.uid());

-- ============================================================
-- HELPER VIEWS
-- ============================================================

-- Contribution score per member per project (for heatmap & report)
CREATE OR REPLACE VIEW v_contribution_scores AS
SELECT
  project_id,
  user_id,
  COUNT(*)                                       AS total_events,
  SUM(weight)                                    AS total_score,
  SUM(CASE WHEN type = 'task_completed'  THEN weight ELSE 0 END) AS task_score,
  SUM(CASE WHEN type LIKE 'file_%'       THEN weight ELSE 0 END) AS file_score,
  SUM(CASE WHEN type = 'comment_posted'  THEN weight ELSE 0 END) AS comment_score,
  MIN(occurred_at)                               AS first_contribution,
  MAX(occurred_at)                               AS last_contribution
FROM contributions
GROUP BY project_id, user_id;

-- Daily activity per user per project (for heatmap grid)
CREATE OR REPLACE VIEW v_daily_activity AS
SELECT
  project_id,
  user_id,
  DATE(occurred_at)  AS activity_date,
  COUNT(*)           AS event_count,
  SUM(weight)        AS day_score
FROM contributions
GROUP BY project_id, user_id, DATE(occurred_at);

-- Upcoming deadlines with UTS/UAS clash detection
CREATE OR REPLACE VIEW v_deadline_conflicts AS
SELECT
  t.id           AS task_id,
  t.project_id,
  t.title        AS task_title,
  t.due_date,
  t.assigned_to  AS user_id,
  s.id           AS conflict_schedule_id,
  s.type         AS conflict_type,
  s.title        AS conflict_title,
  s.start_date   AS conflict_start,
  s.end_date     AS conflict_end
FROM tasks t
JOIN academic_schedules s
  ON  s.user_id   = t.assigned_to
  AND s.type       IN ('uts','uas')
  AND t.due_date BETWEEN s.start_date AND COALESCE(s.end_date, s.start_date)
WHERE t.status != 'done';
