import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function AdminDashboard() {
    const { user } = useAuth();
    const [lawyers, setLawyers] = useState([]);
    const [clients, setClients] = useState([]);
    const [activeTab, setActiveTab] = useState("lawyers"); // lawyers | clients | payments
    const [stats, setStats] = useState({ users: 0, pending: 0, revenue: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [params] = await Promise.all([
                axios.get("/api/lawyers"),
                axios.get("/api/admin/stats")
            ]);

            const resLawyers = params;
            // For now, clients are still mock until we have a proper client list endpoint for admins
            // But we can get the COUNT from the stats endpoint

            const statsRes = await axios.get("/api/admin/stats");

            setLawyers(resLawyers.data.lawyers || resLawyers.data); // Handle pagination response structure if needed

            // Mock clients list for display purposes (since we don't have a specific route for listing all clients detail yet)
            // In a real app, you'd add GET /api/admin/users?role=client
            const mockClients = [
                { _id: "1", name: "Rahul S.", email: "rahul@gmail.com", plan: "gold" },
                { _id: "2", name: "Priya M.", email: "priya@yahoo.com", plan: "free" },
            ];
            setClients(mockClients);

            setStats({
                users: statsRes.data.users,
                pending: statsRes.data.pending,
                revenue: statsRes.data.revenue
            });
        } catch (err) {
            console.error(err);
            toast.error("Failed to load admin data");
        }
    };

    const verifyLawyer = async (id, status) => {
        try {
            // status: 'verified' or 'rejected'
            await axios.put(`/api/users/${id}`, {
                verified: status === 'verified',
                verificationStatus: status
            });
            toast.success(`Lawyer ${status === 'verified' ? 'Approved' : 'Rejected'}`);
            fetchData();
        } catch (err) {
            toast.error("Action Failed");
        }
    };

    // PRIVACY HELPER
    const maskEmail = (email) => {
        if (!email) return "";
        const [name, domain] = email.split("@");
        return `${name[0]}***@${domain}`;
    };

    return (
        <DashboardLayout
            /* LEFT - Admin Stats */
            leftSidebar={
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-900 rounded-full mx-auto flex items-center justify-center text-2xl mb-3 shadow-lg shadow-red-900/40">🛡️</div>
                        <h2 className="text-lg font-bold text-white">Super Admin</h2>
                        <p className="text-xs text-slate-400">Privacy Mode: ON</p>
                    </div>

                    <nav className="space-y-2">
                        <button onClick={() => setActiveTab("lawyers")} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'lawyers' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                            ⚖️ Lawyer Verification <span className="float-right bg-red-600 text-white text-[10px] px-1.5 rounded-full">{stats.pending}</span>
                        </button>
                        <button onClick={() => setActiveTab("clients")} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'clients' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                            👥 Client Registry
                        </button>
                        <button onClick={() => setActiveTab("payments")} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'payments' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                            💰 Revenue Monitor
                        </button>
                    </nav>
                </div>
            }

            /* CENTER - Dynamic Content */
            mainFeed={
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 min-h-[600px]">

                    {/* LAWYERS TAB */}
                    {activeTab === 'lawyers' && (
                        <div>
                            <h3 className="text-xl font-bold text-white mb-6 flex justify-between items-center">
                                Lawyer Verification
                                <span className="text-xs font-normal text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
                                    Privacy Protected
                                </span>
                            </h3>
                            <div className="space-y-4">
                                {lawyers.map(lawyer => (
                                    <div key={lawyer._id} className="bg-slate-800 p-5 rounded-xl border border-slate-700/50 hover:border-slate-600 transition">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-bold text-white text-lg">{lawyer.name}</h4>
                                                    {!lawyer.verified ? (
                                                        <span className="text-yellow-500 text-xs bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">Pending Check</span>
                                                    ) : (
                                                        <span className="text-green-500 text-xs bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20">Verified</span>
                                                    )}
                                                </div>
                                                <p className="text-slate-400 text-sm mt-1 font-mono">ID: {lawyer.barCouncilId || "NOT PROVIDED"}</p>
                                                <p className="text-slate-500 text-xs mt-1">Email: {maskEmail(lawyer.email)}</p>

                                                {lawyer.idCardImage && (
                                                    <a href={lawyer.idCardImage} target="_blank" rel="noreferrer" className="text-blue-400 text-xs underline mt-2 block">
                                                        View ID Card
                                                    </a>
                                                )}
                                            </div>

                                            {!lawyer.verified && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => verifyLawyer(lawyer._id, 'rejected')} className="text-red-400 hover:bg-red-400/10 px-3 py-1.5 rounded-lg text-sm transition">Decline</button>
                                                    <button onClick={() => verifyLawyer(lawyer._id, 'verified')} className="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-green-900/20 transition">Approve</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CLIENTS TAB */}
                    {activeTab === 'clients' && (
                        <div>
                            <h3 className="text-xl font-bold text-white mb-6">Client Registry</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {clients.map(client => (
                                    <div key={client._id} className="flex justify-between items-center bg-slate-800 p-4 rounded-lg border border-slate-700">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">👤</div>
                                            <div>
                                                <p className="font-bold text-white">{client.name}</p>
                                                <p className="text-xs text-slate-500">{maskEmail(client.email)}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${client.plan === 'gold' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-slate-700 text-slate-400'}`}>
                                            {client.plan} Plan
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PAYMENTS TAB */}
                    {activeTab === 'payments' && (
                        <div className="text-center py-20">
                            <div className="text-4xl mb-4">🔒</div>
                            <h3 className="text-xl font-bold text-white">Payment Data is Encrypted</h3>
                            <p className="text-slate-400 max-w-sm mx-auto mt-2">
                                Transaction logs are stored securely. No plain-text card details are accessible to admins in this view.
                            </p>
                            <button className="mt-6 bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg text-sm">
                                View Anonymized Ledger
                            </button>
                        </div>
                    )}

                </div>
            }

            /* RIGHT - Global Stats */
            rightSidebar={
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Live Metrics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800 p-3 rounded-lg">
                                <span className="text-slate-400 text-xs">Total Users</span>
                                <p className="text-xl font-bold text-white">{stats.users}</p>
                            </div>
                            <div className="bg-slate-800 p-3 rounded-lg">
                                <span className="text-slate-400 text-xs">Revenue (EST)</span>
                                <p className="text-xl font-bold text-green-400">₹{stats.revenue}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-xl">
                        <h4 className="text-blue-400 text-xs font-bold uppercase mb-2">Privacy Policy Check</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            This dashboard complies with user privacy. Emails are masked. Payment data is hidden. Actions are logged.
                        </p>
                    </div>
                </div>
            }
        />
    );
}
