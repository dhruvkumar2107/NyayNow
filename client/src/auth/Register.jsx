import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";

const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Surat",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara",
  "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi",
  "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Howrah", "Ranchi", "Gwalior", "Jabalpur",
  "Coimbatore", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Chandigarh", "Guwahati", "Solapur", "Hubli-Dharwad"
];

const PHONE_REGEX = /^(\+91[\-\s]?)?[6789]\d{9}$/;

export default function Register() {
  const navigate = useNavigate();
  const { register, loginWithToken } = useAuth();

  const [role, setRole] = useState("client");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    sex: "",
    phone: "",
    specialization: "",
    experience: "",
    barCouncilId: "",
    // NEW FIELDS
    isStudent: false,
    studentRollNumber: "",
    idCardImage: null // File Object
  });

  const [idCardPreview, setIdCardPreview] = useState(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, idCardImage: file });
      setIdCardPreview(URL.createObjectURL(file));
    }
  };

  const toggleStudent = (val) => {
    setFormData({ ...formData, isStudent: val, barCouncilId: "", studentRollNumber: "" });
  };

  const handleRegister = async () => {
    const { name, email, password, phone, specialization, experience, barCouncilId, age, sex } = formData;

    if (!name || !email || !password || !phone) return toast.error("Please fill all required fields");
    if (!PHONE_REGEX.test(phone)) return toast.error("Invalid Indian Phone Number");

    if (role === "lawyer") {
      if (!selectedCity) return toast.error("Please select a city");
      if (!formData.isStudent && !formData.barCouncilId) return toast.error("Bar Council ID is required");
      if (formData.isStudent && !formData.studentRollNumber) return toast.error("Student Roll Number is required");
      if (!formData.idCardImage) return toast.error("ID Card Upload is mandatory");
    }

    setLoading(true);

    try {
      let uploadedIdUrl = "";

      // 1. Upload ID Card if present
      if (formData.idCardImage) {
        const uploadData = new FormData();
        uploadData.append("file", formData.idCardImage);

        // We need a separate upload endpoint that returns the URL
        // Assuming /api/uploads exists from previous context
        const uploadRes = await axios.post("/api/uploads", uploadData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        uploadedIdUrl = uploadRes.data.path;
      }

      const userData = {
        role,
        plan: "silver",
        location: selectedCity,
        ...formData,
        idCardImage: uploadedIdUrl // Send URL, not file object
      };

      const res = await register(userData);
      setLoading(false);

      if (res.success) {
        toast.success("Account Created! Please login.");
        navigate("/login");
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
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/google", {
        token: credentialResponse.credential,
        role: role
      });
      loginWithToken(res.data.user, res.data.token);
      toast.success("Welcome to NyayNow!");
      navigate(role === 'lawyer' ? "/lawyer/dashboard" : "/client/dashboard");
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
          <Link to="/" className="flex items-center gap-3 w-fit group">
            <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-yellow-600 rounded-2xl flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(212,175,55,0.3)] ring-1 ring-white/10 group-hover:scale-105 transition duration-300 transform rotate-3">⚖️</div>
            <span className="font-display font-bold text-3xl tracking-wide text-white drop-shadow-md">NyayNow</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 max-w-2xl">
          <h1 className="text-6xl font-display font-bold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-sm">
            Join the<br />
            <span className="text-gold-400 italic">Elite.</span>
          </h1>
          <p className="text-lg text-slate-300/90 max-w-lg font-light leading-relaxed border-l-2 border-gold-500/50 pl-6">
            Empower your legal practice with next-generation AI tools. Sign up today and transform your workflow.
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
            <p className="text-slate-400 text-sm mt-1">Join thousands of legal professionals.</p>
          </div>

          {/* ROLE SELECTOR */}
          <div className="flex gap-4 p-1 bg-midnight-950/50 rounded-2xl border border-white/5 backdrop-blur-sm">
            {[
              { id: 'client', label: 'Client', icon: '👤' },
              { id: 'lawyer', label: 'Lawyer / Student', icon: '⚖️' }
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setFormData(p => ({ ...p, role: r.id }))}
                className={`flex-1 py-4 rounded-xl transition-all duration-300 border ${formData.role === r.id
                    ? "bg-gradient-gold text-midnight-950 border-gold-500/0 shadow-lg shadow-gold-500/20 scale-[1.02]"
                    : "bg-transparent text-slate-400 border-transparent hover:bg-white/5 hover:text-white"
                  }`}
              >
                <div className="text-2xl mb-1">{r.icon}</div>
                <div className="font-bold text-sm">{r.label}</div>
              </button>
            ))}
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

            {formData.role === 'lawyer' && (
              <div className="space-y-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-gold-400 font-display font-bold text-lg">Professional Details</h3>

                  {/* LAWYER / STUDENT TOGGLE */}
                  <div className="flex bg-midnight-950 rounded-lg p-1 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, isStudent: false, studentRollNumber: "" }))}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${!formData.isStudent ? 'bg-gold-500 text-midnight-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                      Practicing Lawyer
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, isStudent: true, barCouncilId: "" }))}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${formData.isStudent ? 'bg-royal-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                      Law Student
                    </button>
                  </div>
                </div>

                {!formData.isStudent ? (
                  <div className="space-y-4">
                    <InputGroup label="Bar Council ID" name="barCouncilId" value={formData.barCouncilId} onChange={handleChange} placeholder="MAH/1234/2023" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <InputGroup label="Student Roll No." name="studentRollNumber" value={formData.studentRollNumber} onChange={handleChange} placeholder="20230001" />
                  </div>
                )}

                <InputGroup label="Specialization" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="Criminal, Civil, Corporate..." />

                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Experience (Years)" type="number" name="experience" value={formData.experience} onChange={handleChange} placeholder="5" />
                  <InputGroup label="Location (City)" name="location" value={formData.location} onChange={handleChange} placeholder="Mumbai" />
                </div>

                {/* ID CARD UPLOAD */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">
                    {formData.isStudent ? "Upload Student ID Card" : "Upload Bar Council ID"} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-white/5 file:text-gold-400 hover:file:bg-gold-500/10 transition cursor-pointer border border-dashed border-white/20 rounded-xl p-2"
                    />
                    {formData.idCardImage && (
                      <div className="mt-2 text-xs text-green-400 flex items-center gap-2">
                        <span>✓ Image Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

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

          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Failed")} />
          </div>

          <p className="text-center text-slate-500 text-sm">
            Already have an account? <Link to="/login" className="text-gold-400 font-bold hover:text-gold-300 transition underline decoration-transparent hover:decoration-gold-400 underline-offset-4">Log in</Link>
          </p>
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
