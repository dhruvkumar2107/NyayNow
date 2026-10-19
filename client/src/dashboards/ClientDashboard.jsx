'use client'

import { useState, useEffect, useRef } from "react";
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
import { API_BASE, API_HOST } from "../config";
import {
  MIBackdrop,
  Panel,
  StatTile,
  Pill,
  SectionHeading,
  SidebarItem,
  GoldButton,
  GhostButton,
  Avatar,
  EmptySlot,
  AnimatedNumber,
  ProgressRing,
} from "../components/dashboard/mi/MIPrimitives";
import {
  LayoutDashboard,
  MessageSquare,
  Globe,
  Scale,
  FileText,
  Mic,
  Gavel,
  Search,
  Briefcase,
  DollarSign,
  Folder,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Bell,
  Plus,
  X,
  Calendar,
  Settings,
  User as UserIcon,
  LogOut,
} from "lucide-react";


export default function ClientDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const socketRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [activeCases, setActiveCases] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [suggestedLawyers, setSuggestedLawyers] = useState([]);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || 'overview'); // 'overview', 'cases', 'feed'

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "client") {
        router.push(user.role === "lawyer" ? "/lawyer/dashboard" : "/admin");
      }
    }
  }, [authLoading, user, router]);

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

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

      // Lazy socket init — only connect when user is authenticated
      const socket = io(
        API_HOST,
        { transports: ['websocket'], reconnectionAttempts: 3 }
      );
      socketRef.current = socket;

      socket.emit("join_room", uId);
      setLoading(false);

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
        socket.disconnect();
        socketRef.current = null;
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
      const res = await axios.get("/api/lawyers?all=true");
      setSuggestedLawyers(res.data.slice(0, 4));
    } catch (err) { console.error(err); }
  }

  const fetchPosts = async () => {
    try {
      const uId = user._id || user.id;
      const res = await axios.get(`/api/posts?userId=${uId}`);
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

  const handlePayAppointment = async (apt) => {
    const toastId = toast.loading("Initiating payment...");
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const loadScript = (src) => {
        return new Promise((resolve) => {
          if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
          const script = document.createElement("script");
          script.src = src;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const sdkLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!sdkLoaded) {
        toast.error("Razorpay SDK failed to load.", { id: toastId });
        return;
      }



      const orderRes = await fetch(`${API_BASE}/payments/create-order`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ amount_rupees: apt.fee, plan: `appointment_${apt._id}` })
      });

      if (!orderRes.ok) {
        const errText = await orderRes.text();
        throw new Error(`Failed to create order: ${orderRes.status} ${errText}`);
      }

      const orderData = await orderRes.json();

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "NyayNow",
        description: `Consultation Booking Payment`,
        order_id: orderData.orderId,
        handler: async function (paymentResponse) {
          toast.loading("Verifying payment...", { id: toastId });
          try {
            const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
              },
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                plan: `appointment_${apt._id}`,
                amount: apt.fee
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              toast.success(`Appointment confirmed and paid!`, { id: toastId, duration: 5000 });
              fetchAppointments();
            } else {
              toast.error("Payment verification failed", { id: toastId });
            }
          } catch (err) {
            console.error("Verification Error:", err);
            toast.error("Error verifying payment", { id: toastId });
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: {
          color: "#C9A24B"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      toast.dismiss(toastId);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Payment initiation failed", { id: toastId });
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
    if (socketRef.current) {
      socketRef.current.emit("request_instant_consult", {
        clientId: user._id || user.id,
        clientName: user.name,
        category: "General Legal"
      });
    }
    setShowInstantModal(true);
  };

  if (authLoading || loading || !user || user.role !== "client") return <PremiumLoader text="Loading Workspace..." />;

  const activeCase = activeCases.find(c => c.stage !== 'Closed') || activeCases[0];

  const totalSpent = invoices.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const pendingAmount = invoices.filter(i => i.status !== 'paid').reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const unread = notifications.filter(n => !n.read).length;
  const setupSteps = [
    { done: true, label: 'Account verified and initial setup complete' },
    { done: !!activeCase, label: 'Brief your first active legal matter', cta: { label: 'Brief Now', onClick: () => setShowPostModal(true) } },
    { done: false, label: 'Review experimental AI-assisted case analysis (not a validated outcome prediction)', cta: { label: 'Launch', to: '/judge-ai' } },
  ];
  const setupPct = Math.round((setupSteps.filter(s => s.done).length / setupSteps.length) * 100);

  return (
    <div className="relative min-h-screen bg-[var(--bg)] font-sans text-[var(--text)] selection:bg-[var(--gold)]/25">
      <MIBackdrop />

      {/* SIDEBAR NAVIGATION (Fixed Left) */}
      <aside className={`mi-scroll fixed left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-auto border-r border-[var(--gold-hairline)] bg-[var(--surface)]/80 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <Link href="/" className="group mb-8 flex items-center gap-3 px-2">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] bg-[var(--gold)]/10 text-[var(--gold)]">
              <Scale size={18} />
            </span>
            <span className="mi-body text-xl font-bold tracking-tight text-[var(--text)]">
              Nyay<span className="text-[var(--gold)]">Now</span>
            </span>
          </Link>

          <nav className="space-y-6">
            <div>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Workspace</p>
              <div className="space-y-1">
                <SidebarItem icon={<LayoutDashboard size={18} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                <SidebarItem icon={<MessageSquare size={18} />} label="Messages" to="/messages" />
                <SidebarItem icon={<Globe size={18} />} label="Legal Feed" active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
              </div>
            </div>

            <div>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">AI Legal Suite</p>
              <div className="space-y-1">
                <SidebarItem icon={<Scale size={18} />} label="Judge AI Scan" to="/judge-ai" locked={!hasAccess(user.plan, 'LEGAL_RESEARCH', user.aiUsage?.count)} onLocked={() => { setPaywallFeature("Judge AI Analysis"); setShowPaywall(true); }} badge={user.plan === 'free' && (user.aiUsage?.count || 0) === 0 ? "Trial" : ""} />
                <SidebarItem icon={<FileText size={18} />} label="Drafting Lab" to="/drafting" locked={!hasAccess(user.plan, 'DOCUMENT_DRAFTING', user.aiUsage?.count)} onLocked={() => { setPaywallFeature("Document Drafting Lab"); setShowPaywall(true); }} badge={user.plan === 'free' && (user.aiUsage?.count || 0) === 0 ? "Trial" : ""} />
                <SidebarItem icon={<Mic size={18} />} label="NyayVoice" to="/nyayvoice" badge={user.plan === 'free' && (user.aiUsage?.count || 0) === 0 ? "Trial" : "Live"} locked={!hasAccess(user.plan, 'NYAY_VOICE', user.aiUsage?.count)} onLocked={() => { setPaywallFeature("NyayVoice Assistant"); setShowPaywall(true); }} />
                <SidebarItem icon={<Gavel size={18} />} label="NyayCourt Arena" to="/nyaycourt-simulator" badge={user.plan === 'free' && (user.aiUsage?.count || 0) === 0 ? "Trial" : "New"} locked={!hasAccess(user.plan, 'NYAY_COURT', user.aiUsage?.count)} onLocked={() => { setPaywallFeature("NyayCourt Battle Simulator"); setShowPaywall(true); }} />
                <SidebarItem icon={<Search size={18} />} label="Precedent Search" to="/research" locked={!hasAccess(user.plan, 'LEGAL_RESEARCH', user.aiUsage?.count)} onLocked={() => { setPaywallFeature("Precedent Research Engine"); setShowPaywall(true); }} badge={user.plan === 'free' && (user.aiUsage?.count || 0) === 0 ? "Trial" : ""} />
              </div>
            </div>

            <div>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Cases & Escrow</p>
              <div className="space-y-1">
                <SidebarItem icon={<Briefcase size={18} />} label="My Matters" active={activeTab === 'cases'} onClick={() => setActiveTab('cases')} count={activeCases.length} />
                <SidebarItem icon={<DollarSign size={18} />} label="Smart Escrow" active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />
                <SidebarItem icon={<Folder size={18} />} label="Quantum Vault" to="/agreements" locked={!hasAccess(user.plan, 'gold')} onLocked={() => { setPaywallFeature("Agreement Vault"); setShowPaywall(true); }} />
              </div>
            </div>

            <div>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Utilities</p>
              <div className="space-y-1">
                <SidebarItem icon={<ShieldCheck size={18} />} label="Compliance Hub" to="/compliances" />
                <SidebarItem icon={<TrendingUp size={18} />} label="Analytics" to="/analytics" locked={!hasAccess(user.plan, 'silver')} onLocked={() => { setPaywallFeature("Deep Analytics"); setShowPaywall(true); }} />
                <SidebarItem icon={<Sparkles size={18} />} label="Confessions" active={activeTab === 'confessions'} onClick={() => setActiveTab('confessions')} />
              </div>
            </div>
          </nav>
        </div>

        <div className="relative mt-auto p-6 pt-0">
          <div className="mi-glass-card cursor-pointer p-4 transition hover:border-[var(--gold)]/50" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <div className="flex items-center gap-3">
              <Avatar name={user.name} size={40} />
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-[var(--text)]">{user.name}</p>
                <Pill tone="gold" className="mt-0.5">{(user.plan || 'free').toUpperCase()}</Pill>
              </div>
              <span className={`text-[var(--text-muted)] transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}>▾</span>
            </div>
          </div>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                className="mi-glass-card absolute bottom-24 left-6 right-6 z-50 origin-bottom overflow-hidden p-2"
              >
                <div className="mb-1 border-b border-[var(--gold-hairline)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">My Account</div>
                <Link href="/settings" className="flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text)] transition hover:bg-[var(--surface-2)]">
                  <Settings size={15} /> Settings
                </Link>
                <Link href="/profile" className="flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text)] transition hover:bg-[var(--surface-2)]">
                  <UserIcon size={15} /> Profile
                </Link>
                <div className="mi-hairline my-1" />
                <button onClick={logout} className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm text-[var(--sos)] transition hover:bg-[color-mix(in_srgb,var(--sos)_12%,transparent)]">
                  <LogOut size={15} /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="relative z-10 min-h-screen px-4 pb-10 pt-8 sm:px-6 lg:pl-72 lg:pr-8">

        {/* HEADER */}
        <header className="mb-8 flex items-end justify-between gap-4 px-2">
          <button
            className="mi-focus fixed left-4 top-4 z-[60] rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] bg-[var(--surface)]/80 p-2.5 text-[var(--text-muted)] backdrop-blur-xl transition hover:text-[var(--text)] lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--gold)]">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="mi-display text-2xl font-bold leading-tight sm:text-4xl">
              Welcome back, <span className="mi-gold-headline">{user.name?.split(' ')[0]}</span>
            </h1>
          </motion.div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="mi-focus relative rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface)]/70 p-3 text-[var(--text-muted)] transition hover:text-[var(--text)]"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--sos)] px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    className="mi-glass-card absolute right-0 z-50 mt-4 w-80 origin-top-right overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-[var(--gold-hairline)] px-4 py-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text)]">Notifications</h4>
                      <button onClick={handleMarkAllRead} className="text-[10px] font-semibold text-[var(--gold)] hover:underline">Mark read</button>
                    </div>
                    <div className="mi-scroll max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">No new alerts</div>
                      ) : (
                        notifications.map(n => (
                          <button
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`block w-full border-b border-[var(--gold-hairline)] px-4 py-3 text-left transition last:border-0 hover:bg-[var(--surface-2)]/60 ${!n.read ? 'bg-[var(--gold)]/5' : ''}`}
                          >
                            <p className="text-xs leading-relaxed text-[var(--text)]">{n.message}</p>
                            <p className="mt-1.5 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{new Date(n.createdAt).toLocaleTimeString()}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <GoldButton onClick={() => setShowPostModal(true)}>
              <Plus size={16} /> <span className="hidden sm:inline">New Legal Matter</span><span className="sm:hidden">New</span>
            </GoldButton>
          </div>
        </header>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* PRIMARY CONTENT (8 COLS) */}
          {activeTab === 'overview' && (
            <div className="col-span-1 space-y-6 lg:col-span-8">

              {/* GETTING STARTED CHECKLIST */}
              <Panel
                title="Getting Started"
                subtitle="Complete these steps to maximize your platform benefits"
                icon={<Sparkles size={16} />}
                action={<Pill tone={setupPct === 100 ? 'emerald' : 'gold'}>{setupPct}% complete</Pill>}
              >
                <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-soft)] transition-all duration-700" style={{ width: `${setupPct}%` }} />
                </div>
                <div className="space-y-3">
                  {setupSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-[var(--text)]">
                      <span className={step.done ? 'text-[var(--emerald)]' : 'text-[var(--text-muted)]'}>{step.done ? '✓' : '○'}</span>
                      <span className={step.done ? 'text-[var(--text-muted)] line-through' : ''}>{step.label}</span>
                      {step.cta && (
                        step.cta.to
                          ? <Link href={step.cta.to} className="ml-auto text-[10px] font-semibold text-[var(--gold)] hover:underline">{step.cta.label} →</Link>
                          : <button onClick={step.cta.onClick} className="ml-auto text-[10px] font-semibold text-[var(--gold)] hover:underline">{step.cta.label} →</button>
                      )}
                    </div>
                  ))}
                </div>
              </Panel>

              {/* HERO CARD: ACTIVE CASE */}
              <Panel hover={false} className="relative">
                <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-[var(--gold)]/5 blur-3xl" />
                <div className="relative z-10 mb-6 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--emerald)] shadow-[0_0_10px_var(--emerald)]" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--emerald)]">Active Matter Status</span>
                    </div>
                    <h2 className="mi-body text-xl font-semibold text-[var(--text)]">
                      {activeCase ? activeCase.title : "No Active Matters"}
                    </h2>
                    <p className="mt-1 max-w-lg text-xs leading-relaxed text-[var(--text-muted)]">
                      {activeCase ? activeCase.desc : "Brief your legal case or use the AI workspace suite to start."}
                    </p>
                  </div>
                  {activeCase && (
                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Budget</p>
                      <p className="text-2xl font-bold text-[var(--text)]">₹{activeCase.budget}</p>
                    </div>
                  )}
                </div>

                {activeCase ? (
                  <div className="relative z-10 rounded-[var(--radius-lg)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/40 p-5">
                    <TrustTimeline stage={activeCase.stage || 'New Lead'} />
                  </div>
                ) : (
                  <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <button onClick={() => setShowPostModal(true)} className="mi-card-hover mi-focus rounded-[var(--radius-lg)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/40 p-4 text-center">
                      <div className="mb-1.5 text-xl">📝</div>
                      <div className="text-xs font-semibold text-[var(--text)]">Brief New Case Matter</div>
                      <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">Browse lawyer profiles; verify credentials independently</p>
                    </button>
                    <button onClick={() => router.push('/judge-ai')} className="mi-card-hover mi-focus relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--gold-hairline)] bg-gradient-to-br from-[var(--gold)]/10 to-transparent p-4 text-center">
                      <div className="mb-1.5 text-xl">⚖️</div>
                      <div className="text-xs font-semibold text-[var(--text)]">Judge AI Case Analysis</div>
                      <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">Experimental — not a validated outcome prediction</p>
                    </button>
                  </div>
                )}
              </Panel>

              <Panel hover={false} title="Legal Reels" subtitle="Short-form intelligence" icon={<Sparkles size={16} />}>
                <LegalReels />
              </Panel>

              {/* SECONDARY ROW */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* FEED SUMMARY */}
                <Panel hover={false} title="Legal Pulse" subtitle="Community activity" icon={<Globe size={16} />} action={<button onClick={() => setActiveTab('feed')} className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)] hover:underline">View All</button>} className="flex h-[400px] flex-col">
                  <div className="mi-scroll h-full space-y-3 overflow-y-auto pr-1">
                    {posts.length === 0 ? (
                      <EmptySlot icon="🌐" title="No pulse activity detected" hint="Community updates will appear here." />
                    ) : posts.slice(0, 5).map(post => (
                      <div key={post._id} className="rounded-[var(--radius-md)] border border-[var(--gold-hairline)] p-3 transition hover:bg-[var(--surface-2)]/50">
                        <div className="mb-2 flex items-center gap-2">
                          <Avatar name={post.author?.name} size={22} />
                          <span className="text-xs font-semibold text-[var(--text)]">{post.author?.name}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="line-clamp-2 text-sm text-[var(--text-muted)]">{post.content}</p>
                      </div>
                    ))}
                  </div>
                </Panel>

                {/* QUICK STATS & BOOKINGS */}
                <div className="space-y-6">
                  <Panel hover={false} className="bg-gradient-to-br from-[var(--gold)]/10 to-transparent">
                    <h3 className="mi-body mb-4 text-base font-semibold text-[var(--text)]">Financial Overview</h3>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Total Spent</p>
                        <p className="text-3xl font-bold text-[var(--text)]"><AnimatedNumber value={totalSpent} prefix="₹" /></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Pending</p>
                        <p className="text-xl font-bold text-[var(--warn)]"><AnimatedNumber value={pendingAmount} prefix="₹" /></p>
                      </div>
                    </div>
                  </Panel>

                  <Panel hover={false} title="Upcoming Meetings" icon={<Calendar size={16} />}>
                    {appointments.length === 0 ? (
                      <p className="py-6 text-center text-sm text-[var(--text-muted)]">No meetings scheduled.</p>
                    ) : (
                      appointments.slice(0, 2).map(apt => (
                        <div key={apt._id} className="mb-3 flex items-center gap-3 border-b border-[var(--gold-hairline)] pb-3 last:mb-0 last:border-0 last:pb-0">
                          <div className="flex h-10 w-10 flex-col items-center justify-center rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] bg-[var(--gold)]/10 text-xs font-bold text-[var(--gold)]">
                            <span>{new Date(apt.date).getDate()}</span>
                            <span className="text-[8px] uppercase">{new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[var(--text)]">{apt.lawyerName || apt.lawyerId?.name || "Legal Counsel"}</p>
                            <p className="text-xs text-[var(--text-muted)]">{apt.slot}</p>
                          </div>
                          {apt.paymentStatus === 'unpaid' && (apt.fee || 0) > 0 ? (
                            <button onClick={() => handlePayAppointment(apt)} className="rounded-lg border border-[color-mix(in_srgb,var(--warn)_40%,transparent)] bg-[color-mix(in_srgb,var(--warn)_12%,transparent)] px-3 py-1.5 text-[10px] font-bold uppercase text-[var(--warn)] transition hover:brightness-110">Pay</button>
                          ) : (apt.status === 'confirmed' || apt.status === 'completed' || (apt.fee || 0) === 0) && (
                            <button onClick={() => router.push(`/meet/${apt._id}`)} className="rounded-lg border border-[color-mix(in_srgb,var(--emerald)_40%,transparent)] bg-[color-mix(in_srgb,var(--emerald)_12%,transparent)] px-3 py-1.5 text-[10px] font-bold uppercase text-[var(--emerald)] transition hover:brightness-110">Join</button>
                          )}
                        </div>
                      ))
                    )}
                  </Panel>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'cases' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-1 space-y-6 lg:col-span-8">
              <Panel title="Active Case Files" subtitle={`${activeCases.length} matters`} icon={<Briefcase size={16} />}>
                <div className="space-y-3">
                  {activeCases.length === 0 ? (
                    <EmptySlot icon="⚖️" title="No active litigation records" hint="Brief a new matter to begin." />
                  ) : (
                    activeCases.map(c => (
                      <div key={c._id} className="mi-card-hover group flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 p-4">
                        <div className="flex items-center gap-4">
                          <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] bg-[var(--gold)]/10 text-xl">⚖️</span>
                          <div>
                            <h4 className="font-semibold text-[var(--text)] transition group-hover:text-[var(--gold)]">{c.title}</h4>
                            <p className="text-xs text-[var(--text-muted)]">{c.lawyerName || 'Awaiting Counsel'} • Updated {new Date(c.updatedAt || c.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Pill tone="gold">{c.status || 'Active'}</Pill>
                      </div>
                    ))
                  )}
                </div>
              </Panel>
            </motion.div>
          )}

          {activeTab === 'feed' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-1 space-y-6 lg:col-span-8">
              <Panel
                title="Legal Pulse"
                subtitle="Community insights & intelligence"
                icon={<Globe size={16} />}
                action={<GoldButton onClick={() => setShowPostModal(true)}><Plus size={14} /> Post Update</GoldButton>}
              >
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <EmptySlot icon="🌐" title="The legal feed is currently silent" hint="Be the first to share an update." />
                  ) : posts.map(post => (
                    <div key={post._id} className="rounded-[var(--radius-lg)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 p-5">
                      <div className="mb-4 flex items-center gap-3">
                        <Avatar name={post.author?.name || 'U'} size={40} />
                        <div>
                          <p className="text-sm font-semibold text-[var(--text)]">{post.author?.name}</p>
                          <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{new Date(post.createdAt).toLocaleDateString()} • {post.author?.role}</p>
                        </div>
                      </div>
                      <p className="mb-4 text-sm leading-relaxed text-[var(--text-muted)]">{post.content}</p>

                      {post.mediaUrl && (
                        <div className="mb-4 overflow-hidden rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-black/40">
                          {post.type === 'reel' || post.mediaUrl.endsWith('.mp4') ? (
                            <video src={`${API_HOST}${post.mediaUrl}`} controls className="max-h-[400px] w-full object-contain" />
                          ) : (
                            <img src={`${API_HOST}${post.mediaUrl}`} className="w-full object-cover" alt="Post media" />
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-6 border-t border-[var(--gold-hairline)] pt-4">
                        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] transition hover:text-[var(--gold)]">❤️ {post.likes?.length || 0} Likes</button>
                        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] transition hover:text-[var(--gold)]">💬 {post.comments?.length || 0} Comments</button>
                        <button className="ml-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] transition hover:text-[var(--gold)]">📤 Share</button>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </motion.div>
          )}

          {activeTab === 'invoices' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-1 space-y-6 lg:col-span-8">
              <Panel
                title="Smart Settlement Escrow"
                subtitle="Track and authorise settlement milestones"
                icon={<DollarSign size={16} />}
                action={<Pill tone="emerald">Secure</Pill>}
              >
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Pending settlement</p>
                  <p className="text-2xl font-bold text-[var(--text)]"><AnimatedNumber value={pendingAmount} prefix="₹" /></p>
                </div>

                <div className="space-y-3">
                  {invoices.length === 0 ? (
                    <EmptySlot icon="₹" title="Your vault is currently empty" hint="Invoices issued by your counsel appear here." />
                  ) : (
                    invoices.map(inv => (
                      <div key={inv._id} className="mi-card-hover flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 p-5">
                        <div className="flex items-center gap-4">
                          <span className={`flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] border font-bold ${inv.status === 'paid' ? 'border-[color-mix(in_srgb,var(--emerald)_40%,transparent)] bg-[color-mix(in_srgb,var(--emerald)_12%,transparent)] text-[var(--emerald)]' : 'border-[color-mix(in_srgb,var(--warn)_40%,transparent)] bg-[color-mix(in_srgb,var(--warn)_12%,transparent)] text-[var(--warn)]'}`}>
                            {inv.status === 'paid' ? '✓' : '₹'}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text)]">{inv.lawyerName || 'API Transaction'}</p>
                            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{new Date(inv.createdAt).toLocaleDateString()} • {inv.description || `Ref: ${inv._id.slice(-6)}`}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="mb-1 text-xl font-bold text-[var(--text)]">₹{inv.amount}</p>
                          <div className="flex items-center gap-3">
                            <Pill tone={inv.status === 'paid' ? 'emerald' : 'warn'}>{inv.status === 'paid' ? 'Settled' : 'Pending'}</Pill>
                            {inv.status !== 'paid' && (
                              <button onClick={() => router.push(`/payment/${inv._id}`)} className="rounded-lg border border-[var(--gold-hairline)] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[var(--gold)] transition hover:bg-[var(--gold)]/10">
                                Authorize
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Panel>
            </motion.div>
          )}

          {/* CONFESSION BOOTH — Full Width */}
          {activeTab === 'confessions' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-1 lg:col-span-12">
              <LegalConfessionBooth />
            </motion.div>
          )}

          {/* RIGHT SIDEBAR (4 COLS) — hidden on confession tab */}
          {activeTab !== 'confessions' && (
            <div className="col-span-1 space-y-6 lg:col-span-4">
              <Panel hover={false} title="Schedule" subtitle="Your calendar" icon={<Calendar size={16} />}>
                <CalendarWidget user={user} />
              </Panel>

              <Panel hover={false} title="Readiness" subtitle="Setup progress" icon={<TrendingUp size={16} />}>
                <div className="flex items-center gap-5">
                  <ProgressRing value={setupPct} label="Setup" />
                  <div className="space-y-1 text-xs text-[var(--text-muted)]">
                    <p className="text-[var(--text)]">{setupSteps.filter(s => s.done).length} of {setupSteps.length} steps done</p>
                    <p>Finish setup to unlock the full workspace.</p>
                  </div>
                </div>
              </Panel>
            </div>
          )}

        </div>
      </main>

      {/* MODAL FOR NEW CASE */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPostModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="mi-glass-card relative z-10 w-full max-w-lg p-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="mi-body text-xl font-semibold text-[var(--text)]">Brief Your Legal Matter</h3>
                <button onClick={() => setShowPostModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text)]"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Case Title</label>
                  <input type="text" className="mi-focus w-full rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-transparent p-4 text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]" placeholder="e.g. Property Dispute in Delhi" value={newCase.title} onChange={e => setNewCase({ ...newCase, title: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Details</label>
                  <textarea rows="4" className="mi-focus w-full rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-transparent p-4 text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]" placeholder="Describe your situation..." value={newCase.desc} onChange={e => setNewCase({ ...newCase, desc: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Estimated Budget (INR)</label>
                  <input type="number" className="mi-focus w-full rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-transparent p-4 text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]" placeholder="5000" value={newCase.budget} onChange={e => setNewCase({ ...newCase, budget: e.target.value })} />
                </div>
                <GoldButton onClick={handlePostCase} className="w-full">Post Case</GoldButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showBookingModal && selectedLawyer && (
        <BookingModal
          lawyer={selectedLawyer}
          client={user}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {/* INSTANT CONSULT MODAL */}
      <AnimatePresence>
        {showInstantModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowInstantModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="mi-glass-card relative z-10 w-full max-w-md p-10 text-center">
              <div className="relative mx-auto mb-6 h-24 w-24">
                <div className="absolute inset-0 animate-pulse rounded-full bg-[var(--gold)]/20 blur-[30px]" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[var(--gold-hairline)] bg-[var(--surface-2)]/60 text-4xl">⚖️</div>
              </div>
              <h3 className="mi-body mb-3 text-xl font-semibold text-[var(--text)]">Broadcasting Secure Uplink</h3>
              <p className="mb-8 text-sm leading-relaxed text-[var(--text-muted)]">
                This demo request does not confirm that an advocate has been contacted or will respond. Use the marketplace to browse profiles and confirm availability directly.
              </p>
              <GhostButton onClick={() => setShowInstantModal(false)} className="w-full">Cancel Request</GhostButton>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} title={`Upgrade for ${paywallFeature}`} />
    </div>
  );
}
