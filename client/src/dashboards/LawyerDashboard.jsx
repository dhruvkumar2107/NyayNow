import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { lawyerFeed, suggestedLawyers } from "../components/dashboard/FeedMetadata";
import KanbanBoard from "../components/dashboard/KanbanBoard"; // NEW
import CalendarWidget from "../components/dashboard/CalendarWidget"; // NEW
import io from "socket.io-client"; // NEW
import { useNavigate } from "react-router-dom"; // NEW

const socket = io(import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "http://localhost:4000");

export default function LawyerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("leads"); // leads, invoices, clients
  const [leads, setLeads] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [invoices, setInvoices] = useState([]); // NEW
  const [clients, setClients] = useState([]); // NEW
  const [instantCall, setInstantCall] = useState(null); // { clientId, clientName, category }
  const [unreadCount, setUnreadCount] = useState(0); // NEW

  // Social Feed State
  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState("");
  const [postFile, setPostFile] = useState(null);
  const [postType, setPostType] = useState("text");
  // Removed hardcoded topics



  useEffect(() => {
    if (user) {
      fetchLeads();
      fetchPosts();
      fetchAppointments();
      fetchRequests();
      fetchInvoices(); // NEW
      fetchClients(); // NEW
      fetchUnread(); // NEW

      // JOIN INSTANT POOL
      socket.emit("join_lawyer_pool");

      // Listen for messages
      socket.on("receive_message", (data) => {
        // If I am NOT in the messages tab, or if I am not in that specific chat (logic handled by page usually, but for global badge:)
        // Simply increment unread count if it's for me
        if (data.lawyerId === user._id || data.clientId === user._id) {
          setUnreadCount(prev => prev + 1);
        }
      });

      // Listen for leads
      socket.on("incoming_lead", (data) => {
        // Play ringtone logic here if needed
        setInstantCall(data);
      });

      // Listen for consult start (if I won the race)
      socket.on("consult_start", (data) => {
        if (data.role === 'lawyer') {
          navigate(`/video-call/${data.meetingId}`);
        }
      });
    }

    return () => {
      socket.off("incoming_lead");
      socket.off("consult_start");
    }
  }, [user]);

  const acceptInstantCall = () => {
    if (!instantCall) return;
    socket.emit("accept_consult", {
      lawyerId: user._id || user.id,
      lawyerName: user.name,
      clientId: instantCall.clientId
    });
  };

  // Social Feed State
  // ... (existing code) ...

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`/api/appointments?userId=${user._id || user.id}&role=lawyer`);
      // Filter for future appointments or relevant status
      setAppointments(res.data.filter(a => a.status !== 'rejected'));
    } catch (err) {
      console.error("Failed to fetch appointments");
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`/api/connections?userId=${user._id || user.id}&status=pending`);
      // connection objects are mixed into profile
      // We only want requests initiated by OTHERS (clients), but typically if status is pending and I am the lawyer, it's an incoming request.
      // Wait, if I initiated it (rare for lawyer), I shouldn't see accept button.
      // Filter by `initiatedBy !== user._id`
      const openRequests = res.data.filter(r => r.initiatedBy !== (user._id || user.id));
      setRequests(openRequests);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  const handleConnectionAction = async (connId, action) => { // action: 'active' | 'rejected'
    try {
      await axios.put(`/api/connections/${connId}`, { status: action });
      alert(action === 'active' ? "Request Accepted!" : "Request Rejected");
      fetchRequests(); // Refresh
    } catch (err) {
      alert("Failed to update request");
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      await axios.put(`/api/appointments/${id}`, { status });
      // Optimistic update
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      alert(`Appointment ${status}`);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const fetchLeads = async () => {
    try {
      // Fetch open cases (leads)
      const res = await axios.get("/api/cases?open=true");
      setLeads(res.data);
    } catch (err) {
      console.error("Failed to fetch leads", err);
    }
  };

  /* ----------------------------------
     PROFILE COMPLETION LOGIC (Helper)
  ---------------------------------- */
  const calculateProfileCompletion = () => {
    let score = 0;
    const total = 7; // Total factors
    const missing = [];

    // Safety checks
    if (user.bio && user.bio.length > 20) score++; else missing.push("Detailed Bio");
    if (user.experience) score++; else missing.push("Years of Experience");
    if (user.specialization) score++; else missing.push("Specialization");
    if (user.location && (user.location.city || user.location.length > 3)) score++; else missing.push("Location");
    if (user.profileImage) score++; else missing.push("Profile Photo");
    if (user.education && user.education.length > 0) score++; else missing.push("Education Details");
    if (user.languages && user.languages.length > 0) score++; else missing.push("Languages Spoken");

    return { percentage: Math.round((score / total) * 100), missing };
  };

  const { percentage: completionPercentage, missing: missingFields } = calculateProfileCompletion();

  const acceptLead = async (id, leadTier, leadCategory) => {
    // 0. PROFILE COMPLETION ENFORCEMENT
    if (completionPercentage < 80) {
      alert(`PROFILE INCOMPLETE (${completionPercentage}%)\n\nYou must complete at least 80% of your profile to accept leads.\n\nMissing:\n- ${missingFields.join("\n- ")}`);
      navigate("/lawyer/profile/edit");
      return;
    }

    // 🔒 PLAN ENFORCEMENT
    const userPlan = user.plan?.toLowerCase() || "silver";

    // 1. Criminal/Cyber Check (Requires Gold+)
    if (["criminal defense", "cybercrime", "criminal"].includes(leadCategory?.toLowerCase()) && userPlan === "silver") {
      alert("UPGRADE REQUIRED 🔒\n\nCriminal & Cybercrime cases are only available on GOLD plan or higher.\n\nPlease upgrade to accept this lead.");
      return;
    }

    // 2. High Court Check (Requires Gold+)
    if (leadTier === "gold" && userPlan === "silver") {
      alert("UPGRADE REQUIRED 🔒\n\nHigh Court & State level cases are locked for Silver plan.\n\nUpgrade to GOLD to access.");
      return;
    }

    // 3. Supreme Court / Diamond Check
    if (leadTier === "diamond" && userPlan !== "diamond") {
      alert("UPGRADE REQUIRED 💎\n\nSupreme Court & National cases are exclusive to DIAMOND partners.");
      return;
    }

    try {
      await axios.post(`/api/cases/${id}/accept`, { lawyerPhone: user.phone || user.email });
      alert("Lead Accepted! You can now contact the client.");
      fetchLeads(); // Refresh
    } catch (err) {
      alert("Failed to accept lead");
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
      fetchPosts();
    } catch (err) {
      console.error("Like failed");
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`/api/invoices?lawyerId=${user._id || user.id}`);
      setInvoices(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchClients = async () => {
    try {
      const res = await axios.get(`/api/crm?lawyerId=${user._id || user.id}`);
      setClients(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchUnread = async () => {
    try {
      const res = await axios.get(`/api/notifications/unread?userId=${user._id}`);
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch unread", err);
    }
  };

  // CALCULATE STATS
  const totalEarnings = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const activeCasesCount = clients.length;


  // Modal States
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ clientName: "", amount: "", description: "" });
  const [clientForm, setClientForm] = useState({ name: "", phone: "", notes: "" });

  const handleCreateInvoice = async () => {
    if (!invoiceForm.amount || !invoiceForm.clientName) return;
    try {
      await axios.post("/api/invoices", {
        lawyerId: user._id || user.id,
        ...invoiceForm,
        status: "pending"
      });
      alert("Invoice Created Successfully!");
      setShowInvoiceModal(false);
      setInvoiceForm({ clientName: "", amount: "", description: "" });
      fetchInvoices();
    } catch (err) { alert("Failed to create invoice"); }
  };

  const handleCreateClient = async () => {
    if (!clientForm.name) return;
    try {
      await axios.post("/api/crm", {
        lawyerId: user._id || user.id,
        ...clientForm
      });
      alert("Client Added Successfully!");
      setShowClientModal(false);
      setClientForm({ name: "", phone: "", notes: "" });
      fetchClients();
    } catch (err) { alert("Failed to add client"); }
  };

  if (!user) return <div className="text-white p-10">Loading...</div>;

  return (
    <>
      <DashboardLayout
        /* LEFT SIDEBAR - LAWYER PROFILE */
        leftSidebar={
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {/* PROFILE COMPLETION WIDGET */}
            <div className={`p-4 ${completionPercentage === 100 ? "bg-green-50" : "bg-blue-50"} border-b border-gray-100`}>
              <div className="flex justify-between items-end mb-1">
                <h4 className="font-bold text-xs text-user-700 uppercase tracking-wider">Profile Strength</h4>
                <span className={`font-bold text-lg ${completionPercentage === 100 ? "text-green-600" : "text-blue-600"}`}>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className={`h-2 rounded-full transition-all duration-1000 ${completionPercentage === 100 ? "bg-green-500" : "bg-blue-600"}`} style={{ width: `${completionPercentage}%` }}></div>
              </div>
              {completionPercentage < 100 && (
                <Link to="/lawyer/profile/edit" className="text-[10px] text-blue-600 font-bold hover:underline block text-center">
                  Complete Now (+{missingFields.length} items)
                </Link>
              )}
            </div>

            <div className="h-20 bg-blue-600"></div>
            <div className="px-5 pb-5 -mt-10">
              <div className="w-20 h-20 rounded-full bg-white border-4 border-white flex items-center justify-center text-2xl font-bold text-blue-600 shadow-sm mb-3">
                {user.name && user.name.length > 0 ? user.name[0] : ""}
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium" title="Verified Advocate">✓ Verified</span>
              </div>
              <p className="text-sm text-gray-500">{user.specialization || "Legal Consultant"}</p>
              <p className="text-xs text-gray-400 mt-1">{user.location}</p>

              <div className="my-4 border-t border-gray-100"></div>

              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Profile Views</span>
                  <span className="text-gray-900 font-semibold">128</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Search Appearances</span>
                  <span className="text-gray-900 font-semibold">45</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Rating</span>
                  <span className="text-yellow-500 font-semibold">4.8 ★</span>
                </div>
              </div>
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">My Workspace</div>
                <ul className="space-y-1">
                  <SidebarItem icon="⚡" label="Lead Manager" count={leads.length} />
                  <SidebarItem icon="📅" label="Calendar & Events" to="/calendar" />
                  <SidebarItem icon="📈" label="Analytics" to="/analytics" />
                  <SidebarItem icon="⚙️" label="Account Settings" to="/settings" />
                </ul>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition text-sm font-semibold text-gray-600 text-center relative">
              <label className="cursor-pointer block w-full h-full">
                {user.resume ? "✓ Resume Uploaded" : "📄 Upload Resume"}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append("file", file);

                    try {
                      // 1. Upload File
                      const upRes = await axios.post("/api/uploads", formData, {
                        headers: { "Content-Type": "multipart/form-data" }
                      });

                      // 2. Update Profile
                      const filePath = upRes.data.path;
                      await axios.put(`/api/users/${user.phone || user.email}`, { resume: filePath });

                      alert("Resume uploaded successfully!");
                      window.location.reload();
                    } catch (err) {
                      console.error(err);
                      alert("Upload failed.");
                    }
                  }}
                />
              </label>
            </div>

            {/* VERIFICATION BUTTON */}
            {!user.verified && (
              <div className="p-4 border-t border-gray-100 bg-yellow-50 hover:bg-yellow-100 cursor-pointer transition text-sm font-semibold text-yellow-700 text-center relative">
                <label className="cursor-pointer block w-full h-full flex items-center justify-center gap-2">
                  <span>🛡️ Verify Account</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const formData = new FormData();
                      formData.append("file", file);
                      alert("Verifying ID... Please wait (AI Processing)");

                      try {
                        // 1. Upload
                        const upRes = await axios.post("/api/uploads", formData, {
                          headers: { "Content-Type": "multipart/form-data" }
                        });

                        // 2. Verify
                        const verifyRes = await axios.post("/api/lawyers/verify-id", {
                          userId: user._id,
                          imageUrl: upRes.data.path
                        });

                        if (verifyRes.data.valid) {
                          alert(`Success! Verified as ${verifyRes.data.name}`);
                          window.location.reload();
                        } else {
                          alert(`Verification Failed: ${verifyRes.data.reason}`);
                        }

                      } catch (err) {
                        console.error(err);
                        alert("Verification Error. Ensure clear image of Bar Council ID.");
                      }
                    }}
                  />
                </label>
              </div>
            )}
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
            {/* WELCOME HEADER */}
            <div className="mb-6 animate-in slide-in-from-top-4 duration-500">
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome back, <span className="text-blue-600">{user.name?.split(' ')[0]}</span> 👋
              </h1>
              <p className="text-slate-500 text-sm">Here's what's happening in your legal practice today.</p>
            </div>

            {/* PREEMIUM STATS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Earnings</div>
                <div className="text-2xl font-black text-slate-800">₹{totalEarnings.toLocaleString()}</div>
                <div className="text-xs text-green-600 font-bold mt-1">↑ 12% vs last month</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Leads</div>
                <div className="text-2xl font-black text-slate-800">{leads.length}</div>
                <div className="text-xs text-blue-600 font-bold mt-1">{leads.length > 0 ? "Action Required" : "All caught up"}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Clients</div>
                <div className="text-2xl font-black text-slate-800">{activeCasesCount}</div>
                <div className="text-xs text-purple-600 font-bold mt-1">+2 New this week</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Profile Views</div>
                <div className="text-2xl font-black text-slate-800">{user.stats?.profileViews || 0}</div>
                <div className="text-xs text-orange-600 font-bold mt-1">{user.stats?.rating ? `${user.stats.rating} ★ Rating` : "Top 5% in City"}</div>
              </div>
            </div>

            {/* TABS */}
            <div className="flex bg-slate-100/50 p-1 mb-6 rounded-xl border border-slate-200">
              {['board', 'leads', 'invoices', 'clients'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold capitalize transition-all duration-200 ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}
                >
                  {tab === 'board' ? 'Case Board' : tab} {tab === 'leads' && leads.length > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{leads.length}</span>}
                </button>
              ))}
            </div>

            {/* KANBAN BOARD TAB (NEW) */}
            {activeTab === 'board' && (
              <div className="animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800">Case Management</h3>
                  <span className="text-xs text-slate-500">Drag & move to update status</span>
                </div>
                {/* Pass ACTIVE cases to the board */}
                <KanbanBoard cases={leads.filter(l => l.acceptedBy)} onUpdate={fetchLeads} />
              </div>
            )}

            {/* LEADS TAB */}
            {activeTab === 'leads' && (
              <div className="animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800">Marketplace Leads</h3>
                  <button onClick={fetchLeads} className="text-xs text-blue-600 hover:underline">Refresh List ↻</button>
                </div>

                {leads.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-slate-500 font-medium">No active leads right now.</p>
                    <p className="text-xs text-slate-400 mt-1">Check back later or optimize your profile.</p>
                  </div>
                ) : (
                  leads.map((lead) => (
                    <div key={lead._id} className="bg-white border border-slate-200 rounded-xl p-6 mb-4 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 relative group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${lead.tier === 'diamond' ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200' :
                              lead.tier === 'gold' ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200' :
                                'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                              }`}>
                              {lead.tier || "Standard"}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">• {new Date(lead.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">{lead.title}</h4>
                          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-3">
                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">📍 {lead.location}</span>
                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">⚖️ {lead.category || "General Logic"}</span>
                          </div>
                        </div>
                        <div className="text-right pl-4 border-l border-slate-100 ml-4">
                          <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Budget</div>
                          <div className="text-xl font-black text-emerald-600">₹{lead.budget || "N/A"}</div>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed mb-5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        "{lead.desc}"
                      </p>

                      <div className="flex gap-3">
                        <button
                          onClick={() => acceptLead(lead._id, lead.tier, lead.category)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold text-sm shadow-md shadow-blue-200 transition-transform active:scale-95 flex items-center justify-center gap-2"
                        >
                          <span>⚡</span> Accept Case
                        </button>
                        <button className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 hover:text-red-500 transition-colors">
                          Ignore
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Invoices & Billing</h3>
                    <p className="text-xs text-slate-500">Manage your payments and dues</p>
                  </div>
                  <button onClick={() => setShowInvoiceModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition active:scale-95 flex items-center gap-2">
                    <span>+</span> Create Invoice
                  </button>
                </div>
                {invoices.length === 0 ? <div className="text-center py-10 bg-slate-50 rounded-lg border border-slate-200"><p className="text-slate-500">No invoices yet.</p></div> : (
                  <div className="space-y-3">
                    {invoices.map(inv => (
                      <div key={inv._id} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl bg-white hover:border-blue-200 transition shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                            {inv.status === 'paid' ? '✓' : '⏳'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{inv.clientName}</p>
                            <p className="text-xs text-slate-500 font-medium">{inv.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-800 text-lg">₹{inv.amount}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide ${inv.status === 'paid' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'}`}>{inv.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'clients' && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">My Clients (CRM)</h3>
                    <p className="text-xs text-slate-500">Manage your client relationships</p>
                  </div>
                  <button onClick={() => setShowClientModal(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:bg-slate-800 transition active:scale-95">
                    + Add New Client
                  </button>
                </div>
                {clients.length === 0 ? <p className="text-slate-500 text-center py-8">No clients added.</p> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clients.map(cl => (
                      <div key={cl._id} className="p-5 border border-slate-200 rounded-xl hover:border-blue-300 transition-all hover:shadow-md bg-white group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-md">
                            {cl.name[0]}
                          </div>
                          <button className="text-slate-300 hover:text-blue-600">•••</button>
                        </div>
                        <h4 className="font-bold text-slate-900 text-lg">{cl.name}</h4>
                        <p className="text-xs text-slate-500 font-medium mb-4">{cl.phone || "No Contact Info"}</p>
                        <div className="flex gap-2">
                          <button className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-2 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition">View Details</button>
                          <button className="px-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg hover:bg-green-50 hover:text-green-600 transition">📞</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        }

        /* RIGHT SIDEBAR - LEADS & QUICK ACTIONS */
        rightSidebar={
          <>
            {/* Connection Requests Widget (NEW) */}
            {requests.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-gray-900">Connection Requests</h3>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">{requests.length}</span>
                </div>
                {/* ... existing requests logic ... */}
                <div className="space-y-3">
                  {requests.map(req => (
                    <div key={req._id} className="border border-gray-100 p-2 rounded bg-blue-50/30">
                      {/* ... item ... */}
                      <p className="font-bold text-xs text-gray-900">{req.name}</p>
                      <button onClick={() => handleConnectionAction(req.connectionId, 'active')} className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded">Accept</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CALENDAR WIDGET (NEW) */}
            <div className="mb-6 h-[400px]">
              <CalendarWidget user={user} />
            </div>

            {/* Upcoming Appointments (NEW WIDGET) */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-gray-900">Appointments</h3>
                <Link to="/calendar" className="text-xs text-blue-600 hover:underline">View All</Link>
              </div>
              {appointments.length === 0 && <p className="text-xs text-gray-500 italic">No upcoming appointments.</p>}

              <div className="space-y-3">
                {appointments.slice(0, 3).map(apt => (
                  <div key={apt._id} className="border border-gray-100 p-2 rounded bg-blue-50/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-xs text-gray-900">{apt.clientId?.name || "Client"}</p>
                        <p className="text-[10px] text-gray-500">{apt.date} @ {apt.slot}</p>
                      </div>
                      <span className={`text-[10px] items-center px-1.5 py-0.5 rounded font-bold uppercase ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {apt.status}
                      </span>
                    </div>
                    {apt.status === 'pending' && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => updateAppointmentStatus(apt._id, 'confirmed')}
                          className="flex-1 bg-green-600 text-white text-[10px] py-1 rounded hover:bg-green-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(apt._id, 'rejected')}
                          className="flex-1 bg-gray-200 text-gray-600 text-[10px] py-1 rounded hover:bg-gray-300"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          // Notify Client
                          socket.emit("start_scheduled_meeting", {
                            appointmentId: apt._id,
                            clientId: apt.clientId?._id || apt.clientId, // Check population
                            lawyerName: user.name
                          });

                          const link = `${window.location.origin}/meet/${apt._id}`;
                          window.open(link, "_blank");
                        }}
                        className="w-full mt-2 bg-purple-100 text-purple-700 text-[10px] py-1 rounded font-bold hover:bg-purple-200 flex items-center justify-center gap-1"
                      >
                        🎥 Start Call
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* New Leads (Moved from Center) */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-gray-900">New Leads</h3>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{leads.length}</span>
              </div>

              {/* ... leads content ... */}

              {leads.length === 0 && <p className="text-xs text-gray-500 italic">No new leads.</p>}

              <div className="space-y-3">
                {leads.map((lead) => (
                  <div key={lead._id} className="border border-gray-100 p-3 rounded-lg hover:bg-gray-50 transition">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{lead.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 mb-2">{lead.location} • {lead.budget}</p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptLead(lead._id, lead.tier, lead.category)}
                        className="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded font-semibold hover:bg-blue-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => setLeads(leads.filter(l => l._id !== lead._id))}
                        className="text-xs text-gray-400 hover:text-red-500 px-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Activity (REAL STATS) */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mt-4">
              <h3 className="font-bold text-sm text-gray-900 mb-4">Platform Activity</h3>
              <ul className="space-y-3">
                <li className="text-sm border-b border-gray-50 pb-2">
                  <p className="font-medium text-blue-700">{leads.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length} New Leads</p>
                  <p className="text-xs text-gray-500">Posted Today</p>
                </li>
                <li className="text-sm border-b border-gray-50 pb-2">
                  <p className="font-medium text-purple-700">{posts.length} Community Posts</p>
                  <p className="text-xs text-gray-500">Legal Discussions</p>
                </li>
                <li className="text-sm">
                  <p className="font-medium text-emerald-700">Online</p>
                  <p className="text-xs text-gray-500">System Status</p>
                </li>
              </ul>
            </div>
          </>
        }
      />

      {/* INVOICE MODAL */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create Invoice</h3>
              <button onClick={() => setShowInvoiceModal(false)}>✕</button>
            </div>
            <input className="w-full border p-2 mb-3 rounded" placeholder="Client Name" value={invoiceForm.clientName} onChange={e => setInvoiceForm({ ...invoiceForm, clientName: e.target.value })} />
            <input className="w-full border p-2 mb-3 rounded" placeholder="Description" value={invoiceForm.description} onChange={e => setInvoiceForm({ ...invoiceForm, description: e.target.value })} />
            <input className="w-full border p-2 mb-3 rounded" placeholder="Amount (INR)" type="number" value={invoiceForm.amount} onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} />
            <button onClick={handleCreateInvoice} className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">Send Invoice</button>
          </div>
        </div>
      )}

      {/* CLIENT MODAL */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add New Client</h3>
              <button onClick={() => setShowClientModal(false)}>✕</button>
            </div>
            <input className="w-full border p-2 mb-3 rounded" placeholder="Full Name" value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} />
            <input className="w-full border p-2 mb-3 rounded" placeholder="Phone Number" value={clientForm.phone} onChange={e => setClientForm({ ...clientForm, phone: e.target.value })} />
            <textarea className="w-full border p-2 mb-3 rounded" placeholder="Notes / Case Details" rows={3} value={clientForm.notes} onChange={e => setClientForm({ ...clientForm, notes: e.target.value })} />
            <button onClick={handleCreateClient} className="w-full bg-[#0B1120] text-white py-2 rounded font-bold hover:bg-slate-800">Save Client</button>
          </div>
        </div>
      )}

      {/* INSTANT CALL MODAL */}
      {instantCall && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-blue-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-50/50 animate-pulse z-0"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center text-4xl mb-4 animate-bounce">
                📞
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Incoming Video Call</h2>
              <p className="text-blue-600 font-semibold text-lg">{instantCall.category || "Legal Query"}</p>
              <div className="my-6 border-t border-gray-100 py-4">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Client</p>
                <h3 className="text-xl font-bold text-gray-800">{instantCall.clientName || "Unknown User"}</h3>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={acceptInstantCall}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-500/30 transition transform hover:scale-105"
                >
                  ACCEPT
                </button>
                <button
                  onClick={() => setInstantCall(null)}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-4 rounded-xl font-bold text-lg transition"
                >
                  IGNORE
                </button>
              </div>
              <p className="mt-4 text-[10px] text-gray-400">Accepting will start a video session immediately.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// 1. UPDATE SIDEBAR ITEM COMPONENT AT THE BOTTOM
function SidebarItem({ icon, label, count, to }) {
  if (to) {
    return (
      <Link to={to}>
        <li className="flex items-center justify-between p-2 rounded hover:bg-gray-100 cursor-pointer transition group">
          <div className="flex items-center gap-3 text-sm font-medium text-gray-600 group-hover:text-gray-900">
            <span className="text-gray-400 group-hover:text-blue-600 relative">
              {icon}
              {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
            </span>
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
