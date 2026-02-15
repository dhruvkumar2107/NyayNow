import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Check, ArrowRight, Star } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#fbbf24', '#818cf8', '#ffffff'] // amber, indigo, white
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#fbbf24', '#818cf8', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const goToDashboard = () => {
    if (!user) { navigate("/login"); return; }
    navigate(user.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] font-sans selection:bg-amber-500/30 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 p-12 rounded-[3rem] max-w-lg w-full text-center shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
          className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-[0_0_50px_rgba(16,185,129,0.4)] border-4 border-emerald-500/30"
        >
          <Check size={48} strokeWidth={4} />
        </motion.div>

        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Access Granted.</h1>
        <p className="text-slate-300 mb-8 text-lg font-light leading-relaxed">
          Welcome to the elite circle. Your plan upgrade was successful and your premium features are now active.
        </p>

        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6 mb-10 relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-center gap-3 text-amber-400 font-bold uppercase tracking-widest text-sm">
            <Star size={16} fill="currentColor" /> Premium Status Unlocked
          </div>
        </div>

        <button
          onClick={goToDashboard}
          className="w-full py-5 bg-white text-midnight-950 font-black rounded-2xl hover:bg-slate-200 hover:scale-[1.02] transition shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 group text-sm uppercase tracking-wider"
        >
          Enter Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
        </button>
      </motion.div>
    </div>
  );
}
