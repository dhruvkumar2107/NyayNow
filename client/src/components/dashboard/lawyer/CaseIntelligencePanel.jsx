import { useRouter } from 'next/navigation';

export default function CaseIntelligencePanel({ insights }) {
    const router = useRouter();

    if (!insights || insights.length === 0) return null;

    return (
        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <span className="text-indigo-400">⚡</span> Case Intelligence
                </h3>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-black px-2 py-0.5 border border-indigo-500/20 rounded-full uppercase tracking-widest">AI Analyzed</span>
            </div>

            <div className="space-y-4">
                {insights.map((item) => (
                    <div key={item.caseId} className="border-b border-white/5 last:border-0 pb-4 last:pb-0 group">
                        <div className="flex justify-between items-start mb-2">
                            <h4
                                onClick={() => router.push(`/case/${item.caseId}`)}
                                className="font-bold text-slate-100 text-sm hover:text-indigo-400 cursor-pointer transition truncate w-2/3"
                            >
                                {item.title}
                            </h4>
                            <div className="text-right">
                                <div className={`text-sm font-black ${item.health < 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {item.health}%
                                </div>
                                <div className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">Health</div>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 mb-3 font-medium">Client: <span className="text-slate-400">{item.clientName}</span></p>

                        {/* Smart Action */}
                        <div className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plan:</span>
                            <button className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 uppercase tracking-widest">
                                {item.nextAction} →
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
