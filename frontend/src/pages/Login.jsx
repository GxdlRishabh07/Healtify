import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

const ROLES = [
  {
    key: "patient",
    label: "Patient",
    title: "Welcome back",
    sub: "Book visits, see your records and order medicines.",
    demo: { email: "patient1@example.com", password: "Password@123" },
  },
  {
    key: "doctor",
    label: "Doctor",
    title: "Doctor sign in",
    sub: "Review today's appointments and write prescriptions.",
    demo: { email: "doctor1@hospital.com", password: "Password@123" },
  },
  {
    key: "admin",
    label: "Admin",
    title: "Admin sign in",
    sub: "Manage doctors, patients, billing and reports.",
    demo: { email: "admin@hospital.com", password: "Password@123" },
  },
];

const ECG_PATH =
  "M0 80 H120 L140 80 L160 44 L182 124 L206 14 L232 104 L250 80 H340 L358 80 L376 56 L396 112 L414 32 L438 98 L454 80 H600";

const Icon = {
  mail: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
  ),
  eyeOff: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18" /><path d="M10.6 5.1A10.5 10.5 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.5 6.6A17 17 0 0 0 2 12s3.6 7 10 7a10.3 10.3 0 0 0 4.4-1" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
  ),
  pill: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-40 12 12)" /><path d="m9 9 6 6" /></svg>
  ),
  card: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18M7 15h4" /></svg>
  ),
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [roleIndex, setRoleIndex] = useState(0);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const current = ROLES[roleIndex];
  const role = current.key;

  const pickRole = (i) => {
    setRoleIndex(i);
    setError("");
    setShowPw(false);
    setForm({ email: "", password: "" });
  };

  const useDemo = () => {
    setError("");
    setForm({ ...current.demo });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Make sure the account belongs to the selected login type before signing in.
      const check = await api.post("/auth/login", form);
      if (check.data.user.role !== role) {
        setError(`This is not a ${current.label.toLowerCase()} account. Pick the right login above.`);
        return;
      }
      const user = await login(form.email, form.password);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg-screen">
      <style>{`
        .lg-screen {
          --lg-ink: #0A2F3C;
          --lg-aqua: #4FD1C5;
          min-height: 100vh;
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
          background: #fff;
        }

        /* ---------- left art panel ---------- */
        .lg-art {
          position: relative; overflow: hidden; color: #fff;
          padding: 44px clamp(28px, 5vw, 68px);
          display: flex; flex-direction: column; justify-content: space-between; gap: 32px;
          background:
            radial-gradient(620px 420px at 88% -8%, rgba(79,209,197,0.30), transparent 62%),
            radial-gradient(520px 380px at -10% 108%, rgba(232,104,61,0.20), transparent 60%),
            linear-gradient(160deg, var(--lg-ink) 0%, #0B4A4A 100%);
        }
        .lg-art::before {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1.4px);
          background-size: 26px 26px;
          -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 35%, #000 70%, transparent 100%);
                  mask-image: linear-gradient(180deg, transparent 0%, #000 35%, #000 70%, transparent 100%);
        }
        .lg-art > * { position: relative; }
        .lg-logo { display: flex; align-items: center; gap: 12px; font-family: var(--font-display); font-size: 1.35rem; font-weight: 600; letter-spacing: -0.01em; }
        .lg-art h1 {
          color: #fff; font-size: clamp(2.2rem, 3.8vw, 3.4rem); line-height: 1.05;
          max-width: 11ch; margin-bottom: 16px;
        }
        .lg-art .lg-lead { color: #B9D6D6; max-width: 40ch; margin: 0; font-size: 1.02rem; }

        .lg-ecg-wrap { margin: 30px 0 6px; position: relative; }
        .lg-ecg { display: block; width: 100%; height: 150px; overflow: visible; }
        .lg-ecg .lg-base { fill: none; stroke: rgba(255,255,255,0.14); stroke-width: 1.5; stroke-dasharray: 2 7; }
        .lg-ecg .lg-line {
          fill: none; stroke: var(--lg-aqua); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round;
          stroke-dasharray: 100; stroke-dashoffset: 100;
          filter: drop-shadow(0 0 7px rgba(79,209,197,0.75));
          animation: lg-draw 4.6s linear infinite;
        }
        .lg-ecg .lg-dot {
          fill: #fff; filter: drop-shadow(0 0 9px var(--lg-aqua));
          offset-path: path("${ECG_PATH}"); offset-rotate: 0deg;
          animation: lg-travel 4.6s linear infinite;
        }
        @keyframes lg-draw {
          0% { stroke-dashoffset: 100; opacity: 1; }
          72% { stroke-dashoffset: 0; opacity: 1; }
          92% { stroke-dashoffset: 0; opacity: 0; }
          100% { stroke-dashoffset: 100; opacity: 0; }
        }
        @keyframes lg-travel {
          0% { offset-distance: 0%; opacity: 1; }
          72% { offset-distance: 100%; opacity: 1; }
          73%, 100% { offset-distance: 100%; opacity: 0; }
        }

        .lg-feats { display: flex; flex-wrap: wrap; gap: 10px; }
        .lg-feat {
          display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px;
          border-radius: 100px; font-size: 0.85rem; font-weight: 500; color: #DDF0EE;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(6px);
        }
        .lg-feat svg { color: var(--lg-aqua); }
        .lg-foot { font-size: 0.82rem; color: #8FB6B6; }

        /* ---------- right form panel ---------- */
        .lg-form-side {
          display: flex; align-items: center; justify-content: center; padding: 40px 24px;
          background: linear-gradient(180deg, #FFFFFF 0%, var(--mint) 100%);
        }
        .lg-card { width: 100%; max-width: 420px; }
        .lg-card h2 { font-size: 1.9rem; margin-bottom: 6px; color: var(--ink); }
        .lg-card .lg-sub { margin-bottom: 22px; }

        .lg-tabs {
          position: relative; display: grid; grid-template-columns: repeat(3, 1fr);
          padding: 4px; margin-bottom: 26px; border-radius: 12px;
          background: #E7F0EE; border: 1px solid var(--line);
        }
        .lg-pill {
          position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc((100% - 8px) / 3);
          border-radius: 9px; background: #fff;
          box-shadow: 0 2px 8px rgba(10,47,60,0.16), 0 0 0 1px rgba(14,92,86,0.08);
          transition: transform 0.28s cubic-bezier(.4,.1,.2,1);
        }
        .lg-tab {
          position: relative; z-index: 1; padding: 10px 0; border: 0; background: transparent; cursor: pointer;
          font-weight: 600; font-size: 0.92rem; color: var(--slate); border-radius: 9px; transition: color 0.2s;
        }
        .lg-tab.on { color: var(--teal-dark); }
        .lg-tab:focus-visible { outline: 2px solid var(--teal); outline-offset: 1px; }

        .lg-field { margin-bottom: 16px; }
        .lg-field label { display: block; font-size: 0.84rem; font-weight: 600; color: var(--ink); margin-bottom: 7px; }
        .lg-input { position: relative; }
        .lg-input > svg:first-child { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #7C9391; pointer-events: none; }
        .lg-input input {
          width: 100%; padding: 13px 14px 13px 44px; border-radius: 11px;
          border: 1px solid var(--line); background: #fff; color: var(--ink); outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .lg-input input.has-toggle { padding-right: 46px; }
        .lg-input input::placeholder { color: #9AAFAD; }
        .lg-input input:focus { border-color: var(--teal); box-shadow: 0 0 0 4px rgba(14,92,86,0.12); }
        .lg-input:focus-within > svg:first-child { color: var(--teal); }
        .lg-eye {
          position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
          width: 36px; height: 36px; display: grid; place-items: center; border: 0; background: transparent;
          color: #7C9391; cursor: pointer; border-radius: 8px;
        }
        .lg-eye:hover { color: var(--teal); background: var(--mint); }

        .lg-error {
          display: flex; gap: 8px; align-items: flex-start; margin: 0 0 14px; padding: 10px 12px;
          border-radius: 10px; font-size: 0.86rem; color: #A2321F; background: #FCE9E5; border: 1px solid #F3C4BB;
        }

        .lg-submit {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 14px 18px; border: 0; border-radius: 11px; cursor: pointer;
          font-weight: 600; font-size: 1rem; color: #fff;
          background: linear-gradient(180deg, #EE7448 0%, var(--coral) 60%, var(--coral-dark) 100%);
          box-shadow: 0 8px 20px rgba(232,104,61,0.32), inset 0 1px 0 rgba(255,255,255,0.25);
          transition: transform 0.08s, box-shadow 0.15s, filter 0.15s;
        }
        .lg-submit:hover { filter: brightness(1.05); box-shadow: 0 10px 24px rgba(232,104,61,0.4), inset 0 1px 0 rgba(255,255,255,0.25); }
        .lg-submit:active { transform: scale(0.985); }
        .lg-submit[disabled] { opacity: 0.7; cursor: not-allowed; }
        .lg-spin { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; animation: lg-rot 0.7s linear infinite; }
        @keyframes lg-rot { to { transform: rotate(360deg); } }

        .lg-alt { margin-top: 18px; text-align: center; font-size: 0.9rem; color: var(--slate); }
        .lg-alt a { font-weight: 600; }

        .lg-demo {
          margin-top: 24px; padding: 14px 16px; border-radius: 12px;
          background: #EEF6F4; border: 1px dashed #9BC9C2;
        }
        .lg-demo-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
        .lg-demo-head b { font-size: 0.86rem; color: var(--ink); }
        .lg-fill {
          padding: 6px 12px; border-radius: 8px; border: 1px solid var(--teal); background: #fff; color: var(--teal-dark);
          font-weight: 600; font-size: 0.8rem; cursor: pointer; transition: background 0.15s, color 0.15s;
        }
        .lg-fill:hover { background: var(--teal); color: #fff; }
        .lg-demo-row { display: flex; justify-content: space-between; gap: 12px; font-size: 0.84rem; padding: 3px 0; color: var(--slate); }
        .lg-demo-row code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.8rem;
          color: var(--ink); background: #fff; padding: 2px 8px; border-radius: 6px; border: 1px solid var(--line);
          word-break: break-all; text-align: right;
        }

        @media (max-width: 900px) {
          .lg-screen { grid-template-columns: 1fr; }
          .lg-art { padding: 28px 24px 30px; gap: 18px; }
          .lg-art h1 { font-size: 2rem; max-width: none; }
          .lg-ecg { height: 90px; }
          .lg-ecg-wrap { margin: 14px 0 0; }
          .lg-feats { display: none; }
          .lg-foot { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lg-ecg .lg-line { animation: none; stroke-dashoffset: 0; }
          .lg-ecg .lg-dot { display: none; }
          .lg-pill { transition: none; }
        }
      `}</style>

      <section className="lg-art">
        <div className="lg-logo">
          <svg width="40" height="40" viewBox="0 0 34 34" aria-hidden="true">
            <rect width="34" height="34" rx="10" fill="#E8683D" />
            <path d="M4 18h6l3-7 5 14 3-7h9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Healtify
        </div>

        <div>
          <h1>Care, coordinated.</h1>
          <p className="lg-lead">
            One system for patients, doctors and staff. Appointments, prescriptions, billing and pharmacy, all in one place.
          </p>
          <div className="lg-ecg-wrap" aria-hidden="true">
            <svg className="lg-ecg" viewBox="0 0 600 150" preserveAspectRatio="none">
              <g transform="translate(0,-5)">
                <path className="lg-base" d="M0 80 H600" />
                <path className="lg-line" d={ECG_PATH} pathLength="100" />
                <circle className="lg-dot" r="5" cx="0" cy="0" />
              </g>
            </svg>
          </div>
        </div>

        <div>
          <div className="lg-feats">
            <span className="lg-feat">{Icon.calendar} Appointments</span>
            <span className="lg-feat">{Icon.pill} E-prescriptions</span>
            <span className="lg-feat">{Icon.card} Billing &amp; pharmacy</span>
          </div>
          <div className="lg-foot" style={{ marginTop: 18 }}>Hospital &amp; Healthcare Management System</div>
        </div>
      </section>

      <section className="lg-form-side">
        <form className="lg-card" onSubmit={onSubmit}>
          <h2>{current.title}</h2>
          <p className="lg-sub">{current.sub}</p>

          <div className="lg-tabs" role="tablist" aria-label="Login type">
            <span className="lg-pill" style={{ transform: `translateX(${roleIndex * 100}%)` }} />
            {ROLES.map((r, i) => (
              <button
                type="button" key={r.key} role="tab" aria-selected={roleIndex === i}
                className={`lg-tab ${roleIndex === i ? "on" : ""}`}
                onClick={() => pickRole(i)}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="lg-field">
            <label htmlFor="lg-email">Email</label>
            <div className="lg-input">
              {Icon.mail}
              <input id="lg-email" type="email" required autoComplete="username" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter your email" />
            </div>
          </div>

          <div className="lg-field">
            <label htmlFor="lg-password">Password</label>
            <div className="lg-input">
              {Icon.lock}
              <input id="lg-password" className="has-toggle" type={showPw ? "text" : "password"} required
                autoComplete="current-password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" />
              <button type="button" className="lg-eye" onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}>
                {showPw ? Icon.eyeOff : Icon.eye}
              </button>
            </div>
          </div>

          {error && <div className="lg-error" role="alert">{error}</div>}

          <button className="lg-submit" disabled={loading}>
            {loading && <span className="lg-spin" />}
            {loading ? "Signing in..." : `Sign in as ${current.label}`}
          </button>

          {role === "patient" ? (
            <div className="lg-alt">New patient? <Link to="/register">Create an account</Link></div>
          ) : (
            <div className="lg-alt" style={{ fontSize: "0.82rem" }}>
              {current.label} accounts are created by hospital staff.
            </div>
          )}

          <div className="lg-demo">
            <div className="lg-demo-head">
              <b>Demo {current.label.toLowerCase()} account</b>
              <button type="button" className="lg-fill" onClick={useDemo}>Fill for me</button>
            </div>
            <div className="lg-demo-row"><span>Email</span><code>{current.demo.email}</code></div>
            <div className="lg-demo-row"><span>Password</span><code>{current.demo.password}</code></div>
          </div>
        </form>
      </section>
    </div>
  );
}
