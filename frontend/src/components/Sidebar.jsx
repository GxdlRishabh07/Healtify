import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const LINKS = {
  patient: [
    { to: "/patient", label: "Dashboard", end: true },
    { to: "/patient/find-doctor", label: "Find a Doctor" },
    { to: "/patient/appointments", label: "My Appointments" },
    { to: "/patient/records", label: "Medical Records" },
    { to: "/patient/billing", label: "Billing" },
    { to: "/patient/pharmacy", label: "Order Medicine" },
  ],
  doctor: [
    { to: "/doctor", label: "Dashboard", end: true },
    { to: "/doctor/appointments", label: "My Appointments" },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/doctors", label: "Manage Doctors" },
    { to: "/admin/patients", label: "Manage Patients" },
    { to: "/admin/appointments", label: "Manage Appointments" },
    { to: "/admin/billing", label: "Billing" },
    { to: "/admin/pharmacy", label: "Pharmacy Orders" },
    { to: "/admin/reports", label: "Reports & Forecast" },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;
  const links = LINKS[user.role] || [];

  return (
    <aside className="sidebar">
      <div className="brand">Healtify</div>
      <nav>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? "active" : "")}>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="user-box">
        <div className="name">{user.name}</div>
        <div className="role">{user.role}</div>
        <button className="btn btn-ghost btn-sm btn-full" onClick={logout}>Log out</button>
      </div>
    </aside>
  );
}
