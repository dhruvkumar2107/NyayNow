import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

/* ----------------------------------------
   SORT LAWYERS BY MEMBERSHIP
---------------------------------------- */
const planPriority = {
  diamond: 3,
  gold: 2,
  silver: 1,
};

export default function Marketplace() {
  const { user } = useAuth();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      const res = await axios.get("/api/lawyers");
      // Sort by plan priority
      const sorted = res.data.sort(
        (a, b) => (planPriority[b.plan] || 0) - (planPriority[a.plan] || 0)
      );
      setLawyers(sorted);
    } catch (err) {
      console.error("Error loading marketplace:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 px-6 py-10 pt-24">
      {/* HEADER */}
      <header className="mb-10 text-center md:text-left max-w-[1128px] mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">
          Lawyer Marketplace
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Find verified lawyers based on expertise and location
        </p>
      </header>

      {/* LAWYER GRID */}
      <div className="max-w-[1128px] mx-auto">
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            Finding legal experts...
          </div>
        ) : lawyers.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-lg">No lawyers found yet.</p>
            <p className="text-sm mt-2">Be the first to join as a lawyer!</p>
          </div>
        ) : (
          <section className="grid md:grid-cols-3 gap-6">
            {lawyers.map((lawyer) => (
              <LawyerCard key={lawyer._id} lawyer={lawyer} />
            ))}
          </section>
        )}

        {/* CTA FOR LAWYERS */}
        {user?.role === "lawyer" && user.plan === "silver" && (
          <section className="mt-14 bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-blue-800">
              Increase Your Visibility
            </h2>
            <p className="text-blue-600 mt-2 mb-6">
              Upgrade to Gold or Diamond to appear higher in search
              results and get more clients.
            </p>

            <a href="/pricing" className="inline-block px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md shadow-blue-200">
              Upgrade Membership
            </a>
          </section>
        )}
      </div>
    </main>
  );
}

/* ----------------------------------------
   LAWYER CARD COMPONENT
---------------------------------------- */
function LawyerCard({ lawyer }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-300 transition flex flex-col justify-between shadow-sm group">
      <div>
        {/* NAME + BADGE */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-50">
              {lawyer.name?.[0]}
            </div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
              {lawyer.name}
            </h3>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${lawyer.plan === "diamond"
              ? "bg-purple-100 text-purple-700 border border-purple-200"
              : lawyer.plan === "gold"
                ? "bg-amber-100 text-amber-700 border border-amber-200"
                : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
          >
            {lawyer.plan || "SILVER"}
          </span>
        </div>

        {/* DETAILS */}
        <div className="space-y-3 mb-6">
          <p className="text-gray-700 text-sm flex items-center gap-3">
            <span className="text-blue-500 bg-blue-50 p-1.5 rounded-lg">⚖️</span>
            <span className="font-medium">{lawyer.specialization || "General Practice"}</span>
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-3">
            <span className="text-blue-500 bg-blue-50 p-1.5 rounded-lg">⏳</span>
            <span>{lawyer.experience ? `${lawyer.experience} years experience` : "New to platform"}</span>
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-3">
            <span className="text-blue-500 bg-blue-50 p-1.5 rounded-lg">📍</span>
            <span>{lawyer.location?.city || "India"}</span>
          </p>
        </div>
      </div>

      {/* ACTION */}
      <button className="w-full py-3 rounded-xl bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-700 transition font-bold border border-gray-200 group-hover:border-blue-500/50">
        View Profile
      </button>
    </div>
  );
}
