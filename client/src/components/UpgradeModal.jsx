'use client'
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Star, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function UpgradeModal({ isOpen, onClose, feature = "AI Queries" }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 20 }}
          className="relative z-10 bg-[#0d1526] border border-indigo-500/20 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-indigo-500/20"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition rounded-xl hover:bg-white/5"
          >
            <X size={18} />
          </button>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
            <Sparkles size={28} className="text-white" />
          </div>

          {/* Header */}
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              Limit Reached
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">Upgrade to continue</h2>
          <p className="text-slate-400 text-sm mb-6">
            You&apos;ve used all your free {feature}. Upgrade to Pro for unlimited access.
          </p>

          {/* Usage bar */}
          <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400">Free Queries Used</span>
              <span className="text-xs font-black text-red-400">5/5</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full w-full" />
            </div>
          </div>

          {/* Plans */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-4 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl">
              <div className="p-2 bg-indigo-500/20 rounded-xl">
                <Zap size={16} className="text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-black text-sm">Pro Plan</p>
                <p className="text-slate-400 text-xs">Unlimited AI + Judge AI + Drafting</p>
              </div>
              <span className="text-white font-black">
                ₹499<span className="text-slate-400 text-xs font-normal">/mo</span>
              </span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <div className="p-2 bg-amber-500/20 rounded-xl">
                <Star size={16} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-black text-sm">Firm Plan</p>
                <p className="text-slate-400 text-xs">Everything + CRM + Moot Court</p>
              </div>
              <span className="text-amber-400 font-black">
                ₹4,999<span className="text-slate-400 text-xs font-normal">/mo</span>
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <Link href="/pricing" onClick={onClose}>
              <button className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-2xl hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25">
                <Zap size={16} /> Upgrade Now <ArrowRight size={16} />
              </button>
            </Link>
            <button
              onClick={onClose}
              className="w-full py-3 text-slate-500 font-bold text-sm hover:text-slate-300 transition"
            >
              Continue with free plan
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
