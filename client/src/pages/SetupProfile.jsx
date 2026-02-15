import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

export default function SetupProfile() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        bio: user?.bio || "",
        headline: user?.headline || "",
        languages: user?.languages?.join(", ") || "",
        experience: user?.experience || "",
        specialization: user?.specialization || "",
        courts: user?.courts?.join(", ") || "",
        city: user?.location?.city || "",
        phone: user?.phone || ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Parse arrays
            const languagesArray = formData.languages.split(",").map(s => s.trim()).filter(Boolean);
            const courtsArray = formData.courts.split(",").map(s => s.trim()).filter(Boolean);

            const payload = {
                ...formData,
                languages: languagesArray,
                courts: courtsArray,
                location: { city: formData.city }, // Simple object for now
                isProfileComplete: true
            };

            const res = await axios.put(`/api/users/${user._id || user.id}`, payload);

            if (res.data) {
                updateUser(res.data);
                toast.success("Profile Setup Complete!");
                navigate(user.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-xl w-full space-y-8 bg-[#0f172a]/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/10 relative z-10">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-white">Complete Your Profile</h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Tell us a bit more about yourself to get the best experience.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md -space-y-px">

                        {/* COMMON FIELDS */}
                        <div className="grid gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Headline / Job Title</label>
                                <input
                                    name="headline"
                                    type="text"
                                    required
                                    value={formData.headline}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    placeholder="e.g. Senior Family Lawyer"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bio / About Me</label>
                                <textarea
                                    name="bio"
                                    required
                                    rows={3}
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    placeholder="Briefly describe your experience..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City</label>
                                <input
                                    name="city"
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    placeholder="e.g. Mumbai"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                                <input
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>

                        {/* LAWYER SPECIFIC */}
                        {user?.role === "lawyer" && (
                            <div className="mt-6 grid gap-6 border-t border-white/10 pt-6">
                                <h3 className="text-lg font-bold text-white">Legal Details</h3>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Years of Experience</label>
                                    <input
                                        name="experience"
                                        type="number"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Specialization</label>
                                    <input
                                        name="specialization"
                                        type="text"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        placeholder="Criminal, Civil, Corporate..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Courts Practicing In (Comma separated)</label>
                                    <input
                                        name="courts"
                                        type="text"
                                        value={formData.courts}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        placeholder="Supreme Court, Delhi High Court..."
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 mb-2">Languages Spoken (Comma separated)</label>
                            <input
                                name="languages"
                                type="text"
                                value={formData.languages}
                                onChange={handleChange}
                                className="block w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                placeholder="English, Hindi, Marathi..."
                            />
                        </div>

                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg shadow-indigo-500/30 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving..." : "Complete Profile"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
