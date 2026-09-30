import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../../api/axios.js";

export default function Reports() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/reports/appointments-forecast", { params: { historyDays: 30, forecastDays: 7 } })
      .then((res) => setData(res.data)).catch(() => {});
  }, []);

  if (!data) return <div>Loading forecast...</div>;

  const combined = [
    ...data.history.map((h) => ({ date: h.date, actual: h.count })),
    ...data.forecast.map((f) => ({ date: f.date, predicted: f.predictedAppointments })),
  ];

  const trendLabel = data.trendSlope > 0.02 ? "rising" : data.trendSlope < -0.02 ? "falling" : "stable";

  return (
    <div>
      <div className="page-header"><div><h1>Reports &amp; forecast</h1><p>30-day history and a simple demand forecast for the next 7 days.</p></div></div>

      <div className="stat-row">
        <div className="stat-tile"><div className="value" style={{ textTransform: "capitalize" }}>{trendLabel}</div><div className="label">Demand trend</div></div>
        <div className="stat-tile"><div className="value">{data.forecast.reduce((s, f) => s + f.predictedAppointments, 0)}</div><div className="label">Predicted appointments (next 7 days)</div></div>
      </div>

      <div className="panel" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combined}>
            <CartesianGrid stroke="#DCE6E3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#0E5C56" strokeWidth={2} dot={false} name="Actual" connectNulls />
            <Line type="monotone" dataKey="predicted" stroke="#E8683D" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3 }} name="Predicted" connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p style={{ marginTop: 12, fontSize: "0.85rem" }}>
        The forecast uses a simple linear-regression trend line fitted to the last 30 days of appointment
        counts, projected forward. It's a lightweight planning aid, not a clinical prediction.
      </p>
    </div>
  );
}
