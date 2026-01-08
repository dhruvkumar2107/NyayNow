import { Link } from "react-router-dom";

export default function PaywallModal({ isOpen, onClose, title = "Upgrade to Access" }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-sm border border-blue-100">
                        <span className="text-3xl">💎</span>
                    </div>

                    <h2 className="text-3xl font-extrabold text-[#0B1120] mb-2">{title}</h2>
                    <p className="text-slate-500 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                        You've reached your free trial limit. Unlock unlimited access to AI analysis, drafting, and legal insights.
                    </p>

                    <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
                        <PlanCard
                            name="Silver"
                            price="₹499"
                            features={["Full Accuracy Scores", "Unlimited Drafting", "Basic Support"]}
                        />
                        <PlanCard
                            name="Gold"
                            price="₹999"
                            highlight
                            features={["Everything in Silver", "Priority Processing", "Advanced Legal Insights"]}
                        />
                        <PlanCard
                            name="Diamond"
                            price="₹2499"
                            features={["Unlock Everything", "Human Lawyer Review", "Concierge Support"]}
                        />
                    </div>

                    <Link
                        to="/pricing"
                        className="inline-flex items-center gap-2 bg-[#0B1120] hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-900/10 transform hover:-translate-y-0.5"
                    >
                        View Upgrade Options <span>→</span>
                    </Link>

                    <button
                        onClick={onClose}
                        className="block mx-auto mt-6 text-sm text-slate-400 hover:text-slate-600 font-medium transition"
                    >
                        No thanks, maybe later
                    </button>
                </div>
            </div>
        </div>
    );
}

function PlanCard({ name, price, features, highlight }) {
    return (
        <div className={`p-5 rounded-2xl border transition-all ${highlight ? 'bg-white border-blue-500 ring-4 ring-blue-500/5 shadow-xl relative z-10' : 'bg-slate-50 border-slate-200'}`}>
            <h3 className={`font-bold text-lg mb-1 ${highlight ? 'text-blue-600' : 'text-[#0B1120]'}`}>{name}</h3>
            <div className="text-2xl font-extrabold text-[#0B1120] mb-3">{price}</div>
            <ul className="space-y-2.5">
                {features.map((f, i) => (
                    <li key={i} className="text-xs text-slate-600 font-medium flex items-start gap-2 leading-snug">
                        <span className="text-blue-600 font-bold mt-0.5">✓</span> {f}
                    </li>
                ))}
            </ul>
        </div>
    )
}
