const express = require("express");
const supabase = require("../config/supabaseClient");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, authorize("admin", "doctor"), async (req, res) => {
  try {
    const { patientId, appointmentId, items } = req.body;
    const totalAmount = items.reduce((sum, i) => sum + Number(i.amount || 0), 0);
    const { data, error } = await supabase
      .from("bills")
      .insert({ patient_id: patientId, appointment_id: appointmentId || null, items, total_amount: totalAmount })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/patient/:patientId", protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .eq("patient_id", req.params.patientId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/pay", protect, authorize("patient", "admin"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("bills")
      .update({ status: "paid", paid_on: new Date().toISOString() })
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
      .from("bills")
      .select("*, patient:users(name,email)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
