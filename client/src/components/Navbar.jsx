import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 h-[72px] flex items-center ${scrolled ? "glass shadow-sm" : "bg-white/50 backdrop-blur-sm border-b border-transparent"}`}>
      <div className="max-w-[1280px] w-full mx-auto px-6 h-full flex items-center justify-between">

        {/* LEFT: LOGO */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 bg-[#0B1120] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-slate-200 transition-transform group-hover:scale-105">
            ⚖️
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight font-display">
            Nyay<span className="text-indigo-600">Now</span>
          </span>
        </Link>

        {/* CENTER: NAV LINKS (Simple Text, No Icons) */}
        <NavLink to="/marketplace" active={location.pathname === "/marketplace"}>Find Lawyers</NavLink>
        <NavLink to="/messages" active={location.pathname === "/messages"}>Messages</NavLink>

        {/* AI TOOLS DROPDOWN */}
        <div className="relative group h-full flex items-center">
          <button className="flex items-center gap-1 font-semibold text-[14px] text-slate-500 hover:text-blue-600 transition-colors">
            AI Tools
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          <div className="absolute top-full left-0 w-48 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col p-2 z-50 transform origin-top-left">
            <Link to="/judge-ai" className="px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg text-sm font-medium transition">Judge AI</Link>
            <Link to="/judge-pro" className="px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg text-sm font-medium transition">Judge Pro</Link>
            <Link to="/voice-assistant" className="px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg text-sm font-medium transition">NyayVoice</Link>
            <Link to="/assistant" className="px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg text-sm font-medium transition">AI Assistant</Link>
          </div>
        </div>

        <NavLink to="/agreements" active={location.pathname === "/agreements"}>Agreements</NavLink>
        <NavLink to="/nearby" active={location.pathname === "/nearby"}>Nearby</NavLink>
        <NavLink to="/pricing" active={location.pathname === "/pricing"}>Pricing</NavLink>

        {/* RIGHT: AUTH BUTTONS */}
        <div className="flex items-center gap-3 shrink-0">
          {!user ? (
            <>
              <Link
                to="/login"
                className="hidden sm:block text-slate-600 font-bold hover:text-[#0B1120] transition text-sm px-3 py-2"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 bg-[#0B1120] hover:bg-slate-800 text-white font-bold text-sm rounded-lg shadow-md transition transform active:scale-95"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4 pl-2">
              <span className="hidden xl:block text-sm font-bold text-slate-700">
                Hi, {user.name?.split(" ")[0]}
              </span>

              <div className="relative group">
                <button className="flex items-center gap-2 p-0.5 rounded-full transition outline-none">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-100 text-sm shadow-sm">
                    {user.name && user.name[0] ? user.name[0].toUpperCase() : "U"}
                  </div>
                </button>

                {/* DROPDOWN */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col p-1.5 z-50 transform origin-top-right">
                  <div className="px-3 py-2 border-b border-slate-50 md:hidden">
                    <p className="text-xs font-bold text-slate-900">Hi, {user.name}</p>
                  </div>
                  <Link
                    to={user.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard"}
                    className="px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-700 text-sm font-medium rounded-lg flex items-center gap-2 transition"
                  >
                    <span>📊</span> Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg text-left flex items-center gap-2 transition"
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MOBILE TOGGLE */}
          <button
            className="lg:hidden text-slate-900 p-2 text-xl ml-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white/95 backdrop-blur-xl z-40 flex flex-col p-6 overflow-y-auto animate-in slide-in-from-top-4 duration-300 border-t border-slate-100">
          <div className="flex flex-col gap-2 text-center">
            <Link to="/marketplace" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 rounded-lg hover:bg-slate-50 text-slate-700 font-bold text-base transition">Find Lawyers</Link>
            <Link to="/messages" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 rounded-lg hover:bg-slate-50 text-slate-700 font-bold text-base transition">Messages</Link>
            <div className="w-full py-2 bg-slate-50 rounded-lg px-4 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Tools</p>
              <Link to="/judge-ai" onClick={() => setMobileMenuOpen(false)} className="block text-slate-700 font-semibold text-sm">Judge AI</Link>
              <Link to="/judge-pro" onClick={() => setMobileMenuOpen(false)} className="block text-slate-700 font-semibold text-sm">Judge Pro</Link>
              <Link to="/voice-assistant" onClick={() => setMobileMenuOpen(false)} className="block text-slate-700 font-semibold text-sm">NyayVoice</Link>
              <Link to="/assistant" onClick={() => setMobileMenuOpen(false)} className="block text-slate-700 font-semibold text-sm">AI Assistant</Link>
            </div>
            <Link to="/nearby" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 rounded-lg hover:bg-slate-50 text-slate-700 font-bold text-base transition">Nearby</Link>
            <Link to="/agreements" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 rounded-lg hover:bg-slate-50 text-slate-700 font-bold text-base transition">Agreements</Link>
            <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 rounded-lg hover:bg-slate-50 text-slate-700 font-bold text-base transition">Pricing</Link>
          </div>

          <div className="h-px bg-slate-200 my-4 w-1/3 mx-auto"></div>

          <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
            {!user ? (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 text-slate-800 font-bold bg-slate-100 rounded-xl text-sm">Log in</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 bg-[#0B1120] text-white font-bold rounded-xl shadow-lg text-sm">Get Started</Link>
              </>
            ) : (
              <>
                <Link to={user.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard"} onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 bg-blue-50 text-blue-700 font-bold rounded-xl border border-blue-100 text-sm">Go to Dashboard</Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-center py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition text-sm">Sign Out</button>
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
      className={`relative font-semibold text-[14px] transition-colors duration-200 
        ${active ? "text-[#0B1120]" : "text-slate-500 hover:text-blue-600"}`}
    >
      {children}
      {/* Active Indicator */}
      {active && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0B1120] rounded-full"></span>
      )}
    </Link>
  );
}
