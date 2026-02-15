import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, X } from 'lucide-react';

const SubscriptionModal = ({ isOpen, onClose, featureName }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-midnight-950/90 backdrop-blur-xl" onClick={onClose}></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-[#0f172a] border border-white/10 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl overflow-hidden"
            >
                {/* Background Effects */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/30 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] pointer-events-none"></div>

                <button onClick={onClose} className="absolute top-6 right-6 text-slate-600 hover:text-white transition p-2 rounded-full hover:bg-white/5"><X size={20} /></button>

                <div className="relative z-10 text-center">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-indigo-500/40 mb-8 border border-white/10">
                        ✨
                    </div>

                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Unlock {featureName || "Feature"}</h2>
                    <p className="text-slate-400 mb-8 font-light text-sm leading-relaxed px-4">
                        You've reached the free limit. Upgrade to <span className="text-indigo-400 font-bold">Diamond</span> for unlimited access to advanced legal intelligence.
                    </p>

                    <div className="bg-white/5 rounded-2xl p-5 mb-8 border border-white/5 text-left space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-400"><Check size={12} /></div>
                            <span className="text-slate-200 text-sm font-medium">Unlimited Case Analysis</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-400"><Check size={12} /></div>
                            <span className="text-slate-200 text-sm font-medium">AI Moot Court Simulator</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-400"><Check size={12} /></div>
                            <span className="text-slate-200 text-sm font-medium">Auto-Drafting Suite</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/pricing')}
                            className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            Get Diamond Access
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition"
                        >
                            Login to Restore
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SubscriptionModal;
