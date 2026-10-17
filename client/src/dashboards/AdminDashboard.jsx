'use client'

import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { 
    Shield, Users, CreditCard, Lock, CheckCircle, XCircle, 
    Trash2, Edit2, Activity, Settings, Save, AlertTriangle, Search
} from "lucide-react";

export default function AdminDashboard() {
    const { user } = useAuth();
    const [pendingLawyers, setPendingLawyers] = useState([]);
    const [allLawyers, setAllLawyers] = useState([]);
    const [clients, setClients] = useState([]);
    const [activeTab, setActiveTab] = useState("lawyers"); // lawyers | lawyer-registry | clients | matrix | logs
    const [stats, setStats] = useState({ users: 0, pending: 0, revenue: 0 });
    const [auditLogs, setAuditLogs] = useState([]);
    const [selectedUserLogs, setSelectedUserLogs] = useState(null); // Filter logs by specific client
    const [matrixConfig, setMatrixConfig] = useState({});
    const [editingFeature, setEditingFeature] = useState(null);

    useEffect(() => { 
        fetchData();
        fetchFeatureMatrix();
        fetchAuditLogs();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const [pendingRes, allLawyersRes, statsRes, clientsRes] = await Promise.all([
                axios.get("/api/admin/pending-lawyers", { headers }),
                axios.get("/api/admin/lawyers", { headers }),
                axios.get("/api/admin/stats", { headers }),
                axios.get("/api/admin/clients", { headers })
            ]);

            setPendingLawyers(pendingRes.data);
            setAllLawyers(allLawyersRes.data);
            setClients(clientsRes.data);
            setStats({
                users: statsRes.data.users,
                pending: statsRes.data.pending,
                revenue: statsRes.data.revenue
            });
        } catch (err) {
            console.error("Dashboard fetch error", err);
        }
    };

    const fetchFeatureMatrix = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("/api/admin/feature-matrix", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMatrixConfig(res.data);
        } catch (err) {
            console.error("Feature matrix load failed", err);
        }
    };

    const fetchAuditLogs = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("/api/admin/audit-logs", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAuditLogs(res.data);
        } catch (err) {
            console.error("Audit logs load failed", err);
        }
    };

    const verifyLawyer = async (id, status) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`/api/admin/verify-lawyer/${id}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Lawyer ${status === 'approved' ? 'Approved' : 'Rejected'}`);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Action Failed");
        }
    };

    const removeUser = async (id) => {
        if (!confirm("Are you absolutely sure you want to permanently delete this user and all associated cases/CRM files?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`/api/admin/user/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("User permanently removed");
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete user");
        }
    };

    const handlePlanChange = async (userId, newPlan) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`/api/admin/update-user-plan/${userId}`, { plan: newPlan }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`User plan updated to ${newPlan}`);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update user plan");
        }
    };

    const handleSaveMatrix = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.post("/api/admin/feature-matrix", matrixConfig, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Feature matrix configuration saved");
            setEditingFeature(null);
            fetchFeatureMatrix();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save feature matrix");
        }
    };

    const maskEmail = (email) => {
        if (!email) return "";
        const [name, domain] = email.split("@");
        return `${name[0]}***@${domain}`;
    };

    // Filter audit logs for specific user
    const filteredLogs = selectedUserLogs 
        ? auditLogs.filter(log => log.userId === selectedUserLogs._id)
        : auditLogs;

    return (
        <DashboardLayout
            /* LEFT SIDEBAR - Navigation & Stats */
            leftSidebar={
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-700 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-4 shadow-lg border border-white/5">🛡️</div>
                        <h2 className="text-lg font-black text-white tracking-tight">Super Admin</h2>
                        <div className="flex items-center justify-center gap-1.5 mt-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Operational Mode</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {[
                            { id: 'lawyers', label: 'Verification Queue', icon: <Shield size={15} />, count: pendingLawyers.length },
                            { id: 'lawyer-registry', label: 'Lawyer Registry', icon: <Users size={15} />, count: null },
                            { id: 'clients', label: 'Client Registry', icon: <Users size={15} />, count: null },
                            { id: 'matrix', label: 'Feature Matrix', icon: <Settings size={15} />, count: null },
                            { id: 'logs', label: 'User Activity Logs', icon: <Activity size={15} />, count: null },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setSelectedUserLogs(null); // Reset user filter when switching tabs
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all
                                ${activeTab === tab.id
                                        ? 'bg-white text-slate-950 font-black shadow-lg'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <div className="flex items-center gap-2.5">{tab.icon} {tab.label}</div>
                                {tab.count > 0 && <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full">{tab.count}</span>}
                            </button>
                        ))}
                    </nav>
                </div>
            }

            /* CENTER PANEL - Dynamic Views */
            mainFeed={
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl min-h-[600px] relative overflow-hidden">
                    
                    {/* 1. LAWYER VERIFICATION QUEUE */}
                    {activeTab === 'lawyers' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-white uppercase tracking-wider">Pending Lawyer Verification</h3>
                            <div className="grid gap-4">
                                {pendingLawyers.map(lawyer => (
                                    <div key={lawyer._id} className="bg-black/20 p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-white text-base">{lawyer.name}</h4>
                                                {lawyer.isStudent && <span className="text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-black border border-purple-500/20 uppercase">Student</span>}
                                            </div>
                                            <p className="text-slate-500 text-xs mt-1">Email: {maskEmail(lawyer.email)}</p>
                                            <p className="text-slate-500 text-xs font-mono mt-0.5">{lawyer.isStudent ? `Roll No: ${lawyer.studentRollNumber}` : `Bar Council ID: ${lawyer.barCouncilId}`}</p>
                                        </div>
                                        <div className="flex items-center gap-2 w-full md:w-auto">
                                            {lawyer.idCardImage && (
                                                <a href={lawyer.idCardImage} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline px-4 py-2 bg-indigo-500/5 rounded-xl border border-indigo-500/10 font-bold mr-2">
                                                    View ID Document
                                                </a>
                                            )}
                                            <button onClick={() => verifyLawyer(lawyer._id, 'rejected')} className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition"><XCircle size={16} /></button>
                                            <button onClick={() => verifyLawyer(lawyer._id, 'approved')} className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition"><CheckCircle size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                                {pendingLawyers.length === 0 && <p className="text-slate-500 text-sm italic">Verification queue is empty.</p>}
                            </div>
                        </div>
                    )}

                    {/* 2. LAWYER REGISTRY */}
                    {activeTab === 'lawyer-registry' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-white uppercase tracking-wider">Lawyer Directory</h3>
                            <div className="grid gap-4">
                                {allLawyers.map(lawyer => (
                                    <div key={lawyer._id} className="bg-black/20 p-5 rounded-2xl border border-white/5 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-bold text-white text-base">{lawyer.name}</h4>
                                            <p className="text-slate-500 text-xs">Email: {maskEmail(lawyer.email)}</p>
                                            <div className="flex gap-2 mt-1">
                                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${lawyer.verified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                                    {lawyer.verified ? 'Verified' : 'Unverified'}
                                                </span>
                                                <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-black uppercase">
                                                    {lawyer.plan}
                                                </span>
                                            </div>
                                        </div>
                                        <button onClick={() => removeUser(lawyer._id)} className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition" title="Remove Lawyer">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                {allLawyers.length === 0 && <p className="text-slate-500 text-sm italic">No lawyers found in system registry.</p>}
                            </div>
                        </div>
                    )}

                    {/* 3. CLIENT REGISTRY */}
                    {activeTab === 'clients' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-white uppercase tracking-wider">Registered Clients</h3>
                            <div className="grid gap-4">
                                {clients.map(client => (
                                    <div key={client._id} className="bg-black/20 p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <h4 className="font-bold text-white text-base">{client.name}</h4>
                                            <p className="text-slate-500 text-xs">Email: {maskEmail(client.email)}</p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                                            {/* Edit Plan Dropdown */}
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] text-slate-500 font-bold uppercase">Plan:</span>
                                                <select
                                                    value={client.plan}
                                                    onChange={(e) => handlePlanChange(client._id, e.target.value)}
                                                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500/50"
                                                >
                                                    {['free', 'pro', 'gold', 'firm'].map(p => (
                                                        <option key={p} value={p} className="bg-slate-950 text-white">{p.toUpperCase()}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* View activity logs */}
                                            <button 
                                                onClick={() => {
                                                    setSelectedUserLogs(client);
                                                    setActiveTab('logs');
                                                }}
                                                className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                                            >
                                                <Activity size={12} /> Activity Log
                                            </button>

                                            {/* Delete Client */}
                                            <button onClick={() => removeUser(client._id)} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition" title="Remove Client">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. FEATURE MATRIX EDITOR */}
                    {activeTab === 'matrix' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-wider">Dynamic Feature Matrix Limits</h3>
                                    <p className="text-xs text-slate-500 mt-1">Control search, predictor, and drafting counts dynamically for all plan tiers.</p>
                                </div>
                                {editingFeature && (
                                    <button 
                                        onClick={handleSaveMatrix}
                                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5"
                                    >
                                        <Save size={14} /> Save Configuration
                                    </button>
                                )}
                            </div>

                            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/20">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5 text-slate-400">
                                            <th className="p-4 font-black uppercase">Feature Name</th>
                                            <th className="p-4 font-black uppercase">Free Limit</th>
                                            <th className="p-4 font-black uppercase">Pro Limit</th>
                                            <th className="p-4 font-black uppercase">Gold Limit</th>
                                            <th className="p-4 font-black uppercase">Firm Limit</th>
                                            <th className="p-4 font-black uppercase text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(matrixConfig).map(([key, feature]) => {
                                            const isEditing = editingFeature === key;
                                            return (
                                                <tr key={key} className="border-b border-white/5 hover:bg-white/[0.01]">
                                                    <td className="p-4">
                                                        <span className="font-bold text-white block text-sm">{feature.label || key}</span>
                                                        <span className="text-[10px] text-slate-500 mt-0.5 block">{feature.upgradeMessage || "No upgrade message config."}</span>
                                                    </td>
                                                    {['free', 'pro', 'gold', 'firm'].map(tier => {
                                                        const val = feature.limits[tier];
                                                        return (
                                                            <td key={tier} className="p-4">
                                                                {isEditing ? (
                                                                    <select
                                                                        value={val === false ? 'blocked' : val === 'unlimited' ? 'unlimited' : val}
                                                                        onChange={(e) => {
                                                                            const rawVal = e.target.value;
                                                                            const parsed = rawVal === 'blocked' ? false : rawVal === 'unlimited' ? 'unlimited' : parseInt(rawVal);
                                                                            setMatrixConfig(prev => ({
                                                                                ...prev,
                                                                                [key]: {
                                                                                    ...prev[key],
                                                                                    limits: {
                                                                                        ...prev[key].limits,
                                                                                        [tier]: parsed
                                                                                    }
                                                                                }
                                                                            }));
                                                                        }}
                                                                        className="bg-[#020617] border border-white/10 rounded-lg p-1.5 text-white w-20 outline-none"
                                                                    >
                                                                        <option value="blocked">Blocked</option>
                                                                        <option value="unlimited">Unlimited</option>
                                                                        {[0, 1, 3, 5, 10, 20, 25, 30, 50, 100].map(n => (
                                                                            <option key={n} value={n}>{n}</option>
                                                                        ))}
                                                                    </select>
                                                                ) : (
                                                                    <span className={`px-2 py-1 rounded font-bold text-[10px] ${
                                                                        val === false ? 'bg-red-500/10 text-red-400' :
                                                                        val === 'unlimited' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                                                                    }`}>
                                                                        {val === false ? 'Blocked' : val === 'unlimited' ? 'Unlimited' : `${val} / mo`}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="p-4 text-center">
                                                        <button 
                                                            onClick={() => setEditingFeature(isEditing ? null : key)}
                                                            className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:text-white"
                                                        >
                                                            <Edit2 size={12} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 5. CLIENT ACTIVITY AUDIT LOGS */}
                    {activeTab === 'logs' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-wider">
                                        {selectedUserLogs ? `Activity Log: ${selectedUserLogs.name}` : "User Activity Logs"}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">Immutable session logs containing exact searches, request payloads, and API status codes.</p>
                                </div>
                                {selectedUserLogs && (
                                    <button 
                                        onClick={() => setSelectedUserLogs(null)}
                                        className="text-xs text-indigo-400 hover:text-white underline font-bold uppercase tracking-wider"
                                    >
                                        Show All Users
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {filteredLogs.map((log, i) => (
                                    <div key={i} className="bg-black/20 p-4 rounded-xl border border-white/5 text-xs space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-indigo-400 font-mono">{log.method} {log.endpoint}</span>
                                            <span className="text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-400 leading-relaxed">
                                            <div>
                                                <strong className="text-white block mb-0.5">Payload:</strong>
                                                <pre className="bg-black/40 p-2.5 rounded-lg border border-white/5 overflow-x-auto whitespace-pre-wrap font-mono max-h-20">{log.requestBody}</pre>
                                            </div>
                                            <div>
                                                <strong className="text-white block mb-0.5">AI Response Preview:</strong>
                                                <pre className="bg-black/40 p-2.5 rounded-lg border border-white/5 overflow-x-auto whitespace-pre-wrap font-mono max-h-20">{log.responseBody}</pre>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 text-[10px] text-slate-500 font-semibold pt-1">
                                            <span>User ID: <span className="font-mono text-slate-300">{log.userId}</span></span>
                                            <span>Duration: <span className="text-emerald-400">{log.durationMs}ms</span></span>
                                            <span>Status: <span className={log.responseStatus >= 400 ? "text-red-400" : "text-emerald-400"}>{log.responseStatus}</span></span>
                                        </div>
                                    </div>
                                ))}
                                {filteredLogs.length === 0 && <p className="text-slate-500 text-sm italic text-center py-20">No activity logs recorded yet.</p>}
                            </div>
                        </div>
                    )}
                </div>
            }

            /* RIGHT PANEL - Stats Summary */
            rightSidebar={
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                        <h3 className="font-bold text-white mb-6 text-xs uppercase tracking-widest opacity-50">Platform Health</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Users</span>
                                <p className="text-2xl font-black text-white mt-1">{stats.users}</p>
                            </div>
                            <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                                <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Est. Revenue</span>
                                <p className="text-2xl font-black text-emerald-400 mt-1">₹{stats.revenue}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-900/20 border border-indigo-500/20 p-6 rounded-3xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield size={16} className="text-indigo-400" />
                            <h4 className="text-indigo-400 text-xs font-black uppercase tracking-widest font-serif">Security Compliance</h4>
                        </div>
                        <p className="text-indigo-200/60 text-xs leading-relaxed">
                            All user queries are audited and capped to respect confidentiality standards and the DPDP Act (2023).
                        </p>
                    </div>
                </div>
            }
        />
    );
}
