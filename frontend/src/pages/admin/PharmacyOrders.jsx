import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";

const NEXT_STATUS = {
  placed: "processing",
  processing: "out_for_delivery",
  out_for_delivery: "delivered",
};

export default function PharmacyOrders() {
  const [orders, setOrders] = useState([]);

  const load = () => api.get("/orders").then((res) => setOrders(res.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const advance = async (id, status) => {
    const next = NEXT_STATUS[status];
    if (!next) return;
    if (!window.confirm(`Mark this order as "${next.replace("_", " ")}"?`)) return;
    await api.put(`/orders/${id}/status`, { status: next });
    load();
  };

  return (
    <div>
      <div className="page-header"><div><h1>Pharmacy orders</h1><p>Medicine orders placed by patients.</p></div></div>
      <table className="data-table">
        <thead><tr><th>Patient</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.patient?.name}</td>
              <td>{o.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}</td>
              <td>₹{o.total_amount}</td>
              <td style={{ textTransform: "capitalize" }}>{o.status.replace("_", " ")}</td>
              <td>
                {NEXT_STATUS[o.status] && (
                  <button className="btn btn-ghost btn-sm" onClick={() => advance(o.id, o.status)}>
                    Mark as {NEXT_STATUS[o.status].replace("_", " ")}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
