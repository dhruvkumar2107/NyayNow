import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Home() {
  const { user } = useAuth();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Backgrounds */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-white to-transparent pointer-events-none"
        />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">AI-Powered Legal Intelligence</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]"
          >
            Your Personal
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Legal Supermind.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Navigate the complexities of Indian Law with confidence. Draft notices, analyze contracts, and consult top lawyers—all powered by advanced AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 transition shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-95 duration-200"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-slate-700 border border-slate-200 font-bold text-base hover:bg-slate-50 transition active:scale-95 duration-200"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <Link
                to={user.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard"}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 text-white font-bold text-base hover:bg-indigo-700 transition shadow-xl shadow-indigo-600/20 active:scale-95 duration-200"
              >
                Go to Dashboard
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* --- PRO-SUITE SHOWCASE (NEW) --- */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-900 to-black pointer-events-none"></div>

        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-bold uppercase tracking-widest mb-4"
            >
              For Law Students & Junior Lawyers
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black mb-6">The Legal Supermind Suite.</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Master the art of law with next-gen AI tools designed for the modern advocate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* FEATURE 1: MOOT COURT (FLAGSHIP) */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="md:col-span-8 bg-gradient-to-br from-purple-900 to-slate-900 rounded-3xl p-10 border border-white/10 relative overflow-hidden group cursor-pointer"
              onClick={() => window.location.href = '/moot-court'}
            >
              <div className="absolute top-0 right-0 p-32 bg-purple-600 blur-[100px] opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <span className="text-5xl">🏛️</span>
                  <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold uppercase tracking-wider">Flagship</span>
                </div>
                <h3 className="text-3xl font-bold mb-2">AI Moot Court Simulator</h3>
                <p className="text-slate-300 mb-8 max-w-md">
                  Practice oral arguments in a virtual high court. Get real-time feedback on confidence, logic, and citations from an AI Judge.
                </p>
                <div className="inline-flex items-center gap-2 text-purple-300 font-bold group-hover:gap-4 transition-all">
                  Enter Courtroom <span>→</span>
                </div>
              </div>
              {/* Visualizer Effect */}
              <div className="absolute bottom-0 left-0 right-0 h-24 flex items-end justify-center gap-1 opacity-30">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-4 bg-purple-500 rounded-t-lg" style={{ height: `${Math.random() * 100}%` }}></div>
                ))}
              </div>
            </motion.div>

            {/* FEATURE 2: RESEARCH */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="md:col-span-4 bg-slate-800 rounded-3xl p-8 border border-white/10 relative overflow-hidden group cursor-pointer"
              onClick={() => window.location.href = '/research'}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <span className="text-4xl block mb-6">🔍</span>
              <h3 className="text-xl font-bold mb-2">Intelligent Research</h3>
              <p className="text-slate-400 text-sm mb-6">Find precedents via semantic search. Not just keywords, but context.</p>
              <span className="text-blue-400 text-sm font-bold">Start Searching →</span>
            </motion.div>

            {/* FEATURE 3: DRAFTING */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="md:col-span-4 bg-slate-800 rounded-3xl p-8 border border-white/10 relative overflow-hidden group cursor-pointer"
              onClick={() => window.location.href = '/drafting'}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <span className="text-4xl block mb-6">📝</span>
              <h3 className="text-xl font-bold mb-2">Smart Drafting Lab</h3>
              <p className="text-slate-400 text-sm mb-6">Auto-generate clauses and detect risks in contracts instantly.</p>
              <span className="text-emerald-400 text-sm font-bold">Open Lab →</span>
            </motion.div>

            {/* FEATURE 4: CAREER */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="md:col-span-4 bg-slate-800 rounded-3xl p-8 border border-white/10 relative overflow-hidden group cursor-pointer"
              onClick={() => window.location.href = '/career'}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <span className="text-4xl block mb-6">💼</span>
              <h3 className="text-xl font-bold mb-2">Career & Mentorship</h3>
              <p className="text-slate-400 text-sm mb-6">Virtual internships and mentorship from top Supreme Court advocates.</p>
              <span className="text-pink-400 text-sm font-bold">Launch Career →</span>
            </motion.div>

            {/* FEATURE 5: JUDGE AI */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="md:col-span-4 bg-slate-800 rounded-3xl p-8 border border-white/10 relative overflow-hidden group cursor-pointer"
              onClick={() => window.location.href = '/judge-ai'}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <span className="text-4xl block mb-6">⚖️</span>
              <h3 className="text-xl font-bold mb-2">Judge AI Predictor</h3>
              <p className="text-slate-400 text-sm mb-6">Predict case outcomes with 90% accuracy using historical data.</p>
              <span className="text-yellow-400 text-sm font-bold">Analyze Case →</span>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- TRUST FOOTER --- */}
      <section className="py-12 border-t border-slate-200 bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition duration-500">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Trusted By Teams At</span>
          <div className="flex gap-8 items-center">
            <div className="h-6 w-24 bg-slate-300 rounded"></div>
            <div className="h-6 w-24 bg-slate-300 rounded"></div>
            <div className="h-6 w-24 bg-slate-300 rounded"></div>
            <div className="h-6 w-24 bg-slate-300 rounded"></div>
          </div>
        </div>
      </section>

    </div>
  );
}
