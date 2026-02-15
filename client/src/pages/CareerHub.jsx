import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import SubscriptionModal from '../components/SubscriptionModal';

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
            task: "Draft a Bail Application for a client accused of Section 379 IPC (Theft). Focus on the grounds of 'no previous convictions'.",
            difficulty: "Beginner"
        },
        {
            id: 2,
            title: "Corporate Law Associate",
            firm: "Shardul Amarchand Mangaldas",
            task: "Review this clause: 'The employee shall not work for any competitor for 5 years after leaving.' Is this valid under Section 27 of Contract Act?",
            difficulty: "Intermediate"
        },
        {
            id: 3,
            title: "IPR Researcher",
            firm: "Anand and Anand",
            task: "Summarize the 'Delhi High Court vs. Telegram' copyright infringement judgment in 100 words.",
            difficulty: "Advanced"
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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pt-24 pb-20 px-6">
            <SubscriptionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                featureName="Career & Mentorship Hub"
            />

            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 text-slate-900">
                        Career & Mentorship Hub
                    </h1>
                    <p className="text-xl text-slate-500">
                        Gain real-world experience with <span className="text-indigo-600 font-bold">AI-Simulated Internships</span>.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT: TASK LIST */}
                    <div className="space-y-6">
                        <h2 className="font-bold text-lg text-slate-400 uppercase tracking-wider">Available Internships</h2>
                        {tasks.map(task => (
                            <motion.div
                                key={task.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { setActiveTask(task); setGrading(null); setSubmission(''); }}
                                className={`p-6 rounded-2xl border cursor-pointer transition-all ${activeTask?.id === task.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{task.title}</h3>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded bg-white/20 ${activeTask?.id === task.id ? 'text-white' : 'text-slate-500 bg-slate-100'}`}>
                                        {task.difficulty}
                                    </span>
                                </div>
                                <p className={`text-sm ${activeTask?.id === task.id ? 'text-indigo-200' : 'text-slate-500'}`}>{task.firm}</p>
                            </motion.div>
                        ))}

                        {/* MENTORSHIP TEASER */}
                        <div className="mt-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-2">Find a Mentor</h3>
                                <p className="text-slate-400 text-sm mb-6">Connect with Senior Advocates from Supreme Court.</p>
                                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition">Coming Soon</button>
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE & RIGHT: WORKSPACE */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xl min-h-[600px] flex flex-col overflow-hidden relative">
                        {activeTask ? (
                            <div className="flex-1 flex flex-col">
                                {/* Task Header */}
                                <div className="p-8 border-b border-slate-100 bg-slate-50">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Task Brief</h3>
                                    <p className="text-slate-600 leading-relaxed">{activeTask.task}</p>
                                </div>

                                {/* Workspace */}
                                <div className="flex-1 p-8 bg-slate-50 flex gap-8">
                                    <div className="flex-1 flex flex-col">
                                        <textarea
                                            value={submission}
                                            onChange={(e) => setSubmission(e.target.value)}
                                            placeholder="Type your draft or answer here..."
                                            className="flex-1 w-full p-6 rounded-2xl border-0 focus:ring-0 bg-white shadow-sm resize-none text-slate-700 placeholder-slate-400 font-mono text-sm leading-relaxed"
                                        ></textarea>
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={handleSubmit}
                                                disabled={loading || grading}
                                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all"
                                            >
                                                {loading ? "Grading..." : grading ? "Graded" : "Submit Work"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Grading Side Panel (Conditional) */}
                                    <AnimatePresence>
                                        {grading && (
                                            <motion.div
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: 300, opacity: 1 }}
                                                className="w-[300px] bg-white border-l border-slate-200 p-6 overflow-y-auto"
                                            >
                                                <div className="text-center mb-6">
                                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl font-black mx-auto mb-2 ${grading.grade === 'A' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                        {grading.grade}
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-400">SCORE: {grading.score}/100</p>
                                                </div>

                                                <h4 className="font-bold text-sm text-slate-900 mb-2">Feedback</h4>
                                                <ul className="space-y-2 mb-6">
                                                    {grading.feedback?.map((f, i) => (
                                                        <li key={i} className="text-xs text-slate-600 bg-slate-100 p-2 rounded">
                                                            {f}
                                                        </li>
                                                    ))}
                                                </ul>

                                                <h4 className="font-bold text-sm text-slate-900 mb-2">Pro Tip</h4>
                                                <p className="text-xs text-slate-500 italic">
                                                    "{grading.correction || "Keep practicing!"}"
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <span className="text-6xl mb-4 grayscale opacity-50">💼</span>
                                <h3 className="text-2xl font-bold text-slate-300">Select an internship to start</h3>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CareerHub;
