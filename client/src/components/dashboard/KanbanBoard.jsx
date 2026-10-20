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
        <div className="mi-scroll overflow-x-auto pb-4">
            <div className="flex min-w-[1200px] gap-4">
                {STAGES.map(stage => (
                    <div key={stage} className="flex max-h-[700px] w-80 flex-shrink-0 flex-col rounded-[var(--radius-lg)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/40 p-4">
                        <div className="mb-4 flex items-center justify-between px-1">
                            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text)]">{stage}</h4>
                            <span className="rounded-full border border-[var(--gold-hairline)] bg-[var(--gold)]/10 px-2 py-0.5 text-[9px] font-bold text-[var(--gold-soft)]">{board[stage]?.length || 0}</span>
                        </div>

                        <div className="mi-scroll flex-1 space-y-4 overflow-y-auto pr-1">
                            {board[stage]?.map(c => (
                                <div key={c._id} className="mi-card-hover group rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface)]/60 p-4">
                                    <div className="mb-3 flex items-start justify-between">
                                        <span className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${c.tier === 'gold' ? 'bg-[color-mix(in_srgb,var(--warn)_14%,transparent)] text-[var(--warn)]' : 'bg-[var(--gold)]/10 text-[var(--gold-soft)]'}`}>{c.category || 'Law'}</span>
                                        <button onClick={() => window.open(`/case/${c._id}`, '_blank')} className="text-[var(--text-muted)] transition hover:text-[var(--text)]">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </button>
                                    </div>
                                    <h5 className="mb-1 text-sm font-semibold leading-tight text-[var(--text)] transition group-hover:text-[var(--gold)]">{c.title}</h5>
                                    <div className="mb-4 flex flex-col gap-1">
                                        <p className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                                            <span>Client:</span> <span className="text-[var(--text)]">{c.client?.name || "Private Client"}</span>
                                        </p>
                                        <p className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                                            <span>Opposing:</span> <span className="text-[var(--warn)]">{c.oppositionDetails || c.oppositeParty || "Not Recorded"}</span>
                                        </p>
                                    </div>

                                    {/* QUICK LINKS */}
                                    <div className="mb-4 grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => router.push('?tab=research')}
                                            className="group/btn flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] bg-[var(--gold)]/10 py-2 text-[var(--gold-soft)] transition hover:bg-[var(--gold)] hover:text-[#0B1220]"
                                        >
                                            <BookOpen size={10} className="transition group-hover/btn:scale-110" />
                                            <span className="text-[9px] font-bold uppercase tracking-tighter">Research AI</span>
                                        </button>
                                        <button
                                            onClick={() => router.push('?tab=board')}
                                            className="group/btn flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--emerald)_35%,transparent)] bg-[color-mix(in_srgb,var(--emerald)_12%,transparent)] py-2 text-[var(--emerald)] transition hover:bg-[var(--emerald)] hover:text-[#0B1220]"
                                        >
                                            <Scale size={10} className="transition group-hover/btn:scale-110" />
                                            <span className="text-[9px] font-bold uppercase tracking-tighter">e-Courts</span>
                                        </button>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-2 flex items-center justify-between border-t border-[var(--gold-hairline)] pt-3">
                                        <button
                                            disabled={stage === 'New Lead'}
                                            onClick={() => moveCard(c._id, STAGES[STAGES.indexOf(stage) - 1])}
                                            className="flex-1 text-left text-[var(--text-muted)] transition hover:text-[var(--text)] disabled:opacity-0"
                                        >
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <button
                                            disabled={stage === 'Closed'}
                                            onClick={() => moveCard(c._id, STAGES[STAGES.indexOf(stage) + 1])}
                                            className="flex-1 text-right text-[var(--text-muted)] transition hover:text-[var(--gold)] disabled:opacity-0"
                                        >
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {(!board[stage] || board[stage].length === 0) && (
                                <div className="flex h-32 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--gold-hairline)] bg-[var(--surface-2)]/20 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
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
