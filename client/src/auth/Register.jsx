'use client'

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Shield, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { API_BASE } from "../config";

const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Surat",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara",
  "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi",
  "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Howrah", "Ranchi", "Gwalior", "Jabalpur",
  "Coimbatore", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Chandigarh", "Guwahati", "Solapur", "Hubli-Dharwad"
];

const PHONE_REGEX = /^(\+91[\-\s]?)?[6789]\d{9}$/;

export default function Register() {
  const router = useRouter();
  const { register, loginWithToken } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    sex: "",
    phone: "",
    role: "client",
    specialization: "",
    experience: "",
    barCouncilId: "",
    isStudent: false,
    studentRollNumber: "",
    verified: false,
    consentTerms: false,
    consentPrivacy: false,
    consentMarketing: false,
    idCardImage: ""
  });

  const [selectedCity, setSelectedCity] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password Visibility Toggle
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpRetries, setOtpRetries] = useState(3);

  // OTP Timer countdown
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setInterval(() => {
        setOtpCooldown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpCooldown]);

  // Filter Cities
  const filteredCities = useMemo(() => {
    return INDIAN_CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()));
  }, [citySearch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Password Strength Evaluator
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, text: "", color: "bg-transparent" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score, text: "Weak", color: "bg-red-500" };
    if (score <= 3) return { score, text: "Medium", color: "bg-yellow-500" };
    return { score, text: "Strong", color: "bg-emerald-500" };
  }, [formData.password]);

  // Send OTP Function
  const handleSendOTP = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return toast.error("Invalid Email Address. Please check format.");
    }
    if (otpRetries <= 0) {
      return toast.error("Too many OTP requests. Please wait or contact support.");
    }

    setLoading(true);
    try {
      await axios.post(`/api/auth/send-otp`, { email: formData.email });
      
      setOtpSent(true);
      setOtpCooldown(60);
      setOtpRetries(prev => prev - 1);
      toast.success("OTP verification code sent to your email.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send OTP code. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP Function
  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length < 4) {
      return toast.error("Please enter a valid OTP code.");
    }
    setLoading(true);
    try {
      const res = await axios.post(`/api/auth/verify-otp`, { 
        email: formData.email,
        otp: otpCode
      });
      if (res.data.success || res.data.token) {
        setOtpVerified(true);
        toast.success("Email verified successfully!");
      } else {
        toast.error("Invalid OTP code.");
      }
    } catch (err) {
      console.error(err);
      toast.error("OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const { name, email, password, confirmPassword, phone, role } = formData;

    if (!name || !email || !password || !phone) return toast.error("Please fill all required fields");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    if (!formData.consentTerms) return toast.error("Please accept the Terms of Service to continue.");
    if (!formData.consentPrivacy) return toast.error("Please agree to the Privacy Policy to continue.");
    if (!otpVerified) return toast.error("Please verify your email address via OTP first.");

    if (role === "lawyer") {
      if (!selectedCity && !formData.location) return toast.error("Please select a city");
      if (!formData.isStudent && !formData.barCouncilId) return toast.error("Bar Council ID is required");
      if (formData.isStudent && !formData.studentRollNumber) return toast.error("Student Roll Number is required");
      if (!formData.idCardImage) return toast.error("Please upload your ID Card / Bar Council Cert");
    }

    setLoading(true);

    try {
      const userData = {
        ...formData,
        plan: "silver",
        location: {
            city: selectedCity || formData.location || "Remote",
            state: "India"
        },
        verificationStatus: formData.verified ? "verified" : "pending"
      };

      const res = await register(userData);
      setLoading(false);

      if (res.success) {
        toast.success("Account Created! Please login.");
        router.push("/login");
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error("Registration Failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!formData.consentTerms || !formData.consentPrivacy) {
      return toast.error("Please accept the Terms and Privacy Policy before continuing with Google.");
    }
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/google", {
        token: credentialResponse.credential,
        role: formData.role
      });
      loginWithToken(res.data.user, res.data.token);
      toast.success("Welcome to NyayNow!");
      router.push(formData.role === 'lawyer' ? "/lawyer/dashboard" : "/client/dashboard");
    } catch (err) {
      toast.error("Google Signup Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-[1fr_500px] xl:grid-cols-[1fr_600px] bg-[#020617] font-sans selection:bg-gold-500/30">

      {/* LEFT: PREMIUM AMBIENCE */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden p-16 bg-midnight-950">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1505664194779-8beaceb9300d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-midnight-950/90 via-midnight-950/80 to-midnight-900/40"></div>

        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-royal-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10"></div>

        <div className="relative z-10 space-y-6 max-w-2xl">
          <h1 className="text-6xl font-display font-bold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-sm">
            Join the<br />
            <span className="text-gold-400 italic">Elite.</span>
          </h1>
          <p className="text-lg text-slate-300/90 max-w-lg font-light leading-relaxed border-l-2 border-gold-500/50 pl-6">
            Empower yourself with next-generation AI legal intelligence. Sign up today and access the predictive network.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-xs font-bold tracking-widest uppercase text-gold-500/80">
          <span>Smart</span>
          <span className="w-1 h-1 rounded-full bg-gold-500"></span>
          <span>Efficient</span>
          <span className="w-1 h-1 rounded-full bg-gold-500"></span>
          <span>Powerful</span>
        </div>
      </div>

      {/* RIGHT: FORM */}
      <div className="flex flex-col justify-center p-6 lg:p-12 bg-midnight-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

        <div className="w-full max-w-xl mx-auto space-y-8 relative z-10 my-10">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-display font-bold text-white">Create Account</h2>
            <p className="text-slate-400 text-sm mt-1">Access enterprise-grade legal artificial intelligence.</p>
          </div>

          {/* GOOGLE SIGN IN ABOVE EMAIL FORM */}
          <div className="space-y-4">
            <div className="relative flex justify-center w-[200px] min-h-[40px] mx-auto">
              {(!formData.consentTerms || !formData.consentPrivacy) && (
                <div 
                  className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer rounded bg-black/75 backdrop-blur-sm border border-white/10 hover:border-gold-500/50 transition-all"
                  onClick={() => toast.error("Accept the Terms & Privacy checkboxes first", { icon: "👆" })}
                >
                  <span className="text-[10px] font-black text-white px-3 py-1 uppercase tracking-widest text-center">Accept Consent Checkboxes First</span>
                </div>
              )}
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Failed")} width="200" />
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-xs uppercase font-bold text-slate-500 bg-[#0f172a] px-4">Or sign up with email</div>
            </div>
          </div>

          {/* ROLE SELECTION (Semantic HTML5 Radio Buttons) */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Account Type</label>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border cursor-pointer transition-all duration-300 ${formData.role === 'client' ? 'bg-gold-500/10 border-gold-500 text-gold-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}`}>
                <input
                  type="radio"
                  name="role"
                  value="client"
                  checked={formData.role === 'client'}
                  onChange={() => setFormData({ ...formData, role: 'client' })}
                  className="w-4 h-4 text-gold-500 border-white/10 bg-white/5 focus:ring-gold-500/50"
                />
                <span className="text-xs font-black uppercase tracking-wider select-none">Client / Individual</span>
              </label>
              
              <label className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border cursor-pointer transition-all duration-300 ${formData.role === 'lawyer' ? 'bg-gold-500/10 border-gold-500 text-gold-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}`}>
                <input
                  type="radio"
                  name="role"
                  value="lawyer"
                  checked={formData.role === 'lawyer'}
                  onChange={() => setFormData({ ...formData, role: 'lawyer' })}
                  className="w-4 h-4 text-gold-500 border-white/10 bg-white/5 focus:ring-gold-500/50"
                />
                <span className="text-xs font-black uppercase tracking-wider select-none">Legal Advocate</span>
              </label>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
              <InputGroup label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>

            {/* EMAIL & OTP VERIFICATION */}
            <div className="space-y-2">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <InputGroup 
                    label="Email Address" 
                    type="email"
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="john@example.com" 
                    disabled={otpVerified}
                  />
                </div>
                {!otpVerified && (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading || otpCooldown > 0}
                    className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl disabled:opacity-50"
                  >
                    {otpCooldown > 0 ? `Retry (${otpCooldown}s)` : "Send OTP"}
                  </button>
                )}
              </div>

              {otpSent && !otpVerified && (
                <div className="flex gap-4 items-end p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex-1">
                    <InputGroup 
                      label="Enter OTP Code" 
                      name="otpCode" 
                      value={otpCode} 
                      onChange={(e) => setOtpCode(e.target.value)} 
                      placeholder="XXXXXX" 
                      maxLength={6}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={loading}
                    className="px-6 py-3.5 bg-gold-500 hover:bg-gold-600 text-midnight-950 font-bold text-xs uppercase tracking-wider rounded-xl"
                  >
                    Verify OTP
                  </button>
                </div>
              )}

              {otpVerified && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 px-1">
                  <ShieldCheck size={14} /> Email verified successfully
                </div>
              )}
            </div>

            {/* PASSWORD WITH VISIBILITY TOGGLE */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <InputGroup 
                  label="Password" 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="••••••••" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <InputGroup 
                label="Confirm Password" 
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                placeholder="••••••••" 
              />
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-1.5 px-1">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                  <span className="text-slate-500">Password Strength</span>
                  <span className={passwordStrength.score >= 3 ? "text-emerald-400" : passwordStrength.score >= 2 ? "text-yellow-500" : "text-red-500"}>
                    {passwordStrength.text}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* LAWYER SPECIFIC FIELDS */}
            <AnimatePresence>
              {formData.role === 'lawyer' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5 overflow-hidden"
                >
                  <div className="p-5 bg-gold-500/5 rounded-2xl border border-gold-500/10 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <Shield className="text-gold-500" size={14} />
                       <span className="text-[10px] font-black uppercase tracking-widest text-gold-500">Professional Verification</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.isStudent} onChange={(e) => setFormData({...formData, isStudent: e.target.checked})} className="w-4 h-4 rounded border-white/10 bg-white/5" />
                            <span className="text-xs text-slate-400 font-bold">Law Student?</span>
                        </label>
                    </div>

                    {formData.isStudent ? (
                        <InputGroup label="Roll Number" name="studentRollNumber" value={formData.studentRollNumber} onChange={handleChange} placeholder="UNI-2024-XXXX" />
                    ) : (
                        <InputGroup label="Bar Council ID" name="barCouncilId" value={formData.barCouncilId} onChange={handleChange} placeholder="MAH/1234/2024" />
                    )}

                    <div className="relative group">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Identity Document (PDF/JPG)</label>
                        <div className="relative h-24 rounded-xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center hover:border-gold-500/30 transition-all cursor-pointer overflow-hidden">
                            <UploadCloud className="text-slate-600 mb-1" size={20} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Upload Certificate</span>
                            <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                onChange={(e) => setFormData({...formData, idCardImage: e.target.files[0]?.name || "uploaded_id.png"})}
                            />
                            {formData.idCardImage && (
                                <div className="absolute inset-0 bg-midnight-950 flex items-center justify-center gap-2">
                                    <span className="text-gold-400 text-xs font-bold">{formData.idCardImage}</span>
                                    <button type="button" onClick={() => setFormData({...formData, idCardImage: ""})} className="text-red-400 font-black">×</button>
                                </div>
                            )}
                        </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SPLIT REQUIRED CONSENT CHECKBOXES & OPTIONAL MARKETING */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <label className="flex items-start gap-3 cursor-pointer group select-none">
                <input 
                  type="checkbox" 
                  checked={formData.consentTerms} 
                  onChange={(e) => setFormData({ ...formData, consentTerms: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded border-slate-600 bg-white/5 text-gold-500 focus:ring-gold-500/30" 
                />
                <span className="text-[11px] leading-relaxed text-slate-400 group-hover:text-slate-200">
                  I accept the <Link href="/terms" className="text-white hover:text-gold-400 underline font-bold">Terms of Service</Link> (Required)
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group select-none">
                <input 
                  type="checkbox" 
                  checked={formData.consentPrivacy} 
                  onChange={(e) => setFormData({ ...formData, consentPrivacy: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded border-slate-600 bg-white/5 text-gold-500 focus:ring-gold-500/30" 
                />
                <span className="text-[11px] leading-relaxed text-slate-400 group-hover:text-slate-200">
                  I agree to the <Link href="/privacy" className="text-white hover:text-gold-400 underline font-bold">Privacy Policy</Link> (Required)
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group select-none">
                <input 
                  type="checkbox" 
                  checked={formData.consentMarketing} 
                  onChange={(e) => setFormData({ ...formData, consentMarketing: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded border-slate-600 bg-white/5 text-gold-500 focus:ring-gold-500/30" 
                />
                <span className="text-[11px] leading-relaxed text-slate-500 group-hover:text-slate-300">
                  Send me product updates and legal newsletter offers (Optional)
                </span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-gold-500 to-yellow-600 text-midnight-950 font-bold text-lg rounded-xl hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all duration-300 active:scale-[0.98] disabled:opacity-70 mt-6 relative overflow-hidden group">
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "Creating Account..." : "Create Account"}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition duration-300" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-slate-400 text-sm mb-4">Already have an account?</p>
            <Link href="/login" className="inline-block w-full py-4 rounded-xl border border-gold-500/50 text-gold-400 font-bold hover:bg-gold-500/10 hover:border-gold-400 transition-all duration-300">
              Log in to your account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

// Reusable Input Component
function InputGroup({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">{label}</label>
      <input className="glass-input w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:ring-1 focus:ring-gold-500/50 outline-none transition duration-300 disabled:opacity-50" {...props} />
    </div>
  );
}
