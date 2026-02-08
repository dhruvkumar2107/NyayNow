import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import KanbanBoard from "../components/dashboard/KanbanBoard";
import CalendarWidget from "../components/dashboard/CalendarWidget";
import WorkloadMonitor from "../components/dashboard/lawyer/WorkloadMonitor";
import CaseIntelligencePanel from "../components/dashboard/lawyer/CaseIntelligencePanel";
import UnifiedActivityFeed from "../components/dashboard/lawyer/UnifiedActivityFeed";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

const socket = io(import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "http://localhost:4000");

export default function LawyerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("board");
  const [leads, setLeads] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [crmData, setCrmData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ clientName: "", amount: "", description: "" });
  const [clientForm, setClientForm] = useState({ name: "", phone: "", notes: "" });

  useEffect(() => {
    if (user) {
      const uId = user._id || user.id;
      Promise.all([
        fetchLeads(),
        fetchAppointments(uId),
        fetchRequests(uId),
        fetchInvoices(uId),
        fetchClients(),
        axios.get(`/api/crm/insights?userId=${uId}`).then(res => setCrmData(res.data)).catch(err => null)
      ]).finally(() => setLoading(false));

      socket.emit("join_room", uId);
      socket.emit("join_lawyer_pool");

      socket.on("incoming_lead", (data) => {
        // Could add a toast or ringtone here
      });

      socket.on("consult_start", (data) => {
        if (data.role === 'lawyer') navigate(`/video-call/${data.meetingId}`);
      });
    }
    return () => {
      socket.off("incoming_lead");
      socket.off("consult_start");
    }
  }, [user]);

  const fetchLeads = async () => axios.get("/api/cases?open=true").then(res => setLeads(res.data)).catch(console.error);
  const fetchAppointments = async (id) => axios.get(`/api/appointments?userId=${id}&role=lawyer`).then(res => setAppointments(res.data.filter(a => a.status !== 'rejected'))).catch(console.error);
  const fetchRequests = async (id) => axios.get(`/api/connections?userId=${id}&status=pending`).then(res => setRequests(res.data.filter(r => r.initiatedBy !== id))).catch(console.error);
  const fetchInvoices = async (id) => axios.get(`/api/invoices?lawyerId=${id}`).then(res => setInvoices(res.data)).catch(console.error);
  const fetchClients = async () => axios.get(`/api/crm?lawyerId=${user?._id || user?.id}`).then(res => setClients(res.data)).catch(console.error);

  const handleConnectionAction = async (connId, action) => {
    try { await axios.put(`/api/connections/${connId}`, { status: action }); alert(action === 'active' ? "Accepted" : "Rejected"); fetchRequests(); } catch (err) { alert("Failed"); }
  };

  const updateAppointmentStatus = async (id, status) => {
    try { await axios.put(`/api/appointments/${id}`, { status }); setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a)); } catch (err) { alert("Failed"); }
  };

  const acceptLead = async (id, tier, category) => {
    // Basic checks
    if (!user.verified) return alert("Please verify your account first.");
    try { await axios.post(`/api/cases/${id}/accept`, { lawyerPhone: user.phone || user.email }); alert("Lead Accepted!"); fetchLeads(); } catch (err) { alert("Failed to accept"); }
  };

  const handleCreateInvoice = async () => {
    try { await axios.post("/api/invoices", { lawyerId: user._id, ...invoiceForm, status: "pending" }); alert("Invoice Sent"); setShowInvoiceModal(false); fetchInvoices(); } catch (err) { alert("Failed"); }
  }

  const handleCreateClient = async () => {
    try { await axios.post("/api/crm", { lawyerId: user._id, ...clientForm }); alert("Client Added"); setShowClientModal(false); fetchClients(); } catch (err) { alert("Failed"); }
  }

  if (loading || !user) return <div className="p-10 text-center text-slate-500">Loading Command Center...</div>;

  const totalEarnings = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const completionPercentage = 85; // Mock for now, use logic if needed

  return (
    <DashboardLayout
      leftSidebar={
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative">
          <div className="h-28 bg-[#1e293b] relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          </div>
          <div className="px-6 pb-6 -mt-14 relative z-10">
            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg mb-4">
              <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-500">
                {user.name?.[0]}
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              {user.verified && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Verified</span>}
            </div>
            <p className="text-sm font-medium text-slate-500">{user.specialization || "Legal Consultant"}</p>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
              <SidebarItem icon="📊" label="Command Center" to="/lawyer/dashboard" active />
              <SidebarItem icon="⚡" label="Lead Pool" count={leads.length} onClick={() => setActiveTab('leads')} />
              <SidebarItem icon="📅" label="Calendar" to="/calendar" />
              <SidebarItem icon="👥" label="CRM" onClick={() => setActiveTab('clients')} />
              <SidebarItem icon="📝" label="Invoices" onClick={() => setActiveTab('invoices')} />
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                <span>Profile Completion</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
              </div>
              {completionPercentage < 100 && <Link to="/lawyer/profile/edit" className="text-[10px] text-blue-600 font-bold mt-2 block hover:underline">Complete Profile</Link>}
            </div>
          </div>
        </div>
      }

      mainFeed={
        <>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Command Center</h1>
              <p className="text-slate-500 font-medium">Overview of your practice.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowInvoiceModal(true)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-50 transition">+ Invoice</button>
              <button onClick={() => setActiveTab('leads')} className="px-4 py-2 bg-[#0B1120] text-white font-bold rounded-lg text-sm hover:bg-slate-800 transition shadow-lg shadow-slate-900/10">Find Leads</button>
            </div>
          </div>

          {/* STATS ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            <StatCard label="Total Earnings" value={`₹${totalEarnings.toLocaleString()}`} trend="+12%" color="emerald" icon="💰" />
            <StatCard label="Active Leads" value={leads.length} trend="New Opportunities" color="blue" icon="⚡" />
            <StatCard label="Total Clients" value={activeTab === 'board' ? '12' : clients.length} trend="+2 this week" color="purple" icon="👥" />
            <StatCard label="Profile Views" value={user.stats?.profileViews || 128} trend="Top 5%" color="orange" icon="👁️" />
          </div>

          {/* TABS */}
          <div className="flex bg-slate-200/50 p-1 rounded-xl w-fit mb-6">
            {['board', 'leads', 'invoices', 'clients'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${activeTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {t}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'board' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="mb-8">
                  <h3 className="font-bold text-slate-900 mb-4">Workload Intelligence</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {crmData && <WorkloadMonitor workload={crmData.workload} />}
                    {crmData && <CaseIntelligencePanel insights={crmData.caseInsights} />}
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 mb-4">Case Lifecycle (Kanban)</h3>
                <KanbanBoard cases={leads.filter(l => l.acceptedBy)} onUpdate={fetchLeads} />
              </motion.div>
            )}

            {activeTab === 'leads' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {leads.map(lead => (
                  <div key={lead._id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${lead.tier === 'diamond' ? 'bg-purple-100 text-purple-700' : lead.tier === 'gold' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{lead.tier || 'Standard'}</span>
                        <h4 className="font-bold text-lg text-slate-900 mt-2 group-hover:text-blue-600 transition">{lead.title}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-slate-900">₹{lead.budget}</div>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">{lead.desc}</p>
                    <div className="flex gap-3">
                      <button onClick={() => acceptLead(lead._id, lead.tier, lead.category)} className="flex-1 bg-slate-900 text-white py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition">Accept Case</button>
                      <button className="px-4 py-2 border border-slate-200 font-bold text-sm text-slate-500 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition">Pass</button>
                    </div>
                  </div>
                ))}
                {leads.length === 0 && <p className="text-center text-slate-400 py-10">No active leads available.</p>}
              </motion.div>
            )}

            {/* Invoices and Clients tabs would follow similar premium patterns, simplified here for brevity */}
            {activeTab === 'invoices' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex justify-between mb-6">
                  <h3 className="font-bold text-slate-900">Invoices</h3>
                  <button onClick={() => setShowInvoiceModal(true)} className="text-blue-600 font-bold text-sm hover:underline">+ Create New</button>
                </div>
                {invoices.map(inv => (
                  <div key={inv._id} className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-2 rounded-lg transition">
                    <div>
                      <p className="font-bold text-slate-900">{inv.clientName}</p>
                      <p className="text-xs text-slate-500">{inv.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{inv.amount}</p>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{inv.status}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      }

      rightSidebar={
        <div className="space-y-6">
          {/* CALENDAR */}
          <div className="bg-white border border-slate-200 rounded-2xl p-1 shadow-sm overflow-hidden h-[360px]">
            <CalendarWidget user={user} />
          </div>

          {/* CONNECTION REQUESTS */}
          {requests.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-4">Pending Requests</h3>
              <div className="space-y-3">
                {requests.map(req => (
                  <div key={req._id} className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-700">{req.name}</span>
                    <button onClick={() => handleConnectionAction(req.connectionId, 'active')} className="bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full font-bold hover:bg-blue-700">Accept</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* APPOINTMENTS WIDGET */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 mb-4">Upcoming Meetings</h3>
            {appointments.length === 0 ? <p className="text-xs text-slate-400">No meetings scheduled.</p> : (
              <div className="space-y-3">
                {appointments.slice(0, 3).map(apt => (
                  <div key={apt._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900">{apt.clientId?.name || "Client"}</span>
                      <span className="text-[10px] font-bold text-slate-500">{apt.slot}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-2">{new Date(apt.date).toLocaleDateString()}</p>
                    {apt.status === 'confirmed' ? (
                      <button onClick={() => {
                        const link = `${window.location.origin}/meet/${apt._id}`;
                        window.open(link, "_blank");
                      }} className="w-full bg-purple-100 text-purple-700 py-1 rounded text-[10px] font-bold hover:bg-purple-200">Start Call</button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => updateAppointmentStatus(apt._id, 'confirmed')} className="flex-1 bg-green-100 text-green-700 py-1 rounded text-[10px] font-bold">Confirm</button>
                        <button onClick={() => updateAppointmentStatus(apt._id, 'rejected')} className="flex-1 bg-slate-200 text-slate-600 py-1 rounded text-[10px] font-bold">Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      }
    />
  );
}

function StatCard({ label, value, trend, color, icon }) {
  const colors = {
    emerald: "text-emerald-600 bg-emerald-50",
    blue: "text-blue-600 bg-blue-50",
    purple: "text-purple-600 bg-purple-50",
    orange: "text-orange-600 bg-orange-50"
  };
  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <span className={`text-lg ${colors[color].split(' ')[0]}`}>{icon}</span>
      </div>
      <div className="text-2xl font-black text-slate-900 mb-1">{value}</div>
      <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${colors[color]}`}>{trend}</div>
    </div>
  );
}

function SidebarItem({ icon, label, to, count, active, onClick }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => to ? navigate(to) : onClick?.()} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${active ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
      <div className="flex items-center gap-3 text-sm font-bold">
        <span className="text-base">{icon}</span>
        {label}
      </div>
      {count !== undefined && <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">{count}</span>}
    </div>
  )
}
