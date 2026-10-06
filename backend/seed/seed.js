/**
 * Seed script — populates Supabase (Postgres) with a sample dataset:
 * 1 admin, 6 doctors, 10 patients, a pharmacy catalog, and a spread of
 * appointments over the last 30 days so admin reports/graphs have data.
 *
 * Run first: paste supabase/schema.sql into the Supabase SQL editor.
 * Then run: npm run seed   (from the backend folder)
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const supabase = require("../config/supabaseClient");

const DEPARTMENTS = [
  { department: "Cardiology", specialization: "Cardiologist" },
  { department: "Neurology", specialization: "Neurologist" },
  { department: "Orthopedics", specialization: "Orthopedic Surgeon" },
  { department: "Pediatrics", specialization: "Pediatrician" },
  { department: "Dermatology", specialization: "Dermatologist" },
  { department: "General Medicine", specialization: "General Physician" },
];

const MEDICINES = [
  { name: "Paracetamol 500mg", brand: "Calpol", category: "Pain Relief", price: 25, stock: 500 },
  { name: "Amoxicillin 250mg", brand: "Mox", category: "Antibiotic", price: 60, stock: 200, requires_prescription: true },
  { name: "Cetirizine 10mg", brand: "Zyrtec", category: "Allergy", price: 30, stock: 300 },
  { name: "Metformin 500mg", brand: "Glyciphage", category: "Diabetes", price: 45, stock: 250, requires_prescription: true },
  { name: "Vitamin D3", brand: "Calcirol", category: "Supplement", price: 90, stock: 150 },
  { name: "ORS Sachet", brand: "Electral", category: "Hydration", price: 20, stock: 400 },
  { name: "Ibuprofen 400mg", brand: "Brufen", category: "Pain Relief", price: 35, stock: 220 },
  { name: "Cough Syrup", brand: "Benadryl", category: "Cold & Cough", price: 110, stock: 100 },
];

const SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];

async function seed() {
  console.log("Clearing existing data...");
  // Order matters: children before parents (no ON DELETE CASCADE assumed for a fresh run).
  await supabase.from("medicine_orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("bills").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("prescriptions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("appointments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("medicines").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("doctors").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("users").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const passwordHash = await bcrypt.hash("Password@123", 10);

  console.log("Creating admin...");
  await supabase.from("users").insert({
    name: "System Admin", email: "admin@hospital.com", password: passwordHash, role: "admin", phone: "9999900000",
  });

  console.log("Creating doctors...");
  const doctors = [];
  const doctorNames = ["Aisha Khan", "Rohan Mehta", "Sara Iyer", "Vikram Rao", "Neha Kapoor", "Arjun Nair"];
  for (let i = 0; i < DEPARTMENTS.length; i++) {
    const dep = DEPARTMENTS[i];
    const { data: user } = await supabase
      .from("users")
      .insert({
        name: `Dr. ${doctorNames[i]}`, email: `doctor${i + 1}@hospital.com`,
        password: passwordHash, role: "doctor", phone: `98765${10000 + i}`,
      })
      .select()
      .single();
    const { data: doctor } = await supabase
      .from("doctors")
      .insert({
        user_id: user.id, department: dep.department, specialization: dep.specialization,
        qualification: "MBBS, MD", experience_years: 5 + i, consultation_fee: 400 + i * 50,
        available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], available_slots: SLOTS,
      })
      .select()
      .single();
    doctors.push(doctor);
  }

  console.log("Creating patients...");
  const patients = [];
  for (let i = 1; i <= 10; i++) {
    const { data: user } = await supabase
      .from("users")
      .insert({
        name: `Patient ${i}`, email: `patient${i}@example.com`, password: passwordHash, role: "patient",
        phone: `90000${1000 + i}`, address: `${i} MG Road, Pune`, gender: i % 2 === 0 ? "female" : "male",
      })
      .select()
      .single();
    patients.push(user);
  }

  console.log("Creating medicines...");
  await supabase.from("medicines").insert(MEDICINES);

  console.log("Creating appointments over the last 30 days...");
  const statuses = ["pending", "confirmed", "completed", "cancelled"];
  for (let d = 30; d >= 0; d--) {
    const numToday = Math.floor(Math.random() * 4);
    for (let k = 0; k < numToday; k++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const status = d === 0 ? "pending" : statuses[Math.floor(Math.random() * statuses.length)];
      const { data: appt } = await supabase
        .from("appointments")
        .insert({
          patient_id: patient.id, doctor_id: doctor.id, department: doctor.department,
          date: date.toISOString().slice(0, 10), slot: SLOTS[Math.floor(Math.random() * SLOTS.length)],
          reason: "General checkup", status,
        })
        .select()
        .single();
      if (status === "completed") {
        const total = doctor.consultation_fee + 200;
        await supabase.from("bills").insert({
          patient_id: patient.id, appointment_id: appt.id,
          items: [{ label: "Consultation Fee", amount: doctor.consultation_fee }, { label: "Lab Test", amount: 200 }],
          total_amount: total,
          status: Math.random() > 0.3 ? "paid" : "unpaid",
          paid_on: Math.random() > 0.3 ? new Date().toISOString() : null,
        });
      }
    }
  }

  console.log("\nSeed complete. Sample logins (password: Password@123):");
  console.log("  Admin:    admin@hospital.com");
  console.log("  Doctor:   doctor1@hospital.com  (and doctor2..doctor6)");
  console.log("  Patient:  patient1@example.com  (and patient2..patient10)");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
