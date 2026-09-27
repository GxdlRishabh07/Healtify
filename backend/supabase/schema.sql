-- Healtify — Supabase (Postgres) schema
-- Run this once in Supabase Dashboard → SQL Editor → New query → Run.

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password text not null,
  role text not null check (role in ('patient','doctor','admin')),
  phone text,
  address text,
  gender text check (gender in ('male','female','other')),
  dob date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists doctors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  department text not null,
  specialization text not null,
  qualification text,
  experience_years int default 0,
  consultation_fee numeric default 500,
  available_days text[] default '{}',
  available_slots text[] default '{}',
  rating numeric default 4.5,
  created_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references users(id) on delete cascade,
  doctor_id uuid not null references doctors(id) on delete cascade,
  department text,
  date date not null,
  slot text not null,
  reason text,
  status text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists prescriptions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  patient_id uuid not null references users(id) on delete cascade,
  doctor_id uuid not null references doctors(id) on delete cascade,
  diagnosis text not null,
  symptoms text,
  medicines jsonb default '[]',
  notes text,
  follow_up_date date,
  created_at timestamptz not null default now()
);

create table if not exists bills (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references users(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  items jsonb default '[]',
  total_amount numeric not null default 0,
  status text not null default 'unpaid' check (status in ('unpaid','paid')),
  paid_on timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists medicines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  category text,
  price numeric not null,
  stock int default 0,
  description text,
  requires_prescription boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists medicine_orders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references users(id) on delete cascade,
  items jsonb not null default '[]',
  total_amount numeric not null default 0,
  delivery_address text not null,
  status text not null default 'placed' check (status in ('placed','processing','out_for_delivery','delivered','cancelled')),
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_doctors_user on doctors(user_id);
create index if not exists idx_appt_patient on appointments(patient_id);
create index if not exists idx_appt_doctor on appointments(doctor_id);
create index if not exists idx_presc_patient on prescriptions(patient_id);
create index if not exists idx_bills_patient on bills(patient_id);
create index if not exists idx_orders_patient on medicine_orders(patient_id);

-- The backend connects with the Supabase SERVICE ROLE key (server-side only,
-- never exposed to the browser), which bypasses Row Level Security. RLS is
-- still enabled below as defense-in-depth in case the anon key is ever used.
alter table users enable row level security;
alter table doctors enable row level security;
alter table appointments enable row level security;
alter table prescriptions enable row level security;
alter table bills enable row level security;
alter table medicines enable row level security;
alter table medicine_orders enable row level security;
