const express = require("express");
const supabase = require("../config/supabaseClient");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, authorize("patient"), async (req, res) => {
  try {
    const { doctorId, date, slot, reason } = req.body;
    const { data: doctor } = await supabase.from("doctors").select("*").eq("id", doctorId).maybeSingle();
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const { data: clash } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", doctorId)
      .eq("date", date)
      .eq("slot", slot)
      .in("status", ["pending", "confirmed"])
      .maybeSingle();
    if (clash) return res.status(400).json({ message: "Slot already booked, choose another" });

    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        patient_id: req.user.id, doctor_id: doctorId, department: doctor.department,
        date, slot, reason, status: "pending",
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/my", protect, authorize("patient"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, doctor:doctors(*, user:users(name))")
      .eq("patient_id", req.user.id)
      .order("date", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/doctor/:doctorId", protect, authorize("doctor", "admin"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, patient:users(name,email,phone)")
      .eq("doctor_id", req.params.doctorId)
      .order("date", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/status", protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({ status: req.body.status })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, patient:users(name,email), doctor:doctors(*, user:users(name))")
      .order("date", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
