import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import LegalReels from "../components/dashboard/LegalReels";
import CaseTimeline from "../components/dashboard/CaseTimeline";
import CalendarWidget from "../components/dashboard/CalendarWidget";
import TrustTimeline from "../components/dashboard/client/TrustTimeline";
import FeeTransparency from "../components/dashboard/client/FeeTransparency";
import BookingModal from "../components/dashboard/BookingModal";
import io from "socket.io-client";
import Skeleton from "../components/Skeleton";
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
  const [connectionsMap, setConnectionsMap] = useState({});
  const [selectedLawyerForBooking, setSelectedLawyerForBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState("");
  const [postFile, setPostFile] = useState(null);
  const [postType, setPostType] = useState("text");
  const [activeCommentBox, setActiveCommentBox] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [newCase, setNewCase] = useState({ title: "", desc: "", location: "", budget: "" });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchMyCases(),
        fetchPosts(),
        fetchConnections(),
        fetchInvoices(),
        fetchAppointments()
      ]).finally(() => setLoading(false));

      socket.emit("join_room", user._id || user.id);

      socket.on("consult_start", (data) => {
        if (data.role === 'client' && window.confirm(`Lawyer ${data.lawyerName} accepted! Start video call?`)) {
          navigate(`/video-call/${data.meetingId}`);
        }
      });

      socket.on("scheduled_meeting_start", (data) => {
        if (window.confirm(`📞 INCOMING CALL\n\nLawyer ${data.lawyerName} has started the scheduled meeting.\n\nJoin now?`)) {
          window.open(`${window.location.origin}/meet/${data.meetingId}`, "_blank");
        }
      });
    }
    return () => {
      socket.off("consult_start");
      socket.off("scheduled_meeting_start");
    }
  }, [user]);

  const requestInstantConsult = () => {
    setIsSearching(true);
    socket.emit("request_instant_consult", {
      clientId: user._id || user.id,
      clientName: user.name,
      category: "General"
    });
    setTimeout(() => {
      if (isSearching) {
        setIsSearching(false);
        alert("No lawyers available right now. Please try again or book an appointment.");
      }
    }, 30000);
  };

  const fetchConnections = async () => {
    try {
      const uId = user._id || user.id;
      if (!uId) return fetchSuggestedLawyers({});
      const res = await axios.get(`/api/connections?userId=${uId}&status=all`);
      const map = {};
      res.data.forEach(p => map[p._id] = p.connectionStatus);
      setConnectionsMap(map);
      fetchSuggestedLawyers(map);
    } catch (err) { fetchSuggestedLawyers({}); }
  };

  const fetchSuggestedLawyers = async (connMap = {}) => {
    try {
      const res = await axios.get("/api/users?role=lawyer");
      const uId = user._id || user.id;
      let filtered = res.data;
      if (Array.isArray(res.data)) {
        filtered = res.data.filter(u => u._id !== uId && connMap[u._id] !== 'active');
      }
      setSuggestedLawyers(filtered.slice(0, 5));
    } catch (err) { console.error(err); }
  };

  const fetchPosts = async () => axios.get("/api/posts").then(res => setPosts(res.data)).catch(console.error);
  const fetchMyCases = async () => axios.get(`/api/cases?postedBy=${user.phone || user.email || user._id}`).then(res => setActiveCases(res.data || [])).catch(console.error);
  const fetchInvoices = async () => axios.get(`/api/invoices?clientId=${user._id || user.id}`).then(res => setInvoices(res.data)).catch(console.error);
  const fetchAppointments = async () => axios.get(`/api/appointments?clientId=${user._id || user.id}`).then(res => setAppointments(res.data)).catch(console.error);

  const handleCreatePost = async () => {
    if (!postContent && !postFile) return;
    try {
      const formData = new FormData();
      formData.append("content", postContent);
      formData.append("email", user.email);
      formData.append("type", postType);
      if (postFile) formData.append("file", postFile);
      const res = await axios.post("/api/posts", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setPosts([res.data, ...posts]);
      setPostContent("");
      setPostFile(null);
    } catch (err) { alert("Failed to post"); }
  };

  const handleLike = async (id) => {
    try { await axios.post(`/api/posts/${id}/like`, { email: user.email }); fetchPosts(); } catch (err) { console.error("Like failed"); }
  };

  const handleComment = async (postId) => {
    if (!commentText) return;
    try {
      await axios.post(`/api/posts/${postId}/comment`, { email: user.email, text: commentText });
      setCommentText("");
      setActiveCommentBox(null);
      fetchPosts();
    } catch (err) { alert("Failed to post comment"); }
  };

  const handlePostCase = async () => {
    if (!newCase.title || !newCase.desc) return alert("Please fill title and description");
    try {
      await axios.post("/api/cases", { ...newCase, postedBy: user.phone || user.email, postedAt: new Date() });
      alert("Case Posted Successfully!");
      setShowPostModal(false);
      setNewCase({ title: "", desc: "", location: "", budget: "" });
      fetchMyCases();
    } catch (err) { alert("Failed to post case"); }
  };

  if (loading || !user) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading Workspace...</p>
      </div>
    </div>
  );

  const activeCase = activeCases.find(c => c.stage !== 'Closed') || activeCases[0];

  return (
    <DashboardLayout
      leftSidebar={
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>
          <div className="h-24 bg-[#0B1120] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
          </div>
          <div className="px-6 pb-6 -mt-12 relative z-10">
            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-xl mb-4">
              <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400 uppercase">
                {user.name?.[0]}
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-sm font-medium text-slate-500">Premium Client</p>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500">Plan</span>
                <span className="font-bold text-indigo-600 uppercase tracking-wider text-xs bg-indigo-50 px-2 py-0.5 rounded-md">{user.plan}</span>
              </div>
              <div className="flex justify-between text-sm p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500">Active Cases</span>
                <span className="font-bold text-slate-900">{activeCases.length}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Menu</p>
              <nav className="space-y-1">
                <SidebarItem icon="⚡" label="Active Cases" count={activeCases.length} />
                <SidebarItem icon="📂" label="Documents" to="/agreements" />
                <SidebarItem icon="⚙️" label="Settings" to="/settings" />
              </nav>
            </div>

            <button onClick={logout} className="w-full mt-6 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition flex items-center justify-center gap-2">
              <span>🚪</span> Logout
            </button>
          </div>
        </div>
      }

      mainFeed={
        <>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-500 mt-1">Here is what's happening with your legal matters.</p>
          </motion.div>

          {/* QUICK ACTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <motion.button whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowPostModal(true)}
              className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl shadow-blue-900/20 text-left">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition duration-500">📝</div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl mb-4">⚖️</div>
                <h3 className="font-bold text-lg">Post New Case</h3>
                <p className="text-blue-100 text-xs mt-1">Get quotes from top lawyers</p>
              </div>
            </motion.button>

            <motion.button whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={requestInstantConsult}
              className="group relative overflow-hidden bg-white border border-slate-200 p-6 rounded-2xl text-left hover:border-blue-300 transition shadow-sm hover:shadow-lg">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl rotate-12 group-hover:rotate-0 transition duration-500 text-slate-900">⚡</div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-4">📞</div>
                <h3 className="font-bold text-slate-900 text-lg">Instant Consult</h3>
                <p className="text-slate-500 text-xs mt-1">Video call immediately</p>
              </div>
            </motion.button>

            <motion.Link to="/rent-agreement" whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden bg-white border border-slate-200 p-6 rounded-2xl text-left hover:border-emerald-300 transition shadow-sm hover:shadow-lg block">
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-4">📄</div>
                <h3 className="font-bold text-slate-900 text-lg">Draft Agreement</h3>
                <p className="text-slate-500 text-xs mt-1">Rent, Lease, Affidavits</p>
              </div>
            </motion.Link>
          </div>

          {/* TABS */}
          <div className="flex bg-slate-100/80 backdrop-blur-sm p-1.5 rounded-xl border border-slate-200/50 mb-6 w-fit">
            {['feed', 'cases', 'invoices', 'appointments'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all duration-300 ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {tab === 'feed' ? 'Legal Feed' : tab}
              </button>
            ))}
          </div>

          {/* FEED CONTENT */}
          <AnimatePresence mode="wait">
            {activeTab === 'feed' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                {/* Create Post */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold shrink-0">{user.name?.[0]}</div>
                    <div className="flex-1">
                      <textarea
                        value={postContent} onChange={e => setPostContent(e.target.value)}
                        placeholder="Share a legal question or update..."
                        className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none resize-none placeholder-slate-400 transition"
                        rows={2}
                      />
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex gap-4 text-slate-400 text-sm font-bold">
                          <button className="hover:text-blue-600 flex items-center gap-1 transition">📷 Photo</button>
                          <button className="hover:text-purple-600 flex items-center gap-1 transition">🎥 Video</button>
                        </div>
                        <button onClick={handleCreatePost} disabled={!postContent} className="px-5 py-2 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-slate-800 disabled:opacity-50 transition shadow-lg shadow-slate-200">Post</button>
                      </div>
                    </div>
                  </div>
                </div>

                {posts.map(post => (
                  <div key={post._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                        {post.author?.name?.[0] || "U"}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{post.author?.name}</h4>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">{post.author?.role} • {new Date(post.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    {post.mediaUrl && <div className="mt-3 rounded-xl bg-slate-100 h-64 w-full bg-cover bg-center" style={{ backgroundImage: `url(${import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "http://localhost:4000"}${post.mediaUrl})` }}></div>}

                    <div className="mt-4 pt-4 border-t border-slate-50 flex gap-6 text-xs font-bold text-slate-500">
                      <button onClick={() => handleLike(post._id)} className="hover:text-blue-600 flex items-center gap-1.5 transition">
                        <span className="text-lg">👍</span> {post.likes?.length || 0} Likes
                      </button>
                      <button onClick={() => setActiveCommentBox(activeCommentBox === post._id ? null : post._id)} className="hover:text-slate-900 flex items-center gap-1.5 transition">
                        <span className="text-lg">💬</span> {post.comments?.length || 0} Comments
                      </button>
                    </div>

                    {activeCommentBox === post._id && (
                      <div className="mt-4 pt-4 border-t border-slate-50 animate-in fade-in">
                        {post.comments?.map((c, i) => (
                          <div key={i} className="mb-2 text-xs flex gap-2">
                            <span className="font-bold text-slate-900">{c.user?.name}</span>
                            <span className="text-slate-600">{c.text}</span>
                          </div>
                        ))}
                        <div className="flex gap-2 mt-3">
                          <input className="flex-1 bg-slate-50 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-200" placeholder="Write a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleComment(post._id)} />
                          <button onClick={() => handleComment(post._id)} className="text-blue-600 font-bold text-xs">Post</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {posts.length === 0 && <p className="text-center text-slate-400 py-10">No posts yet.</p>}
              </motion.div>
            )}

            {activeTab === 'cases' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {activeCases.map(c => (
                  <div key={c._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-blue-300 transition group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${c.acceptedBy ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' : 'bg-amber-50 text-amber-600 ring-1 ring-amber-100'}`}>{c.acceptedBy ? "Active" : "Open"}</span>
                          <span className="text-xs font-semibold text-slate-400">{new Date(c.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition">{c.title}</h3>
                      </div>
                      <span className="text-2xl font-black text-slate-200">₹{c.budget || "0"}</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
                      <CaseTimeline stage={c.stage || 'New Lead'} />
                    </div>
                    <p className="text-sm text-slate-600">{c.desc}</p>
                  </div>
                ))}
                {activeCases.length === 0 && (
                  <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl">
                    <div className="text-4xl opacity-20 mb-3">⚖️</div>
                    <p className="text-slate-500 font-bold">No active cases</p>
                    <button onClick={() => setShowPostModal(true)} className="text-blue-600 text-sm font-bold hover:underline mt-2">Post your first case</button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'invoices' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                {invoices.map(inv => (
                  <div key={inv._id} className="bg-white border border-slate-200 p-5 rounded-2xl flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{inv.status === 'paid' ? '✓' : '⏳'}</div>
                      <div>
                        <h4 className="font-bold text-slate-900">{inv.description || "Legal Fee"}</h4>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Ref: {inv._id.slice(-6)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900">₹{inv.amount}</div>
                      <span className={`text-[10px] font-bold uppercase ${inv.status === 'paid' ? 'text-emerald-600' : 'text-blue-600 underline cursor-pointer'}`}>{inv.status === 'paid' ? 'Paid' : 'Pay Now'}</span>
                    </div>
                  </div>
                ))}
                {invoices.length === 0 && <p className="text-center text-slate-400 py-10">No invoices found.</p>}
              </motion.div>
            )}

            {activeTab === 'appointments' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                {appointments.map(apt => (
                  <div key={apt._id} className="bg-white border border-slate-200 p-5 rounded-2xl flex justify-between items-center shadow-sm border-l-4 border-l-blue-500">
                    <div>
                      <p className="font-bold text-lg text-slate-900">{new Date(apt.date).toLocaleDateString()}</p>
                      <p className="text-sm text-slate-600 font-medium">{apt.slot} • {apt.lawyerName}</p>
                    </div>
                    {apt.status === 'confirmed' ? (
                      <button onClick={() => window.open(`${window.location.origin}/meet/${apt._id}`, "_blank")} className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-100 transition flex items-center gap-2">🎥 Join</button>
                    ) : <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Pending</span>}
                  </div>
                ))}
                {appointments.length === 0 && <p className="text-center text-slate-400 py-10">No upcoming appointments.</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      }

      rightSidebar={
        <div className="space-y-6">
          {/* CALENDAR */}
          <div className="bg-white border border-slate-200 rounded-2xl p-1 shadow-sm overflow-hidden h-[380px]">
            <CalendarWidget user={user} />
          </div>

          {/* TRUST TIMELINE */}
          {activeCase && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-4">Case Progress</h3>
              <TrustTimeline stage={activeCase.stage || 'New Lead'} />
            </div>
          )}

          {/* SUGGESTED LAWYERS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 mb-4">Recommended Experts</h3>
            <div className="space-y-4">
              {suggestedLawyers.map(l => (
                <div key={l._id} className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">{l.name?.[0]}</div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{l.name}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{l.specialization || "Lawyer"} • {typeof l.location === 'object' ? l.location?.city : l.location}</p>
                  </div>
                  <button onClick={async () => {
                    const userCity = typeof user.location === 'object' ? user.location?.city : user.location;
                    const lawyerCity = typeof l.location === 'object' ? l.location?.city : l.location;
                    if (user.plan === 'silver' && lawyerCity !== userCity) return alert(`Upgrade for ${lawyerCity} lawyers.`);
                    try { await axios.post("/api/connections", { clientId: user._id || user.id, lawyerId: l._id, initiatedBy: user._id || user.id }); alert("Request sent!"); fetchConnections(); } catch (err) { alert("Failed"); }
                  }} disabled={connectionsMap[l._id] === 'pending'} className={`text-[10px] px-3 py-1.5 rounded-full font-bold transition border ${connectionsMap[l._id] === 'pending' ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}>
                    {connectionsMap[l._id] === 'pending' ? 'Sent' : 'Connect'}
                  </button>
                </div>
              ))}
              {suggestedLawyers.length === 0 && <p className="text-xs text-slate-400 text-center">No nearby lawyers found.</p>}
            </div>
          </div>
        </div>
      }
    />
  );
}

function SidebarItem({ icon, label, count, to }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => to && navigate(to)} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition group">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-600 group-hover:text-slate-900">
        <span className="opacity-60 group-hover:opacity-100 group-hover:scale-110 transition">{icon}</span>
        {label}
      </div>
      {count !== undefined && <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md group-hover:bg-slate-200 transition">{count}</span>}
    </div>
  );
}
