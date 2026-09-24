# Healtify — Hospital & Healthcare Management System (MERN + Supabase)

A full-stack MCA major project: Patient, Doctor and Admin modules, appointment
booking, e-prescriptions, billing, an online medicine/pharmacy ordering
feature, and an admin reports dashboard with a simple appointment-demand
forecast. Frontend is React; backend is Node/Express deployed as a Vercel
serverless function; database is **Supabase (Postgres)** — no MongoDB
required.

## Tech stack
- **Frontend:** React 18 (Vite), React Router, Axios, Recharts — deployed on Vercel
- **Backend:** Node.js, Express — deployed on Vercel as a serverless function
- **Database:** Supabase (managed Postgres)
- **Auth:** JWT (JSON Web Tokens) + bcrypt password hashing (custom, not Supabase Auth)

## Project structure
```
hospital-mern/
├── backend/
│   ├── config/supabaseClient.js   # Supabase server client (service role key)
│   ├── routes/                     # auth, doctors, patients, appointments, prescriptions, billing, medicines, orders, admin, reports
│   ├── middleware/auth.js          # JWT protect + role-based authorize
│   ├── supabase/schema.sql         # run once in Supabase SQL editor
│   ├── seed/seed.js                # sample dataset generator
│   ├── app.js                      # express app (no listen)
│   ├── server.js                   # local dev entry (app.listen)
│   ├── api/index.js                # Vercel serverless entry
│   └── vercel.json
└── frontend/
    └── src/
        ├── api/axios.js
        ├── context/AuthContext.jsx
        ├── components/             # Sidebar, ProtectedRoute, StatusBadge
        └── pages/
            ├── patient/            # Dashboard, FindDoctor, BookAppointment, MyAppointments, MedicalRecords, Billing, Pharmacy
            ├── doctor/              # Dashboard, Appointments (diagnose + prescribe)
            └── admin/               # Dashboard, ManageDoctors, ManagePatients, ManageAppointments, BillingAdmin, PharmacyOrders, Reports
```

## Modules & features
Same as before — patient booking/records/billing/pharmacy ordering, doctor
diagnosis + prescriptions, admin management + reports with a 7-day
appointment forecast (plain JS linear regression, no Python needed).

## Database (Supabase/Postgres) — tables
`users`, `doctors`, `appointments`, `prescriptions`, `bills`, `medicines`, `medicine_orders`
— see `backend/supabase/schema.sql` for the full DDL.

---

## Part 1 — Set up Supabase (the database)

1. Go to **supabase.com** → sign up / log in → **New project**.
   - Pick an org, name it (e.g. `healtify`), set a database password (save it), pick a region → **Create new project**. Takes ~2 minutes to provision.
2. Once it's ready, open **SQL Editor** (left sidebar) → **New query**.
3. Open `backend/supabase/schema.sql` from this project, copy all of it, paste into the SQL editor, click **Run**. This creates all 7 tables.
4. Go to **Project Settings → API** (left sidebar, gear icon → API).
   - Copy the **Project URL** → this is `SUPABASE_URL`.
   - Copy the **service_role** key (NOT the `anon` key — service_role bypasses row-level security and is required for this backend) → this is `SUPABASE_SERVICE_ROLE_KEY`. Keep it secret, never put it in frontend code.

## Part 2 — Run the backend locally first (to seed data)

```bash
cd backend
cp .env.example .env
```
Edit `.env`:
```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=any_long_random_string
PORT=5000
```
```bash
npm install
npm run seed     # populates sample doctors, patients, medicines, appointments
npm run dev       # http://localhost:5000
```
Visit `http://localhost:5000/api/health` — should show `{"status":"ok"}`.

## Part 3 — Run the frontend locally

```bash
cd frontend
cp .env.example .env
```
In `.env`, uncomment and use the local line:
```
VITE_API_URL=http://localhost:5000/api
```
```bash
npm install
npm run dev        # http://localhost:5173
```
Log in with a seeded account (see below) and confirm everything works before deploying.

---

## Part 4 — Deploy to Vercel

You'll create **two** Vercel projects: one for the backend, one for the frontend.

### 4a. Push to GitHub
Create a new GitHub repo, push this whole `hospital-mern` folder to it (backend and frontend can live in the same repo — Vercel lets you pick a subfolder as the project root).

### 4b. Deploy the backend
1. Go to **vercel.com** → **Add New → Project** → import your repo.
2. When asked for the **Root Directory**, choose `backend`.
3. Framework preset: **Other**. Leave build command empty (nothing to build).
4. Under **Environment Variables**, add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
5. Click **Deploy**. Once done, note the URL Vercel gives you, e.g. `https://healtify-backend.vercel.app`.
6. Test it: open `https://healtify-backend.vercel.app/api/health` in a browser → should show `{"status":"ok"}`.

### 4c. Seed production data (one-time)
Easiest way: temporarily point your **local** backend `.env` at the same Supabase project (it already is, if you used the same project) and run `npm run seed` from `backend/` locally — this writes straight into Supabase, so it's available to the deployed backend immediately. You don't need to re-run seed from Vercel.

### 4d. Deploy the frontend
1. **Add New → Project** → import the same repo again.
2. Root Directory: `frontend`.
3. Framework preset: Vercel auto-detects **Vite**. Build command `npm run build`, output directory `dist` (defaults are fine).
4. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://healtify-backend.vercel.app/api` (your backend URL from step 4b, with `/api` at the end)
5. Click **Deploy**.
6. Visit the frontend URL Vercel gives you — that's your live app.

### Notes
- Every time you push to GitHub, both Vercel projects auto-redeploy.
- If login fails on the deployed site but works locally, it's almost always `VITE_API_URL` pointing at the wrong backend URL, or CORS — the backend already has `cors()` enabled for all origins, so that shouldn't block you.
- Free tier limits: Supabase free project pauses after a week of no activity (just visit the dashboard to wake it up); Vercel serverless functions on the free plan have a short execution timeout, which is fine for this app's simple queries.

---

## Sample logins (after `npm run seed`)
All passwords: `Password@123`

| Role    | Email                  |
|---------|-------------------------|
| Admin   | admin@hospital.com      |
| Doctor  | doctor1@hospital.com … doctor6@hospital.com |
| Patient | patient1@example.com … patient10@example.com |

## Design
Color palette: deep teal `#0E5C56` (primary/trust), warm coral `#E8683D`
(actions/CTAs), soft mint `#F2F7F5` (background), ink `#16232B` (text).
Typography: Fraunces (headings) + Inter (body/UI).

## For your viva / report
"The patient registers and logs in, searches for a doctor and books an
appointment. The doctor reviews the appointment, examines the patient, and
enters a diagnosis and prescription. The patient's medical record updates
automatically and a bill is generated. The patient can also order medicines
online for delivery. The admin manages doctors, patients, appointments,
billing and pharmacy orders through a central dashboard, which also shows a
simple forecast of upcoming appointment demand. The system is deployed on
Vercel with Supabase (Postgres) as the database."
