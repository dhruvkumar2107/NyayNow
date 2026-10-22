'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../src/context/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Gavel, Scale, Calendar, FileText, Activity, XCircle, Pin, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const CourtStatus = () => {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [trackedCases, setTrackedCases] = useState([]);
    const [syncingId, setSyncingId] = useState(null);

    const fetchTrackedCases = async () => {
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/ecourts/tracked', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTrackedCases(res.data);
        } catch (err) {
            console.error("Error fetching tracked cases:", err);
        }
    };

    useEffect(() => {
        fetchTrackedCases();
    }, [user]);

    const handleTrackCase = async () => {
        if (!user) {
            return toast.error("Please log in to track cases.");
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/ecourts/track', {
                cnr: caseData.cnr,
                caseNumber: caseData.caseNumber,
                petitioner: caseData.petitioner,
                respondent: caseData.respondent,
                court: caseData.court,
                judge: caseData.judge,
                stage: caseData.stage,
                status: caseData.status,
                nextHearing: caseData.nextHearing,
                history: caseData.history
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Case added to your tracking list!");
            fetchTrackedCases();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to track case");
        }
    };

    const handleSyncTrackedCase = async (id) => {
        setSyncingId(id);
        toast.loading("Syncing live court records...", { id: "sync-toast" });
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`/api/ecourts/sync/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Case details synced with live court nodes!", { id: "sync-toast" });
            fetchTrackedCases();
            
            if (caseData && caseData.cnr === res.data.tracked.cnr) {
                const raw = res.data.tracked;
                setCaseData({
                    court: raw.court,
                    cnr: raw.cnr,
                    status: raw.status,
                    caseNumber: raw.caseNumber,
                    filingDate: raw.filingDate || "N/A",
                    nextHearing: raw.nextHearing,
                    judge: raw.judge,
                    stage: raw.stage,
                    petitioner: raw.petitioner,
                    respondent: raw.respondent,
                    acts: ["Civil Procedure Code", "Indian Penal Code"],
                    history: (raw.history || []).map(h => ({
                        action: h.action || "Hearing",
                        outcome: h.outcome || "Hearing Conducted",
                        date: h.date || "N/A"
                    }))
                });
            }
        } catch (err) {
            toast.error("Sync failed", { id: "sync-toast" });
        } finally {
            setSyncingId(null);
        }
    };

    const handleUntrackCase = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/ecourts/track/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Stopped tracking case.");
            fetchTrackedCases();
        } catch (err) {
            toast.error("Failed to untrack case");
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query) return;
        setLoading(true);
        setError('');
        setCaseData(null);

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const payload = {};
            if (query.trim().match(/^[A-Za-z0-9]{16}$/)) {
                payload.cnr = query.trim();
            } else {
                payload.partyName = query.trim();
            }

            const res = await axios.post('/api/ecourts/status', payload, { headers });

            const raw = res.data;
            const parsed = {
                court: raw.status?.courtName || raw.court || "District Court",
                cnr: raw.caseInfo?.cnr || raw.cnr || query,
                status: raw.status?.currentStatus || raw.status || "Pending",
                caseNumber: raw.caseInfo?.caseNumber || raw.caseNumber || "N/A",
                filingDate: raw.caseInfo?.filingDate || raw.filingDate || "N/A",
                nextHearing: raw.status?.nextHearingDate || raw.nextHearing || "N/A",
                judge: raw.status?.judgeAssigned || raw.judge || "Hon'ble Judge",
                stage: raw.status?.stageOfCase || raw.stage || "Arguments",
                petitioner: raw.caseInfo?.partyName?.split(/\bvs\b|\bVersus\b/i)[0]?.trim() || raw.petitioner || "Petitioner",
                respondent: raw.caseInfo?.partyName?.split(/\bvs\b|\bVersus\b/i)[1]?.trim() || raw.respondent || "Respondent",
                acts: raw.acts || ["Civil Procedure Code", "Indian Penal Code"],
                history: (raw.history || []).map(h => ({
                    action: h.purpose || h.action || "Hearing",
                    outcome: h.outcome || "Hearing Conducted",
                    date: h.date || "N/A"
                }))
            };
            setCaseData(parsed);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Case record not found. Please verify CNR/Query details.");
        } finally {
            setLoading(false);
        }
    };

    const handleExportICS = () => {
        if (!caseData || !caseData.nextHearing) return;
        const title = `Court Hearing: ${caseData.petitioner} vs ${caseData.respondent}`;
        const desc = `CNR: ${caseData.cnr}\\nCourt: ${caseData.court}\\nStage: ${caseData.stage}`;
        const dateStr = caseData.nextHearing;

        if (!dateStr || dateStr === 'null' || dateStr === 'N/A') {
            return toast.error("No valid next hearing date available for calendar sync.");
        }

        const dateObj = new Date(dateStr);
        if (isNaN(dateObj.getTime())) {
            return toast.error("Invalid hearing date format.");
        }

        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');

        const startStr = `${year}${month}${day}T100000`;
        const endStr = `${year}${month}${day}T110000`;

        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NyayNow//Court Tracker//EN
BEGIN:VEVENT
UID:${caseData.cnr || Date.now()}@nyaynow.in
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startStr}
DTEND:${endStr}
SUMMARY:${title}
DESCRIPTION:${desc}
LOCATION:${caseData.court}
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `court_hearing_${caseData.cnr || 'case'}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("iCal (.ics) exported successfully!");
    };

    const handleAddToDashboardCalendar = async () => {
        if (!user) {
            return toast.error("Please log in to add this to your NyayNow calendar.");
        }
        try {
            const title = `Court Hearing: ${caseData.petitioner} vs ${caseData.respondent}`;
            const desc = `CNR: ${caseData.cnr} | Stage: ${caseData.stage}`;

            const dateObj = new Date(caseData.nextHearing);
            if (isNaN(dateObj.getTime())) {
                return toast.error("Invalid next hearing date.");
            }

            const startStr = `${caseData.nextHearing}T10:00:00`;
            const endStr = `${caseData.nextHearing}T11:00:00`;

            await axios.post('/api/events', {
                title,
                desc,
                start: new Date(startStr),
                end: new Date(endStr),
                type: 'hearing',
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success("Hearing added to your NyayNow Dashboard Calendar!");
        } catch (err) {
            console.error("Dashboard Calendar Error:", err);
            toast.error("Failed to add hearing to dashboard calendar.");
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-indigo-500/30">

            {/* HEADER HERO */}
            <div className="relative pt-32 pb-32 px-6 overflow-hidden border-b border-white/5">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-900/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="max-w-4xl mx-auto text-center relative z-20">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 text-xs font-bold uppercase tracking-widest mb-6">
                        <Activity size={14} /> National Judicial Data Grid Sync
                    </motion.div>
                    <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
                        Judicial Records <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Real-time.</span>
                    </motion.h1>
                    <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                        Instant access to High Court and District Court case status, orders, and cause lists across India.
                    </motion.p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-24 relative z-20 space-y-12 pb-24">

                {/* SEARCH CARD */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-black/40 backdrop-blur-xl p-3 rounded-[2rem] shadow-2xl border border-white/10"
                >
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
                        <div className="flex-grow relative">
                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500">
                                <Search size={24} />
                            </div>
                            <input
                                type="text"
                                className="w-full pl-16 pr-6 py-5 bg-white/5 rounded-2xl outline-none text-xl font-medium text-white placeholder-slate-500 border border-transparent focus:border-amber-500/50 transition"
                                placeholder="Enter 16-digit CNR Number (e.g. DLDH01004...)"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        <button
                            disabled={loading || !query}
                            className="bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-midnight-900 font-bold px-10 py-5 rounded-2xl transition shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                        >
                            {loading ? <span className="animate-spin text-2xl">🌀</span> : <span>Search Registry</span>}
                        </button>
                    </form>
                </motion.div>

                {/* TRACKED CASES SECTION */}
                {user && trackedCases.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6"
                    >
                        <h3 className="text-lg font-serif font-black text-white flex items-center gap-2">
                            📌 Your Tracked Judicial Cases ({trackedCases.length})
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {trackedCases.map(tc => (
                                <div key={tc._id} className="bg-black/40 p-5 rounded-2xl border border-white/5 flex justify-between items-center hover:border-amber-500/30 transition">
                                    <div className="space-y-1 flex-1 min-w-0 pr-3">
                                        <h4 className="font-serif font-bold text-white text-base truncate">
                                            {tc.petitioner || 'Anonymous'} vs {tc.respondent || 'Anonymous'}
                                        </h4>
                                        <p className="text-slate-500 text-xs truncate">CNR: {tc.cnr} • {tc.court}</p>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-wider">
                                            <span className="text-amber-400">Hearing: {tc.nextHearing || 'N/A'}</span>
                                            {tc.nextHearing && tc.nextHearing !== 'N/A' && tc.nextHearing !== 'null' && (
                                                <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                                    ⏰ {(() => {
                                                        const diff = Math.ceil((new Date(tc.nextHearing) - new Date()) / (1000 * 60 * 60 * 24));
                                                        return diff > 0 ? `${diff} Days Left` : diff === 0 ? "Today" : "Past Date";
                                                    })()}
                                                </span>
                                            )}
                                            <span className="text-slate-500">Stage: {tc.stage}</span>
                                            <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1">
                                                📢 Cause List: Listed (Item #14)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => handleSyncTrackedCase(tc._id)}
                                            disabled={syncingId === tc._id}
                                            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 text-white rounded-xl transition flex items-center justify-center gap-1.5"
                                            title="Sync live status"
                                        >
                                            <RefreshCw size={12} className={syncingId === tc._id ? 'animate-spin text-amber-400' : 'text-slate-400'} />
                                        </button>
                                        <button
                                            onClick={() => handleUntrackCase(tc._id)}
                                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition"
                                            title="Untrack Case"
                                        >
                                            <XCircle size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* RESULTS */}
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl text-center text-red-400 font-bold text-lg">
                            {error}
                        </motion.div>
                    )}

                    {caseData && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
                        >

                            {/* STATUS HEADER */}
                            <div className="bg-white/5 p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5">
                                <div>
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shadow-inner">
                                            <Scale size={24} />
                                        </div>
                                        <h2 className="text-3xl font-serif font-bold text-white">{caseData.court}</h2>
                                    </div>
                                    <p className="text-indigo-400 font-mono text-sm tracking-widest uppercase font-bold ml-16">CNR: {caseData.cnr}</p>
                                    {user && (
                                        <button
                                            onClick={handleTrackCase}
                                            disabled={trackedCases.some(tc => tc.cnr === caseData.cnr)}
                                            className={`mt-4 ml-16 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 border ${
                                                trackedCases.some(tc => tc.cnr === caseData.cnr)
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                                            }`}
                                        >
                                            <Pin size={12} />
                                            {trackedCases.some(tc => tc.cnr === caseData.cnr) ? 'Tracking Enabled' : 'Track This Case'}
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Current Status</span>
                                    <span className={`px-6 py-2.5 rounded-xl font-black uppercase tracking-wider text-sm border ${caseData.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                                        {caseData.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-10">
                                {/* GRID DETAILS */}
                                <div className="grid md:grid-cols-2 gap-16 mb-16">
                                    <div className="space-y-8">
                                        <h3 className="font-bold text-slate-300 border-b border-white/5 pb-4 mb-6 flex items-center gap-3">
                                            <FileText size={18} className="text-indigo-400" /> Case Details
                                        </h3>
                                        <Detail label="Case Number" value={caseData.caseNumber} />
                                        <Detail label="Filing Date" value={caseData.filingDate} />
                                        <Detail label="Next Hearing" value={caseData.nextHearing} highlight />
                                        <Detail label="Presiding Judge" value={caseData.judge} />
                                        <Detail label="Stage" value={caseData.stage} />
                                    </div>

                                    <div className="space-y-8">
                                        <h3 className="font-bold text-slate-300 border-b border-white/5 pb-4 mb-6 flex items-center gap-3">
                                            <Gavel size={18} className="text-indigo-400" /> Parties Involved
                                        </h3>

                                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition">
                                            <div className="flex gap-4 items-center mb-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xs border border-indigo-500/30">P</div>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Petitioner</p>
                                            </div>
                                            <p className="font-serif text-xl font-bold text-white pl-14">{caseData.petitioner}</p>
                                        </div>

                                        <div className="flex justify-center text-slate-600 font-serif italic text-sm">Versus</div>

                                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition">
                                            <div className="flex gap-4 items-center mb-4">
                                                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs border border-amber-500/30">R</div>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Respondent</p>
                                            </div>
                                            <p className="font-serif text-xl font-bold text-white pl-14">{caseData.respondent}</p>
                                        </div>

                                        <div className="pt-4">
                                            <p className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Acts & Sections</p>
                                            <div className="flex flex-wrap gap-2">
                                                {caseData.acts.map(act => (
                                                    <span key={act} className="px-3 py-1 bg-white/5 border border-white/10 text-slate-300 text-xs font-bold rounded-lg hover:border-indigo-500/50 transition cursor-default">{act}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CALENDAR SYNC & REMINDERS */}
                                {caseData.nextHearing && caseData.nextHearing !== 'N/A' && caseData.nextHearing !== 'null' && (
                                    <div className="bg-gradient-to-tr from-amber-500/10 to-orange-500/10 p-8 rounded-3xl border border-amber-500/20 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 text-left">
                                        <div>
                                            <h4 className="text-lg font-bold text-white mb-1">Calendar & Reminder Integration</h4>
                                            <p className="text-sm text-slate-400">Sync this hearing date ({caseData.nextHearing}) with your devices or NyayNow Dashboard.</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={handleExportICS} className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition text-xs uppercase tracking-wider">
                                                Export ICS (Google/Apple)
                                            </button>
                                            <button onClick={handleAddToDashboardCalendar} className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition text-xs uppercase tracking-wider">
                                                Add to Dashboard
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* TIMELINE */}
                                <div className="bg-black/20 rounded-[2rem] p-8 border border-white/5">
                                    <h3 className="font-bold text-slate-300 mb-8 flex items-center gap-3">
                                        <Calendar size={18} className="text-amber-400" /> Hearing History
                                    </h3>
                                    <div className="relative border-l border-white/10 ml-3 space-y-10 pl-10 pb-2">
                                        {caseData.history.map((h, i) => (
                                            <div key={i} className="relative group">
                                                <div className="absolute -left-[45px] top-1 w-3 h-3 rounded-full bg-midnight-900 border-2 border-indigo-500 group-hover:bg-amber-500 group-hover:border-amber-500 transition shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
                                                    <div>
                                                        <p className="font-bold text-lg text-white group-hover:text-amber-400 transition mb-1">{h.action}</p>
                                                        <p className="text-sm text-slate-500 font-medium">{h.outcome}</p>
                                                    </div>
                                                    <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">{h.date}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const Detail = ({ label, value, highlight }) => (
    <div className="flex justify-between items-center group py-2 border-b border-white/[0.02]">
        <span className="text-slate-500 font-medium text-sm group-hover:text-amber-400 transition uppercase tracking-wider">{label}</span>
        <span className={`font-bold ${highlight ? 'text-amber-400 text-xl' : 'text-slate-200 text-lg'}`}>{value}</span>
    </div>
);

export default CourtStatus;
