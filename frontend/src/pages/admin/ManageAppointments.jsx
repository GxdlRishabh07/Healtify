import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import StatusBadge from "../../components/StatusBadge.jsx";

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);

  const load = () => api.get("/appointments").then((res) => setAppointments(res.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    await api.put(`/appointments/${id}/status`, { status });
    load();
  };

  return (
    <div>
      <div className="page-header"><div><h1>Manage appointments</h1><p>All appointments across the hospital.</p></div></div>
      <table className="data-table">
        <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Slot</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a.id}>
              <td>{a.patient?.name}</td>
              <td>Dr. {a.doctor?.user?.name}</td>
              <td>{new Date(a.date).toLocaleDateString()}</td>
              <td>{a.slot}</td>
              <td><StatusBadge status={a.status} /></td>
              <td>
                {a.status !== "cancelled" && a.status !== "completed" && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setStatus(a.id, "cancelled")}>Cancel</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
