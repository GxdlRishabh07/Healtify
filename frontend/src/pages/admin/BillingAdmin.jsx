import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import StatusBadge from "../../components/StatusBadge.jsx";

export default function BillingAdmin() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    api.get("/billing").then((res) => setBills(res.data)).catch(() => {});
  }, []);

  const totalRevenue = bills.filter((b) => b.status === "paid").reduce((s, b) => s + b.total_amount, 0);
  const pending = bills.filter((b) => b.status === "unpaid").reduce((s, b) => s + b.total_amount, 0);

  return (
    <div>
      <div className="page-header"><div><h1>Billing</h1><p>All invoices across the hospital.</p></div></div>
      <div className="stat-row">
        <div className="stat-tile"><div className="value">₹{totalRevenue}</div><div className="label">Collected</div></div>
        <div className="stat-tile"><div className="value">₹{pending}</div><div className="label">Pending</div></div>
        <div className="stat-tile"><div className="value">{bills.length}</div><div className="label">Total invoices</div></div>
      </div>
      <table className="data-table">
        <thead><tr><th>Patient</th><th>Date</th><th>Items</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>
          {bills.map((b) => (
            <tr key={b.id}>
              <td>{b.patient?.name}</td>
              <td>{new Date(b.created_at).toLocaleDateString()}</td>
              <td>{b.items.map((i) => i.label).join(", ")}</td>
              <td>₹{b.total_amount}</td>
              <td><StatusBadge status={b.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
