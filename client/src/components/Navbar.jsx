import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAVIGATION_ITEMS = [
  {
    label: "Products",
    href: "#",
    dropdown: [
      {
        name: "Judge AI",
        href: "/judge-ai",
        desc: "Predict case outcomes with AI",
        icon: (
          <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        )
      },
      {
        name: "NyayVoice",
        href: "/voice-assistant",
        desc: "Multilingual voice assistance",
        icon: (
          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )
      },
      {
        name: "Smart Drafter",
        href: "/agreements",
        desc: "Draft legal documents instantly",
        icon: (
          <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      },
      {
        name: "AI Assistant",
        href: "/assistant",
        desc: "24/7 Legal Expert Chat",
        icon: (
          <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )
      },
    ]
  },
  {
    label: "Marketplace",
    href: "#",
    dropdown: [
      {
        name: "Find Lawyers",
        href: "/marketplace",
        desc: "Browse verified top-tier experts",
        icon: (
          <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )
      },
      {
        name: "Nearby Help",
        href: "/nearby",
        desc: "Locate courts & police stations",
        icon: (
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      },
      {
        name: "Consultations",
        href: "/messages",
        desc: "Secure video calls & chat",
        icon: (
          <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )
      },
    ]
  },
  {
    label: "Resources",
    href: "#",
    dropdown: [
      {
        name: "Pricing",
        href: "/pricing",
        desc: "Plans for every need",
        icon: (
          <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      {
        name: "Community",
        href: "#",
        desc: "Join the legal revolution (Soon)",
        icon: (
          <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      },
    ]
  }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleMouseEnter = (index) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredIndex(null);
    }, 200); // Slight delay for better UX
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 h-[72px] flex items-center ${scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20" : "bg-white/50 backdrop-blur-sm border-b border-transparent"}`}>
      <div className="max-w-7xl w-full mx-auto px-6 h-full flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 relative z-50">
          <img src="/logo.png" alt="NyayNow" className="h-10 w-auto object-contain transition-transform hover:scale-105" />
        </Link>

        {/* DESKTOP MEGA MENU */}
        <div className="hidden lg:flex items-center gap-8 h-full">
          {NAVIGATION_ITEMS.map((item, index) => (
            <div
              key={index}
              className="relative h-full flex items-center"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              <button className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${hoveredIndex === index ? "text-blue-600" : "text-slate-600 hover:text-slate-900"}`}>
                {item.label}
                <svg className={`w-4 h-4 transition-transform duration-200 ${hoveredIndex === index ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* DROPDOWN FLYOUT */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 transform origin-top ${hoveredIndex === index ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2 pointer-events-none"}`}
              >
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 w-[320px] grid gap-2 relative z-50">
                  {/* Little Arrow */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-t border-l border-slate-100"></div>

                  {item.dropdown.map((subItem, idx) => (
                    <Link
                      key={idx}
                      to={subItem.href}
                      className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group relative z-10"
                    >
                      <div className="mt-1 p-2 bg-slate-50 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all text-slate-600 group-hover:text-blue-600">
                        {subItem.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700">{subItem.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{subItem.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: AUTH & ACTIONS */}
        <div className="flex items-center gap-4 relative z-50">
          {!user ? (
            <>
              <Link to="/login" className="hidden sm:block text-slate-600 font-bold hover:text-slate-900 text-sm transition-colors">Log in</Link>
              <Link to="/register" className="px-5 py-2.5 bg-[#0B1120] text-white font-bold text-sm rounded-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95">
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to={user.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard"} className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors">
                <span>Dashboard</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>

              <div className="relative group">
                <button className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-100 flex items-center justify-center text-sm shadow-sm hover:ring-2 hover:ring-blue-100 transition-all">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </button>
                {/* User Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col p-1.5 z-50 origin-top-right transform">
                  <div className="px-3 py-2 border-b border-slate-50 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">Hi, {user.name}</p>
                  </div>
                  <Link to={user.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard"} className="px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-700 text-sm font-medium rounded-lg flex items-center gap-2 transition">
                    📊 Dashboard
                  </Link>
                  <button onClick={handleLogout} className="px-3 py-2 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg text-left flex items-center gap-2 transition">
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU (Full Screen Overlay) */}
      <div
        data-lenis-prevent
        className={`lg:hidden fixed inset-0 top-[72px] bg-white z-40 transition-all duration-300 overflow-y-auto ${mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
      >
        <div className="p-6 space-y-2 pb-20">
          {NAVIGATION_ITEMS.map((item, index) => (
            <MobileMenuItem key={index} item={item} closeMenu={() => setMobileMenuOpen(false)} />
          ))}

          <div className="h-px bg-slate-100 my-4"></div>

          <div className="flex flex-col gap-3">
            {!user && (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3.5 text-slate-800 font-bold bg-slate-100 rounded-xl">Log in</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3.5 bg-[#0B1120] text-white font-bold rounded-xl shadow-lg">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function MobileMenuItem({ item, closeMenu }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden active:scale-[0.99] transition-transform">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition"
      >
        <span className="font-bold text-slate-900">{item.label}</span>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="p-2 space-y-1 bg-white border-t border-slate-100">
            {item.dropdown.map((subItem, idx) => (
              <Link
                key={idx}
                to={subItem.href}
                onClick={closeMenu}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="p-1.5 bg-slate-50 rounded-md text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition">
                  {subItem.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 group-hover:text-blue-700">{subItem.name}</p>
                  <p className="text-[10px] text-slate-400 leading-tight">{subItem.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
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
