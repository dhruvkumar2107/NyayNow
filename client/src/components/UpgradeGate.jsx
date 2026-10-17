'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, Sparkles, Crown, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const FEATURE_PLANS = {
  'assistant': { free: 10, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited', label: 'AI Legal Assistant' },
  'legal-research': { free: 3, pro: 30, gold: 'unlimited', firm: 'unlimited', label: 'Precedent Research' },
  'draft-notice': { free: 1, pro: 10, gold: 'unlimited', firm: 'unlimited', label: 'Document Drafting' },
  'draft-contract': { free: false, pro: 10, gold: 'unlimited', firm: 'unlimited', label: 'Contract Drafting' },
  'agreement': { free: false, pro: 10, gold: 'unlimited', firm: 'unlimited', label: 'Agreement Generator' },
  'analyze-case-file': { free: false, pro: 5, gold: 25, firm: 'unlimited', label: 'Case PDF Analysis' },
  'analyze-agreement-pdf': { free: false, pro: 5, gold: 25, firm: 'unlimited', label: 'Agreement PDF Analysis' },
  'predict-outcome': { free: false, pro: 3, gold: 'unlimited', firm: 'unlimited', label: 'Judge AI — Outcome Predictor' },
  'case-analysis': { free: false, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited', label: 'AI Case Analysis' },
  'case-detail': { free: 5, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited', label: 'FIRAC Case Profile' },
  'chat-case': { free: 5, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited', label: 'AI Case Chat' },
  'legal-notice': { free: false, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited', label: 'Legal Notice Generator' },
  'fir-generator': { free: false, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited', label: 'FIR Draft Generator' },
  'devils-advocate': { free: false, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited', label: "Devil's Advocate Mode" },
  'moot-court': { free: false, pro: false, gold: 'unlimited', firm: 'unlimited', label: 'Moot Court / AI Judge' },
  'courtroom-battle': { free: false, pro: 3, gold: 'unlimited', firm: 'unlimited', label: 'Courtroom Battle Simulator' },
  'judge-profile': { free: false, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited', label: 'Judge Profile Analyser' },
  'career-mentor': { free: 5, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited', label: 'Legal Career Mentor' },
}

function normalizePlan(plan) {
  const p = (plan || 'free').toLowerCase();
  if (['pro'].includes(p)) return 'pro';
  if (['gold', 'silver', 'diamond'].includes(p)) return 'gold';
  if (['firm'].includes(p)) return 'firm';
  return 'free';
}

function getRequiredPlan(feature) {
  const limits = FEATURE_PLANS[feature];
  if (!limits) return 'Nyay Pro';
  if (limits.pro !== false) return 'Nyay Pro';
  if (limits.gold !== false) return 'Nyay Gold';
  return 'Nyay Firm';
}

export default function UpgradeGate({ feature, children, className = '' }) {
  const { user } = useAuth();
  
  const userPlan = normalizePlan(user?.plan);
  const featureLimits = FEATURE_PLANS[feature];
  const isAllowed = featureLimits ? featureLimits[userPlan] !== false : true;

  if (isAllowed) {
    return <>{children}</>;
  }

  const requiredPlanName = getRequiredPlan(feature);
  const featureLabel = featureLimits?.label || 'Premium Feature';

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/5 bg-[#030712]/40 p-1 ${className}`}>
      {/* Blurred background preview of the children */}
      <div className="pointer-events-none select-none blur-[8px] opacity-25">
        {children}
      </div>

      {/* Paywall Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-[#020617]/60 to-[#020617]/95 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md space-y-5"
        >
          {/* Icon */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto text-blue-400 shadow-xl shadow-blue-500/10">
            {requiredPlanName === 'Nyay Gold' ? (
              <Crown size={20} className="text-amber-400 animate-pulse" />
            ) : (
              <Lock size={18} />
            )}
          </div>

          {/* Title & Desc */}
          <div className="space-y-2">
            <h3 className="text-lg font-black text-white tracking-tight uppercase">
              Unlock {featureLabel}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This feature is reserved for users on the <span className="text-white font-bold">{requiredPlanName}</span> plan and above. Upgrade today to unlock full AI legal capability.
            </p>
          </div>

          {/* Upgrade CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/pricing"
              className="px-5 py-2.5 rounded-xl bg-white text-[#020617] font-black text-xs uppercase tracking-wider hover:bg-blue-500 hover:text-white transition duration-300 flex items-center justify-center gap-1.5 shadow-lg"
            >
              <Sparkles size={12} />
              Upgrade to {requiredPlanName}
            </Link>
            <Link
              href="/pricing"
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-wider hover:bg-white/10 transition duration-300 flex items-center justify-center gap-1.5"
            >
              See Pricing <ArrowRight size={12} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
