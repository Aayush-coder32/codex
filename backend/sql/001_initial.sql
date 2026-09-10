CREATE TABLE institutions (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-f0-9]{24}$'),
  name VARCHAR(200) NOT NULL,
  code VARCHAR(30) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL DEFAULT 'Institute' CHECK (type IN ('University', 'Institute', 'College')),
  city VARCHAR(120),
  state VARCHAR(120),
  website TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE companies (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-f0-9]{24}$'),
  name VARCHAR(160) NOT NULL UNIQUE,
  slug VARCHAR(180) NOT NULL UNIQUE,
  industry VARCHAR(120),
  employee_count VARCHAR(80),
  headquarters VARCHAR(160),
  website TEXT,
  about TEXT,
  logo_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-f0-9]{24}$'),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE CHECK (email = LOWER(email)),
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'company', 'admin')),
  avatar_url TEXT,
  company_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
  institution_id TEXT REFERENCES institutions(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  password_reset_token_hash TEXT,
  password_reset_expires_at TIMESTAMPTZ,
  settings JSONB NOT NULL DEFAULT '{"timezone":"Asia/Kolkata","language":"en-IN","theme":"light","notifications":{"opportunities":true,"applications":true,"messages":true,"workshops":true,"productUpdates":false}}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_profiles (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-f0-9]{24}$'),
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(30),
  location VARCHAR(160),
  degree VARCHAR(160),
  college VARCHAR(200),
  branch VARCHAR(160),
  graduation_year INTEGER CHECK (graduation_year BETWEEN 2000 AND 2200),
  cgpa NUMERIC(4,2) CHECK (cgpa BETWEEN 0 AND 10),
  about VARCHAR(1200),
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  projects JSONB NOT NULL DEFAULT '[]'::jsonb,
  certificates JSONB NOT NULL DEFAULT '[]'::jsonb,
  resume JSONB,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  readiness INTEGER NOT NULL DEFAULT 0 CHECK (readiness BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE opportunities (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-f0-9]{24}$'),
  title VARCHAR(160) NOT NULL,
  company_id TEXT NOT NULL REFERENCES companies(id),
  created_by TEXT NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('Internship', 'Job', 'Apprenticeship')),
  location VARCHAR(160) NOT NULL,
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('Remote', 'Hybrid', 'On-site')),
  pay VARCHAR(120),
  duration VARCHAR(120),
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferred_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  deadline TIMESTAMPTZ NOT NULL,
  openings INTEGER NOT NULL DEFAULT 1 CHECK (openings > 0),
  eligibility VARCHAR(1000),
  experience VARCHAR(200),
  description VARCHAR(5000) NOT NULL,
  responsibilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Closed', 'Archived')),
  views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
  application_count INTEGER NOT NULL DEFAULT 0 CHECK (application_count >= 0),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE applications (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-f0-9]{24}$'),
  opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'Applied' CHECK (status IN ('Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected', 'Withdrawn')),
  match_score INTEGER NOT NULL DEFAULT 0 CHECK (match_score BETWEEN 0 AND 100),
  cover_letter VARCHAR(3000),
  resume_snapshot JSONB,
  history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (opportunity_id, student_id)
);

CREATE TABLE saved_opportunities (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-f0-9]{24}$'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, opportunity_id)
);

CREATE TABLE workshops (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-f0-9]{24}$'),
  name VARCHAR(180) NOT NULL,
  skill VARCHAR(100) NOT NULL,
  instructor VARCHAR(160) NOT NULL,
  institution_id TEXT REFERENCES institutions(id) ON DELETE SET NULL,
  created_by TEXT NOT NULL REFERENCES users(id),
  start_date TIMESTAMPTZ NOT NULL,
  duration VARCHAR(100),
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  enrolled_count INTEGER NOT NULL DEFAULT 0 CHECK (enrolled_count >= 0),
  description VARCHAR(3000),
  mode VARCHAR(20) NOT NULL DEFAULT 'Online' CHECK (mode IN ('Online', 'On-site', 'Hybrid')),
  meeting_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (status IN ('Draft', 'Open', 'Closed', 'Completed', 'Cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workshop_enrollments (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-f0-9]{24}$'),
  workshop_id TEXT NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'Enrolled' CHECK (status IN ('Enrolled', 'Attended', 'Completed', 'Cancelled')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workshop_id, student_id)
);

CREATE TABLE conversations (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-f0-9]{24}$'),
  title VARCHAR(160),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-f0-9]{24}$'),
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id),
  text VARCHAR(4000) NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  read_by JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-f0-9]{24}$'),
  recipient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (type IN ('success', 'opportunity', 'info', 'event', 'message', 'warning')),
  title VARCHAR(160) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  link TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE announcements (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-f0-9]{24}$'),
  title VARCHAR(180) NOT NULL,
  message VARCHAR(3000) NOT NULL,
  audience VARCHAR(20) NOT NULL DEFAULT 'everyone' CHECK (audience IN ('everyone', 'students', 'faculty', 'companies', 'institutions')),
  author_id TEXT NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Archived')),
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-f0-9]{24}$'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_by_ip TEXT,
  revoked_at TIMESTAMPTZ,
  replaced_by_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX users_role_active_idx ON users(role, is_active);
CREATE INDEX student_profiles_readiness_idx ON student_profiles(readiness DESC);
CREATE INDEX opportunities_status_deadline_idx ON opportunities(status, deadline, created_at DESC);
CREATE INDEX opportunities_skills_gin_idx ON opportunities USING GIN(skills);
CREATE INDEX applications_student_created_idx ON applications(student_id, created_at DESC);
CREATE INDEX applications_opportunity_status_idx ON applications(opportunity_id, status);
CREATE INDEX workshops_status_start_idx ON workshops(status, start_date);
CREATE INDEX messages_conversation_created_idx ON messages(conversation_id, created_at DESC);
CREATE INDEX notifications_recipient_created_idx ON notifications(recipient_id, created_at DESC);
CREATE INDEX announcements_status_published_idx ON announcements(status, published_at DESC);
CREATE INDEX refresh_tokens_user_active_idx ON refresh_tokens(user_id, revoked_at, expires_at);

CREATE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'institutions', 'companies', 'users', 'student_profiles', 'opportunities',
    'applications', 'saved_opportunities', 'workshops', 'workshop_enrollments',
    'conversations', 'messages', 'notifications', 'announcements', 'refresh_tokens'
  ] LOOP
    EXECUTE format('CREATE TRIGGER %I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', table_name, table_name);
  END LOOP;
END;
$$;
