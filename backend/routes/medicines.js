const express = require("express");
const supabase = require("../config/supabaseClient");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = supabase.from("medicines").select("*").order("name", { ascending: true });
    if (category) query = query.eq("category", category);
    if (search) query = query.ilike("name", `%${search}%`);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { data, error } = await supabase.from("medicines").insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const { data, error } = await supabase.from("medicines").update(req.body).eq("id", req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const { error } = await supabase.from("medicines").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ message: "Medicine removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
