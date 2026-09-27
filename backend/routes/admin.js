const express = require("express");
const bcrypt = require("bcryptjs");
const supabase = require("../config/supabaseClient");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/doctors", protect, authorize("admin"), async (req, res) => {
  try {
    const {
      name, email, password, phone,
      department, specialization, qualification,
      experience_years, consultation_fee, available_days, available_slots,
    } = req.body;

    const { data: existing } = await supabase.from("users").select("id").eq("email", email.toLowerCase()).maybeSingle();
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const { data: user, error: userErr } = await supabase
      .from("users")
      .insert({ name, email: email.toLowerCase(), password: hashed, role: "doctor", phone })
      .select()
      .single();
    if (userErr) throw userErr;

    const { data: doctor, error: docErr } = await supabase
      .from("doctors")
      .insert({
        user_id: user.id, department, specialization, qualification,
        experience_years, consultation_fee, available_days, available_slots,
      })
      .select()
      .single();
    if (docErr) throw docErr;

    res.status(201).json({ user, doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/doctors", protect, authorize("admin"), async (req, res) => {
  try {
    const { data, error } = await supabase.from("doctors").select("*, user:users(name,email,phone,is_active)");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/doctors/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const { data: doctor } = await supabase.from("doctors").select("user_id").eq("id", req.params.id).maybeSingle();
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    await supabase.from("users").delete().eq("id", doctor.user_id); // cascades to doctors row
    res.json({ message: "Doctor removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/doctors/:id/status", protect, authorize("admin"), async (req, res) => {
  try {
    const { data: doctor } = await supabase.from("doctors").select("user_id").eq("id", req.params.id).maybeSingle();
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    await supabase.from("users").update({ is_active: req.body.isActive }).eq("id", doctor.user_id);
    res.json({ message: "Doctor status updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
