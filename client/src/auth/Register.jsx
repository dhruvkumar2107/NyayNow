import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth(); // Destructure register

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

  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert("Please fill all required fields");
      return;
    }

    if (role === "lawyer" && (!specialization || !location)) {
      alert("Please complete lawyer profile details");
      return;
    }

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
      experience
    };

    const res = await register(userData);

    if (res.success) {
      alert("Registration Successful! Please login.");
      navigate("/login");
    } else {
      alert("Registration Failed: " + res.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-blue-600 mb-2">
          Create Account
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Join the professional legal network
        </p>

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
            <input
              className="w-full mt-1 mb-4 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
              placeholder="Criminal, Corporate, Family Law..."
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            />

            <label className="text-sm font-medium text-gray-700">Experience (years)</label>
            <input
              type="number"
              className="w-full mt-1 mb-4 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
              placeholder="5"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />

            <label className="text-sm font-medium text-gray-700">City / Location</label>
            <input
              className="w-full mt-1 mb-4 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
              placeholder="Mumbai, Delhi, Bengaluru"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </>
        )}

        {/* REGISTER BUTTON */}
        <button
          onClick={handleRegister}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition shadow-md shadow-blue-200"
        >
          Create Account
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
