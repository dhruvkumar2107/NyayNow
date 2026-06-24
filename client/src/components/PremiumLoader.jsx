import { motion } from "framer-motion";

export default function PremiumLoader({ text = "Loading Experience..." }) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#020617] relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>

            <div className="relative z-10 flex flex-col items-center gap-6">
                {/* Logo/Spinner Wrapper */}
                <div className="relative w-20 h-20">
                    {/* Spinning Rings */}
                    <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                    <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin [animation-duration:0.6s]"></div>
                    <div className="absolute inset-2 border-r-4 border-purple-500/50 rounded-full animate-spin [animation-duration:0.8s]"></div>

                    {/* Center Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl animate-pulse">⚖️</span>
                    </div>
                </div>

                {/* Text */}
                <div className="text-center">
                    <h3 className="text-white font-bold text-lg tracking-widest uppercase mb-1">{text}</h3>
                    <div className="flex justify-center gap-1">
                        <motion.div
                            initial={{ opacity: 0.2 }}
                            animate={{ opacity: 1 }}
                            transition={{ repeat: Infinity, duration: 0.4, repeatType: "reverse" }}
                            className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
                        />
                        <motion.div
                            initial={{ opacity: 0.2 }}
                            animate={{ opacity: 1 }}
                            transition={{ repeat: Infinity, duration: 0.4, delay: 0.1, repeatType: "reverse" }}
                            className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
                        />
                        <motion.div
                            initial={{ opacity: 0.2 }}
                            animate={{ opacity: 1 }}
                            transition={{ repeat: Infinity, duration: 0.4, delay: 0.2, repeatType: "reverse" }}
                            className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
