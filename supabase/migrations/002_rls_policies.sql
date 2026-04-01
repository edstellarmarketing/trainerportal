-- ============================================================
-- Phase 1A: Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiry_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper: check if current user is an admin
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE auth_user_id = auth.uid()
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DOMAINS — public read, admin write
-- ============================================================
CREATE POLICY "domains_public_read"
  ON domains FOR SELECT
  USING (is_active = true);

CREATE POLICY "domains_admin_all"
  ON domains FOR ALL
  USING (is_admin());

-- ============================================================
-- TRAINERS — own data read/write, public read featured/approved, admin all
-- ============================================================

-- Trainers can read their own profile
CREATE POLICY "trainers_own_read"
  ON trainers FOR SELECT
  USING (auth_user_id = auth.uid());

-- Trainers can update their own profile
CREATE POLICY "trainers_own_update"
  ON trainers FOR UPDATE
  USING (auth_user_id = auth.uid());

-- Public can view approved/featured trainers
CREATE POLICY "trainers_public_read"
  ON trainers FOR SELECT
  USING (status = 'approved' AND is_featured = true);

-- Anyone can insert (registration)
CREATE POLICY "trainers_insert"
  ON trainers FOR INSERT
  WITH CHECK (true);

-- Admins have full access
CREATE POLICY "trainers_admin_all"
  ON trainers FOR ALL
  USING (is_admin());

-- ============================================================
-- TRAINER_DOMAINS — own data, public read for approved trainers, admin all
-- ============================================================
CREATE POLICY "trainer_domains_own_read"
  ON trainer_domains FOR SELECT
  USING (
    trainer_id IN (SELECT id FROM trainers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "trainer_domains_own_insert"
  ON trainer_domains FOR INSERT
  WITH CHECK (
    trainer_id IN (SELECT id FROM trainers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "trainer_domains_own_delete"
  ON trainer_domains FOR DELETE
  USING (
    trainer_id IN (SELECT id FROM trainers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "trainer_domains_public_read"
  ON trainer_domains FOR SELECT
  USING (
    trainer_id IN (SELECT id FROM trainers WHERE status = 'approved')
  );

CREATE POLICY "trainer_domains_admin_all"
  ON trainer_domains FOR ALL
  USING (is_admin());

-- ============================================================
-- CERTIFICATIONS — own data, admin all
-- ============================================================
CREATE POLICY "certifications_own_read"
  ON certifications FOR SELECT
  USING (
    trainer_id IN (SELECT id FROM trainers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "certifications_own_insert"
  ON certifications FOR INSERT
  WITH CHECK (
    trainer_id IN (SELECT id FROM trainers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "certifications_own_update"
  ON certifications FOR UPDATE
  USING (
    trainer_id IN (SELECT id FROM trainers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "certifications_admin_all"
  ON certifications FOR ALL
  USING (is_admin());

-- ============================================================
-- VERIFICATION_STEPS — trainers can read own, admin all
-- ============================================================
CREATE POLICY "verification_steps_own_read"
  ON verification_steps FOR SELECT
  USING (
    trainer_id IN (SELECT id FROM trainers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "verification_steps_admin_all"
  ON verification_steps FOR ALL
  USING (is_admin());

-- ============================================================
-- SESSIONS — trainers can read own, admin all
-- ============================================================
CREATE POLICY "sessions_own_read"
  ON sessions FOR SELECT
  USING (
    trainer_id IN (SELECT id FROM trainers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "sessions_admin_all"
  ON sessions FOR ALL
  USING (is_admin());

-- ============================================================
-- ENQUIRIES — admin only
-- ============================================================
CREATE POLICY "enquiries_admin_all"
  ON enquiries FOR ALL
  USING (is_admin());

-- Public can submit enquiries
CREATE POLICY "enquiries_public_insert"
  ON enquiries FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- ENQUIRY_MATCHES — admin only
-- ============================================================
CREATE POLICY "enquiry_matches_admin_all"
  ON enquiry_matches FOR ALL
  USING (is_admin());

-- ============================================================
-- ADMIN_USERS — admin can read, super_admin can manage
-- ============================================================
CREATE POLICY "admin_users_own_read"
  ON admin_users FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "admin_users_admin_read"
  ON admin_users FOR SELECT
  USING (is_admin());

CREATE POLICY "admin_users_admin_all"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE auth_user_id = auth.uid()
        AND role = 'super_admin'
        AND is_active = true
    )
  );
