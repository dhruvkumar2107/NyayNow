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

    const handleIDUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const toastId = toast.loading("Uploading ID Card...");
        try {
            const res = await axios.post("/api/uploads", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            const url = res.data.path;
            setIdCardUrl(url);
            toast.success("ID Card Uploaded!", { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error("Upload failed", { id: toastId });
        }
    };

    const verifyID = async () => {
        if (!idCardUrl) return toast.error("Please upload an ID card first");

        setVerificationStatus("scanning");
        try {
            const res = await axios.post("/api/lawyers/verify-id", {
                userId: user._id || user.id,
                imageUrl: idCardUrl
            });

            if (res.data.valid) {
                setVerificationStatus("verified");
                setVerificationReason(`Verified as ${res.data.name}`);
                toast.success("Verification Successful!");

                // Update local form data if name is extracted and empty
                if (res.data.name && !formData.headline) {
                    setFormData(prev => ({ ...prev, headline: `Advocate ${res.data.name}` }));
                }
            } else {
                setVerificationStatus("failed");
                setVerificationReason(res.data.reason || "Could not verify ID");
                toast.error("Verification Failed");
            }
        } catch (err) {
            console.error(err);
            setVerificationStatus("failed");
            setVerificationReason("Server Error during verification");
            toast.error("Verification Process Failed");
        }
    };

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
                                    Upload your Bar Council ID Card to get the <span className="text-indigo-400 font-bold">Verified Badge</span>.
                                    Our AI uses OCR to instantly verify your credentials.
                                </p>

                                <div className="space-y-4">
                                    {/* Upload Area */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative group w-full">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleIDUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                disabled={verificationStatus === "verified"}
                                            />
                                            <div className={`flex items-center justify-center gap-3 w-full px-4 py-3 bg-black/40 border border-dashed rounded-xl transition ${verificationStatus === 'verified' ? 'border-emerald-500/50 text-emerald-500 cursor-not-allowed' : 'border-slate-500 text-slate-400 group-hover:border-indigo-500 group-hover:text-indigo-400'}`}>
                                                <UploadCloud size={20} />
                                                <span className="text-sm font-medium truncate">
                                                    {idCardUrl ? "ID Card Uploaded (Click to change)" : "Upload ID Card"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button & Status */}
                                    <div className="flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={verifyID}
                                            disabled={!idCardUrl || verificationStatus === "scanning" || verificationStatus === "verified"}
                                            className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-600/20"
                                        >
                                            {verificationStatus === "scanning" ? (
                                                <span className="flex items-center gap-2"><Loader size={16} className="animate-spin" /> Scanning...</span>
                                            ) : verificationStatus === "verified" ? (
                                                <span className="flex items-center gap-2"><CheckCircle size={16} /> Verified</span>
                                            ) : (
                                                "Verify Now"
                                            )}
                                        </button>

                                        {/* Status Text */}
                                        {verificationStatus === "failed" && (
                                            <div className="flex items-center gap-2 text-red-400 text-xs font-bold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                                                <XCircle size={14} /> {verificationReason}
                                            </div>
                                        )}
                                        {verificationStatus === "verified" && (
                                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                                <CheckCircle size={14} /> {verificationReason || "ID Verified"}
                                            </div>
                                        )}
                                    </div>
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
