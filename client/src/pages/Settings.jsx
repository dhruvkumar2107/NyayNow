import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Bell, Lock, Shield, User, Smartphone, Globe, Moon, Monitor, CreditCard } from "lucide-react";

export default function Settings() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('account');

    // Mock States for Toggles
    const [notifications, setNotifications] = useState({ email: true, push: true, marketing: false });
    const [privacy, setPrivacy] = useState({ profileVisible: true, showStatus: true });

    const tabs = [
        { id: 'account', label: 'Account', icon: <User size={18} /> },
        { id: 'security', label: 'Security', icon: <Lock size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-midnight-900 font-sans text-slate-200 selection:bg-indigo-500/30 pb-20">
            <Navbar />

            <div className="max-w-6xl mx-auto pt-28 pb-12 px-6">
                <header className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2 font-serif">System Preferences</h1>
                    <p className="text-slate-400">Manage your account security and AI configurations.</p>
                </header>

                <div className="grid lg:grid-cols-12 gap-8 min-h-[600px]">

                    {/* LEFT SIDEBAR navigation */}
                    <div className="lg:col-span-3">
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 sticky top-28">
                            <div className="space-y-2">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        {tab.icon} {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="lg:col-span-9">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl space-y-8"
                        >
                            {activeTab === 'account' && (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-6 pb-8 border-b border-white/5">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-[2px]">
                                            <div className="w-full h-full rounded-full bg-[#0f172a] overflow-hidden">
                                                {user?.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}
                                            </div>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                                            <p className="text-slate-400">{user?.email}</p>
                                            <span className="inline-block mt-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold border border-indigo-500/30 uppercase tracking-widest">
                                                {user?.role} Plan
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Display Name</label>
                                            <input value={user?.name || ""} disabled className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                            <input value={user?.email || ""} disabled className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed" />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <h3 className="font-bold text-white mb-4">Interface Preferences</h3>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <button className="flex items-center justify-center gap-2 p-4 rounded-xl border border-indigo-500 bg-indigo-500/10 text-white font-bold transition">
                                                <Moon size={18} /> Dark
                                            </button>
                                            <button className="flex items-center justify-center gap-2 p-4 rounded-xl border border-white/10 bg-black/20 text-slate-400 hover:bg-white/5 transition">
                                                <Smartphone size={18} /> Light
                                            </button>
                                            <button className="flex items-center justify-center gap-2 p-4 rounded-xl border border-white/10 bg-black/20 text-slate-400 hover:bg-white/5 transition">
                                                <Monitor size={18} /> System
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <h3 className="font-bold text-white text-xl mb-4">Security & Privacy</h3>

                                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400"><Lock size={20} /></div>
                                            <div>
                                                <h4 className="font-bold text-white">Two-Factor Authentication</h4>
                                                <p className="text-xs text-slate-500">Secure your account with 2FA.</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg">Enable</button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400"><Shield size={20} /></div>
                                            <div>
                                                <h4 className="font-bold text-white">Active Sessions</h4>
                                                <p className="text-xs text-slate-500">Manage devices logged into your account.</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/20">Manage</button>
                                    </div>

                                    <div className="pt-6 border-t border-white/5">
                                        <h4 className="font-bold text-white mb-4">Privacy</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-300 text-sm">Make Profile Public</span>
                                                <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-300 text-sm">Show Online Status</span>
                                                <div className="w-12 h-6 bg-white/20 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <h3 className="font-bold text-white text-xl mb-4">Notification Settings</h3>
                                    {['Email Notifications', 'Push Notifications', 'Marketing Emails'].map((setting, i) => (
                                        <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                                            <span className="text-slate-300 font-medium">{setting}</span>
                                            <div className={`w-12 h-6 rounded-full relative cursor-pointer transition ${i === 2 ? 'bg-white/20' : 'bg-indigo-600'}`}>
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${i === 2 ? 'left-1' : 'right-1'}`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'billing' && (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500">
                                        <CreditCard size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">No Active Subscription</h3>
                                    <p className="text-slate-400 mb-8 max-w-sm mx-auto">Upgrade to the Pro Suite to unlock AI Legal Drafting and the full potential of NyayNow.</p>
                                    <button className="px-8 py-3 bg-gradient-to-r from-gold-500 to-amber-600 text-black font-bold rounded-xl hover:scale-105 transition shadow-lg shadow-gold-500/20">
                                        Upgrade Now
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
}
