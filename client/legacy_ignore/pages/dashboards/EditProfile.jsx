'use client'
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../src/context/AuthContext";
import toast from "react-hot-toast";
import { User, Briefcase, MapPin, Globe, Award, Linkedin, Upload, Save, Eye } from "lucide-react";

export default function EditProfile() {
    const { user, loginWithToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    // Profile State
    const [formData, setFormData] = useState({
        bio: "",
        headline: "",
        specialization: "",
        experience: "",
        location: "",
        languages: "",
        courts: "",
        awards: "",
        linkedin: "",
        website: "",
        consultationFee: "",
        availability: "Mon-Fri, 9am - 6pm"
    });

    const [education, setEducation] = useState([]);

    useEffect(() => {
        if (user) {
            setFormData({
                bio: user.bio || "",
                headline: user.headline || "",
                specialization: user.specialization || "",
                experience: user.experience || "",
                location: typeof user.location === 'string' ? user.location : user.location?.city || "",
                languages: user.languages?.join(", ") || "",
                courts: user.courts?.join(", ") || "",
                awards: user.awards?.join(", ") || "",
                linkedin: user.socials?.linkedin || "",
                website: user.socials?.website || "",
                consultationFee: user.consultationFee || "",
                availability: user.availability || "Mon-Fri, 9am - 6pm"
            });
            setEducation(user.education || []);
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append("file", file);

        const toastId = toast.loading("Uploading photo...");
        try {
            const res = await axios.post("/api/uploads", uploadData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            await updateProfile({ profileImage: res.data.path });
            toast.success("Photo Uploaded!", { id: toastId });
        } catch (err) {
            toast.error("Upload Failed", { id: toastId });
        }
    };

    // Education Handlers
    const addEducation = () => setEducation([...education, { degree: "", college: "", year: "" }]);
    const removeEducation = (idx) => setEducation(education.filter((_, i) => i !== idx));
    const updateEducation = (idx, field, val) => {
        const newEdu = [...education];
        newEdu[idx][field] = val;
        setEducation(newEdu);
    };

    const updateProfile = async (updates) => {
        try {
            const dataToSend = updates || {
                ...formData,
                education,
                languages: formData.languages.split(",").map(s => s.trim()).filter(Boolean),
                courts: formData.courts.split(",").map(s => s.trim()).filter(Boolean),
                awards: formData.awards.split(",").map(s => s.trim()).filter(Boolean),
                socials: { linkedin: formData.linkedin, website: formData.website },
                location: { city: formData.location },
                isProfileComplete: true
            };

            const res = await axios.put(`/api/users/${user.id || user._id}`, dataToSend);
            const currentToken = localStorage.getItem("token");
            loginWithToken(res.data, currentToken);

            if (!updates) toast.success("Profile Updated Successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Update Failed");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await updateProfile();
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-midnight-900 font-sans text-slate-200 selection:bg-indigo-500/30">
            <div className="max-w-7xl mx-auto px-6 py-12">

                <header className="flex flex-col md:flex-row justify-between items-end mb-10 pb-6 border-b border-white/10">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 font-serif">Identity Management</h1>
                        <p className="text-slate-400">Curate your professional persona on the Elite Network.</p>
                    </div>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className="px-6 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 hover:text-white transition font-bold flex items-center gap-2"
                        >
                            <Eye size={18} /> {previewMode ? "Edit Mode" : "Live Preview"}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                        >
                            {loading ? <span className="animate-spin text-xl">🌀</span> : <Save size={18} />} Save Changes
                        </button>
                    </div>
                </header>

                <div className="grid lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN - FORM */}
                    <div className={`lg:col-span-8 space-y-8 ${previewMode ? 'hidden lg:block lg:opacity-50 pointer-events-none' : ''}`}>

                        {/* BASIC INFO */}
                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <User size={20} className="text-indigo-400" /> Basic Information
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Professional Headline</label>
                                    <input
                                        name="headline"
                                        value={formData.headline}
                                        onChange={handleChange}
                                        placeholder="e.g. Senior Advocate | Corporate Law Specialist"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location</label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Years of Experience</label>
                                    <input
                                        type="number"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bio / Summary</label>
                                    <textarea
                                        name="bio"
                                        rows="4"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition placeholder:text-slate-600 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* EXPERTISE & FEES */}
                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Briefcase size={20} className="text-emerald-400" /> Expertise & Fees
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Specialization Area</label>
                                    <input
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Consultation Fee (₹/hr)</label>
                                    <input
                                        type="number"
                                        name="consultationFee"
                                        value={formData.consultationFee}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Courts Practicing In</label>
                                    <input
                                        name="courts"
                                        value={formData.courts}
                                        onChange={handleChange}
                                        placeholder="Comma separated"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Languages Spoken</label>
                                    <input
                                        name="languages"
                                        value={formData.languages}
                                        onChange={handleChange}
                                        placeholder="Comma separated"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* EDUCATION */}
                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Award size={20} className="text-gold-400" /> Education
                                </h3>
                                <button type="button" onClick={addEducation} className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white transition">+ Add</button>
                            </div>

                            {education.map((edu, idx) => (
                                <div key={idx} className="grid md:grid-cols-12 gap-4 mb-4 items-start bg-black/20 p-4 rounded-xl border border-white/5">
                                    <div className="md:col-span-4">
                                        <input
                                            placeholder="Degree"
                                            value={edu.degree}
                                            onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                                            className="w-full bg-transparent border-b border-white/10 focus:border-indigo-500 outline-none text-white text-sm pb-1 placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div className="md:col-span-5">
                                        <input
                                            placeholder="University / College"
                                            value={edu.college}
                                            onChange={(e) => updateEducation(idx, 'college', e.target.value)}
                                            className="w-full bg-transparent border-b border-white/10 focus:border-indigo-500 outline-none text-white text-sm pb-1 placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <input
                                            placeholder="Year"
                                            value={edu.year}
                                            onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                                            className="w-full bg-transparent border-b border-white/10 focus:border-indigo-500 outline-none text-white text-sm pb-1 placeholder:text-slate-600"
                                        />
                                    </div>
                                    <button onClick={() => removeEducation(idx)} className="md:col-span-1 text-red-500 hover:text-red-400">×</button>
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* RIGHT COLUMN - PREVIEW CARD */}
                    <div className={`lg:col-span-4 lg:sticky lg:top-24 h-fit ${previewMode ? 'lg:col-span-12 lg:fixed lg:inset-0 lg:z-50 lg:flex lg:items-center lg:justify-center lg:bg-black/80 lg:backdrop-blur-xl' : ''}`}>
                        <div className={`bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden ${previewMode ? 'w-full max-w-md scale-110' : ''}`}>
                            {previewMode && <button onClick={() => setPreviewMode(false)} className="absolute top-4 right-4 text-white hover:text-red-400">Close Preview ✕</button>}

                            {/* Card Background Effects */}
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-80"></div>
                            <div className="absolute top-24 left-1/2 -translate-x-1/2 p-1 bg-midnight-900 rounded-full">
                                <div className="w-28 h-28 rounded-full bg-slate-800 border-4 border-midnight-900 overflow-hidden relative group">
                                    {user?.profileImage ? (
                                        <img src={user.profileImage} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl text-slate-600">👤</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                        <Upload size={24} className="text-white" />
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-20 text-center space-y-2">
                                <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                                <p className="text-indigo-400 text-sm font-medium">{formData.headline || "Legal Professional"}</p>
                                <div className="flex items-center justify-center gap-2 text-slate-400 text-xs mt-2">
                                    <MapPin size={12} /> {formData.location || "Location not set"}
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white mb-1">{formData.experience || "0"}+</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Years Exp</p>
                                </div>
                                <div className="text-center border-l border-white/5">
                                    <p className="text-2xl font-bold text-white mb-1">4.9</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Rating</p>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Professional Bio</h4>
                                <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">
                                    {formData.bio || "No bio added yet."}
                                </p>
                            </div>

                            <div className="mt-8 space-y-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Specialization</h4>
                                <div className="flex flex-wrap gap-2">
                                    {formData.specialization ? (
                                        formData.specialization.split(',').map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-xs font-bold border border-indigo-500/30">{tag.trim()}</span>
                                        ))
                                    ) : <span className="text-slate-500 text-xs italic">No specialization added</span>}
                                </div>
                            </div>

                            <button className="w-full mt-8 py-3 bg-white text-midnight-900 font-bold rounded-xl shadow-lg hover:bg-slate-200 transition">
                                Book Consultation (₹{formData.consultationFee || "0"}/hr)
                            </button>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
