'use client'

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Search, MapPin, ShieldCheck, Filter, X, HelpCircle, CheckCircle } from "lucide-react"
import Image from "next/image"
import VerifiedBadge from "../VerifiedBadge"
import FeaturedBadge from "../FeaturedBadge"

export default function MarketplaceClient({ initialLawyers }) {
    const rawLawyers = Array.isArray(initialLawyers) 
        ? initialLawyers 
        : (initialLawyers && Array.isArray(initialLawyers.lawyers) ? initialLawyers.lawyers : []);
    const [lawyers] = useState(rawLawyers)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("rating")

    // Filters State
    const [selectedSpecialization, setSelectedSpecialization] = useState([])
    const [selectedLocation, setSelectedLocation] = useState([])
    const [selectedExperience, setSelectedExperience] = useState([])
    const [selectedLanguage, setSelectedLanguage] = useState([])
    const [selectedBudget, setSelectedBudget] = useState([])
    
    // Verification criteria modal state
    const [showVerificationModal, setShowVerificationModal] = useState(false)
    // Mobile filter panel toggle
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

    // Derive Filters
    const specializations = useMemo(() => [...new Set(lawyers.map(l => l.specialization).filter(Boolean))], [lawyers])
    const locations = useMemo(() => [...new Set(lawyers.map(l => l.location?.city || l.city).filter(Boolean))], [lawyers])
    const experienceLevels = ["0-5 Years", "5-10 Years", "10+ Years"]
    
    const languagesList = useMemo(() => {
        const allLangs = lawyers.reduce((acc, l) => {
            if (l.languages && Array.isArray(l.languages)) {
                return [...acc, ...l.languages]
            }
            return acc
        }, [])
        const unique = [...new Set(allLangs)].filter(Boolean)
        return unique.length > 0 ? unique : ["English", "Hindi", "Tamil", "Bengali", "Telugu", "Marathi"]
    }, [lawyers])

    const budgetBands = ["Free Consultation", "Under ₹1,000/hr", "₹1,000 - ₹5,000/hr", "Above ₹5,000/hr"]

    // Filter and Sort Logic
    const sortedAndFilteredLawyers = useMemo(() => {
        const filtered = lawyers.filter(lawyer => {
            const matchesSearch =
                lawyer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lawyer.specialization?.toLowerCase().includes(searchQuery.toLowerCase())

            if (!matchesSearch) return false

            if (selectedSpecialization.length > 0 && !selectedSpecialization.includes(lawyer.specialization)) return false

            const city = lawyer.location?.city || lawyer.city
            if (selectedLocation.length > 0 && !selectedLocation.includes(city)) return false

            if (selectedExperience.length > 0) {
                const exp = lawyer.experience || 0
                const matchesExp = selectedExperience.some(range => {
                    if (range === "0-5 Years") return exp <= 5
                    if (range === "5-10 Years") return exp > 5 && exp <= 10
                    if (range === "10+ Years") return exp > 10
                    return false
                })
                if (!matchesExp) return false
            }

            if (selectedLanguage.length > 0) {
                const lawyerLangs = lawyer.languages || ["English"]
                const matchesLang = selectedLanguage.some(lang => lawyerLangs.includes(lang))
                if (!matchesLang) return false
            }

            if (selectedBudget.length > 0) {
                const rate = lawyer.consultationFee || lawyer.hourlyRate || 0
                const matchesBudget = selectedBudget.some(band => {
                    if (band === "Free Consultation") return rate === 0
                    if (band === "Under ₹1,000/hr") return rate > 0 && rate < 1000
                    if (band === "₹1,000 - ₹5,000/hr") return rate >= 1000 && rate <= 5000
                    if (band === "Above ₹5,000/hr") return rate > 5000
                    return false
                })
                if (!matchesBudget) return false
            }

            return true
        })

        // Apply Sorting
        return [...filtered].sort((a, b) => {
            if (sortBy === "experience") {
                return (b.experience || 0) - (a.experience || 0);
            }
            if (sortBy === "fee-low-high") {
                const feeA = a.consultationFee || a.hourlyRate || 0;
                const feeB = b.consultationFee || b.hourlyRate || 0;
                return feeA - feeB;
            }
            if (sortBy === "fee-high-low") {
                const feeA = a.consultationFee || a.hourlyRate || 0;
                const feeB = b.consultationFee || b.hourlyRate || 0;
                return feeB - feeA;
            }
            if (sortBy === "availability") {
                const availA = a.availability?.toLowerCase().includes("mon") ? 1 : 0;
                const availB = b.availability?.toLowerCase().includes("mon") ? 1 : 0;
                return availB - availA;
            }
            // Default "rating/credibility" sorting (Verified and Premium listing first)
            const scoreA = (a.verified ? 100 : 0) + (a.experience || 0) + (a.listingTier === "premium" ? 50 : 0);
            const scoreB = (b.verified ? 100 : 0) + (b.experience || 0) + (b.listingTier === "premium" ? 50 : 0);
            return scoreB - scoreA;
        });
    }, [lawyers, searchQuery, selectedSpecialization, selectedLocation, selectedExperience, selectedLanguage, selectedBudget, sortBy])

    const toggleFilter = (setFn, value) => {
        setFn(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value])
    }

    const hasAnyActiveFilters = 
        selectedSpecialization.length > 0 || 
        selectedLocation.length > 0 || 
        selectedExperience.length > 0 || 
        selectedLanguage.length > 0 || 
        selectedBudget.length > 0;

    return (
        <div className="container mx-auto px-6 -mt-10 relative z-20">
            {/* SEARCH BAR (Inlined for interactivity) */}
            <div className="max-w-3xl mx-auto relative group mb-20 -translate-y-1/2">
                <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative flex items-center bg-[#1e293b]/80 border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-md">
                    <Search className="text-slate-500 ml-4" aria-hidden="true" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search expertise..."
                        className="flex-1 p-4 bg-transparent outline-none text-white placeholder:text-slate-500 text-lg"
                    />
                    <button
                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20"
                        aria-label="Find Legal Experts"
                    >
                        Find Experts
                    </button>
                </div>
            </div>

            {/* MOBILE FILTER TOGGLE */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
                <span className="text-slate-400 text-sm font-bold">{sortedAndFilteredLawyers.length} lawyers found</span>
                <button
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm transition-all ${mobileFiltersOpen ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                >
                    <Filter size={16} aria-hidden="true" />
                    {mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
                    {hasAnyActiveFilters && <span className="w-2 h-2 bg-indigo-400 rounded-full ml-1" />}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* SIDEBAR FILTERS */}
                <div className={`col-span-1 lg:col-span-3 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-[#0f172a] rounded-2xl p-6 shadow-xl border border-white/10 sticky top-28 text-left backdrop-blur-md space-y-6">
                        <div className="flex items-center justify-between text-white font-bold pb-2 border-b border-white/5">
                            <div className="flex items-center gap-2"><Filter size={18} aria-hidden="true" /> Filters</div>
                            {hasAnyActiveFilters && (
                                <button 
                                    onClick={() => { 
                                        setSelectedSpecialization([]); 
                                        setSelectedLocation([]); 
                                        setSelectedExperience([]); 
                                        setSelectedLanguage([]); 
                                        setSelectedBudget([]); 
                                    }} 
                                    className="text-[10px] text-indigo-400 hover:text-white transition uppercase tracking-wider"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                        <div className="space-y-6">
                            <FilterSection title="Practice Area" options={specializations} selected={selectedSpecialization} toggle={(val) => toggleFilter(setSelectedSpecialization, val)} />
                            <FilterSection title="Location" options={locations} selected={selectedLocation} toggle={(val) => toggleFilter(setSelectedLocation, val)} />
                            <FilterSection title="Experience" options={experienceLevels} selected={selectedExperience} toggle={(val) => toggleFilter(setSelectedExperience, val)} />
                            <FilterSection title="Languages" options={languagesList} selected={selectedLanguage} toggle={(val) => toggleFilter(setSelectedLanguage, val)} />
                            <FilterSection title="Budget Band" options={budgetBands} selected={selectedBudget} toggle={(val) => toggleFilter(setSelectedBudget, val)} />
                        </div>

                        {/* VERIFICATION CRITERIA LINK */}
                        <div className="pt-4 border-t border-white/5">
                            <button
                                onClick={() => setShowVerificationModal(true)}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 rounded-xl text-xs font-bold transition-all"
                            >
                                <HelpCircle size={14} aria-hidden="true" /> What verification means
                            </button>
                        </div>
                    </div>
                </div>

                {/* LAWYER CARDS GRID */}
                <div className="col-span-1 lg:col-span-9">
                    {/* Sort Selector Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-white/5 text-left">
                        <span className="text-slate-400 text-sm font-bold">
                            {sortedAndFilteredLawyers.length} legal experts available
                        </span>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Sort By:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-slate-300 outline-none hover:bg-white/5 cursor-pointer transition"
                            >
                                <option value="rating">Rating & Credibility</option>
                                <option value="experience">Years of Experience</option>
                                <option value="fee-low-high">Fee: Low to High</option>
                                <option value="fee-high-low">Fee: High to Low</option>
                                <option value="availability">Availability First</option>
                            </select>
                        </div>
                    </div>

                    {sortedAndFilteredLawyers.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 italic bg-[#0f172a] rounded-2xl border border-white/10">
                            <p>No lawyers found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            <AnimatePresence mode="wait">
                                {sortedAndFilteredLawyers.map((lawyer, i) => (
                                    <motion.div key={lawyer._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                        <LawyerCard lawyer={lawyer} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* VERIFICATION EXPLAINER MODAL */}
            <AnimatePresence>
                {showVerificationModal && (
                    <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative"
                        >
                            <button 
                                onClick={() => setShowVerificationModal(false)}
                                className="absolute top-5 right-5 text-slate-500 hover:text-white transition"
                                aria-label="Close Verification Info Modal"
                            >
                                <X size={20} aria-hidden="true" />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <ShieldCheck className="text-indigo-400" size={28} aria-hidden="true" />
                                <h3 className="text-2xl font-bold text-white tracking-tight">NyayNow Advocate Verification</h3>
                            </div>

                            <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
                                <p>
                                    Every lawyer carrying the <strong className="text-indigo-400">Verified Badge</strong> on NyayNow has completed our rigorous compliance check to ensure authentic representation:
                                </p>

                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <CheckCircle size={16} aria-hidden="true" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">Bar Registration Checks</h4>
                                            <p className="text-xs text-slate-400 mt-1">Cross-referenced with the Bar Council of India (BCI) database and respective State Bar Councils to verify enrollment validity.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <CheckCircle size={16} aria-hidden="true" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">Identity & Credentials Auditing</h4>
                                            <p className="text-xs text-slate-400 mt-1">DigiLocker integration verifies Aadhaar, digital COP (Certificate of Practice) card credentials, and professional identity markers.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <CheckCircle size={16} aria-hidden="true" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">Annual Renewal Schedule</h4>
                                            <p className="text-xs text-slate-400 mt-1">Enrollment states and certifications are dynamically audited annually. Disciplinary cases result in immediate suspension.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setShowVerificationModal(false)}
                                className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/20 text-xs uppercase tracking-wider"
                            >
                                Understood
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

function FilterSection({ title, options, selected, toggle }) {
    if (options.length === 0) return null
    return (
        <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">{title}</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {options.map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="hidden" onChange={() => toggle(option)} checked={selected.includes(option)} />
                        <div className={`w-4 h-4 rounded border transition flex items-center justify-center ${selected.includes(option) ? 'bg-indigo-600 border-indigo-600' : 'bg-black/20 border-slate-600 group-hover:border-indigo-500'}`}>
                            {selected.includes(option) && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                        </div>
                        <span className={`text-sm transition ${selected.includes(option) ? 'text-white font-bold' : 'text-slate-400 group-hover:text-white'}`}>
                            {option}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    )
}

function LawyerCard({ lawyer }) {
    return (
        <motion.div whileHover={{ y: -5 }} className="bg-[#0f172a]/80 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
                <Link href={`/lawyer/${lawyer._id}`} className="flex gap-4 cursor-pointer">
                    <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 overflow-hidden relative">
                        {lawyer.profileImage ? (
                            <Image
                                src={lawyer.profileImage}
                                alt={`${lawyer.name}'s profile`}
                                fill
                                className="object-cover"
                            />
                        ) : lawyer.name?.[0]}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{lawyer.name}</h3>
                        <p className="text-xs font-semibold text-slate-500 mb-1 flex flex-wrap items-center gap-2">
                            <span>{lawyer.specialization || "Legal Consultant"}</span>
                            {lawyer.barCouncilId && (
                                <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">
                                    BCI: {lawyer.barCouncilId}
                                </span>
                            )}
                        </p>
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                            <MapPin size={12} aria-hidden="true" /> {lawyer.location?.city || lawyer.city || "Online"}
                        </div>
                    </div>
                </Link>
                <div className="flex flex-col items-end gap-1.5">
                    <VerifiedBadge plan={lawyer.plan} verified={lawyer.verified} verificationStatus={lawyer.verificationStatus} />
                    <FeaturedBadge tier={lawyer.listingTier} />
                </div>
            </div>
            <div className="flex items-center gap-6 mb-6 p-4 bg-black/20 rounded-xl border border-white/5 text-xs">
                <div>
                    <p className="uppercase font-bold text-slate-500 mb-1">Practice Started</p>
                    <p className="font-bold text-white">{new Date().getFullYear() - (lawyer.experience || 1)}</p>
                </div>
                <div>
                    <p className="uppercase font-bold text-slate-500 mb-1">Fee</p>
                    <p className="font-bold text-white">₹{lawyer.consultationFee || lawyer.hourlyRate || 500}/hr</p>
                </div>
                {lawyer.languages && lawyer.languages.length > 0 && (
                    <div>
                        <p className="uppercase font-bold text-slate-500 mb-1">Languages</p>
                        <p className="font-bold text-white truncate max-w-[120px]">{lawyer.languages.slice(0, 2).join(", ")}</p>
                    </div>
                )}
            </div>
            <div className="flex gap-3 text-sm font-bold">
                <Link href={`/lawyer/${lawyer._id}`} className="flex-1 py-3 text-center rounded-lg bg-white/5 text-white hover:bg-indigo-600 transition border border-white/10">
                    View Profile
                </Link>
            </div>
        </motion.div>
    )
}
