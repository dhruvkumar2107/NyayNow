import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale, BookOpen, FileText, Briefcase, Gavel,
  Mic, User, Search, MapPin, Video, DollarSign,
  Users, Menu, X, ChevronDown, LogOut, LayoutDashboard
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const timeoutRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleMouseEnter = (index) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setHoveredIndex(null), 200);
  };

  const navItems = [
    {
      label: "Intelligence",
      items: [
        { name: "Judge AI", href: "/judge-ai", desc: "Win Probability Predictor", icon: <Gavel className="text-amber-500" size={20} /> },
        { name: "Legal Research", href: "/research", desc: "Semantic Case Search", icon: <Search className="text-blue-400" size={20} /> },
        { name: "Drafting Lab", href: "/drafting", desc: "AI Contract Generator", icon: <FileText className="text-emerald-400" size={20} /> },
        { name: "NyayVoice", href: "/voice-assistant", desc: "Multilingual Voice AI", icon: <Mic className="text-purple-400" size={20} /> },
      ]
    },
    {
      label: "Practice",
      items: [
        { name: "Moot Court VR", href: "/moot-court", desc: "Argument Simulator", icon: <Scale className="text-rose-400" size={20} /> },
        { name: "Career Hub", href: "/career", desc: "Internships & Tasks", icon: <Briefcase className="text-orange-400" size={20} /> },
        { name: "Agreements", href: "/agreements", desc: "Smart Templates", icon: <BookOpen className="text-cyan-400" size={20} /> },
        { name: "Assistant", href: "/assistant", desc: "24/7 Legal Chat", icon: <User className="text-indigo-400" size={20} /> },
      ]
    },
    {
      label: "Network",
      items: [
        { name: "Marketplace", href: "/marketplace", desc: "Verified Lawyers", icon: <Users className="text-gold-400" size={20} /> },
        { name: "Nearby Help", href: "/nearby", desc: "Courts & Police", icon: <MapPin className="text-red-400" size={20} /> },
        { name: "Consultations", href: "/messages", desc: "Secure Video Calls", icon: <Video className="text-teal-400" size={20} /> },
        { name: "Pricing", href: "/pricing", desc: "Pro Plans", icon: <DollarSign className="text-green-400" size={20} /> },
      ]
    },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-[9999] bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 h-[80px] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group relative z-50">
            <img src="/logo.png" alt="NyayNow" className="w-10 h-10 object-contain hover:scale-105 transition duration-300" />
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors duration-300">NyayNow</span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex items-center gap-8 h-full">
            {navItems.map((category, idx) => (
              <div
                key={idx}
                className="relative h-full flex items-center"
                onMouseEnter={() => handleMouseEnter(idx)}
                onMouseLeave={handleMouseLeave}
              >
                <button className={`flex items-center gap-1.5 text-sm font-bold transition-colors duration-300 ${hoveredIndex === idx ? "text-indigo-400" : "text-slate-300 hover:text-white"}`}>
                  {category.label}
                  <ChevronDown size={14} className={`transition-transform duration-300 ${hoveredIndex === idx ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {hoveredIndex === idx && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[600px]"
                    >
                      <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-2 shadow-2xl grid grid-cols-2 gap-2 relative overflow-hidden backdrop-blur-xl">
                        {category.items.map((item, i) => (
                          <Link
                            key={i}
                            to={item.href}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition group relative z-10"
                          >
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-indigo-500/50 transition group-hover:scale-110 duration-300">
                              {item.icon}
                            </div>
                            <div>
                              <div className="text-slate-200 font-bold text-sm group-hover:text-indigo-400 transition">{item.name}</div>
                              <div className="text-slate-500 text-xs font-medium">{item.desc}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-4 relative z-50">
            {!user ? (
              <>
                <Link to="/login" className="hidden sm:block font-bold text-sm text-slate-300 hover:text-white transition-colors duration-300">Log in</Link>
                <Link to="/register" className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20">
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to={user.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard'} className="hidden sm:flex items-center gap-2 transition font-bold text-sm text-slate-300 hover:text-white duration-300">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>

                <div className="relative group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                      {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" /> : <span className="font-bold text-white">{user.name[0]}</span>}
                    </div>
                  </div>
                  <div className="absolute right-0 top-full mt-4 w-56 bg-[#0f172a] border border-white/10 rounded-xl p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right backdrop-blur-xl">
                    <div className="px-3 py-3 border-b border-white/5 mb-2">
                      <p className="text-white font-bold text-sm truncate">{user.name}</p>
                      <p className="text-slate-500 text-xs truncate">{user.email}</p>
                    </div>
                    <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg text-sm transition font-medium">
                      <User size={16} /> Profile & Settings
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-rose-500 hover:bg-rose-500/10 rounded-lg text-sm transition font-medium text-left">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MOBILE MENU BTN */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-slate-300 hover:text-white transition-colors duration-300">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#020617] pt-24 px-6 overflow-y-auto"
          >
            <div className="flex flex-col gap-6 pb-20">
              {navItems.map((group, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="text-indigo-400 font-bold text-xs uppercase tracking-widest">{group.label}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {group.items.map((item, i) => (
                      <Link
                        key={i}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5"
                      >
                        <div className="text-slate-200">{item.icon}</div>
                        <div>
                          <div className="text-white font-bold text-sm">{item.name}</div>
                          <div className="text-slate-500 text-xs">{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              {!user && (
                <div className="flex flex-col gap-3 mt-4">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-4 rounded-xl bg-white/10 text-white font-bold text-center">Log In</Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-center shadow-lg shadow-indigo-600/20">Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
