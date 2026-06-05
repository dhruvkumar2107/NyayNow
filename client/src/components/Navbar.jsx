'use client'

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale, BookOpen, FileText, Briefcase, Gavel,
  Mic, User, Search, MapPin, Video, DollarSign,
  Users, Menu, X, ChevronDown, LogOut, LayoutDashboard, Shield, Siren, Command, Sparkles
} from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleMouseEnter = (index) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setHoveredIndex(null), 200);
  };

  const navItems = [
    { name: "AI Assistant", href: "/assistant" },
    { name: "Find a Lawyer", href: "/marketplace" },
    { name: "For Professionals", href: "/pricing" },
    { name: "Pricing", href: "/pricing" }
  ];

  const isDashboard = pathname?.startsWith('/lawyer') || pathname?.startsWith('/client') || pathname?.startsWith('/admin');
  if (isDashboard) return null;

  return (
    <>
      <nav className={`fixed top-0 w-full z-[9999] transition-all duration-700 ${scrolled ? "bg-[#020617]/80 backdrop-blur-3xl border-b border-white/5 h-[64px] md:h-[72px]" : "bg-transparent border-b border-transparent h-[80px] md:h-[100px]"}`}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-full flex items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group relative z-50 shrink-0" aria-label="NyayNow Home">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-105 transition duration-300">
              <Image src="/logo.png" alt="NyayNow Logo" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-xl font-bold tracking-[-0.03em] text-white group-hover:text-blue-400 transition-colors duration-300">{t("brand")}</span>
          </Link>

          {/* DESKTOP NAV - CENTERED */}
          <div className="hidden lg:flex items-center gap-6 h-full absolute left-1/2 -translate-x-1/2">
            {user?.role !== 'admin' && navItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="text-slate-400 hover:text-white font-bold text-[13.5px] transition-all duration-300 px-4 py-1.5 rounded-full hover:bg-white/5"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-4 relative z-50 shrink-0">
            {/* Language Switcher */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#0b0f19] border border-white/10 rounded-full px-3 py-1.5 text-xs text-slate-300 outline-none hover:bg-white/5 cursor-pointer transition font-bold"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (HI)</option>
                <option value="ta">தமிழ் (TA)</option>
                <option value="te">తెలుగు (TE)</option>
                <option value="kn">ಕನ್ನಡ (KN)</option>
                <option value="mr">मराठी (MR)</option>
              </select>
            </div>

            {!user ? (
              <div className="flex items-center gap-4">
                <Link href="/login" className="hidden sm:block font-bold text-[13px] text-slate-400 hover:text-white transition-all duration-300 px-4">
                  {t("navbar.signin")}
                </Link>
                <Link href="/register">
                  <button className="px-6 py-2.5 bg-white text-slate-950 font-bold text-[13px] rounded-full hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-xl shadow-white/5 active:scale-95">
                    {t("navbar.get_started")}
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 p-1 hover:border-blue-500/50 transition duration-300 overflow-hidden flex items-center justify-center shadow-2xl">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="User profile" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="font-bold text-blue-500 text-base uppercase">{user.name[0]}</span>
                    )}
                  </div>

                  {/* PREMIUM DROPDOWN */}
                  <div className="absolute right-0 top-full mt-4 w-72 bg-[#030712] border border-white/10 rounded-[32px] p-3 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 transform origin-top-right translate-y-4 group-hover:translate-y-0 backdrop-blur-3xl">
                    <div className="px-5 py-6 border-b border-white/5 mb-2 bg-white/5 rounded-[24px]">
                      <p className="text-white font-bold text-[14px] truncate tracking-tight">{user.name}</p>
                      <p className="text-blue-500 text-[10px] truncate tracking-[0.2em] mt-1 uppercase font-black">{user.role}</p>
                    </div>

                    <div className="space-y-1">
                      <Link href={user.role === 'admin' ? '/admin' : '/client/dashboard'} className="flex items-center gap-4 px-5 py-4 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl text-[14px] transition font-bold tracking-tight">
                        <LayoutDashboard size={18} className="text-blue-500/50" /> Dashboard
                      </Link>

                      <Link href="/settings" className="flex items-center gap-4 px-5 py-4 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl text-[14px] transition font-bold tracking-tight">
                        <User size={18} className="text-blue-500/50" /> Settings
                      </Link>

                      <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 text-red-400 hover:bg-red-500/5 rounded-2xl text-[14px] transition font-bold tracking-tight text-left">
                        <LogOut size={18} /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors duration-300"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[9998] premium-glass pt-24 pb-12 px-6 overflow-y-auto"
          >
            <div className="max-w-lg mx-auto space-y-10">
              <div className="space-y-4">
                <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] px-2">Navigation</p>
                <div className="grid grid-cols-1 gap-2">
                  {navItems.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all text-white font-bold text-[14px] active:scale-[0.98]"
                      >
                        <span>{item.name}</span>
                        <span aria-hidden="true">→</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {!user && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="pt-10 border-t border-white/10 flex flex-col gap-4"
                >
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-5 rounded-2xl bg-white/5 text-white font-bold text-center text-sm border border-white/10">Sign In</Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full py-5 rounded-2xl bg-white text-slate-950 font-bold text-center text-sm shadow-2xl">Get Started</Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MagneticButton({ children }) {
  const ref = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouse = (e) => {
    const { clientX, clientY } = e
    if (!ref.current) return
    const { height, width, left, top } = ref.current.getBoundingClientRect()
    const middleX = clientX - (left + width / 2)
    const middleY = clientY - (top + height / 2)
    setPosition({ x: middleX * 0.1, y: middleY * 0.1 })
  }

  const reset = () => {
    setPosition({ x: 0, y: 0 })
  }

  const { x, y } = position

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  )
}
