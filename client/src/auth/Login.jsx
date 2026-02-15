import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithToken } = useAuth();
  const [method, setMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
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
    <main className="min-h-screen grid lg:grid-cols-[1fr_500px] xl:grid-cols-[1fr_600px] bg-[#020617] font-sans selection:bg-indigo-500/30">

      {/* LEFT: BRANDING / AMBIENCE */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden p-16">
        {/* Ambient Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 w-fit group">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 group-hover:scale-105 transition duration-300">⚖️</div>
            <span className="font-bold text-2xl tracking-tight text-white/90">NyayNow</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8 max-w-2xl">
          <h1 className="text-6xl font-extrabold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400">
            Welcome<br />Back.
          </h1>
          <p className="text-xl text-slate-400 max-w-lg">
            Your personal AI legal assistant is ready to help you navigate the complexities of Indian Law.
          </p>
        </div>

        <p className="relative z-10 text-xs text-slate-500 font-medium tracking-widest uppercase">
          Secure • Confidential • AI-Powered
        </p>
      </div>

      {/* RIGHT: FORM */}
      <div className="flex flex-col justify-center p-6 lg:p-12 bg-[#0f172a]/80 backdrop-blur-xl border-l border-white/10 overflow-y-auto">
        <div className="w-full max-w-md mx-auto space-y-8">

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white">Sign In</h2>
            <p className="text-slate-400 mt-2">Access your dashboard and case files.</p>
          </div>

          <div className="flex gap-1 p-1.5 bg-black/40 rounded-2xl border border-white/10">
            <button onClick={() => setMethod("email")} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${method === "email" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
              📧 Email
            </button>
            <button onClick={() => setMethod("mobile")} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${method === "mobile" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
              📱 Mobile
            </button>
          </div>

          {method === "email" ? (
            <div className="space-y-5">
              <InputGroup label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" />
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="block text-xs font-bold text-slate-400 ml-1">Password</label>
                  <Link to="/forgot-password" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Forgot?</Link>
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" placeholder="••••••••" />
              </div>

              <button onClick={handleEmailLogin} disabled={loading} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-70 mt-2 relative overflow-hidden group">
                <span className="relative z-10">{loading ? "Signing in..." : "Sign In"}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 opacity-0 group-hover:opacity-100 transition duration-300" />
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-center text-slate-400 py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">🚧</div>
              <p className="font-medium text-white">OTP Login Disabled</p>
              <p className="text-sm">We are upgrading our SMS gateway. Please use email.</p>
            </div>
          )}

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-xs uppercase font-bold text-slate-500 bg-[#0f172a] px-4">Or continue with</div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Failed")} shape="circle" size="large" theme="filled_black" />
          </div>

          <p className="text-center text-slate-500 text-sm">
            Don't have an account? <Link to="/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition">Create Account</Link>
          </p>

        </div>
      </div>

      {/* ROLE MODAL */}
      <AnimatePresence>
        {showRoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1A1F2E] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Finish Setup</h2>
              <p className="text-slate-400 mb-8 text-sm">Select your primary role to continue.</p>
              <div className="space-y-3">
                <button onClick={() => traverseWithRole("client")} className="w-full p-4 border border-white/10 rounded-xl hover:border-indigo-500 hover:bg-white/5 transition font-bold text-left flex items-center gap-3 group text-white">
                  <span className="text-2xl bg-white/5 p-2 rounded-lg group-hover:bg-white/10">👤</span> Client
                </button>
                <button onClick={() => traverseWithRole("lawyer")} className="w-full p-4 border border-white/10 rounded-xl hover:border-indigo-500 hover:bg-white/5 transition font-bold text-left flex items-center gap-3 group text-white">
                  <span className="text-2xl bg-white/5 p-2 rounded-lg group-hover:bg-white/10">⚖️</span> Lawyer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

function InputGroup({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-400 ml-1">{label}</label>
      <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" {...props} />
    </div>
  );
}
