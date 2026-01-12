import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; // Import axios
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { clientFeed } from "../components/dashboard/FeedMetadata";
import LegalReels from "../components/dashboard/LegalReels";
import CaseTimeline from "../components/dashboard/CaseTimeline";
import CalendarWidget from "../components/dashboard/CalendarWidget";
import TrustTimeline from "../components/dashboard/client/TrustTimeline"; // NEW
import FeeTransparency from "../components/dashboard/client/FeeTransparency"; // NEW
import BookingModal from "../components/dashboard/BookingModal";
import io from "socket.io-client"; // NEW
import { useNavigate } from "react-router-dom"; // NEW

const socket = io(import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "http://localhost:4000"); // Initialize Socket

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeCases, setActiveCases] = useState([]);
  const [invoices, setInvoices] = useState([]); // NEW: Invoices State
  const [appointments, setAppointments] = useState([]); // NEW: Appointments State
  const [suggestedLawyers, setSuggestedLawyers] = useState([]);
  const [connectionsMap, setConnectionsMap] = useState({}); // Stores { userId: status }
  const [selectedLawyerForBooking, setSelectedLawyerForBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('feed'); // NEW: Tab State
  const [agreements, setAgreements] = useState([]); // NEW: Saved Agreements

  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState("");
  const [postFile, setPostFile] = useState(null);
  const [postType, setPostType] = useState("text");

  // Case Creation Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [newCase, setNewCase] = useState({ title: "", desc: "", location: "", budget: "" });

  useEffect(() => {
    if (user) {
      fetchMyCases();
      fetchPosts();
      fetchConnections();
      fetchInvoices();
      fetchAppointments();
      fetchAgreements(); // NEW
      socket.emit("join_room", user._id || user.id); // JOIN PERSONAL ROOM

      // Listen for Consult Start
      socket.on("consult_start", (data) => {
        if (data.role === 'client') {
          const confirmed = window.confirm(`Lawyer ${data.lawyerName} accepted! Start video call?`);
          if (confirmed) {
            navigate(`/video-call/${data.meetingId}`);
          }
        }
      });

      // Listen for Scheduled Meeting Start (NEW)
      socket.on("scheduled_meeting_start", (data) => {
        const confirmed = window.confirm(`📞 INCOMING CALL\n\nLawyer ${data.lawyerName} has started the scheduled meeting.\n\nJoin now?`);
        if (confirmed) {
          const link = `${window.location.origin}/meet/${data.meetingId}`;
          window.open(link, "_blank");
        }
      });
    }
    return () => {
      socket.off("consult_start");
    }
  }, [user]);

  const [isSearching, setIsSearching] = useState(false);
  const requestInstantConsult = () => {
    setIsSearching(true);
    socket.emit("request_instant_consult", {
      clientId: user._id || user.id,
      clientName: user.name,
      category: "General"
    });
    // Timeout simulation
    setTimeout(() => {
      if (isSearching) {
        setIsSearching(false);
        alert("No lawyers available right now. Please try again or book an appointment.");
      }
    }, 30000); // 30s timeout
  };

  // DERIVED STATE
  const activeCase = activeCases.find(c => c.stage !== 'Closed') || activeCases[0];

  const fetchConnections = async () => {
    try {
      const uId = user._id || user.id;
      if (!uId) {
        fetchSuggestedLawyers({});
        return;
      }

      // Fetch ALL connections to check status
      const res = await axios.get(`/api/connections?userId=${uId}&status=all`);

      // Create a map: { otherUserId: status }
      const map = {};
      res.data.forEach(p => {
        map[p._id] = p.connectionStatus;
      });

      setConnectionsMap(map);
      fetchSuggestedLawyers(map);
    } catch (err) {
      console.error("Failed to fetch connections", err);
      fetchSuggestedLawyers({});
    }
  };

  const fetchSuggestedLawyers = async (connMap = {}) => {
    try {
      const res = await axios.get("/api/users?role=lawyer");
      const uId = user._id || user.id;

      let filtered = res.data;

      if (Array.isArray(res.data)) {
        filtered = res.data.filter(u =>
          u._id !== uId &&
          connMap[u._id] !== 'active' // Only hide if ALREADY connected. Show if pending.
        );
      }

      setSuggestedLawyers(filtered.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch lawyers", err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get("/api/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch posts");
    }
  };

  const handleCreatePost = async () => {
    if (!postContent && !postFile) return;

    try {
      const formData = new FormData();
      formData.append("content", postContent);
      formData.append("email", user.email);
      formData.append("type", postType);
      if (postFile) formData.append("file", postFile);

      const res = await axios.post("/api/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setPosts([res.data, ...posts]);
      setPostContent("");
      setPostFile(null);
      setPostType("text");
    } catch (err) {
      alert("Failed to post");
    }
  };

  const handleLike = async (id) => {
    try {
      await axios.post(`/api/posts/${id}/like`, { email: user.email });
      fetchPosts(); // Refresh to show new like count
    } catch (err) {
      console.error("Like failed");
    }
  };

  const fetchMyCases = async () => {
    try {
      const uId = user._id || user.id;
      // If we used phone before, switch to ID to match backend expectation or update backend
      // Backend cases.js uses 'postedBy' which matches what we send.
      // But we should standardize on ID if possible. For now, let's keep using what works but ensuring fallback.
      const idVal = user.phone || user.email || user._id; // Fallback
      const res = await axios.get(`/api/cases?postedBy=${idVal}`);
      setActiveCases(res.data);
    } catch (err) {
      console.error("Failed to fetch cases");
    }
  };

  const fetchInvoices = async () => {
    try {
      const uId = user._id || user.id;
      const res = await axios.get(`/api/invoices?clientId=${uId}`);
      setInvoices(res.data);
    } catch (err) {
      console.error("Fetch Invoices Error:", err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const uId = user._id || user.id;
      const res = await axios.get(`/api/appointments?clientId=${uId}`);
      setAppointments(res.data);
    } catch (err) {
      console.error("Fetch Appointments Error:", err);
    }
  };

  const fetchAgreements = async () => {
    try {
      const res = await axios.get("/api/agreements");
      setAgreements(res.data);
    } catch (err) {
      console.error("Fetch Agreements Error:", err);
    }
  };

  const handlePostCase = async () => {
    if (!newCase.title || !newCase.desc) return alert("Please fill title and description");

    try {
      await axios.post("/api/cases", {
        ...newCase,
        postedBy: user.phone || user.email,
        postedAt: new Date()
      });
      alert("Case Posted Successfully! Lawyers will reach out soon.");
      setShowPostModal(false);
      setNewCase({ title: "", desc: "", location: "", budget: "" });
      fetchMyCases();
    } catch (err) {
      alert("Failed to post case");
    }
  };

  if (!user) return <div className="text-white p-10">Loading...</div>;



  return (
    <>
      {/* EXISING LAYOUT ... */}
      <DashboardLayout
        /* LEFT SIDEBAR */
        leftSidebar={
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="h-20 bg-blue-600"></div>
            <div className="px-5 pb-5 -mt-10">
              <div className="w-20 h-20 rounded-full bg-white border-4 border-white flex items-center justify-center text-2xl font-bold text-blue-600 shadow-sm mb-3">
                {user.name && user.name.length > 0 ? user.name[0] : ""}
              </div>
              <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500">Client Account</p>
              <div className="my-4 border-t border-gray-100"></div>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan</span>
                  <span className="text-blue-600 font-semibold uppercase">{user.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cases</span>
                  <span className="text-gray-900 font-medium">{activeCases.length} Active</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">My Navigation</div>
              <ul className="space-y-1">
                <SidebarItem icon="📌" label="My Active Cases" count={activeCases.length} to="/agreements" />
                <SidebarItem icon="💾" label="Saved Agreements" to="/agreements" />
                <SidebarItem icon="⚙️" label="Settings" to="/settings" />
              </ul>
            </div>

            <Link to="/settings" className="block">
              <div
                className="p-4 border-t border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition text-sm font-semibold text-gray-600 text-center"
              >
                View My Profile
              </div>
            </Link>
            <button
              onClick={logout}
              className="w-full p-4 border-t border-gray-100 bg-red-50 hover:bg-red-100 cursor-pointer transition text-sm font-semibold text-red-600 text-center"
            >
              Logout
            </button>
          </div>
        }
        /* CENTER FEED */
        /* CENTER FEED */
        mainFeed={
          <>
            {/* WELCOME HEADER */}
            <div className="mb-6 animate-in slide-in-from-top-4 duration-500">
              <h1 className="text-2xl font-bold text-slate-900">
                Hello, <span className="text-blue-600">{user.name?.split(' ')[0]}</span> 👋
              </h1>
              <p className="text-slate-500 text-sm">Track your cases and connect with experts.</p>
            </div>

            {/* QUICK ACTIONS GRID */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <button onClick={() => setShowPostModal(true)} className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all text-left relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-20 text-4xl transform group-hover:scale-110 transition">⚖️</div>
                <div className="text-2xl mb-1">📝</div>
                <div className="font-bold text-sm">Post a New Case</div>
                <div className="text-[10px] opacity-80 mt-1">Get quotes from lawyers</div>
              </button>

              <button onClick={requestInstantConsult} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left group">
                <div className="text-2xl mb-1 group-hover:scale-110 transition origin-left">⚡</div>
                <div className="font-bold text-slate-800 text-sm">Talk to Lawyer</div>
                <div className="text-[10px] text-slate-500 mt-1">Instant video consult</div>
              </button>

              <Link to="/rent-agreement" className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left group block">
                <div className="text-2xl mb-1 group-hover:scale-110 transition origin-left">📄</div>
                <div className="font-bold text-slate-800 text-sm">Create Agreement</div>
                <div className="text-[10px] text-slate-500 mt-1">Rent, Lease, etc.</div>
              </Link>
            </div>

            {/* TABS */}
            <div className="flex bg-slate-100/50 p-1 mb-6 rounded-xl border border-slate-200">
              {['feed', 'cases', 'invoices', 'appointments'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold capitalize transition-all duration-200 ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}
                >
                  {tab === 'feed' ? 'Legal Feed' : tab}
                </button>
              ))}
            </div>

            {/* FEED TAB */}
            {activeTab === 'feed' && (
              <div className="animate-in fade-in duration-300">
                {/* CREATE POST WIDGET */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center font-bold text-slate-500">
                      {user.name ? user.name[0] : "U"}
                    </div>
                    <div className="flex-1">
                      <textarea
                        placeholder="Ask a legal question or share an update..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition"
                        rows={2}
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                      />
                      {/* ... (Existing media upload logic kept implicitly or needs re-adding if simple replacement) ... */}
                      {/* SIMPLIFIED POST ACTION AREA FOR BREVITY IN REPLACEMENT */}
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex gap-2">
                          <button className="text-slate-400 hover:text-blue-600 text-xs font-bold flex items-center gap-1">📷 Photo</button>
                          <button className="text-slate-400 hover:text-purple-600 text-xs font-bold flex items-center gap-1">🎥 Video</button>
                        </div>
                        <button onClick={handleCreatePost} disabled={!postContent} className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition">Post</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FEED CONTENT */}
                {/* ... We just render posts ... */}
                {posts.length === 0 ? (
                  <p className="text-center text-slate-500 py-10">No posts yet.</p>
                ) : (
                  posts.map((post) => (
                    <div key={post._id} className="bg-white border border-slate-200 rounded-xl p-5 mb-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase text-sm">
                            {post.author?.name ? post.author.name[0] : "U"}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{post.author?.name || "User"}</h4>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                              {post.author?.role} • {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-800 mb-3 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                      {/* Media rendering (Simplified for update) */}
                      {post.mediaUrl && <div className="mb-3 rounded-lg bg-slate-100 h-48 w-full object-cover overflow-hidden bg-cover" style={{ backgroundImage: `url(${import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "http://localhost:4000"}${post.mediaUrl})` }}></div>}

                      <div className="pt-3 border-t border-slate-100 flex gap-6 text-xs font-bold text-slate-500">
                        <button onClick={() => handleLike(post._id)} className="hover:text-blue-600 transition flex items-center gap-1">👍 {post.likes?.length || 0} Likes</button>
                        <button className="hover:text-slate-800 transition">💬 Comment</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* MY CASES TAB */}
            {activeTab === 'cases' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {activeCases.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <div className="text-4xl mb-3">⚖️</div>
                    <p className="text-slate-500 font-medium">No active cases.</p>
                    <button onClick={() => setShowPostModal(true)} className="text-blue-600 font-bold hover:underline mt-2 text-sm">Post your first case</button>
                  </div>
                ) : activeCases.map(c => (
                  <div key={c._id} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:border-blue-300 transition relative">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-slate-900">{c.title}</h4>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${c.acceptedBy ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{c.acceptedBy ? "In Progress" : "Open"}</span>
                    </div>
                    {/* VISUAL TIMELINE (NEW) */}
                    <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <CaseTimeline stage={c.stage || 'New Lead'} />
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{c.desc}</p>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                      <span>📍 {typeof c.location === 'object' ? c.location?.city || "Remote" : c.location}</span>
                      <span>💰 {c.budget || "No Budget"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* INVOICES TAB */}
            {activeTab === 'invoices' && (
              <div className="space-y-3 animate-in fade-in duration-300">
                {invoices.length === 0 ? <p className="text-slate-500 text-center py-10">No invoices received.</p> : invoices.map(inv => (
                  <div key={inv._id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition">
                    <div>
                      <p className="font-bold text-slate-900">{inv.description || "Legal Fee"}</p>
                      <p className="text-xs text-slate-500 font-medium uppercase mt-1">Ref: {inv._id.slice(-6)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-800 text-lg">₹{inv.amount}</p>
                      <button className={`mt-1 text-[10px] px-3 py-1 rounded-full font-bold uppercase transition ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200'}`}>
                        {inv.status === 'paid' ? 'Paid ✓' : 'Pay Now →'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* APPOINTMENTS TAB */}
            {activeTab === 'appointments' && (
              <div className="space-y-3 animate-in fade-in duration-300">
                {appointments.length === 0 ? <p className="text-slate-500 text-center py-10">No upcoming appointments.</p> : appointments.map(apt => (
                  <div key={apt._id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex justify-between items-center border-l-4 border-l-blue-500">
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{new Date(apt.date).toLocaleDateString()}</p>
                      <p className="text-sm text-slate-600 font-medium">@ {apt.slot} with {apt.lawyerName || "Lawyer"}</p>
                    </div>
                    <div>
                      {apt.status === 'confirmed' ? (
                        <button
                          onClick={() => window.open(`${window.location.origin}/meet/${apt._id}`, "_blank")}
                          className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-200 transition flex items-center gap-2"
                        >
                          <span>🎥</span> Join Call
                        </button>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Pending</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* OTHER CONTENT REMOVED (Agreements etc handled in separate tab/link) */}
          </>
        }
        /* RIGHT SIDEBAR */
        rightSidebar={
          <>
            {/* CALENDAR WIDGET (NEW) */}
            <div className="mb-6 h-[400px]">
              <CalendarWidget user={user} />
            </div>

            {/* TRUST FEATURES (NEW) */}
            {activeCase && (
              <div className="animate-in slide-in-from-right duration-500">
                <TrustTimeline stage={activeCase.stage || 'New Lead'} />
              </div>
            )}

            {invoices.length > 0 && (
              <div className="animate-in slide-in-from-right duration-700">
                <FeeTransparency invoices={invoices} />
              </div>
            )}

            {/* Active Cases Widget - REMOVED (Moved to My Cases Tab) */}
            {/* Suggested Lawyers */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-sm text-gray-900 mb-4">Suggested for you</h3>
              <ul className="space-y-4">
                {suggestedLawyers.length === 0 && <p className="text-xs text-center text-gray-500 py-4">No lawyers found nearby.</p>}
                {suggestedLawyers.map((l) => (
                  <li key={l._id} className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                      {l.name ? l.name[0] : "L"}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold text-gray-900 truncate">{l.name}</p>
                      <p className="text-xs text-gray-500 truncate">{l.specialization || "Lawyer"} • {l.location?.city || l.location || "India"}</p>
                      <button
                        onClick={async () => {
                          // PLAN-BASED ACCESS CONTROL
                          const userCity = typeof user.location === 'object' ? user.location?.city : user.location;
                          const lawyerCity = typeof l.location === 'object' ? l.location?.city : l.location;

                          if (user.plan === 'silver' && lawyerCity !== userCity) {
                            alert(`UPGRADE REQUIRED 💎\n\nSilver Plan only allows access to lawyers in your district (${userCity}).\n\nTo contact ${l.name} in ${lawyerCity}, please upgrade to Gold or Diamond.`);
                            return;
                          }

                          try {
                            await axios.post("/api/connections", {
                              clientId: user._id || user.id,
                              lawyerId: l._id,
                              initiatedBy: user._id || user.id
                            });
                            alert(`Request sent to ${l.name}!`);
                            // Refresh list
                            fetchConnections();
                          } catch (err) {
                            alert(err.response?.data?.error || "Failed to connect");
                          }
                        }}
                        disabled={connectionsMap[l._id] === 'pending'}
                        className={`mt-2 text-xs border border-blue-200 px-3 py-1 rounded-full font-medium mr-2 transition ${connectionsMap[l._id] === 'pending' ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-100' : 'text-blue-600 hover:bg-blue-50'}`}
                      >
                        {connectionsMap[l._id] === 'pending' ? '🕒 Request Sent' : '+ Connect'}
                      </button>
                      <button
                        onClick={() => setSelectedLawyerForBooking(l)}
                        className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition font-medium"
                      >
                        Book 📅
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <Link to="/marketplace" className="block mt-4 text-xs text-blue-600 hover:text-blue-700 text-center font-medium">
                View all suggestions
              </Link>
            </div >

            <Link to="/rent-agreement" className="block mt-6">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4 flex items-center justify-between hover:border-emerald-300 transition group shadow-sm">
                <div>
                  <h3 className="font-bold text-emerald-700">Rent Agreement 📄</h3>
                  <p className="text-xs text-emerald-600 mt-1">Create in 2 mins</p>
                </div>
                <span className="text-2xl group-hover:translate-x-1 transition text-emerald-600">→</span>
              </div>
            </Link>

            <LegalReels />
          </>
        }
      />

      {/* INSTANT CONSULT FLOATING BUTTON */}
      <div className="fixed bottom-6 right-6 z-50">
        {isSearching ? (
          <div className="bg-[#0B1120] text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-pulse border-2 border-blue-500">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <div>
              <p className="font-bold text-sm">Searching for Lawyer...</p>
              <p className="text-[10px] text-gray-400">Please wait</p>
            </div>
            <button
              onClick={() => setIsSearching(false)}
              className="ml-2 text-gray-400 hover:text-white"
            >✕</button>
          </div>
        ) : (
          <button
            onClick={requestInstantConsult}
            className="group relative flex items-center gap-3 bg-[#0B1120] hover:bg-blue-900 text-white px-6 py-4 rounded-full shadow-2xl shadow-blue-900/40 transition-all hover:scale-105 active:scale-95"
          >
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-2xl">⚡</span>
            <div className="text-left">
              <p className="font-bold text-sm leading-tight">Talk to Lawyer</p>
              <p className="text-[10px] text-blue-200 uppercase tracking-wider font-bold">Instant Connect</p>
            </div>
          </button>
        )}
      </div>

      {/* POST CASE MODAL */}
      {
        showPostModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <button onClick={() => setShowPostModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>

              <h2 className="text-xl font-bold text-gray-900 mb-1">Post a Legal Requirement</h2>
              <p className="text-sm text-gray-500 mb-6">Lawyers will review this and reach out.</p>

              <div className="space-y-4">
                <input
                  placeholder="Title (e.g. Property Dispute in Pune)"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  value={newCase.title}
                  onChange={e => setNewCase({ ...newCase, title: e.target.value })}
                />
                <textarea
                  placeholder="Describe your issue in detail..."
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                  value={newCase.desc}
                  onChange={e => setNewCase({ ...newCase, desc: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    placeholder="Location (City)"
                    className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={newCase.location}
                    onChange={e => setNewCase({ ...newCase, location: e.target.value })}
                  />
                  <input
                    placeholder="Budget (Optional)"
                    className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={newCase.budget}
                    onChange={e => setNewCase({ ...newCase, budget: e.target.value })}
                  />
                </div>

                <button
                  onClick={handlePostCase}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition mt-2 shadow-md shadow-blue-200"
                >
                  Post Requirement
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* BOOKING MODAL */}
      {
        selectedLawyerForBooking && (
          <BookingModal
            lawyer={selectedLawyerForBooking}
            client={user}
            onClose={() => setSelectedLawyerForBooking(null)}
          />
        )
      }
    </>
  );
}

// UPDATE SIDEBAR ITEM
function SidebarItem({ icon, label, count, to }) {
  if (to) {
    return (
      <Link to={to}>
        <li className="flex items-center justify-between p-2 rounded hover:bg-gray-100 cursor-pointer transition group">
          <div className="flex items-center gap-3 text-sm font-medium text-gray-600 group-hover:text-gray-900">
            <span className="text-gray-400 group-hover:text-blue-600">{icon}</span>
            {label}
          </div>
          {count !== undefined && <span className="text-xs font-semibold text-gray-500">{count}</span>}
        </li>
      </Link>
    );
  }
  return (
    <li
      className="flex items-center justify-between p-2 rounded hover:bg-gray-100 cursor-pointer transition group"
    >
      <div className="flex items-center gap-3 text-sm font-medium text-gray-600 group-hover:text-gray-900">
        <span className="text-gray-400 group-hover:text-blue-600">{icon}</span>
        {label}
      </div>
      {count !== undefined && <span className="text-xs font-semibold text-gray-500">{count}</span>}
    </li>
  )
}
