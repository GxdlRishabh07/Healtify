import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);

  const load = () => api.get("/patients").then((res) => setPatients(res.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const toggleActive = async (id, isActive) => {
    await api.put(`/patients/${id}/status`, { isActive: !isActive });
    load();
  };

  return (
    <div>
      <div className="page-header"><div><h1>Manage patients</h1><p>All registered patients in the system.</p></div></div>
      <table className="data-table">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.email}</td>
              <td>{p.phone}</td>
              <td>{p.is_active ? <span className="badge badge-completed">Active</span> : <span className="badge badge-cancelled">Inactive</span>}</td>
              <td><button className="btn btn-ghost btn-sm" onClick={() => toggleActive(p.id, p.is_active)}>{p.is_active ? "Deactivate" : "Activate"}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
