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
            Justice in the<br />Digital Age.
          </h1>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition duration-300 group">
              <span className="text-3xl mb-3 block group-hover:scale-110 transition duration-300">🚀</span>
              <h3 className="font-bold text-white text-lg">For Clients</h3>
              <p className="text-slate-400 text-sm mt-1">Instant AI legal advice and connection to top 1% lawyers.</p>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition duration-300 group">
              <span className="text-3xl mb-3 block group-hover:scale-110 transition duration-300">⚖️</span>
              <h3 className="font-bold text-white text-lg">For Lawyers</h3>
              <p className="text-slate-400 text-sm mt-1">10x your practice with high-quality leads and AI tools.</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500 font-medium tracking-widest uppercase">
          Trusted by 10,000+ Legal Professionals
        </p>
      </div>

      {/* RIGHT: FORM */}
      <div className="flex flex-col justify-center p-6 lg:p-12 bg-[#0f172a]/80 backdrop-blur-xl border-l border-white/10 overflow-y-auto">
        <div className="w-full max-w-md mx-auto space-y-8">

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white">Create Account</h2>
            <p className="text-slate-400 mt-2">Get started with your free account today.</p>
          </div>

          {/* Role Toggle */}
          <div className="flex gap-1 p-1.5 bg-black/40 rounded-2xl border border-white/10">
            <button onClick={() => setRole("client")} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${role === "client" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
              👤 Client
            </button>
            <button onClick={() => setRole("lawyer")} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${role === "lawyer" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
              ⚖️ Lawyer
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Full Name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} />
              <InputGroup label="Email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} />
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 ml-1">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">+91</span>
                  <input
                    name="phone"
                    type="tel"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    placeholder="9876543210"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <InputGroup label="Age" name="age" type="number" placeholder="25" value={formData.age} onChange={handleChange} />
              <div className="col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 ml-1">Gender</label>
                <div className="flex gap-2 h-[46px] items-center">
                  {["Male", "Female", "Other"].map(opt => (
                    <label key={opt} className={`flex-1 cursor-pointer flex items-center justify-center h-full rounded-xl border border-white/5 text-sm font-medium transition ${formData.sex === opt ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300" : "bg-white/5 text-slate-500 hover:bg-white/10"}`}>
                      <input type="radio" name="sex" value={opt} checked={formData.sex === opt} onChange={handleChange} className="hidden" />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* LAWYER FIELDS (Animated) */}
            <AnimatePresence>
              {role === "lawyer" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4 pt-2 overflow-hidden">
                  <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-4">
                    <button
                      onClick={() => toggleStudent(false)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${!formData.isStudent ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Practicing Lawyer
                    </button>
                    <button
                      onClick={() => toggleStudent(true)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${formData.isStudent ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Law Student
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {!formData.isStudent ? (
                      <InputGroup label="Bar Council ID" name="barCouncilId" placeholder="MAH/1239/2023" value={formData.barCouncilId} onChange={handleChange} />
                    ) : (
                      <InputGroup label="Student Roll No." name="studentRollNumber" placeholder="U12345678" value={formData.studentRollNumber} onChange={handleChange} />
                    )}
                    <InputGroup label="Experience (Yrs)" name="experience" type="number" placeholder="5" value={formData.experience} onChange={handleChange} />
                  </div>

                  {/* ID CARD UPLOAD */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 ml-1">
                      {formData.isStudent ? "Upload Student ID Card" : "Upload Bar Council ID"} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative w-full h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/50 transition cursor-pointer group">
                      <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      {idCardPreview ? (
                        <img src={idCardPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 group-hover:text-indigo-400 transition">
                          <span className="text-2xl mb-2">📂</span>
                          <span className="text-xs font-medium">Click to Upload ID</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 relative">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-400 ml-1">Specialization</label>
                      <select name="specialization" value={formData.specialization} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition appearance-none">
                        <option value="" className="bg-[#0f172a]">Select...</option>
                        {["Criminal Law", "Corporate Law", "Family Law", "Civil Law", "IP Law", "Real Estate", "Labor Law", "Cyber Law"].map(o => <option key={o} value={o} className="bg-[#0f172a]">{o}</option>)}
                      </select>
                    </div>

                    {/* SEARCHABLE CITY DROPDOWN */}
                    <div className="space-y-1.5 relative">
                      <label className="block text-xs font-bold text-slate-400 ml-1">City</label>
                      <div
                        onClick={() => setShowCityDropdown(!showCityDropdown)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white cursor-pointer flex justify-between items-center hover:bg-white/10 transition"
                      >
                        <span className={selectedCity ? "text-white" : "text-slate-600"}>{selectedCity || "Select City"}</span>
                        <span className="text-xs text-slate-500">▼</span>
                      </div>

                      {showCityDropdown && (
                        <div className="absolute bottom-full mb-2 left-0 w-full bg-[#1A1F2E] border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-hidden flex flex-col">
                          <input
                            autoFocus
                            placeholder="Search city..."
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                            className="w-full p-3 bg-white/5 border-b border-white/5 text-white text-sm outline-none placeholder-slate-500"
                          />
                          <div className="overflow-y-auto flex-1 custom-scrollbar">
                            {filteredCities.map(city => (
                              <div
                                key={city}
                                onClick={() => { setSelectedCity(city); setShowCityDropdown(false); }}
                                className="px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-600/20 hover:text-indigo-300 cursor-pointer transition"
                              >
                                {city}
                              </div>
                            ))}
                            {filteredCities.length === 0 && <div className="p-4 text-center text-xs text-slate-500">No city found</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={handleRegister} disabled={loading} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-70 mt-4 relative overflow-hidden group">
              <span className="relative z-10">{loading ? "Creating Account..." : "Create Account"}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 opacity-0 group-hover:opacity-100 transition duration-300" />
            </button>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-xs uppercase font-bold text-slate-500 bg-[#0f172a] px-4 backdrop-blur-3xl">Or continue with</div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Failed")} shape="circle" size="large" theme="filled_black" />
          </div>

          <p className="text-center text-slate-500 text-sm">
            Already have an account? <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition">Login</Link>
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
      <label className="block text-xs font-bold text-slate-400 ml-1">{label}</label>
      <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" {...props} />
    </div>
  );
}
