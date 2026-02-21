import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale, BookOpen, FileText, Briefcase, Gavel,
  Mic, User, Search, MapPin, Video, DollarSign,
  Users, Menu, X, ChevronDown, LogOut, LayoutDashboard, Shield, Siren
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
        { name: "⚖️ NyayCourt", href: "/courtroom-battle", desc: "AI Multi-Agent Trial", icon: <Gavel className="text-amber-400" size={20} /> },
        { name: "🚨 Legal SOS", href: "/legal-sos", desc: "Emergency Legal Triage", icon: <Shield className="text-red-400" size={20} /> },
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
      <nav className="fixed top-0 w-full z-[9999] glass-premium h-[80px] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group relative z-50">
            <div className="relative">
              <div className="absolute inset-0 bg-gold-400 blur-[20px] opacity-10 group-hover:opacity-30 transition duration-500"></div>
              <img src="/logo.png" alt="NyayNow" className="relative w-10 h-10 object-contain hover:scale-105 transition duration-300 drop-shadow-[0_0_10px_rgba(212,175,55,0.2)]" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight text-slate-900 group-hover:text-gold-600 transition-colors duration-300">NyayNow</span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex items-center gap-8 h-full">
            {/* HIDE MENU FOR ADMINS TO KEEP IT STRICT */}
            {user?.role !== 'admin' && navItems.map((category, idx) => (
              <div
                key={idx}
                className="relative h-full flex items-center"
                onMouseEnter={() => handleMouseEnter(idx)}
                onMouseLeave={handleMouseLeave}
              >
                <button className={`flex items-center gap-1.5 text-sm font-bold tracking-wide transition-all duration-300 ${hoveredIndex === idx ? "text-gold-600" : "text-slate-600 hover:text-slate-900"}`}>
                  {category.label}
                  <ChevronDown size={14} className={`transition-transform duration-300 ${hoveredIndex === idx ? "rotate-180 text-gold-600" : ""}`} />
                </button>

                <AnimatePresence>
                  {hoveredIndex === idx && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-6 w-[600px]"
                    >
                      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-2xl grid grid-cols-2 gap-2 relative overflow-hidden backdrop-blur-3xl">
                        {/* Gold Border Glow */}
                        <div className="absolute inset-0 pointer-events-none border border-gold-500/10 rounded-2xl"></div>

                        {category.items.map((item, i) => (
                          <Link
                            key={i}
                            to={item.href}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition group relative z-10 border border-transparent hover:border-gold-500/10"
                          >
                            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200 group-hover:border-gold-500/30 transition group-hover:scale-110 duration-300 shadow-sm">
                              {/* Override Icon Colors for Premium Feel */}
                              <div className="group-hover:text-gold-400 transition duration-300">
                                {item.icon}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-900 font-display font-semibold text-sm group-hover:text-gold-600 transition">{item.name}</div>
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

            {/* ADMIN SPECIFIC HEADER TEXT */}
            {user?.role === 'admin' && (
              <div className="flex items-center gap-2 px-4 py-1 bg-red-900/20 border border-red-500/30 rounded-full">
                <Shield size={16} className="text-red-500" />
                <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Administrator Mode</span>
              </div>
            )}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3 lg:gap-4 relative z-50">
            {!user ? (
              <div className="flex items-center gap-5">
                <Link to="/login" className="hidden sm:block font-bold text-sm text-slate-600 hover:text-slate-900 transition-all duration-300 relative group">
                  Log in
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/register" className="relative overflow-hidden px-6 py-2.5 bg-gradient-to-r from-gold-400 to-yellow-600 text-midnight-950 font-bold text-sm rounded-xl hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition duration-300 group flex items-center gap-2">
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition duration-300"></div>
                  </Link>
                </motion.div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to={user.role === 'admin' ? '/admin' : (user.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard')} className="hidden sm:flex items-center gap-2 transition font-bold text-xs uppercase tracking-widest text-slate-600 hover:text-slate-900 duration-300 bg-white px-4 py-2 rounded-xl border border-slate-200 hover:border-gold-500/30 shadow-sm">
                    <LayoutDashboard size={15} className="text-gold-600" /> {user.role === 'admin' ? 'Console' : 'Dashboard'}
                  </Link>
                </motion.div>

                <div className="relative group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-400 to-yellow-600 p-[2px] shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:scale-105 transition duration-300">
                    <div className="w-full h-full rounded-full bg-midnight-950 flex items-center justify-center overflow-hidden">
                      {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" /> : <span className="font-display font-bold text-gold-400 text-lg">{user.name[0]}</span>}
                    </div>
                  </div>
                  <div className="absolute right-0 top-full mt-4 w-64 bg-white border border-slate-200 rounded-xl p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                    <div className="px-3 py-3 border-b border-slate-100 mb-2 bg-slate-50/50 rounded-t-lg">
                      <p className="text-slate-900 font-display font-bold text-sm truncate">{user.name}</p>
                      <p className="text-slate-500 text-xs truncate">{user.email}</p>
                    </div>
                    <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-gold-600 hover:bg-slate-50 rounded-lg text-sm transition font-medium">
                      <User size={16} /> Profile & Settings
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-rose-500 hover:bg-rose-500/10 rounded-lg text-sm transition font-medium text-left">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/courtroom-battle"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 font-bold text-[10px] uppercase tracking-[0.15em] hover:bg-amber-200 transition shadow-sm group"
              >
                <Gavel size={14} className="group-hover:rotate-12 transition duration-300" />
                <span>NyayCourt</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/legal-sos"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 border border-red-200 text-red-700 font-bold text-[10px] uppercase tracking-[0.15em] hover:bg-red-600 hover:text-white transition shadow-sm group"
              >
                <span className="relative flex h-2 w-2 mr-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
                </span>
                <span className="hidden lg:inline">Legal SOS</span>
                <Siren size={15} className="group-hover:animate-pulse transition duration-300" />
              </Link>
            </motion.div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-slate-600 hover:text-gold-600 transition-colors duration-300">
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
            className="fixed inset-0 z-40 bg-white backdrop-blur-xl pt-24 px-6 overflow-y-auto"
          >
            <div className="flex flex-col gap-6 pb-20">
              {navItems.map((group, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="text-gold-600 font-display font-bold text-sm uppercase tracking-widest border-b border-slate-100 pb-2">{group.label}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {group.items.map((item, i) => (
                      <Link
                        key={i}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-gold-500/30 transition"
                      >
                        <div className="text-slate-600">{item.icon}</div>
                        <div>
                          <div className="text-slate-900 font-semibold text-sm">{item.name}</div>
                          <div className="text-slate-500 text-xs">{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              {!user && (
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/10">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-center border border-white/10 transition">Log In</Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full py-4 rounded-xl bg-gradient-gold text-midnight-950 font-bold text-center shadow-lg shadow-gold-500/20">Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
