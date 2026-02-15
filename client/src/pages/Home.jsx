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

      {/* --- LEGAL SUPERMIND SHOWCASE (UNICORN STYLE) --- */}
      <section className="py-24 bg-[#0B1120] relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-pulse delay-1000"></div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-100"></div>

        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="px-5 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(99,102,241,0.3)]"
            >
              The Pro Suite
            </motion.span>
            <h2 className="text-5xl md:text-8xl font-black text-white mt-6 mb-6 tracking-tight leading-tight">
              The Legal <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">Singularity.</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-xl md:text-2xl font-light leading-relaxed">
              Unlock the future of legal practice with our flagship AI modules. <br />Designed for the top 1%.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 perspective-1000">

            {/* CARD 1: AI ASSISTANT (FIRST) */}
            <UnicornCard
              title="AI Legal Assistant"
              desc="Your 24/7 legal genius. Ask complex queries and get citations, case laws, and strategy in seconds."
              icon="🤖"
              color="from-cyan-500 via-blue-500 to-indigo-500"
              href="/assistant"
              badge="Daily Driver"
              delay={0}
            />

            {/* CARD 2: JUDGE AI (VIRAL) */}
            <UnicornCard
              title="Judge AI Predictor"
              desc="Predict case outcomes with 94% accuracy. Analyze millions of judgments to forecast your winning probability."
              icon="⚖️"
              color="from-rose-500 via-red-500 to-orange-500"
              href="/judge-ai"
              badge="Viral"
              delay={0.1}
            />

            {/* CARD 3: NYAY VOICE (VIRAL) */}
            <UnicornCard
              title="NyayVoice"
              desc="Your multilingual AI Legal Companion. Speak naturally in Hindi, Tamil, or 10+ languages."
              icon="🎙️"
              color="from-violet-500 via-purple-500 to-fuchsia-500"
              href="/voice-assistant"
              delay={0.2}
            />

            {/* CARD 4: MOOT COURT */}
            <UnicornCard
              title="Moot Court VR"
              desc="Practice oral arguments against a ruthless AI Judge. Real-time feedback on your speech & extensive logic."
              icon="🏛️"
              color="from-indigo-500 via-purple-500 to-pink-500"
              href="/moot-court"
              badge="Flagship"
              delay={0.3}
            />

            {/* CARD 5: MARKETPLACE */}
            <UnicornCard
              title="Elite Legal Network"
              desc="Connect with the top 1% of legal minds in the country. Validated lawyers, arbitrators, and experts."
              icon="💎"
              color="from-amber-400 via-orange-500 to-red-500"
              href="/marketplace"
              badge="Exclusive"
              delay={0.4}
            />

            {/* CARD 6: DRAFTING */}
            <UnicornCard
              title="Drafting Lab"
              desc="Auto-generate ironclad contracts, clauses, and notices while detecting hidden risks instantly."
              icon="📝"
              color="from-emerald-500 via-green-500 to-lime-500"
              href="/drafting"
              delay={0.5}
            />

            {/* CARD 7: RESEARCH */}
            <UnicornCard
              title="Deep Research"
              desc="Semantic search that finds precedents based on legal context, not just keyword matching."
              icon="🔍"
              color="from-blue-500 via-cyan-500 to-teal-500"
              href="/research"
              delay={0.6}
            />

            {/* CARD 8: CAREER */}
            <UnicornCard
              title="Career Hub"
              desc="Virtual internships, task grading, and mentorship from avatars of top Supreme Court advocates."
              icon="💼"
              color="from-orange-500 via-pink-500 to-rose-500"
              href="/career"
              delay={0.7}
            />

          </div>
        </div>
      </section>

    </div>
  );
}

function UnicornCard({ title, desc, icon, color, href, badge, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -15, rotateX: 5, scale: 1.02 }}
      className="relative group cursor-pointer"
      onClick={() => window.location.href = href}
    >
      {/* GLOW EFFECT */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-500 group-hover:blur-md`}></div>

      {/* CARD CONTENT */}
      <div className="relative h-full bg-[#0a0a1a] border border-white/10 rounded-2xl p-8 flex flex-col items-start overflow-hidden hover:border-white/20 transition-all shadow-2xl">

        {badge && (
          <span className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold uppercase rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] tracking-wider">
            {badge}
          </span>
        )}

        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-3xl shadow-lg mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
          {icon}
        </div>

        <h3 className="text-2xl font-bold text-white mb-4 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-colors">
          {title}
        </h3>

        <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-grow border-l-2 border-white/5 pl-4 group-hover:border-white/20 transition-colors">
          {desc}
        </p>

        <div className="mt-auto w-full pt-4 border-t border-white/5 flex items-center justify-between text-sm font-bold text-white opacity-80 group-hover:opacity-100 transition-opacity">
          <span>Try Now</span>
          <span className="group-hover:translate-x-2 transition-transform bg-white/10 rounded-full w-8 h-8 flex items-center justify-center">→</span>
        </div>
      </div>
    </motion.div>
  );
}
