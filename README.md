# Healtify - Hospital & Healthcare Management System

MCA Major Project (MERN + Supabase)

## Group Members

- **Prerna Shirke** (1272250097)
- **Yash Toraskar** (1272250251)
- **Sonal Adhav** (1272250111)
- **Rishabh Patil** (1272250228)

## About the Project

Healtify is a full-stack hospital management system with three modules: Patient, Doctor and Admin. It has appointment booking, e-prescriptions, billing, online medicine ordering (pharmacy) and an admin reports dashboard that shows a simple forecast of appointments for the next 7 days.

The frontend is made in React, the backend is Node/Express (deployed on Vercel as a serverless function) and the database is Supabase (Postgres). MongoDB is not used.

## Tech Stack

- **Frontend:** React 18 (Vite), React Router, Axios, Recharts (deployed on Vercel)
- **Backend:** Node.js, Express (deployed on Vercel as a serverless function)
- **Database:** Supabase (Postgres)
- **Authentication:** JWT + bcrypt password hashing (we made our own auth, Supabase Auth is not used)

## Project Structure

```
hospital-mern/
├── backend/
│   ├── config/supabaseClient.js   # Supabase client (service role key)
│   ├── routes/                    # auth, doctors, patients, appointments, prescriptions, billing, medicines, orders, admin, reports
│   ├── middleware/auth.js         # JWT protect + role based authorize
│   ├── supabase/schema.sql        # run once in Supabase SQL editor
│   ├── seed/seed.js               # adds sample data
│   ├── app.js                     # express app (no listen)
│   ├── server.js                  # local entry (app.listen)
│   ├── api/index.js               # Vercel serverless entry
│   └── vercel.json
└── frontend/
    └── src/
        ├── api/axios.js
        ├── context/AuthContext.jsx
        ├── components/            # Sidebar, ProtectedRoute, StatusBadge
        └── pages/
            ├── patient/           # Dashboard, FindDoctor, BookAppointment, MyAppointments, MedicalRecords, Billing, Pharmacy
            ├── doctor/            # Dashboard, Appointments (diagnose + prescribe)
            └── admin/             # Dashboard, ManageDoctors, ManagePatients, ManageAppointments, BillingAdmin, PharmacyOrders, Reports
```

## Modules and Features

**Patient**
- Register and login
- Search doctors and book appointments
- View medical records and prescriptions
- View bills
- Order medicines online

**Doctor**
- View appointments
- Enter diagnosis and write prescription

**Admin**
- Manage doctors, patients and appointments
- Manage billing and pharmacy orders
- Reports dashboard with a 7-day appointment forecast (done using linear regression in plain JavaScript)

## Database Tables

`users`, `doctors`, `appointments`, `prescriptions`, `bills`, `medicines`, `medicine_orders`

The full SQL is in `backend/supabase/schema.sql`.

---

## Setup Guide

### Part 1 - Set up Supabase

1. Go to **supabase.com**, log in and click **New project**. Give it a name (for example `healtify`), set a database password, choose a region and create it. It takes around 2 minutes.
2. Open **SQL Editor** from the left sidebar and click **New query**.
3. Copy everything from `backend/supabase/schema.sql`, paste it in the editor and click **Run**. This creates all 7 tables.
4. Go to **Project Settings → API**.
   - Copy the **Project URL**. This is `SUPABASE_URL`.
   - Copy the **service_role** key (not the `anon` key). This is `SUPABASE_SERVICE_ROLE_KEY`. Do not put it in the frontend code.

### Part 2 - Run the backend locally

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file:

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=any_long_random_string
PORT=5000
```

```bash
npm install
npm run seed     # adds sample doctors, patients, medicines, appointments
npm run dev      # runs on http://localhost:5000
```

Open `http://localhost:5000/api/health`. It should show `{"status":"ok"}`.

### Part 3 - Run the frontend locally

```bash
cd frontend
cp .env.example .env
```

In the `.env` file use the local URL:

```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm install
npm run dev      # runs on http://localhost:5173
```

Login with the sample accounts given below and check that everything works.

### Part 4 - Deploy on Vercel

We made two Vercel projects, one for backend and one for frontend.

**Step 1: Push to GitHub**
Create a new GitHub repo and push the whole `hospital-mern` folder. Both backend and frontend can be in the same repo.

**Step 2: Deploy the backend**
1. On **vercel.com** click **Add New → Project** and import the repo.
2. Set **Root Directory** to `backend`.
3. Framework preset: **Other**. Leave the build command empty.
4. Add these environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`.
5. Click **Deploy** and note the backend URL, for example `https://healtify-backend.vercel.app`.
6. Open `https://healtify-backend.vercel.app/api/health` to test. It should show `{"status":"ok"}`.

**Step 3: Seed the data (only once)**
Run `npm run seed` from the `backend/` folder on your local system. Since the local `.env` points to the same Supabase project, the data goes directly into Supabase and the deployed backend can use it. No need to seed again from Vercel.

**Step 4: Deploy the frontend**
1. Click **Add New → Project** and import the same repo again.
2. Set **Root Directory** to `frontend`.
3. Vercel detects **Vite** automatically (build command `npm run build`, output directory `dist`).
4. Add environment variable `VITE_API_URL` = `https://healtify-backend.vercel.app/api` (your backend URL with `/api` at the end).
5. Click **Deploy**. The URL Vercel gives is the live app.

### Notes

- After every push to GitHub, both Vercel projects redeploy automatically.
- If login works locally but not on the deployed site, check `VITE_API_URL` first (it may be pointing to a wrong backend URL). CORS is already enabled in the backend.
- Supabase free projects get paused after about a week of no activity. Just open the dashboard to start it again.

---

## Sample Logins (after `npm run seed`)

Password for all accounts: `Password@123`

| Role    | Email                                        |
|---------|----------------------------------------------|
| Admin   | admin@hospital.com                           |
| Doctor  | doctor1@hospital.com to doctor6@hospital.com |
| Patient | patient1@example.com to patient10@example.com |

## Design

- Colors: teal `#0E5C56`, coral `#E8683D`, mint `#F2F7F5`, dark text `#16232B`
- Fonts: Fraunces (headings) and Inter (body)

## Project Summary

The patient registers, logs in, searches for a doctor and books an appointment. The doctor checks the appointment, examines the patient and enters the diagnosis and prescription. The patient's medical record is updated automatically and a bill is generated. The patient can also order medicines online for delivery. The admin manages doctors, patients, appointments, billing and pharmacy orders from one dashboard, which also shows a simple forecast of upcoming appointments. The system is deployed on Vercel with Supabase (Postgres) as the database.
