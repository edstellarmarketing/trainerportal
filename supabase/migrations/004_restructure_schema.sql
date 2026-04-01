-- ============================================================
-- Phase 1B Fix: Restructure schema
-- Drop trainer_domains & certifications tables,
-- store as fields on trainers table directly
-- ============================================================

-- 1. Drop dependent indexes first
DROP INDEX IF EXISTS idx_trainer_domains_trainer;
DROP INDEX IF EXISTS idx_trainer_domains_domain;
DROP INDEX IF EXISTS idx_certifications_trainer;

-- 2. Drop old tables
DROP TABLE IF EXISTS trainer_domains;
DROP TABLE IF EXISTS certifications;

-- 3. Add new columns to trainers table
ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS primary_domains TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS secondary_domains TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS topics_trained TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]';

-- 4. Add GIN indexes for array/JSONB searches
CREATE INDEX IF NOT EXISTS idx_trainers_primary_domains ON trainers USING GIN(primary_domains);
CREATE INDEX IF NOT EXISTS idx_trainers_secondary_domains ON trainers USING GIN(secondary_domains);
CREATE INDEX IF NOT EXISTS idx_trainers_topics_trained ON trainers USING GIN(topics_trained);
