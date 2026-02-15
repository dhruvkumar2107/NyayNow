import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SubscriptionModal = ({ isOpen, onClose, featureName }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full relative overflow-hidden shadow-2xl"
            >
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-0 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -z-0 pointer-events-none"></div>

                <div className="relative z-10 text-center">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/30 mb-6">
                        💎
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2">Upgrade to Diamond</h2>
                    <p className="text-slate-400 mb-6">
                        You've used your one-time free trial for <span className="text-indigo-400 font-bold">{featureName}</span>.
                    </p>

                    <div className="bg-slate-800/50 rounded-xl p-4 mb-8 border border-slate-700 text-left">
                        <h3 className="text-sm font-bold text-slate-300 uppercase mb-3">Diamond Plan Benefits:</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center text-slate-400 text-sm">
                                <span className="text-emerald-400 mr-2">✓</span> Unlimited AI Moot Court
                            </li>
                            <li className="flex items-center text-slate-400 text-sm">
                                <span className="text-emerald-400 mr-2">✓</span> Semantic Case Search
                            </li>
                            <li className="flex items-center text-slate-400 text-sm">
                                <span className="text-emerald-400 mr-2">✓</span> Smart Contract Drafting
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/subscription')} // Correct route is likely /subscription
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-[1.02]"
                        >
                            Get Diamond Access
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all"
                        >
                            Login to Account
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default SubscriptionModal;
