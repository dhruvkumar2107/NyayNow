import React, { useState, useEffect } from "react";
import { Search, Filter, Phone, Mail, MoreVertical, FileText, Calendar, Loader2, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

export default function ClientCRM() {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterTab, setFilterTab] = useState("active"); // 'active', 'pending'
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (user) {
            fetchClients();
            fetchPendingCount();
        }
    }, [user, filterTab]);

    const fetchPendingCount = async () => {
        try {
            const uId = user._id || user.id;
            const res = await axios.get(`/api/connections?userId=${uId}&status=pending`);
            setPendingCount(res.data.length);
        } catch (err) { console.error(err); }
    };

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/connections?userId=${user._id || user.id}&status=${filterTab}`);
            setClients(res.data);
        } catch (err) {
            console.error("CRM Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (connectionId, newStatus) => {
        try {
            await axios.put(`/api/connections/${connectionId}`, { status: newStatus });
            toast.success(newStatus === 'active' ? "Connection established!" : "Request declined");
            fetchClients();
        } catch (err) {
            toast.error("Process failed. Please try again.");
        }
    };

    const filteredClients = clients.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0f172a] p-6 rounded-[2rem] border border-white/10 shadow-2xl">
                <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter">Client Registry</h3>
                    <div className="flex gap-4 mt-3">
                        <button
                            onClick={() => setFilterTab('active')}
                            className={`text-[10px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition ${filterTab === 'active' ? 'text-indigo-400 border-indigo-500' : 'text-slate-600 border-transparent'}`}
                        >
                            Secured Vault
                        </button>
                        <button
                            onClick={() => setFilterTab('pending')}
                            className={`text-[10px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition ${filterTab === 'pending' ? 'text-indigo-400 border-indigo-500' : 'text-slate-600 border-transparent'}`}
                        >
                            Incoming Requests
                            {pendingCount > 0 && <span className="ml-2 px-1.5 py-0.5 bg-indigo-500 text-white text-[8px] rounded-full animate-pulse">{pendingCount}</span>}
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search identities..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition"
                        />
                    </div>
                    <button className="p-3 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-[#0f172a]/50 rounded-[2.5rem] border border-white/5 backdrop-blur-sm">
                        <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
                        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">Accessing Neural Database...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredClients.map(client => (
                            <motion.div
                                layout
                                key={client._id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="bg-[#0f172a] border border-white/5 rounded-[2rem] p-8 hover:border-indigo-500/30 transition group relative overflow-hidden shadow-xl"
                            >
                                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700" />

                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-indigo-400 font-black text-2xl shadow-2xl group-hover:scale-105 transition duration-500">
                                            {client.name?.[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-xl tracking-tighter">{client.name}</h4>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.15em]">{client.location?.city || "Remote Entity"}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                                <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.15em]">{client.plan || "Standard"} Protocol</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full lg:w-auto">
                                        {filterTab === 'pending' ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(client.connectionId, 'active')}
                                                    className="flex-1 lg:flex-none px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition flex items-center gap-2"
                                                >
                                                    <CheckCircle size={14} /> Accept Request
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(client.connectionId, 'rejected')}
                                                    className="flex-1 lg:flex-none px-6 py-3 bg-white/5 border border-white/10 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500/10 hover:text-red-400 transition flex items-center gap-2"
                                                >
                                                    <XCircle size={14} /> Decline
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 shadow-inner">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.15em]">Neural Link: Active</span>
                                            </div>
                                        )}
                                        <button className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition">
                                            <MoreVertical size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-white/5 relative z-10">
                                    <div className="flex items-center gap-4 text-slate-400 group/item">
                                        <div className="p-3 bg-white/5 rounded-xl group-hover/item:bg-indigo-500/10 group-hover/item:text-indigo-400 transition-colors"><Phone size={16} /></div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Secure Line</span>
                                            <span className="text-xs font-bold text-white/80">{client.phone || "Encrypted"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-400 group/item">
                                        <div className="p-3 bg-white/5 rounded-xl group-hover/item:bg-indigo-500/10 group-hover/item:text-indigo-400 transition-colors"><Mail size={16} /></div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Encryption P0</span>
                                            <span className="text-xs font-bold text-white/80 truncate max-w-[140px]">{client.email}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-400 group/item">
                                        <div className="p-3 bg-white/5 rounded-xl group-hover/item:bg-indigo-500/10 group-hover/item:text-indigo-400 transition-colors"><Calendar size={16} /></div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Interaction Log</span>
                                            <span className="text-xs font-bold text-white/80 italic">{new Date(client.createdAt || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-3 flex-wrap">
                                        <button className="px-5 py-3 bg-indigo-600 border border-indigo-500 rounded-xl text-[10px] text-white font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition duration-500 shadow-lg flex items-center gap-2">
                                            <MessageSquare size={14} /> Secure Message
                                        </button>
                                        <button className="px-5 py-3 bg-white/5 text-slate-300 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition duration-500 flex items-center gap-2">
                                            <FileText size={14} /> Case Files
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {!loading && filteredClients.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-[#0f172a]/30 rounded-[2.5rem] border border-white/5 backdrop-blur-sm">
                        <div className="w-16 h-16 bg-white/5 flex items-center justify-center rounded-full mx-auto mb-6 text-slate-600">
                            <Search size={32} />
                        </div>
                        <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-xs">No identities found in the current sector</p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
