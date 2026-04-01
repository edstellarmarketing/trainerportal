# Edstellar Trainer Portal — Live Deployment Plan of Action

**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS + Self-hosted Supabase + Vercel  
**Date:** April 2026  
**Live URL:** https://trainerportal.vercel.app  
**Repo:** https://github.com/edstellarmarketing/trainerportal

---

## Phase 0 — Project Bootstrap (Foundation) ✅ COMPLETED

**Goal:** Next.js app running on Vercel, connected to self-hosted Supabase, all DB tables created.

- [x] Initialize Next.js project with App Router + TypeScript + Tailwind CSS
- [x] Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`
- [x] Configure environment variables (Supabase URL, anon key, service role key)
- [x] Set up Supabase client helpers (browser client + server client + admin client)
- [x] Create SQL migration for core tables
- [x] Run migration on self-hosted Supabase
- [x] Deploy to Vercel — app is live
- [x] Verify Supabase connection from deployed app (`/api/health`)

**Deliverable:** ✅ App live on Vercel, DB tables created, connection verified.

---

## Phase 1A — Database Schema & Auth ✅ COMPLETED

**Goal:** RLS policies in place, authentication working for both roles.

- [x] Configure auth: Email/password for admins, Magic link for trainers (via Resend)
- [x] Set up Row Level Security (RLS) policies
- [x] Seed `domains` table with 94 taxonomy entries across 10 categories
- [x] Create auth proxy routes (bypasses mixed content with HTTP Supabase)
- [x] Route protection via proxy middleware (cookie-based)
- [x] Deploy to Vercel

**Deliverable:** ✅ Complete schema live with auth and RLS.

---

## Phase 1B — Trainer Registration Form ✅ COMPLETED

**Goal:** Trainers can register through a resume-upload flow.

- [x] Build resume upload page at `/register`
- [x] AI-powered resume parsing (DeepSeek via OpenRouter)
- [x] Auto-fill trainer profile from extracted resume data
- [x] Review form with missing field highlighting (amber)
- [x] Domain selection (primary + secondary) from live taxonomy
- [x] Certifications extracted and stored as JSONB
- [x] File uploads to Supabase Storage (resume/headshot)
- [x] Submission creates trainer record with `status = 'pending'`
- [x] Success page at `/register/success`
- [x] Sample resume template downloadable
- [x] Deploy to Vercel — live registration at `/register`

**Schema change:** Restructured to 8 tables — `trainer_domains` and `certifications` tables removed, stored as fields on `trainers` table (TEXT[] arrays and JSONB).

**Deliverable:** ✅ Trainers can sign up end-to-end.

---

## Phase 1C — Admin Dashboard: Trainer List ✅ COMPLETED

**Goal:** Admin can view and manage incoming trainer registrations.

- [x] Admin login page with email/password auth at `/login/admin`
- [x] Protected admin layout with sidebar navigation
- [x] Trainer list view at `/admin`:
  - Search by name, email, city, domain
  - Filter by status
  - Sortable columns (name, location, status, date)
  - Pagination
- [x] Trainer detail view — full profile with all sections
- [x] Edit profile — inline edit mode with save/cancel
- [x] Approve / Reject / Move to Review actions with reviewer notes
- [x] Deploy to Vercel

**Deliverable:** ✅ Admin can see registrations, edit profiles, and approve/reject trainers.

---

## Phase 2A — Full Verification Pipeline ✅ COMPLETED

**Goal:** Complete 5-step verification workflow operational.

- [x] Verification pipeline UI (stepper view) at `/admin/trainers/[id]/verification`:
  1. Profile Screening — approve/reject/request info
  2. Credential Verification — approve/reject/request info
  3. Domain Assessment — score card (4 criteria, 1-5 scale)
  4. Trial Session — score card (5 criteria, must score 4.0+)
  5. Final Approval — activates trainer profile
- [x] Each step supports: Approve / Reject / Request More Info / Start Review
- [x] Score card rubrics for steps 3-4
- [x] Reviewer notes per step with history
- [x] Auto-updates trainer status (in_review → approved/rejected)
- [x] Deploy to Vercel

**Deliverable:** ✅ Full vetting pipeline live.

---

## Phase 2B — Enquiry Management ✅ COMPLETED

**Goal:** Public enquiry form flows into admin inbox with trainer matching.

- [x] Enquiry form (11 fields) at `/enquiry`:
  - Company name, contact name, email, phone, company type
  - Domain needed, delivery format, location, group size, timeline
  - Additional notes
- [x] `POST /api/enquiries` — creates record with `status = 'new'`, 48hr SLA
- [x] Admin Enquiry Inbox at `/admin/enquiries`:
  - List view with status pipeline tabs: New → Matching → Sent → Reviewing → Converted → Lost
  - Search by company, contact, domain
  - SLA tracking with overdue indicators
- [x] Enquiry detail view at `/admin/enquiries/[id]`:
  - Full submitted info
  - Status pipeline controls
  - Matched trainers list (add/remove)
- [x] Matching workflow:
  - Search trainer directory by name/domain/location
  - Shortlist trainers via `enquiry_matches` table
- [x] Deploy to Vercel

**Deliverable:** ✅ End-to-end enquiry flow working.

---

## Phase 2C — Trainer Dashboard ✅ COMPLETED

**Goal:** Approved trainers can manage their own profiles post-login.

- [x] Trainer login via custom magic link (Resend email)
- [x] Trainer dashboard at `/dashboard`:
  - Profile completeness score with improvement suggestions
  - Stats cards (rating, sessions, day rate)
  - Domain badges
  - Certification renewal alerts (30-day advance notice)
  - Recent sessions list
- [x] Edit profile at `/dashboard/edit`
- [x] Session history at `/dashboard/sessions`
- [x] Custom magic link auth flow (login_tokens table + Resend API + JWT)
- [x] Deploy to Vercel

**Deliverable:** ✅ Trainer self-service portal live.

---

## Phase 2D — Session Tracking & Ratings 🔲 NOT STARTED

**Goal:** Log training sessions, collect feedback, auto-calculate ratings.

- [ ] Admin session logging:
  - Trainer, client company, topic, date, location, format, group size, duration
- [ ] Post-session feedback form:
  - Client rating (1–5), participant NPS, qualitative comments
- [ ] Auto-calculate `rating_avg` on `trainers` table (rolling 12-month average)
- [ ] Performance alerts for trainers dropping below 4.5
- [ ] Performance workflow: Warning > Coaching > Probation > Removal
- [ ] Trainer leaderboard (by rating, session volume, repeat-booking rate)
- [ ] Deploy to Vercel

**Deliverable:** Performance tracking operational.

---

## Phase 3A — Public Page Integration & Content Management 🔲 NOT STARTED

**Goal:** Admin controls what data appears on the public corporate trainers page.

- [ ] Content Management module:
  - Trainer Showcase — select 32 featured trainer cards, set display order
  - Domain Taxonomy — add/edit/reorder 80+ domains, set trainer counts
  - Statistics Management — real-time or manual counts (total trainers, sessions, avg rating)
  - Testimonial Management — approve client quotes for public display
- [ ] Read-only API endpoints (cached):
  - `GET /api/public/trainers/featured`
  - `GET /api/public/domains`
  - `GET /api/public/stats`
  - `GET /api/public/testimonials`
- [ ] Profile Pack PDF generation (React-PDF or Puppeteer):
  - Branded document with unlocked trainer profiles for client delivery
- [ ] Publish controls — preview changes before pushing live
- [ ] Deploy to Vercel

**Deliverable:** Public page reads live data from admin portal.

---

## Phase 3B — Automation & Scale 🔲 NOT STARTED

**Goal:** Smart matching, calendar sync, analytics, bulk operations.

- [ ] Automated trainer matching algorithm (domain + location + rating + availability + rate)
- [ ] Auto-generated Profile Packs triggered on admin shortlist
- [ ] Calendar integration — Google/Outlook sync for trainer availability
- [ ] Analytics dashboard:
  - Trainer leaderboards
  - Domain demand heatmaps
  - Enquiry conversion funnels
  - SLA compliance metrics
- [ ] Bulk CSV/Excel import for migrating existing trainer database
- [ ] Monthly reporting — network health reports (new trainers, churn, utilization, NPS)
- [ ] Client portal (future): clients log in, view matched profiles, select trainers, track sessions
- [ ] Deploy to Vercel

**Deliverable:** Full-scale operational platform.

---

## Current Database Schema (8 Tables)

| Table | Purpose |
|---|---|
| `trainers` | Trainer profiles with domains (TEXT[]), certs (JSONB), status, ratings, rates |
| `domains` | 94 training domain taxonomy across 10 categories |
| `verification_steps` | 5-step vetting pipeline records with scores |
| `sessions` | Training session logs with feedback |
| `enquiries` | Client enquiry submissions with SLA tracking |
| `enquiry_matches` | Shortlisted trainers per enquiry |
| `admin_users` | Admin accounts with roles (super_admin, admin, viewer) |
| `login_tokens` | Secure magic link tokens for trainer auth |

---

## Vercel Environment Variables

| Variable | Purpose | Scope |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Self-hosted Supabase URL | Client + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Client + Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin operations (bypasses RLS) | Server only |
| `OPENROUTER_API_KEY` | Resume parsing (DeepSeek) | Server only |
| `RESEND_API_KEY` | Magic link emails | Server only |
| `RESEND_FROM_EMAIL` | Email sender address | Server only |
| `NEXT_PUBLIC_APP_URL` | Vercel deployment URL | Client + Server |

---

## Architecture Notes

- **Mixed content workaround:** Self-hosted Supabase runs on HTTP. All Supabase calls from browser are proxied through Next.js API routes (server-side) to avoid HTTPS→HTTP browser blocks.
- **Auth:** Admin uses email/password via Supabase REST API proxy. Trainers use custom magic link flow (Resend + login_tokens table + JWT).
- **Resume parsing:** PDF/DOCX/TXT text extraction → DeepSeek LLM (via OpenRouter) → structured JSON auto-fill.
- **Schema:** Flat trainer table with domains as TEXT[] arrays and certifications as JSONB (avoids cross-table join issues with self-hosted Supabase).

---

## Role-Based Access

| Role | Access | Capabilities |
|---|---|---|
| Super Admin | Full | All modules, user management, publish, delete |
| Admin | Operational | Verification, enquiries, sessions, content |
| Viewer | Read-only | View directory, pipeline, reports |
| Trainer | Own profile | Edit profile, availability, view own sessions |

---

## Key Metrics to Track

| Metric | Target |
|---|---|
| Total approved trainers | 5000+ |
| New registrations/month | 50–100 |
| Verification pipeline time | < 7 business days |
| Verification pass rate | ~20% |
| Time to match (SLA) | < 48 hours |
| Profile pack sent rate | > 95% within 48hrs |
| Enquiry conversion rate | > 25% |
| Average trainer rating | > 4.5 / 5.0 |
| Trainer utilization rate | > 30% |
| Client retention rate | > 90% |
| Domain coverage gaps | 0 domains with < 10 trainers |
| Trainer churn rate | < 5% / quarter |
