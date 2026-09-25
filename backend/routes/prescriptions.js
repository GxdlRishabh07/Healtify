const express = require("express");
const supabase = require("../config/supabaseClient");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, authorize("doctor"), async (req, res) => {
  try {
    const { appointmentId, doctorId, diagnosis, symptoms, medicines, notes, followUpDate } = req.body;
    const { data: appointment } = await supabase.from("appointments").select("*").eq("id", appointmentId).maybeSingle();
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const { data: prescription, error } = await supabase
      .from("prescriptions")
      .insert({
        appointment_id: appointmentId, patient_id: appointment.patient_id, doctor_id: doctorId,
        diagnosis, symptoms, medicines, notes, follow_up_date: followUpDate || null,
      })
      .select()
      .single();
    if (error) throw error;

    await supabase.from("appointments").update({ status: "completed" }).eq("id", appointmentId);

    res.status(201).json(prescription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/appointment/:appointmentId", protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("appointment_id", req.params.appointmentId)
      .maybeSingle();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/patient/:patientId", protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("prescriptions")
      .select("*, doctor:doctors(*, user:users(name))")
      .eq("patient_id", req.params.patientId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
