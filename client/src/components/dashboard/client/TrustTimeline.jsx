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
        <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 p-5">
            <h3 className="mb-4 font-semibold text-[var(--text)]">Case Progress</h3>

            <div className="relative flex justify-between">
                <div className="absolute left-0 top-1/2 -z-10 h-1 w-full rounded-full bg-[var(--gold-hairline)]"></div>
                <div
                    className="absolute left-0 top-1/2 -z-10 h-1 rounded-full bg-[var(--gold)] transition-all duration-1000"
                    style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, idx) => (
                    <div key={step.label} className="flex flex-col items-center">
                        <StepDot
                            active={idx <= currentIdx}
                            current={idx === currentIdx}
                            index={idx + 1}
                        />
                        <span className={`mt-2 text-[10px] font-semibold uppercase tracking-wider ${idx <= currentIdx ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-6 rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--gold)]/5 p-3 text-sm text-[var(--text-muted)]">
                <span className="font-semibold text-[var(--gold)]">Current Status:</span> {
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

function StepDot({ active, current, index }) {
    if (current) {
        return (
            <div className="flex h-8 w-8 scale-110 items-center justify-center rounded-full bg-[var(--gold)] text-xs font-bold text-[#0B1220] shadow-md ring-4 ring-[var(--gold)]/20 transition-all">
                {index}
            </div>
        );
    }
    if (active) {
        return (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--emerald)] text-xs font-bold text-[#0B1220]">
                ✓
            </div>
        );
    }
    return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--gold-hairline)] bg-[var(--surface)] text-xs font-bold text-[var(--text-muted)]">
            {index}
        </div>
    );
}
