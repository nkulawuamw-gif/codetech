# CODE TECH

A modern, beautiful React website for **CODE TECH** — a one-stop IT solutions company that sells websites, domains, hosting, and complete IT services.

Built with **React 18 + Vite**, **React Router**, **Supabase (PostgreSQL)**, and modern CSS. No UI framework dependencies — every component is hand-crafted.

## ✨ Features

- **Home** — Animated hero with orbital tech icons, stats, services preview, technologies, hosting preview, demos preview, CTA
- **Services** — 12 services users can **multi-select** to build a custom quote. Live running total with bundle discounts. Add to cart.
- **Domains** — 24 TLDs with pricing, search, filter, free WHOIS privacy info. Add to cart.
- **Hosting** — 4 plans (Starter, Business, Pro, Enterprise) with monthly/yearly toggle, plus 6 hosting types. Add to cart.
- **Demos** — 12 management system demos (Hotel, School, Loan, Stock, Beneficiary, Village Savings, Hospital, POS, Bar, Online Shop, Accounting, HR) with category filter and detailed modal view.
- **Contact** — Full contact form with service pre-selection from /services, info sidebar, live chat CTA, WhatsApp buttons.
- **Cart + Checkout** — 3-step flow (Cart → Details → Payment) with three Malawi payment methods: **Airtel Money**, **TNM Mpamba**, and **Bank Transfer**.
- **Notifications** — Bell icon with unread badge, dropdown panel, and full `/notifications` page. Persisted to localStorage.
- **About** — Mission, values, tech stack, team, company timeline.
- **Admin Console** (`/admin`) — Sign in with Supabase Auth and manage services, hosting plans, demo portfolio, and orders from a single dashboard.

## 🎨 Design

- Dark, modern, tech-inspired theme
- Animated background with floating gradient orbs and grid pattern
- Glass-morphism cards with backdrop blur
- Custom scrollbar, gradient text, and smooth animations
- Fully responsive (mobile, tablet, desktop)
- Malawi-specific: prices in **MWK** (Malawi Kwacha) and local payment methods (Airtel Money, TNM Mpamba, Bank)

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The site works **out of the box without any database** — it uses the local data in `src/data/content.js`. To enable the admin panel and order persistence, connect Supabase (instructions below).

## 🗄️ Connecting to Supabase (free PostgreSQL backend)

The site uses **Supabase** for its backend (auth + database + storage). The free tier is genuinely free forever — 500 MB database, 50,000 monthly users, 1 GB file storage.

### 1. Create a Supabase project
1. Go to **https://supabase.com** and sign up (free)
2. Click **"New Project"**, give it a name (e.g. `code-tech`), and set a database password
3. Wait ~1 minute for it to provision

### 2. Run the schema
1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `supabase/schema.sql` from this project, copy the entire contents, paste into the editor
4. Click **"Run"** (or press `Ctrl+Enter`)
5. You should see "Success. No rows returned" — this creates all tables, indexes, RLS policies, and seeds the data

### 3. Get your API keys
1. In your Supabase dashboard, go to **Project Settings → API**
2. Copy the **Project URL** and the **`anon` `public`** key

### 4. Configure your local environment
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Edit `.env.local` and fill in your values:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key
   ```
3. Restart the dev server: `npm run dev`

### 5. Create your admin user
1. In your Supabase dashboard, go to **Authentication → Users**
2. Click **"Add user" → "Create new user"**
3. Enter your email and password (use a real email — Supabase may send a confirmation)
4. After the user is created, go back to **SQL Editor** and run this (replacing the email):
   ```sql
   UPDATE profiles SET role = 'admin'
   WHERE id = (SELECT id FROM auth.users WHERE email = 'you@example.com');
   ```

### 6. Sign in to the admin panel
Open **http://localhost:3000/admin/login** and sign in with the credentials you created. You can now edit services, hosting plans, and demos from the dashboard, and view orders as customers place them.

## 📁 Project Structure

```
code-tech/
├── public/
│   └── logo.svg                     # Favicon
├── supabase/
│   └── schema.sql                   # Full DB schema + seed data + RLS
├── src/
│   ├── components/
│   │   ├── Navbar.jsx + .css        # Sticky nav, cart icon, notification bell
│   │   ├── Footer.jsx + .css        # Multi-column footer
│   │   ├── NotificationBell.jsx     # Bell + dropdown
│   │   └── ScrollToTop.jsx
│   ├── context/
│   │   ├── AuthContext.jsx          # Supabase auth + admin role check
│   │   ├── CartContext.jsx          # Cart state + localStorage
│   │   └── NotificationsContext.jsx # Notification state
│   ├── data/
│   │   └── content.js               # Local seed data (used when no DB)
│   ├── hooks/
│   │   └── useContent.js            # React hook for fetching data
│   ├── lib/
│   │   └── supabase.js              # Supabase client init
│   ├── pages/
│   │   ├── Home.jsx + .css
│   │   ├── Services.jsx + .css      # Service selector + add-to-cart
│   │   ├── Domains.jsx + .css       # Domain list + search + add-to-cart
│   │   ├── Hosting.jsx + .css       # Hosting plans + add-to-cart
│   │   ├── Demos.jsx + .css         # Portfolio + modal
│   │   ├── Contact.jsx + .css
│   │   ├── About.jsx + .css
│   │   ├── Cart.jsx + .css          # 3-step checkout w/ payment methods
│   │   ├── Notifications.jsx + .css # Full notification history
│   │   ├── AdminLogin.jsx + .css    # Supabase auth sign-in
│   │   ├── Admin.jsx + .css         # Admin dashboard
│   │   └── shared-pages.css
│   ├── services/
│   │   └── api.js                   # Supabase read/write + fallback
│   ├── styles/
│   │   ├── global.css               # Design tokens, utilities
│   │   └── App.css
│   ├── App.jsx                      # Routes
│   └── main.jsx
├── .env.example                     # Copy to .env.local
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

## 🔌 Database Schema (Supabase / PostgreSQL)

| Table | Purpose |
|---|---|
| `services` | The 12 service packages |
| `hosting_plans` | The 4 hosting tiers |
| `domains` | The 24 TLDs |
| `demo_sites` | The 12 management system demos |
| `orders` | Customer orders from `/cart` checkout |
| `order_items` | Line items for each order |
| `notifications` | Activity feed for the bell icon |
| `profiles` | Per-user metadata, with a `role` field (`customer` or `admin`) |

All tables have **Row Level Security** enabled:
- **Public read**: services, hosting plans, domains, demos (any visitor)
- **Public insert**: orders, order_items, notifications (so checkout works)
- **Admin-only write**: services, hosting plans, domains, demos
- **Admin-only read**: orders, order_items
- **Admin or owner read**: notifications

## 🛠️ Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool & dev server
- **React Router 6** — Client-side routing
- **Supabase JS** — Auth + PostgreSQL client
- **React Icons** — Icon library
- **Hand-written CSS** — Custom design system with CSS variables

## 📞 Contact

- **Phone / WhatsApp:** +265 995 479 580 · +265 995 818 766
- **Email:** hello@codetech.io

---

© 2026 CODE TECH. Crafted with passion.
