import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import KanbanBoard from "../components/dashboard/KanbanBoard";
import CalendarWidget from "../components/dashboard/CalendarWidget";
import WorkloadMonitor from "../components/dashboard/lawyer/WorkloadMonitor";
import CaseIntelligencePanel from "../components/dashboard/lawyer/CaseIntelligencePanel";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

const socket = io(import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "http://localhost:4000");

export default function LawyerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("board");
  const [leads, setLeads] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [crmData, setCrmData] = useState(null);

  useEffect(() => {
    if (user) {
      const uId = user._id || user.id;
      Promise.all([
        fetchLeads(),
        fetchAppointments(uId),
        fetchInvoices(uId),
        axios.get(`/api/crm/insights?userId=${uId}`).then(res => setCrmData(res.data)).catch(err => null)
      ]).finally(() => setLoading(false));

      socket.emit("join_room", uId);
      socket.emit("join_lawyer_pool");
    }
  }, [user]);

  const fetchLeads = async () => axios.get("/api/cases?open=true").then(res => setLeads(res.data)).catch(console.error);
  const fetchAppointments = async (id) => axios.get(`/api/appointments?userId=${id}&role=lawyer`).then(res => setAppointments(res.data.filter(a => a.status !== 'rejected'))).catch(console.error);
  const fetchInvoices = async (id) => axios.get(`/api/invoices?lawyerId=${id}`).then(res => setInvoices(res.data)).catch(console.error);

  const acceptLead = async (id, tier) => {
    if (!user.verified) return alert("Please verify your account first.");
    try { await axios.post(`/api/cases/${id}/accept`, { lawyerPhone: user.phone || user.email }); alert("Lead Accepted!"); fetchLeads(); } catch (err) { alert("Failed to accept"); }
  };

  if (loading || !user) return <div className="flex items-center justify-center min-h-screen bg-[#020617] font-serif text-slate-400"><div className="animate-pulse">Loading Command Center...</div></div>;

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-indigo-500/30">

      {/* SIDEBAR NAVIGATION (Fixed Left) */}
      <aside className="fixed left-0 top-0 h-screen w-72 bg-[#0f172a] border-r border-white/10 flex flex-col z-50">
        <div className="p-8 pb-4">
          <Link to="/" className="flex items-center gap-3 mb-10 group">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 group-hover:scale-110 transition duration-300">⚖️</div>
            <span className="font-bold text-2xl tracking-tight text-white/90">NyayNow</span>
          </Link>

          <div className="space-y-1">
            <NavItem icon="📊" label="Command Center" active={activeTab === 'board'} onClick={() => setActiveTab('board')} />
            <NavItem icon="⚡" label="Lead Pool" count={leads.length} active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} />
            <NavItem icon="👥" label="Client CRM" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
            <NavItem icon="📅" label="Calendar" to="/calendar" />
            <NavItem icon="📝" label="Invoices" active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />
          </div>
        </div>

        <div className="mt-auto p-8 pt-0">
          <div className="bg-[#1e293b]/50 rounded-xl p-4 border border-white/10 mb-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
                {user.name?.[0]}
              </div>
              <div>
                <p className="text-white font-medium text-sm leading-none mb-1">{user.name}</p>
                <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">{user.specialization || "Partner"}</p>
              </div>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-2">
              <div className="bg-indigo-500 h-full w-[85%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>Profile: 85%</span>
              <button onClick={logout} className="hover:text-white transition">Sign Out</button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="pl-72 pt-8 pr-8 pb-8 min-h-screen">

        {/* HEADER */}
        <header className="flex justify-between items-end mb-10 px-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Practice Overview</p>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Command Center.
            </h1>
          </motion.div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-white">₹{invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + (Number(i.amount) || 0), 0).toLocaleString()}</p>
            </div>
          </div>
        </header>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-12 gap-6 px-4">

          {/* PRIMARY CONTENT (8 COLS) */}
          <div className="col-span-8 space-y-6">

            {activeTab === 'board' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* INTELLIGENCE PANEL */}
                <div className="grid grid-cols-2 gap-6">
                  {crmData && <WorkloadMonitor workload={crmData.workload} />}
                  {crmData && <CaseIntelligencePanel insights={crmData.caseInsights} />}
                </div>

                {/* KANBAN BOARD */}
                <div className="bg-[#0f172a] rounded-3xl p-6 border border-white/10 shadow-xl min-h-[500px]">
                  <h3 className="font-bold text-lg text-white mb-6">Case Lifecycle</h3>
                  <KanbanBoard cases={leads.filter(l => l.acceptedBy)} onUpdate={fetchLeads} />
                </div>
              </motion.div>
            )}

            {activeTab === 'leads' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h3 className="font-bold text-lg text-white mb-2">Available Opportunities</h3>
                {leads.map(lead => (
                  <div key={lead._id} className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-500/50 transition group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${lead.tier === 'diamond' ? 'bg-purple-500/20 text-purple-300' : lead.tier === 'gold' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700/50 text-slate-300'}`}>{lead.tier || 'Standard'}</span>
                        <h4 className="font-bold text-lg text-white mt-2 group-hover:text-indigo-400 transition">{lead.title}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">₹{lead.budget}</div>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-4 bg-black/20 p-3 rounded-lg border border-white/5">{lead.desc}</p>
                    <div className="flex gap-3">
                      <button onClick={() => acceptLead(lead._id, lead.tier)} className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20">Accept Case</button>
                      <button className="px-6 py-3 border border-white/10 font-bold text-xs uppercase tracking-wider text-slate-500 rounded-lg hover:bg-white/5 hover:text-white transition">Pass</button>
                    </div>
                  </div>
                ))}
                {leads.length === 0 && <p className="text-center text-slate-500 py-10">No active leads available.</p>}
              </motion.div>
            )}

          </div>

          {/* RIGHT SIDEBAR (4 COLS) */}
          <div className="col-span-4 space-y-6">
            {/* CALENDAR */}
            <div className="bg-[#0f172a] rounded-3xl p-4 border border-white/10 shadow-lg h-[380px] overflow-hidden">
              <CalendarWidget user={user} />
            </div>

            {/* UPCOMING MEETINGS */}
            <div className="bg-[#0f172a] rounded-3xl p-6 border border-white/10 shadow-lg">
              <h3 className="font-bold text-lg text-white mb-4">Agenda</h3>
              {appointments.length === 0 ? <p className="text-xs text-slate-500">No meetings scheduled.</p> : (
                <div className="space-y-3">
                  {appointments.slice(0, 3).map(apt => (
                    <div key={apt._id} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-xs text-white">{apt.clientId?.name || "Client"}</p>
                        <p className="text-[10px] text-slate-500">{new Date(apt.date).toLocaleDateString()} • {apt.slot}</p>
                      </div>
                      {apt.status === 'confirmed' ? (
                        <button onClick={() => window.open(`${window.location.origin}/meet/${apt._id}`, "_blank")} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-md text-[10px] font-bold border border-purple-500/30 hover:bg-purple-500/30 transition">Join</button>
                      ) : <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-md text-[10px] font-bold uppercase border border-amber-500/30">Pending</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}

function NavItem({ icon, label, to, count, active, onClick }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClick) onClick();
    if (to) navigate(to);
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
      {count !== undefined && <span className="text-[10px] font-bold bg-indigo-500 text-white px-2 py-0.5 rounded-md shadow-lg shadow-indigo-500/40">{count}</span>}
    </div>
  )
}
