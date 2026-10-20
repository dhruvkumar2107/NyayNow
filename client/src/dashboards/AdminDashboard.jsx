'use client'

import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
    Shield, Users, CreditCard, Lock, CheckCircle, XCircle,
    Trash2, Edit2, Activity, Settings, Save, AlertTriangle, Search
} from "lucide-react";
import {
    MIBackdrop,
    Panel,
    StatTile,
    Pill,
    SidebarItem,
    GoldButton,
    Avatar,
    EmptySlot,
    AnimatedNumber,
    SectionHeading,
} from "../components/dashboard/mi/MIPrimitives";

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
        <div className="relative min-h-screen bg-[var(--bg)] selection:bg-[var(--gold)]/25">
            <MIBackdrop />
            <DashboardLayout
                /* LEFT SIDEBAR - Navigation & Stats */
                leftSidebar={
                    <div className="mi-glass-card space-y-8 p-6">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-gradient-to-br from-[var(--sos)]/30 to-[var(--gold)]/20 text-[var(--sos)]">
                                <Shield size={26} />
                            </div>
                            <h2 className="mi-body text-lg font-bold tracking-tight text-[var(--text)]">Super Admin</h2>
                            <div className="mt-2 flex items-center justify-center gap-1.5">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--emerald)]"></span>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Operational Mode</p>
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
                                <SidebarItem
                                    key={tab.id}
                                    icon={tab.icon}
                                    label={tab.label}
                                    count={tab.count}
                                    active={activeTab === tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setSelectedUserLogs(null); // Reset user filter when switching tabs
                                    }}
                                />
                            ))}
                        </nav>
                    </div>
                }

                /* CENTER PANEL - Dynamic Views */
                mainFeed={
                    <Panel hover={false} className="min-h-[600px]">
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                            {/* 1. LAWYER VERIFICATION QUEUE */}
                            {activeTab === 'lawyers' && (
                                <div className="space-y-6">
                                    <SectionHeading eyebrow="Trust & Safety" title="Pending Lawyer Verification" />
                                    <div className="grid gap-4">
                                        {pendingLawyers.map(lawyer => (
                                            <div key={lawyer._id} className="flex flex-col justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 p-5 md:flex-row md:items-center">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-base font-semibold text-[var(--text)]">{lawyer.name}</h4>
                                                        {lawyer.isStudent && <Pill tone="gold">Student</Pill>}
                                                    </div>
                                                    <p className="mt-1 text-xs text-[var(--text-muted)]">Email: {maskEmail(lawyer.email)}</p>
                                                    <p className="mt-0.5 font-mono text-xs text-[var(--text-muted)]">{lawyer.isStudent ? `Roll No: ${lawyer.studentRollNumber}` : `Bar Council ID: ${lawyer.barCouncilId}`}</p>
                                                </div>
                                                <div className="flex w-full items-center gap-2 md:w-auto">
                                                    {lawyer.idCardImage && (
                                                        <a href={lawyer.idCardImage} target="_blank" rel="noreferrer" className="mi-focus mr-2 rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--gold)]/5 px-4 py-2 text-xs font-semibold text-[var(--gold-soft)] transition hover:bg-[var(--gold)]/10">
                                                            View ID Document
                                                        </a>
                                                    )}
                                                    <button onClick={() => verifyLawyer(lawyer._id, 'rejected')} className="mi-focus rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--sos)_40%,transparent)] bg-[color-mix(in_srgb,var(--sos)_12%,transparent)] p-2.5 text-[var(--sos)] transition hover:bg-[var(--sos)] hover:text-[#0B1220]"><XCircle size={16} /></button>
                                                    <button onClick={() => verifyLawyer(lawyer._id, 'approved')} className="mi-focus rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--emerald)_40%,transparent)] bg-[color-mix(in_srgb,var(--emerald)_12%,transparent)] p-2.5 text-[var(--emerald)] transition hover:bg-[var(--emerald)] hover:text-[#0B1220]"><CheckCircle size={16} /></button>
                                                </div>
                                            </div>
                                        ))}
                                        {pendingLawyers.length === 0 && <EmptySlot icon="✓" title="Verification queue is empty" hint="All submitted credentials have been reviewed." />}
                                    </div>
                                </div>
                            )}

                            {/* 2. LAWYER REGISTRY */}
                            {activeTab === 'lawyer-registry' && (
                                <div className="space-y-6">
                                    <SectionHeading eyebrow="Directory" title="Lawyer Registry" />
                                    <div className="grid gap-4">
                                        {allLawyers.map(lawyer => (
                                            <div key={lawyer._id} className="flex justify-between rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 p-5">
                                                <div className="flex items-start gap-3">
                                                    <Avatar name={lawyer.name} size={40} />
                                                    <div>
                                                        <h4 className="text-base font-semibold text-[var(--text)]">{lawyer.name}</h4>
                                                        <p className="text-xs text-[var(--text-muted)]">Email: {maskEmail(lawyer.email)}</p>
                                                        <div className="mt-1 flex gap-2">
                                                            <Pill tone={lawyer.verified ? 'emerald' : 'warn'}>{lawyer.verified ? 'Verified' : 'Unverified'}</Pill>
                                                            <Pill tone="muted">{lawyer.plan}</Pill>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeUser(lawyer._id)} className="mi-focus h-fit rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--sos)_40%,transparent)] bg-[color-mix(in_srgb,var(--sos)_12%,transparent)] p-2.5 text-[var(--sos)] transition hover:bg-[var(--sos)] hover:text-[#0B1220]" title="Remove Lawyer">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        {allLawyers.length === 0 && <EmptySlot icon="⚖️" title="No lawyers found in system registry" />}
                                    </div>
                                </div>
                            )}

                            {/* 3. CLIENT REGISTRY */}
                            {activeTab === 'clients' && (
                                <div className="space-y-6">
                                    <SectionHeading eyebrow="Directory" title="Registered Clients" />
                                    <div className="grid gap-4">
                                        {clients.map(client => (
                                            <div key={client._id} className="flex flex-col justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 p-5 md:flex-row md:items-center">
                                                <div className="flex items-start gap-3">
                                                    <Avatar name={client.name} size={40} />
                                                    <div>
                                                        <h4 className="text-base font-semibold text-[var(--text)]">{client.name}</h4>
                                                        <p className="text-xs text-[var(--text-muted)]">Email: {maskEmail(client.email)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 md:w-auto">
                                                    {/* Edit Plan Dropdown */}
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Plan:</span>
                                                        <select
                                                            value={client.plan}
                                                            onChange={(e) => handlePlanChange(client._id, e.target.value)}
                                                            className="mi-focus rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-transparent px-3 py-1.5 text-xs text-[var(--text)] outline-none"
                                                        >
                                                            {['free', 'pro', 'gold', 'firm'].map(p => (
                                                                <option key={p} value={p} className="bg-[var(--surface)] text-[var(--text)]">{p.toUpperCase()}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* View activity logs */}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUserLogs(client);
                                                            setActiveTab('logs');
                                                        }}
                                                        className="mi-focus flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/50 px-3.5 py-1.5 text-xs font-semibold text-[var(--text)] transition hover:bg-[var(--surface-2)]"
                                                    >
                                                        <Activity size={12} /> Activity Log
                                                    </button>

                                                    {/* Delete Client */}
                                                    <button onClick={() => removeUser(client._id)} className="mi-focus rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--sos)_40%,transparent)] bg-[color-mix(in_srgb,var(--sos)_12%,transparent)] p-2 text-[var(--sos)] transition hover:bg-[var(--sos)] hover:text-[#0B1220]" title="Remove Client">
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
                                    <div className="flex items-center justify-between border-b border-[var(--gold-hairline)] pb-4">
                                        <div>
                                            <h3 className="mi-body text-xl font-semibold tracking-tight text-[var(--text)]">Dynamic Feature Matrix Limits</h3>
                                            <p className="mt-1 text-xs text-[var(--text-muted)]">Control search, predictor, and drafting counts dynamically for all plan tiers.</p>
                                        </div>
                                        {editingFeature && (
                                            <GoldButton onClick={handleSaveMatrix}>
                                                <Save size={14} /> Save Configuration
                                            </GoldButton>
                                        )}
                                    </div>

                                    <div className="mi-scroll overflow-x-auto rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30">
                                        <table className="w-full border-collapse text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-[var(--gold-hairline)] bg-[var(--gold)]/5 text-[var(--text-muted)]">
                                                    <th className="p-4 font-semibold uppercase tracking-[0.14em]">Feature Name</th>
                                                    <th className="p-4 font-semibold uppercase tracking-[0.14em]">Free Limit</th>
                                                    <th className="p-4 font-semibold uppercase tracking-[0.14em]">Pro Limit</th>
                                                    <th className="p-4 font-semibold uppercase tracking-[0.14em]">Gold Limit</th>
                                                    <th className="p-4 font-semibold uppercase tracking-[0.14em]">Firm Limit</th>
                                                    <th className="p-4 text-center font-semibold uppercase tracking-[0.14em]">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(matrixConfig).map(([key, feature]) => {
                                                    const isEditing = editingFeature === key;
                                                    return (
                                                        <tr key={key} className="border-b border-[var(--gold-hairline)] last:border-0 hover:bg-[var(--surface-2)]/40">
                                                            <td className="p-4">
                                                                <span className="block text-sm font-semibold text-[var(--text)]">{feature.label || key}</span>
                                                                <span className="mt-0.5 block text-[10px] text-[var(--text-muted)]">{feature.upgradeMessage || "No upgrade message config."}</span>
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
                                                                                className="mi-focus w-20 rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] bg-[var(--bg)] p-1.5 text-[var(--text)] outline-none"
                                                                            >
                                                                                <option value="blocked">Blocked</option>
                                                                                <option value="unlimited">Unlimited</option>
                                                                                {[0, 1, 3, 5, 10, 20, 25, 30, 50, 100].map(n => (
                                                                                    <option key={n} value={n}>{n}</option>
                                                                                ))}
                                                                            </select>
                                                                        ) : (
                                                                            <span className={`rounded px-2 py-1 text-[10px] font-bold ${
                                                                                val === false ? 'bg-[color-mix(in_srgb,var(--sos)_12%,transparent)] text-[var(--sos)]' :
                                                                                val === 'unlimited' ? 'bg-[color-mix(in_srgb,var(--emerald)_12%,transparent)] text-[var(--emerald)]' : 'bg-[var(--gold)]/10 text-[var(--gold-soft)]'
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
                                                                    className="mi-focus rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/50 p-2 text-[var(--text-muted)] transition hover:text-[var(--text)]"
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
                                    <div className="flex items-center justify-between border-b border-[var(--gold-hairline)] pb-4">
                                        <div>
                                            <h3 className="mi-body text-xl font-semibold tracking-tight text-[var(--text)]">
                                                {selectedUserLogs ? `Activity Log: ${selectedUserLogs.name}` : "User Activity Logs"}
                                            </h3>
                                            <p className="mt-1 text-xs text-[var(--text-muted)]">Immutable session logs containing exact searches, request payloads, and API status codes.</p>
                                        </div>
                                        {selectedUserLogs && (
                                            <button
                                                onClick={() => setSelectedUserLogs(null)}
                                                className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold)] underline transition hover:text-[var(--gold-soft)]"
                                            >
                                                Show All Users
                                            </button>
                                        )}
                                    </div>

                                    <div className="mi-scroll max-h-[500px] space-y-3 overflow-y-auto pr-2">
                                        {filteredLogs.map((log, i) => (
                                            <div key={i} className="space-y-2 rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 p-4 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-mono font-bold text-[var(--gold)]">{log.method} {log.endpoint}</span>
                                                    <span className="text-[var(--text-muted)]">{new Date(log.timestamp).toLocaleString()}</span>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4 text-[11px] leading-relaxed text-[var(--text-muted)] md:grid-cols-2">
                                                    <div>
                                                        <strong className="mb-0.5 block text-[var(--text)]">Payload:</strong>
                                                        <pre className="mi-scroll max-h-20 overflow-x-auto whitespace-pre-wrap rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] bg-[var(--bg)] p-2.5 font-mono">{log.requestBody}</pre>
                                                    </div>
                                                    <div>
                                                        <strong className="mb-0.5 block text-[var(--text)]">AI Response Preview:</strong>
                                                        <pre className="mi-scroll max-h-20 overflow-x-auto whitespace-pre-wrap rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] bg-[var(--bg)] p-2.5 font-mono">{log.responseBody}</pre>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 pt-1 text-[10px] font-semibold text-[var(--text-muted)]">
                                                    <span>User ID: <span className="font-mono text-[var(--text)]">{log.userId}</span></span>
                                                    <span>Duration: <span className="text-[var(--emerald)]">{log.durationMs}ms</span></span>
                                                    <span>Status: <span className={log.responseStatus >= 400 ? "text-[var(--sos)]" : "text-[var(--emerald)]"}>{log.responseStatus}</span></span>
                                                </div>
                                            </div>
                                        ))}
                                        {filteredLogs.length === 0 && <p className="py-20 text-center text-sm italic text-[var(--text-muted)]">No activity logs recorded yet.</p>}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </Panel>
                }

                /* RIGHT PANEL - Stats Summary */
                rightSidebar={
                    <div className="space-y-6">
                        <Panel hover={false} title="Platform Health" subtitle="Live Metrics" icon={<Activity size={16} />}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 p-4">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Total Users</span>
                                    <p className="mt-1 text-2xl font-bold text-[var(--text)]"><AnimatedNumber value={stats.users} /></p>
                                </div>
                                <div className="rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--emerald)_35%,transparent)] bg-[color-mix(in_srgb,var(--emerald)_10%,transparent)] p-4">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--emerald)]">Est. Revenue</span>
                                    <p className="mt-1 text-2xl font-bold text-[var(--emerald)]"><AnimatedNumber value={stats.revenue} prefix="₹" /></p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <StatTile label="Pending Verifications" value={stats.pending} sub="Awaiting review" icon={<Shield size={18} />} tone="warn" />
                            </div>
                        </Panel>

                        <div className="rounded-[var(--radius-lg)] border border-[var(--gold-hairline)] bg-[var(--gold)]/5 p-6">
                            <div className="mb-3 flex items-center gap-2">
                                <Lock size={16} className="text-[var(--gold)]" />
                                <h4 className="mi-body text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold-soft)]">Security Compliance</h4>
                            </div>
                            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                                All user queries are audited and capped to respect confidentiality standards and the DPDP Act (2023).
                            </p>
                        </div>
                    </div>
                }
            />
        </div>
    );
}
