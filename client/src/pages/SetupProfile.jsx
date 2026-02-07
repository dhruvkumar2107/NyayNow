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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Complete Your Profile</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Tell us a bit more about yourself to get the best experience.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">

                        {/* COMMON FIELDS */}
                        <div className="grid gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Headline / Job Title</label>
                                <input
                                    name="headline"
                                    type="text"
                                    required
                                    value={formData.headline}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="e.g. Senior Family Lawyer"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Bio / About Me</label>
                                <textarea
                                    name="bio"
                                    required
                                    rows={3}
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Briefly describe your experience..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <input
                                    name="city"
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="e.g. Mumbai"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>

                        {/* LAWYER SPECIFIC */}
                        {user?.role === "lawyer" && (
                            <div className="mt-6 grid gap-6 border-t border-gray-100 pt-6">
                                <h3 className="text-lg font-medium text-gray-900">Legal Details</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                                    <input
                                        name="experience"
                                        type="number"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Specialization</label>
                                    <input
                                        name="specialization"
                                        type="text"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Criminal, Civil, Corporate..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Courts Practicing In (Comma separated)</label>
                                    <input
                                        name="courts"
                                        type="text"
                                        value={formData.courts}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Supreme Court, Delhi High Court..."
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mt-4">Languages Spoken (Comma separated)</label>
                            <input
                                name="languages"
                                type="text"
                                value={formData.languages}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="English, Hindi, Marathi..."
                            />
                        </div>

                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/30"
                        >
                            {loading ? "Saving..." : "Complete Profile"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
