# FinFlow — Personal Finance OS 💸

> Track wealth. Control burns. Build your future.

A high-performance **Progressive Web App** built with Next.js 15 (App Router), Tailwind CSS, and Supabase.  
Dark-mode · Glassmorphic · Mobile-first · Installable on iQOO Z3 5G (or any Android/iOS device).

---

## ✨ Feature Overview

| Feature | Description |
|---|---|
| **True Burn** | Monthly spend minus one-time setup costs |
| **Wealth Ratio Gauge** | SVG circular progress: (SIP + Family) ÷ Income, targets 50% |
| **Quick Entry** | 3-step numpad → category → confirm. Log in under 3 seconds |
| **Daily Limit** | Real-time "Spendable Today" based on remaining Wants budget |
| **Family Safety Net** | Dedicated remittance portal — total money sent home, timeline |
| **Smart Search** | ⌘K command palette, searches by category, note, amount |
| **Spending Trend** | Cumulative area chart for the current month |
| **6-Month Bar Chart** | Compare Total vs True Burn across 6 months |
| **Category Pie** | Breakdown of spending by category this month |
| **Smart Insights** | Overspend alerts, wealth target badge, daily run-rate |
| **Budget Settings** | Drag sliders to configure income, needs, wants, savings |
| **PWA Install** | manifest.json + Workbox service worker for offline use |

---

## 🗄 Database Schema

```
transactions        categories          remittances         budgets
──────────────      ──────────────      ──────────────      ──────────────
id (uuid PK)        id (uuid PK)        id (uuid PK)        id (uuid PK)
amount              name UNIQUE         amount              month UNIQUE
date                icon                date                monthly_income
category_name       color               recipient           wants_budget
payment_method      is_wealth_building  payment_method      needs_budget
note                                    note                savings_target
is_setup_cost   ← excludes True Burn
is_wealth_building ← counts in ratio
```

### Preset categories
`Rent` · `Mess/Food` · `Daily Needs` · `Tech/Gaming` · `Skincare` · **`Family Support`** ✦ · **`SIP/Investments`** ✦ · `Transport` · `Entertainment` · `Health` · `Utilities` · `Other`

✦ = `is_wealth_building = true` (counted in Wealth Ratio)

---

## 🚀 Quick Start (5 minutes)

### 1 — Clone & install
```bash
git clone https://github.com/yourname/finflow-pwa
cd finflow-pwa
npm install
```

### 2 — Create Supabase project
1. Go to [supabase.com](https://supabase.com) → **New project**
2. **SQL Editor** → paste the contents of `supabase/migrations/001_schema.sql` → **Run**

### 3 — Add environment variables
```bash
cp .env.local.example .env.local
```
Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_MONTHLY_INCOME=80000
```

### 4 — Run locally
```bash
npm run dev
# open http://localhost:3000
```

---

## 🌐 Deploy to Vercel

### Option A — One-click
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourname/finflow-pwa)

### Option B — CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

Add env vars in **Vercel Dashboard → Settings → Environment Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MONTHLY_INCOME`

---

## 📲 Install as PWA on iQOO Z3 5G

After deploying to Vercel:

1. Open **Chrome** on your iQOO Z3 5G
2. Navigate to your Vercel URL (e.g. `https://finflow.vercel.app`)
3. Tap **⋮ (three-dot menu)** → **"Add to Home screen"**
4. Name it **FinFlow** → tap **Add**
5. App appears on your home screen — launch it like a native app!

The app uses **Workbox** for offline-first caching, so previously loaded data is available even without internet.

---

## 🎨 Design System

| Token | Hex | Used for |
|---|---|---|
| `--cyan`   | `#00f5d4` | Primary CTAs, True Burn highlight |
| `--amber`  | `#ffb703` | Wealth, investments, income |
| `--green`  | `#06d6a0` | Family support, positive states |
| `--rose`   | `#ff006e` | Burns, alerts, overspend |
| `--violet` | `#7b2fff` | Rent, wants budget, analytics |
| `--blue`   | `#00b4d8` | Needs, charts, trends |
| `--bg-base`| `#030507` | Root background |

**Fonts:** Syne (display headings) · Space Grotesk (body) · JetBrains Mono (numbers/amounts)

---

## ⚙️ Customise Your Budget

Edit `lib/utils.ts`:
```ts
export const DEFAULT_INCOME         = 80_000;   // ← your monthly take-home
export const DEFAULT_WANTS_BUDGET   = 20_000;   // ← fun money cap
export const DEFAULT_NEEDS_BUDGET   = 30_000;   // ← rent + food + bills
export const DEFAULT_SAVINGS_TARGET = 30_000;   // ← SIP + family
export const WEALTH_TARGET_PCT      = 50;       // ← target % of income
```

Or use the **Settings** screen in the app (drag sliders, tap Save).

---

## 🔒 Security Notes

- Supabase anon key is safe to expose client-side — it's designed for this
- **Enable Row Level Security (RLS)** if you add authentication  
  Uncomment the RLS lines at the bottom of `001_schema.sql`, then add policies
- For multi-user support: integrate `@supabase/ssr` auth helpers (already installed)

---

## 📦 Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v3 |
| Database | Supabase (PostgreSQL) |
| Charts | Recharts |
| Search | cmdk |
| PWA | next-pwa (Workbox) |
| Fonts | Syne · Space Grotesk · JetBrains Mono |
| Icons | lucide-react |
| Deployment | Vercel |

---

MIT License · Personal use and modification welcome.
