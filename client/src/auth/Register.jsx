import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios'; // Added axios import

export default function Register() {
  const navigate = useNavigate();
  const { register, loginWithToken } = useAuth(); // Destructure register and loginWithToken

  const [role, setRole] = useState("client");
  const [plan, setPlan] = useState("silver"); // Default & Forced to Silver

  const [name, setName] = useState("");
  const [age, setAge] = useState(""); // Constraint
  const [sex, setSex] = useState(""); // Constraint
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Lawyer-specific
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const [barCouncilId, setBarCouncilId] = useState(""); // NEW

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      toast.error("Please fill all required fields");
      return;
    }

    if (role === "lawyer" && (!specialization || !location)) {
      toast.error("Please complete lawyer profile details");
      return;
    }

    setLoading(true); // START LOADING

    // Prepare Payload for Backend
    const userData = {
      role,
      name,
      age, // Constraint
      sex, // Constraint
      email,
      password, // Critical for backend creation
      plan,
      location, // Pass string directly, backend/schema handles it
      specialization,
      experience,
      barCouncilId // NEW
    };

    const res = await register(userData);
    setLoading(false); // END LOADING

    if (res.success) {
      toast.success("Registration Successful! Please login.");
      navigate("/login"); // For manual register, they login first. Login should handle redirection.
    } else {
      toast.error("Registration Failed: " + res.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-blue-600 mb-2">Create Account</h1>
        <p className="text-sm text-gray-500 mb-6">Join the professional legal network</p>

        {/* GOOGLE LOGIN */}
        <div className="mb-6 flex justify-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              setLoading(true);
              try {
                const res = await axios.post("/api/auth/google", {
                  token: credentialResponse.credential,
                  role: role // Pass selected role (client/lawyer)
                });
                const { user, token } = res.data;
                loginWithToken(user, token);
                toast.success("Signup Successful!");
                navigate("/setup-profile"); // Force profile setup
              } catch (err) {
                toast.error("Google Signup Failed");
              } finally {
                setLoading(false);
              }
            }}
            onError={() => toast.error("Google Signup Failed")}
            useOneTap
            theme="filled_blue"
            shape="pill"
            text="signup_with"
          />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or register with email</span></div>
        </div>

        {/* ROLE */}
        <label className="text-sm font-medium text-gray-700">Register as</label>
        <select
          className="w-full mt-1 mb-4 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="client">Client</option>
          <option value="lawyer">Lawyer</option>
        </select>

        {/* NAME */}
        <label className="text-sm font-medium text-gray-700">Full Name</label>
        <input
          className="w-full mt-1 mb-4 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* AGE & SEX (ABSOLUTE CONSTRAINT) */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              className="w-full mt-1 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
              placeholder="25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">Sex</label>
            <select
              className="w-full mt-1 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* EMAIL */}
        <label className="text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          className="w-full mt-1 mb-4 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <label className="text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          className="w-full mt-1 mb-4 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* LAWYER EXTRA FIELDS */}
        {role === "lawyer" && (
          <>
            <label className="text-sm font-medium text-gray-700">Specialization</label>
            <select
              className="w-full mt-1 mb-4 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            >
              <option value="">Select Specialization</option>
              {["Criminal Law", "Corporate Law", "Family Law", "Civil Law", "IP Law", "Real Estate", "Labor Law", "Tax Law", "Cyber Law", "Immigration", "General Practice"].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <label className="text-sm font-medium text-gray-700">Experience (years)</label>
            <input
              type="number"
              className="w-full mt-1 mb-4 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
              placeholder="5"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />

            <label className="text-sm font-medium text-gray-700">City / Location</label>
            <select
              className="w-full mt-1 mb-4 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">Select City</option>
              {["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara"].map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            {/* VERIFICATION SECTION */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
              <h3 className="text-sm font-bold text-blue-800 mb-2">🛡️ Professional Verification</h3>
              <p className="text-xs text-blue-600 mb-4">
                To get the "Verified Lawyer" badge, please provide your Bar Council details.
              </p>

              <label className="text-sm font-medium text-gray-700">Bar Council ID</label>
              <input
                className="w-full mt-1 mb-2 p-3 rounded-xl bg-white border border-blue-200 focus:outline-none text-gray-900 font-mono text-sm"
                placeholder="e.g., MAH/1234/2023"
                value={barCouncilId}
                onChange={(e) => setBarCouncilId(e.target.value)}
              />
              <p className="text-xs text-gray-400 mb-3">Format: STATE/NUMBER/YEAR</p>

              <label className="text-sm font-medium text-gray-700">Upload ID Card</label>
              <input
                type="file"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
              />
            </div>
          </>
        )}

        {/* REGISTER BUTTON */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className={`w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition shadow-md shadow-blue-200 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        {/* FOOTER */}
        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
