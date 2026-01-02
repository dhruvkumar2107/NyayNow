import { BrowserRouter, Routes, Route } from "react-router-dom";


/* Pages */
import Home from "./pages/Home";
import Assistant from "./pages/Assistant";
import Analyze from "./pages/Analyze";
import Agreements from "./pages/Agreements";
import Marketplace from "./pages/Marketplace";
import Nearby from "./pages/Nearby";
import Messages from "./pages/Messages";
import Pricing from "./pages/Pricing";
import AgreementForm from "./pages/AgreementForm";
import PaymentSuccess from "./pages/PaymentSuccess";

/* Auth */
import Login from "./auth/Login";
import Register from "./auth/Register";

/* Dashboards */
import ClientDashboard from "./dashboards/ClientDashboard";
import LawyerDashboard from "./dashboards/LawyerDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";

/* Components */
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      {/* ROOT APP WRAPPER */}
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
        {/* FIXED NAVBAR */}
        <Navbar />

        {/* PAGE CONTENT */}
        <main className="pt-20">
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* CLIENT DASHBOARD */}
            <Route
              path="/client/dashboard"
              element={
                <ProtectedRoute role="client">
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />

            {/* LAWYER DASHBOARD */}
            <Route
              path="/lawyer/dashboard"
              element={
                <ProtectedRoute role="lawyer">
                  <LawyerDashboard />
                </ProtectedRoute>
              }
            />

            {/* ADMIN DASHBOARD (Hidden/Protected - for now simplified access) */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* SHARED FEATURES (PUBLIC ACCESS) */}
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/agreements" element={<Agreements />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/nearby" element={<Nearby />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/rent-agreement" element={<AgreementForm />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
