import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import VerifiedBadge from "../components/VerifiedBadge";
import { motion } from "framer-motion";
import debounce from "lodash.debounce"; // Ensure clean implementation without extra lib if possible, but let's implement custom debounce to avoid dep dependency issues if not installed.

export default function Marketplace() {
  const { user } = useAuth();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  // Pagination States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLawyers, setTotalLawyers] = useState(0);

  // Debounce Search
  const debouncedSearch = useCallback(
    (val) => {
      setSearchParams(val ? { search: val } : {});
      setPage(1); // Reset to page 1 on new search
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setSearchParams]
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    const handler = setTimeout(() => debouncedSearch(e.target.value), 500);
    return () => clearTimeout(handler);
  };

  // Fetch Lawyers
  const fetchLawyers = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const params = new URLSearchParams({
        page: pageNum,
        limit: 10,
        search: searchQuery,
        city: selectedCity,
        category: selectedCategory
      });

      const res = await axios.get(`/api/lawyers?${params.toString()}`);

      if (append) {
        setLawyers(prev => [...prev, ...res.data.lawyers]);
      } else {
        setLawyers(res.data.lawyers);
      }

      setTotalPages(res.data.totalPages);
      setTotalLawyers(res.data.totalLawyers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    setPage(1);
    fetchLawyers(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedCity, debouncedSearch]);
  // Note: debouncedSearch dependency might trigger too often if not careful, 
  // but here we are triggering via custom debouncing in handleSearchChange which updates the URL/searchQuery.
  // Actually, let's just watch searchQuery changes if valid.

  // Better approach: Watch the *committed* search param or just call fetch directly on change.
  // Let's rely on the useEffect dependencies.

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLawyers(nextPage, true);
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-12 px-6 font-sans">
      <div className="max-w-[1280px] mx-auto grid lg:grid-cols-[280px_1fr] gap-8">

        {/* --- LEFT: FILTERS (Glass Panel) --- */}
        <aside className="h-fit sticky top-24 space-y-8">
          <div className="glass p-6 rounded-2xl border border-white/50 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 font-display">Filter Lawyers</h3>

              {/* Search Input (Mobile/Desktop) */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    // Debounce manually here or use useEffect. 
                    // For simplicity, let's just let the user hit enter or wait.
                    // The useEffect below will catch it if we add searchQuery to dep, 
                    // but we want debounce.

                    // Let's implement simple debounce:
                    if (window.searchTimeout) clearTimeout(window.searchTimeout);
                    window.searchTimeout = setTimeout(() => {
                      setPage(1);
                      fetchLawyers(1, false);
                    }, 600);
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-3 outline-none transition"
                />
              </div>

              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Practice Area</p>
              <select
                className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-3 outline-none transition"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Specializations</option>
                {["Criminal Law", "Family Law", "Corporate Law", "Civil Law", "Property Law", "Cyber Law"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location</p>
              <select
                className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-3 outline-none transition"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Pune", "Jaipur"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* PROMO CARD */}
          {user?.role === "lawyer" && user.plan === "silver" && (
            <div className="bg-gradient-to-br from-[#0B1120] to-slate-900 rounded-2xl p-6 text-white text-center shadow-xl shadow-slate-900/10">
              <h3 className="font-bold text-lg mb-2">Go Diamond 💎</h3>
              <p className="text-slate-400 text-sm mb-4">Get 10x more visibility and exclusive leads.</p>
              <a href="/pricing" className="block w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-sm transition">Upgrade Now</a>
            </div>
          )}
        </aside>

        {/* --- RIGHT: GRID --- */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 font-display">Top Legal Experts</h1>
              <p className="text-slate-500">{totalLawyers > 0 ? `Showing ${lawyers.length} of ${totalLawyers} verified advocates` : "Find the right lawyer for you"}</p>
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(n => <div key={n} className="h-64 bg-white/50 animate-pulse rounded-2xl border border-slate-200"></div>)}
            </div>
          ) : lawyers.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <span className="text-4xl">🔍</span>
              <p className="text-slate-500 mt-2 font-medium">No lawyers found matching your criteria.</p>
              <button onClick={() => { setSelectedCity(""); setSelectedCategory(""); setSearchQuery(""); setPage(1); fetchLawyers(1, false); }} className="mt-4 text-indigo-600 font-bold hover:underline">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                {lawyers.map((lawyer) => <LawyerCard key={lawyer._id} lawyer={lawyer} />)}
              </div>

              {/* PAGINATION / LOAD MORE */}
              {page < totalPages && (
                <div className="text-center pt-8">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 font-bold rounded-xl transition shadow-sm hover:shadow-md disabled:opacity-50 flex items-center gap-2 mx-auto"
                  >
                    {loadingMore ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-400 border-t-indigo-600 rounded-full animate-spin"></span>
                        Loading...
                      </>
                    ) : "Load More Lawyers"}
                  </button>
                  <p className="text-xs text-slate-400 mt-2">Showing {lawyers.length} of {totalLawyers}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function LawyerCard({ lawyer }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-6 rounded-2xl flex flex-col justify-between group hover:border-indigo-200 transition-all duration-300 relative overflow-hidden bg-white"
    >
      <div className="absolute top-0 right-0 p-4">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${lawyer.plan === "diamond" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
          lawyer.plan === "gold" ? "bg-amber-50 text-amber-600 border-amber-100" :
            "bg-slate-50 text-slate-500 border-slate-100"
          }`}>
          {lawyer.plan || "SILVER"}
        </span>
      </div>

      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-600 border border-slate-200 overflow-hidden">
          {/* Ideally replace with real avatar if available */}
          {lawyer.name?.[0]}
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1">
            {lawyer.name}
            <VerifiedBadge plan={lawyer.plan} />
          </h3>
          <p className="text-sm text-slate-500 font-medium">{lawyer.specialization || "General Practice"}</p>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400 font-medium">
            <span>📍 {lawyer.location?.city || "India"}</span>
            <span>•</span>
            <span>{lawyer.experience ? `${lawyer.experience} Years Exp.` : "New"}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate(`/lawyer/${lawyer._id}`)}
        className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-indigo-600 transition shadow-lg shadow-slate-900/10 active:scale-95"
      >
        View Profile
      </button>
    </motion.div>
  );
}
