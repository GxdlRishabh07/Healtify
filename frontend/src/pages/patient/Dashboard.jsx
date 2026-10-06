import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    api.get("/appointments/my").then((res) => setAppointments(res.data)).catch(() => {});
  }, []);

  const upcoming = appointments.filter((a) => ["pending", "confirmed"].includes(a.status)).slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Hello, {user.name.split(" ")[0]}</h1>
          <p>Here's a quick look at your care.</p>
        </div>
        <Link to="/patient/find-doctor" className="btn btn-primary">Book an appointment</Link>
      </div>

      <div className="stat-row">
        <div className="stat-tile"><div className="value">{appointments.length}</div><div className="label">Total appointments</div></div>
        <div className="stat-tile"><div className="value">{upcoming.length}</div><div className="label">Upcoming</div></div>
        <div className="stat-tile"><div className="value">{appointments.filter(a => a.status === "completed").length}</div><div className="label">Completed visits</div></div>
      </div>

      <div className="section">
        <div className="section-title">Upcoming appointments</div>
        {upcoming.length === 0 ? (
          <div className="empty-state">No upcoming appointments yet. <Link to="/patient/find-doctor">Find a doctor</Link> to book one.</div>
        ) : (
          <div className="list">
            {upcoming.map((a) => (
              <div className="list-row" key={a.id}>
                <div>
                  <div className="primary">Dr. {a.doctor?.user?.name} — {a.department}</div>
                  <div className="secondary">{new Date(a.date).toLocaleDateString()} · {a.slot}</div>
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
