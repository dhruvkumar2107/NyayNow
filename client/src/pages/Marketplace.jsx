import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  const [selectedCategory, setSelectedCategory] = useState(""); // NEW
  const [selectedCity, setSelectedCity] = useState(""); // NEW

  const [searchParams] = useSearchParams();
  const query = searchParams.get("search") || "";

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

  // Filter based on search query AND dropdowns
  // Filter based on search query AND dropdowns
  const filteredLawyers = lawyers.filter(lawyer => {
    // 1. Safe Accessors
    const lawyerCity = !lawyer.location ? "" : (typeof lawyer.location === 'string' ? lawyer.location : lawyer.location.city || "");
    const lawyerSpec = lawyer.specialization || "";

    // 2. Normalization
    const lowerQ = query.toLowerCase();
    const cityMatchVal = lawyerCity.toLowerCase();
    const specMatchVal = lawyerSpec.toLowerCase();
    const selectedCityLower = selectedCity.toLowerCase();
    const selectedCategoryLower = selectedCategory.toLowerCase();

    // 3. Matching Logic
    const matchQuery = !query ||
      lawyer.name?.toLowerCase().includes(lowerQ) ||
      specMatchVal.includes(lowerQ) ||
      cityMatchVal.includes(lowerQ);

    const matchCategory = !selectedCategory || specMatchVal.includes(selectedCategoryLower);
    const matchCity = !selectedCity || cityMatchVal === selectedCityLower;

    return matchQuery && matchCategory && matchCity;
  });

  return (
    <main className="min-h-screen bg-white text-gray-900 px-6 py-6 font-sans">
      {/* HEADER */}
      <header className="mb-8 text-center md:text-left max-w-[1128px] mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">
          Lawyer Marketplace
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Find verified lawyers based on expertise and location
        </p>

        {/* FILTERS */}
        <div className="mt-6 flex flex-wrap gap-4">
          <select
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Specializations</option>
            <option value="Criminal Law">Criminal Law</option>
            <option value="Family Law">Family Law</option>
            <option value="Corporate Law">Corporate Law</option>
            <option value="Civil Law">Civil Law</option>
            <option value="Property Law">Property Law</option>
            <option value="Cyber Law">Cyber Law</option>
          </select>

          <select
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="">All Cities</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Chennai">Chennai</option>
            <option value="Kolkata">Kolkata</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Pune">Pune</option>
            <option value="Jaipur">Jaipur</option>
          </select>
        </div>
      </header>

      {/* LAWYER GRID */}
      <div className="max-w-[1128px] mx-auto">
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            Finding legal experts...
          </div>
        ) : filteredLawyers.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-lg">No lawyers found matching "{query}".</p>
            <p className="text-sm mt-2">Try different keywords.</p>
          </div>
        ) : (
          <section className="grid md:grid-cols-3 gap-6">
            {filteredLawyers.map((lawyer) => (
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

import VerifiedBadge from "../components/VerifiedBadge"; // NEW

/* ----------------------------------------
   LAWYER CARD COMPONENT
---------------------------------------- */
function LawyerCard({ lawyer }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-300 transition flex flex-col justify-between shadow-sm group">
      <div>
        {/* NAME + BADGE */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-50">
              {lawyer.name?.[0]}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                {lawyer.name}
              </h3>
              <VerifiedBadge plan={lawyer.plan} />
            </div>
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
      <button
        onClick={() => {
          // 🔒 PLAN ENFORCEMENT
          const currentUser = JSON.parse(localStorage.getItem("user"));
          const userPlan = currentUser?.plan?.toLowerCase() || "silver";
          const userRole = currentUser?.role;

          // If looking at a Diamond Lawyer
          if (lawyer.plan === "diamond") {
            // If I am a client and only Silver -> Block
            if (userRole === 'client' && userPlan === 'silver') {
              alert("UPGRADE REQUIRED 💎\n\nTop 1% Elite Partners (Diamond) are only accessible to Gold/Diamond clients.\n\nPlease upgrade your plan to connect.");
              return;
            }
            // Lawyers can view other lawyers freely for networking (or maybe restrict silver lawyers from seeing diamond lawyers? No, networking should be open)
          }

          navigate(`/lawyer/${lawyer._id}`);
        }}
        className="w-full py-3 rounded-xl bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-700 transition font-bold border border-gray-200 group-hover:border-blue-500/50"
      >
        View Profile
      </button>
    </div>
  );
}
