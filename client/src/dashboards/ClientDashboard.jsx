import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; // Import axios
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { clientFeed } from "../components/dashboard/FeedMetadata";
import LegalReels from "../components/dashboard/LegalReels";

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
      fetchInvoices(); // NEW
      fetchAppointments(); // NEW
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
        mainFeed={
          <>
            {/* NEW TABS FOR CLIENT */}
            <div className="flex bg-white border border-gray-200 rounded-lg p-1 mb-6">
              <button onClick={() => setActiveTab('feed')} className={`flex-1 py-2 rounded-md text-sm font-bold transition ${activeTab === 'feed' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>Legal Feed</button>
              <button onClick={() => setActiveTab('cases')} className={`flex-1 py-2 rounded-md text-sm font-bold transition ${activeTab === 'cases' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>My Cases</button>
              <button onClick={() => setActiveTab('invoices')} className={`flex-1 py-2 rounded-md text-sm font-bold transition ${activeTab === 'invoices' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>Invoices</button>
              <button onClick={() => setActiveTab('appointments')} className={`flex-1 py-2 rounded-md text-sm font-bold transition ${activeTab === 'appointments' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>Appointments</button>
            </div>

            {/* FEED TAB */}
            {activeTab === 'feed' && (
              <>
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="font-semibold text-gray-700">Your Legal Feed</h3>
                  <span className="text-xs text-gray-500">Sorted by relevance</span>
                </div>
                {/* EXISTING FEED LOGIC WILL GO BELOW IF WE WRAP IT OR LEAVE AS IS... */}
              </>
            )}

            {/* MY CASES TAB */}
            {activeTab === 'cases' && (
              <div className="space-y-4">
                {activeCases.length === 0 ? <p className="text-gray-500 text-center py-10">No active cases posted.</p> : activeCases.map(c => (
                  <div key={c._id} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between">
                      <h4 className="font-bold text-gray-900">{c.title}</h4>
                      <span className={`px-2 py-0.5 rounded textxs font-bold uppercase ${c.acceptedBy ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.acceptedBy ? "Accepted" : "Open"}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{c.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* INVOICES TAB */}
            {activeTab === 'invoices' && (
              <div className="space-y-3">
                {invoices.length === 0 ? <p className="text-gray-500 text-center py-10">No invoices received.</p> : invoices.map(inv => (
                  <div key={inv._id} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">{inv.description || "Legal Services"}</p>
                      <p className="text-xs text-gray-500">From Lawyer ID: {inv.lawyerId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600 text-lg">₹{inv.amount}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{inv.status}</span>
                      {inv.status !== 'paid' && <button className="block mt-1 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Pay Now</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* APPOINTMENTS TAB */}
            {activeTab === 'appointments' && (
              <div className="space-y-3">
                {appointments.length === 0 ? <p className="text-gray-500 text-center py-10">No upcoming appointments.</p> : appointments.map(apt => (
                  <div key={apt._id} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">{new Date(apt.date).toDateString()} @ {apt.slot}</p>
                      <p className="text-xs text-gray-500">Lawyer: {apt.lawyerName || "Unknown"}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{apt.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ONLY SHOW POST WIDGET & FEED IF TAB IS FEED */}
            {activeTab === 'feed' && (
              <>
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-500">
                      {user.name ? user.name[0] : "U"}
                    </div>
                    <div className="flex-1">
                      <textarea
                        placeholder="Start a post or ask a legal question..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 outline-none resize-none"
                        rows={2}
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                      />

                      {postFile && (
                        <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                          <span>📎 Attached: {postFile.name}</span>
                          <button onClick={() => setPostFile(null)} className="text-red-500 hover:text-red-700">✕</button>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-3">
                        <div className="flex gap-2">
                          <label className="cursor-pointer flex items-center gap-1 text-gray-500 hover:text-blue-600 text-sm font-medium px-2 py-1 rounded hover:bg-gray-100 transition">
                            <span>📷</span> Media
                            <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => setPostFile(e.target.files[0])} />
                          </label>

                          <label className="cursor-pointer flex items-center gap-1 text-gray-500 hover:text-purple-600 text-sm font-medium px-2 py-1 rounded hover:bg-gray-100 transition">
                            <span>🎥</span> Reel
                            <input type="file" className="hidden" accept="video/mp4" onChange={(e) => {
                              setPostType("reel");
                              setPostFile(e.target.files[0]);
                            }} />
                          </label>
                        </div>

                        <button
                          onClick={handleCreatePost}
                          disabled={!postContent && !postFile}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* END CREATE POST WIDGET / START FEED ITEMS */}

                {/* Feed Items */}
                {posts.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">No posts yet. Be the first to share something!</p>
                ) : (
                  posts.map((post) => (
                    <div key={post._id} className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                            {post.author?.name ? post.author.name[0] : "U"}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-gray-900">{post.author?.name || "Unknown User"}</h4>
                            <p className="text-xs text-gray-500">
                              {post.author?.role} • {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>

                      {post.mediaUrl && (
                        <div className="mb-4 rounded-lg overflow-hidden border border-gray-100 bg-black">
                          {post.type === "reel" || post.mediaUrl.endsWith(".mp4") ? (
                            <video src={`${import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "http://localhost:4000"}${post.mediaUrl}`} controls className="w-full max-h-[400px]" />
                          ) : (
                            <img src={`${import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "http://localhost:4000"}${post.mediaUrl}`} alt="Post attachment" className="w-full object-cover" />
                          )}
                        </div>
                      )
                      }

                      <div className="mt-4 pt-3 border-t border-gray-100 flex gap-6 text-sm text-gray-500">
                        <button
                          onClick={() => handleLike(post._id)}
                          className={`hover:text-blue-600 transition flex items-center gap-1 ${post.likes?.includes(user._id) ? "text-blue-600 font-bold" : ""}`}
                        >
                          👍 {post.likes?.length || 0} Likes
                        </button>
                        <button
                          onClick={() => alert("Comments section coming soon!")}
                          className="hover:text-gray-900 transition flex items-center gap-1"
                        >
                          💬 {post.comments?.length || 0} Comments
                        </button>
                        <button
                          onClick={() => alert("Post link copied to clipboard! (Simulated)")}
                          className="hover:text-gray-900 transition"
                        >
                          Share
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </>
        }
        /* RIGHT SIDEBAR */
        rightSidebar={
          <>
            {/* Active Cases Widget */}
            < div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm" >
              <h3 className="font-bold text-sm text-gray-900 mb-4">Your Active Cases</h3>
              <ul className="space-y-3">
                {activeCases.length === 0 && <li className="text-xs text-gray-500">No active cases. Post one above!</li>}
                {activeCases.map((c) => (
                  <li key={c._id} className="text-sm border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                    <p className="text-gray-800 font-medium truncate">{c.title}</p>
                    <p className="text-xs text-orange-500 mt-1">• {c.acceptedBy ? `Accepted by ${c.acceptedBy}` : "Open / Review Pending"}</p>
                  </li>
                ))}
              </ul>
              <Link to="/agreements" className="block mt-4 text-xs text-blue-600 hover:underline pb-1 font-medium">
                View all cases →
              </Link>
            </div >

            {/* Suggested Lawyers */}
            < div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm" >
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
                          if (user.plan === 'silver' && l.location !== user.location) {
                            alert(`UPGRADE REQUIRED 💎\n\nSilver Plan only allows access to lawyers in your district (${user.location}).\n\nTo contact ${l.name} in ${l.location}, please upgrade to Gold or Diamond.`);
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
