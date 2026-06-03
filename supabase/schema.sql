-- =============================================================================
-- CODE TECH — Supabase / PostgreSQL schema
-- =============================================================================
-- Run this entire file once in:
--   Supabase Dashboard → SQL Editor → New query → paste → Run
--
-- After it succeeds:
--   1. Dashboard → Authentication → Users → Add user (your admin email + pwd)
--   2. Replace the email in the last block of this file with YOUR email and
--      run it again, OR promote a user via the SQL editor.
-- =============================================================================

-- Drop in reverse-dependency order so re-running is safe
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS demo_sites CASCADE;
DROP TABLE IF EXISTS hosting_plans CASCADE;
DROP TABLE IF EXISTS domains CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =============================================================================
-- profiles — extra info about each user (admin or customer)
-- =============================================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create a profile row whenever a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- services — the 12 service packages shown on /services
-- =============================================================================
CREATE TABLE services (
  id          TEXT PRIMARY KEY,
  icon        TEXT NOT NULL,
  title       TEXT NOT NULL,
  short       TEXT NOT NULL,
  description TEXT NOT NULL,
  features    TEXT[] NOT NULL DEFAULT '{}',
  price       TEXT NOT NULL,            -- display string e.g. 'from MWK 499,000'
  price_value BIGINT NOT NULL DEFAULT 0, -- numeric for cart math
  color       TEXT NOT NULL DEFAULT 'indigo',
  sort_order  INT NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- hosting_plans — the 4 plans on /hosting
-- =============================================================================
CREATE TABLE hosting_plans (
  id          TEXT PRIMARY KEY,
  icon        TEXT NOT NULL,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  price       BIGINT NOT NULL,            -- MWK per month
  features    TEXT[] NOT NULL DEFAULT '{}',
  popular     BOOLEAN NOT NULL DEFAULT false,
  color       TEXT NOT NULL DEFAULT 'indigo',
  sort_order  INT NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- domains — the 24 TLDs on /domains
-- =============================================================================
CREATE TABLE domains (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  price       BIGINT NOT NULL,            -- MWK per year
  popular     BOOLEAN NOT NULL DEFAULT false,
  description TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX domains_popular_idx ON domains (popular) WHERE popular = true;

-- =============================================================================
-- demo_sites — the 12 management-system demos on /demos
-- =============================================================================
CREATE TABLE demo_sites (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL,
  description TEXT NOT NULL,
  tech        TEXT[] NOT NULL DEFAULT '{}',
  image       TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT 'from-indigo-500 to-purple-500',
  features    TEXT[] NOT NULL DEFAULT '{}',
  url         TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX demo_sites_category_idx ON demo_sites (category);

-- =============================================================================
-- orders — placed from the /cart checkout
-- =============================================================================
CREATE TABLE orders (
  id              BIGSERIAL PRIMARY KEY,
  reference       TEXT NOT NULL UNIQUE,
  customer_name   TEXT NOT NULL,
  customer_email  TEXT NOT NULL,
  customer_phone  TEXT,
  payment_method  TEXT NOT NULL CHECK (payment_method IN ('airtel','tnm','bank')),
  transaction_id  TEXT,
  subtotal        BIGINT NOT NULL,
  discount        BIGINT NOT NULL DEFAULT 0,
  total           BIGINT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','paid','cancelled','fulfilled')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX orders_status_idx ON orders (status);
CREATE INDEX orders_email_idx ON orders (customer_email);
CREATE INDEX orders_created_idx ON orders (created_at DESC);

-- =============================================================================
-- order_items — line items for each order
-- =============================================================================
CREATE TABLE order_items (
  id          BIGSERIAL PRIMARY KEY,
  order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_type   TEXT NOT NULL CHECK (item_type IN ('service','hosting','domain')),
  item_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  subtitle    TEXT,
  icon        TEXT,
  price       BIGINT NOT NULL,
  qty         INT NOT NULL DEFAULT 1,
  billing     TEXT,
  domain_name TEXT
);
CREATE INDEX order_items_order_idx ON order_items (order_id);

-- =============================================================================
-- notifications — surfaced in the bell icon
-- =============================================================================
CREATE TABLE notifications (
  id          BIGSERIAL PRIMARY KEY,
  type        TEXT NOT NULL DEFAULT 'message'
              CHECK (type IN ('message','promo','system','info','order')),
  title       TEXT NOT NULL,
  body        TEXT,
  meta        JSONB,
  recipient   UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = public
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_recipient_idx ON notifications (recipient, created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE services     ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosting_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains      ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_sites   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper: is the current request from an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ----- profiles -----
CREATE POLICY "profiles self read"   ON profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles self update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles admin all"   ON profiles FOR ALL    USING (public.is_admin());

-- ----- public read tables (anyone can read) -----
CREATE POLICY "services public read"      ON services      FOR SELECT USING (active = true);
CREATE POLICY "hosting_plans public read" ON hosting_plans FOR SELECT USING (active = true);
CREATE POLICY "domains public read"       ON domains       FOR SELECT USING (active = true);
CREATE POLICY "demo_sites public read"    ON demo_sites    FOR SELECT USING (active = true);

-- ----- admin write access on content tables -----
CREATE POLICY "services admin write"      ON services      FOR ALL    USING (public.is_admin());
CREATE POLICY "hosting_plans admin write" ON hosting_plans FOR ALL    USING (public.is_admin());
CREATE POLICY "domains admin write"       ON domains       FOR ALL    USING (public.is_admin());
CREATE POLICY "demo_sites admin write"    ON demo_sites    FOR ALL    USING (public.is_admin());

-- ----- orders: anyone can INSERT (checkout), only admin can SELECT/UPDATE -----
CREATE POLICY "orders public insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders admin read"    ON orders FOR SELECT USING (public.is_admin());
CREATE POLICY "orders admin update"  ON orders FOR UPDATE USING (public.is_admin());

CREATE POLICY "order_items public insert" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "order_items admin read"    ON order_items FOR SELECT USING (public.is_admin());

-- ----- notifications: anyone can insert; admin reads all; users read their own -----
CREATE POLICY "notifications public insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications admin read"    ON notifications FOR SELECT
  USING (public.is_admin() OR recipient = auth.uid() OR recipient IS NULL);
CREATE POLICY "notifications admin update"  ON notifications FOR UPDATE USING (public.is_admin());

-- =============================================================================
-- SEED DATA — mirrors src/data/content.js so the DB starts full
-- =============================================================================
INSERT INTO services (id, icon, title, short, description, features, price, price_value, color, sort_order) VALUES
('web-dev',    '🖥️', 'Website Development',  'Custom websites built with modern tech.',
  'From landing pages to complex web applications — we build fast, responsive, accessible, and SEO-friendly websites tailored to your brand and goals.',
  ARRAY['React / Next.js','Responsive Design','CMS Integration','Performance Optimized','SEO Ready'],
  'from MWK 499,000', 499000, 'indigo', 1),
('ecommerce',  '🛒', 'E-commerce Solutions', 'Sell online with powerful stores.',
  'Full-featured online stores with secure payments, inventory management, shipping integrations, and conversion-focused design.',
  ARRAY['Shopify / WooCommerce','Payment Gateways','Inventory System','Order Management','Mobile Commerce'],
  'from MWK 999,000', 999000, 'purple', 2),
('domain',     '🌐', 'Domain Registration', 'Find and register your perfect domain.',
  'Hundreds of TLDs available with free WHOIS privacy, DNS management, and email forwarding. We help you choose the perfect name.',
  ARRAY['500+ TLDs','Free WHOIS Privacy','DNS Management','Email Forwarding','Easy Transfers'],
  'from MWK 9,990/yr', 9990, 'cyan', 3),
('hosting',    '☁️', 'Web Hosting',          'Reliable hosting for any size project.',
  'Shared, VPS, dedicated, and cloud hosting with 99.99% uptime, free SSL, daily backups, and 24/7 expert support.',
  ARRAY['99.99% Uptime','Free SSL','Daily Backups','CDN Included','24/7 Support'],
  'from MWK 4,990/mo', 4990, 'blue', 4),
('mobile',     '📱', 'Mobile App Development','Native and cross-platform mobile apps.',
  'iOS and Android apps built with React Native and Flutter. From concept to App Store and Google Play deployment.',
  ARRAY['iOS & Android','React Native','Push Notifications','App Store Submission','Maintenance'],
  'from MWK 2,999,000', 2999000, 'pink', 5),
('seo',        '📈', 'SEO & Digital Marketing','Get found. Get customers.',
  'Data-driven SEO, content strategy, social media marketing, and paid advertising to grow your online presence.',
  ARRAY['On-page SEO','Content Strategy','Social Media','PPC Campaigns','Analytics & Reports'],
  'from MWK 299,000/mo', 299000, 'orange', 6),
('security',   '🔒', 'Security & SSL',      'Keep your site safe and trusted.',
  'SSL certificates, malware scanning, DDoS protection, firewall setup, and security audits to keep your business safe.',
  ARRAY['SSL Certificates','Malware Scanner','DDoS Protection','Firewall Setup','Security Audits'],
  'from MWK 49,000/yr', 49000, 'red', 7),
('cloud',      '☁️', 'Cloud Solutions',      'AWS, Azure, and Google Cloud.',
  'Cloud architecture, migration, DevOps, and managed services. We design scalable, secure cloud infrastructure.',
  ARRAY['AWS / Azure / GCP','Cloud Migration','DevOps & CI/CD','Auto-scaling','Cost Optimization'],
  'Custom', 0, 'sky', 8),
('it-consult', '💡', 'IT Consulting',        'Strategic technology guidance.',
  'Technology audits, digital strategy, software selection, and ongoing technical advisory for businesses of all sizes.',
  ARRAY['Tech Audits','Digital Strategy','Software Selection','IT Roadmap','Ongoing Advisory'],
  'from MWK 150,000/hr', 150000, 'yellow', 9),
('email',      '✉️', 'Business Email',       'Professional email @ your domain.',
  'Custom email addresses with your domain. Secure, reliable, spam-protected, with calendar and contacts sync.',
  ARRAY['Custom Domain Email','Spam Protection','Calendar Sync','Mobile Access','50GB+ Storage'],
  'from MWK 2,990/mo', 2990, 'teal', 10),
('maintenance','🛠️', 'Maintenance & Support','We keep your site running perfectly.',
  'Ongoing updates, backups, security patches, performance monitoring, and priority support for your peace of mind.',
  ARRAY['Daily Backups','Security Updates','Performance Monitoring','Priority Support','Monthly Reports'],
  'from MWK 99,000/mo', 99000, 'green', 11),
('design',     '🎨', 'UI/UX Design',         'Beautiful, user-centered design.',
  'User research, wireframing, prototyping, and high-fidelity design that delights users and drives conversions.',
  ARRAY['User Research','Wireframing','Prototyping','Design Systems','Figma Delivery'],
  'from MWK 799,000', 799000, 'rose', 12);

INSERT INTO hosting_plans (id, icon, name, description, price, features, popular, color, sort_order) VALUES
('starter',    '🚀', 'Starter',    'Perfect for personal sites and small projects', 4990,
  ARRAY['1 Website','10 GB SSD Storage','Unmetered Bandwidth','Free SSL Certificate','5 Email Accounts','Daily Backups','24/7 Support'],
  false, 'cyan', 1),
('business',   '💼', 'Business',   'Best for growing businesses and portfolios',     12990,
  ARRAY['Unlimited Websites','100 GB SSD Storage','Unmetered Bandwidth','Free SSL + CDN','Unlimited Email','Daily Backups','Priority Support','Staging Environment'],
  true, 'indigo', 2),
('pro',        '⚡', 'Pro',        'High performance for demanding projects',       29990,
  ARRAY['Unlimited Websites','250 GB NVMe SSD','Unmetered Bandwidth','Free SSL + CDN','Unlimited Email','Hourly Backups','24/7 Phone Support','Staging + Git'],
  false, 'purple', 3),
('enterprise', '🏢', 'Enterprise', 'Maximum power, dedicated resources',           89990,
  ARRAY['Dedicated Resources','1 TB NVMe SSD','Unmetered Bandwidth','Advanced Security','Dedicated IP','Real-time Backups','Dedicated Account Manager','Custom Configuration'],
  false, 'amber', 4);

INSERT INTO domains (name, price, popular, description, sort_order) VALUES
('.com',  9990,  true,  'The classic. Recognized worldwide.', 1),
('.net',  12990, true,  'Great for tech and network services.', 2),
('.org',  11990, false, 'Ideal for non-profits and communities.', 3),
('.io',   39990, true,  'Perfect for tech startups and SaaS.', 4),
('.dev',  14990, true,  'Built for developers and tools.', 5),
('.co',   24990, false, 'Short, modern, and memorable.', 6),
('.ai',   89990, true,  'Premium choice for AI products.', 7),
('.app',  17990, false, 'Built for mobile and web apps.', 8),
('.tech', 19990, true,  'Show your tech focus clearly.', 9),
('.cloud',6990,  false, 'Affordable choice for cloud services.', 10),
('.shop', 4990,  false, 'Perfect for online stores.', 11),
('.store',4990,  false, 'Built for retail and commerce.', 12),
('.xyz',  2990,  false, 'Bold, creative, and affordable.', 13),
('.me',   19990, false, 'Personal branding done right.', 14),
('.info', 3990,  false, 'Information sites at a great price.', 15),
('.biz',  14990, false, 'Made for business websites.', 16),
('.us',   8990,  false, 'American identity and presence.', 17),
('.uk',   7990,  false, 'UK presence for your brand.', 18),
('.de',   8990,  false, 'Reach the German market.', 19),
('.fr',   9990,  false, 'French market made easy.', 20),
('.ca',   14990, false, 'Canadian identity online.', 21),
('.au',   14990, false, 'Australian presence made simple.', 22),
('.jp',   49990, false, 'Reach Japan with this premium TLD.', 23),
('.in',   6990,  false, 'Indian market at an affordable rate.', 24);

INSERT INTO demo_sites (title, category, description, tech, image, color, features, url, sort_order) VALUES
('Hotel Management System', 'Hospitality', 'Complete hotel operations platform with room booking, guest management, housekeeping, billing, and real-time availability tracking.', ARRAY['React','Node.js','PostgreSQL','Express'], '🏨', 'from-rose-500 to-pink-500', ARRAY['Room booking','Guest check-in/out','Housekeeping','Billing & invoicing','Reports'], '#demo-hotel', 1),
('School Management System', 'Education', 'End-to-end school administration covering admissions, attendance, grading, timetables, parent portal, and fee management.', ARRAY['Next.js','TypeScript','Prisma','PostgreSQL'], '🏫', 'from-indigo-500 to-purple-500', ARRAY['Admissions','Attendance','Grades & exams','Timetable','Parent portal'], '#demo-school', 2),
('Loan Management System', 'Finance', 'Robust loan origination, repayment tracking, interest calculation, and borrower management for microfinance and banks.', ARRAY['React','Laravel','MySQL','Redis'], '💰', 'from-amber-500 to-orange-500', ARRAY['Loan applications','Repayment schedule','Interest calc','Borrower KYC','Reports'], '#demo-loan', 3),
('Stock Management System', 'Inventory', 'Real-time inventory tracking with purchase orders, sales, supplier management, and low-stock alerts for any retail business.', ARRAY['React','Node.js','MongoDB','Chart.js'], '📦', 'from-emerald-500 to-teal-500', ARRAY['Inventory tracking','Purchase orders','Sales','Suppliers','Low-stock alerts'], '#demo-stock', 4),
('Beneficiary Tracking System', 'NGO / Government', 'Track aid distribution, beneficiary records, household data, and program participation for NGOs and government programs.', ARRAY['Next.js','Django','PostgreSQL','Leaflet'], '🤝', 'from-cyan-500 to-blue-500', ARRAY['Beneficiary registry','Aid distribution','Household data','GPS mapping','Reports'], '#demo-beneficiary', 5),
('Village & Savings Management System', 'Microfinance', 'Manage village savings groups, share-out cycles, member contributions, and loans for community-based financial groups.', ARRAY['React','Express','MongoDB','PDF'], '🏘️', 'from-lime-500 to-green-500', ARRAY['Member registry','Savings cycles','Internal lending','Share-out','Receipts'], '#demo-village-savings', 6),
('Hospital Management System', 'Healthcare', 'Comprehensive hospital platform for patient records, appointments, prescriptions, lab results, billing, and pharmacy.', ARRAY['React','Node.js','PostgreSQL','AWS'], '⚕️', 'from-teal-500 to-cyan-500', ARRAY['Patient records','Appointments','Prescriptions','Lab results','Billing'], '#demo-hospital', 7),
('POS System', 'Retail', 'Point-of-sale system for shops and supermarkets with barcode scanning, receipts, multi-payment support, and daily reports.', ARRAY['React','Node.js','SQLite','Thermal Printer'], '🧾', 'from-sky-500 to-indigo-500', ARRAY['Barcode scanning','Multi-payment','Receipts','Daily reports','Multi-branch'], '#demo-pos', 8),
('Bar Management System', 'Hospitality', 'Manage bar inventory, tab tracking, drink menus, stock depletion, and shift reports for bars, clubs, and lounges.', ARRAY['React','Express','MySQL','Socket.io'], '🍸', 'from-fuchsia-500 to-purple-500', ARRAY['Tab tracking','Drink menu','Stock depletion','Shift reports','Waiter app'], '#demo-bar', 9),
('Online Shopping System', 'E-commerce', 'Multi-vendor or single-store online shop with product catalog, cart, secure payments, order tracking, and customer accounts.', ARRAY['Next.js','Node.js','MongoDB','Stripe'], '🛍️', 'from-pink-500 to-rose-500', ARRAY['Product catalog','Cart & checkout','Payments','Order tracking','Customer accounts'], '#demo-online-shop', 10),
('Accounting System', 'Finance', 'Full-featured accounting platform with chart of accounts, general ledger, accounts receivable/payable, invoicing, expense tracking, and financial reports.', ARRAY['React','Laravel','MySQL','Chart.js'], '📊', 'from-emerald-500 to-teal-500', ARRAY['Chart of accounts','General ledger','Invoicing','Expenses','Financial reports'], '#demo-accounting', 11),
('Human Resource System', 'HR', 'Complete HR platform covering employee records, recruitment, onboarding, attendance, leave, payroll, and performance management.', ARRAY['React','Node.js','PostgreSQL','Express'], '👥', 'from-blue-500 to-indigo-500', ARRAY['Employee records','Recruitment','Leave & attendance','Payroll','Performance'], '#demo-hr', 12);

-- =============================================================================
-- demo_requests — submitted from the /demos/request/:id form
-- =============================================================================
CREATE TABLE IF NOT EXISTS demo_requests (
  id              BIGSERIAL PRIMARY KEY,
  demo_id         INT NOT NULL,
  demo_title      TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  company         TEXT,
  project_name    TEXT,
  project_desc    TEXT,
  budget          TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_requests public insert" ON demo_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "demo_requests admin all" ON demo_requests FOR ALL USING (public.is_admin());

-- =============================================================================
-- contact_messages — form submissions from /contact
-- =============================================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id          BIGSERIAL PRIMARY KEY,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  company     TEXT,
  budget      TEXT,
  message     TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_messages public insert" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_messages admin all" ON contact_messages FOR ALL USING (public.is_admin());

-- =============================================================================
-- testimonials — client quotes shown on /demos and /about
-- =============================================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id          BIGSERIAL PRIMARY KEY,
  quote       TEXT NOT NULL,
  name        TEXT NOT NULL,
  role        TEXT,
  initials    TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials public read" ON testimonials FOR SELECT USING (active = true);
CREATE POLICY "testimonials admin all" ON testimonials FOR ALL USING (public.is_admin());

INSERT INTO testimonials (quote, name, role, initials, sort_order, active) VALUES
('CODE TECH delivered our e-commerce site ahead of schedule. Sales jumped 240% in the first month.', 'Sarah Mitchell', 'CEO, Luxe Fashion', 'SM', 1, true),
('The team built our SaaS dashboard with incredible attention to detail. Our users love it.', 'David Chen', 'CTO, CloudSync', 'DC', 2, true),
('From concept to launch in 6 weeks. Communication was stellar throughout. Highly recommend!', 'Maria Rodriguez', 'Founder, EduLearn', 'MR', 3, true);

-- =============================================================================
-- site_settings — key-value store for hero, about, footer, contact texts
-- =============================================================================
CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings public read" ON site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings admin all" ON site_settings FOR ALL USING (public.is_admin());

INSERT INTO site_settings (key, value) VALUES
('hero_title', 'We build digital solutions that transform businesses in Malawi'),
('hero_subtitle', 'From websites and mobile apps to cloud infrastructure and IT consulting — CODE TECH delivers enterprise-grade technology for Malawian businesses.'),
('hero_cta', 'Explore Services'),
('about_title', 'We are CODE TECH'),
('about_body', 'Based in Malawi, CODE TECH is a full-service technology company specialising in web development, mobile apps, cloud solutions, and IT consulting. We help businesses leverage technology to grow, compete, and succeed in the digital age. Founded in 2020, we have delivered 50+ projects across multiple industries.'),
('footer_tagline', 'Building digital solutions for a connected Malawi.'),
('contact_email', 'hello@codetech.io'),
('contact_phone', '+265 995 479 580');

-- =============================================================================
-- PROMOTE YOUR FIRST ADMIN
-- =============================================================================
-- After you create your user in Supabase Auth (Authentication → Users → Add user),
-- run the following UPDATE (replace with your email):

-- UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'you@example.com');
