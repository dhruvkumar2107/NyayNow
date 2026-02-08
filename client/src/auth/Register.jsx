import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { motion } from "framer-motion";

export default function Register() {
  const navigate = useNavigate();
  const { register, loginWithToken } = useAuth();

  const [role, setRole] = useState("client");
  const [plan, setPlan] = useState("silver");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Lawyer specific
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const [barCouncilId, setBarCouncilId] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) return toast.error("Please fill all required fields");
    if (role === "lawyer" && (!specialization || !location)) return toast.error("Please complete lawyer profile");

    setLoading(true);
    const userData = { role, name, age, sex, email, password, plan, location, specialization, experience, barCouncilId };

    const res = await register(userData);
    setLoading(false);

    if (res.success) {
      toast.success("Account Created! Please login.");
      navigate("/login");
    } else {
      toast.error(res.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/google", {
        token: credentialResponse.credential,
        role: role
      });
      loginWithToken(res.data.user, res.data.token);
      toast.success("Welcome to NyaySathi!");
      navigate("/setup-profile");
    } catch (err) {
      toast.error("Google Signup Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-white font-sans text-slate-900">

      {/* LEFT: BRANDING (Sticky) */}
      <div className="hidden lg:flex flex-col justify-between bg-[#0B1120] text-white p-12 relative overflow-hidden sticky top-0 h-screen">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[100px] opacity-20 translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 w-fit hover:opacity-80 transition">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-xl">⚖️</div>
            <span className="font-bold text-xl tracking-tight">NyaySathi</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8 max-w-lg">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">Join the Future of<br />Legal Tech.</h1>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <span className="text-2xl">🚀</span>
              <div>
                <h3 className="font-bold">For Clients</h3>
                <p className="text-slate-400 text-sm">Instant access to top 1% lawyers and AI legal tools.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <span className="text-2xl">⚖️</span>
              <div>
                <h3 className="font-bold">For Lawyers</h3>
                <p className="text-slate-400 text-sm">Grow your practice with high-quality leads and smart management.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 font-medium tracking-wide uppercase">
          Trusted by 10,000+ Legal Professionals
        </div>
      </div>

      {/* RIGHT: FORM */}
      <div className="flex justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg space-y-8 my-auto">

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
            <p className="text-slate-500 mt-2">Get started with your free account today.</p>
          </div>

          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button onClick={() => setRole("client")} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${role === "client" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              👤 Client
            </button>
            <button onClick={() => setRole("lawyer")} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${role === "lawyer" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              ⚖️ Lawyer
            </button>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                <input className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-medium text-slate-800" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                <input type="email" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-medium text-slate-800" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
                <input type="password" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-medium text-slate-800" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Age</label>
                <input type="number" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-medium text-slate-800" placeholder="25" value={age} onChange={e => setAge(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Gender</label>
              <div className="flex gap-4">
                {["Male", "Female", "Other"].map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="sex" value={opt} checked={sex === opt} onChange={e => setSex(e.target.value)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                    <span className="text-slate-600 font-medium group-hover:text-slate-900 transition">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* LAWYER FIELDS */}
            {role === "lawyer" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-5 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Bar Council ID</label>
                    <input className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-mono text-sm text-slate-800" placeholder="MAH/1234/2023" value={barCouncilId} onChange={e => setBarCouncilId(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Experience (Yrs)</label>
                    <input type="number" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-medium text-slate-800" placeholder="5" value={experience} onChange={e => setExperience(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Specialization</label>
                    <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-medium text-slate-800" value={specialization} onChange={e => setSpecialization(e.target.value)}>
                      <option value="">Select...</option>
                      {["Criminal Law", "Corporate Law", "Family Law", "Civil Law", "IP Law", "Real Estate", "Labor Law", "Tax Law", "Cyber Law", "Immigration"].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">City</label>
                    <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-medium text-slate-800" value={location} onChange={e => setLocation(e.target.value)}>
                      <option value="">Select...</option>
                      {["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Surat"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            <button onClick={handleRegister} disabled={loading} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-70 mt-4">
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-xs uppercase font-bold text-slate-400 bg-white px-4">Or register with</div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Failed")} shape="circle" size="large" />
          </div>

          <p className="text-center text-slate-500 text-sm">
            Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Login</Link>
          </p>

        </div>
      </div>
    </main>
  );
}
