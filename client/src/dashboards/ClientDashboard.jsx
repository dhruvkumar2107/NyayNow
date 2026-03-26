'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import dynamic from 'next/dynamic';

const LegalReels = dynamic(() => import("../components/dashboard/LegalReels"), { ssr: false });
const CaseTimeline = dynamic(() => import("../components/dashboard/CaseTimeline"), { ssr: false });
const CalendarWidget = dynamic(() => import("../components/dashboard/CalendarWidget"), { ssr: false });
const TrustTimeline = dynamic(() => import("../components/dashboard/client/TrustTimeline"), { ssr: false });
const LegalConfessionBooth = dynamic(() => import("../components/dashboard/client/LegalConfessionBooth"), { ssr: false });
const BookingModal = dynamic(() => import("../components/dashboard/BookingModal"), { ssr: false });
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import PremiumLoader from "../components/PremiumLoader";
import { hasAccess } from "../utils/planBorders";
import PaywallModal from "../components/PaywallModal";

const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") || "http://localhost:4000");

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [activeCases, setActiveCases] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [suggestedLawyers, setSuggestedLawyers] = useState([]);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || 'overview'); // 'overview', 'cases', 'feed'

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const [posts, setPosts] = useState([]);
  const [newCase, setNewCase] = useState({ title: "", desc: "", budget: "" });
  const [showPostModal, setShowPostModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [connections, setConnections] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showInstantModal, setShowInstantModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState("");

  useEffect(() => {
    if (user) {
      const uId = user._id || user.id;

      // Load initial batch
      fetchMyCases();
      fetchPosts();
      fetchInvoices();
      fetchAppointments();
      fetchSuggestedLawyers();
      fetchConnections(uId);
      fetchNotifications(uId);

      socket.emit("join_room", uId);
      setLoading(false); // Move to non-blocking load

      socket.on("dashboard_alert", (notif) => {
        setNotifications(prev => [notif, ...prev]);
        toast.success("Alert: " + notif.message, { icon: '🔔' });
      });

      socket.on("consult_start", (payload) => {
        if (payload.role === "client") {
          toast.success(`Lawyer ${payload.lawyerName} accepted your consult! Redirecting...`, { duration: 5000 });
          router.push(`/meet/${payload.meetingId}`);
        }
      });

      return () => {
        socket.off("dashboard_alert");
        socket.off("consult_start");
      }
    }
  }, [user]);

  const fetchNotifications = async (uId) => {
    try {
      const res = await axios.get(`/api/notifications?userId=${uId}`);
      setNotifications(res.data);
    } catch (err) { console.error("Notif Error:", err); }
  };

  const handleMarkAllRead = async () => {
    try {
      const uId = user._id || user.id;
      await axios.put("/api/notifications/mark-all-read", { userId: uId });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) { console.error(err); }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read) {
        await axios.put(`/api/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      }
      if (notif.link) {
        router.push(notif.link);
        setShowNotifications(false);
      }
    } catch (err) { console.error(err); }
  };

  const fetchConnections = async (uId) => {
    try {
      const res = await axios.get(`/api/connections?userId=${uId}&status=all`);
      setConnections(res.data);
    } catch (err) { console.error("Connections Error:", err); }
  };

  const handleConnect = async (lawyerId) => {
    try {
      await axios.post("/api/connections", {
        clientId: user._id || user.id,
        lawyerId: lawyerId,
        initiatedBy: user._id || user.id
      });
      toast.success("Connection request sent!");
      fetchConnections(user._id || user.id);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to connect");
    }
  };

  const fetchSuggestedLawyers = async () => {
    try {
      const res = await axios.get("/api/users?role=lawyer");
      setSuggestedLawyers(res.data.slice(0, 4));
    } catch (err) { console.error(err); }
  }

  const fetchPosts = async () => {
    try {
      const res = await axios.get("/api/posts");
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Posts Fetch Error:", err);
      setPosts([]);
    }
  };

  const fetchMyCases = async () => {
    try {
      const identifier = user.phone || user.email || user._id;
      const res = await axios.get(`/api/cases?postedBy=${identifier}`);
      setActiveCases(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Cases Fetch Error:", err);
      setActiveCases([]);
    }
  };

  const myCases = activeCases; // Map activeCases to myCases for compatibility

  const fetchInvoices = async () => {
    try {
      const uId = user._id || user.id;
      const res = await axios.get(`/api/invoices?clientId=${uId}`);
      setInvoices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Invoices Fetch Error:", err);
      setInvoices([]);
    }
  };

  const fetchAppointments = async () => {
    try {
      const uId = user._id || user.id;
      const res = await axios.get(`/api/appointments?clientId=${uId}`);
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Appointments Fetch Error:", err);
      setAppointments([]);
    }
  };

  const handlePostCase = async () => {
    try {
      await axios.post("/api/cases", {
        ...newCase,
        client: user._id || user.id, // Real ID
        postedBy: user.phone || user.email,
        postedAt: new Date()
      });
      setShowPostModal(false);
      fetchMyCases();
      toast.success("Legal Matter Posted Successfully!");
    } catch (err) { toast.error("Failed to post case. Please try again."); }
  };

  const handleInstantConsult = () => {
    socket.emit("request_instant_consult", {
      clientId: user._id || user.id,
      clientName: user.name,
      category: "General Legal"
    });
    setShowInstantModal(true);
  };

  if (loading || !user) return <PremiumLoader text="Loading Workspace..." />;

  const activeCase = activeCases.find(c => c.stage !== 'Closed') || activeCases[0];

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-indigo-500/30">

      {/* SIDEBAR NAVIGATION (Fixed Left) */}
      <aside className="fixed left-0 top-0 h-screen w-72 bg-[#020617] border-r border-white/5 flex flex-col z-50">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gold-400 blur-[15px] opacity-10 group-hover:opacity-30 transition duration-500"></div>
              <img src="/logo.png" alt="NyayNow Logo" className="w-10 h-10 relative object-contain hover:scale-105 transition duration-300" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter transition-colors group-hover:text-indigo-400">NyayNow</span>
          </Link>

            <div className="space-y-1 mt-8">
            <NavItem icon="📊" label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavItem icon="⚖️" label="My Matters" active={activeTab === 'cases'} onClick={() => setActiveTab('cases')} />
            <NavItem icon="🤖" label="Judge AI" to="/judge-ai" locked={!hasAccess(user.plan, 'LEGAL_RESEARCH', user.aiUsage?.count)} onLocked={() => { setPaywallFeature("Judge AI Analysis"); setShowPaywall(true); }} badge={user.plan === 'free' && (user.aiUsage?.count || 0) === 0 ? "Trial" : ""} />
            <NavItem icon="📝" label="Drafting Lab" to="/drafting" locked={!hasAccess(user.plan, 'DOCUMENT_DRAFTING', user.aiUsage?.count)} onLocked={() => { setPaywallFeature("Document Drafting Lab"); setShowPaywall(true); }} badge={user.plan === 'free' && (user.aiUsage?.count || 0) === 0 ? "Trial" : ""} />
            <NavItem icon="🎙️" label="NyayVoice" to="/voice-assistant" badge={user.plan === 'free' && (user.aiUsage?.count || 0) === 0 ? "Trial" : "Live"} locked={!hasAccess(user.plan, 'NYAY_VOICE', user.aiUsage?.count)} onLocked={() => { setPaywallFeature("NyayVoice Assistant"); setShowPaywall(true); }} />
            <NavItem icon="⚔️" label="NyayCourt" to="/courtroom-battle" badge={user.plan === 'free' && (user.aiUsage?.count || 0) === 0 ? "Trial" : "New"} locked={!hasAccess(user.plan, 'NYAY_COURT', user.aiUsage?.count)} onLocked={() => { setPaywallFeature("NyayCourt Battle Simulator"); setShowPaywall(true); }} />
            <NavItem icon="🔍" label="Precedent Engine" to="/research" locked={!hasAccess(user.plan, 'LEGAL_RESEARCH', user.aiUsage?.count)} onLocked={() => { setPaywallFeature("Precedent Research Engine"); setShowPaywall(true); }} badge={user.plan === 'free' && (user.aiUsage?.count || 0) === 0 ? "Trial" : ""} />
            <NavItem icon="🛡️" label="Compliance Hub" to="/compliances" />
            <NavItem icon="📈" label="Analytics" to="/analytics" locked={!hasAccess(user.plan, 'silver')} onLocked={() => { setPaywallFeature("Deep Analytics"); setShowPaywall(true); }} />
            <NavItem icon="📄" label="Quantum Vault" to="/agreements" locked={!hasAccess(user.plan, 'gold')} onLocked={() => { setPaywallFeature("Agreement Vault"); setShowPaywall(true); }} />
            <NavItem icon="💬" label="Messages" to="/messages" />
            <NavItem icon="💳" label="Smart Escrow" active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />
            <NavItem icon="📡" label="Legal Feed" active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
            <div className="my-2 h-px bg-white/5" />
            <NavItem icon="🎭" label="Confession Booth" active={activeTab === 'confessions'} onClick={() => setActiveTab('confessions')} />
          </div>
        </div>

        <div className="mt-auto p-8 pt-0 relative">
          <div className="bg-[#1e293b]/50 rounded-xl p-4 border border-white/10 mb-6 backdrop-blur-sm cursor-pointer hover:bg-white/5 transition group" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg group-hover:scale-105 transition">
                {user.name?.[0]}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm leading-none mb-1">{user.name}</p>
                <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">{user.plan || "Premium"}</p>
              </div>
              <div className={`text-slate-400 transform transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}>▼</div>
            </div>
          </div>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-24 left-8 right-8 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 origin-bottom"
              >
                <div className="p-2 space-y-1">
                  <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1">My Account</div>
                  <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition">
                    <span>⚙️</span> Settings
                  </Link>
                  <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition">
                    <span>👤</span> Profile
                  </Link>
                  <div className="h-px bg-white/5 my-1"></div>
                  <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition text-left">
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="pl-72 pt-8 pr-8 pb-8 min-h-screen">

        {/* HEADER */}
        <header className="flex justify-between items-end mb-10 px-4 relative">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-cyan-400">{user.name?.split(' ')[0]}</span>
            </h1>
          </motion.div>
          <div className="flex items-center gap-6">
            {/* VIDEO CALL BUTTON (PRO) */}
            {/* <button
              onClick={handleInstantConsult}
              className="px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_8px_#818cf8]"></span>
              Secure Virtual Meeting
            </button> */}

            {/* NOTIFICATION BELL */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition relative"
              >
                <span>🔔</span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold animate-bounce">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-80 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden origin-top-right"
                  >
                    <div className="p-4 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent flex justify-between items-center">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Pulse Notifications</h4>
                      <button onClick={handleMarkAllRead} className="text-[10px] text-indigo-400 font-bold hover:underline">Mark read</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center opacity-30">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No new alerts</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition cursor-pointer ${!n.read ? 'bg-indigo-500/5' : ''}`}
                          >
                            <p className="text-xs text-white leading-relaxed font-medium">{n.message}</p>
                            <p className="text-[10px] text-slate-600 mt-2 font-bold uppercase tracking-wider">{new Date(n.createdAt).toLocaleTimeString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setShowPostModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-500 transition flex items-center gap-2 shadow-lg shadow-indigo-500/20 border border-indigo-500/50"
            >
              <span>+</span> New Legal Matter
            </button>
          </div>
        </header>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-12 gap-6 px-4">

          {/* PRIMARY CONTENT (8 COLS) */}
          {activeTab === 'overview' && (
            <div className="col-span-8 space-y-6">

              {/* HERO CARD: ACTIVE CASE */}
              <div className="bg-[#0f172a] rounded-3xl p-8 border border-white/10 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50 pointer-events-none group-hover:bg-indigo-500/20 transition duration-1000"></div>

                <div className="relative z-10 flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Active Matter</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {activeCase ? activeCase.title : "No Active Legal Matters"}
                    </h2>
                    <p className="text-slate-400 max-w-lg leading-relaxed">
                      {activeCase ? activeCase.desc : "Upload a new document to begin autonomous AI analysis."}
                    </p>
                  </div>
                  {activeCase && <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Budget</p>
                    <p className="text-3xl font-bold text-white">₹{activeCase.budget}</p>
                  </div>}
                </div>

                {
                  activeCase ? (
                    <div className="bg-[#1e293b]/50 rounded-2xl p-6 border border-white/5">
                      <TrustTimeline stage={activeCase.stage || 'New Lead'} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center hover:bg-white/10 hover:border-indigo-500/30 transition cursor-pointer group" onClick={() => setShowPostModal(true)}>
                        <div className="text-2xl mb-2 group-hover:scale-110 transition">📝</div>
                        <div className="font-bold text-sm text-white">Draft Contract</div>
                      </div>
                      {/* JUDGE AI MINI WIDGET */}
                      <div className="p-4 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl border border-indigo-500/30 text-center hover:scale-105 transition cursor-pointer group relative overflow-hidden" onClick={() => router.push('/judge-ai')}>
                        <div className="absolute inset-0 bg-indigo-500/10 animate-pulse"></div>
                        <div className="relative z-10">
                          <div className="text-2xl mb-2">⚖️</div>
                          <div className="font-bold text-sm text-white">Judge AI Scan</div>
                          <div className="text-[10px] text-indigo-300 mt-1">Check Win Probability</div>
                        </div>
                      </div>
                      {/* <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center hover:bg-white/10 hover:border-indigo-500/30 transition cursor-pointer group" onClick={() => router.push('/marketplace')}>
                        <div className="text-2xl mb-2 group-hover:scale-110 transition">🔍</div>
                        <div className="font-bold text-sm text-white">Find Lawyer</div>
                      </div> */}
                    </div>
                  )
                }
              </div>

              {/* REELS SECTION (PRO THEME) */}
              <LegalReels />

              {/* SECONDARY ROW: FEED & STATS */}
              <div className="grid grid-cols-2 gap-6 mt-8">
                {/* FEED SUMMARY */}
                <div className="bg-[#0f172a] rounded-3xl p-6 border border-white/10 shadow-lg h-[400px] overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center mb-4 sticky top-0 bg-[#0f172a] pb-2 border-b border-white/10 z-10">
                    <h3 className="font-bold text-lg text-white">Legal Pulse</h3>
                    <button onClick={() => setActiveTab('feed')} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:underline">View All</button>
                  </div>
                  <div className="space-y-4">
                    {posts.length === 0 ? (
                      <p className="text-center text-slate-500 py-10 text-xs">No pulse activity detected.</p>
                    ) : posts.slice(0, 5).map(post => (
                      <div key={post._id} className="pb-4 border-b border-white/5 last:border-0 hover:bg-white/5 p-3 -mx-3 rounded-xl transition cursor-pointer">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-300">{post.author?.name?.[0]}</div>
                          <span className="text-xs font-bold text-white">{post.author?.name}</span>
                          <span className="text-[10px] text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2">{post.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* QUICK STATS & BOOKINGS */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-indigo-900 to-[#0f172a] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-white/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20"></div>
                    <h3 className="font-bold text-lg mb-4 relative z-10">Financial Overview</h3>
                    <div className="flex justify-between items-end relative z-10">
                      <div>
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Total Spent</p>
                        <p className="text-3xl font-bold">₹{invoices.reduce((acc, i) => acc + (Number(i.amount) || 0), 0).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Pending</p>
                        <p className="text-xl font-bold text-amber-400">₹{invoices.filter(i => i.status !== 'paid').reduce((acc, i) => acc + (Number(i.amount) || 0), 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0f172a] rounded-3xl p-6 border border-white/10 shadow-lg flex-1">
                    <h3 className="font-bold text-lg text-white mb-4">Upcoming Meetings</h3>
                    {appointments.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-6">No meetings scheduled.</p>
                    ) : (
                      appointments.slice(0, 2).map(apt => (
                        <div key={apt._id} className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5 last:border-0 last:pb-0 last:mb-0">
                          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex flex-col items-center justify-center text-xs font-bold border border-indigo-500/20">
                            <span>{new Date(apt.date).getDate()}</span>
                            <span className="uppercase text-[8px]">{new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-white">{apt.lawyerName || apt.lawyerId?.name || "Legal Counsel"}</p>
                            <p className="text-xs text-slate-500">{apt.slot}</p>
                          </div>
                          {/* {(apt.status === 'confirmed' || apt.status === 'active') && (
                            <button
                              onClick={() => router.push(`/meet/${apt._id}`)}
                              className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-500 hover:text-white transition"
                            >
                              Join
                            </button>
                          )} */}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'cases' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-8 space-y-6">
              <div className="bg-[#0f172a] rounded-3xl p-8 border border-white/10 shadow-xl">
                <h3 className="font-bold text-2xl text-white mb-8">Active Case Files</h3>
                <div className="space-y-4">
                  {activeCases.length === 0 ? (
                    <div className="py-20 text-center opacity-30">
                      <p className="text-sm font-bold uppercase tracking-widest">No active litigation records</p>
                    </div>
                  ) : (
                    activeCases.map(c => (
                      <div key={c._id} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center hover:bg-indigo-500/10 transition cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-xl">⚖️</div>
                          <div>
                            <h4 className="text-white font-bold group-hover:text-indigo-400 transition">{c.title}</h4>
                            <p className="text-xs text-slate-500">{c.lawyerName || 'Awaiting Counsel'} • Updated {new Date(c.updatedAt || c.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded bg-indigo-500/10 text-indigo-400`}>{c.status || 'Active'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'feed' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-8 space-y-6">
              <div className="bg-[#0f172a] rounded-3xl p-8 border border-white/10 shadow-xl">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-bold text-2xl text-white tracking-tight">Legal Pulse</h3>
                  <button onClick={() => setShowPostModal(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20">Post Update</button>
                </div>

                <div className="space-y-6">
                  {posts.length === 0 ? (
                    <div className="py-20 text-center opacity-30">
                      <p className="text-sm font-bold uppercase tracking-widest text-slate-500">The legal feed is currently silent.</p>
                    </div>
                  ) : posts.map(post => (
                    <div key={post._id} className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition group">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-400 border border-indigo-500/30 shadow-inner">
                          {post.author?.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm leading-none mb-1">{post.author?.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(post.createdAt).toLocaleDateString()} • {post.author?.role}</p>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed mb-4">{post.content}</p>

                      {post.mediaUrl && (
                        <div className="rounded-xl overflow-hidden mb-4 border border-white/10 bg-black/40">
                          {post.type === 'reel' || post.mediaUrl.endsWith('.mp4') ? (
                            <video src={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") || "http://localhost:4000"}${post.mediaUrl}`} controls className="w-full max-h-[400px] object-contain" />
                          ) : (
                            <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") || "http://localhost:4000"}${post.mediaUrl}`} className="w-full object-cover" alt="Post media" />
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition">
                          <span>❤️</span> {post.likes?.length || 0} Likes
                        </button>
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition">
                          <span>💬</span> {post.comments?.length || 0} Comments
                        </button>
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition ml-auto">
                          <span>📤</span> Share
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'invoices' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-8 space-y-6">
              <div className="bg-[#0f172a] rounded-3xl p-8 border border-white/10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none"></div>

                <div className="flex justify-between items-center mb-8 relative z-10">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-2xl text-white tracking-tight">Smart Settlement Escrow</h3>
                      <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Web3 Secured
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Immutable Blockchain Ledger</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Locked In Escrow</p>
                    <p className="text-2xl font-black text-white tracking-tighter">₹{invoices.filter(i => i.status !== 'paid').reduce((acc, i) => acc + (Number(i.amount) || 0), 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  {invoices.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-30">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Your cryptographic vault is currently empty.</p>
                    </div>
                  ) : (
                    invoices.map(inv => (
                      <div key={inv._id} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center hover:bg-white/10 transition group">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {inv.status === 'paid' ? '✓' : '₹'}
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm">{inv.lawyerName || 'API Transaction'}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(inv.createdAt).toLocaleDateString()} • {inv.description || `Ref: ${inv._id.slice(-6)}`}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-white tracking-tight mb-1">₹{inv.amount}</p>
                          <div className="flex items-center gap-3">
                            <span className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                              {inv.status === 'paid' ? '🔒 SETTLED' : '🔓 PENDING LOCK'}
                            </span>
                            {inv.status !== 'paid' && (
                              <button
                                onClick={() => router.push(`/payment/${inv._id}`)}
                                className="text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:text-white hover:bg-emerald-600 px-3 py-1 rounded-lg border border-emerald-500/30 transition shadow-lg shadow-emerald-500/10"
                              >
                                Authorize Contract
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* CONFESSION BOOTH — Full Width */}
          {
            activeTab === 'confessions' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-12">
                <LegalConfessionBooth />
              </motion.div>
            )
          }

          {/* RIGHT SIDEBAR (4 COLS) — hidden on confession tab */}
          {
            activeTab !== 'confessions' && (
              <div className="col-span-4 space-y-6">
                {/* CALENDAR */}
                <div className="bg-[#0f172a] rounded-3xl p-4 border border-white/10 shadow-lg">
                  <CalendarWidget user={user} />
                </div>

                {/* SUGGESTED LAWYERS */}
                {/*
                <div className="bg-[#0f172a] rounded-3xl p-6 border border-white/10 shadow-lg">
                  <h3 className="font-bold text-lg text-white mb-4">Recommended Counsel</h3>
                  <div className="space-y-4">
                    {suggestedLawyers.map(l => {
                      const conn = connections.find(c => c._id === l._id);
                      return (
                        <div key={l._id} className="flex items-center gap-3 group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition">
                            {l.name?.[0]}
                          </div>
                          <div className="flex-1" onClick={() => router.push(`/lawyer/${l._id}`)}>
                            <h4 className="font-bold text-sm text-white group-hover:text-indigo-400 transition">{l.name}</h4>
                            <p className="text-xs text-slate-500">{l.specialization || "Legal Expert"}</p>
                          </div>
                          {conn ? (
                            <span className={`text-[10px] font-bold uppercase ${conn.connectionStatus === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {conn.connectionStatus}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleConnect(l._id)}
                              className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition"
                              title="Send Connection Request"
                            >
                              +
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => router.push('/marketplace')} className="w-full mt-6 py-3 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:bg-white/5 hover:text-white transition">
                    View Marketplace
                  </button>
                </div>
                */}
              </div>
            )
          }

        </div>
      </main >

      {/* MODAL FOR NEW CASE - Simple Glassmorphism */}
      {
        showPostModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPostModal(false)}></div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 max-w-lg w-full relative z-10 shadow-2xl">
              <h3 className="font-bold text-2xl text-white mb-6">Brief Your Legal Matter</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Case Title</label>
                  <input type="text" className="w-full p-4 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-indigo-500 text-white transition placeholder-slate-600" placeholder="e.g. Property Dispute in Delhi" value={newCase.title} onChange={e => setNewCase({ ...newCase, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Details</label>
                  <textarea rows="4" className="w-full p-4 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-indigo-500 text-white transition placeholder-slate-600" placeholder="Describe your situation..." value={newCase.desc} onChange={e => setNewCase({ ...newCase, desc: e.target.value })}></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Estimated Budget (INR)</label>
                  <input type="number" className="w-full p-4 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-indigo-500 text-white transition placeholder-slate-600" placeholder="5000" value={newCase.budget} onChange={e => setNewCase({ ...newCase, budget: e.target.value })} />
                </div>
                <button onClick={handlePostCase} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/25 mt-2">
                  Post Case
                </button>
              </div>
            </motion.div>
          </div>
        )
      }

      {
        showBookingModal && selectedLawyer && (
          <BookingModal
            lawyer={selectedLawyer}
            client={user}
            onClose={() => setShowBookingModal(false)}
          />
        )
      }

      {/* INSTANT CONSULT MODAL */}
      <AnimatePresence>
        {showInstantModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowInstantModal(false)}></div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#0f172a] border border-white/10 rounded-3xl p-10 max-w-md w-full relative z-10 shadow-2xl text-center">
              <div className="mb-6 relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-indigo-500 blur-[30px] opacity-20 animate-pulse"></div>
                <div className="relative bg-white/5 border border-white/10 w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-inner">⚖️</div>
              </div>
              <h3 className="font-bold text-2xl text-white mb-3">Broadcasting Secure Uplink</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                We are alerting our network of verified legal professionals. Stay on this screen; the first available expert will connect with you shortly.
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex justify-center gap-2 mb-2">
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 bg-indigo-500 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }} className="w-2 h-2 bg-indigo-500 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 1 }} className="w-2 h-2 bg-indigo-500 rounded-full" />
                </div>
                <button onClick={() => setShowInstantModal(false)} className="py-3 px-6 border border-white/10 rounded-xl text-slate-500 font-bold hover:text-white hover:bg-white/5 transition">
                  Cancel Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} title={`Upgrade for ${paywallFeature}`} />
    </div>
  );
}

function NavItem({ icon, label, to, active, onClick, badge }) {
  const router = useRouter();
  const handleClick = () => {
    if (onClick) onClick();
    if (to) router.push(to);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ${active ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-inner font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl opacity-80">{icon}</span>
        <span className="text-sm tracking-wide font-medium">{label}</span>
      </div>
      {badge && <span className="text-[9px] font-black bg-violet-500/20 text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded-md uppercase tracking-wider">{badge}</span>}
    </div>
  )
}
