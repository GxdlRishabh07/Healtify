const express = require("express");
const supabase = require("../config/supabaseClient");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Public: search/list doctors
router.get("/", async (req, res) => {
  try {
    const { department, search } = req.query;
    let query = supabase.from("doctors").select("*, user:users(name,email,phone)");
    if (department) query = query.eq("department", department);
    const { data, error } = await query;
    if (error) throw error;

    let doctors = data;
    if (search) {
      const s = search.toLowerCase();
      doctors = doctors.filter(
        (d) =>
          d.user?.name?.toLowerCase().includes(s) ||
          d.specialization?.toLowerCase().includes(s) ||
          d.department?.toLowerCase().includes(s)
      );
    }
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/departments", async (req, res) => {
  try {
    const { data, error } = await supabase.from("doctors").select("department");
    if (error) throw error;
    res.json([...new Set(data.map((d) => d.department))]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { data: doctor, error } = await supabase
      .from("doctors")
      .select("*, user:users(name,email,phone)")
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const { data: doctor } = await supabase.from("doctors").select("user_id").eq("id", req.params.id).maybeSingle();
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    if (req.user.role !== "admin" && doctor.user_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const { data: updated, error } = await supabase
      .from("doctors")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
