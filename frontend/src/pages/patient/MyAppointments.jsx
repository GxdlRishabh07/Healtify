import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import StatusBadge from "../../components/StatusBadge.jsx";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);

  const load = () => api.get("/appointments/my").then((res) => setAppointments(res.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    await api.put(`/appointments/${id}/status`, { status: "cancelled" });
    load();
  };

  return (
    <div>
      <div className="page-header"><div><h1>My appointments</h1><p>Everything you've booked, past and upcoming.</p></div></div>
      {appointments.length === 0 ? (
        <div className="empty-state">No appointments yet.</div>
      ) : (
        <table className="data-table">
          <thead><tr><th>Doctor</th><th>Department</th><th>Date</th><th>Slot</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td>Dr. {a.doctor?.user?.name}</td>
                <td>{a.department}</td>
                <td>{new Date(a.date).toLocaleDateString()}</td>
                <td>{a.slot}</td>
                <td><StatusBadge status={a.status} /></td>
                <td>
                  {["pending", "confirmed"].includes(a.status) && (
                    <button className="btn btn-ghost btn-sm" onClick={() => cancel(a.id)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
