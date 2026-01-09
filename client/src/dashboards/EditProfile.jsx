import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function EditProfile() {
    const { user, loginWithToken } = useAuth();
    const [loading, setLoading] = useState(false);

    // Profile State
    const [formData, setFormData] = useState({
        bio: "",
        headline: "",
        specialization: "",
        experience: "",
        location: "",
        languages: "", // Stored as comma string for flexibility or handled as array
        courts: "",
        awards: "",
        linkedin: "",
        website: "",
        consultationFee: "",
        availability: "Mon-Fri, 9am - 6pm"
    });

    const [education, setEducation] = useState([]); // Array of { degree, college, year }

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
                education, // Send the education array
                languages: formData.languages.split(",").map(s => s.trim()).filter(Boolean),
                courts: formData.courts.split(",").map(s => s.trim()).filter(Boolean),
                awards: formData.awards.split(",").map(s => s.trim()).filter(Boolean),
                socials: {
                    linkedin: formData.linkedin,
                    website: formData.website
                },
                location: { city: formData.location },
                isProfileComplete: true
            };

            const res = await axios.put(`/api/users/${user.id || user._id}`, dataToSend);

            // Context Update Logic
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
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Your Profile</h1>
                    <p className="text-gray-500 mt-1">
                        Build a professional presence to attract high-value clients.
                    </p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition disabled:opacity-70 flex items-center gap-2"
                >
                    {loading ? <span className="animate-spin">🌀</span> : "💾"}
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN - PHOTO & BASICS (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* PHOTO CARD */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
                        <div className="w-40 h-40 mx-auto rounded-full bg-gray-100 mb-6 overflow-hidden border-4 border-white shadow-xl relative group">
                            {user?.profileImage ? (
                                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">📷</div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                <span className="text-white font-medium text-sm">Change Photo</span>
                            </div>
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileUpload}
                                accept="image/*"
                            />
                        </div>
                        <h3 className="font-bold text-gray-900">{user?.name}</h3>
                        <p className="text-xs text-gray-500">Supported: JPG, PNG (Max 5MB)</p>
                    </div>

                    {/* KEY METRICS */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Quick Details</h4>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Experience (Years)</label>
                            <input
                                type="number"
                                name="experience"
                                className="w-full mt-1 p-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                value={formData.experience}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Consultation Fee (₹/hr)</label>
                            <input
                                type="number"
                                name="consultationFee"
                                className="w-full mt-1 p-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                value={formData.consultationFee}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Location</label>
                            <input
                                name="location"
                                className="w-full mt-1 p-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - DETAILED FORM (8 cols) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* PROFESSIONAL INFO */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Professional Info</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                            <input
                                name="headline"
                                placeholder="e.g. Senior Criminal Defense Attorney | 15+ Years Experience"
                                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                value={formData.headline}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">About Me (Bio)</label>
                            <textarea
                                name="bio"
                                rows="4"
                                placeholder="Tell clients about your expertise, approach, and success stories..."
                                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                value={formData.bio}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                <input
                                    name="specialization"
                                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                                <input
                                    name="availability"
                                    placeholder="Mon-Fri, 9am - 6pm"
                                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                    value={formData.availability}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* EDUCATION SECTION (NEW) */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-bold text-gray-900">Education</h3>
                            <button type="button" onClick={addEducation} className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition">+ Add</button>
                        </div>

                        {education.length === 0 && <p className="text-gray-400 italic text-sm">Add your educational qualifications to build trust.</p>}

                        {education.map((edu, idx) => (
                            <div key={idx} className="grid md:grid-cols-12 gap-4 items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="md:col-span-4">
                                    <input
                                        placeholder="Degree (e.g. LLB)"
                                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm"
                                        value={edu.degree}
                                        onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-5">
                                    <input
                                        placeholder="College / University"
                                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm"
                                        value={edu.college}
                                        onChange={(e) => updateEducation(idx, 'college', e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <input
                                        placeholder="Year"
                                        type="number"
                                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm"
                                        value={edu.year}
                                        onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-1 flex justify-center mt-1">
                                    <button type="button" onClick={() => removeEducation(idx)} className="text-red-500 hover:text-red-700 text-xl font-bold">×</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* SKILLS & LINKS */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Skills & Links</h3>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                                <input
                                    name="languages"
                                    placeholder="English, Hindi..."
                                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                    value={formData.languages}
                                    onChange={handleChange}
                                />
                                <p className="text-xs text-gray-400 mt-1">Comma separated</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Courts</label>
                                <input
                                    name="courts"
                                    placeholder="Supreme Court..."
                                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                    value={formData.courts}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Awards</label>
                            <input
                                name="awards"
                                placeholder="Best Lawyer 2023..."
                                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                value={formData.awards}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                                <input
                                    name="linkedin"
                                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                <input
                                    name="website"
                                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                    value={formData.website}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
