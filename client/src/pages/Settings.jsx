import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { Bell, Lock, Shield, User, Smartphone, Globe, Moon, Monitor, CreditCard, Settings2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Settings() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('account');

    const [notifications, setNotifications] = useState(user?.settings?.notifications || { email: true, push: true, marketing: false });
    const [privacy, setPrivacy] = useState(user?.settings?.privacy || { profileVisible: true, showStatus: true });

    const tabs = [
        { id: 'account', label: 'My Account', icon: <User size={18} /> },
        { id: 'security', label: 'Security', icon: <Lock size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'billing', label: 'Billing & Plans', icon: <CreditCard size={18} /> },
        { id: 'privacy', label: 'Privacy', icon: <Shield size={18} /> }
    ];

    const updateSettings = async (section, data) => {
        try {
            const updatedSettings = {
                ...user.settings,
                [section]: data
            };

            // Update UI immediately (optimistic)
            if (section === 'notifications') setNotifications(data);
            if (section === 'privacy') setPrivacy(data);

            await axios.put(`/api/users/${user._id || user.id}`, { settings: updatedSettings });
            toast.success("Settings saved successfully");
        } catch (err) {
            console.error(err);
            toast.error("Failed to save settings");
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-indigo-500/30 pb-20 relative overflow-hidden">
            <Navbar />

            {/* Ambient Glow */}
            <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-40 left-1/4 w-[400px] h-[400px] bg-violet-500/6 rounded-full blur-[80px] pointer-events-none" />

            <div className="max-w-6xl mx-auto pt-28 pb-12 px-6 relative z-10">
                <header className="mb-12">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4"
                    >
                        <Settings2 size={11} /> Account Preferences
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                        className="text-4xl font-bold text-white mb-2 leading-tight"
                    >
                        Settings
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                        className="text-slate-500 text-sm"
                    >
                        Manage your account security, notifications, and AI configurations.
                    </motion.p>
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
                                            {['Dark', 'Light', 'System'].map((theme) => (
                                                <button
                                                    key={theme}
                                                    onClick={async () => {
                                                        await updateSettings('theme', theme);
                                                        toast.success(`Theme set to ${theme}`);
                                                    }}
                                                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition ${user?.settings?.theme === theme ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-white/10 bg-black/20 text-slate-400 hover:bg-white/5'}`}
                                                >
                                                    {theme === 'Dark' && <Moon size={18} />}
                                                    {theme === 'Light' && <Smartphone size={18} />}
                                                    {theme === 'System' && <Monitor size={18} />}
                                                    {theme}
                                                </button>
                                            ))}
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
                                        <button onClick={() => toast.success("2FA setup initiated sent to email.")} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500 transition">Enable</button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400"><Shield size={20} /></div>
                                            <div>
                                                <h4 className="font-bold text-white">Active Sessions</h4>
                                                <p className="text-xs text-slate-500">Manage devices logged into your account.</p>
                                            </div>
                                        </div>
                                        <button onClick={() => toast.success("All other sessions terminated.")} className="px-4 py-2 bg-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/20">Manage</button>
                                    </div>

                                    <div className="pt-6 border-t border-white/5">
                                        <h4 className="font-bold text-white mb-4">Privacy</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-300 text-sm">Make Profile Public</span>
                                                <div
                                                    onClick={() => updateSettings('privacy', { ...privacy, profileVisible: !privacy.profileVisible })}
                                                    className={`w-12 h-6 rounded-full relative cursor-pointer transition ${privacy.profileVisible ? 'bg-indigo-600' : 'bg-white/20'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${privacy.profileVisible ? 'right-1' : 'left-1'}`}></div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-300 text-sm">Show Online Status</span>
                                                <div
                                                    onClick={() => updateSettings('privacy', { ...privacy, showStatus: !privacy.showStatus })}
                                                    className={`w-12 h-6 rounded-full relative cursor-pointer transition ${privacy.showStatus ? 'bg-indigo-600' : 'bg-white/20'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${privacy.showStatus ? 'right-1' : 'left-1'}`}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <h3 className="font-bold text-white text-xl mb-4">Notification Settings</h3>
                                    {[
                                        { key: 'email', label: 'Email Notifications' },
                                        { key: 'push', label: 'Push Notifications' },
                                        { key: 'marketing', label: 'Marketing Emails' }
                                    ].map((setting) => (
                                        <div key={setting.key} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                                            <span className="text-slate-300 font-medium">{setting.label}</span>
                                            <div
                                                onClick={() => updateSettings('notifications', { ...notifications, [setting.key]: !notifications[setting.key] })}
                                                className={`w-12 h-6 rounded-full relative cursor-pointer transition ${notifications[setting.key] ? 'bg-indigo-600' : 'bg-white/20'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${notifications[setting.key] ? 'right-1' : 'left-1'}`}></div>
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
                                    <button className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:scale-105 transition shadow-lg shadow-amber-500/20">
                                        Upgrade Now
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
}
