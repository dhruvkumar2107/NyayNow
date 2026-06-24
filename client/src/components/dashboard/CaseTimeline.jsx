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
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] border-2 transition-all duration-500 ${status === 'completed' ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-white' :
                                status === 'current' ? 'bg-indigo-600 border-indigo-600 text-white scale-125 shadow-xl shadow-indigo-900/40 ring-4 ring-indigo-500/10' :
                                    'bg-slate-900 border-white/10 text-slate-600'
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
