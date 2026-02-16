
import { Link } from "react-router-dom";
import { Clock, MessageCircle, ShieldAlert } from "lucide-react";

export default function VerificationPending() {
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#0f172a] border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">

                {/* Background Glow */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-500/10 rounded-full blur-[50px]" />

                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock size={40} className="text-amber-500" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Profile Under Review</h2>
                <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                    Thank you for registering! Our team is currently verifying your credentials.
                    This process usually takes about <span className="text-white font-bold">2 hours</span>.
                </p>

                <div className="bg-black/20 rounded-xl p-4 mb-8 border border-white/5 text-left">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">What happens next?</h3>
                    <ul className="space-y-3 text-sm text-slate-300">
                        <li className="flex gap-3">
                            <span className="text-amber-500">1.</span>
                            <span>We verify your Bar Council ID / Student Roll No.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-amber-500">2.</span>
                            <span>You will receive an email once approved.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-amber-500">3.</span>
                            <span>Login to access your dashboard.</span>
                        </li>
                    </ul>
                </div>

                <div className="space-y-3">
                    <Link to="/contact" className="block w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition flex items-center justify-center gap-2">
                        <MessageCircle size={18} /> Contact Support
                    </Link>
                    <Link to="/" className="block text-slate-500 text-sm hover:text-white transition">
                        Back to Home
                    </Link>
                </div>

            </div>
        </div>
    );
}
