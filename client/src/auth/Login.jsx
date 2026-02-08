import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { GoogleLogin } from '@react-oauth/google';
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithToken } = useAuth();
  const [method, setMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [googleData, setGoogleData] = useState(null);

  const handleEmailLogin = async () => {
    if (!email || !password) return toast.error("Please enter credentials");
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      toast.success("Welcome back!");
      navigate(res.user.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard");
    } else {
      toast.error(res.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/google", { token: credentialResponse.credential });
      if (res.status === 202 && res.data.requiresSignup) {
        setGoogleData(credentialResponse.credential);
        setShowRoleModal(true);
        setLoading(false);
      } else {
        loginWithToken(res.data.user, res.data.token);
        toast.success("Login Successful!");
        navigate(res.data.user.role === 'lawyer' ? "/lawyer/dashboard" : "/client/dashboard");
      }
    } catch (err) {
      toast.error("Google Login Failed");
      setLoading(false);
    }
  };

  const traverseWithRole = async (selectedRole) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/google", { token: googleData, role: selectedRole });
      loginWithToken(res.data.user, res.data.token);
      toast.success(`Welcome!`);
      navigate(selectedRole === 'lawyer' ? "/lawyer/dashboard" : "/client/dashboard");
    } catch (err) { toast.error("Reg Failed"); }
    finally { setLoading(false); setShowRoleModal(false); }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-white font-sans">

      {/* LEFT: BRANDING (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col justify-between bg-[#0B1120] text-white p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600 rounded-full blur-[100px] opacity-20 translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 w-fit">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-xl">⚖️</div>
            <span className="font-bold text-xl tracking-tight">NyayNow</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h1 className="text-5xl font-extrabold leading-tight">Justice,<br />Simplified.</h1>
          <p className="text-slate-400 text-lg">Join 10,000+ lawyers and citizens using India's most advanced AI legal assistant.</p>

          <div className="flex -space-x-4 pt-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[#0B1120] flex items-center justify-center text-xs">👤</div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          © 2024 LegalTech India Pvt Ltd.
        </div>
      </div>

      {/* RIGHT: FORM */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 mt-2">Enter your details to access your account.</p>
          </div>

          <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-200">
            <button onClick={() => setMethod("email")} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${method === "email" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>Email</button>
            <button onClick={() => setMethod("mobile")} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${method === "mobile" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>Mobile OTP</button>
          </div>

          {method === "email" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-medium text-slate-800" placeholder="name@company.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-medium text-slate-800" placeholder="••••••••" />
              </div>
              <button onClick={handleEmailLogin} disabled={loading} className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-70">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-center text-slate-400 py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <span className="block text-2xl mb-2">🚧</span>
              Mobile Login is under maintenance.
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-xs uppercase font-bold text-slate-400 bg-white px-4">Or continue with</div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Failed")} shape="circle" size="large" />
          </div>

          <p className="text-center text-slate-500 text-sm">
            Don't have an account? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Create Account</Link>
          </p>

        </div>
      </div>

      {/* ROLE MODAL */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Finish Setup</h2>
            <p className="text-slate-500 mb-8 text-sm">Select your primary role to continue.</p>
            <div className="space-y-3">
              <button onClick={() => traverseWithRole("client")} className="w-full p-4 border rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition font-bold text-left flex items-center gap-3 group">
                <span className="text-2xl bg-slate-100 p-2 rounded-lg group-hover:bg-white">👤</span> Client
              </button>
              <button onClick={() => traverseWithRole("lawyer")} className="w-full p-4 border rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition font-bold text-left flex items-center gap-3 group">
                <span className="text-2xl bg-slate-100 p-2 rounded-lg group-hover:bg-white">⚖️</span> Lawyer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
