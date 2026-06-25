export default function WorkloadMonitor({ workload }) {
    if (!workload) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Light': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            case 'Balanced': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
            case 'Overloaded': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
            default: return 'bg-white/5 text-slate-400 border border-white/10';
        }
    };

    return (
        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 shadow-xl flex items-center justify-between group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Current Workload</p>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${getStatusColor(workload.status)}`}>
                    {workload.status}
                </span>
            </div>
            <div className="text-right flex flex-col items-end">
                <p className="text-3xl font-black text-white leading-tight">{workload.activeCases}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Active Cases</p>
            </div>
        </div>
    );
}
