import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


// Force redeploy
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all duration-300 font-sans">
      <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between">

        {/* LEFT: LOGO */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 bg-[#0B1120] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-slate-200 transition-transform group-hover:scale-105">
            ⚖️
          </div>
          <span className="text-2xl font-bold text-[#0B1120] tracking-tight font-display">
            Nyay<span className="text-blue-600">Sathi</span>
          </span>
        </Link>

        {/* CENTER: NAV LINKS (Simple Text, No Icons) */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/marketplace" active={location.pathname === "/marketplace"}>Find Lawyers</NavLink>
          <NavLink to="/agreements" active={location.pathname === "/agreements"}>Agreements</NavLink>
          <NavLink to="/assistant" active={location.pathname === "/assistant"}>AI Assistant</NavLink>
          <NavLink to="/pricing" active={location.pathname === "/pricing"}>Pricing</NavLink>
        </div>

        {/* RIGHT: AUTH BUTTONS */}
        <div className="flex items-center gap-2 shrink-0">
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
                className="px-6 py-2.5 bg-[#0B1120] hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/10 transition transform active:scale-95"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4 pl-4">
              <span className="hidden lg:block text-sm font-bold text-slate-700">
                Hi, {user.name.split(" ")[0]}
              </span>

              <div className="relative group">
                <button className="flex items-center gap-2 p-0.5 rounded-full transition outline-none">
                  <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-100 text-lg shadow-sm">
                    {user.name[0].toUpperCase()}
                  </div>
                </button>

                {/* DROPDOWN */}
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col p-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-50 md:hidden">
                    <p className="text-sm font-bold text-slate-900">Hi, {user.name.split(" ")[0]}</p>
                  </div>
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
            className="md:hidden text-slate-900 p-2 text-2xl ml-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 shadow-xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-4 z-40 text-center">
          <Link to="/marketplace" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 font-bold py-2">Find Lawyers</Link>
          <Link to="/agreements" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 font-bold py-2">Agreements</Link>
          <Link to="/assistant" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 font-bold py-2">AI Assistant</Link>
          <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 font-bold py-2">Pricing</Link>

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

function NavLink({ to, children, active }) {
  return (
    <Link
      to={to}
      className={`relative font-bold text-[15px] transition-colors duration-200 
        ${active ? "text-[#0B1120]" : "text-slate-500 hover:text-blue-600"}`}
    >
      {children}
      {/* Active Dot/Underline */}
      {active && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0B1120] rounded-full"></span>
      )}
    </Link>
  );
}
