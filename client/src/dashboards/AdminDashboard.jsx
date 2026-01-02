import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
    const { user } = useAuth();
    const [lawyers, setLawyers] = useState([]);
    const [stats, setStats] = useState({ users: 0, pending: 0 });

    useEffect(() => {
        fetchLawyers();
    }, []);

    const fetchLawyers = async () => {
        try {
            // Reusing the public lawyers route for now, but in real app use protected admin route
            const res = await axios.get("/api/lawyers");
            setLawyers(res.data);
            setStats({
                users: 100 + res.data.length, // Mock total
                pending: res.data.filter(u => u.resume && !u.verified).length
            });
        } catch (err) {
            console.error(err);
        }
    };

    const verifyLawyer = async (id) => {
        try {
            await axios.put(`/api/users/${id}`, { verified: true });
            alert("Lawyer Verified!");
            fetchLawyers();
        } catch (err) {
            alert("Verification Failed");
        }
    };

    return (
        <DashboardLayout
            /* LEFT - Admin Profile */
            leftSidebar={
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-red-900 rounded-full mx-auto flex items-center justify-center text-3xl mb-4">🛡️</div>
                        <h2 className="text-xl font-bold text-white">Admin Control</h2>
                        <p className="text-sm text-slate-400">System Administrator</p>
                    </div>
                    <div className="mt-6 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Total Users</span>
                            <span className="text-white">{stats.users}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Pending Verification</span>
                            <span className="text-yellow-400">{stats.pending}</span>
                        </div>
                    </div>
                </div>
            }

            /* CENTER - Verification Queue */
            mainFeed={
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Verification Queue</h3>

                    {lawyers.length === 0 && <p className="text-slate-400">No lawyers found.</p>}

                    <div className="space-y-4">
                        {lawyers.map(lawyer => (
                            <div key={lawyer._id} className="flex justify-between items-center bg-slate-800 p-4 rounded-lg border border-slate-700">
                                <div>
                                    <h4 className="font-bold text-white flex items-center gap-2">
                                        {lawyer.name}
                                        {lawyer.verified && <span className="text-green-400 text-xs bg-green-900/40 px-2 rounded">Verified</span>}
                                    </h4>
                                    <p className="text-xs text-slate-400">{lawyer.email}</p>
                                    <p className="text-xs text-slate-500 mt-1">Specialization: {lawyer.specialization}</p>

                                    {lawyer.resume ? (
                                        <a href={`http://localhost:4000${lawyer.resume}`} target="_blank" rel="noreferrer" className="text-indigo-400 text-xs hover:underline mt-2 block">
                                            📄 View Resume
                                        </a>
                                    ) : (
                                        <span className="text-slate-600 text-xs mt-2 block">No Resume Uploaded</span>
                                    )}
                                </div>

                                {!lawyer.verified && lawyer.resume && (
                                    <button
                                        onClick={() => verifyLawyer(lawyer._id)}
                                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                                    >
                                        Approve
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            }

            /* RIGHT - System Health (Mock) */
            rightSidebar={
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="font-bold text-white mb-4">System Health</h3>
                    <ul className="space-y-4">
                        <li className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Server Status</span>
                            <span className="text-green-400">● Online</span>
                        </li>
                        <li className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Database</span>
                            <span className="text-green-400">● Connected</span>
                        </li>
                        <li className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">AI Tokens</span>
                            <span className="text-indigo-400">45,200 Used</span>
                        </li>
                    </ul>
                </div>
            }
        />
    );
}
