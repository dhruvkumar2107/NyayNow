import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import SubscriptionModal from '../components/SubscriptionModal';
import { Briefcase, ChevronRight, Award, CheckCircle, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';

const CareerHub = () => {
    const [activeTask, setActiveTask] = useState(null);
    const [submission, setSubmission] = useState('');
    const [grading, setGrading] = useState(null);
    const [loading, setLoading] = useState(false);

    const tasks = [
        {
            id: 1,
            title: "Criminal Defense Intern",
            firm: "Luthra & Luthra Offices",
            logo: "L",
            color: "bg-red-500",
            task: "Draft a Bail Application for a client accused of Section 379 IPC (Theft). Focus on the grounds of 'no previous convictions'.",
            difficulty: "Beginner",
            time: "2 Hours"
        },
        {
            id: 2,
            title: "Corporate Law Associate",
            firm: "Shardul Amarchand Mangaldas",
            logo: "S",
            color: "bg-blue-600",
            task: "Review this clause: 'The employee shall not work for any competitor for 5 years after leaving.' Is this valid under Section 27 of Contract Act?",
            difficulty: "Intermediate",
            time: "45 Mins"
        },
        {
            id: 3,
            title: "IPR Researcher",
            firm: "Anand and Anand",
            logo: "A",
            color: "bg-purple-600",
            task: "Summarize the 'Delhi High Court vs. Telegram' copyright infringement judgment in 100 words.",
            difficulty: "Advanced",
            time: "3 Hours"
        }
    ];

    /* ---------------- FREE TRIAL LOGIC ---------------- */
    const [showModal, setShowModal] = useState(false);

    const checkFreeTrial = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            const hasUsed = localStorage.getItem('careerUsed');
            if (hasUsed) {
                setShowModal(true);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!submission.trim()) return;

        if (!checkFreeTrial()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const { data } = await axios.post('https://nyaynow.in/api/ai/career-mentor', {
                taskType: activeTask.task,
                userSubmission: submission
            }, { headers });

            setGrading(data);
            toast.success("Task Graded!");

            if (!token) {
                localStorage.setItem('careerUsed', 'true');
            }

        } catch (err) {
            console.error(err);
            toast.error("Grading failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-400 font-sans pt-28 pb-20 px-6 selection:bg-indigo-500/30">
            <Navbar />
            <SubscriptionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                featureName="Career & Mentorship Hub"
            />

            <div className="max-w-7xl mx-auto h-[85vh] flex flex-col">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-white mb-2">Career Simulator</h1>
                        <p className="text-slate-400">Virtual experience programs with top-tier law firms.</p>
                    </div>
                    <div className="flex gap-6 text-sm font-bold text-slate-500">
                        <span className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> 12 Modules Completed</span>
                        <span className="flex items-center gap-2"><Award size={16} className="text-gold-500" /> Top 5% Rank</span>
                    </div>
                </header>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">

                    {/* LEFT: TASK LIST */}
                    <div className="lg:col-span-4 overflow-y-auto pr-2 custom-scrollbar">
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Available Internships</h2>
                        <div className="space-y-4">
                            {tasks.map(task => (
                                <motion.div
                                    key={task.id}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => { setActiveTask(task); setGrading(null); setSubmission(''); }}
                                    className={`group p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${activeTask?.id === task.id ? 'bg-indigo-600/20 border-indigo-500 shadow-xl shadow-indigo-500/10' : 'bg-[#0f172a] border-white/5 hover:border-white/10'}`}
                                >
                                    {activeTask?.id === task.id && <div className="absolute inset-0 bg-indigo-600/10 opacity-20"></div>}

                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg ${task.color}`}>
                                            {task.logo}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-bold text-base mb-1 ${activeTask?.id === task.id ? 'text-white' : 'text-slate-200'}`}>{task.title}</h3>
                                            <p className={`text-xs ${activeTask?.id === task.id ? 'text-indigo-200' : 'text-slate-400'}`}>{task.firm}</p>
                                        </div>
                                        <ChevronRight size={16} className={`transition ${activeTask?.id === task.id ? 'text-white translate-x-1' : 'text-slate-600 group-hover:text-slate-400'}`} />
                                    </div>
                                    <div className="mt-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-wide opacity-80 relative z-10 pl-16">
                                        <span className={`px-2 py-1 rounded ${activeTask?.id === task.id ? 'bg-black/20 text-white' : 'bg-white/10 text-slate-400'}`}>{task.difficulty}</span>
                                        <span className={`flex items-center gap-1 ${activeTask?.id === task.id ? 'text-indigo-200' : 'text-slate-500'}`}><Clock size={10} /> {task.time}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* MENTORSHIP CTA */}
                        <div className="mt-8 bg-gradient-to-br from-amber-600/20 to-amber-700/20 border border-amber-500/30 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg">
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold mb-2 text-amber-500">Unlock Mentorship</h3>
                                <p className="text-amber-200 text-xs mb-4">Get 1-on-1 guidance from Supreme Court advocates.</p>
                                <button className="w-full py-2.5 bg-amber-500 text-midnight-950 rounded-xl font-bold text-xs uppercase tracking-wider transition hover:bg-amber-400">Coming Soon</button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: WORKSPACE */}
                    <div className="lg:col-span-8 bg-[#0f172a]/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
                        {activeTask ? (
                            <div className="flex-1 flex flex-col h-full">
                                {/* Task Header */}
                                <div className="p-8 border-b border-white/5 bg-black/20">
                                    <h3 className="text-xl font-bold text-white mb-2 font-serif">Task Brief</h3>
                                    <p className="text-slate-400 leading-relaxed text-sm">{activeTask.task}</p>
                                </div>

                                {/* Workspace */}
                                <div className="flex-1 p-0 flex">
                                    <div className="flex-1 flex flex-col p-6">
                                        <textarea
                                            value={submission}
                                            onChange={(e) => setSubmission(e.target.value)}
                                            placeholder="Draft your legal response here..."
                                            className="flex-1 w-full bg-transparent border-none outline-none resize-none text-slate-300 placeholder-slate-600 font-mono text-sm leading-relaxed custom-scrollbar p-2"
                                        ></textarea>
                                        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                            <span className="text-xs text-slate-500 font-mono">{submission.split(' ').length} Words</span>
                                            <button
                                                onClick={handleSubmit}
                                                disabled={loading || grading}
                                                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20"
                                            >
                                                {loading ? "AI Grading..." : grading ? "Graded" : "Submit Scope"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Grading Side Panel */}
                                    <AnimatePresence>
                                        {grading && (
                                            <motion.div
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: 320, opacity: 1 }}
                                                className="w-80 bg-black/40 border-l border-white/10 p-6 overflow-y-auto backdrop-blur-md"
                                            >
                                                <div className="text-center mb-8">
                                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl font-black mx-auto mb-4 border-4 ${grading.grade === 'A' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500' : 'bg-amber-500/10 text-amber-500 border-amber-500'}`}>
                                                        {grading.grade}
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Performance Score</p>
                                                </div>

                                                <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Feedback</h4>
                                                <ul className="space-y-3 mb-8">
                                                    {grading.feedback?.map((f, i) => (
                                                        <li key={i} className="text-xs text-slate-400 bg-white/5 p-3 rounded-lg border border-white/5">
                                                            {f}
                                                        </li>
                                                    ))}
                                                </ul>

                                                <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Mastery Tip</h4>
                                                <p className="text-xs text-indigo-300 italic p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                                    "{grading.correction || "Keep practicing!"}"
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-30">
                                <Briefcase size={60} className="text-slate-400 mb-6" />
                                <h3 className="text-2xl font-bold text-slate-400">Select a module to begin</h3>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CareerHub;
