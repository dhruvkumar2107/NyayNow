import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm transition-all duration-300">
      <div className="max-w-[1128px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0B1120] to-[#1E293B] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-slate-200 group-hover:scale-105 transition-all">
            ⚖️
          </div>
          <span className="text-2xl font-bold text-[#0B1120] tracking-tight group-hover:text-blue-700 transition font-display">
            Nyay<span className="text-blue-600">Sathi</span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/marketplace">Find Lawyers</NavLink>
          <NavLink to="/agreements">Agreements</NavLink>
          <NavLink to="/assistant">AI Assistant</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
        </div>

        {/* AUTH BUTTONS */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <>
              <Link
                to="/login"
                className="text-slate-600 font-semibold hover:text-[#0B1120] transition px-4 py-2 hover:bg-slate-50 rounded-lg"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 bg-[#0B1120] hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-700">
                Hi, {user.name.split(" ")[0]}
              </span>
              <div className="relative group">
                <button className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-blue-700 flex items-center justify-center font-bold border-2 border-white shadow-sm ring-2 ring-slate-100">
                    {user.name[0]}
                  </div>
                </button>

                {/* DROPDOWN */}
                <div className="absolute right-0 top-full mt-4 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col p-2 transform origin-top-right">
                  <Link
                    to={user.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard"}
                    className="px-4 py-3 text-slate-700 hover:bg-slate-50 hover:text-blue-700 font-semibold rounded-xl flex items-center gap-3 transition"
                  >
                    <span>📊</span> Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 text-red-600 hover:bg-red-50 font-semibold rounded-xl text-left flex items-center gap-3 transition"
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button
          className="md:hidden text-slate-900 p-2 text-2xl"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 shadow-xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-4 z-40">
          <MobileLink to="/marketplace">Find Lawyers</MobileLink>
          <MobileLink to="/agreements">Agreements</MobileLink>
          <MobileLink to="/assistant">AI Assistant</MobileLink>
          <MobileLink to="/pricing">Pricing</MobileLink>
          <div className="h-px bg-slate-100 my-2"></div>
          {!user ? (
            <>
              <Link to="/login" className="w-full text-center py-3 text-slate-700 font-bold bg-slate-50 rounded-xl">Log in</Link>
              <Link to="/register" className="w-full text-center py-3 bg-[#0B1120] text-white font-bold rounded-xl shadow-lg">Get Started</Link>
            </>
          ) : (
            <>
              <Link to={user.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard"} className="w-full text-center py-3 bg-blue-50 text-blue-700 font-bold rounded-xl">Dashboard</Link>
              <button onClick={handleLogout} className="w-full text-center py-3 text-red-600 font-bold">Sign Out</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-slate-600 font-semibold hover:text-blue-700 transition relative group py-2"
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
    </Link>
  );
}

function MobileLink({ to, children }) {
  return (
    <Link to={to} className="text-lg font-semibold text-slate-800 hover:text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-xl transition">
      {children}
    </Link>
  );
}
