'use client'

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale, FileText, Gavel, Mic, User, Search, MapPin, Menu, X, ChevronDown,
  LogOut, LayoutDashboard, Sparkles, Languages, Activity
} from "lucide-react";
import Image from "next/image";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी" },
  { value: "ta", label: "தமிழ்" },
  { value: "te", label: "తెలుగు" },
  { value: "kn", label: "ಕನ್ನಡ" },
  { value: "mr", label: "मराठी" },
  { value: "bn", label: "বাংলা" },
  { value: "gu", label: "ગુજરાતી" },
  { value: "pa", label: "ਪੰਜਾਬੀ" },
  { value: "ml", label: "മലയാളം" },
  { value: "or", label: "ଓଡ଼ିଆ" },
  { value: "as", label: "অসমীয়া" },
  { value: "ur", label: "اردو" },
  { value: "sa", label: "संस्कृतम्" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const servicesRef = useRef(null);
  const accountRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setServicesOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setServicesOpen(false);
      setAccountOpen(false);
      setMobileMenuOpen(false);
    };
    const handlePointerDown = (event) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target)) {
        setServicesOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const handleLogout = () => {
    setAccountOpen(false);
    logout();
    router.push("/");
  };

  const services = [
    { name: "AI Legal Assistant", desc: "AI-generated legal information; verify sources independently", href: "/assistant", icon: Sparkles, color: "text-blue-400", gradient: "from-blue-500 to-indigo-500" },
    { name: "Smart Document Drafting", desc: "Prepare editable drafts for human review", href: "/drafting", icon: FileText, color: "text-emerald-400", gradient: "from-emerald-500 to-teal-500" },
    { name: "Case Analysis Research", desc: "Outcome analysis is disabled while research is in development", href: "/judge-ai", icon: Gavel, color: "text-indigo-400", gradient: "from-indigo-500 to-violet-500" },
    { name: "Courtroom Simulator", desc: "Simulate a live AI trial argument", href: "/nyaycourt-simulator", icon: Scale, color: "text-violet-400", gradient: "from-violet-500 to-fuchsia-500" },
    { name: "Voice Assist", desc: "Voice input availability varies by browser, language, and feature", href: "/nyayvoice", icon: Mic, color: "text-cyan-400", gradient: "from-cyan-500 to-blue-500" },
    { name: "Nearby Map", desc: "Check listing details and contact information before travel", href: "/nearby", icon: MapPin, color: "text-amber-400", gradient: "from-amber-500 to-orange-500" },
    { name: "Legal Research", desc: "Search Indian legal materials", href: "/research", icon: Search, color: "text-pink-400", gradient: "from-pink-500 to-rose-500" },
    { name: "Court Case Search", desc: "Search availability depends on the source and case", href: "/ecourts", icon: Activity, color: "text-rose-400", gradient: "from-rose-500 to-red-500" },
    { name: "Legal Text Translator", desc: "Machine translations can be inaccurate; get legal text reviewed", href: "/translator", icon: Languages, color: "text-sky-400", gradient: "from-sky-500 to-cyan-500" }
  ];

  const isServicesActive = services.some((item) => pathname === item.href);

  const navItems = [
    { name: "Find a Lawyer", href: "/marketplace" },
    { name: "For Professionals", href: "/professionals" },
    { name: "Pricing", href: "/pricing" }
  ];

  const displayNavItems = [...navItems];
  if (user && user.role === 'admin') {
    displayNavItems.push({ name: "Admin Dashboard", href: "/admin" });
  }

  const isDashboard = pathname?.startsWith('/lawyer') || pathname?.startsWith('/client') || pathname?.startsWith('/admin');
  if (isDashboard) return null;

  return (
    <>
      <nav role="navigation" aria-label="Main Navigation" className={`fixed top-0 w-full z-[9999] transition-all duration-700 ${scrolled ? "bg-glass-strong border-b border-white/10 h-[64px] md:h-[72px]" : "bg-transparent border-b border-transparent h-[80px] md:h-[100px]"}`}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-full flex items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group relative z-50 shrink-0" aria-label="NyayNow Home">
            <motion.div
                whileHover={{ scale: 1.1, rotate: 3 }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 rounded-xl bg-glass border border-white/10 flex items-center justify-center group-hover:border-blue-500/30 transition-all duration-300"
            >
              <Image src="/logo.png" alt="NyayNow Logo" width={24} height={24} className="object-contain" />
            </motion.div>
            <span className="text-xl font-bold tracking-[-0.03em] text-white group-hover:text-blue-400 transition-colors duration-300">{t("brand")}</span>
          </Link>

          {/* DESKTOP NAV - CENTERED */}
          <div className="hidden lg:flex items-center gap-4 h-full absolute left-1/2 -translate-x-1/2">
            <>
              {/* Services Dropdown */}
              <div
                ref={servicesRef}
                className="relative h-full flex items-center"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setServicesOpen((open) => !open)}
                  aria-expanded={servicesOpen}
                  aria-haspopup="true"
                  aria-controls="services-menu"
                  className={`flex items-center gap-1.5 font-bold text-[13.5px] transition-all duration-300 px-4 py-1.5 rounded-full outline-none cursor-pointer bg-glass border hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 ${
                    isServicesActive
                      ? "text-white border-blue-500/40"
                      : "text-slate-400 border-white/10"
                  }`}
                >
                  Services
                  <ChevronDown size={14} className={`transition-transform duration-300 ${servicesOpen ? 'rotate-180 text-white' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div
                      id="services-menu"
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-[70%] left-0 w-[420px] bg-glass-strong border border-white/10 rounded-[28px] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] backdrop-blur-3xl grid grid-cols-1 gap-1 z-[99999]"
                    >
                      <div className="px-3 py-1 border-b border-white/5 mb-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Legal AI Services</p>
                      </div>
                      {services.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setServicesOpen(false)}
                            aria-current={pathname === item.href ? "page" : undefined}
                            className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                          >
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 2 }}
                                transition={{ duration: 0.3 }}
                                className={`w-10 h-10 rounded-xl bg-glass border border-white/5 flex items-center justify-center group-hover:border-blue-500/20 group-hover:scale-105 transition-all duration-300 shrink-0 ${item.color}`}
                            >
                              <Icon size={18} />
                            </motion.div>
                            <div className="text-left">
                              <p className="text-white font-bold text-[13px] tracking-tight group-hover:text-blue-400 transition-colors">{item.name}</p>
                              <p className="text-slate-400 text-[11px] mt-0.5 font-medium leading-normal">{item.desc}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {displayNavItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={`font-bold text-[13.5px] transition-all duration-300 px-4 py-1.5 rounded-full hover:bg-white/5 whitespace-nowrap bg-glass border hover:text-white hover:border-blue-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 ${
                    pathname === item.href
                      ? "text-white border-blue-500/40"
                      : "text-slate-400 border-white/10"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2 md:gap-4 relative z-50 shrink-0">
            {/* Language Switcher */}
            <div className="relative hidden sm:block">
              <label htmlFor="navbar-language" className="sr-only">Select language</label>
              <select
                id="navbar-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-glass border border-white/10 rounded-full px-3 py-1.5 text-xs text-slate-300 outline-none hover:bg-white/5 cursor-pointer transition font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
              >
                {LANGUAGES.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>

            {!user ? (
              <div className="flex items-center gap-3">
                <Link href="/login" className="hidden sm:block font-bold text-[13px] text-slate-400 hover:text-white transition-all duration-300 px-4">
                  {t("navbar.signin")}
                </Link>
                <Link href="/register">
                  <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-slate-950 font-bold text-[12px] sm:text-[13px] rounded-full hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-xl shadow-white/5 btn-glossy-gold"
                  >
                    {t("navbar.get_started")}
                  </motion.button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div ref={accountRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountOpen((open) => !open)}
                    aria-expanded={accountOpen}
                    aria-haspopup="menu"
                    aria-label="Open account menu"
                    className="w-10 h-10 rounded-xl bg-glass border border-white/10 p-1 hover:border-blue-500/50 transition duration-300 overflow-hidden flex items-center justify-center shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                  >
                    {user.profileImage ? (
                      <Image
                        src={user.profileImage}
                        alt=""
                        width={40}
                        height={40}
                        unoptimized
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="font-bold text-blue-500 text-base uppercase">{user.name?.[0] || "U"}</span>
                    )}
                  </button>

                  {/* PREMIUM DROPDOWN */}
                  <div
                    role="menu"
                    aria-label="Account menu"
                    aria-hidden={!accountOpen}
                    inert={!accountOpen}
                    className={`absolute right-0 top-full mt-4 w-72 bg-glass-strong border border-white/10 rounded-[32px] p-3 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] transition-all duration-300 transform origin-top-right backdrop-blur-3xl ${
                      accountOpen
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible translate-y-3 pointer-events-none"
                    }`}
                  >
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-5 py-6 border-b border-white/5 mb-2 bg-white/5 rounded-[24px]"
                    >
                      <p className="text-white font-bold text-[14px] truncate tracking-tight">{user.name}</p>
                      <p className="text-blue-500 text-[10px] truncate tracking-[0.2em] mt-1 uppercase font-black">{user.role}</p>
                    </motion.div>

                    <div className="space-y-1">
                      <Link
                        role="menuitem"
                        href={user.role === 'admin' ? '/admin' : (user.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard')}
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-4 px-5 py-4 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl text-[14px] transition font-bold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                      >
                        <LayoutDashboard size={18} className="text-blue-500/50" /> Dashboard
                      </Link>

                      <Link
                        role="menuitem"
                        href="/settings"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-4 px-5 py-4 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl text-[14px] transition font-bold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                      >
                        <User size={18} className="text-blue-500/50" /> Settings
                      </Link>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-5 py-4 text-red-400 hover:bg-red-500/5 rounded-2xl text-[14px] transition font-bold tracking-tight text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                      >
                        <LogOut size={18} /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 rounded-lg"
              aria-label={mobileMenuOpen ? "Close main menu" : "Open main menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
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
            id="mobile-menu"
            className="fixed inset-0 z-[9998] bg-glass-strong pt-24 pb-12 px-6 overflow-y-auto"
          >
            <div className="max-w-lg mx-auto space-y-10">
              <div className="space-y-4">
                <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] px-2 text-left">Navigation</p>
                <div className="grid grid-cols-1 gap-2">
                  
                  {/* Collapsible Services */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setMobileServicesOpen((open) => !open)}
                      aria-expanded={mobileServicesOpen}
                      aria-controls="mobile-services-menu"
                      className="flex items-center justify-between w-full p-4 rounded-2xl bg-glass border border-white/5 hover:border-blue-500/30 transition-all text-white font-bold text-[14px] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                    >
                      <span>Services</span>
                      <ChevronDown size={16} className={`transition-transform duration-300 ${mobileServicesOpen ? 'rotate-180 text-white' : 'text-slate-400'}`} />
                    </button>
                    
                    <AnimatePresence>
                      {mobileServicesOpen && (
                        <motion.div
                          id="mobile-services-menu"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden pl-4 pr-2 py-2 grid grid-cols-1 gap-2 mt-1 bg-white/[0.02] border border-white/5 rounded-2xl text-left"
                        >
                          {services.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                aria-current={pathname === item.href ? "page" : undefined}
                                className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 ${
                                  pathname === item.href ? "text-white bg-white/5" : "text-slate-300 hover:text-white"
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-lg bg-glass border border-white/5 flex items-center justify-center shrink-0 ${item.color}`}>
                                  <Icon size={16} />
                                </div>
                                <span className="font-bold text-[13px]">{item.name}</span>
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {displayNavItems.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={pathname === item.href ? "page" : undefined}
                        className={`flex items-center justify-between p-4 rounded-2xl bg-glass border transition-all text-white font-bold text-[14px] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 ${
                          pathname === item.href ? "border-blue-500/40" : "border-white/5 hover:border-blue-500/30"
                        }`}
                      >
                        <span>{item.name}</span>
                        <span aria-hidden="true">→</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="mobile-language" className="block px-2 text-left text-blue-500 font-black text-[10px] uppercase tracking-[0.4em]">
                  Language
                </label>
                <select
                  id="mobile-language"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="w-full bg-glass border border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-200 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                >
                  {LANGUAGES.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>

              {!user && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="pt-10 border-t border-white/10 flex flex-col gap-4"
                >
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-5 rounded-2xl bg-glass text-white font-bold text-center text-sm border border-white/10">Sign In</Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full py-5 rounded-2xl bg-white text-slate-950 font-bold text-center text-sm shadow-2xl btn-glossy-gold">Get Started</Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
