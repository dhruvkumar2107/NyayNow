import React, { useState, useEffect, useCallback } from "react";
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

    const fetchPendingCount = useCallback(async () => {
        if (!user) return;
        try {
            const uId = user._id || user.id;
            const res = await axios.get(`/api/connections?userId=${uId}&status=pending`);
            setPendingCount(res.data.length);
        } catch (err) { console.error(err); }
    }, [user]);

    const fetchClients = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await axios.get(`/api/connections?userId=${user._id || user.id}&status=${filterTab}`);
            setClients(res.data);
        } catch (err) {
            console.error("CRM Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, [user, filterTab]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    useEffect(() => {
        fetchPendingCount();
    }, [fetchPendingCount]);

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
            <div className="mi-glass-card flex flex-col items-start justify-between gap-4 p-6 md:flex-row md:items-center">
                <div>
                    <h3 className="mi-body text-2xl font-bold tracking-tight text-[var(--text)]">Client Registry</h3>
                    <div className="mt-3 flex gap-4">
                        <button
                            onClick={() => setFilterTab('active')}
                            className={`border-b-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${filterTab === 'active' ? 'border-[var(--gold)] text-[var(--gold)]' : 'border-transparent text-[var(--text-muted)]'}`}
                        >
                            Active Clients
                        </button>
                        <button
                            onClick={() => setFilterTab('pending')}
                            className={`border-b-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${filterTab === 'pending' ? 'border-[var(--gold)] text-[var(--gold)]' : 'border-transparent text-[var(--text-muted)]'}`}
                        >
                            Incoming Requests
                            {pendingCount > 0 && <span className="ml-2 animate-pulse rounded-full bg-[var(--sos)] px-1.5 py-0.5 text-[8px] text-white">{pendingCount}</span>}
                        </button>
                    </div>
                </div>

                <div className="flex w-full gap-3 md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                        <input
                            type="text"
                            placeholder="Search identities..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="mi-focus w-full rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/40 py-3 pl-10 pr-4 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
                        />
                    </div>
                    <button className="mi-focus rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/40 p-3 text-[var(--text-muted)] transition hover:text-[var(--text)]">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 py-24 backdrop-blur-sm">
                        <Loader2 className="mb-4 animate-spin text-[var(--gold)]" size={40} />
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]">Loading clients...</p>
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
                                className="mi-card-hover group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 p-8"
                            >
                                <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--gold)]/5 blur-[80px] transition-colors duration-700 group-hover:bg-[var(--gold)]/10" />

                                <div className="relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                                    <div className="flex items-center gap-5">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-gradient-to-br from-[var(--gold)]/30 to-[var(--emerald)]/20 text-2xl font-bold text-[var(--text)] shadow-2xl transition duration-500 group-hover:scale-105">
                                            {client.name?.[0]}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold tracking-tight text-[var(--text)]">{client.name}</h4>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">{client.location?.city || "Remote"}</span>
                                                <span className="h-1 w-1 rounded-full bg-[var(--gold-hairline)]"></span>
                                                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--gold)]">{client.plan || "Standard"} Plan</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex w-full items-center gap-3 lg:w-auto">
                                        {filterTab === 'pending' ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(client.connectionId, 'active')}
                                                    className="mi-focus flex flex-1 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--emerald)] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B1220] shadow-lg transition hover:brightness-110 lg:flex-none"
                                                >
                                                    <CheckCircle size={14} /> Accept Request
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(client.connectionId, 'rejected')}
                                                    className="mi-focus flex flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/40 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] transition hover:bg-[color-mix(in_srgb,var(--sos)_12%,transparent)] hover:text-[var(--sos)] lg:flex-none"
                                                >
                                                    <XCircle size={14} /> Decline
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--emerald)_35%,transparent)] bg-[color-mix(in_srgb,var(--emerald)_10%,transparent)] px-4 py-2 text-[var(--emerald)]">
                                                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--emerald)]"></div>
                                                <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Connection Active</span>
                                            </div>
                                        )}
                                        <button className="mi-focus rounded-[var(--radius-md)] p-3 text-[var(--text-muted)] transition hover:bg-[var(--surface-2)]/60 hover:text-[var(--text)]">
                                            <MoreVertical size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="relative z-10 mt-10 grid grid-cols-1 gap-6 border-t border-[var(--gold-hairline)] pt-8 md:grid-cols-4">
                                    <div className="group/item flex items-center gap-4 text-[var(--text-muted)]">
                                        <div className="rounded-[var(--radius-sm)] bg-[var(--surface-2)]/50 p-3 transition-colors group-hover/item:bg-[var(--gold)]/10 group-hover/item:text-[var(--gold)]"><Phone size={16} /></div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Phone</span>
                                            <span className="text-xs font-bold text-[var(--text)]">{client.phone || "Not provided"}</span>
                                        </div>
                                    </div>
                                    <div className="group/item flex items-center gap-4 text-[var(--text-muted)]">
                                        <div className="rounded-[var(--radius-sm)] bg-[var(--surface-2)]/50 p-3 transition-colors group-hover/item:bg-[var(--gold)]/10 group-hover/item:text-[var(--gold)]"><Mail size={16} /></div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Email</span>
                                            <span className="max-w-[140px] truncate text-xs font-bold text-[var(--text)]">{client.email}</span>
                                        </div>
                                    </div>
                                    <div className="group/item flex items-center gap-4 text-[var(--text-muted)]">
                                        <div className="rounded-[var(--radius-sm)] bg-[var(--surface-2)]/50 p-3 transition-colors group-hover/item:bg-[var(--gold)]/10 group-hover/item:text-[var(--gold)]"><Calendar size={16} /></div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Connected Since</span>
                                            <span className="text-xs font-bold italic text-[var(--text)]">{new Date(client.createdAt || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-end gap-3">
                                        <button className="mi-focus flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--gold)] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B1220] shadow-lg transition hover:brightness-110">
                                            <MessageSquare size={14} /> Secure Message
                                        </button>
                                        <button className="mi-focus flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/40 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text)] transition hover:bg-[var(--surface-2)]">
                                            <FileText size={14} /> Case Files
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {!loading && filteredClients.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-[var(--radius-lg)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/20 py-24 text-center backdrop-blur-sm">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-2)]/50 text-[var(--text-muted)]">
                            <Search size={32} />
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]">No clients found</p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
