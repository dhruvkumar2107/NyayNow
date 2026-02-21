import React from 'react';
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, MessageCircle, ShieldAlert, CheckCircle, Mail, ArrowRight } from "lucide-react";
import Navbar from '../components/Navbar';

const STEPS = [
    {
        icon: <ShieldAlert size={18} className="text-amber-400" />,
        title: "Identity Verification",
        desc: "We verify your Bar Council ID, enrollment number, or student roll via official databases.",
        done: true
    },
    {
        icon: <CheckCircle size={18} className="text-slate-500" />,
        title: "Document Review",
        desc: "Our compliance team reviews your uploaded credentials. Usually complete within 2 hours.",
        done: false
    },
    {
        icon: <Mail size={18} className="text-slate-500" />,
        title: "Approval Email",
        desc: "You'll receive an email with your access credentials and dashboard link upon approval.",
        done: false
    },
];

export default function VerificationPending() {
    return (
        <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-amber-500/30">
            <Navbar />

            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', duration: 0.7 }}
                    className="max-w-md w-full"
                >
                    {/* TOP ACCENT */}
                    <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-t-3xl shadow-[0_0_20px_rgba(245,158,11,0.3)]" />

                    <div className="bg-[#0f172a] border border-white/10 border-t-0 rounded-b-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-20 -left-20 w-48 h-48 bg-amber-500/8 rounded-full blur-[60px] pointer-events-none" />
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/8 rounded-full blur-[60px] pointer-events-none" />

                        <div className="relative z-10">
                            {/* ICON */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring' }}
                                className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(245,158,11,0.15)]"
                            >
                                <Clock size={40} className="text-amber-400" />
                            </motion.div>

                            <div className="text-center mb-8">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                    <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Verification In Progress</span>
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-3 font-serif">Profile Under Review</h2>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Thank you for registering with NyayNow. Our compliance team is verifying your credentials.
                                    This process takes about <span className="text-white font-bold">2 hours</span> during business hours.
                                </p>
                            </div>

                            {/* STEPS */}
                            <div className="space-y-4 mb-8">
                                {STEPS.map((step, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                        className={`flex gap-4 p-4 rounded-xl border transition ${step.done
                                                ? 'bg-amber-500/5 border-amber-500/20'
                                                : 'bg-white/[0.02] border-white/8'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-amber-500/20' : 'bg-white/5'}`}>
                                            {step.icon}
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-bold mb-0.5 ${step.done ? 'text-amber-300' : 'text-slate-400'}`}>
                                                {step.title} {step.done && <span className="text-xs text-amber-500 font-bold ml-1">✓ Submitted</span>}
                                            </h4>
                                            <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* ACTIONS */}
                            <div className="space-y-3">
                                <Link
                                    to="/contact"
                                    className="block w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm"
                                >
                                    <MessageCircle size={16} /> Contact Support <ArrowRight size={14} />
                                </Link>
                                <Link
                                    to="/"
                                    className="block w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition text-center text-sm"
                                >
                                    Back to Home
                                </Link>
                            </div>

                            <p className="text-center text-xs text-slate-600 mt-5">
                                🔒 Your credentials are verified securely. We never share your data.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
