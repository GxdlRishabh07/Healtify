import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

export default function DoctorAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [active, setActive] = useState(null); // appointment being prescribed
  const [form, setForm] = useState({ diagnosis: "", symptoms: "", notes: "", medicines: [{ name: "", dosage: "", frequency: "", durationDays: 5 }] });
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (user.doctorId) api.get(`/appointments/doctor/${user.doctorId}`).then((res) => setAppointments(res.data)).catch(() => {});
  };
  useEffect(() => { load(); }, [user.doctorId]);

  const setStatus = async (id, status) => {
    await api.put(`/appointments/${id}/status`, { status });
    load();
  };

  const openPrescribe = (a) => {
    setActive(a);
    setForm({ diagnosis: "", symptoms: "", notes: "", medicines: [{ name: "", dosage: "", frequency: "", durationDays: 5 }] });
  };

  const updateMed = (i, key, value) => {
    const meds = [...form.medicines];
    meds[i][key] = value;
    setForm({ ...form, medicines: meds });
  };
  const addMedRow = () => setForm({ ...form, medicines: [...form.medicines, { name: "", dosage: "", frequency: "", durationDays: 5 }] });

  const submitPrescription = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/prescriptions", {
        appointmentId: active.id,
        doctorId: user.doctorId,
        diagnosis: form.diagnosis,
        symptoms: form.symptoms,
        notes: form.notes,
        medicines: form.medicines.filter((m) => m.name),
      });
      setActive(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not save prescription");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header"><div><h1>My appointments</h1><p>Confirm visits and record diagnosis &amp; prescriptions.</p></div></div>

      <table className="data-table">
        <thead><tr><th>Patient</th><th>Date</th><th>Slot</th><th>Reason</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a.id}>
              <td>{a.patient?.name}</td>
              <td>{new Date(a.date).toLocaleDateString()}</td>
              <td>{a.slot}</td>
              <td>{a.reason}</td>
              <td><StatusBadge status={a.status} /></td>
              <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {a.status === "pending" && <button className="btn btn-ghost btn-sm" onClick={() => setStatus(a.id, "confirmed")}>Confirm</button>}
                {["pending", "confirmed"].includes(a.status) && <button className="btn btn-primary btn-sm" onClick={() => openPrescribe(a)}>Diagnose</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {active && (
        <div className="panel section" style={{ marginTop: 24 }}>
          <div className="section-title">Prescription for {active.patient?.name}</div>
          <form onSubmit={submitPrescription}>
            <div className="form-grid">
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Diagnosis</label>
                <input required value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
              </div>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Symptoms</label>
                <input value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
              </div>
            </div>

            <div className="section-title" style={{ fontSize: "0.9rem" }}>Medicines</div>
            {form.medicines.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <input placeholder="Name" value={m.name} onChange={(e) => updateMed(i, "name", e.target.value)} style={{ flex: 2, padding: 9, border: "1px solid var(--line)", borderRadius: 8 }} />
                <input placeholder="Dosage" value={m.dosage} onChange={(e) => updateMed(i, "dosage", e.target.value)} style={{ flex: 1, padding: 9, border: "1px solid var(--line)", borderRadius: 8 }} />
                <input placeholder="Frequency" value={m.frequency} onChange={(e) => updateMed(i, "frequency", e.target.value)} style={{ flex: 1, padding: 9, border: "1px solid var(--line)", borderRadius: 8 }} />
                <input type="number" placeholder="Days" value={m.durationDays} onChange={(e) => updateMed(i, "durationDays", e.target.value)} style={{ width: 80, padding: 9, border: "1px solid var(--line)", borderRadius: 8 }} />
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" onClick={addMedRow}>+ Add medicine</button>

            <div className="field" style={{ marginTop: 16 }}>
              <label>Notes / follow-up</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save & complete visit"}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setActive(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
