const express = require("express");
const supabase = require("../config/supabaseClient");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/summary", protect, authorize("admin"), async (req, res) => {
  try {
    const [{ count: totalPatients }, { count: totalDoctors }, { count: totalAppointments }, { data: paidBills }] =
      await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "patient"),
        supabase.from("doctors").select("id", { count: "exact", head: true }),
        supabase.from("appointments").select("id", { count: "exact", head: true }),
        supabase.from("bills").select("total_amount").eq("status", "paid"),
      ]);
    const totalRevenue = (paidBills || []).reduce((s, b) => s + Number(b.total_amount), 0);
    res.json({ totalPatients, totalDoctors, totalAppointments, totalRevenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/appointments-trend", protect, authorize("admin"), async (req, res) => {
  try {
    const days = Number(req.query.days || 14);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("date")
      .gte("date", since.toISOString().slice(0, 10));
    if (error) throw error;

    const counts = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      counts[d.toISOString().slice(0, 10)] = 0;
    }
    appointments.forEach((a) => {
      const key = new Date(a.date).toISOString().slice(0, 10);
      if (key in counts) counts[key] += 1;
    });

    res.json(Object.entries(counts).map(([date, count]) => ({ date, count })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Simple linear-regression forecast, computed in plain JS — no separate
// Python/ML service needed, so the project stays fully Node/Postgres.
router.get("/appointments-forecast", protect, authorize("admin"), async (req, res) => {
  try {
    const historyDays = Number(req.query.historyDays || 30);
    const forecastDays = Number(req.query.forecastDays || 7);
    const since = new Date();
    since.setDate(since.getDate() - historyDays);

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("date")
      .gte("date", since.toISOString().slice(0, 10));
    if (error) throw error;

    const counts = {};
    for (let i = 0; i < historyDays; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      counts[d.toISOString().slice(0, 10)] = 0;
    }
    appointments.forEach((a) => {
      const key = new Date(a.date).toISOString().slice(0, 10);
      if (key in counts) counts[key] += 1;
    });

    const y = Object.values(counts);
    const n = y.length;
    const x = y.map((_, i) => i);
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
      num += (x[i] - meanX) * (y[i] - meanY);
      den += (x[i] - meanX) ** 2;
    }
    const slope = den === 0 ? 0 : num / den;
    const intercept = meanY - slope * meanX;

    const forecast = [];
    for (let i = 0; i < forecastDays; i++) {
      const futureX = n + i;
      const predicted = Math.max(0, Math.round(intercept + slope * futureX));
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      forecast.push({ date: d.toISOString().slice(0, 10), predictedAppointments: predicted });
    }

    res.json({ history: Object.entries(counts).map(([date, count]) => ({ date, count })), forecast, trendSlope: slope });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
