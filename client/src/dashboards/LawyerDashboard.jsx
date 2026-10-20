'use client'

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import dynamic from 'next/dynamic';

const KanbanBoard = dynamic(() => import("../components/dashboard/KanbanBoard"), { ssr: false });
const CalendarWidget = dynamic(() => import("../components/dashboard/CalendarWidget"), { ssr: false });
const WorkloadMonitor = dynamic(() => import("../components/dashboard/lawyer/WorkloadMonitor"), { ssr: false });
const CaseIntelligencePanel = dynamic(() => import("../components/dashboard/lawyer/CaseIntelligencePanel"), { ssr: false });
const ClientCRM = dynamic(() => import("../components/dashboard/lawyer/ClientCRM"), { ssr: false });
const LegalNoticeGenerator = dynamic(() => import("../components/dashboard/lawyer/LegalNoticeGenerator"), { ssr: false });
const LegalReels = dynamic(() => import("../components/dashboard/LegalReels"), { ssr: false });
const LegalResearchHub = dynamic(() => import("../components/dashboard/lawyer/LegalResearchHub"), { ssr: false });
const ECourtsWidget = dynamic(() => import("../components/dashboard/lawyer/ECourtsWidget"), { ssr: false });
const LawyerMattersPanel = dynamic(
  () => import("../components/dashboard/MatterWorkspace").then((m) => m.LawyerMattersPanel),
  { ssr: false }
);

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { API_HOST } from "../config";
import PremiumLoader from "../components/PremiumLoader";
import {
  MIBackdrop,
  Panel,
  StatTile,
  Pill,
  SidebarItem,
  GoldButton,
  GhostButton,
  Avatar,
  EmptySlot,
  AnimatedNumber,
} from "../components/dashboard/mi/MIPrimitives";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  FileText,
  Gavel,
  Zap,
  Shield,
  Bell,
  TrendingUp,
  DollarSign,
  Briefcase,
  ChevronDown,
  LogOut,
  Settings,
  User as UserIcon,
  BookOpen,
  Globe,
  X,
  FolderPlus,
} from "lucide-react";


export default function LawyerDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "lawyer") {
        router.push(user.role === "client" ? "/client/dashboard" : "/admin");
      }
    }
  }, [authLoading, user, router]);

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "board");
  const [leads, setLeads] = useState([]);
  const [acceptedCases, setAcceptedCases] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [crmData, setCrmData] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ clientId: "", amount: "", description: "" });
  const [connections, setConnections] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      const uId = user._id || user.id;

      // Load initial batch
      fetchLeads();
      fetchAcceptedCases(uId);
      fetchAppointments(uId);
      fetchInvoices(uId);
      fetchNotifications(uId);
      fetchConnections(uId);
      fetchLawyers();

      // Async background load for heavy data
      axios.get(`/api/crm/insights?userId=${uId}`)
        .then(res => setCrmData(res.data))
        .catch(err => null)
        .finally(() => setLoading(false));

      // Lazy socket init — only when user is ready
      const socket = io(
        API_HOST,
        { transports: ['websocket'], reconnectionAttempts: 3 }
      );
      socketRef.current = socket;

      socket.emit("join_room", uId);
      socket.emit("join_lawyer_pool");

      socket.on("dashboard_alert", (notif) => {
        setNotifications(prev => [notif, ...prev]);
        toast.success("New Alert: " + notif.message, { icon: '🔔' });
      });

      socket.on("incoming_lead", (payload) => {
        toast((t) => (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="font-bold text-sm">Instant Consult Request</span>
            </div>
            <p className="text-xs text-slate-600">Client: {payload.clientName}</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (socketRef.current) {
                    socketRef.current.emit("accept_consult", {
                      lawyerId: uId,
                      clientId: payload.clientId,
                      lawyerName: user.name
                    });
                  }
                  toast.dismiss(t.id);
                }}
                className="bg-indigo-600 text-white px-3 py-1 rounded text-[10px] font-bold uppercase"
              >
                Accept
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="bg-slate-200 text-slate-600 px-3 py-1 rounded text-[10px] font-bold uppercase"
              >
                Ignore
              </button>
            </div>
          </div>
        ), { duration: 10000, position: 'top-right' });
      });

      socket.on("consult_start", (payload) => {
        if (payload.role === "lawyer") {
          router.push(`/meet/${payload.meetingId}`);
        }
      });

      return () => {
        socket.off("dashboard_alert");
        socket.off("incoming_lead");
        socket.off("consult_start");
        socket.disconnect();
        socketRef.current = null;
      }
    }
  }, [user]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

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
      const res = await axios.get(`/api/connections?userId=${uId}&status=active`);
      setConnections(res.data);
    } catch (err) { console.error("Connections Error:", err); }
  };

  const handleEditProfile = () => {
    router.push('/settings?tab=account');
  };

  const handleViewProfile = () => {
    const uId = user._id || user.id;
    router.push(`/lawyer/${uId}`);
  };

  const fetchLeads = async () => {
    try {
      const res = await axios.get("/api/cases?open=true");
      setLeads(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Leads Fetch Error:", err);
      setLeads([]);
    }
  };

  const fetchAcceptedCases = async (userId) => {
    try {
      // Assuming lawyers are identified by ID in the 'lawyer' field of Case model
      const res = await axios.get(`/api/cases?lawyerId=${userId}`);
      setAcceptedCases(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Accepted Cases Fetch Error:", err);
      setAcceptedCases([]);
    }
  };

  const fetchAppointments = async (id) => {
    try {
      const res = await axios.get(`/api/appointments?userId=${id}&role=lawyer`);
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setAppointments(list.filter(a => a.status !== 'rejected'));
    } catch (err) {
      console.error("Appointments Fetch Error:", err);
      setAppointments([]);
    }
  };

  const fetchInvoices = async (id) => {
    try {
      const res = await axios.get(`/api/invoices?lawyerId=${id}`);
      setInvoices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Invoices Fetch Error:", err);
      setInvoices([]);
    }
  };

  const fetchLawyers = async () => {
    try {
      const res = await axios.get("/api/lawyers");
      setLawyers(Array.isArray(res.data.lawyers) ? res.data.lawyers : []);
    } catch (err) {
      console.error("Lawyers Fetch Error:", err);
      setLawyers([]);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const uId = user._id || user.id;
      const client = connections.find(c => c._id === newInvoice.clientId);
      await axios.post("/api/invoices", {
        ...newInvoice,
        lawyerId: uId,
        lawyerName: user.name,
        clientName: client?.name || "Client"
      });
      toast.success("Invoice generated!");
      setShowInvoiceModal(false);
      fetchInvoices(uId);
    } catch (err) {
      toast.error("Failed to generate invoice");
    }
  };

  const acceptLead = async (id, tier) => {
    if (!user.verified) return toast.error("Verification Required. Please complete your profile.");
    const uId = user._id || user.id;
    try {
      await axios.post(`/api/cases/${id}/accept`, {
        lawyerPhone: user.phone || user.email,
        lawyerId: uId
      });
      toast.success("Lead Accepted! Client has been notified.");
      fetchLeads();
      fetchAcceptedCases(uId);
    } catch (err) {
      const errMsg = err.response?.data?.error || "Failed to accept lead.";
      toast.error(errMsg);
    }
  };

  if (authLoading || loading || !user || user.role !== "lawyer") return <PremiumLoader text="Initializing Command Center..." />;

  // Ensure user fields are safe
  const userName = user?.name || "Counsel";
  const userInitials = userName[0] || "?";

  const revenueNet = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const unread = notifications.filter(n => !n.read).length;
  const analytics = crmData?.analytics || [];
  const revenueSeries = analytics.map(a => Number(a.revenue) || 0);

  return (
    <div className="relative min-h-screen bg-[var(--bg)] font-sans text-[var(--text)] selection:bg-[var(--gold)]/25">
      <MIBackdrop />

      {/* SIDEBAR NAVIGATION (Fixed Left) */}
      <aside className={`mi-scroll fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-y-auto border-r border-[var(--gold-hairline)] bg-[var(--surface)]/80 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="mb-8 flex items-center gap-3 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] bg-[var(--gold)]/10 text-[var(--gold)]">
              <Gavel size={18} />
            </span>
            <div>
              <span className="mi-body text-lg font-bold tracking-tight text-[var(--text)]">Nyay<span className="text-[var(--gold)]">Dash</span></span>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] leading-none text-[var(--text-muted)]">Counsel OS</p>
            </div>
          </div>

          <nav className="space-y-6">
            <div>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Command Center</p>
              <div className="space-y-1">
                <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'board'} onClick={() => setActiveTab('board')} />
                <SidebarItem icon={<Zap size={18} />} label="Lead Pool" count={leads.length} active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} />
                <SidebarItem icon={<Users size={18} />} label="Client CRM" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
                <SidebarItem icon={<FolderPlus size={18} />} label="Matter Review" active={activeTab === 'matters'} onClick={() => setActiveTab('matters')} />
              </div>
            </div>

            <div>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Communication</p>
              <div className="space-y-1">
                <SidebarItem icon={<MessageSquare size={18} />} label="Messages" to="/messages" />
                <SidebarItem icon={<Calendar size={18} />} label="Calendar" to="/calendar" />
                <SidebarItem icon={<Globe size={18} />} label="Legal Feed" active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
              </div>
            </div>

            <div>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">AI Practice Suite</p>
              <div className="space-y-1">
                <SidebarItem icon={<BookOpen size={18} />} label="Live Research" active={activeTab === 'research'} onClick={() => setActiveTab('research')} />
                <SidebarItem icon={<FileText size={18} />} label="AI Drafter" active={activeTab === 'notices'} onClick={() => setActiveTab('notices')} />
              </div>
            </div>

            <div>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Finance & Account</p>
              <div className="space-y-1">
                <SidebarItem icon={<DollarSign size={18} />} label="Financials" active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />
              </div>
            </div>
          </nav>
        </div>

        <div className="relative mt-auto p-4">
          <div className="mi-glass-card flex cursor-pointer items-center gap-3 p-3 transition hover:border-[var(--gold)]/50" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <Avatar name={user.name} size={40} />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-bold text-[var(--text)]">{user.name}</p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">{user.specialization || "Partner"}</p>
            </div>
            <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                className="mi-glass-card absolute bottom-20 left-4 right-4 z-50 origin-bottom p-2"
              >
                <button onClick={handleViewProfile} className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-left text-xs font-semibold text-[var(--text)] transition hover:bg-[var(--surface-2)]">
                  <UserIcon size={14} /> Profile
                </button>
                <button onClick={handleEditProfile} className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-left text-xs font-semibold text-[var(--text)] transition hover:bg-[var(--surface-2)]">
                  <Settings size={14} /> Settings
                </button>
                <div className="mi-hairline my-1" />
                <button onClick={logout} className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-left text-xs font-bold text-[var(--sos)] transition hover:bg-[color-mix(in_srgb,var(--sos)_12%,transparent)]">
                  <LogOut size={14} /> Log Out
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
      <main className="relative z-10 min-h-screen px-4 pb-8 pt-6 sm:px-6 lg:pl-64">

        {/* HEADER */}
        <header className="mb-8 flex items-center justify-between gap-4 px-2 sm:px-6">
          <button
            className="mi-focus fixed left-4 top-4 z-[60] rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] bg-[var(--surface)]/80 p-2.5 text-[var(--text-muted)] backdrop-blur-xl transition hover:text-[var(--text)] lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? <X size={18} /> : '☰'}
          </button>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="mi-display text-xl font-bold tracking-tight sm:text-3xl">
              Command <span className="mi-gold-headline">Center</span>
            </h1>
          </motion.div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="mi-focus relative rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface)]/70 p-3 text-[var(--text-muted)] transition hover:text-[var(--text)]"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 animate-ping rounded-full bg-[var(--sos)]" />}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    className="mi-glass-card absolute right-0 z-[100] mt-4 w-80 origin-top-right overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-[var(--gold-hairline)] px-5 py-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text)]">Alert Pulse</h4>
                      <button onClick={handleMarkAllRead} className="text-[9px] font-bold uppercase tracking-tight text-[var(--gold)] hover:underline">Clear All</button>
                    </div>
                    <div className="mi-scroll max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">No Active Alerts</div>
                      ) : (
                        notifications.map(n => (
                          <button
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`block w-full border-b border-[var(--gold-hairline)] px-5 py-4 text-left transition last:border-0 hover:bg-[var(--surface-2)]/60 ${!n.read ? 'bg-[var(--gold)]/5' : ''}`}
                          >
                            <p className="text-xs leading-relaxed text-[var(--text)]">{n.message}</p>
                            <p className="mt-1.5 text-[9px] uppercase tracking-wider text-[var(--text-muted)]">{new Date(n.createdAt).toLocaleTimeString()}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mx-2 hidden h-10 w-px bg-[var(--gold-hairline)] sm:block" />

            <div className="hidden text-right sm:block">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Revenue Net</p>
              <p className="text-xl font-bold tracking-tight text-[var(--text)]"><AnimatedNumber value={revenueNet} prefix="₹" /></p>
            </div>

            <GoldButton onClick={() => setShowInvoiceModal(true)} className="hidden sm:inline-flex">
              <DollarSign size={15} /> Invoice
            </GoldButton>
          </div>
        </header>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* PRIMARY CONTENT (8 COLS) */}
          <div className="col-span-1 space-y-6 lg:col-span-8">

            {activeTab === 'board' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

                {/* PRACTICE OVERVIEW CARDS */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <StatTile label="Active Matters" value={acceptedCases.length} sub="Ongoing lifecycle" icon={<Briefcase size={18} />} tone="gold" />
                  <StatTile label="Pending Leads" value={leads.length} sub="Action required" icon={<Zap size={18} />} tone="warn" />
                  <StatTile label="Today's Agenda" value={appointments.length} sub="Virtual court sessions" icon={<Calendar size={18} />} tone="emerald" />
                </div>

                {/* ANALYTICS WIDGET */}
                <Panel
                  title="Performance Analytics"
                  subtitle="Growth & conversion metrics"
                  icon={<TrendingUp size={16} />}
                  action={
                    <select className="rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-transparent px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] outline-none">
                      <option className="bg-[var(--surface)]">Quarterly</option>
                      <option className="bg-[var(--surface)]">Monthly</option>
                    </select>
                  }
                >
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics}>
                        <defs>
                          <linearGradient id="miRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C9A24B" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#C9A24B" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fill: '#8FA3C7', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis tick={{ fill: '#8FA3C7', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(201,162,75,0.12)" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#111A2E', border: '1px solid rgba(201,162,75,0.28)', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)' }}
                          itemStyle={{ color: '#F7F3EA', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                          labelStyle={{ color: '#8FA3C7', fontSize: '10px', fontWeight: 700 }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#C9A24B" fillOpacity={1} fill="url(#miRevenue)" strokeWidth={3} name="Revenue" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>

                {/* INTELLIGENCE PANEL */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {crmData ? (
                    <>
                      <WorkloadMonitor workload={crmData.workload} />
                      <CaseIntelligencePanel insights={crmData.caseInsights} />
                    </>
                  ) : (
                    <div className="col-span-2 h-48 animate-pulse rounded-[var(--radius-lg)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/40" />
                  )}
                </div>

                {/* KANBAN BOARD */}
                <Panel title="Case Lifecycle" subtitle="Operational pipeline" icon={<LayoutDashboard size={16} />}
                  action={<div className="flex gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-[var(--gold)]" /><span className="h-2 w-2 rounded-full bg-[var(--gold-hairline)]" /><span className="h-2 w-2 rounded-full bg-[var(--gold-hairline)]" /></div>}
                >
                  <KanbanBoard cases={acceptedCases} onUpdate={() => fetchAcceptedCases(user._id || user.id)} />
                </Panel>
              </motion.div>
            )}

            {activeTab === 'feed' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <Panel title="Legal Pulse" subtitle="Community insights & intelligence" icon={<Globe size={16} />}
                  action={<GhostButton>Broadcast Update</GhostButton>}
                >
                  <LegalReels />
                </Panel>
              </motion.div>
            )}

            {activeTab === 'invoices' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <Panel title="Financial Ledger" subtitle={`${invoices.length} records`} icon={<DollarSign size={16} />}
                  action={<GoldButton onClick={() => setShowInvoiceModal(true)}>Generate Invoice</GoldButton>}
                >
                  <div className="space-y-3">
                    {invoices.length === 0 ? (
                      <EmptySlot icon="₹" title="No transaction history found" hint="Generated invoices will appear here." />
                    ) : (
                      invoices.map(inv => (
                        <div key={inv._id} className="mi-card-hover flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 p-5">
                          <div>
                            <p className="font-semibold text-[var(--text)]">{inv.clientName || 'Private Client'}</p>
                            <p className="text-xs text-[var(--text-muted)]">{new Date(inv.createdAt).toLocaleDateString()} • {inv.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-[var(--text)]">₹{inv.amount}</p>
                            <Pill tone={inv.status === 'paid' ? 'emerald' : 'warn'} className="mt-1">{inv.status}</Pill>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Panel>
              </motion.div>
            )}

            {activeTab === 'clients' && <ClientCRM />}

            {activeTab === 'matters' && <LawyerMattersPanel />}

            {activeTab === 'leads' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="mi-body text-lg font-semibold text-[var(--text)]">Legal Matter Lead Pool</h3>
                  <Pill tone="warn">{leads.length} open</Pill>
                </div>
                {leads.length === 0 ? (
                  <EmptySlot icon="⚡" title="No open legal matters found" hint="New leads appear here in real time." />
                ) : leads.map(lead => (
                  <div key={lead._id} className="mi-glass-card mi-card-hover group relative overflow-hidden p-6">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] bg-[var(--gold)]/10 text-xl">⚖️</span>
                        <div>
                          <h4 className="text-lg font-semibold text-[var(--text)] transition group-hover:text-[var(--gold)]">{lead.title}</h4>
                          <Pill tone="gold" className="mt-1">{lead.category || "General"}</Pill>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[var(--text)]">{lead.budget ? `Budget: ${lead.budget}` : "Budget: Negotiable"}</div>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">{lead.location || "Remote"}</span>
                      </div>
                    </div>
                    <p className="mb-4 rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/40 p-4 text-sm text-[var(--text-muted)]">{lead.desc || "No description provided."}</p>
                    <GoldButton onClick={() => acceptLead(lead._id)} className="w-full">Accept Lead & Contact Client</GoldButton>
                  </div>
                ))}
              </motion.div>
            )}

          </div>

          {/* LEGAL NOTICE GENERATOR — Full Width */}
          {activeTab === 'notices' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-1 lg:col-span-12">
              <LegalNoticeGenerator />
            </motion.div>
          )}

          {/* LEGAL RESEARCH HUB — Full Width */}
          {activeTab === 'research' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-1 lg:col-span-12">
              <LegalResearchHub />
            </motion.div>
          )}

          {/* RIGHT SIDEBAR (4 COLS) — Hidden on full-width tabs */}
          {(activeTab !== 'notices' && activeTab !== 'research') && (
            <div className="col-span-1 space-y-6 lg:col-span-4">

              <ECourtsWidget />

              <Panel hover={false} title="Calendar" subtitle="Scheduling" icon={<Calendar size={16} />}>
                <div className="h-[340px]"><CalendarWidget user={user} /></div>
              </Panel>

              <Panel hover={false} title="Today's Agenda" icon={<Calendar size={16} />}>
                {appointments.length === 0 ? (
                  <EmptySlot icon="🗓️" title="No scheduled briefings" />
                ) : (
                  <div className="space-y-3">
                    {appointments.slice(0, 3).map(apt => (
                      <div key={apt._id} className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 p-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={apt.clientId?.name || 'C'} size={32} />
                          <div>
                            <p className="text-xs font-bold leading-none text-[var(--text)]">{apt.clientId?.name || "Private Client"}</p>
                            <p className="mt-1 text-[9px] uppercase tracking-tight text-[var(--text-muted)]">{apt.slot}</p>
                          </div>
                        </div>
                        {apt.status === 'confirmed' ? <Pill tone="emerald">Confirmed</Pill> : <Pill tone="warn">Pending</Pill>}
                      </div>
                    ))}
                  </div>
                )}
              </Panel>

              <Panel hover={false} title="Recent Pulse" icon={<Zap size={16} />}>
                {notifications.length === 0 ? (
                  <EmptySlot icon="✦" title="Nothing new" />
                ) : (
                  <div className="relative space-y-6 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-0.5 before:bg-[var(--gold-hairline)]">
                    {notifications.slice(0, 4).map((n, idx) => (
                      <div key={idx} className="group relative pl-8">
                        <div className="absolute left-0 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--gold-hairline)] bg-[var(--surface)] transition group-hover:border-[var(--gold)]">
                          <div className="h-1.5 w-1.5 rounded-full bg-[var(--gold-hairline)] transition group-hover:bg-[var(--gold)]" />
                        </div>
                        <p className="text-[11px] leading-relaxed text-[var(--text-muted)] transition group-hover:text-[var(--text)]">{n.message}</p>
                        <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{new Date(n.createdAt).toLocaleTimeString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </div>
          )}

        </div>
      </main>

      {/* INVOICE MODAL */}
      <AnimatePresence>
        {showInvoiceModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowInvoiceModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="mi-glass-card relative z-10 w-full max-w-lg p-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="mi-body text-xl font-semibold text-[var(--text)]">Generate Invoice</h3>
                <button onClick={() => setShowInvoiceModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text)]"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Select Client</label>
                  <select
                    className="mi-focus w-full rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-transparent p-4 text-[var(--text)] outline-none"
                    value={newInvoice.clientId}
                    onChange={e => setNewInvoice({ ...newInvoice, clientId: e.target.value })}
                  >
                    <option value="" className="bg-[var(--surface)]">Select a client</option>
                    {connections.map(c => (
                      <option key={c._id} value={c._id} className="bg-[var(--surface)]">{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Description</label>
                  <input type="text" className="mi-focus w-full rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-transparent p-4 text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]" placeholder="e.g. Consultation Fee" value={newInvoice.description} onChange={e => setNewInvoice({ ...newInvoice, description: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Amount (INR)</label>
                  <input type="number" className="mi-focus w-full rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-transparent p-4 text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]" placeholder="2000" value={newInvoice.amount} onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })} />
                </div>
                <GoldButton onClick={handleCreateInvoice} className="w-full">Send Invoice</GoldButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
