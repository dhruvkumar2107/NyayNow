import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Star, ShieldCheck, Filter } from "lucide-react";
import Navbar from "../components/Navbar";

const Marketplace = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      const res = await axios.get("/api/users?role=lawyer");
      // Mock data enhancement for UI demo
      const enhancedData = res.data.map(l => ({
        ...l,
        rating: (4 + Math.random()).toFixed(1),
        reviews: Math.floor(Math.random() * 50) + 10,
        hourlyRate: Math.floor(Math.random() * 5000) + 2000
      }));
      setLawyers(enhancedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-400 pb-20 selection:bg-indigo-500/30">
      <Navbar />

      {/* HEADER */}
      <div className="bg-[#0f172a] text-white pt-32 pb-24 relative overflow-hidden text-center border-b border-white/5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 w-full h-full bg-gradient-to-b from-[#020617] to-transparent opacity-80 pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-5xl font-bold mb-6 leading-tight">The Elite Legal Network</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Connect with India's top 1% of legal minds. Verified, vetted, and ready to represent you.
          </p>

          {/* SEARCH BAR */}
          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative flex items-center bg-[#1e293b]/80 border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-md">
              <Search className="text-slate-500 ml-4" />
              <input
                type="text"
                placeholder="Search by expertise (e.g. 'Divorce', 'Corporate', 'Criminal')"
                className="flex-1 p-4 bg-transparent outline-none text-white placeholder:text-slate-500 text-lg"
                onChange={(e) => setFilter(e.target.value)}
              />
              <button className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20">
                Find Experts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & CONTENT */}
      <div className="container mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-12 gap-8">

          {/* FILTERS SIDEBAR */}
          <div className="col-span-3 hidden lg:block">
            <div className="bg-[#0f172a] rounded-2xl p-6 shadow-xl border border-white/10 sticky top-28 text-left backdrop-blur-md">
              <div className="flex items-center gap-2 mb-6 text-white font-bold">
                <Filter size={18} /> Filters
              </div>

              <div className="space-y-6">
                <FilterGroup title="Practice Area" options={['Corporate Law', 'Criminal Defense', 'Family Law', 'Intellectual Property']} />
                <FilterGroup title="Location" options={['Delhi NCR', 'Mumbai', 'Bangalore', 'Remote']} />
                <FilterGroup title="Experience" options={['10+ Years', '5-10 Years', 'High Court', 'Supreme Court']} />
              </div>
            </div>
          </div>

          {/* LAWYER GRID */}
          <div className="col-span-12 lg:col-span-9">
            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse"></div>)}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {lawyers.filter(l => l.specialization?.toLowerCase().includes(filter.toLowerCase())).map((lawyer) => (
                  <LawyerCard key={lawyer._id} lawyer={lawyer} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

const LawyerCard = ({ lawyer }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-[#0f172a]/80 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 group"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
          {lawyer.name[0]}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{lawyer.name}</h3>
          <p className="text-sm font-medium text-slate-500 mb-1">{lawyer.specialization || "Legal Consultant"}</p>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
            <MapPin size={12} /> {typeof lawyer.location === 'object' ? lawyer.location.city : lawyer.location}
          </div>
        </div>
      </div>
      {lawyer.verified && (
        <div className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
          <ShieldCheck size={12} /> Verified
        </div>
      )}
    </div>

    <div className="flex items-center gap-6 mb-6 p-4 bg-black/20 rounded-xl border border-white/5">
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Experience</p>
        <p className="text-sm font-bold text-white">12 Years</p>
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Rating</p>
        <div className="flex items-center gap-1 text-sm font-bold text-white">
          <Star size={12} className="text-amber-400 fill-amber-400" /> {lawyer.rating} <span className="text-slate-500 font-normal">({lawyer.reviews})</span>
        </div>
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Consultation</p>
        <p className="text-sm font-bold text-white">₹{lawyer.hourlyRate}/hr</p>
      </div>
    </div>

    <div className="flex gap-3 text-sm font-bold">
      <Link to={`/lawyer/${lawyer._id}`} className="flex-1 py-3 text-center rounded-lg bg-white/5 text-white hover:bg-indigo-600 transition shadow-lg border border-white/10 hover:border-indigo-500/50">
        View Profile
      </Link>
      <button className="px-4 py-3 rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white transition">
        Message
      </button>
    </div>
  </motion.div>
);

const FilterGroup = ({ title, options }) => (
  <div>
    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">{title}</h4>
    <div className="space-y-2">
      {options.map((opt, i) => (
        <label key={i} className="flex items-center gap-3 cursor-pointer group">
          <div className="w-4 h-4 rounded border border-slate-600 group-hover:border-indigo-500 transition bg-black/20"></div>
          <span className="text-sm text-slate-400 group-hover:text-white transition">{opt}</span>
        </label>
      ))}
    </div>
  </div>
)

export default Marketplace;
