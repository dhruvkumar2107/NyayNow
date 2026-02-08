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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-white to-transparent pointer-events-none" />
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

      {/* --- BENTO GRID FEATURES --- */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to win.</h2>
            <p className="text-slate-500">Powerful tools designed for modern legal professionals and citizens.</p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* LARGE CARD LEFT */}
            <motion.div variants={item} className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-slate-50 border border-slate-200 p-8 min-h-[300px] flex flex-col justify-between hover:shadow-2xl hover:shadow-slate-200/50 transition duration-500">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm mb-4">🤖</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">AI Legal Assistant</h3>
                <p className="text-slate-500 max-w-sm">Instant answers to complex legal queries, drafted in seconds. Powered by Gemini 2.5 Pro.</p>
              </div>
              <div className="absolute right-0 bottom-0 w-1/2 h-full bg-gradient-to-l from-indigo-50/50 to-transparent pointer-events-none" />
              <img src="https://ui-avatars.com/api/?name=AI&background=6366f1&color=fff" className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 group-hover:opacity-20 transition duration-500 rotate-12" alt="" />

              <Link to="/assistant" className="mt-8 inline-flex items-center text-indigo-600 font-semibold group-hover:translate-x-1 transition">
                Try Assistant <span className="ml-1">→</span>
              </Link>
            </motion.div>

            {/* TALL CARD RIGHT */}
            <motion.div variants={item} className="md:row-span-2 relative group overflow-hidden rounded-3xl bg-slate-900 text-white p-8 flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-900/20 transition duration-500">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl shadow-sm mb-4">⚖️</div>
                <h3 className="text-2xl font-bold mb-2">Verified Lawyers</h3>
                <p className="text-slate-400">Connect with top-tier advocates from the Supreme Court and High Courts.</p>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs">✓</div>
                  <div className="text-sm font-medium">Bar Council Verified</div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">★</div>
                  <div className="text-sm font-medium">Top Rated Experts</div>
                </div>
              </div>

              <Link to="/marketplace" className="mt-8 inline-flex items-center text-indigo-400 font-semibold group-hover:translate-x-1 transition">
                Find a Lawyer <span className="ml-1">→</span>
              </Link>
            </motion.div>

            {/* SMALL CARD 1 */}
            <motion.div variants={item} className="relative group overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 hover:border-indigo-200 transition duration-500">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-4">📄</div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Contract Analysis</h3>
              <p className="text-sm text-slate-500 mb-4">Detect risks & missing clauses instantly.</p>
              <Link to="/agreements" className="text-sm font-semibold text-blue-600 inset-0 absolute" />
            </motion.div>

            {/* SMALL CARD 2 */}
            <motion.div variants={item} className="relative group overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 hover:border-indigo-200 transition duration-500">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-4">📍</div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Nearby Support</h3>
              <p className="text-sm text-slate-500 mb-4">Find legal aid & notaries near you.</p>
              <Link to="/nearby" className="text-sm font-semibold text-purple-600 inset-0 absolute" />
            </motion.div>

          </motion.div>
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
