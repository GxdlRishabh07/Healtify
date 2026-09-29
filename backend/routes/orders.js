const express = require("express");
const supabase = require("../config/supabaseClient");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, authorize("patient"), async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body; // items: [{ medicineId, quantity }]
    if (!items || !items.length) return res.status(400).json({ message: "Cart is empty" });

    const resolvedItems = [];
    let totalAmount = 0;
    for (const it of items) {
      const { data: med } = await supabase.from("medicines").select("*").eq("id", it.medicineId).maybeSingle();
      if (!med) continue;
      const qty = Number(it.quantity || 1);
      resolvedItems.push({ medicine: med.id, name: med.name, price: med.price, quantity: qty });
      totalAmount += med.price * qty;
    }
    if (!resolvedItems.length) return res.status(400).json({ message: "No valid medicines in cart" });

    const { data: order, error } = await supabase
      .from("medicine_orders")
      .insert({ patient_id: req.user.id, items: resolvedItems, total_amount: totalAmount, delivery_address: deliveryAddress })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/my", protect, authorize("patient"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("medicine_orders")
      .select("*")
      .eq("patient_id", req.user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("medicine_orders")
      .select("*, patient:users(name,email)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/status", protect, authorize("admin"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("medicine_orders")
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

module.exports = router;
