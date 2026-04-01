-- ============================================================
-- Edstellar Trainer Portal — Initial Schema Migration
-- 9 core tables: trainers, domains, trainer_domains,
-- certifications, verification_steps, sessions,
-- enquiries, enquiry_matches, admin_users
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. domains — 80+ training domain taxonomy
-- ============================================================
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT, -- e.g. 'Technology', 'Leadership', 'Compliance'
  description TEXT,
  icon_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  trainer_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. trainers — Trainer profiles, status, ratings, rates
-- ============================================================
CREATE TABLE trainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE, -- links to Supabase Auth user

  -- Basic info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  location_city TEXT,
  location_country TEXT,
  headshot_url TEXT,
  bio TEXT,
  linkedin_url TEXT,

  -- Experience
  years_of_experience INTEGER,
  total_sessions_delivered INTEGER DEFAULT 0,
  preferred_group_size_min INTEGER,
  preferred_group_size_max INTEGER,
  delivery_formats TEXT[] DEFAULT '{}', -- e.g. {'in-person', 'virtual', 'hybrid'}

  -- Training content
  sample_outline_url TEXT,
  sample_slides_url TEXT,
  sample_video_url TEXT,

  -- Availability
  availability JSONB DEFAULT '{}', -- structured availability slots

  -- Rates
  day_rate_usd NUMERIC(10,2),
  hourly_rate_usd NUMERIC(10,2),
  rate_notes TEXT,

  -- Status & verification
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('draft', 'pending', 'in_review', 'approved', 'rejected', 'suspended', 'inactive')),
  verification_score NUMERIC(3,1),
  is_featured BOOLEAN DEFAULT false,
  featured_order INTEGER,

  -- Ratings
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,

  -- Timestamps
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. trainer_domains — Many-to-many: trainers <> domains
-- ============================================================
CREATE TABLE trainer_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  expertise_level TEXT DEFAULT 'intermediate'
    CHECK (expertise_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trainer_id, domain_id)
);

-- ============================================================
-- 4. certifications — Trainer certificates with verification
-- ============================================================
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuing_organization TEXT,
  issue_date DATE,
  expiry_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  document_url TEXT, -- uploaded proof document
  verification_status TEXT DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. verification_steps — 5-step vetting pipeline records
-- ============================================================
CREATE TABLE verification_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL CHECK (step_number BETWEEN 1 AND 5),
  step_name TEXT NOT NULL
    CHECK (step_name IN (
      'profile_screening',
      'credential_verification',
      'domain_assessment',
      'trial_session',
      'final_approval'
    )),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'info_requested')),
  reviewer_id UUID,
  reviewer_notes TEXT,
  score NUMERIC(3,1), -- rubric score for steps 3-4
  score_details JSONB, -- detailed rubric breakdown
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trainer_id, step_number)
);

-- ============================================================
-- 6. sessions — Training session logs with feedback
-- ============================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  client_company TEXT NOT NULL,
  topic TEXT NOT NULL,
  domain_id UUID REFERENCES domains(id),
  session_date DATE NOT NULL,
  duration_hours NUMERIC(4,1),
  location TEXT,
  delivery_format TEXT CHECK (delivery_format IN ('in-person', 'virtual', 'hybrid')),
  group_size INTEGER,

  -- Feedback
  client_rating NUMERIC(2,1) CHECK (client_rating BETWEEN 1 AND 5),
  participant_nps INTEGER CHECK (participant_nps BETWEEN -100 AND 100),
  feedback_comments TEXT,

  -- Status
  status TEXT DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. enquiries — Client enquiry submissions
-- ============================================================
CREATE TABLE enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  company_type TEXT,
  domain_needed TEXT NOT NULL,
  delivery_format TEXT CHECK (delivery_format IN ('in-person', 'virtual', 'hybrid')),
  location TEXT,
  group_size INTEGER,
  preferred_timeline TEXT,
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'matching', 'sent', 'reviewing', 'converted', 'lost')),
  assigned_to UUID,
  sla_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. enquiry_matches — Shortlisted trainers per enquiry
-- ============================================================
CREATE TABLE enquiry_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquiry_id UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  match_score NUMERIC(5,2), -- algorithm-generated relevance score
  status TEXT DEFAULT 'shortlisted'
    CHECK (status IN ('shortlisted', 'sent_to_client', 'selected', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(enquiry_id, trainer_id)
);

-- ============================================================
-- 9. admin_users — Admin accounts with roles
-- ============================================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID NOT NULL UNIQUE, -- links to Supabase Auth user
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('super_admin', 'admin', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Indexes for common query patterns
-- ============================================================
CREATE INDEX idx_trainers_status ON trainers(status);
CREATE INDEX idx_trainers_email ON trainers(email);
CREATE INDEX idx_trainers_featured ON trainers(is_featured) WHERE is_featured = true;
CREATE INDEX idx_trainers_rating ON trainers(rating_avg DESC);
CREATE INDEX idx_trainer_domains_trainer ON trainer_domains(trainer_id);
CREATE INDEX idx_trainer_domains_domain ON trainer_domains(domain_id);
CREATE INDEX idx_certifications_trainer ON certifications(trainer_id);
CREATE INDEX idx_verification_steps_trainer ON verification_steps(trainer_id);
CREATE INDEX idx_sessions_trainer ON sessions(trainer_id);
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_enquiry_matches_enquiry ON enquiry_matches(enquiry_id);
CREATE INDEX idx_enquiry_matches_trainer ON enquiry_matches(trainer_id);

-- ============================================================
-- Updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER set_updated_at BEFORE UPDATE ON domains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON trainers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON verification_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON enquiry_matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
