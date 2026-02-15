import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import LegalReels from "../components/dashboard/LegalReels";
import CaseTimeline from "../components/dashboard/CaseTimeline";
import CalendarWidget from "../components/dashboard/CalendarWidget";
import TrustTimeline from "../components/dashboard/client/TrustTimeline";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

const socket = io(import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "http://localhost:4000");

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeCases, setActiveCases] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [suggestedLawyers, setSuggestedLawyers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'cases', 'feed'
  const [posts, setPosts] = useState([]);
  const [newCase, setNewCase] = useState({ title: "", desc: "", budget: "" });
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchMyCases(),
        fetchPosts(),
        fetchInvoices(),
        fetchAppointments(),
        fetchSuggestedLawyers()
      ]).finally(() => setLoading(false));

      socket.emit("join_room", user._id || user.id);
    }
  }, [user]);

  const fetchSuggestedLawyers = async () => {
    try {
      const res = await axios.get("/api/users?role=lawyer");
      setSuggestedLawyers(res.data.slice(0, 4));
    } catch (err) { console.error(err); }
  }

  const fetchPosts = async () => axios.get("/api/posts").then(res => setPosts(res.data)).catch(console.error);
  const fetchMyCases = async () => axios.get(`/api/cases?postedBy=${user.phone || user.email || user._id}`).then(res => setActiveCases(res.data || [])).catch(console.error);
  const fetchInvoices = async () => axios.get(`/api/invoices?clientId=${user._id || user.id}`).then(res => setInvoices(res.data)).catch(console.error);
  const fetchAppointments = async () => axios.get(`/api/appointments?clientId=${user._id || user.id}`).then(res => setAppointments(res.data)).catch(console.error);

  const handlePostCase = async () => {
    try {
      await axios.post("/api/cases", { ...newCase, postedBy: user.phone || user.email, postedAt: new Date() });
      setShowPostModal(false);
      fetchMyCases();
    } catch (err) { alert("Failed to post case"); }
  };

  if (loading || !user) return (
    <div className="flex items-center justify-center min-h-screen bg-[#020617] font-serif text-slate-400">
      <div className="animate-pulse">Loading Workspace...</div>
    </div>
  );

  const activeCase = activeCases.find(c => c.stage !== 'Closed') || activeCases[0];

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
            <NavItem icon="📊" label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavItem icon="⚖️" label="My Matters" active={activeTab === 'cases'} onClick={() => setActiveTab('cases')} />
            <NavItem icon="📄" label="Documents" to="/agreements" />
            <NavItem icon="card" label="Payments" active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />
            <NavItem icon="📡" label="Legal Feed" active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
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
                <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">{user.plan || "Premium"}</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
              <span>Cases: {activeCases.length}</span>
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
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Good Morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{user.name?.split(' ')[0]}</span>.
            </h1>
          </motion.div>
          <button
            onClick={() => setShowPostModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-500 transition flex items-center gap-2 shadow-lg shadow-indigo-500/20 border border-indigo-500/50"
          >
            <span>+</span> New Legal Matter
          </button>
        </header>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-12 gap-6 px-4">

          {/* PRIMARY CONTENT (8 COLS) */}
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
                    {activeCase ? activeCase.desc : "Post a new case to get started with our AI legal assistance and connect with top lawyers."}
                  </p>
                </div>
                {activeCase && <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Budget</p>
                  <p className="text-3xl font-bold text-white">₹{activeCase.budget}</p>
                </div>}
              </div>

              {activeCase ? (
                <div className="bg-[#1e293b]/50 rounded-2xl p-6 border border-white/5">
                  <TrustTimeline stage={activeCase.stage || 'New Lead'} />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center hover:bg-white/10 hover:border-indigo-500/30 transition cursor-pointer group" onClick={() => setShowPostModal(true)}>
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">📝</div>
                    <div className="font-bold text-sm text-white">Draft Contract</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center hover:bg-white/10 hover:border-indigo-500/30 transition cursor-pointer group" onClick={() => navigate('/assistant')}>
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">🤖</div>
                    <div className="font-bold text-sm text-white">Ask AI Assistant</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center hover:bg-white/10 hover:border-indigo-500/30 transition cursor-pointer group" onClick={() => navigate('/marketplace')}>
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">🔍</div>
                    <div className="font-bold text-sm text-white">Find Lawyer</div>
                  </div>
                </div>
              )}
            </div>

            {/* SECONDARY ROW: FEED & STATS */}
            <div className="grid grid-cols-2 gap-6">
              {/* FEED SUMMARY */}
              <div className="bg-[#0f172a] rounded-3xl p-6 border border-white/10 shadow-lg h-[400px] overflow-y-auto custom-scrollbar">
                <h3 className="font-bold text-lg text-white mb-4 sticky top-0 bg-[#0f172a] pb-2 border-b border-white/10 z-10">Legal Pulse</h3>
                <div className="space-y-4">
                  {posts.slice(0, 5).map(post => (
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
                        <div>
                          <p className="text-sm font-bold text-white">{apt.lawyerName}</p>
                          <p className="text-xs text-slate-500">{apt.slot}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR (4 COLS) */}
          <div className="col-span-4 space-y-6">
            {/* CALENDAR */}
            <div className="bg-[#0f172a] rounded-3xl p-4 border border-white/10 shadow-lg">
              <CalendarWidget user={user} />
            </div>

            {/* SUGGESTED LAWYERS */}
            <div className="bg-[#0f172a] rounded-3xl p-6 border border-white/10 shadow-lg">
              <h3 className="font-bold text-lg text-white mb-4">Recommended Counsel</h3>
              <div className="space-y-4">
                {suggestedLawyers.map(l => (
                  <div key={l._id} className="flex items-center gap-3 group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition">
                      {l.name?.[0]}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-white group-hover:text-indigo-400 transition">{l.name}</h4>
                      <p className="text-xs text-slate-500">{l.specialization || "Legal Expert"}</p>
                    </div>
                    <button className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition">
                      +
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/marketplace')} className="w-full mt-6 py-3 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:bg-white/5 hover:text-white transition">
                View Marketplace
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* MODAL FOR NEW CASE - Simple Glassmorphism */}
      {showPostModal && (
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
      )}

    </div>
  );
}

function NavItem({ icon, label, to, active, onClick }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClick) onClick();
    if (to) navigate(to);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ${active ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-inner font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
    >
      <span className="text-xl opacity-80">{icon}</span>
      <span className="text-sm tracking-wide font-medium">{label}</span>
    </div>
  )
}
