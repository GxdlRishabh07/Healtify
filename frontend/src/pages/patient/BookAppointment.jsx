import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios.js";

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get(`/doctors/${doctorId}`).then((res) => setDoctor(res.data)).catch(() => {});
  }, [doctorId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/appointments", { doctorId, date, slot, reason });
      setSuccess(true);
      setTimeout(() => navigate("/patient/appointments"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Could not book appointment");
    }
  };

  if (!doctor) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Book with Dr. {doctor.user?.name}</h1><p>{doctor.specialization} · {doctor.department} · ₹{doctor.consultation_fee}</p></div>
      </div>

      {success ? (
        <div className="panel">Appointment requested. Redirecting to your appointments...</div>
      ) : (
        <form className="panel form-grid" onSubmit={onSubmit}>
          <div className="field">
            <label>Date</label>
            <input type="date" required min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Time slot</label>
            <select required value={slot} onChange={(e) => setSlot(e.target.value)}>
              <option value="">Select a slot</option>
              {(doctor.available_slots || []).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Reason for visit</label>
            <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Briefly describe your symptoms" />
          </div>
          {error && <div className="error-text" style={{ gridColumn: "1 / -1" }}>{error}</div>}
          <button className="btn btn-primary">Confirm booking</button>
        </form>
      )}
    </div>
  );
}
