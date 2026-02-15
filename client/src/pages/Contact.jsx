import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Mail, MapPin, Clock, Send, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';


export default function Contact() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [sending, setSending] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSending(true);
        setTimeout(() => {
            toast.success("Message transmitted securely.");
            setFormData({ name: '', email: '', message: '' });
            setSending(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-indigo-500/30">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 grid lg:grid-cols-2 gap-16 items-center">

                {/* LEFT: INFO */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="text-amber-500 font-bold tracking-[0.2em] text-xs uppercase mb-4 block">Concierge Support</span>
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-8 leading-tight">
                        We are here to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Serve Justice.</span>
                    </h1>
                    <p className="text-lg text-slate-400 mb-12 max-w-lg leading-relaxed font-light">
                        Whether you need enterprise API access, have questions about our AI models, or require legal assistance, our team is ready to deploy.
                    </p>

                    <div className="space-y-8">
                        <ContactItem
                            icon={<Mail size={24} />}
                            title="Direct Line"
                            desc="nyaynow.in@gmail.com"
                            action="Email Us"
                        />
                        <ContactItem
                            icon={<MapPin size={24} />}
                            title="Headquarters"
                            desc="Cyber City, DLF Phase 2, Gurugram, India 122002"
                            action="View Map"
                        />
                        <ContactItem
                            icon={<Clock size={24} />}
                            title="Operating Hours"
                            desc="Mon - Fri: 09:00 - 18:00 IST"
                            action="Support Status: Online"
                        />
                    </div>
                </motion.div>

                {/* RIGHT: FORM */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur-2xl opacity-40 mix-blend-screen"></div>
                    <form onSubmit={handleSubmit} className="relative bg-[#0f172a] border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl backdrop-blur-xl">
                        <h3 className="text-2xl font-bold text-white mb-8 font-serif">Secure Inquiry Form</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Identify Yourself</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition placeholder:text-slate-600 font-medium"
                                    placeholder="Full Name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Communication Channel</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition placeholder:text-slate-600 font-medium"
                                    placeholder="name@company.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message Payload</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition placeholder:text-slate-600 resize-none font-medium"
                                    placeholder="How can we assist you?"
                                ></textarea>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {sending ? (
                                <>Processing <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div></>
                            ) : (
                                <>Transmit Message <Send size={18} /></>
                            )}
                        </button>
                    </form>
                </motion.div>

            </div>

        </div>
    );
}

function ContactItem({ icon, title, desc, action }) {
    return (
        <div className="flex gap-4 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition duration-300 shadow-md group-hover:shadow-lg">
                {icon}
            </div>
            <div>
                <h4 className="text-white font-bold text-lg mb-1 transition-colors">{title}</h4>
                <p className="text-slate-500 text-sm mb-2">{desc}</p>
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1 group-hover:text-indigo-300 transition">
                    {action} <ArrowRight size={12} className="group-hover:translate-x-1 transition" />
                </div>
            </div>
        </div>
    )
}
