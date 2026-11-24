# CampusGear Exchange — Semester Textbook & Lab-Gear Exchange Board

> **AITR Peer-to-Peer Academic Exchange Platform**  
> Engineered by **Bhagyesh Jain**  
> *Acropolis Institute of Technology and Research (AITR), Indore*

---

**CampusGear Exchange** is a verified student-first campus exchange platform built for AITR students to buy, sell, lend, and exchange course textbooks and laboratory equipment (drafters, scientific calculators, lab coats, aprons, safety goggles, and toolkits) with zero middleman markups.

Built with **React 18**, **Vite**, and **Supabase** (PostgreSQL, Row Level Security, Auth, and Storage). Designed with responsive ergonomics (Navy `#243B64`, Soft Blue `#EAF2FF`, Gold `#F4C95D`), accessible WCAG AA standards, and touch targets down to 360px viewport.

> 📖 **Deployment & Setup Guide**: For full instructions on connecting a live Supabase backend, database migrations, base user provisioning, and Vercel deployment, see [**INSTRUCTION_MANUAL.md**](./INSTRUCTION_MANUAL.md).

---

## ⚡ Quick Start: Running in Demo Mode

CampusGear Exchange includes a built-in offline **Demo Mode** requiring **zero configuration, zero external database setup, and zero API keys**.

### 1. Install & Launch
```bash
# Clone repository and enter project root
cd web

# Install frontend dependencies
npm install

# Start development server
npm run dev
```

Open **`http://localhost:5173`** in your browser. The app runs seamlessly in Demo Mode with 18 verified academic items (books and lab gear), branch/semester filtering, pickup coordination, and 4-step handover tracking.

### 2. Built-in Demo Accounts
- **Bhagyesh Jain** (Seller): `bhagyeshjain@gmail.com` (B.Tech CSIT, 3rd Year, graduating 2028)
- **Priya Nair** (Buyer): `priya.nair@ietdavv.edu` (B.Tech IT, 2nd Year)
- Fast 1-click login buttons are available directly on the `/login` page.

---

## 🎯 5-Step Hackathon Demo Walkthrough

Use this exact 5-step script to showcase the core MVP features to hackathon judges:

1. **Step 1: Search CSIT Sem 1 Lab Gear**
   - Navigate to `/search` or use the home search bar.
   - Filter by **Item Type**: `⚙️ Lab Gear Only`, **Branch**: `CSIT`, and **Semester**: `Semester 1`.
   - The catalog filters immediately to show the **Engineering Drafter Set** (Rs 450, Good Condition, AITR Central Library pickup).

2. **Step 2: Request the Drafter as Priya Nair (Buyer)**
   - Click **Login** and choose the 1-click **Priya Nair (Buyer)** demo login.
   - Click on the **Engineering Drafter Set** card to open details.
   - Click **🤝 Request Item** and submit your request note: *"Hi Bhagyesh, I need the drafter for CSIT Sem 1 drawing lab!"*.
   - Tracker updates to **Step 1: Requested (Pending)**.

3. **Step 3: Accept Request as Bhagyesh Jain (Seller)**
   - Sign in as **Bhagyesh Jain (Seller)** using the 1-click demo button.
   - Go to **Requests → Selling**. The incoming request from Priya is displayed.
   - Click **Accept Request**. The request transitions to **Step 2: Accepted**.

4. **Step 4: Schedule Pickup at Central Library**
   - Click **Schedule Pickup**.
   - Select pickup point: **AITR Central Library** and pickup time: **Tomorrow 1:30 PM (Lunch Break)**.
   - Click **Confirm Pickup**. Both parties now see **Step 3: Pickup Scheduled** with the designated location and time, plus the buyer's WhatsApp contact coordination button.

5. **Step 5: Complete Exchange & Mark Handed Over**
   - Click **Mark Handed Over** on the tracker.
   - The status transitions to **Step 4: Handed Over**.
   - The listing is automatically closed/marked sold, and all pending requests for that item are atomically settled.

---

## 🛠️ Key Architectural Features

1. **Lab Gear & Textbook Catalog**:
   - First-class support for both course textbooks and physical lab gear (engineering drafters, fx-991 calculators, lab coats, instrument kits).
   - Dynamic SVG vector covers generated on-the-fly.

2. **Branch & Semester Filtering**:
   - Filter listings by branch (`CSIT`, `CSE`, `EC`, `EE`, `ME`, `CE`) and semester (`1` to `8`).
   - Integrated into catalog search RPC and listing creation forms.

3. **Designated Campus Pickup Points**:
   - Structured handover zones across AITR campus: *AITR Central Library*, *Main Canteen*, *CSIT Block*, *Hostel Gate*, and *Mechanical Workshop*.
   - Prevents unsafe meetups and ensures predictable campus handshakes.

4. **4-Step Handover Progress Tracker**:
   - Visual step tracker: `Requested (Pending) → Accepted → Pickup Scheduled → Handed Over`.
   - Live synchronization across seller and buyer views with atomic listing resolution.

5. **Dual-Mode Operation**:
   - Runs offline via in-memory/localStorage `DemoStore` or connects to Supabase PostgreSQL with Row Level Security (RLS) policies and SECURITY DEFINER stored procedures.

---

## 📁 Repository Structure

```text
campusgear/
├── web/                       # React 18 + Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable UI, BookCard, HandoverTracker, Layout
│   │   ├── context/           # AuthContext (session, role state)
│   │   ├── lib/               # demoData.js, demoStore.js, mockClient.js, supabase.js
│   │   ├── pages/             # HomePage, SearchPage, BookDetailPage, SellPage, RequestsPage, LoginPage
│   │   └── styles/            # CSS tokens (Navy #243B64, Soft Blue #EAF2FF, Gold #F4C95D)
│   ├── tests/                 # Automated verification tests (verifyDemo.test.js)
│   ├── package.json           # Frontend dependencies (campusgear-web)
│   └── vite.config.js         # Vite configuration
├── supabase/
│   └── migrations/            # Sequential SQL migrations (0001 - 0005)
├── scripts/
│   ├── create_base_users.mjs  # Local Node provisioner for base accounts
│   ├── seed.mjs               # Test database seeding script
│   └── .env.example           # Admin credentials template
├── tests/
│   └── seed_and_security.test.mjs # Real Supabase integration & security tests
├── .gitignore                 # Safe gitignore protecting credentials and docx files
├── vercel.json                # Vercel deployment configuration
├── INSTRUCTION_MANUAL.md      # Full Supabase & Vercel deployment manual
└── README.md
```

---

## 🧪 Verification & Testing

Run the automated demo suite to test all 5 core capabilities in under 1 second:
```bash
node web/tests/verifyDemo.test.js
```

Build verification:
```bash
cd web
npm run build
```

---

## 📄 License

MIT © Bhagyesh Jain, Acropolis Institute of Technology and Research (AITR), Indore.
