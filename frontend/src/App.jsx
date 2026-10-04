import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Sidebar from "./components/Sidebar.jsx";
import { useAuth } from "./context/AuthContext.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import PatientDashboard from "./pages/patient/Dashboard.jsx";
import FindDoctor from "./pages/patient/FindDoctor.jsx";
import BookAppointment from "./pages/patient/BookAppointment.jsx";
import MyAppointments from "./pages/patient/MyAppointments.jsx";
import MedicalRecords from "./pages/patient/MedicalRecords.jsx";
import Billing from "./pages/patient/Billing.jsx";
import Pharmacy from "./pages/patient/Pharmacy.jsx";

import DoctorDashboard from "./pages/doctor/Dashboard.jsx";
import DoctorAppointments from "./pages/doctor/Appointments.jsx";

import AdminDashboard from "./pages/admin/Dashboard.jsx";
import ManageDoctors from "./pages/admin/ManageDoctors.jsx";
import ManagePatients from "./pages/admin/ManagePatients.jsx";
import ManageAppointments from "./pages/admin/ManageAppointments.jsx";
import BillingAdmin from "./pages/admin/BillingAdmin.jsx";
import PharmacyOrders from "./pages/admin/PharmacyOrders.jsx";
import Reports from "./pages/admin/Reports.jsx";

function DashboardLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-area">{children}</div>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? `/${user.role}` : "/login"} replace />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}`} /> : <Register />} />

      {/* Patient */}
      <Route path="/patient" element={<ProtectedRoute roles={["patient"]}><DashboardLayout><PatientDashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/patient/find-doctor" element={<ProtectedRoute roles={["patient"]}><DashboardLayout><FindDoctor /></DashboardLayout></ProtectedRoute>} />
      <Route path="/patient/book/:doctorId" element={<ProtectedRoute roles={["patient"]}><DashboardLayout><BookAppointment /></DashboardLayout></ProtectedRoute>} />
      <Route path="/patient/appointments" element={<ProtectedRoute roles={["patient"]}><DashboardLayout><MyAppointments /></DashboardLayout></ProtectedRoute>} />
      <Route path="/patient/records" element={<ProtectedRoute roles={["patient"]}><DashboardLayout><MedicalRecords /></DashboardLayout></ProtectedRoute>} />
      <Route path="/patient/billing" element={<ProtectedRoute roles={["patient"]}><DashboardLayout><Billing /></DashboardLayout></ProtectedRoute>} />
      <Route path="/patient/pharmacy" element={<ProtectedRoute roles={["patient"]}><DashboardLayout><Pharmacy /></DashboardLayout></ProtectedRoute>} />

      {/* Doctor */}
      <Route path="/doctor" element={<ProtectedRoute roles={["doctor"]}><DashboardLayout><DoctorDashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/doctor/appointments" element={<ProtectedRoute roles={["doctor"]}><DashboardLayout><DoctorAppointments /></DashboardLayout></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/doctors" element={<ProtectedRoute roles={["admin"]}><DashboardLayout><ManageDoctors /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/patients" element={<ProtectedRoute roles={["admin"]}><DashboardLayout><ManagePatients /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/appointments" element={<ProtectedRoute roles={["admin"]}><DashboardLayout><ManageAppointments /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/billing" element={<ProtectedRoute roles={["admin"]}><DashboardLayout><BillingAdmin /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/pharmacy" element={<ProtectedRoute roles={["admin"]}><DashboardLayout><PharmacyOrders /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute roles={["admin"]}><DashboardLayout><Reports /></DashboardLayout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
