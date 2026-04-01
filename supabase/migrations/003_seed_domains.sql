-- ============================================================
-- Phase 1A: Seed domains table with 80+ training domains
-- ============================================================

INSERT INTO domains (name, slug, category, display_order) VALUES

-- Technology
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

-- Leadership & Management
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

-- Communication & Soft Skills
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

-- Project Management
('Project Management (PMP)', 'project-management-pmp', 'Project Management', 54),
('Agile & Scrum', 'agile-scrum', 'Project Management', 55),
('SAFe (Scaled Agile)', 'safe-scaled-agile', 'Project Management', 56),
('PRINCE2', 'prince2', 'Project Management', 57),
('Six Sigma', 'six-sigma', 'Project Management', 58),
('Lean Management', 'lean-management', 'Project Management', 59),
('Risk Management', 'risk-management', 'Project Management', 60),

-- Human Resources
('Talent Acquisition & Recruitment', 'talent-acquisition', 'Human Resources', 61),
('Learning & Development', 'learning-development', 'Human Resources', 62),
('Employee Engagement', 'employee-engagement', 'Human Resources', 63),
('Diversity, Equity & Inclusion (DEI)', 'dei', 'Human Resources', 64),
('HR Analytics', 'hr-analytics', 'Human Resources', 65),
('Compensation & Benefits', 'compensation-benefits', 'Human Resources', 66),
('Organizational Development', 'organizational-development', 'Human Resources', 67),

-- Sales & Marketing
('Sales Training', 'sales-training', 'Sales & Marketing', 68),
('Digital Marketing', 'digital-marketing', 'Sales & Marketing', 69),
('Content Marketing & SEO', 'content-marketing-seo', 'Sales & Marketing', 70),
('Social Media Marketing', 'social-media-marketing', 'Sales & Marketing', 71),
('Customer Relationship Management', 'crm', 'Sales & Marketing', 72),
('Account Management', 'account-management', 'Sales & Marketing', 73),
('Brand Strategy', 'brand-strategy', 'Sales & Marketing', 74),

-- Finance & Compliance
('Financial Modelling', 'financial-modelling', 'Finance & Compliance', 75),
('Risk & Compliance', 'risk-compliance', 'Finance & Compliance', 76),
('Anti-Money Laundering (AML)', 'aml', 'Finance & Compliance', 77),
('GDPR & Data Privacy', 'gdpr-data-privacy', 'Finance & Compliance', 78),
('Corporate Governance', 'corporate-governance', 'Finance & Compliance', 79),
('Internal Audit', 'internal-audit', 'Finance & Compliance', 80),
('ESG & Sustainability', 'esg-sustainability', 'Finance & Compliance', 81),

-- Industry-Specific
('Healthcare & Life Sciences', 'healthcare-life-sciences', 'Industry-Specific', 82),
('Manufacturing & Supply Chain', 'manufacturing-supply-chain', 'Industry-Specific', 83),
('ITIL & IT Service Management', 'itil-itsm', 'Industry-Specific', 84),
('Telecommunications', 'telecommunications', 'Industry-Specific', 85),
('Banking & Financial Services', 'banking-financial-services', 'Industry-Specific', 86),
('Retail & E-commerce', 'retail-ecommerce', 'Industry-Specific', 87),

-- Design & Innovation
('Design Thinking', 'design-thinking', 'Design & Innovation', 88),
('UX/UI Design', 'ux-ui-design', 'Design & Innovation', 89),
('Product Management', 'product-management', 'Design & Innovation', 90),
('Innovation Management', 'innovation-management', 'Design & Innovation', 91),

-- Quality & Testing
('Software Testing & QA', 'software-testing-qa', 'Quality & Testing', 92),
('Automation Testing (Selenium)', 'automation-testing', 'Quality & Testing', 93),
('API Testing', 'api-testing', 'Quality & Testing', 94)

ON CONFLICT (slug) DO NOTHING;
