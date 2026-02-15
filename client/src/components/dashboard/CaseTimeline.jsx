export default function CaseTimeline({ stage, timeline = [] }) {
    const checkStatus = (stepStage) => {
        const STAGES = ['New Lead', 'Discovery', 'Filing', 'Hearing', 'Judgment', 'Closed'];
        const currentIdx = STAGES.indexOf(stage);
        const stepIdx = STAGES.indexOf(stepStage);

        if (stepIdx < currentIdx) return 'completed';
        if (stepIdx === currentIdx) return 'current';
        return 'upcoming';
    };

    const steps = ['Discovery', 'Filing', 'Hearing', 'Judgment', 'Closed'];

    return (
        <div className="w-full py-4">
            <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 w-full h-1 bg-white/10 -z-10 rounded-full"></div>

                {steps.map((step, idx) => {
                    const status = checkStatus(step);
                    return (
                        <div key={step} className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-4 transition-all ${status === 'completed' ? 'bg-emerald-500 border-emerald-900/50 text-white' :
                                status === 'current' ? 'bg-blue-600 border-blue-900/50 text-white scale-110 shadow-lg shadow-blue-900/40' :
                                    'bg-[#0f172a] border-white/10 text-slate-500'
                                }`}>
                                {status === 'completed' ? '✓' : idx + 1}
                            </div>
                            <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${status === 'current' ? 'text-blue-400' :
                                status === 'completed' ? 'text-emerald-400' : 'text-slate-600'
                                }`}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
