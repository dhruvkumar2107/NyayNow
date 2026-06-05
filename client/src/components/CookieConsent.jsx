'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, ShieldCheck } from 'lucide-react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[400px] z-[99999]"
                >
                    <div className="bg-[#030712] border border-white/10 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                <Cookie size={20} className="text-blue-500" />
                            </div>

                            <div className="flex-1">
                                <h3 className="text-white font-bold text-sm mb-1">Privacy Preference</h3>
                                <p className="text-slate-400 text-[11px] leading-relaxed">
                                     We use cookies to enhance your experience. Your data is strictly secured and <span className="text-white font-bold">never used for AI training</span>. Read our <a href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</a>.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsVisible(false)}
                                className="text-slate-500 hover:text-white transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-6 flex items-center gap-3">
                            <button
                                onClick={handleAccept}
                                className="flex-1 py-2.5 bg-white text-slate-950 font-bold text-xs rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-xl shadow-white/5"
                            >
                                Accept All
                            </button>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="flex-1 py-2.5 bg-white/5 text-white font-bold text-xs rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                            >
                                Settings
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
