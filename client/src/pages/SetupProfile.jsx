import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { Shield, UploadCloud, CheckCircle, XCircle, Loader } from "lucide-react";

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

    // Verification State
    const [verificationStatus, setVerificationStatus] = useState(user?.verified ? "verified" : "idle");
    const [verificationReason, setVerificationReason] = useState("");
    const [idCardUrl, setIdCardUrl] = useState(user?.idCardImage || "");





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
                isProfileComplete: true,
                // Include verification data in the profile update as well to persist it if user saves
                idCardImage: idCardUrl,
                verified: verificationStatus === "verified"
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

                        {/* VERIFICATION SECTION (LAWYER ONLY) */}
                        {user?.role === "lawyer" && (
                            <div className="mt-6 p-6 bg-indigo-500/10 border border-indigo-500/30 rounded-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <Shield size={100} className="text-indigo-500" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    <Shield className="text-indigo-400" size={20} /> Identity Verification
                                </h3>
                                <p className="text-xs text-slate-400 mb-6 max-w-sm">
                                    Verify your identity via <span className="text-indigo-400 font-bold">DigiLocker</span> (Govt. of India) to get the Verified Badge instantly.
                                </p>

                                <div className="space-y-4">
                                    {/* Action Button & Status */}
                                    <div className="space-y-4">
                                        {idCardUrl ? (
                                            <div className="relative w-full h-40 bg-black/40 rounded-lg overflow-hidden border border-white/10 group">
                                                <img src={idCardUrl} alt="ID Uploaded" className="w-full h-full object-cover" />
                                                {!formData.verified && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setIdCardUrl("")}
                                                        className="absolute top-2 right-2 bg-red-600/80 p-1.5 rounded-full text-white hover:bg-red-500 transition"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                )}
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                    <span className="text-white text-xs font-bold flex items-center gap-2">
                                                        <CheckCircle size={14} className="text-emerald-400" /> Document Uploaded
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative border-2 border-dashed border-slate-600 hover:border-indigo-500 rounded-xl p-8 transition-colors bg-black/20 text-center cursor-pointer group">
                                                <input
                                                    type="file"
                                                    accept="image/*,application/pdf"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (!file) return;

                                                        const toastId = toast.loading("Uploading Document...");
                                                        try {
                                                            const { uploadFile } = await import("../api");
                                                            const res = await uploadFile(file);
                                                            setIdCardUrl(res.path);
                                                            toast.success("Document Uploaded", { id: toastId });
                                                            // We keep verificationStatus as 'pending' implicitly since verified is false
                                                        } catch (err) {
                                                            console.error(err);
                                                            toast.error("Upload Failed", { id: toastId });
                                                        }
                                                    }}
                                                />
                                                <UploadCloud className="mx-auto text-slate-500 group-hover:text-indigo-400 mb-2 transition" size={32} />
                                                <p className="text-sm font-bold text-slate-300 group-hover:text-white transition">Upload Bar Council ID</p>
                                                <p className="text-xs text-slate-500 mt-1">Click or Drag & Drop</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Text */}
                                    {verificationStatus === "verified" && (
                                        <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 justify-center">
                                            <CheckCircle size={18} /> Verified Account
                                        </div>
                                    )}
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
