"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { Landmark, AlertTriangle, ShieldCheck, Mail, RefreshCw } from 'lucide-react';

const RefundPolicy = () => {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 py-24 px-6 md:px-12 lg:px-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-12 h-12 rounded-xl bg-teal-600/20 border border-teal-500/20 flex items-center justify-center">
                        <Landmark size={24} className="text-teal-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Refund Policy</h1>
                </div>

                <div className="space-y-12">
                    <section className="p-8 rounded-[32px] bg-teal-500/5 border border-teal-500/20">
                        <p className="text-sm text-teal-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                            <ShieldCheck size={16} /> Transparent Pricing Policy
                        </p>
                        <p className="text-white text-base leading-relaxed font-bold">
                            At NyayNow, we charge fees to maintain the expensive high-performance AI APIs and verified lawyer marketplace coordination. Our refund rules are designed to be clear and fair for all enterprise and individual users.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <RefreshCw size={20} className="text-teal-400" />
                            1. Subscription Cancellations and Refunds
                        </h2>
                        <p className="leading-relaxed">
                            Fees paid for monthly or annual subscriptions (NyayNow Pro, NyayNow Firm) are generally non-refundable once the subscription period begins and any premium features (e.g. Judge AI, PDF analysis, document downloads) or AI query credits have been utilized. 
                        </p>
                        <p className="leading-relaxed mt-4">
                            If you purchase a subscription and change your mind within 24 hours of payment, and have **not** used any premium tools or consumed any AI query credits, you may request a full refund by contacting our support email.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <AlertTriangle size={20} className="text-teal-400" />
                            2. Pay-Per-Document and Credit Purchases
                        </h2>
                        <p className="leading-relaxed">
                            Single-document generation credits (e.g. rent agreements, NDAs drafted in Drafting Lab) and credits purchased via individual query packs are entirely non-refundable once consumed or added to your account, since the operational AI processing cost is instantly incurred by the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Landmark size={20} className="text-teal-400" />
                            3. Lawyer Directory Listing Subscriptions
                        </h2>
                        <p className="leading-relaxed">
                            Subscriptions paid by lawyers for marketplace listings or sponsored highlights are non-refundable once the listing goes live on the platform directory, since public display benefits accrue immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Mail size={20} className="text-teal-400" />
                            4. Processing Timelines and Contact
                        </h2>
                        <p className="leading-relaxed">
                            Approved refund requests will be processed and returned to the original payment source (via Razorpay/UPI gateway) within 5 to 7 business days from approval. 
                        </p>
                        <p className="leading-relaxed mt-4">
                            To initiate a refund request, please send an email with your Transaction ID, Registered Account Email, and Reason for refund to: <span className="text-teal-400 font-bold hover:underline">nyaynow.in@gmail.com</span>.
                        </p>
                    </section>

                    <section className="p-6 rounded-2xl bg-white/5 border border-white/10 italic text-sm">
                        Thank you for choosing NyayNow. Last updated: November 2025.
                    </section>
                </div>
            </motion.div>
        </div>
    );
};

export default RefundPolicy;
