import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../api/axios.js";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    api.get("/reports/summary").then((res) => setSummary(res.data)).catch(() => {});
    api.get("/reports/appointments-trend", { params: { days: 14 } }).then((res) => setTrend(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header"><div><h1>Admin dashboard</h1><p>System-wide overview of the hospital.</p></div></div>

      {summary && (
        <div className="stat-row">
          <div className="stat-tile"><div className="value">{summary.totalPatients}</div><div className="label">Patients</div></div>
          <div className="stat-tile"><div className="value">{summary.totalDoctors}</div><div className="label">Doctors</div></div>
          <div className="stat-tile"><div className="value">{summary.totalAppointments}</div><div className="label">Appointments</div></div>
          <div className="stat-tile"><div className="value">₹{summary.totalRevenue}</div><div className="label">Revenue collected</div></div>
        </div>
      )}

      <div className="section">
        <div className="section-title">Appointments — last 14 days</div>
        <div className="panel" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid stroke="#DCE6E3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0E5C56" strokeWidth={2} dot={false} name="Appointments" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
