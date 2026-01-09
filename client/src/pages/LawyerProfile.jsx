import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function LawyerProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [lawyer, setLawyer] = useState(null);
    const [connection, setConnection] = useState(null); // { status: 'active' | 'pending', _id: ... }
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        // 🔒 ACCESS CONTROL: Only logged-in users can view profiles
        if (!user && !loading) {
            toast.error("Please login to view lawyer profiles");
            navigate("/login");
            return;
        }

        const fetchData = async () => {
            try {
                // ... (existing fetch logic)
                const profileRes = await axios.get(`/api/users/public/${id}`);
                setLawyer(profileRes.data);

                if (user) {
                    const connRes = await axios.get(`/api/connections?userId=${user._id || user.id}&status=all`);
                    const myConnection = connRes.data.find(c => c._id === id);
                    if (myConnection) {
                        setConnection({
                            status: myConnection.connectionStatus,
                            _id: myConnection.connectionId
                        });
                    }
                }
            } catch (err) {
                // ... (existing error handling)
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchData(); // Only fetch if user exists
    }, [id, user, navigate, loading]);

    // ... (rest of component)

    {/* DYNAMIC CONNECT BUTTON */ }
    {
        connection?.status === 'active' ? (
            <button
                onClick={handleMessage}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition flex items-center justify-center gap-2"
            >
                <span>💬</span> Message
            </button>
        ) : connection?.status === 'pending' ? (
            <button
                disabled
                className="px-6 py-2.5 bg-gray-100 text-gray-500 font-bold rounded-full cursor-not-allowed flex items-center justify-center gap-2 border border-gray-200"
            >
                <span>🕒</span> Request Sent
            </button>
        ) : (
        <button
            onClick={handleConnect}
            disabled={connecting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition flex items-center justify-center gap-2 disabled:opacity-70 shadow-md shadow-blue-200"
        >
            {connecting ? "Processing..." : (user?.role === 'lawyer' ? "➕ Connect" : "🤝 Consult")}
        </button>
    )
    }

    {/* CONSULTATION BOOKING (Only for Clients) */ }
    {
        user?.role !== 'lawyer' && (
            <button
                onClick={() => toast("Booking feature coming next!")}
                className="px-6 py-2.5 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold rounded-full transition"
            >
                Book Appointment
            </button>
        )
    }
                    </div >
                </div >

        {/* GRID CONTENT */ }
        < div className = "grid grid-cols-1 md:grid-cols-3 gap-6 mt-6" >

            {/* LEFT SIDEBAR (Skills, Languages) */ }
            < div className = "space-y-6" >
                {/* LANGUAGE CARD */ }
                < div className = "bg-white rounded-xl shadow-sm border border-gray-200 p-5" >
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Languages</h3>
                            <div className="flex flex-wrap gap-2">
                                {lawyer.languages?.length > 0 ? lawyer.languages.map((l, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">{l}</span>
                                )) : <span className="text-gray-400">English</span>}
                            </div>
                        </div >

        {/* CONTACT CARD */ }
        < div className = "bg-white rounded-xl shadow-sm border border-gray-200 p-5" >
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Info</h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-3 text-gray-600">
                                    <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">📧</span>
                                    {lawyer.email}
                                </li>
                                {lawyer.socials?.website && (
                                    <li className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">🌐</span>
                                        <a href={lawyer.socials.website} target="_blank" className="text-blue-600 hover:underline truncate">{lawyer.socials.website}</a>
                                    </li>
                                )}
                                {lawyer.socials?.linkedin && (
                                    <li className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">🔗</span>
                                        <a href={lawyer.socials.linkedin} target="_blank" className="text-blue-600 hover:underline truncate">LinkedIn</a>
                                    </li>
                                )}
                            </ul>
                        </div >
                    </div >

        {/* MAIN CONTENT (About, Experience) */ }
        < div className = "md:col-span-2 space-y-6" >

            {/* ABOUT */ }
            < div className = "bg-white rounded-xl shadow-sm border border-gray-200 p-6" >
                            <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {lawyer.bio || "This user has not added a bio yet."}
                            </p>
                        </div >

        {/* EXPERIENCE CARD */ }
        < div className = "bg-white rounded-xl shadow-sm border border-gray-200 p-6" >
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Experience & Courts</h2>

                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Courts Practicing In</h4>
                                <div className="flex flex-wrap gap-2">
                                    {lawyer.courts?.length > 0 ? lawyer.courts.map((court, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-lg">
                                            <span>🏛️</span>
                                            <span className="font-medium text-gray-700">{court}</span>
                                        </div>
                                    )) : <p className="text-gray-400">Not specified</p>}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Highlights</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                                        <span className="text-gray-700"><span className="font-bold">{lawyer.experience || 0} Years</span> of legal practice experience.</span>
                                    </li>
                                    {lawyer.awards?.map((award, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0"></div>
                                            <span className="text-gray-700">{award}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div >

        {/* FEES CARD */ }
        < div className = "bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-between items-center" >
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Consultation Fee</h2>
                                <p className="text-gray-500 text-sm">Standard hourly rate</p>
                            </div>
                            <div className="text-2xl font-bold text-green-700">
                                ₹{lawyer.consultationFee || 500}<span className="text-sm text-gray-500 font-normal">/hr</span>
                            </div>
                        </div >

                    </div >

                </div >
            </div >
        </main >
    );
}
