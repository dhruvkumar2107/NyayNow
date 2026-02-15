import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Mail, Linkedin, MapPin, Globe, Award, Briefcase, Gavel, Star, MessageCircle, UserPlus, Clock } from "lucide-react";

export default function LawyerProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [lawyer, setLawyer] = useState(null);
    const [connection, setConnection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        if (!user) {
            toast.error("Please login to view lawyer profiles");
            navigate("/login");
            return;
        }

        const fetchData = async () => {
            try {
                const profileRes = await axios.get(`/api/users/public/${id}`);
                setLawyer(profileRes.data);

                if (user) {
                    const connRes = await axios.get(`/api/connections?userId=${user._id || user.id}&status=all`);
                    const myConnection = connRes.data.find(c => c._id === id);
                    if (myConnection) {
                        setConnection({
                            status: myConnection.connectionStatus,
                            _id: myConnection.connectionId
                        });
                    }
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user, navigate]);

    const handleConnect = async () => {
        try {
            setConnecting(true);
            await axios.post("/api/connections", {
                clientId: user._id || user.id,
                lawyerId: id,
                initiatedBy: user.role
            });
            toast.success("Request sent successfully!");
            setConnection({ status: 'pending' });
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to send request");
        } finally {
            setConnecting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!lawyer) return <div className="min-h-screen bg-[#020617] flex items-center justify-center font-bold text-xl text-white">Lawyer not found</div>;

    return (
        <main className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-indigo-500/30">
            <Navbar />

            {/* HEADER HERO */}
            <div className="relative pt-32 pb-20 px-4 max-w-7xl mx-auto">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
                <div className="absolute top-20 left-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">

                    {/* LEFT: PROFILE INFO (Sticky) */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-600/20 to-purple-600/20"></div>

                            <div className="relative w-40 h-40 mx-auto rounded-full p-1 bg-gradient-to-br from-indigo-400 to-purple-500 shadow-2xl mb-6">
                                <div className="w-full h-full rounded-full bg-midnight-900 overflow-hidden relative">
                                    {lawyer.image ? (
                                        <img src={lawyer.image} className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-5xl">⚖️</div>
                                    )}
                                </div>
                                <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-midnight-900 rounded-full"></div>
                            </div>

                            <div className="text-center relative">
                                <h1 className="text-3xl font-bold text-white mb-2 font-serif tracking-tight">{lawyer.name}</h1>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30 text-xs font-bold mb-8 uppercase tracking-widest">
                                    <Award size={12} className="text-amber-400" /> {lawyer.specialization}
                                </div>

                                <div className="flex justify-center gap-8 border-t border-white/5 pt-6 mb-8">
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-white">{lawyer.experience || 1}+</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Years</div>
                                    </div>
                                    <div className="text-center border-l border-white/5 pl-8">
                                        <div className="text-2xl font-black text-white flex items-center justify-center gap-1">4.9 <Star size={14} className="text-amber-400 fill-amber-400" /></div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Rating</div>
                                    </div>
                                    <div className="text-center border-l border-white/5 pl-8">
                                        <div className="text-2xl font-black text-white">{lawyer.casesWon || 24}</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Wins</div>
                                    </div>
                                </div>

                                {/* ACTION BUTTONS */}
                                <div className="space-y-3">
                                    {connection?.status === 'active' ? (
                                        <button onClick={() => navigate(`/messages?chatId=${id}`)} className="w-full py-4 bg-white text-midnight-900 rounded-xl font-bold shadow-lg hover:bg-slate-200 transition flex items-center justify-center gap-2">
                                            <MessageCircle size={20} /> Secure Message
                                        </button>
                                    ) : connection?.status === 'pending' ? (
                                        <button disabled className="w-full py-4 bg-white/5 border border-white/10 text-slate-400 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2">
                                            <Clock size={20} /> Request Sent
                                        </button>
                                    ) : (
                                        <button onClick={handleConnect} disabled={connecting} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-[1.02] transition flex items-center justify-center gap-2">
                                            {connecting ? "Transmitting..." : <><UserPlus size={20} /> Connect Now</>}
                                        </button>
                                    )}

                                    {user?.role !== 'lawyer' && (
                                        <button onClick={() => toast("Calendar Module Syncing...")} className="w-full py-4 bg-transparent border border-white/20 text-white rounded-xl font-bold hover:bg-white/5 transition">
                                            Book Consultation
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT: DETAILS GRID */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* ABOUT CARD */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white/10 shadow-xl"
                        >
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg border border-indigo-500/30"><UserPlus size={20} /></span>
                                Professional Bio
                            </h3>
                            <p className="text-slate-300 leading-loose text-lg font-light">
                                {lawyer.bio || "This advocate is a dedicated legal professional with a strong track record of success in various courts. They specialize in providing strategic legal counsel and representation."}
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* EXPERTISE */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/5 backdrop-blur-sm p-8 rounded-[2rem] border border-white/10 shadow-lg"
                            >
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-lg border border-purple-500/30"><Briefcase size={20} /></span>
                                    Core Competencies
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {(lawyer.specialization?.split(',') || ["Corporate Law", "Civil Rights", "Family Law"]).map((s, i) => (
                                        <span key={i} className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl font-bold text-purple-200 text-xs hover:border-purple-500/50 transition cursor-default">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>

                            {/* COURTS */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white/5 backdrop-blur-sm p-8 rounded-[2rem] border border-white/10 shadow-lg"
                            >
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg border border-amber-500/30"><Gavel size={20} /></span>
                                    Admitted Courts
                                </h3>
                                <ul className="space-y-4">
                                    {(lawyer.courts || ["Supreme Court of India", "Delhi High Court"]).map((c, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                                            <span className="w-2 h-2 rounded-full bg-amber-500 box-shadow-glow"></span>
                                            {c}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>

                        {/* FEES & CONTACT */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-tr from-indigo-900 to-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl flex flex-col md:flex-row justify-between items-center border border-white/10 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold font-serif mb-2">Legal Retainer</h3>
                                <p className="text-indigo-200 text-sm font-medium">Standard Consultation Fee</p>
                            </div>
                            <div className="mt-6 md:mt-0 text-center md:text-right relative z-10">
                                <div className="text-5xl font-black text-white mb-2">₹{lawyer.consultationFee || 2000}</div>
                                <div className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Per Hour</div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* SOCIALS */}
                            <a href={`mailto:${lawyer.email}`} className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition flex flex-col items-center justify-center gap-3 group cursor-pointer hover:border-indigo-500/30">
                                <div className="w-10 h-10 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center text-xl group-hover:scale-110 transition shadow-inner"><Mail size={18} /></div>
                                <span className="font-bold text-slate-300 text-xs">Email</span>
                            </a>
                            <a href={lawyer.socials?.linkedin || "#"} className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition flex flex-col items-center justify-center gap-3 group cursor-pointer hover:border-indigo-500/30">
                                <div className="w-10 h-10 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center text-xl group-hover:scale-110 transition shadow-inner"><Linkedin size={18} /></div>
                                <span className="font-bold text-slate-300 text-xs">LinkedIn</span>
                            </a>
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-3 text-center hover:border-indigo-500/30 transition">
                                <div className="w-10 h-10 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-xl shadow-inner"><Globe size={18} /></div>
                                <span className="font-bold text-slate-300 text-xs">{lawyer.languages?.[0] || 'English'}</span>
                            </div>
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-3 text-center hover:border-indigo-500/30 transition">
                                <div className="w-10 h-10 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-xl shadow-inner"><MapPin size={18} /></div>
                                <span className="font-bold text-slate-300 text-xs truncate w-full">
                                    {typeof lawyer.location === 'object' ? lawyer.location.city || lawyer.location.address : lawyer.location}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}
