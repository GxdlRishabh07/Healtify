import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";

const empty = {
  name: "", email: "", password: "", phone: "",
  department: "", specialization: "", qualification: "",
  experience_years: 1, consultation_fee: 500,
};

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = () => api.get("/admin/doctors").then((res) => setDoctors(res.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/admin/doctors", {
        ...form,
        available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        available_slots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"],
      });
      setForm(empty);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add doctor");
    }
  };

  const remove = async (id) => {
    if (!confirm("Remove this doctor?")) return;
    await api.delete(`/admin/doctors/${id}`);
    load();
  };

  const toggleActive = async (id, isActive) => {
    await api.put(`/admin/doctors/${id}/status`, { isActive: !isActive });
    load();
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Manage doctors</h1><p>Add, review and manage doctor accounts.</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>{showForm ? "Close" : "Add doctor"}</button>
      </div>

      {showForm && (
        <form className="panel form-grid section" onSubmit={submit}>
          <div className="field"><label>Full name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="field"><label>Password</label><input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div className="field"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="field"><label>Department</label><input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
          <div className="field"><label>Specialization</label><input required value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} /></div>
          <div className="field"><label>Qualification</label><input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} /></div>
          <div className="field"><label>Experience (years)</label><input type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} /></div>
          <div className="field"><label>Consultation fee (₹)</label><input type="number" value={form.consultation_fee} onChange={(e) => setForm({ ...form, consultation_fee: e.target.value })} /></div>
          {error && <div className="error-text" style={{ gridColumn: "1 / -1" }}>{error}</div>}
          <button className="btn btn-primary" style={{ gridColumn: "1 / -1", justifySelf: "start" }}>Create doctor account</button>
        </form>
      )}

      <input
        placeholder="Search by name or department..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "10px 13px", border: "1px solid var(--line)", borderRadius: 8, marginBottom: 16, width: "100%", maxWidth: 360 }}
      />

      <table className="data-table">
        <thead><tr><th>Name</th><th>Department</th><th>Fee</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {doctors
            .filter((d) => {
              const q = search.toLowerCase();
              return !q || d.user?.name?.toLowerCase().includes(q) || d.department?.toLowerCase().includes(q);
            })
            .map((d) => (
            <tr key={d.id}>
              <td>Dr. {d.user?.name}<div style={{ fontSize: "0.8rem", color: "var(--slate)" }}>{d.user?.email}</div></td>
              <td>{d.department}</td>
              <td>₹{d.consultation_fee}</td>
              <td>{d.user?.is_active ? <span className="badge badge-completed">Active</span> : <span className="badge badge-cancelled">Inactive</span>}</td>
              <td style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(d.id, d.user?.is_active)}>{d.user?.is_active ? "Deactivate" : "Activate"}</button>
                <button className="btn btn-ghost btn-sm" onClick={() => remove(d.id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
