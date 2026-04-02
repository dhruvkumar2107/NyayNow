'use client'

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Shield } from "lucide-react";

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
    // NEW FIELDS
    isStudent: false,
    studentRollNumber: "",
    verified: false,
    consent: false,
    idCardImage: ""
  });


  // Custom City Dropdown State
  const [selectedCity, setSelectedCity] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const [loading, setLoading] = useState(false);

  // Filter Cities
  const filteredCities = useMemo(() => {
    return INDIAN_CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()));
  }, [citySearch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    const { name, email, password, confirmPassword, phone, role, specialization, experience, barCouncilId, age, sex } = formData;

    if (!name || !email || !password || !phone) return toast.error("Please fill all required fields");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    if (!formData.consent) return toast.error("Please acknowledge the legal disclosure to continue.");
    if (!PHONE_REGEX.test(phone)) return toast.error("Invalid Indian Phone Number");

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
    if (!formData.consent) return toast.error("Please acknowledge the legal disclosure to continue.");
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

        {/* Animated Gold Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-royal-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          {/* LOGO REMOVED TO PREVENT DUPLICATION WITH GLOBAL NAVBAR */}
        </div>

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
        {/* Mobile Background Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

        <div className="w-full max-w-xl mx-auto space-y-8 relative z-10 my-10">

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-display font-bold text-white">Create Account</h2>
            <p className="text-slate-400 text-sm mt-1">Access enterprise-grade legal artificial intelligence.</p>
          </div>

          {/* ROLE SELECTION TOGGLE */}
          <div className="flex p-1 bg-midnight-950/50 rounded-2xl border border-white/5 backdrop-blur-sm shadow-inner">
            <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'client' })}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-500 ${formData.role === 'client' ? 'bg-gradient-to-r from-gold-500 to-yellow-600 text-midnight-950 shadow-lg shadow-gold-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Individual / Client
            </button>
            <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'lawyer' })}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-500 ${formData.role === 'lawyer' ? 'bg-gradient-to-r from-gold-500 to-yellow-600 text-midnight-950 shadow-lg shadow-gold-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Legal Professional
            </button>
          </div>



          <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
              <InputGroup label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>

            <InputGroup label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" />

            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
              <InputGroup label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" />
            </div>

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
                            {/* Hidden actual file input or simulated for now as per previous structure */}
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



            {/* LEGAL CONSENT CHECKBOX */}
            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10 group cursor-pointer hover:bg-white/10 transition-all mt-4" onClick={() => setFormData({ ...formData, consent: !formData.consent })}>
              <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.consent ? 'bg-gold-500 border-gold-500' : 'border-slate-600'}`}>
                {formData.consent && <span className="text-midnight-950 text-xs font-bold">✓</span>}
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400 group-hover:text-slate-200 select-none">
                I understand this is an <span className="text-white font-bold">AI tool for information</span> and does not create an <span className="text-white font-bold">Attorney-Client relationship</span>.
              </p>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-gold-500 to-yellow-600 text-midnight-950 font-bold text-lg rounded-xl hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all duration-300 active:scale-[0.98] disabled:opacity-70 mt-6 relative overflow-hidden group">
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "Creating Account..." : "Create Account"}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition duration-300" />
            </button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-xs uppercase font-bold text-slate-500 bg-[#0f172a] px-4 backdrop-blur-3xl">Or continue with</div>
          </div>

          <div className="relative flex justify-center w-max mx-auto">
            {!formData.consent && (
               <div 
                className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer rounded bg-black/60 backdrop-blur-sm border border-white/20 hover:border-gold-500/50 transition-all"
                onClick={() => toast.error("Please click the tick button above to accept terms before registering with Google", { icon: "👆", duration: 4000 })}
              >
                  <span className="text-[10px] font-bold text-white px-2 py-1 uppercase tracking-widest text-center leading-tight">Tick Consent<br/>First</span>
              </div>
            )}
            <div className={`transition duration-300 ${formData.consent ? 'opacity-100' : 'opacity-80'}`}>
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Failed")} />
            </div>
          </div>

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
      <input className="glass-input w-full rounded-xl px-4 py-3 placeholder-slate-600 focus:ring-1 focus:ring-gold-500/50 transition duration-300" {...props} />
    </div>
  );
}
