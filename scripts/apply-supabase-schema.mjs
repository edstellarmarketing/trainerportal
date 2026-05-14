const url = process.env.SERVICE_URL_SUPABASEKONG || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SERVICE_SUPABASESERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const schema = process.env.SUPABASE_SCHEMA || "trainerportal";

if (!url || !key) {
  console.error("Missing SERVICE_URL_SUPABASEKONG/NEXT_PUBLIC_SUPABASE_URL or SERVICE_SUPABASESERVICE_KEY/SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const endpoint = `${url.replace(/\/$/, "")}/pg/query`;
const ident = schema.replace(/"/g, '""');

async function query(sql) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status} ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

const sql = `
create schema if not exists "${ident}";
grant usage on schema "${ident}" to anon, authenticated, service_role;

create extension if not exists "uuid-ossp" with schema extensions;

create or replace function "${ident}".uuid_v4()
returns uuid
language sql
stable
as $$
  select extensions.uuid_generate_v4()
$$;

create table if not exists "${ident}".domains (
  id uuid primary key default "${ident}".uuid_v4(),
  name text not null unique,
  slug text not null unique,
  category text,
  description text,
  icon_url text,
  display_order integer default 0,
  is_active boolean default true,
  trainer_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists "${ident}".trainers (
  id uuid primary key default "${ident}".uuid_v4(),
  auth_user_id uuid unique,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  location_city text,
  location_country text,
  headshot_url text,
  bio text,
  linkedin_url text,
  years_of_experience integer,
  total_sessions_delivered integer default 0,
  preferred_group_size_min integer,
  preferred_group_size_max integer,
  delivery_formats text[] default '{}',
  primary_domains text[] default '{}',
  secondary_domains text[] default '{}',
  topics_trained text[] default '{}',
  certifications jsonb default '[]',
  sample_outline_url text,
  sample_slides_url text,
  sample_video_url text,
  availability jsonb default '{}',
  day_rate_usd numeric(10,2),
  hourly_rate_usd numeric(10,2),
  rate_notes text,
  status text not null default 'pending'
    check (status in ('draft', 'pending', 'in_review', 'approved', 'rejected', 'suspended', 'inactive')),
  verification_score numeric(3,1),
  is_featured boolean default false,
  featured_order integer,
  rating_avg numeric(3,2) default 0,
  rating_count integer default 0,
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists "${ident}".verification_steps (
  id uuid primary key default "${ident}".uuid_v4(),
  trainer_id uuid not null references "${ident}".trainers(id) on delete cascade,
  step_number integer not null check (step_number between 1 and 5),
  step_name text not null check (step_name in (
    'profile_screening',
    'credential_verification',
    'domain_assessment',
    'trial_session',
    'final_approval'
  )),
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'approved', 'rejected', 'info_requested')),
  reviewer_id uuid,
  reviewer_notes text,
  score numeric(3,1),
  score_details jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(trainer_id, step_number)
);

create table if not exists "${ident}".sessions (
  id uuid primary key default "${ident}".uuid_v4(),
  trainer_id uuid not null references "${ident}".trainers(id) on delete cascade,
  client_company text not null,
  topic text not null,
  domain_id uuid references "${ident}".domains(id),
  session_date date not null,
  duration_hours numeric(4,1),
  location text,
  delivery_format text check (delivery_format in ('in-person', 'virtual', 'hybrid')),
  group_size integer,
  client_rating numeric(2,1) check (client_rating between 1 and 5),
  participant_nps integer check (participant_nps between -100 and 100),
  feedback_comments text,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists "${ident}".enquiries (
  id uuid primary key default "${ident}".uuid_v4(),
  company_name text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  company_type text,
  domain_needed text not null,
  delivery_format text check (delivery_format in ('in-person', 'virtual', 'hybrid')),
  location text,
  group_size integer,
  preferred_timeline text,
  additional_notes text,
  status text not null default 'new'
    check (status in ('new', 'matching', 'sent', 'reviewing', 'converted', 'lost')),
  assigned_to uuid,
  sla_deadline timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists "${ident}".enquiry_matches (
  id uuid primary key default "${ident}".uuid_v4(),
  enquiry_id uuid not null references "${ident}".enquiries(id) on delete cascade,
  trainer_id uuid not null references "${ident}".trainers(id) on delete cascade,
  match_score numeric(5,2),
  status text default 'shortlisted'
    check (status in ('shortlisted', 'sent_to_client', 'selected', 'rejected')),
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(enquiry_id, trainer_id)
);

create table if not exists "${ident}".admin_users (
  id uuid primary key default "${ident}".uuid_v4(),
  auth_user_id uuid not null unique,
  email text not null unique,
  full_name text not null,
  role text not null default 'viewer' check (role in ('super_admin', 'admin', 'viewer')),
  is_active boolean default true,
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists "${ident}".login_tokens (
  id uuid primary key default "${ident}".uuid_v4(),
  email text not null,
  token text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now()
);

drop table if exists "${ident}".trainer_domains cascade;
drop table if exists "${ident}".certifications cascade;

create index if not exists idx_trainers_status on "${ident}".trainers(status);
create index if not exists idx_trainers_email on "${ident}".trainers(email);
create index if not exists idx_trainers_featured on "${ident}".trainers(is_featured) where is_featured = true;
create index if not exists idx_trainers_rating on "${ident}".trainers(rating_avg desc);
create index if not exists idx_trainers_primary_domains on "${ident}".trainers using gin(primary_domains);
create index if not exists idx_trainers_secondary_domains on "${ident}".trainers using gin(secondary_domains);
create index if not exists idx_trainers_topics_trained on "${ident}".trainers using gin(topics_trained);
create index if not exists idx_verification_steps_trainer on "${ident}".verification_steps(trainer_id);
create index if not exists idx_sessions_trainer on "${ident}".sessions(trainer_id);
create index if not exists idx_sessions_date on "${ident}".sessions(session_date);
create index if not exists idx_enquiries_status on "${ident}".enquiries(status);
create index if not exists idx_enquiry_matches_enquiry on "${ident}".enquiry_matches(enquiry_id);
create index if not exists idx_enquiry_matches_trainer on "${ident}".enquiry_matches(trainer_id);
create index if not exists idx_login_tokens_token on "${ident}".login_tokens(token);
create index if not exists idx_login_tokens_email on "${ident}".login_tokens(email);

create or replace function "${ident}".update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function "${ident}".is_admin()
returns boolean
language plpgsql
security definer
set search_path = "${ident}", public, auth
as $$
begin
  return exists (
    select 1 from "${ident}".admin_users
    where auth_user_id = auth.uid()
      and is_active = true
  );
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['domains','trainers','verification_steps','sessions','enquiries','enquiry_matches','admin_users']
  loop
    execute format('drop trigger if exists set_updated_at on "${ident}".%I', table_name);
    execute format('create trigger set_updated_at before update on "${ident}".%I for each row execute function "${ident}".update_updated_at()', table_name);
  end loop;
end $$;

alter table "${ident}".trainers enable row level security;
alter table "${ident}".domains enable row level security;
alter table "${ident}".verification_steps enable row level security;
alter table "${ident}".sessions enable row level security;
alter table "${ident}".enquiries enable row level security;
alter table "${ident}".enquiry_matches enable row level security;
alter table "${ident}".admin_users enable row level security;
alter table "${ident}".login_tokens enable row level security;

grant select, insert, update, delete on all tables in schema "${ident}" to anon, authenticated, service_role;
grant usage, select on all sequences in schema "${ident}" to anon, authenticated, service_role;
grant execute on all functions in schema "${ident}" to anon, authenticated, service_role;

do $$
declare
  pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = '${schema.replace(/'/g, "''")}'
  loop
    execute format('drop policy if exists %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

create policy domains_public_read on "${ident}".domains for select using (is_active = true);
create policy domains_admin_all on "${ident}".domains for all using ("${ident}".is_admin());

create policy trainers_own_read on "${ident}".trainers for select using (auth_user_id = auth.uid());
create policy trainers_own_update on "${ident}".trainers for update using (auth_user_id = auth.uid());
create policy trainers_public_read on "${ident}".trainers for select using (status = 'approved' and is_featured = true);
create policy trainers_insert on "${ident}".trainers for insert with check (true);
create policy trainers_admin_all on "${ident}".trainers for all using ("${ident}".is_admin());

create policy verification_steps_own_read on "${ident}".verification_steps for select
  using (trainer_id in (select id from "${ident}".trainers where auth_user_id = auth.uid()));
create policy verification_steps_admin_all on "${ident}".verification_steps for all using ("${ident}".is_admin());

create policy sessions_own_read on "${ident}".sessions for select
  using (trainer_id in (select id from "${ident}".trainers where auth_user_id = auth.uid()));
create policy sessions_admin_all on "${ident}".sessions for all using ("${ident}".is_admin());

create policy enquiries_admin_all on "${ident}".enquiries for all using ("${ident}".is_admin());
create policy enquiries_public_insert on "${ident}".enquiries for insert with check (true);

create policy enquiry_matches_admin_all on "${ident}".enquiry_matches for all using ("${ident}".is_admin());

create policy admin_users_own_read on "${ident}".admin_users for select using (auth_user_id = auth.uid());
create policy admin_users_admin_read on "${ident}".admin_users for select using ("${ident}".is_admin());
create policy admin_users_admin_all on "${ident}".admin_users for all using (
  exists (
    select 1 from "${ident}".admin_users
    where auth_user_id = auth.uid()
      and role = 'super_admin'
      and is_active = true
  )
);

create policy login_tokens_admin_all on "${ident}".login_tokens for all using ("${ident}".is_admin());

insert into "${ident}".domains (name, slug, category, display_order) values
('Cloud Computing', 'cloud-computing', 'Technology', 1),
('Amazon Web Services (AWS)', 'aws', 'Technology', 2),
('Microsoft Azure', 'microsoft-azure', 'Technology', 3),
('Google Cloud Platform (GCP)', 'google-cloud-platform', 'Technology', 4),
('DevOps', 'devops', 'Technology', 5),
('Kubernetes & Containers', 'kubernetes-containers', 'Technology', 6),
('Cybersecurity', 'cybersecurity', 'Technology', 7),
('Ethical Hacking & Penetration Testing', 'ethical-hacking', 'Technology', 8),
('Network Security', 'network-security', 'Technology', 9),
('Data Science', 'data-science', 'Technology', 10),
('Machine Learning', 'machine-learning', 'Technology', 11),
('Artificial Intelligence', 'artificial-intelligence', 'Technology', 12),
('Generative AI', 'generative-ai', 'Technology', 13),
('Deep Learning', 'deep-learning', 'Technology', 14),
('Natural Language Processing', 'nlp', 'Technology', 15),
('Python Programming', 'python', 'Technology', 16),
('Java Programming', 'java', 'Technology', 17),
('JavaScript & TypeScript', 'javascript-typescript', 'Technology', 18),
('Full Stack Development', 'full-stack-development', 'Technology', 19),
('React & Frontend Development', 'react-frontend', 'Technology', 20),
('Node.js & Backend Development', 'nodejs-backend', 'Technology', 21),
('Blockchain & Web3', 'blockchain-web3', 'Technology', 22),
('Internet of Things (IoT)', 'iot', 'Technology', 23),
('Robotic Process Automation (RPA)', 'rpa', 'Technology', 24),
('Salesforce', 'salesforce', 'Technology', 25),
('SAP', 'sap', 'Technology', 26),
('ServiceNow', 'servicenow', 'Technology', 27),
('Power BI & Data Visualization', 'power-bi-data-viz', 'Technology', 28),
('Tableau', 'tableau', 'Technology', 29),
('SQL & Database Management', 'sql-database', 'Technology', 30),
('Big Data & Hadoop', 'big-data-hadoop', 'Technology', 31),
('Snowflake & Data Warehousing', 'snowflake-data-warehousing', 'Technology', 32),
('Leadership Development', 'leadership-development', 'Leadership & Management', 33),
('Executive Leadership', 'executive-leadership', 'Leadership & Management', 34),
('First-Time Manager Training', 'first-time-manager', 'Leadership & Management', 35),
('Change Management', 'change-management', 'Leadership & Management', 36),
('Strategic Thinking & Planning', 'strategic-thinking', 'Leadership & Management', 37),
('Decision Making', 'decision-making', 'Leadership & Management', 38),
('Coaching & Mentoring', 'coaching-mentoring', 'Leadership & Management', 39),
('Conflict Resolution', 'conflict-resolution', 'Leadership & Management', 40),
('Team Building', 'team-building', 'Leadership & Management', 41),
('Performance Management', 'performance-management', 'Leadership & Management', 42),
('Stakeholder Management', 'stakeholder-management', 'Leadership & Management', 43),
('Communication Skills', 'communication-skills', 'Communication & Soft Skills', 44),
('Presentation Skills', 'presentation-skills', 'Communication & Soft Skills', 45),
('Public Speaking', 'public-speaking', 'Communication & Soft Skills', 46),
('Business Writing', 'business-writing', 'Communication & Soft Skills', 47),
('Negotiation Skills', 'negotiation-skills', 'Communication & Soft Skills', 48),
('Emotional Intelligence', 'emotional-intelligence', 'Communication & Soft Skills', 49),
('Critical Thinking', 'critical-thinking', 'Communication & Soft Skills', 50),
('Creative Problem Solving', 'creative-problem-solving', 'Communication & Soft Skills', 51),
('Time Management & Productivity', 'time-management', 'Communication & Soft Skills', 52),
('Cross-Cultural Communication', 'cross-cultural-communication', 'Communication & Soft Skills', 53),
('Project Management (PMP)', 'project-management-pmp', 'Project Management', 54),
('Agile & Scrum', 'agile-scrum', 'Project Management', 55),
('SAFe (Scaled Agile)', 'safe-scaled-agile', 'Project Management', 56),
('PRINCE2', 'prince2', 'Project Management', 57),
('Six Sigma', 'six-sigma', 'Project Management', 58),
('Lean Management', 'lean-management', 'Project Management', 59),
('Risk Management', 'risk-management', 'Project Management', 60),
('Talent Acquisition & Recruitment', 'talent-acquisition', 'Human Resources', 61),
('Learning & Development', 'learning-development', 'Human Resources', 62),
('Employee Engagement', 'employee-engagement', 'Human Resources', 63),
('Diversity, Equity & Inclusion (DEI)', 'dei', 'Human Resources', 64),
('HR Analytics', 'hr-analytics', 'Human Resources', 65),
('Compensation & Benefits', 'compensation-benefits', 'Human Resources', 66),
('Organizational Development', 'organizational-development', 'Human Resources', 67),
('Sales Training', 'sales-training', 'Sales & Marketing', 68),
('Digital Marketing', 'digital-marketing', 'Sales & Marketing', 69),
('Content Marketing & SEO', 'content-marketing-seo', 'Sales & Marketing', 70),
('Social Media Marketing', 'social-media-marketing', 'Sales & Marketing', 71),
('Customer Relationship Management', 'crm', 'Sales & Marketing', 72),
('Account Management', 'account-management', 'Sales & Marketing', 73),
('Brand Strategy', 'brand-strategy', 'Sales & Marketing', 74),
('Financial Modelling', 'financial-modelling', 'Finance & Compliance', 75),
('Risk & Compliance', 'risk-compliance', 'Finance & Compliance', 76),
('Anti-Money Laundering (AML)', 'aml', 'Finance & Compliance', 77),
('GDPR & Data Privacy', 'gdpr-data-privacy', 'Finance & Compliance', 78),
('Corporate Governance', 'corporate-governance', 'Finance & Compliance', 79),
('Internal Audit', 'internal-audit', 'Finance & Compliance', 80),
('ESG & Sustainability', 'esg-sustainability', 'Finance & Compliance', 81),
('Healthcare & Life Sciences', 'healthcare-life-sciences', 'Industry-Specific', 82),
('Manufacturing & Supply Chain', 'manufacturing-supply-chain', 'Industry-Specific', 83),
('ITIL & IT Service Management', 'itil-itsm', 'Industry-Specific', 84),
('Telecommunications', 'telecommunications', 'Industry-Specific', 85),
('Banking & Financial Services', 'banking-financial-services', 'Industry-Specific', 86),
('Retail & E-commerce', 'retail-ecommerce', 'Industry-Specific', 87),
('Design Thinking', 'design-thinking', 'Design & Innovation', 88),
('UX/UI Design', 'ux-ui-design', 'Design & Innovation', 89),
('Product Management', 'product-management', 'Design & Innovation', 90),
('Innovation Management', 'innovation-management', 'Design & Innovation', 91),
('Software Testing & QA', 'software-testing-qa', 'Quality & Testing', 92),
('Automation Testing (Selenium)', 'automation-testing', 'Quality & Testing', 93),
('API Testing', 'api-testing', 'Quality & Testing', 94)
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do update set public = excluded.public;

notify pgrst, 'reload schema';
`;

const verifySql = `
select table_name
from information_schema.tables
where table_schema = '${schema.replace(/'/g, "''")}'
  and table_type = 'BASE TABLE'
order by table_name;
`;

const countsSql = `
select
  (select count(*) from "${ident}".domains) as domains,
  (select count(*) from "${ident}".trainers) as trainers,
  (select count(*) from "${ident}".verification_steps) as verification_steps,
  (select count(*) from "${ident}".sessions) as sessions,
  (select count(*) from "${ident}".enquiries) as enquiries,
  (select count(*) from "${ident}".enquiry_matches) as enquiry_matches,
  (select count(*) from "${ident}".admin_users) as admin_users,
  (select count(*) from "${ident}".login_tokens) as login_tokens;
`;

try {
  console.log(`Applying schema "${schema}" via ${endpoint}`);
  await query(sql);
  const tables = await query(verifySql);
  const counts = await query(countsSql);
  console.log("Tables:");
  for (const row of tables) console.log(`- ${row.table_name}`);
  console.log("Counts:");
  console.log(JSON.stringify(counts?.[0] || {}, null, 2));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
