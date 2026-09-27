const express = require("express");
const supabase = require("../config/supabaseClient");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/me", protect, authorize("patient"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id,name,email,role,phone,address,gender,dob,is_active,created_at")
      .eq("id", req.user.id)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/me", protect, authorize("patient"), async (req, res) => {
  try {
    const { name, phone, address, gender, dob } = req.body;
    const { data, error } = await supabase
      .from("users")
      .update({ name, phone, address, gender, dob })
      .eq("id", req.user.id)
      .select("id,name,email,role,phone,address,gender,dob")
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me/medical-history", protect, authorize("patient"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("prescriptions")
      .select("*, doctor:doctors(*, user:users(name))")
      .eq("patient_id", req.user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: list all patients
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id,name,email,phone,address,gender,is_active,created_at")
      .eq("role", "patient");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/status", protect, authorize("admin"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ is_active: req.body.isActive })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
