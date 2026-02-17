import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Star, ShieldCheck, Filter, X } from "lucide-react";
import Navbar from "../components/Navbar";
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, useHits, useSearchBox, useRefinementList, usePagination } from 'react-instantsearch';

// ALGOLIA CONFIG
// In a real app, these come from import.meta.env
// For now, we fall back to a demo key if missing, or user needs to add them.
const searchClient = algoliasearch(
  'B1G2Q1T9VZ', // Demo App ID (Replace with process.env.ALGOLIA_APP_ID)
  'a396861a18d81c2800d6f3d4439c742c' // Demo Search Key (Replace with process.env.ALGOLIA_SEARCH_KEY)
);

const Marketplace = () => {
  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-400 pb-20 selection:bg-indigo-500/30">
      <Navbar />

      <InstantSearch searchClient={searchClient} indexName="lawyers" future={{ preserveSharedStateOnUnmount: true }}>
        <MarketplaceContent />
      </InstantSearch>
    </div>
  );
};

const MarketplaceContent = () => {
  // Hooks
  const { query, refine: setQuery } = useSearchBox();

  return (
    <>
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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by expertise (e.g. 'Divorce', 'Corporate', 'Criminal')"
                className="flex-1 p-4 bg-transparent outline-none text-white placeholder:text-slate-500 text-lg"
              />
              <button className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20">
                Find Experts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-12 gap-8">
          {/* SIDEBAR FILTERS */}
          <div className="col-span-3 hidden lg:block">
            <div className="bg-[#0f172a] rounded-2xl p-6 shadow-xl border border-white/10 sticky top-28 text-left backdrop-blur-md">
              <div className="flex items-center gap-2 mb-6 text-white font-bold">
                <Filter size={18} /> Filters
              </div>
              <div className="space-y-6">
                <CustomRefinementList attribute="specialization" title="Practice Area" />
                <CustomRefinementList attribute="location" title="Location" />
                <CustomRefinementList attribute="experience" title="Experience" />
              </div>
            </div>
          </div>

          {/* HITS GRID */}
          <div className="col-span-12 lg:col-span-9">
            <CustomHits />
          </div>
        </div>
      </div>
    </>
  );
}

// --- ALGOLIA CUSTOM COMPONENTS ---

const CustomRefinementList = ({ attribute, title }) => {
  const { items, refine } = useRefinementList({ attribute });

  if (items.length === 0) return null;

  return (
    <div>
      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">{title}</h4>
      <div className="space-y-2">
        {items.map((item) => (
          <label key={item.label} className="flex items-center gap-3 cursor-pointer group" onClick={() => refine(item.value)}>
            <div className={`w-4 h-4 rounded border transition flex items-center justify-center ${item.isRefined ? 'bg-indigo-600 border-indigo-600' : 'bg-black/20 border-slate-600 group-hover:border-indigo-500'}`}>
              {item.isRefined && <div className="w-2 h-2 bg-white rounded-sm"></div>}
            </div>
            <span className={`text-sm transition ${item.isRefined ? 'text-white font-bold' : 'text-slate-400 group-hover:text-white'}`}>
              {item.label} <span className="text-xs text-slate-600 ml-1">({item.count})</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

const CustomHits = () => {
  const { hits } = useHits();

  if (hits.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500 italic bg-[#0f172a] rounded-2xl border border-white/10">
        <p>No lawyers found matching your criteria.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-indigo-400 hover:text-indigo-300 underline"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {hits.map((hit) => (
        <LawyerCard key={hit.objectID} lawyer={hit} />
      ))}
    </div>
  );
};

// Reusing the LawyerCard Design
const LawyerCard = ({ lawyer }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className="bg-[#0f172a]/80 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 group"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
          {lawyer.name ? lawyer.name[0] : "?"}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{lawyer.name}</h3>
          <p className="text-sm font-medium text-slate-500 mb-1">{lawyer.specialization || "Legal Consultant"}</p>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
            <MapPin size={12} /> {lawyer.location || "Online"}
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
        <p className="text-sm font-bold text-white">{lawyer.experience || 0} Years</p>
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Rating</p>
        <div className="flex items-center gap-1 text-sm font-bold text-white">
          <Star size={12} className="text-amber-400 fill-amber-400" /> {lawyer.rating ? lawyer.rating.toFixed(1) : "New"}
        </div>
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Consultation</p>
        <p className="text-sm font-bold text-white">₹{lawyer.hourlyRate || lawyer.consultationFee || 500}/hr</p>
      </div>
    </div>

    <div className="flex gap-3 text-sm font-bold">
      <Link to={`/lawyer/${lawyer.objectID}`} className="flex-1 py-3 text-center rounded-lg bg-white/5 text-white hover:bg-indigo-600 transition shadow-lg border border-white/10 hover:border-indigo-500/50">
        View Profile
      </Link>
      <button className="px-4 py-3 rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white transition">
        Message
      </button>
    </div>
  </motion.div>
);

export default Marketplace;
