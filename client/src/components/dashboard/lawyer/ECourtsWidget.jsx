import React, { useState } from 'react';
import { Search, Scale, FileText, Loader2, Calendar, MapPin, UserCheck, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ECourtsWidget() {
    const [cnr, setCnr] = useState("");
    const [loading, setLoading] = useState(false);
    const [caseData, setCaseData] = useState(null);

    const fetchCaseStatus = async () => {
        if (!cnr || cnr.length < 10) {
            toast.error("Enter a valid CNR Number (approx 16 alphanumeric characters).");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/ecourts/status', 
                { cnr },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setCaseData(res.data);
            toast.success("Case status synchronized with e-Courts registry.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to connect to e-Courts nodes. Server busy.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#0f172a] rounded-[2rem] p-6 border border-white/5 shadow-2xl relative overflow-hidden group">
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <Scale size={20} className="text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white tracking-tight">e-Courts Sync Tracker</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Live Government Registry</p>
                    </div>
                </div>
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
            </div>

            {/* Input Area */}
            <div className="flex flex-col gap-3 mb-6">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        value={cnr}
                        onChange={(e) => setCnr(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && fetchCaseStatus()}
                        placeholder="Enter 16-digit CNR Number..."
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 transition font-mono text-sm uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal placeholder:font-sans"
                        maxLength={16}
                    />
                </div>
                <button
                    onClick={fetchCaseStatus}
                    disabled={loading || !cnr.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 uppercase tracking-wide text-[10px]"
                >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : "Fetch Live Status"}
                </button>
            </div>

            {/* Results Display */}
            {caseData && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-bold text-white text-sm">{caseData.caseInfo.partyName}</h4>
                                <p className="text-xs text-indigo-400 font-mono mt-1">{caseData.caseInfo.cnr}</p>
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                                caseData.status.currentStatus === 'Disposed' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            }`}>
                                {caseData.status.currentStatus}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-slate-500" />
                                <div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Next Hearing</p>
                                    <p className="text-xs text-white mt-0.5">{caseData.status.nextHearingDate || "None"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText size={14} className="text-slate-500" />
                                <div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Stage</p>
                                    <p className="text-xs text-white mt-0.5">{caseData.status.stageOfCase}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 col-span-2">
                                <UserCheck size={14} className="text-slate-500" />
                                <div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Presiding Judge</p>
                                    <p className="text-xs text-white mt-0.5">{caseData.status.judgeAssigned}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 col-span-2">
                                <MapPin size={14} className="text-slate-500" />
                                <div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Court</p>
                                    <p className="text-xs text-white mt-0.5">{caseData.status.courtName}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Empty State */}
            {!caseData && !loading && (
                <div className="text-center p-6 border border-dashed border-white/10 rounded-xl bg-white/5">
                    <AlertCircle className="mx-auto text-slate-600 mb-2" size={24} />
                    <p className="text-xs text-slate-500 font-medium">Input CNR to pull official registry details regarding case hearings, orders, and bench details.</p>
                </div>
            )}
        </div>
    );
}
