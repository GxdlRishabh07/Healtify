import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

export default function Billing() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);

  const load = () => api.get(`/billing/patient/${user.id}`).then((res) => setBills(res.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const pay = async (id) => {
    await api.put(`/billing/${id}/pay`);
    load();
  };

  return (
    <div>
      <div className="page-header"><div><h1>Billing</h1><p>Invoices for your consultations and treatments.</p></div></div>
      {bills.length === 0 ? (
        <div className="empty-state">No bills yet.</div>
      ) : (
        <table className="data-table">
          <thead><tr><th>Date</th><th>Items</th><th>Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {bills.map((b) => (
              <tr key={b.id}>
                <td>{new Date(b.created_at).toLocaleDateString()}</td>
                <td>{b.items.map((i) => i.label).join(", ")}</td>
                <td>₹{b.total_amount}</td>
                <td><StatusBadge status={b.status} /></td>
                <td>{b.status === "unpaid" && <button className="btn btn-primary btn-sm" onClick={() => pay(b.id)}>Pay now</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
