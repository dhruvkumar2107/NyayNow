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
      <nav className="fixed top-0 w-full z-[9999] glass-premium h-[80px] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group relative z-50">
            <div className="relative">
              <div className="absolute inset-0 bg-gold-500 blur-[20px] opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <img src="/logo.png" alt="NyayNow" className="relative w-10 h-10 object-contain hover:scale-105 transition duration-300 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight text-white group-hover:text-gold-400 transition-colors duration-300">NyayNow</span>
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
                <button className={`flex items-center gap-1.5 text-sm font-bold tracking-wide transition-all duration-300 ${hoveredIndex === idx ? "text-gold-400" : "text-slate-300 hover:text-white"}`}>
                  {category.label}
                  <ChevronDown size={14} className={`transition-transform duration-300 ${hoveredIndex === idx ? "rotate-180 text-gold-400" : ""}`} />
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
                      <div className="glass-card border border-white/10 rounded-2xl p-2 shadow-2xl grid grid-cols-2 gap-2 relative overflow-hidden">
                        {/* Gold Border Glow */}
                        <div className="absolute inset-0 pointer-events-none border border-gold-500/10 rounded-2xl"></div>

                        {category.items.map((item, i) => (
                          <Link
                            key={i}
                            to={item.href}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition group relative z-10 border border-transparent hover:border-gold-500/10"
                          >
                            <div className="w-10 h-10 rounded-lg bg-midnight-800 flex items-center justify-center border border-white/5 group-hover:border-gold-500/30 transition group-hover:scale-110 duration-300 shadow-lg">
                              {/* Override Icon Colors for Premium Feel */}
                              <div className="group-hover:text-gold-400 transition duration-300">
                                {item.icon}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-200 font-display font-semibold text-sm group-hover:text-gold-400 transition">{item.name}</div>
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
          <div className="flex items-center gap-4 relative z-50">
            {!user ? (
              <>
                <Link to="/login" className="hidden sm:block font-bold text-sm text-slate-300 hover:text-gold-400 transition-colors duration-300">Log in</Link>
                <Link to="/register" className="relative overflow-hidden px-6 py-2.5 bg-gradient-gold text-midnight-950 font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition duration-300 group">
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition duration-300"></div>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to={user.role === 'admin' ? '/admin' : (user.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard')} className="hidden sm:flex items-center gap-2 transition font-bold text-sm text-slate-300 hover:text-white duration-300 hover:bg-white/5 px-3 py-1.5 rounded-lg border border-transparent hover:border-white/10">
                  <LayoutDashboard size={18} className="text-gold-400" /> {user.role === 'admin' ? 'Back to Console' : 'Dashboard'}
                </Link>

                <div className="relative group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-400 to-yellow-600 p-[2px] shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                    <div className="w-full h-full rounded-full bg-midnight-950 flex items-center justify-center overflow-hidden">
                      {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" /> : <span className="font-display font-bold text-gold-400 text-lg">{user.name[0]}</span>}
                    </div>
                  </div>
                  <div className="absolute right-0 top-full mt-4 w-64 glass-card rounded-xl p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                    <div className="px-3 py-3 border-b border-white/5 mb-2 bg-midnight-950/30 rounded-t-lg">
                      <p className="text-white font-display font-bold text-sm truncate">{user.name}</p>
                      <p className="text-slate-500 text-xs truncate">{user.email}</p>
                    </div>
                    <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-gold-400 hover:bg-white/5 rounded-lg text-sm transition font-medium">
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
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-slate-300 hover:text-gold-400 transition-colors duration-300">
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
            className="fixed inset-0 z-40 bg-midnight-950/95 backdrop-blur-xl pt-24 px-6 overflow-y-auto"
          >
            <div className="flex flex-col gap-6 pb-20">
              {navItems.map((group, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="text-gold-400 font-display font-bold text-sm uppercase tracking-widest border-b border-white/5 pb-2">{group.label}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {group.items.map((item, i) => (
                      <Link
                        key={i}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-gold-500/30 transition"
                      >
                        <div className="text-slate-300">{item.icon}</div>
                        <div>
                          <div className="text-white font-semibold text-sm">{item.name}</div>
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
