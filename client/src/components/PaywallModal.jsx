import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Star, X } from "lucide-react";

export default function PaywallModal({ isOpen, onClose, title = "Upgrade to Access" }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-midnight-950/80 backdrop-blur-lg" onClick={onClose}></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative bg-[#020617] border border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
                {/* Decorative Gradients */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 p-10 md:p-12 text-center">
                    <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition"><X /></button>

                    <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white shadow-lg shadow-amber-500/20 text-4xl transform -rotate-6">
                        💎
                    </div>

                    <h2 className="text-4xl font-black text-white mb-4 tracking-tight">{title}</h2>
                    <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed font-light">
                        You've reached your free trial limit. Unlock the full power of the judiciary AI.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mb-10 text-left">
                        <PlanCard
                            name="Pro (Silver)"
                            price="₹499"
                            features={["Unlimited AI Chat", "Document Drafting", "Legal Research"]}
                        />
                        <PlanCard
                            name="Premium (Gold)"
                            price="₹1,499"
                            highlight
                            features={["Lawyer Consultation", "NyayCourt Simulator", "Agreement Review"]}
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <Link
                            href="/pricing"
                            className="bg-white text-black hover:bg-slate-200 w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition shadow-lg shadow-white/10"
                        >
                            View All Upgrade Options
                        </Link>
                        <button onClick={onClose} className="text-slate-500 hover:text-white font-medium text-xs uppercase tracking-wider transition">
                            No thanks, maybe later
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function PlanCard({ name, price, features, highlight }) {
    return (
        <div className={`p-5 rounded-2xl border transition-all ${highlight ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/50 relative overflow-hidden' : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
            {highlight && <div className="absolute top-0 right-0 bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-bl-lg uppercase">Best Value</div>}

            <h3 className={`font-bold text-sm mb-1 uppercase tracking-wider ${highlight ? 'text-amber-400' : 'text-slate-400'}`}>{name}</h3>
            <div className="text-2xl font-black text-white mb-4">{price}</div>
            <ul className="space-y-2">
                {features.map((f, i) => (
                    <li key={i} className={`text-[10px] font-bold uppercase tracking-wide flex items-start gap-2 ${highlight ? 'text-amber-100' : 'text-slate-500'}`}>
                        <span className={highlight ? 'text-amber-400' : 'text-slate-600'}>✓</span> {f}
                    </li>
                ))}
            </ul>
        </div>
    )
}
