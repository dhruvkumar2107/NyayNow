import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { label: "Home", icon: "🏠", to: "/", color: "text-orange-500" },
    { label: "Network", icon: "👥", to: "/marketplace", color: "text-indigo-600" },
    { label: "Nearby", icon: "💼", to: "/nearby", color: "text-amber-700" },
    { label: "Messaging", icon: "💬", to: "/messages", color: "text-purple-500" },
    { label: "Assistant", icon: "🤖", to: "/assistant", color: "text-pink-500" },
    { label: "Agreements", icon: "📄", to: "/agreements", color: "text-slate-500" },
    { label: "Pricing", icon: "💎", to: "/pricing", color: "text-blue-500" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="max-w-[1280px] mx-auto px-4 h-20 flex items-center justify-between gap-4">

        {/* LEFT: LOGO */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-10 h-10 bg-[#0B1120] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-900/10 transition-transform group-hover:scale-105">
            ⚖️
          </div>
          <span className="hidden lg:block text-2xl font-bold text-[#0B1120] tracking-tight font-display">
            Nyay<span className="text-blue-600">Sathi</span>
          </span>
        </Link>

        {/* CENTER: NAV ITEMS (Icon + Text Stack) */}
        <div className="hidden md:flex items-center justify-center flex-1 gap-1 lg:gap-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.comingSoon ? "#" : item.to}
                onClick={(e) => item.comingSoon && e.preventDefault()}
                className={`relative flex flex-col items-center justify-center px-3 py-1 rounded-lg transition-all duration-200 group
                  ${isActive ? "text-[#0B1120]" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}
                  ${item.comingSoon ? "cursor-not-allowed opacity-60" : ""}
                `}
              >
                <span className={`text-2xl mb-0.5 transition-transform group-hover:-translate-y-0.5 ${item.color} filter drop-shadow-sm`}>
                  {item.icon}
                </span>
                <span className={`text-[11px] font-bold tracking-wide uppercase ${isActive ? "text-[#0B1120]" : "text-slate-500"}`}>
                  {item.label}
                </span>

                {/* Active Indicator */}
                {isActive && (
                  <span className="absolute -bottom-3.5 w-full h-1 bg-[#0B1120] rounded-t-full"></span>
                )}

                {/* Tooltip for Coming Soon */}
                {item.comingSoon && (
                  <span className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* RIGHT: AUTH BUTTONS */}
        <div className="flex items-center gap-3 shrink-0">
          {!user ? (
            <>
              <Link
                to="/login"
                className="hidden sm:block text-slate-600 font-bold hover:text-[#0B1120] transition px-4 py-2"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 bg-[#0B1120] hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/10 transition transform active:scale-95"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3 pl-2">
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-50 transition">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-[#0B1120] flex items-center justify-center font-bold border border-slate-200">
                    {user.name[0]}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-[#0B1120]">{user.name.split(" ")[0]}</p>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{user.role}</p>
                  </div>
                </button>

                {/* DROPDOWN */}
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col p-2 z-50">
                  <Link
                    to={user.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard"}
                    className="px-4 py-3 text-slate-700 hover:bg-slate-50 hover:text-blue-700 font-bold rounded-lg flex items-center gap-3 transition"
                  >
                    <span>📊</span> Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 text-red-600 hover:bg-red-50 font-bold rounded-lg text-left flex items-center gap-3 transition"
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MOBILE TOGGLE */}
          <button
            className="md:hidden text-slate-900 p-2 text-2xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 shadow-xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-4 z-40">
          <div className="grid grid-cols-4 gap-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.comingSoon ? "#" : item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[10px] font-bold text-slate-600">{item.label}</span>
              </Link>
            ))}
          </div>
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


