import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";

export default function FindDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const navigate = useNavigate();

  const load = () => {
    api.get("/doctors", { params: { search, department } }).then((res) => setDoctors(res.data)).catch(() => {});
  };

  useEffect(() => {
    api.get("/doctors/departments").then((res) => setDepartments(res.data)).catch(() => {});
    load();
  }, []);

  useEffect(() => { load(); }, [department]);

  return (
    <div>
      <div className="page-header">
        <div><h1>Find a doctor</h1><p>Search by name, specialization or department.</p></div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <input
          placeholder="Search doctors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          style={{ flex: 1, minWidth: 220, padding: "11px 13px", border: "1px solid var(--line)", borderRadius: 8 }}
        />
        <select value={department} onChange={(e) => setDepartment(e.target.value)} style={{ padding: "11px 13px", border: "1px solid var(--line)", borderRadius: 8 }}>
          <option value="">All departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <button className="btn btn-secondary" onClick={load}>Search</button>
      </div>

      <div className="grid-cards">
        {doctors.map((doc) => (
          <div className="doctor-tile" key={doc.id}>
            <h3>Dr. {doc.user?.name}</h3>
            <div className="dept">{doc.specialization} · {doc.department}</div>
            <div className="meta">{doc.experience_years} yrs experience · ₹{doc.consultation_fee} fee</div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/patient/book/${doc.id}`)}>Book appointment</button>
          </div>
        ))}
        {doctors.length === 0 && <div className="empty-state">No doctors found.</div>}
      </div>
    </div>
  );
}
