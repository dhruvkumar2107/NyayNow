'use client'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const router = useRouter();
  const { login, loginWithToken } = useAuth();
  const [method, setMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [googleData, setGoogleData] = useState(null);
  const [consent, setConsent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);

  // ⚡ CRAZY PERFORMING OPTIMIZATION: Prefetch heavy dashboard routes instantly on load
  // so that when the user clicks 'Sign In', the transition is 0ms.
  // ALSO: Ping backend immediately to wake up Render Free instance
  useEffect(() => {
    router.prefetch("/client/dashboard");
    router.prefetch("/lawyer/dashboard");
    
    // Wake up the legal engine (Render Cold Start mitigation)
    axios.get("/healthz").catch(() => {});
  }, [router]);

  // OTP Cooldown Timer
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setInterval(() => setOtpCooldown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [otpCooldown]);

  const [authStatus, setAuthStatus] = useState("Sign In");
  const [fieldErrors, setFieldErrors] = useState({});

  const validateEmailForm = () => {
    const errors = {};
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) errors.email = "Email is required";
    else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address";
    if (!password) errors.password = "Password is required";
    else if (password.length < 8) errors.password = "Password must be at least 8 characters";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailLogin = async () => {
    if (!validateEmailForm()) return;
    if (!consent) return toast.error("Please acknowledge the legal disclosure to continue.");
    
    setLoading(true);
    setAuthStatus("Authenticating...");

    // Show persistent "waking up" message after 3 seconds
    const statusTiimeout = setTimeout(() => {
        setAuthStatus("Waking up Legal Engine...");
    }, 3500);

    const res = await login(email, password);
    
    clearTimeout(statusTiimeout);
    setLoading(false);
    setAuthStatus("Sign In");

    if (res.success) {
      toast.success("Welcome back!");
      // Lawyer profile check
      if (res.user.role === 'lawyer' && (!res.user.specialization || !res.user.bio || !res.user.phone)) {
        toast.error("Please complete your professional profile first.");
        router.push("/settings");
      } else {
        router.push(res.user.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard");
      }
    } else {
      toast.error(res.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!consent) return toast.error("Please acknowledge the legal disclosure to continue.");
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

        // Lawyer profile check
        const user = res.data.user;
        if (user.role === 'lawyer' && (!user.specialization || !user.bio || !user.phone)) {
          toast.error("Almost there! Please complete your profile.");
          router.push("/settings");
        } else {
          router.push(user.role === 'lawyer' ? "/lawyer/dashboard" : "/client/dashboard");
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Google Login Failed");
      setLoading(false);
    }
  };

  const traverseWithRole = async (selectedRole) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/google", { token: googleData, role: selectedRole });
      loginWithToken(res.data.user, res.data.token);
      toast.success(`Welcome to NyayNow!`);

      // If lawyer, always go to settings first to pick city and specialization
      if (selectedRole === 'lawyer') {
        toast.success("Lets complete your professional setup.");
        router.push("/settings");
      } else {
        router.push("/client/dashboard");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
      setShowRoleModal(false);
    }
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
          {/* LOGO REMOVED TO PREVENT DUPLICATION WITH GLOBAL NAVBAR */}
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
              Email OTP
            </button>
          </div>

          {method === "email" ? (
            <div className="space-y-6">
              <InputGroup label="Email Address" type="email" value={email} onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({...p, email: ""})); }} placeholder="name@company.com" error={fieldErrors.email} />
              <div className="space-y-1.5">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Password</label>
                  <Link href="/forgot-password" className="text-xs font-bold text-gold-400 hover:text-gold-300 transition">Forgot?</Link>
                </div>
                <input type="password" value={password} onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({...p, password: ""})); }} className={`glass-input w-full rounded-xl px-4 py-3.5 placeholder-slate-600 focus:ring-1 transition duration-300 ${fieldErrors.password ? "border-red-500 focus:ring-red-500/50" : "focus:ring-gold-500/50"}`} placeholder="••••••••" />
                {fieldErrors.password && <p className="text-red-400 text-xs mt-1 ml-1">{fieldErrors.password}</p>}
              </div>

              {/* LEGAL CONSENT CHECKBOX */}
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10 group cursor-pointer hover:bg-white/10 transition-all" onClick={() => setConsent(!consent)}>
                <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${consent ? 'bg-gold-500 border-gold-500' : 'border-slate-600'}`}>
                  {consent && <span className="text-midnight-950 text-xs font-bold">✓</span>}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400 group-hover:text-slate-200 select-none">
                  I understand this is an <span className="text-white font-bold">AI tool for information</span> and does not create an <span className="text-white font-bold">Attorney-Client relationship</span>.
                </p>
              </div>

              <button onClick={handleEmailLogin} disabled={loading} className="w-full py-4 bg-gradient-to-r from-gold-500 to-yellow-600 text-midnight-950 font-black text-lg rounded-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all duration-200 active:scale-95 disabled:opacity-70 mt-4 relative overflow-hidden group">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-midnight-950 border-t-transparent rounded-full animate-spin"></span>
                        {authStatus}
                      </>
                    ) : "Sign In"}
                </span>
                <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* LEGAL CONSENT CHECKBOX (Email OTP) */}
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10 group cursor-pointer hover:bg-white/10 transition-all" onClick={() => setConsent(!consent)}>
                <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${consent ? 'bg-gold-500 border-gold-500' : 'border-slate-600'}`}>
                  {consent && <span className="text-midnight-950 text-xs font-bold">✓</span>}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400 group-hover:text-slate-200 select-none">
                  I understand this is an <span className="text-white font-bold">AI tool for information</span> and does not create an <span className="text-white font-bold">Attorney-Client relationship</span>.
                </p>
              </div>

              {!otpSent ? (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={otpEmail}
                      onChange={e => setOtpEmail(e.target.value)}
                      className="glass-input w-full rounded-xl px-4 py-3.5 placeholder-slate-600 focus:ring-1 focus:ring-gold-500/50 transition duration-300"
                      placeholder="name@company.com"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (!consent) return toast.error("Please acknowledge the legal disclosure to continue.");
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!otpEmail || !emailRegex.test(otpEmail)) return toast.error("Please enter a valid email address.");
                      setOtpLoading(true);
                      try {
                        const res = await axios.post('/api/auth/send-otp', { email: otpEmail });
                        setOtpSent(true);
                        setOtpCooldown(60);
                        toast.success("OTP sent to your email!");
                        if (res.data.debugOtp) {
                          setOtpCode(res.data.debugOtp);
                          toast(`[DEBUG] Auto-filled OTP: ${res.data.debugOtp}`, { icon: '🔑', duration: 6000 });
                        }
                      } catch (err) {
                        toast.error(err?.response?.data?.message || "Failed to send OTP.");
                      } finally {
                        setOtpLoading(false);
                      }
                    }}
                    disabled={otpLoading}
                    className="w-full py-4 bg-gradient-to-r from-gold-500 to-yellow-600 text-midnight-950 font-black text-lg rounded-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all duration-200 active:scale-95 disabled:opacity-70 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {otpLoading ? (
                        <><span className="w-4 h-4 border-2 border-midnight-950 border-t-transparent rounded-full animate-spin"></span> Sending OTP...</>
                      ) : "Send OTP"}
                    </span>
                    <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 px-1">
                    <span>✓</span> OTP sent to {otpEmail}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Enter OTP Code</label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      className="glass-input w-full rounded-xl px-4 py-3.5 placeholder-slate-600 focus:ring-1 focus:ring-gold-500/50 transition duration-300 text-center text-2xl tracking-[0.5em] font-bold"
                      placeholder="● ● ● ●"
                      maxLength={6}
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (!otpCode || otpCode.length < 4) return toast.error("Please enter a valid OTP code.");
                      setOtpLoading(true);
                      try {
                        const res = await axios.post('/api/auth/verify-otp', { email: otpEmail, otp: otpCode });
                        loginWithToken(res.data.user, res.data.token);
                        toast.success("Welcome back!");
                        const user = res.data.user;
                        if (user.role === 'lawyer' && (!user.specialization || !user.bio || !user.phone)) {
                          toast.error("Please complete your professional profile first.");
                          router.push("/settings");
                        } else {
                          router.push(user.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard');
                        }
                      } catch (err) {
                        toast.error(err?.response?.data?.message || "OTP verification failed.");
                      } finally {
                        setOtpLoading(false);
                      }
                    }}
                    disabled={otpLoading}
                    className="w-full py-4 bg-gradient-to-r from-gold-500 to-yellow-600 text-midnight-950 font-black text-lg rounded-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all duration-200 active:scale-95 disabled:opacity-70 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {otpLoading ? (
                        <><span className="w-4 h-4 border-2 border-midnight-950 border-t-transparent rounded-full animate-spin"></span> Verifying...</>
                      ) : "Verify & Sign In"}
                    </span>
                    <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out" />
                  </button>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => { setOtpSent(false); setOtpCode(""); }}
                      className="text-xs font-bold text-slate-400 hover:text-white transition"
                    >
                      ← Change Email
                    </button>
                    <button
                      onClick={async () => {
                        if (otpCooldown > 0) return;
                        setOtpLoading(true);
                        try {
                          const res = await axios.post('/api/auth/send-otp', { email: otpEmail });
                          setOtpCooldown(60);
                          setOtpCode("");
                          toast.success("OTP resent!");
                          if (res.data.debugOtp) {
                            setOtpCode(res.data.debugOtp);
                            toast(`[DEBUG] Auto-filled OTP: ${res.data.debugOtp}`, { icon: '🔑', duration: 6000 });
                          }
                        } catch (err) {
                          toast.error(err?.response?.data?.message || "Failed to resend OTP.");
                        } finally {
                          setOtpLoading(false);
                        }
                      }}
                      disabled={otpCooldown > 0 || otpLoading}
                      className="text-xs font-bold text-gold-400 hover:text-gold-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : "Resend OTP"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-xs uppercase font-bold text-slate-500 bg-midnight-900 px-4 tracking-widest">Or Continue With</div>
          </div>

          <div className="relative flex justify-center w-[240px] min-h-[44px] mx-auto">
            {!consent && (
              <div 
                className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer rounded-full bg-black/60 backdrop-blur-sm border border-white/20 hover:border-gold-500/50 transition-all"
                onClick={() => toast.error("Please click the tick button above to accept terms before logging in with Google", { icon: "👆", duration: 4000 })}
              >
                 <span className="text-[9px] font-bold text-white uppercase tracking-widest text-center">Tick Consent<br/>First</span>
              </div>
            )}
            <div className={`p-1 w-full rounded-full border transition duration-300 bg-midnight-950/50 ${consent ? 'border-white/20 hover:border-gold-500/50' : 'border-white/5 opacity-80'}`}>
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Failed")} shape="circle" size="large" theme="filled_black" width="230" />
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-slate-400 text-sm mb-4">Don't have an account?</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/register" className="flex-1 py-4 rounded-xl border border-gold-500/50 text-gold-400 font-bold hover:bg-gold-500/10 hover:border-gold-400 transition-all duration-300 text-center text-sm">
                Sign Up as Client
              </Link>
              <Link href="/lawyer/register" className="flex-1 py-4 rounded-xl border border-indigo-500/50 text-indigo-400 font-bold hover:bg-indigo-500/10 hover:border-indigo-400 transition-all duration-300 text-center text-sm">
                Join as a Lawyer
              </Link>
            </div>
          </div>

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

function InputGroup({ label, error, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">{label}</label>
      <input
        className={`w-full bg-white/5 border rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition duration-300 ${
          error ? "border-red-500 focus:ring-red-500/50" : "border-white/10 focus:border-indigo-500 focus:ring-indigo-500"
        }`}
        {...props}
      />
      {error && <p className="text-red-400 text-xs mt-1 ml-1">{error}</p>}
    </div>
  );
}
