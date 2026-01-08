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
          <NavLink to="/nearby" active={location.pathname === "/nearby"}>Nearby</NavLink>
          <NavLink to="/messages" active={location.pathname === "/messages"}>Messaging</NavLink>
          <NavLink to="/agreements" active={location.pathname === "/agreements"}>Agreements</NavLink>
          <NavLink to="/judge-ai" active={location.pathname === "/judge-ai"}>Judge AI</NavLink>
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
        <div className="md:hidden fixed inset-0 top-20 bg-white/95 backdrop-blur-xl z-40 flex flex-col p-6 overflow-y-auto animate-in slide-in-from-top-10 duration-300">
          <div className="flex flex-col gap-4 text-center">
            <Link to="/marketplace" onClick={() => setMobileMenuOpen(false)} className="mx-auto w-full max-w-xs py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-lg transition">Find Lawyers</Link>
            <Link to="/nearby" onClick={() => setMobileMenuOpen(false)} className="mx-auto w-full max-w-xs py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-lg transition">Nearby</Link>
            <Link to="/messages" onClick={() => setMobileMenuOpen(false)} className="mx-auto w-full max-w-xs py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-lg transition">Messaging</Link>
            <Link to="/agreements" onClick={() => setMobileMenuOpen(false)} className="mx-auto w-full max-w-xs py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-lg transition">Agreements</Link>
            <Link to="/judge-ai" onClick={() => setMobileMenuOpen(false)} className="mx-auto w-full max-w-xs py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-lg transition">Judge AI</Link>
            <Link to="/assistant" onClick={() => setMobileMenuOpen(false)} className="mx-auto w-full max-w-xs py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-lg transition">AI Assistant</Link>
            <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="mx-auto w-full max-w-xs py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-lg transition">Pricing</Link>
          </div>

          <div className="h-px bg-slate-200 my-6 w-1/2 mx-auto"></div>

          <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
            {!user ? (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-4 text-slate-800 font-bold bg-slate-100 rounded-2xl">Log in</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-4 bg-[#0B1120] text-white font-bold rounded-2xl shadow-xl">Get Started</Link>
              </>
            ) : (
              <>
                <Link to={user.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard"} onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-4 bg-blue-50 text-blue-700 font-bold rounded-2xl border border-blue-100">Go to Dashboard</Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-center py-4 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition">Sign Out</button>
              </>
            )}
          </div>
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
