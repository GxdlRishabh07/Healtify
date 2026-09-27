const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabaseClient");

const router = express.Router();

const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address, gender, dob } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        name, email: email.toLowerCase(), password: hashed, role: "patient",
        phone, address, gender, dob: dob || null,
      })
      .select()
      .single();
    if (error) throw error;

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", (email || "").toLowerCase())
      .maybeSingle();
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
    if (!user.is_active) return res.status(403).json({ message: "Account is deactivated" });

    let doctorId;
    if (user.role === "doctor") {
      const { data: doctor } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      doctorId = doctor?.id;
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, doctorId },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
