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

      {/* LEFT: PREMIUM AMBIENCE */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden p-16 bg-midnight-950">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-midnight-950/90 via-midnight-950/80 to-midnight-900/40"></div>

        {/* Animated Gold Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-royal-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 w-fit group">
            <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-yellow-600 rounded-2xl flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(212,175,55,0.3)] ring-1 ring-white/10 group-hover:scale-105 transition duration-300 transform rotate-3">⚖️</div>
            <span className="font-display font-bold text-3xl tracking-wide text-white drop-shadow-md">NyayNow</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 max-w-2xl">
          <h1 className="text-6xl font-display font-bold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-sm">
            Elegance in<br />
            <span className="text-gold-400 italic">Justice.</span>
          </h1>
          <p className="text-lg text-slate-300/90 max-w-lg font-light leading-relaxed border-l-2 border-gold-500/50 pl-6">
            Experience the future of legal assistance. Where AI precision meets the sophistication of tradition.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-xs font-bold tracking-widest uppercase text-gold-500/80">
          <span>Secure</span>
          <span className="w-1 h-1 rounded-full bg-gold-500"></span>
          <span>Confidential</span>
          <span className="w-1 h-1 rounded-full bg-gold-500"></span>
          <span>Premium</span>
        </div>
      </div>

      {/* RIGHT: FORM */}
      <div className="flex flex-col justify-center p-6 lg:p-16 bg-midnight-900 relative overflow-hidden">
        {/* Mobile Background Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

        <div className="w-full max-w-[420px] mx-auto space-y-10 relative z-10">

          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-4xl font-display font-bold text-white">Sign In</h2>
            <p className="text-slate-400 text-sm">Welcome back to your dashboard.</p>
          </div>

          <div className="flex gap-1 p-1.5 bg-midnight-950/50 rounded-2xl border border-white/5 backdrop-blur-sm">
            <button onClick={() => setMethod("email")} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${method === "email" ? "bg-gradient-gold text-midnight-950 shadow-lg shadow-gold-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
              Email
            </button>
            <button onClick={() => setMethod("mobile")} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${method === "mobile" ? "bg-gradient-gold text-midnight-950 shadow-lg shadow-gold-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
              Mobile
            </button>
          </div>

          {method === "email" ? (
            <div className="space-y-6">
              <InputGroup label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" />
              <div className="space-y-1.5">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Password</label>
                  <Link to="/forgot-password" className="text-xs font-bold text-gold-400 hover:text-gold-300 transition">Forgot?</Link>
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="glass-input w-full rounded-xl px-4 py-3.5 placeholder-slate-600 focus:ring-1 focus:ring-gold-500/50 transition duration-300" placeholder="••••••••" />
              </div>

              <button onClick={handleEmailLogin} disabled={loading} className="w-full py-4 bg-gradient-to-r from-gold-500 to-yellow-600 text-midnight-950 font-bold text-lg rounded-xl hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all duration-300 active:scale-[0.98] disabled:opacity-70 mt-4 relative overflow-hidden group">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? "Signing in..." : "Sign In"}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition duration-300" />
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-center text-slate-400 py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <div className="w-12 h-12 bg-gold-500/10 text-gold-400 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">🚧</div>
              <p className="font-display font-medium text-white text-lg">OTP Login Disabled</p>
              <p className="text-sm px-8">We are upgrading our secure gateway. Please use email access.</p>
            </div>
          )}

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-xs uppercase font-bold text-slate-500 bg-midnight-900 px-4 tracking-widest">Or Continue With</div>
          </div>

          <div className="flex justify-center">
            <div className="p-1 rounded-full border border-white/10 hover:border-gold-500/30 transition duration-300 bg-midnight-950/50">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Failed")} shape="circle" size="large" theme="filled_black" />
            </div>
          </div>

          <p className="text-center text-slate-500 text-sm">
            Don't have an account? <Link to="/register" className="text-gold-400 font-bold hover:text-gold-300 transition underline decoration-transparent hover:decoration-gold-400 underline-offset-4">Create Account</Link>
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
