'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, ShieldCheck } from 'lucide-react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [preferences, setPreferences] = useState({ analytics: false, marketing: false });

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const saveConsent = (choice, selected = preferences) => {
        const payload = {
            necessary: true,
            analytics: choice === 'accepted' ? true : selected.analytics,
            marketing: choice === 'accepted' ? true : selected.marketing,
            choice,
            updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('cookie-consent', JSON.stringify(payload));
        window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: payload }));
        setIsVisible(false);
        setShowSettings(false);
    };

    const handleAccept = () => saveConsent('accepted', { analytics: true, marketing: true });
    const handleEssential = () => saveConsent('essential', { analytics: false, marketing: false });

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.section
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    role="dialog"
                    aria-labelledby="cookie-consent-title"
                    className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] left-4 right-4 md:left-6 md:right-auto md:w-[400px] z-[9997]"
                >
                    <div className="bg-[#030712] border border-white/10 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                <Cookie size={20} className="text-blue-500" />
                            </div>

                            <div className="flex-1">
                                <h2 id="cookie-consent-title" className="text-white font-bold text-sm mb-1">Privacy & cookies</h2>
                                <p className="text-slate-400 text-[11px] leading-relaxed">
                                    We use essential cookies to run NyayNow and optional cookies only with your permission. Read our{' '}
                                    <Link href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link> and{' '}
                                    <Link href="/dpdp" className="text-blue-500 hover:underline">DPDP Compliance</Link>.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleEssential}
                                className="text-slate-500 hover:text-white transition p-1 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                                aria-label="Reject optional cookies and close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {showSettings ? (
                            <div className="mt-5 space-y-3">
                                <div className="flex items-start justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-3">
                                    <div>
                                        <p className="text-xs font-bold text-white">Necessary</p>
                                        <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">Required for authentication, security, and core functionality.</p>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Always on</span>
                                </div>

                                <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-3">
                                    <span>
                                        <span className="block text-xs font-bold text-white">Analytics</span>
                                        <span className="mt-0.5 block text-[10px] leading-relaxed text-slate-500">Helps us understand which features need improvement.</span>
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={preferences.analytics}
                                        onChange={(event) => setPreferences((current) => ({ ...current, analytics: event.target.checked }))}
                                        className="mt-0.5 h-4 w-4 accent-blue-500"
                                    />
                                </label>

                                <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-3">
                                    <span>
                                        <span className="block text-xs font-bold text-white">Marketing</span>
                                        <span className="mt-0.5 block text-[10px] leading-relaxed text-slate-500">Allows us to measure product updates and outreach.</span>
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={preferences.marketing}
                                        onChange={(event) => setPreferences((current) => ({ ...current, marketing: event.target.checked }))}
                                        className="mt-0.5 h-4 w-4 accent-blue-500"
                                    />
                                </label>

                                <div className="flex items-center gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => saveConsent('custom')}
                                        className="flex-1 py-2.5 bg-white text-slate-950 font-bold text-xs rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-300"
                                    >
                                        Save choices
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowSettings(false)}
                                        className="flex-1 py-2.5 bg-white/5 text-white font-bold text-xs rounded-xl border border-white/10 hover:bg-white/10 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={handleAccept}
                                    className="w-full py-2.5 bg-white text-slate-950 font-bold text-xs rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-xl shadow-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-300"
                                >
                                    Accept all
                                </button>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowSettings(true)}
                                        className="flex-1 py-2.5 bg-white/5 text-white font-bold text-xs rounded-xl border border-white/10 hover:bg-white/10 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                                    >
                                        Manage preferences
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleEssential}
                                        className="flex-1 py-2.5 bg-transparent text-slate-400 font-bold text-xs rounded-xl hover:text-white transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                                    >
                                        Essential only
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-600">
                            <ShieldCheck size={12} />
                            <span>You can clear these choices in your browser settings.</span>
                        </div>
                    </div>
                </motion.section>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
