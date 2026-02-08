import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

export default function Settings() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        location: user?.location || "",
        specialization: user?.specialization || "",
        experience: user?.experience || "",
        phone: user?.phone || "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await axios.put(`/api/users/${user.email}`, formData);
            toast.success("Profile Updated Successfully!");
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F2F7] font-sans">
            <Navbar />

            <div className="max-w-3xl mx-auto pt-28 pb-12 px-6">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center mb-10">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-[2px] shadow-2xl">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                {user?.profileImage ? (
                                    <img src={user.profileImage} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-slate-700">{user?.name ? user.name[0] : "U"}</span>
                                )}
                            </div>
                        </div>
                        <button className="absolute bottom-0 right-0 bg-slate-900 text-white p-2 rounded-full shadow-lg border-4 border-[#F2F2F7]">
                            📷
                        </button>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mt-4">{user?.name || "User"}</h1>
                    <p className="text-slate-500">{user?.email}</p>
                    <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        {user?.role || "GUEST"}
                    </span>
                </motion.div>

                <div className="space-y-6">
                    {/* Personal Information Group */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900 " >Personal Information</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                            <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
                            <Input label="Location / City" name="location" value={formData.location} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Professional Info (If Lawyer) */}
                    {user?.role === "lawyer" && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                                <h3 className="font-bold text-slate-900 " >Professional Profile</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <Input label="Specialization" name="specialization" value={formData.specialization} onChange={handleChange} />
                                <Input label="Experience (Years)" name="experience" value={formData.experience} onChange={handleChange} type="number" />
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full bg-[#007AFF] hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 text-lg transition disabled:opacity-50"
                    >
                        {loading ? "Saving Changes..." : "Save Changes"}
                    </motion.button>
                </div>

                <p className="text-center text-slate-400 text-sm mt-8">
                    NyayNow ID • Secure & Encrypted
                </p>
            </div>
        </div>
    );
}

const Input = ({ label, name, value, onChange, type = "text" }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium text-slate-900"
        />
    </div>
);
