export default function TrustTimeline({ stage }) {
    const steps = [
        { label: 'Reviewing', stage: 'New Lead' },
        { label: 'Fact Finding', stage: 'Discovery' },
        { label: 'Paperwork', stage: 'Filing' },
        { label: 'In Court', stage: 'Hearing' },
        { label: 'Finalizing', stage: 'Judgment' }
    ];

    const currentIdx = steps.findIndex(s => s.stage === stage) || 0;

    return (
        <div className="bg-[#0f172a] border border-white/10 rounded-xl p-5 shadow-sm mb-6">
            <h3 className="font-bold text-white mb-4">Case Progress</h3>

            <div className="relative flex justify-between">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10 rounded-full"></div>
                <div
                    className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-1000"
                    style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, idx) => (
                    <div key={step.label} className="flex flex-col items-center">
                        <divItem
                            active={idx <= currentIdx}
                            current={idx === currentIdx}
                            index={idx + 1}
                        />
                        <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${idx <= currentIdx ? 'text-slate-300' : 'text-slate-600'}`}>
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-6 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 text-sm text-slate-300">
                <span className="font-bold text-blue-400">Current Status:</span> {
                    stage === 'New Lead' ? "Your lawyer is reviewing the initial details." :
                        stage === 'Discovery' ? "Gathering evidence and facts for the case." :
                            stage === 'Filing' ? "Preparing official documents for the court." :
                                stage === 'Hearing' ? "Representing your case in court sessions." :
                                    "Awaiting final judgment or settlement."
                }
            </div>
        </div>
    );
}

function divItem({ active, current, index }) {
    if (current) {
        return (
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-blue-900/50 shadow-md transform scale-110 transition-all">
                {index}
            </div>
        );
    }
    if (active) {
        return (
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                ✓
            </div>
        );
    }
    return (
        <div className="w-8 h-8 rounded-full bg-[#0f172a] border-2 border-white/10 text-slate-600 flex items-center justify-center font-bold text-xs">
            {index}
        </div>
    );
}
