import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", gender: "female" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/patient");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-brand">
        <div className="auth-mark">Healtify</div>
        <div>
          <h1>Join in minutes.</h1>
          <p>Create a patient account to book appointments, view prescriptions and order medicines online.</p>
        </div>
        <div style={{ fontSize: "0.85rem", color: "#9FC2BC" }}>Hospital &amp; Healthcare Management System</div>
      </div>
      <div className="auth-form-side">
        <form className="auth-card" onSubmit={onSubmit}>
          <h2>Create your account</h2>
          <p style={{ marginBottom: 24 }}>Patient registration.</p>
          <div className="field">
            <label>Full name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="field">
            <label>Gender</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          {error && <div className="error-text">{error}</div>}
          <button className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
          <div className="helper-link">
            Already registered? <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
