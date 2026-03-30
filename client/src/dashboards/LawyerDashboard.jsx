'use client'

import { useState, useEffect } from "react";
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

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import PremiumLoader from "../components/PremiumLoader";
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
  Video
} from "lucide-react";

const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") || "http://localhost:4000", { transports: ['websocket'] });

export default function LawyerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
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
                  socket.emit("accept_consult", {
                    lawyerId: uId,
                    clientId: payload.clientId,
                    lawyerName: user.name
                  });
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
    } catch (err) { toast.error("Failed to accept lead."); }
  };

  if (loading || !user) return <PremiumLoader text="Initializing Command Center..." />;

  // Ensure user fields are safe
  const userName = user?.name || "Counsel";
  const userInitials = userName[0] || "?";

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-indigo-500/30">

      {/* SIDEBAR NAVIGATION (Fixed Left) */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0f172a] border-r border-white/5 flex flex-col z-50">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Gavel className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="text-white font-black text-xl tracking-tighter uppercase">Nyay<span className="text-indigo-500">Dash</span></span>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Counsel OS</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'board'} onClick={() => setActiveTab('board')} />
            <NavItem icon={<Zap size={18} />} label="Lead Pool" count={leads.length} active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} />
            <NavItem icon={<Users size={18} />} label="Client CRM" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
            <NavItem icon={<MessageSquare size={18} />} label="Messages" to="/messages" />
            <NavItem icon={<Calendar size={18} />} label="Calendar" to="/calendar" />
            <NavItem icon={<DollarSign size={18} />} label="Financials" active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />
            <NavItem icon={<MessageSquare size={18} />} label="Legal Feed" active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
            <div className="my-4 h-px bg-white/5 mx-2" />
            <NavItem icon={<FileText size={18} />} label="AI Drafter" active={activeTab === 'notices'} onClick={() => setActiveTab('notices')} />
          </div>
        </div>

        <div className="mt-auto p-4 relative">
          <div
            className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition group"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner group-hover:scale-105 transition duration-300">
              {user.name?.[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-white font-bold text-xs truncate">{user.name}</p>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest truncate">{user.specialization || "Partner"}</p>
            </div>
            <ChevronDown size={14} className={`text-slate-500 transform transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-20 left-4 right-4 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl"
              >
                <div className="p-2 space-y-1">
                  <button onClick={handleViewProfile} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-indigo-600/10 hover:text-indigo-400 rounded-xl transition text-left">
                    <UserIcon size={14} /> Profile
                  </button>
                  <button onClick={handleEditProfile} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-indigo-600/10 hover:text-indigo-400 rounded-xl transition text-left">
                    <Settings size={14} /> Settings
                  </button>
                  <div className="h-px bg-white/5 my-1 mx-2"></div>
                  <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition text-left">
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="pl-64 pt-6 pr-6 pb-6 min-h-screen">

        {/* HEADER */}
        <header className="flex justify-between items-center mb-8 px-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Command <span className="text-indigo-500">Center</span>.
            </h1>
          </motion.div>

          <div className="flex items-center gap-4">
            {/* VIDEO CALL BUTTON */}
            {/* <button
              onClick={() => router.push('/video-call')}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 group active:scale-95"
            >
              <Video size={14} className="group-hover:rotate-12 transition" />
              Virtual Court
            </button> */}

            {/* NOTIFICATION BELL */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition relative group"
              >
                <Bell size={18} className="group-hover:rotate-12 transition" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-80 bg-[#1e293b]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-[100] overflow-hidden origin-top-right ring-1 ring-white/10"
                  >
                    <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Alert Pulse</h4>
                      <button onClick={handleMarkAllRead} className="text-[9px] text-indigo-400 font-bold hover:underline tracking-tighter uppercase">Clear All</button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center opacity-30">
                          <p className="text-[10px] font-black uppercase tracking-widest">No Active Alerts</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-5 border-b border-white/5 last:border-0 hover:bg-white/5 transition cursor-pointer ${!n.read ? 'bg-indigo-500/5' : ''}`}
                          >
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">{n.message}</p>
                            <p className="text-[9px] text-slate-600 mt-2 font-bold uppercase tracking-wider">{new Date(n.createdAt).toLocaleTimeString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-10 w-px bg-white/10 mx-2" />

            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Revenue Net</p>
              <p className="text-xl font-black text-white tracking-tighter">₹{invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + (Number(i.amount) || 0), 0).toLocaleString()}</p>
            </div>
          </div>
        </header>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-12 gap-6 px-4">

          {/* PRIMARY CONTENT (8 COLS) */}
          <div className="col-span-8 space-y-6">

            {activeTab === 'board' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

                {/* PRACTICE OVERVIEW CARDS */}
                <div className="grid grid-cols-3 gap-4">
                  <StatCard
                    label="Active Matters"
                    value={acceptedCases.length}
                    sub="Ongoing lifecycle"
                    icon={<Briefcase className="text-indigo-400" size={20} />}
                    color="indigo"
                  />
                  <StatCard
                    label="Pending Leads"
                    value={leads.length}
                    sub="Action required"
                    icon={<Zap className="text-amber-400" size={20} />}
                    color="amber"
                  />
                  <StatCard
                    label="Today's Agenda"
                    value={appointments.length}
                    sub="Virtual court sessions"
                    icon={<Calendar className="text-emerald-400" size={20} />}
                    color="emerald"
                  />
                </div>

                {/* ANALYTICS WIDGET */}
                <div className="bg-[#0f172a] rounded-[2rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-indigo-500/10 transition duration-700"></div>
                  <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                      <h3 className="font-black text-xl text-white tracking-tight">Performance Analytics</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Growth & Conversion Metrics</p>
                    </div>
                    <select className="bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 text-slate-400 outline-none focus:border-indigo-500 transition">
                      <option>Quarterly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div className="h-64 w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={crmData?.analytics || []}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                          itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} name="Revenue" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* INTELLIGENCE PANEL */}
                <div className="grid grid-cols-2 gap-6">
                  {crmData ? (
                    <>
                      <WorkloadMonitor workload={crmData.workload} />
                      <CaseIntelligencePanel insights={crmData.caseInsights} />
                    </>
                  ) : (
                    <div className="col-span-2 h-48 bg-white/5 animate-pulse rounded-[2rem]"></div>
                  )}
                </div>

                {/* KANBAN BOARD */}
                <div className="bg-[#0f172a] rounded-[2rem] p-8 border border-white/5 shadow-2xl">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="font-black text-xl text-white tracking-tight">Case Lifecycle</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Operational Pipeline</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                      <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                    </div>
                  </div>
                  <KanbanBoard cases={acceptedCases} onUpdate={() => fetchAcceptedCases(user._id || user.id)} />
                </div>
              </motion.div>
            )}

            {activeTab === 'feed' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-8 space-y-6">
                <div className="bg-[#0f172a] rounded-[2rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                  <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                      <h3 className="font-black text-2xl text-white tracking-tight">Legal Pulse</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Community Insights & Intelligence</p>
                    </div>
                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20">Broadcast Update</button>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <LegalReels />
                    {/* Placeholder for posts logic if needed, or reuse LegalReels */}
                    <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">The pulse is synchronizing...</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'invoices' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-[#0f172a] rounded-3xl p-8 border border-white/10 shadow-xl">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-2xl text-white">Financial Ledger</h3>
                    <button onClick={() => setShowInvoiceModal(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition">Generate New Invoice</button>
                  </div>
                  <div className="space-y-4">
                    {invoices.length === 0 ? (
                      <div className="py-20 text-center">
                        <p className="text-slate-500 font-bold uppercase tracking-widest">No transaction history found</p>
                      </div>
                    ) : (
                      invoices.map(inv => (
                        <div key={inv._id} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center hover:bg-white/10 transition">
                          <div>
                            <p className="text-white font-bold">{inv.clientName || 'Private Client'}</p>
                            <p className="text-xs text-slate-500">{new Date(inv.createdAt).toLocaleDateString()} • {inv.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-white">₹{inv.amount}</p>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{inv.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'clients' && <ClientCRM />}

            {activeTab === 'leads' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h3 className="font-bold text-lg text-white mb-2">Available Professionals</h3>
                {lawyers.map(lawyer => (
                  <div key={lawyer._id} className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-500/50 transition group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                          {lawyer.name?.[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-white group-hover:text-indigo-400 transition">{lawyer.name}</h4>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{lawyer.specialization || "Legal Expert"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">₹{lawyer.consultationFee || "0"}/hr</div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{lawyer.location?.city || "Remote"}</span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-4 bg-black/20 p-3 rounded-lg border border-white/5 line-clamp-2">{lawyer.bio || "Secure professional profile data."}</p>
                    <div className="flex gap-3">
                      <button onClick={() => router.push(`/messages?chatId=${lawyer._id}`)} className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20">Connect</button>
                      <button onClick={() => router.push(`/lawyer/${lawyer._id}`)} className="flex-1 bg-white/5 border border-white/10 text-slate-300 py-3 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition">View Dossier</button>
                    </div>
                  </div>
                ))}
                {lawyers.length === 0 && <p className="text-center text-slate-500 py-10">No professional entities found in the vault.</p>}
              </motion.div>
            )}

          </div>

          {/* LEGAL NOTICE GENERATOR — Full Width */}
          {activeTab === 'notices' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-12">
              <LegalNoticeGenerator />
            </motion.div>
          )}

          {/* RIGHT SIDEBAR (4 COLS) — Hidden on notices tab */}
          {activeTab !== 'notices' && (
            <div className="col-span-4 space-y-6">
              {/* CALENDAR */}
              <div className="bg-[#0f172a] rounded-[2rem] p-6 border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full -ml-10 -mt-10"></div>
                <div className="relative z-10 h-[340px]">
                  <CalendarWidget user={user} />
                </div>
              </div>

              {/* UPCOMING MEETINGS */}
              <div className="bg-[#0f172a] rounded-[2rem] p-8 border border-white/5 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <Calendar size={16} />
                  </div>
                  <h3 className="font-black text-lg text-white tracking-tight">Today's Agenda</h3>
                </div>
                {appointments.length === 0 ? (
                  <div className="py-10 text-center opacity-30 border-2 border-dashed border-white/5 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest">No Scheduled Briefings</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.slice(0, 3).map(apt => (
                      <div key={apt._id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/10 transition group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-400">
                            {apt.clientId?.name?.[0] || "C"}
                          </div>
                          <div>
                            <p className="font-black text-xs text-white leading-none mb-1">{apt.clientId?.name || "Private Client"}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{apt.slot}</p>
                          </div>
                        </div>
                        {apt.status === 'confirmed' ? (
                          <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500/60 px-3 py-1 bg-emerald-500/5 rounded-lg border border-emerald-500/10">Confirmed</span>
                        ) : (
                          <span className="text-[8px] font-black uppercase tracking-widest text-amber-500/60 px-3 py-1 bg-amber-500/5 rounded-lg border border-amber-500/10">Pending</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RECENT ACTIVITY FEED (NEW) */}
              <div className="bg-[#0f172a] rounded-[2rem] p-8 border border-white/5 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <Zap size={16} />
                  </div>
                  <h3 className="font-black text-lg text-white tracking-tight">Recent Pulse</h3>
                </div>
                <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
                  {notifications.slice(0, 4).map((n, idx) => (
                    <div key={idx} className="relative pl-8 group">
                      <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-[#0f172a] border-2 border-white/10 flex items-center justify-center z-10 group-hover:border-indigo-500 transition duration-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-indigo-500 transition duration-300"></div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium group-hover:text-slate-200 transition">{n.message}</p>
                      <p className="text-[8px] text-slate-600 mt-1 font-black uppercase tracking-widest">{new Date(n.createdAt).toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* INVOICE MODAL */}
      <AnimatePresence>
        {showInvoiceModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowInvoiceModal(false)}></div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 max-w-lg w-full relative z-10 shadow-2xl">
              <h3 className="font-bold text-2xl text-white mb-6">Generate Invoice</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Select Client</label>
                  <select
                    className="w-full p-4 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-indigo-500 text-white transition"
                    value={newInvoice.clientId}
                    onChange={e => setNewInvoice({ ...newInvoice, clientId: e.target.value })}
                  >
                    <option value="">Select a client</option>
                    {connections.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Description</label>
                  <input type="text" className="w-full p-4 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-indigo-500 text-white transition placeholder-slate-600" placeholder="e.g. Consultation Fee" value={newInvoice.description} onChange={e => setNewInvoice({ ...newInvoice, description: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Amount (INR)</label>
                  <input type="number" className="w-full p-4 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-indigo-500 text-white transition placeholder-slate-600" placeholder="2000" value={newInvoice.amount} onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })} />
                </div>
                <button onClick={handleCreateInvoice} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/25 mt-2">
                  Send Invoice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function NavItem({ icon, label, to, count, active, onClick, badge }) {
  const router = useRouter();
  const handleClick = () => {
    if (onClick) onClick();
    if (to) router.push(to);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 group ${active
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
          : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
        }`}
    >
      <div className="flex items-center gap-3">
        <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
          {icon}
        </span>
        <span className={`text-xs font-bold uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
          {label}
        </span>
      </div>
      {count !== undefined && (
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${active ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white'
          } transition-colors`}>
          {count}
        </span>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, icon, color }) {
  const colors = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-indigo-500/10",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/10",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10"
  };

  return (
    <div className={`p-6 rounded-[2rem] border ${colors[color]} shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-default group`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-2xl group-hover:rotate-12 transition duration-500">
          {icon}
        </div>
        <TrendingUp size={14} className="opacity-30" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <h4 className="text-3xl font-black text-white tracking-tighter">{value}</h4>
      <p className="text-[9px] font-bold uppercase tracking-tighter opacity-40 mt-1">{sub}</p>
    </div>
  );
}
