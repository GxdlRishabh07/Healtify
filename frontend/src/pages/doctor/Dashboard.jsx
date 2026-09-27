import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (user.doctorId) {
      api.get(`/appointments/doctor/${user.doctorId}`).then((res) => setAppointments(res.data)).catch(() => {});
    }
  }, [user.doctorId]);

  const today = new Date().toDateString();
  const todays = appointments.filter((a) => new Date(a.date).toDateString() === today);

  return (
    <div>
      <div className="page-header"><div><h1>Welcome, {user.name}</h1><p>Here's your schedule at a glance.</p></div></div>
      <div className="stat-row">
        <div className="stat-tile"><div className="value">{todays.length}</div><div className="label">Today's appointments</div></div>
        <div className="stat-tile"><div className="value">{appointments.filter(a => a.status === "pending").length}</div><div className="label">Pending confirmation</div></div>
        <div className="stat-tile"><div className="value">{appointments.filter(a => a.status === "completed").length}</div><div className="label">Completed visits</div></div>
      </div>
      <div className="section">
        <div className="section-title">Today</div>
        {todays.length === 0 ? <div className="empty-state">No appointments today.</div> : (
          <div className="list">
            {todays.map((a) => (
              <div className="list-row" key={a.id}>
                <div>
                  <div className="primary">{a.patient?.name}</div>
                  <div className="secondary">{a.slot} · {a.reason || "General checkup"}</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
