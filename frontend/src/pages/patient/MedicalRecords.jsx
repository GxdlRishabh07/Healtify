import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";

export default function MedicalRecords() {
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    api.get("/patients/me/medical-history").then((res) => setPrescriptions(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header"><div><h1>Medical records</h1><p>Diagnoses and prescriptions from past visits.</p></div></div>
      {prescriptions.length === 0 ? (
        <div className="empty-state">No medical records yet.</div>
      ) : (
        prescriptions.map((p) => (
          <div className="panel section" key={p.id}>
            <div className="page-header" style={{ marginBottom: 12 }}>
              <div>
                <h3 style={{ marginBottom: 2 }}>{p.diagnosis}</h3>
                <div className="secondary" style={{ color: "var(--slate)", fontSize: "0.85rem" }}>
                  Dr. {p.doctor?.user?.name} · {new Date(p.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            {p.symptoms && <p><strong>Symptoms:</strong> {p.symptoms}</p>}
            {p.medicines?.length > 0 && (
              <table className="data-table" style={{ marginBottom: 8 }}>
                <thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr></thead>
                <tbody>
                  {p.medicines.map((m, i) => (
                    <tr key={i}><td>{m.name}</td><td>{m.dosage}</td><td>{m.frequency}</td><td>{m.durationDays} days</td></tr>
                  ))}
                </tbody>
              </table>
            )}
            {p.notes && <p><strong>Notes:</strong> {p.notes}</p>}
          </div>
        ))
      )}
    </div>
  );
}
