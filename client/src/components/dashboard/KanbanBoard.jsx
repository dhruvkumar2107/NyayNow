import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Scale, BookOpen, Search, Zap } from 'lucide-react';

const STAGES = ['New Lead', 'Discovery', 'Filing', 'Hearing', 'Judgment', 'Closed'];

export default function KanbanBoard({ cases, onUpdate }) {
    const router = useRouter();
    const [board, setBoard] = useState({});

    useEffect(() => {
        // Group cases by stage
        const grouped = STAGES.reduce((acc, stage) => {
            acc[stage] = cases.filter(c => (c.stage || 'New Lead') === stage);
            return acc;
        }, {});
        setBoard(grouped);
    }, [cases]);

    const moveCard = async (caseId, newStage) => {
        try {
            await axios.patch(`/api/cases/${caseId}/stage`, { stage: newStage });
            onUpdate(); // Refresh parent
        } catch (err) {
            alert("Failed to move case");
        }
    };

    return (
        <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-[1200px]">
                {STAGES.map(stage => (
                    <div key={stage} className="w-80 bg-[#0f172a] rounded-2xl p-4 border border-white/5 flex-shrink-0 flex flex-col max-h-[700px] shadow-sm">
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h4 className="font-bold text-white text-[10px] uppercase tracking-[0.2em]">{stage}</h4>
                            <span className="bg-white/5 text-slate-400 text-[9px] px-2 py-0.5 rounded-full border border-white/5 font-black">{board[stage]?.length || 0}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
                            {board[stage]?.map(c => (
                                <div key={c._id} className="bg-[#1e293b]/30 p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all duration-300 group shadow-inner">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${c.tier === 'gold' ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'}`}>{c.category || 'Law'}</span>
                                        <button onClick={() => window.open(`/case/${c._id}`, '_blank')} className="text-slate-500 hover:text-white transition">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </button>
                                    </div>
                                    <h5 className="font-bold text-slate-100 text-sm mb-1 leading-tight group-hover:text-indigo-400 transition">{c.title}</h5>
                                    <div className="flex flex-col gap-1 mb-4">
                                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider flex items-center justify-between">
                                            <span>Client:</span> <span className="text-white">{c.client?.name || "Private Client"}</span>
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider flex items-center justify-between">
                                            <span>Opposing:</span> <span className="text-amber-400">{c.oppositionDetails || c.oppositeParty || "Not Recorded"}</span>
                                        </p>
                                    </div>

                                    {/* QUICK LINKS */}
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <button 
                                            onClick={() => router.push('?tab=research')}
                                            className="flex items-center justify-center gap-1.5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all duration-300 group/btn"
                                        >
                                            <BookOpen size={10} className="group-hover/btn:scale-110 transition" />
                                            <span className="text-[9px] font-black uppercase tracking-tighter">Research AI</span>
                                        </button>
                                        <button 
                                            onClick={() => router.push('?tab=board')}
                                            className="flex items-center justify-center gap-1.5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all duration-300 group/btn"
                                        >
                                            <Scale size={10} className="group-hover/btn:scale-110 transition" />
                                            <span className="text-[9px] font-black uppercase tracking-tighter">e-Courts</span>
                                        </button>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-2">
                                        <button
                                            disabled={stage === 'New Lead'}
                                            onClick={() => moveCard(c._id, STAGES[STAGES.indexOf(stage) - 1])}
                                            className="text-slate-500 hover:text-white font-bold text-sm disabled:opacity-0 flex-1 text-left transition"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <button
                                            disabled={stage === 'Closed'}
                                            onClick={() => moveCard(c._id, STAGES[STAGES.indexOf(stage) + 1])}
                                            className="text-slate-500 hover:text-indigo-400 font-bold text-sm disabled:opacity-0 flex-1 text-right transition"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {(!board[stage] || board[stage].length === 0) && (
                                <div className="h-32 border border-dashed border-white/5 rounded-xl flex items-center justify-center text-slate-600 text-[10px] font-bold uppercase tracking-widest bg-white/[0.01]">
                                    No Items
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
