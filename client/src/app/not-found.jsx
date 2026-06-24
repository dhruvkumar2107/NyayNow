'use client'

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Gavel, Home, Bot, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Gavel icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 14, stiffness: 120 }}
          className="flex items-center justify-center mb-8"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center shadow-2xl shadow-indigo-500/10">
            <Gavel size={36} className="text-indigo-400" />
          </div>
        </motion.div>

        {/* 404 number */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-[120px] sm:text-[160px] font-black leading-none tracking-tighter mb-2"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 40%, #a78bfa 70%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </motion.h1>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-4"
        >
          Page Not Found
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-slate-400 text-sm sm:text-base leading-relaxed mb-10"
        >
          The legal document you&apos;re looking for has been moved or doesn&apos;t exist.
          <br className="hidden sm:block" />
          Let&apos;s get you back on the right track.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <Link href="/">
            <button className="group flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-2xl hover:opacity-90 transition-all duration-200 shadow-lg shadow-indigo-500/25 text-sm">
              <Home size={16} />
              Go Home
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
          <Link href="/assistant">
            <button className="flex items-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 text-slate-300 font-bold rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-sm">
              <Bot size={16} className="text-indigo-400" />
              AI Assistant
            </button>
          </Link>
        </motion.div>

        {/* Subtle divider line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.55, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="mt-4 text-xs text-slate-600 font-medium"
        >
          NyayNow — AI Legal Intelligence
        </motion.p>
      </div>
    </div>
  );
}
