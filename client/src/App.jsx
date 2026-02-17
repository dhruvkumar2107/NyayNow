import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Components */
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import SmoothScroll from "./components/SmoothScroll";

/* Lazy Load Pages */
const Home = lazy(() => import("./pages/Home"));
const Assistant = lazy(() => import("./pages/Assistant"));
const VoiceAssistant = lazy(() => import("./pages/VoiceAssistant")); // NEW
const Analyze = lazy(() => import("./pages/Analyze"));
const JudgeAI = lazy(() => import("./pages/JudgeAI"));
const CaseFileAnalyzer = lazy(() => import("./pages/CaseFileAnalyzer")); // NEW
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
const VideoCall = lazy(() => import("./pages/VideoCall"));
const SetupProfile = lazy(() => import("./pages/SetupProfile")); // NEW
const VerificationPending = lazy(() => import("./pages/VerificationPending")); // NEW

/* Lazy Load Auth */
const Login = lazy(() => import("./auth/Login"));
const Register = lazy(() => import("./auth/Register"));

/* Lazy Load Dashboards */
const ClientDashboard = lazy(() => import("./dashboards/ClientDashboard"));
const LawyerDashboard = lazy(() => import("./dashboards/LawyerDashboard"));
const EditProfile = lazy(() => import("./dashboards/EditProfile"));
const LawyerProfile = lazy(() => import("./pages/LawyerProfile"));
const AdminDashboard = lazy(() => import("./dashboards/AdminDashboard"));
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const CourtStatus = lazy(() => import("./pages/CourtStatus"));
const MootCourt = lazy(() => import("./pages/MootCourt"));
const DevilsAdvocate = lazy(() => import("./pages/DevilsAdvocate"));

const JudgeProfile = lazy(() => import("./pages/JudgeProfile"));
const LegalResearch = lazy(() => import("./pages/LegalResearch")); // NEW
const DraftingLab = lazy(() => import("./pages/DraftingLab")); // NEW
const CareerHub = lazy(() => import("./pages/CareerHub")); // NEW

/* Company Pages */
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Careers = lazy(() => import("./pages/Careers"));
const Blog = lazy(() => import("./pages/Blog"));
const Contact = lazy(() => import("./pages/Contact"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const DigiLockerMock = lazy(() => import("./pages/DigiLockerMock")); // NEW

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
      {/* <SmoothScroll /> */}
      {/* ROOT APP WRAPPER */}
      <div className="min-h-screen bg-[#020617] text-slate-400 font-sans">
        <Toaster position="top-right" reverseOrder={false} />
        {/* FIXED NAVBAR */}
        <Navbar />

        {/* PAGE CONTENT */}
        <main className="pt-[72px]">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* LEGAL */}
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              {/* PUBLIC ROUTES */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register" element={<Register />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/verification-pending" element={<VerificationPending />} /> {/* NEW */}
              <Route path="/video-call/:id" element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />

              {/* PUBLIC LAWYER PROFILE */}
              <Route path="/lawyer/:id" element={<LawyerProfile />} />

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
                  <ProtectedRoute allowedRoles={["lawyer"]}>
                    <LawyerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lawyer/profile/edit"
                element={
                  <ProtectedRoute allowedRoles={["lawyer"]}>
                    <EditProfile />
                  </ProtectedRoute>
                }
              />

              {/* ADMIN DASHBOARD */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* SHARED FEATURES (PROTECTED) */}
              {/* SHARED FEATURES (PUBLICLY ACCESSIBLE FOR GUESTS) */}
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/voice-assistant" element={<VoiceAssistant />} />
              <Route path="/judge-ai" element={<JudgeAI />} />
              <Route path="/judge-pro" element={<CaseFileAnalyzer />} />
              <Route path="/analyze" element={<Analyze />} />
              <Route path="/agreements" element={<Agreements />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/nearby" element={<Nearby />} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/meet/:id" element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />
              <Route path="/rent-agreement" element={<ProtectedRoute><AgreementForm /></ProtectedRoute>} />
              <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
              <Route path="/ecourts" element={<CourtStatus />} />
              <Route path="/moot-court" element={<MootCourt />} />
              <Route path="/devils-advocate" element={<DevilsAdvocate />} />
              <Route path="/judge-profile" element={<JudgeProfile />} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/setup-profile" element={<ProtectedRoute><SetupProfile /></ProtectedRoute>} /> {/* NEW */}
              <Route path="/research" element={<LegalResearch />} /> {/* NEW */}
              <Route path="/drafting" element={<DraftingLab />} /> {/* NEW */}
              <Route path="/career" element={<CareerHub />} /> {/* NEW */}

              {/* COMPANY PAGES */}
              <Route path="/about" element={<AboutUs />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/digilocker-verify" element={<DigiLockerMock />} /> {/* NEW: Mock Route */}

            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
