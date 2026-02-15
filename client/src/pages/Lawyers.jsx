import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Shield, Filter, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const lawyers = [
  {
    id: 1,
    name: "Adv. Neha Kapoor",
    specialization: "Corporate & Startup Law",
    city: "Bengaluru",
    experience: "9 years",
    rating: 4.8,
    cases: 120,
    tags: ["M&A", "IPR", "Contracts"],
    image: null
  },
  {
    id: 2,
    name: "Adv. Aman Singh",
    specialization: "Criminal Defense",
    city: "Delhi High Court",
    experience: "12 years",
    rating: 4.9,
    cases: 350,
    tags: ["Bail", "White Collar", "Litigation"],
    image: null
  },
  {
    id: 3,
    name: "Adv. Sneha Joshi",
    specialization: "Family & Divorce Law",
    city: "Pune District Court",
    experience: "7 years",
    rating: 4.7,
    cases: 85,
    tags: ["Custody", "Alimony", "Mediation"],
    image: null
  },
  {
    id: 4,
    name: "Adv. Rajesh Kumar",
    specialization: "Property & Real Estate",
    city: "Mumbai",
    experience: "15 years",
    rating: 4.6,
    cases: 210,
    tags: ["RERA", "Land Disputes", "Tenancy"],
    image: null
  },
  {
    id: 5,
    name: "Adv. Priya Desai",
    specialization: "Cyber Law",
    city: "Hyderabad",
    experience: "5 years",
    rating: 4.9,
    cases: 40,
    tags: ["Data Privacy", "Fraud", "IT Act"],
    image: null
  },
  {
    id: 6,
    name: "Adv. Vikram Malhotra",
    specialization: "Constitutional Law",
    city: "Supreme Court",
    experience: "22 years",
    rating: 5.0,
    cases: 500,
    tags: ["PIL", "Writs", "Appeals"],
    image: null
  },
];

export default function Lawyers() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-gold-500/30">
      <Navbar />

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Abstract Backgrounds */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gold-400 text-xs font-bold uppercase tracking-[0.2em] mb-6 shadow-[0_0_15px_rgba(250,204,21,0.1)]">
            Verified Experts
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-serif font-bold text-white mb-8">
            The Legal <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-500">Marketplace.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-light">
            Connect with the top 1% of legal minds in India. Pre-vetted, highly rated, and ready to fight for you.
          </motion.p>

          {/* SEARCH BAR */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-3xl mx-auto relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative flex items-center bg-[#0f172a] border border-white/10 rounded-2xl p-2 shadow-2xl">
              <Search className="ml-4 text-slate-400" size={24} />
              <input
                type="text"
                placeholder="Search by practice area, city, or lawyer name..."
                className="w-full bg-transparent border-none outline-none text-white px-4 py-4 text-lg placeholder:text-slate-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 font-bold border-l border-white/5 transition">
                <Filter size={18} /> Filters
              </button>
              <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/20 ml-2">
                Find
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* LAWYER GRID */}
      <section className="pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white font-serif">Top Rated Advocates</h2>
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-400 cursor-pointer hover:bg-white/10 transition">Criminal</span>
            <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-400 cursor-pointer hover:bg-white/10 transition">Corporate</span>
            <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-400 cursor-pointer hover:bg-white/10 transition">Family</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lawyers.map((lawyer, i) => (
            <LawyerCard key={lawyer.id} lawyer={lawyer} index={i} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <button className="px-8 py-3 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold transition">Load More Profiles</button>
        </div>
      </section>
    </div>
  );
}

function LawyerCard({ lawyer, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-[#0f172a] border border-white/5 rounded-3xl p-6 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
    >
      <div className="absolute top-6 right-6 flex items-center gap-1 bg-gold-500/10 border border-gold-500/20 px-2 py-1 rounded-lg text-amber-400 text-xs font-bold">
        <Star size={12} className="fill-amber-400" /> {lawyer.rating}
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px]">
          <div className="w-full h-full rounded-2xl bg-[#0f172a] flex items-center justify-center text-xl font-bold text-white overflow-hidden">
            {lawyer.image ? <img src={lawyer.image} alt={lawyer.name} className="w-full h-full object-cover" /> : lawyer.name[0]}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition">{lawyer.name}</h3>
          <p className="text-sm text-slate-400">{lawyer.specialization}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <MapPin size={16} className="text-indigo-400" /> {lawyer.city}
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Award size={16} className="text-indigo-400" /> {lawyer.experience} Experience
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Shield size={16} className="text-indigo-400" /> {lawyer.cases}+ Cases Resolved
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {lawyer.tags.map(tag => (
          <span key={tag} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-wide group-hover:bg-white/10 transition">
            {tag}
          </span>
        ))}
      </div>

      <Link to={`/lawyer/${lawyer.id}`} className="block w-full py-3 bg-white text-midnight-900 font-bold text-center rounded-xl hover:bg-slate-200 transition shadow-lg active:scale-95 text-sm">
        View Full Profile
      </Link>
    </motion.div>
  );
}
