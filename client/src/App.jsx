import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Components */
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

/* Lazy Load Pages */
const Home = lazy(() => import("./pages/Home"));
const Assistant = lazy(() => import("./pages/Assistant"));
const Analyze = lazy(() => import("./pages/Analyze"));
const Agreements = lazy(() => import("./pages/Agreements"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Nearby = lazy(() => import("./pages/Nearby"));
const Messages = lazy(() => import("./pages/Messages"));
const Pricing = lazy(() => import("./pages/Pricing"));
const AgreementForm = lazy(() => import("./pages/AgreementForm"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Settings = lazy(() => import("./pages/Settings"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Analytics = lazy(() => import("./pages/Analytics"));

/* Lazy Load Auth */
const Login = lazy(() => import("./auth/Login"));
const Register = lazy(() => import("./auth/Register"));
const VideoCall = lazy(() => import("./pages/VideoCall"));

/* Lazy Load Dashboards */
const ClientDashboard = lazy(() => import("./dashboards/ClientDashboard"));
const LawyerDashboard = lazy(() => import("./dashboards/LawyerDashboard"));
const AdminDashboard = lazy(() => import("./dashboards/AdminDashboard"));

/* Loading Component */
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium animate-pulse">Loading...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      {/* ROOT APP WRAPPER */}
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
        <Toaster position="top-right" reverseOrder={false} />
        {/* FIXED NAVBAR */}
        <Navbar />

        {/* PAGE CONTENT */}
        <main className="pt-20">
          <Suspense fallback={<LoadingFallback />}>
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
              <Route path="/meet/:id" element={<VideoCall />} />
              <Route path="/rent-agreement" element={<AgreementForm />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}
