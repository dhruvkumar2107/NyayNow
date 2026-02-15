import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import Footer from "../components/Footer";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-indigo-500/30">

      {/* --- HERO SECTION (PREMIUM DARK) --- */}
      <section className="relative pt-32 pb-32 lg:pt-48 lg:pb-40 overflow-hidden">
        {/* Abstract Backgrounds with New Gradients */}
        <div className="absolute top-0 left-0 right-0 h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#020617] to-[#020617] pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

        <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-sm mb-6 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-xs font-bold text-indigo-300 tracking-[0.15em] uppercase">The Future of Legal Practice</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-serif font-bold tracking-tight text-white mb-6 leading-[1.05]"
          >
            Your Personal <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-violet-400">Legal Supermind.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            Navigate the complexities of Indian Law with elite precision. <br className="hidden md:block" />
            Designed for the top 1% of legal professionals and visionary firms.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-10 py-5 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-indigo-50 transition shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95 duration-200 uppercase tracking-wider"
                >
                  Start Free Trial
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-10 py-5 rounded-xl bg-white/5 text-white border border-white/10 font-bold text-sm hover:bg-white/10 transition active:scale-95 duration-200 uppercase tracking-wider"
                >
                  Member Login
                </Link>
              </>
            ) : (
              <Link
                to={user.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard"}
                className="w-full sm:w-auto px-10 py-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition shadow-[0_0_40px_rgba(99,102,241,0.4)] active:scale-95 duration-200 uppercase tracking-wider flex items-center gap-2 justify-center"
              >
                Enter Command Center
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* --- LEGAL SUPERMIND SHOWCASE --- */}
      <section className="py-24 bg-[#020617] relative overflow-hidden border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
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
              title="Elite Network"
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
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-500 group-hover:blur-md`}></div>

      {/* CARD CONTENT */}
      <div className="relative h-full bg-[#0f172a] border border-white/5 rounded-2xl p-8 flex flex-col items-start overflow-hidden hover:border-white/10 transition-all shadow-xl">

        {badge && (
          <span className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold uppercase rounded-full shadow-sm tracking-wider">
            {badge}
          </span>
        )}

        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-3xl shadow-lg mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative z-10 text-white`}>
          {icon}
        </div>

        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>

        <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-grow border-l-2 border-white/5 pl-4 group-hover:border-indigo-500/50 transition-colors font-normal">
          {desc}
        </p>

        <div className="mt-auto w-full pt-4 border-t border-white/5 flex items-center justify-between text-sm font-bold text-slate-500 opacity-80 group-hover:opacity-100 transition-opacity uppercase tracking-wider text-xs">
          <span>Explore Module</span>
          <span className="group-hover:translate-x-2 transition-transform bg-white/5 rounded-full w-8 h-8 flex items-center justify-center border border-white/10 text-white">→</span>
        </div>
      </div>
    </motion.div>
  );
}
