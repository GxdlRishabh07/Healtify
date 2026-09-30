import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Pharmacy() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState({}); // medicineId -> qty
  const [address, setAddress] = useState("");
  const [orders, setOrders] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState("");

  const loadMedicines = () => api.get("/medicines", { params: { search } }).then((res) => setMedicines(res.data)).catch(() => {});
  const loadOrders = () => api.get("/orders/my").then((res) => setOrders(res.data)).catch(() => {});

  useEffect(() => { loadMedicines(); loadOrders(); }, []);

  const addToCart = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const removeFromCart = (id) => setCart((c) => {
    const next = { ...c };
    if (next[id] <= 1) delete next[id]; else next[id] -= 1;
    return next;
  });

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const med = medicines.find((m) => m.id === id);
    return med ? { ...med, qty } : null;
  }).filter(Boolean);
  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  const placeOrder = async () => {
    if (!address) { setMessage("Please add a delivery address."); return; }
    setPlacing(true);
    setMessage("");
    try {
      await api.post("/orders", {
        items: cartItems.map((i) => ({ medicineId: i.id, quantity: i.qty })),
        deliveryAddress: address,
      });
      setCart({});
      setMessage("Order placed successfully.");
      loadOrders();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Order medicine</h1><p>Browse the pharmacy catalog and get medicines delivered.</p></div>
      </div>

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "2 1 420px" }}>
          <input
            placeholder="Search medicines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadMedicines()}
            style={{ width: "100%", padding: "11px 13px", border: "1px solid var(--line)", borderRadius: 8, marginBottom: 16 }}
          />
          <div className="grid-cards">
            {medicines.map((m) => (
              <div className="doctor-tile" key={m.id}>
                <h3>{m.name}</h3>
                <div className="dept">{m.brand} · {m.category}</div>
                <div className="meta">₹{m.price} {m.requires_prescription ? "· Prescription required" : ""}</div>
                <button className="btn btn-secondary btn-sm" onClick={() => addToCart(m.id)}>Add to cart</button>
              </div>
            ))}
            {medicines.length === 0 && <div className="empty-state">No medicines found.</div>}
          </div>

          <div className="section-title" style={{ marginTop: 32 }}>Order history</div>
          {orders.length === 0 ? <div className="empty-state">No orders yet.</div> : (
            <table className="data-table">
              <thead><tr><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td>{o.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}</td>
                    <td>₹{o.total_amount}</td>
                    <td>{o.status.replace("_", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel" style={{ flex: "1 1 280px", position: "sticky", top: 24 }}>
          <div className="section-title">Your cart</div>
          {cartItems.length === 0 ? (
            <p style={{ fontSize: "0.9rem" }}>Cart is empty.</p>
          ) : (
            cartItems.map((i) => (
              <div className="cart-row" key={i.id}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{i.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--slate)" }}>₹{i.price} each</div>
                </div>
                <div className="qty-control">
                  <button onClick={() => removeFromCart(i.id)}>−</button>
                  <span>{i.qty}</span>
                  <button onClick={() => addToCart(i.id)}>+</button>
                </div>
              </div>
            ))
          )}
          {cartItems.length > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontWeight: 700 }}>
                <span>Total</span><span>₹{total}</span>
              </div>
              <div className="field">
                <label>Delivery address</label>
                <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              {message && <div className="error-text">{message}</div>}
              <button className="btn btn-primary btn-full" disabled={placing} onClick={placeOrder}>
                {placing ? "Placing order..." : "Place order"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
