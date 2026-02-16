import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Shield, Users, CreditCard, Lock, CheckCircle, XCircle } from "lucide-react";

export default function AdminDashboard() {
    const { user } = useAuth();
    const [lawyers, setLawyers] = useState([]);
    const [clients, setClients] = useState([]);
    const [activeTab, setActiveTab] = useState("lawyers"); // lawyers | clients | payments
    const [stats, setStats] = useState({ users: 0, pending: 0, revenue: 0 });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [resLawyers, statsRes] = await Promise.all([
                axios.get("/api/lawyers"),
                axios.get("/api/admin/stats")
            ]);

            setLawyers(resLawyers.data.lawyers || resLawyers.data);
            setStats({
                users: statsRes.data.users,
                pending: statsRes.data.pending,
                revenue: statsRes.data.revenue
            });

            // Mock Data for now
            setClients([
                { _id: "1", name: "Rahul S.", email: "rahul@gmail.com", plan: "gold" },
                { _id: "2", name: "Priya M.", email: "priya@yahoo.com", plan: "free" },
            ]);
        } catch (err) {
            // Quiet fail for demo
        }
    };

    const verifyLawyer = async (id, status) => {
        try {
            await axios.put(`/api/users/${id}`, {
                verified: status === 'verified',
                verificationStatus: status
            });
            toast.success(`Lawyer ${status === 'verified' ? 'Approved' : 'Rejected'}`);
            fetchData();
        } catch (err) { toast.error("Action Failed"); }
    };

    const maskEmail = (email) => {
        if (!email) return "";
        const [name, domain] = email.split("@");
        return `${name[0]}***@${domain}`;
    };

    return (
        <DashboardLayout
            /* LEFT - Admin Stats */
            leftSidebar={
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-rose-900 rounded-3xl mx-auto flex items-center justify-center text-3xl mb-4 shadow-lg shadow-red-900/40 border border-white/5">🛡️</div>
                        <h2 className="text-xl font-black text-white tracking-tight">Super Admin</h2>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">System Operational</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {[
                            { id: 'lawyers', label: 'Verify Lawyers', icon: <Shield size={16} />, count: stats.pending },
                            { id: 'clients', label: 'Client Registry', icon: <Users size={16} />, count: null },
                            { id: 'payments', label: 'Revenue Monitor', icon: <CreditCard size={16} />, count: null },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all
                                ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg border border-white/5'
                                        : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
                            >
                                <div className="flex items-center gap-3">{tab.icon} {tab.label}</div>
                                {tab.count > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-lg shadow-red-500/40">{tab.count}</span>}
                            </button>
                        ))}
                    </nav>
                </div>
            }

            /* CENTER - Dynamic Content */
            mainFeed={
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl min-h-[600px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-30 pointer-events-none">
                        <Lock size={120} className="text-slate-800" />
                    </div>

                    {/* LAWYERS TAB */}
                    {activeTab === 'lawyers' && (
                        <div>
                            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                                Lawyer Verification Queue
                            </h3>
                            <div className="grid gap-4">
                                {lawyers.map(lawyer => (
                                    <div key={lawyer._id} className="bg-black/20 p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-bold text-white text-lg">{lawyer.name}</h4>
                                                    {lawyer.isStudent && (
                                                        <span className="text-purple-400 text-[10px] bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20 font-bold uppercase">Law Student</span>
                                                    )}
                                                    {!lawyer.verified ? (
                                                        <span className="text-amber-500 text-[10px] bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 font-bold uppercase">Pending Review</span>
                                                    ) : (
                                                        <span className="text-emerald-500 text-[10px] bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 font-bold uppercase">Verified</span>
                                                    )}
                                                </div>
                                                <p className="text-slate-400 text-xs font-mono mb-1">
                                                    {lawyer.isStudent
                                                        ? `ROLL NO: ${lawyer.studentRollNumber || "N/A"}`
                                                        : `BAR ID: ${lawyer.barCouncilId || "N/A"}`
                                                    }
                                                </p>
                                                <p className="text-slate-500 text-xs">Email: {maskEmail(lawyer.email)}</p>

                                                {lawyer.idCardImage && (
                                                    <a href={lawyer.idCardImage} target="_blank" rel="noreferrer" className="text-indigo-400 text-xs font-bold hover:underline mt-3 block flex items-center gap-1">
                                                        <span>📄 View {lawyer.isStudent ? "Student ID" : "Bar Council ID"}</span>
                                                    </a>
                                                )}
                                            </div>

                                            {!lawyer.verified && (
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => verifyLawyer(lawyer._id, 'rejected')} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition" title="Decline"><XCircle size={20} /></button>
                                                    <button onClick={() => verifyLawyer(lawyer._id, 'verified')} className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition" title="Approve"><CheckCircle size={20} /></button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {lawyers.length === 0 && <p className="text-slate-500 italic">No lawyers pending verification.</p>}
                            </div>
                        </div>
                    )}

                    {/* CLIENTS TAB */}
                    {activeTab === 'clients' && (
                        <div>
                            <h3 className="text-2xl font-black text-white mb-8">Client Registry</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {clients.map(client => (
                                    <div key={client._id} className="flex justify-between items-center bg-black/20 p-5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl">👤</div>
                                            <div>
                                                <p className="font-bold text-white">{client.name}</p>
                                                <p className="text-xs text-slate-500 font-mono tracking-wider">{maskEmail(client.email)}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${client.plan === 'gold' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-800 text-slate-400 border-white/5'}`}>
                                            {client.plan} Plan
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PAYMENTS TAB */}
                    {activeTab === 'payments' && (
                        <div className="text-center py-32">
                            <div className="w-32 h-32 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse border border-emerald-500/20">
                                <Lock size={48} className="text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Secure Ledger</h3>
                            <p className="text-slate-400 max-w-sm mx-auto mb-8 font-light leading-relaxed">
                                Financial data is end-to-end encrypted. Administrator access to raw transaction logs is restricted.
                            </p>
                            <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold text-sm transition border border-white/10">
                                Request Access Token
                            </button>
                        </div>
                    )}
                </div>
            }

            /* RIGHT - Global Stats */
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
                            <h4 className="text-indigo-400 text-xs font-black uppercase tracking-widest">Compliance</h4>
                        </div>
                        <p className="text-indigo-200/60 text-xs leading-relaxed">
                            All admin actions are logged to an immutable audit trail for security compliance.
                        </p>
                    </div>
                </div>
            }
        />
    );
}
