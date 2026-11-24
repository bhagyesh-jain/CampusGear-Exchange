# CampusGear Exchange — Complete Deployment & Setup Instruction Manual

> **Project:** CampusGear Exchange — Semester Textbook & Lab-Gear Exchange Board  
> **Engineered by:** Bhagyesh Jain  
> **Institution:** Acropolis Institute of Technology and Research (AITR), Indore  
> **Architecture:** Pure React 18 + Vite Frontend with Supabase Backend-as-a-Service (PostgreSQL, RLS, Auth, Storage)

---

## 📋 Table of Contents
1. [Architecture & Philosophy](#1-architecture--philosophy)
2. [Prerequisites](#2-prerequisites)
3. [Step 1: Supabase Cloud Setup](#step-1-supabase-cloud-setup)
4. [Step 2: Database Migrations (SQL Setup)](#step-2-database-migrations-sql-setup)
5. [Step 3: Storage Bucket Configuration](#step-3-storage-bucket-configuration)
6. [Step 4: Provisioning Base User Accounts](#step-4-provisioning-base-user-accounts)
7. [Step 5: Local Frontend Development](#step-5-local-frontend-development)
8. [Step 6: Testing & QA Verification](#step-6-testing--qa-verification)
9. [Step 7: Production Deployment (Vercel)](#step-7-production-deployment-vercel)
10. [Troubleshooting & FAQs](#troubleshooting--faqs)

---

## 1. Architecture & Philosophy

CampusGear Exchange eliminates custom backend servers (e.g. Flask/Express) in favor of a **Serverless Database-First Architecture**:
- **Frontend**: React 18, Vite, React Router v6, plain semantic CSS with custom design tokens (`tokens.css`).
- **Backend & Database**: Supabase PostgreSQL.
- **Security**: Row Level Security (RLS) on every table and PostgreSQL `SECURITY DEFINER` stored procedure functions with locked `search_path = ''`.
- **Photo Storage**: Supabase Storage (`listing-images` bucket) with owner-isolated upload paths (`listing-images/{uid}/*`).
- **Client Security**: The React frontend uses **only** the Supabase Anonymous Key (`VITE_SUPABASE_ANON_KEY`). The service role key is **never** committed or exposed to the client.

---

## 2. Prerequisites

Make sure the following tools are installed on your machine:
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher (bundled with Node)
- **Git**: Latest version ([Download Git](https://git-scm.com/))
- A free **Supabase Account** ([Sign up at Supabase](https://supabase.com/))

---

## Step 1: Supabase Cloud Setup

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project**.
3. Choose an organization, enter Project Name: `CampusGear`, and set a strong database password.
4. Select your preferred region (e.g. `ap-south-1` / Mumbai for India).
5. Once your project finishes provisioning, navigate to **Project Settings (⚙️) → API**:
   - Copy **Project URL** (e.g. `https://xyzproject.supabase.co`).
   - Copy **`anon` `public`** key (starts with `eyJhbGci...`).
   - Copy **`service_role` `secret`** key (starts with `eyJhbGci...`). Keep this private!

---

## Step 2: Database Migrations (SQL Setup)

Open your **Supabase Dashboard → SQL Editor**.  
Run the 5 migration scripts located in `supabase/migrations/` in sequential order:

### 1. Run `0001_schema.sql`
- **What it does**: Creates the 12 core tables (`institutions`, `categories`, `profiles`, `profile_private`, `listings`, `listing_images`, `interest_requests`, `reports`, `user_blocks`, `admin_roles`, `admin_audit`, `contact_messages`), indexes, updated_at triggers, and automated user signup trigger.
- **Copy from**: [`supabase/migrations/0001_schema.sql`](./supabase/migrations/0001_schema.sql)
- **Action**: Paste into SQL Editor and click **Run**. Expect: `Success. No rows returned`.

### 2. Run `0002_rls.sql`
- **What it does**: Enables Row Level Security (RLS) on all tables, revokes public permissions, and sets least-privilege security policies. Direct table inserts/updates on `listings` are restricted.
- **Copy from**: [`supabase/migrations/0002_rls.sql`](./supabase/migrations/0002_rls.sql)
- **Action**: Paste into SQL Editor and click **Run**. Expect: `Success. No rows returned`.

### 3. Run `0003_functions.sql`
- **What it does**: Installs the 19 `SECURITY DEFINER` stored procedures (`create_listing`, `update_listing`, `remove_listing`, `mark_listing_sold`, `create_interest_request`, `respond_to_request`, `get_seller_contact`, `search_listings`, `admin_*`, etc.).
- **Copy from**: [`supabase/migrations/0003_functions.sql`](./supabase/migrations/0003_functions.sql)
- **Action**: Paste into SQL Editor and click **Run**. Expect: `Success. No rows returned`.

### 4. Run `0004_storage.sql`
- **What it does**: Creates the `listing-images` storage bucket (public read, 2MB max file size, allowed MIME types: jpeg, png, webp) and enforces folder-level upload isolation (`auth.uid()`).
- **Copy from**: [`supabase/migrations/0004_storage.sql`](./supabase/migrations/0004_storage.sql)
- **Action**: Paste into SQL Editor and click **Run**. Expect: `Success. No rows returned`.

### 5. Run `0005_institution_type.sql`
- **What it does**: Adds the `institution_type` constraint (`'school'`, `'college'`) and inserts *Acropolis Institute of Technology and Research* (Indore) as the primary institution.
- **Copy from**: [`supabase/migrations/0005_institution_type.sql`](./supabase/migrations/0005_institution_type.sql)
- **Action**: Paste into SQL Editor and click **Run**. Expect: `Success. No rows returned`.

---

## Step 3: Storage Bucket Configuration

Verify the storage bucket in your **Supabase Dashboard → Storage**:
1. Check that the bucket `listing-images` is present.
2. Ensure **Public bucket** is checked (photos are public listing media).
3. If not created automatically by `0004_storage.sql`, create a bucket named `listing-images` with Public enabled and 2097152 bytes (2MB) limit.

---

## Step 4: Provisioning Base User Accounts

We provide an idempotent Node.js script to provision the primary accounts:
- **Bhagyesh Jain** (`bhagyeshjain@gmail.com`) — Student Seller / Buyer (B.Tech CSIT, 3rd Year, graduating 2028)
- **Priya Nair** (`priya.nair@ietdavv.edu`) — Student Buyer / Seller (B.Tech IT, 2nd Year)
- **CampusGear Admin** (`admin@campusgear.test`) — Platform Administrator

### Execution:
1. In the `scripts/` directory, create `scripts/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   SEED_ADMIN_EMAIL=admin@campusgear.test
   ```
2. Run the script:
   ```bash
   node scripts/create_base_users.mjs
   ```
3. The script will:
   - Create accounts with email confirmed.
   - Assign the `admin` role in `admin_roles` for the admin account.
   - Generate secure 16-character passwords and write them to `scripts/.credentials.local` (gitignored).
   - Display a summary table in your terminal.

---

## Step 5: Local Frontend Development

### 1. Configure Frontend Environment (Optional for Live Mode)
In the `web/` directory, create a `.env.local` file:
```bash
cd web
cp .env.example .env.local
```

Edit `web/.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

*(Note: When `.env.local` is omitted or empty, CampusGear Exchange automatically operates in zero-dependency Demo Mode with 18 sample items and instant 1-click logins).*

### 2. Install Dependencies & Start
```bash
# Inside web/
npm install
npm run dev
```

Open **`http://localhost:5173`** in your browser. The live CampusGear marketplace will load immediately!

---

## Step 6: Testing & QA Verification

### Recommended Walkthrough Test:
1. **Bhagyesh Lists an Item for Exchange**:
   - Sign in as `bhagyeshjain@gmail.com`.
   - Go to `+ List Item`, choose item type (Book or Lab Gear), upload 1-3 photos, enter title (e.g. *Engineering Drafter Set*), category, branch (*CSIT*), semester (*1*), pickup point (*AITR Central Library*), condition (*Good*), and price in Rupees. Submit.
2. **Priya Sends Request**:
   - Open an incognito window or sign out and sign in as `priya.nair@ietdavv.edu`.
   - Browse or search the listing on Home/Search. Click the card to open Details.
   - Click **"🤝 Request Item"** and send a request message. Notice seller's phone and email remain private.
3. **Bhagyesh Accepts & Schedules Pickup**:
   - Log back into Bhagyesh's account. Navigate to **Requests → Selling**.
   - Click **Accept**.
   - Click **Schedule Pickup**, choose location (*AITR Central Library*) and pickup time (*Tomorrow 1:30 PM*).
4. **Priya Retrieves Contact**:
   - Under Priya's **Requests → Buying**, the request displays **Pickup Scheduled** and reveals the **"Chat on WhatsApp"** button (`https://wa.me/...`).
5. **Mark as Handed Over**:
   - As Bhagyesh or Priya, click **Mark Handed Over**. The item transitions to Handed Over, leaves active search, and open requests close atomically.
6. **Admin Panel**:
   - Log in as `admin@campusgear.test`. Navigate to `/admin` to review campus stats, active listings, reported issues, and audit logs.

---

## Step 7: Production Deployment (Vercel)

### 1. Push to a Clean GitHub Repository
Push your clean repository to GitHub:
```bash
# Instructions in root README for initializing new remote
git push -u origin main
```

### 2. Connect to Vercel
1. Go to [Vercel](https://vercel.com/) and click **Add New → Project**.
2. Select your repository.
3. Configure settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables** in Vercel:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-public-key`
5. Click **Deploy**. Vercel will build and assign your live production URL (e.g. `https://campusgear.vercel.app`).

### 3. Update Supabase Auth URL Configuration
In your **Supabase Dashboard → Authentication → URL Configuration**:
1. Set **Site URL** to your Vercel URL:  
   `https://your-app.vercel.app`
2. Add to **Redirect URLs**:  
   `https://your-app.vercel.app/**`  
   `http://localhost:5173/**`
3. Click **Save**.

---

## Troubleshooting & FAQs

### Q: I see `TypeError: Failed to fetch` on the homepage.
**Fix**: `web/.env.local` is missing or contains placeholder values. Either remove `.env.local` to run in offline Demo Mode, or set valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then restart Vite (`npm run dev`).

### Q: Refreshing a route like `/search` or `/profile` gives a 404 on Vercel.
**Fix**: CampusGear includes [`web/vercel.json`](./web/vercel.json) with single-page application (SPA) rewrites to redirect all routes to `index.html`. Ensure `vercel.json` is deployed.

### Q: Image upload fails with `Row Level Security policy violation`.
**Fix**: Ensure `0004_storage.sql` has been executed in the Supabase SQL editor. It ensures authenticated users can upload files into `listing-images/{uid}/*` matching their auth UID.

### Q: Where are account passwords stored?
**Fix**: In accordance with the security brief, passwords are never committed to git. Passwords generated during provisioning are stored locally in `scripts/.credentials.local`. You can reset passwords anytime using:
```bash
node scripts/create_base_users.mjs --reset-passwords
```

---

*CampusGear Exchange is developed and maintained by Bhagyesh Jain, Acropolis Institute of Technology and Research (AITR), Indore.*
