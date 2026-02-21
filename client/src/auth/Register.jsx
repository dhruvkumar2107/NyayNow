import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud } from "lucide-react";

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
    verified: false
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
      // Check for ID Image instead of Verification
      if (!formData.idCardImage) return toast.error("Please upload your ID Card / Bar Council Cert");
    }

    setLoading(true);

    try {
      const userData = {
        role,
        plan: "silver",
        location: selectedCity,
        ...formData,
        verificationStatus: formData.verified ? "verified" : "pending"
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
          {/* LOGO REMOVED TO PREVENT DUPLICATION WITH GLOBAL NAVBAR */}
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

                {/* MANUAL VERIFICATION - ID CARD UPLOAD */}
                <div className="space-y-4 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-bold text-sm flex items-center gap-2">
                        <UploadCloud size={18} className="text-indigo-400" />
                        Bar Council ID / ID Card
                      </h4>
                      <p className="text-xs text-indigo-300 mt-1">Upload for admin approval.</p>
                    </div>
                  </div>

                  {formData.idCardImage ? (
                    <div className="relative w-full h-32 bg-black/40 rounded-lg overflow-hidden border border-white/10 group">
                      <img src={typeof formData.idCardImage === 'string' ? formData.idCardImage : URL.createObjectURL(formData.idCardImage)} alt="ID Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, idCardImage: "" })}
                        className="absolute top-2 right-2 bg-red-600/80 p-1 rounded-full text-white hover:bg-red-500 transition"
                      >
                        ×
                      </button>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition">
                        <span className="text-white text-xs font-bold">Change File</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-slate-600 hover:border-indigo-500 rounded-xl p-6 transition-colors bg-black/20 text-center cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          const toastId = toast.loading("Uploading ID...");
                          try {
                            const { uploadFile } = await import("../api"); // Dynamic import to avoid cycles or path issues
                            const res = await uploadFile(file);
                            setFormData({ ...formData, idCardImage: res.path });
                            toast.success("ID Uploaded", { id: toastId });
                          } catch (err) {
                            console.error(err);
                            toast.error("Upload Failed", { id: toastId });
                          }
                        }}
                      />
                      <UploadCloud className="mx-auto text-slate-500 group-hover:text-indigo-400 mb-2 transition" />
                      <p className="text-xs text-slate-400 group-hover:text-slate-200 transition">Click to Upload or Drag & Drop</p>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-500">Your account will be "Pending" until an admin verifies this document.</p>
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
