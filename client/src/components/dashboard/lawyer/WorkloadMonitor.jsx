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
        <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Current Workload</p>
                <span className={`px-2 py-1 rounded-md text-xs font-black uppercase tracking-wide ${getStatusColor(workload.status)}`}>
                    {workload.status}
                </span>
            </div>
            <div className="text-right">
                <p className="text-2xl font-black text-white">{workload.activeCases}</p>
                <p className="text-[10px] text-slate-500 font-medium">Active Cases</p>
            </div>
        </div>
    );
}
