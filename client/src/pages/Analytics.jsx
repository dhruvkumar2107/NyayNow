import { useAuth } from "../context/AuthContext";
import { BarChart3, TrendingUp, Users, MessageSquare, Eye, ArrowUpRight } from "lucide-react";

export default function Analytics() {
    const { user } = useAuth();

    const stats = [
        { label: "Profile Views", value: "1,284", change: "+12.5%", icon: <Eye size={20} />, color: "text-blue-400", bg: "bg-blue-500/10" },
        { label: "Search Appearances", value: "845", change: "+5.2%", icon: <Users size={20} />, color: "text-purple-400", bg: "bg-purple-500/10" },
        { label: "Leads Contacted", value: "128", change: "+8.1%", icon: <TrendingUp size={20} />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { label: "Client Messages", value: "342", change: "+20.3%", icon: <MessageSquare size={20} />, color: "text-amber-400", bg: "bg-amber-500/10" },
    ];

    return (
        <div className="min-h-screen bg-[#020617] px-6 py-10 font-sans text-slate-400">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Performance Analytics</h1>
                        <p className="text-slate-400">Track your reach and engagement across the Elite Network.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm font-medium text-slate-300">
                        Date Range: <span className="text-white ml-2">Last 30 Days ▾</span>
                    </div>
                </header>

                {/* Key Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-lg hover:bg-white/10 transition group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}>{s.icon}</div>
                                <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                                    {s.change} <ArrowUpRight size={12} />
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-1">{s.value}</h2>
                            <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* TRAFFIC CHART */}
                    <div className="md:col-span-2 bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 shadow-xl">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                <BarChart3 size={20} className="text-indigo-400" />
                                Traffic Overview
                            </h3>
                            <button className="text-xs text-indigo-400 font-bold uppercase hover:text-indigo-300">View Report</button>
                        </div>

                        {/* CSS Bar Chart */}
                        <div className="flex items-end gap-4 h-64 w-full pl-4 border-l border-white/10 border-b relative">
                            {/* Grid Lines */}
                            {[0, 25, 50, 75, 100].map(y => (
                                <div key={y} className="absolute w-full border-t border-white/5" style={{ bottom: `${y}%`, left: 0 }}></div>
                            ))}

                            {[40, 65, 30, 85, 55, 95, 70].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col justify-end group cursor-pointer relative h-full">
                                    <div
                                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg opacity-80 group-hover:opacity-100 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                                        style={{ height: `${h}%` }}
                                    ></div>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-midnight-900 font-bold text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                                        {h * 10} Views
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-500 mt-4 uppercase tracking-wider px-2">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                    </div>

                    {/* CONVERSION donut */}
                    <div className="md:col-span-1 bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-center">
                        <h3 className="font-bold text-white text-lg mb-6 text-center">Lead Conversion</h3>
                        <div className="relative w-48 h-48 mx-auto mb-8">
                            {/* Donut Chart using Conic Gradient */}
                            <div className="w-full h-full rounded-full" style={{ background: "conic-gradient(#6366f1 0% 64%, #1e293b 64% 100%)" }}></div>
                            <div className="absolute inset-4 bg-midnight-900 rounded-full flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-white">64%</span>
                                <span className="text-xs text-slate-500 uppercase font-bold">Success Rate</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <span className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
                                    Converted
                                </div>
                                <span className="font-bold text-white">64%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <span className="w-3 h-3 bg-slate-700 rounded-full"></span>
                                    Pending
                                </div>
                                <span className="font-bold text-white">36%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
