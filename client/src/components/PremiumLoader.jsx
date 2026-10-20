import { motion } from "framer-motion";

export default function PremiumLoader({ text = "Loading Experience..." }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg)]">
            {/* Background Glow */}
            <div className="mi-orb-a absolute h-64 w-64 rounded-full bg-[var(--gold)]/15 blur-[100px]"></div>
            <div className="mi-orb-b absolute h-56 w-56 rounded-full bg-[var(--emerald)]/10 blur-[110px]"></div>

            <div className="relative z-10 flex flex-col items-center gap-6">
                {/* Logo/Spinner Wrapper */}
                <div className="relative h-20 w-20">
                    {/* Spinning Rings */}
                    <div className="absolute inset-0 rounded-full border-4 border-[var(--gold-hairline)]"></div>
                    <div className="absolute inset-0 animate-spin rounded-full border-t-4 border-[var(--gold)] [animation-duration:0.6s]"></div>
                    <div className="absolute inset-2 animate-spin rounded-full border-r-4 border-[var(--gold-soft)]/50 [animation-duration:0.8s]"></div>

                    {/* Center Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="animate-pulse text-2xl">⚖️</span>
                    </div>
                </div>

                {/* Text */}
                <div className="text-center">
                    <h3 className="mi-body mb-1 text-lg font-bold uppercase tracking-widest text-[var(--text)]">{text}</h3>
                    <div className="flex justify-center gap-1">
                        <motion.div
                            initial={{ opacity: 0.2 }}
                            animate={{ opacity: 1 }}
                            transition={{ repeat: Infinity, duration: 0.4, repeatType: "reverse" }}
                            className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]"
                        />
                        <motion.div
                            initial={{ opacity: 0.2 }}
                            animate={{ opacity: 1 }}
                            transition={{ repeat: Infinity, duration: 0.4, delay: 0.1, repeatType: "reverse" }}
                            className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]"
                        />
                        <motion.div
                            initial={{ opacity: 0.2 }}
                            animate={{ opacity: 1 }}
                            transition={{ repeat: Infinity, duration: 0.4, delay: 0.2, repeatType: "reverse" }}
                            className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
