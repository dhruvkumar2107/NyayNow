import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithToken } = useAuth();

  const [method, setMethod] = useState("email"); // 'email' or 'mobile'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(""); // Removing local error state for toasts

  const handleEmailLogin = async () => {
    if (!email || !password) return toast.error("Please enter email and password");
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      toast.success("Login Successful!");
      // Smart Redirect based on Role
      if (res.user.role === "lawyer") {
        navigate("/lawyer/dashboard");
      } else {
        navigate("/client/dashboard");
      }
    } else {
      toast.error(res.message);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) return toast.error("Enter valid phone number");
    setLoading(true);

    try {
      await axios.post("/api/auth/send-otp", { phone });
      setOtpSent(true);
      toast.success("OTP Sent!");
      // Mock OTP alert for demo
      // alert("OTP Sent: Check console");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error("Enter OTP");
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/verify-otp", { phone, otp });
      const { user, token } = res.data;
      loginWithToken(user, token);
      toast.success("Login Successful!");
      navigate(user.role === 'lawyer' ? "/lawyer/dashboard" : "/client/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/google", {
        token: credentialResponse.credential
      });
      const { user, token } = res.data;
      loginWithToken(user, token);
      toast.success("Login Successful!");
      navigate(user.role === 'lawyer' ? "/lawyer/dashboard" : "/client/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Google Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6">Login to continue to Nyay-Sathi</p>

        {/* GOOGLE LOGIN */}
        <div className="mb-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Google Login Error")}
            useOneTap
            theme="filled_blue"
            shape="pill"
            text="continue_with"
          />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
        </div>

        {/* TABS */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6 border border-gray-200">
          <button
            onClick={() => { setMethod("email"); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${method === "email" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-900"}`}
          >
            Email
          </button>
          <button
            onClick={() => { setMethod("mobile"); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${method === "mobile" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-900"}`}
          >
            Mobile OTP
          </button>
        </div>

        {/* ... Rest of form ... */}
        {method === "email" ? (
          <>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full mt-1 mb-4 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full mt-1 mb-6 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={handleEmailLogin}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition disabled:opacity-50 shadow-md shadow-blue-200"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </>
        ) : (
          <>
            <label className="text-sm font-medium text-gray-700">Mobile Number</label>
            <input
              type="tel"
              disabled={otpSent}
              placeholder="+91 98765 43210"
              className="w-full mt-1 mb-4 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 disabled:opacity-50"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            {otpSent && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <label className="text-sm font-medium text-gray-700">One Time Password (OTP)</label>
                <input
                  type="text"
                  placeholder="XXXX"
                  className="w-full mt-1 mb-6 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 tracking-widest text-center text-xl"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            )}

            {!otpSent ? (
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition disabled:opacity-50 shadow-md shadow-blue-200"
              >
                {loading ? "Sending OTP..." : "Get OTP"}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setOtpSent(false)}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition disabled:opacity-50 shadow-md shadow-green-200"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
              </div>
            )}
          </>
        )}

        <p className="text-sm text-gray-500 mt-6 text-center">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">Create one</Link>
        </p>
      </div>
    </main>
  );
}
