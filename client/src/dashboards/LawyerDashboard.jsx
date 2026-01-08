import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { lawyerFeed, suggestedLawyers /* repurpose for networking */ } from "../components/dashboard/FeedMetadata";
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

  // Social Feed State
  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState("");
  const [postFile, setPostFile] = useState(null);
  const [postType, setPostType] = useState("text");
  const [topics, setTopics] = useState([
    { _id: "1", name: "Family Law", count: 120 },
    { _id: "2", name: "Corporate Law", count: 90 },
    { _id: "3", name: "Criminal Defense", count: 75 },
    { _id: "4", name: "Real Estate", count: 60 },
  ]);


  useEffect(() => {
    if (user) {
      fetchLeads();
      fetchPosts();
      fetchAppointments();
      fetchRequests();
      fetchInvoices(); // NEW
      fetchClients(); // NEW

      // JOIN INSTANT POOL
      socket.emit("join_lawyer_pool");

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

  const acceptLead = async (id, leadTier, leadCategory) => {
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
            {/* TABS */}
            <div className="flex bg-white border border-gray-200 rounded-lg p-1 mb-4">
              {['leads', 'invoices', 'clients'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-md text-sm font-bold capitalize transition ${activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* CONTENT BASED ON TAB */}
            {activeTab === 'leads' && (
              <>
                <h3 className="font-bold text-gray-800 mb-4">Marketplace Leads ({leads.length})</h3>
                {/* ... Existing Leads Map ... */}
                {leads.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">No new cases in the marketplace.</p>
                ) : (
                  leads.map((lead) => (
                    <div key={lead._id} className="bg-white border border-gray-200 rounded-lg p-5 mb-4 shadow-sm relative overflow-hidden group hover:border-blue-300 transition">
                      {/* ... Lead Card Content ... */}
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${lead.tier === 'diamond' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                              lead.tier === 'gold' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}>
                              {lead.tier || "Standard"} Lead
                            </span>
                            <span className="text-xs text-gray-400">• {new Date(lead.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-bold text-lg text-gray-900 leading-tight">{lead.title}</h4>
                        </div>
                        <div className="text-right">
                          <span className="block text-xl font-bold text-blue-600">₹{lead.budget || "N/A"}</span>
                          <span className="text-xs text-gray-400">Budget</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{lead.desc}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1">📍 {lead.location}</span>
                        <span className="flex items-center gap-1">⚖️ {lead.category || "General"}</span>
                      </div>

                      {/* Action Area */}
                      <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                        <button className="text-gray-400 hover:text-gray-600 font-medium text-sm">Ignore</button>
                        <button
                          onClick={() => acceptLead(lead._id, lead.tier, lead.category)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md shadow-blue-200 transition"
                        >
                          Accept Case
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'invoices' && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Invoices & Billing</h3>
                  <button onClick={() => setShowInvoiceModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-blue-700 transition">
                    + Create Invoice
                  </button>
                </div>
                {invoices.length === 0 ? <p className="text-gray-500 text-center">No invoices yet.</p> : (
                  <div className="space-y-3">
                    {invoices.map(inv => (
                      <div key={inv._id} className="flex justify-between items-center p-3 border border-gray-100 rounded bg-gray-50">
                        <div>
                          <p className="font-bold text-gray-900">{inv.clientName}</p>
                          <p className="text-xs text-gray-500">{inv.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">₹{inv.amount}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{inv.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'clients' && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800">My Clients (CRM)</h3>
                  <button onClick={() => setShowClientModal(true)} className="bg-[#0B1120] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-slate-800 transition">
                    + Add Client
                  </button>
                </div>
                {clients.length === 0 ? <p className="text-gray-500 text-center">No clients added.</p> : (
                  <div className="grid grid-cols-2 gap-4">
                    {clients.map(cl => (
                      <div key={cl._id} className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition">
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold mb-3">{cl.name[0]}</div>
                        <h4 className="font-bold text-gray-900">{cl.name}</h4>
                        <p className="text-xs text-gray-500">{cl.phone || "No Phone"}</p>
                        <button className="mt-3 w-full border border-gray-300 text-gray-600 text-xs font-bold py-1.5 rounded hover:bg-gray-50">View Details</button>
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
                <div className="space-y-3">
                  {requests.map(req => (
                    <div key={req._id} className="border border-gray-100 p-2 rounded bg-blue-50/30">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2 items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                            {req.name ? req.name[0] : "U"}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-gray-900">{req.name}</p>
                            <p className="text-[10px] text-gray-500">{req.location || "Client"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleConnectionAction(req.connectionId, 'active')}
                          className="flex-1 bg-blue-600 text-white text-[10px] py-1 rounded hover:bg-blue-700 font-medium"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleConnectionAction(req.connectionId, 'rejected')}
                          className="flex-1 bg-white border border-gray-200 text-gray-500 text-[10px] py-1 rounded hover:bg-gray-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {/* Trending Topics (Kept at bottom) */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mt-4">
              <h3 className="font-bold text-sm text-gray-900 mb-4">Trending</h3>
              <ul className="space-y-3">
                {topics.map((t) => (
                  <li key={t._id} className="text-sm">
                    <p className="font-medium text-blue-700">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.count} posts</p>
                  </li>
                ))}
              </ul>
            </div>
          </>
        }
      />

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
