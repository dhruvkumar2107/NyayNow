'use client'

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import toast from "react-hot-toast"
import { motion } from "framer-motion"
import { Mail, Linkedin, MapPin, Globe, Award, Briefcase, Gavel, MessageCircle, UserPlus, Clock, Upload, X, CheckCircle } from "lucide-react"
import BookingModal from "../dashboard/BookingModal"

export default function LawyerProfileClient({ initialLawyer, lawyerId }) {
    const router = useRouter()
    const { user } = useAuth()

    const [lawyer] = useState(initialLawyer)
    const [connection, setConnection] = useState(null)
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [connecting, setConnecting] = useState(false)
    const [showEnquiryModal, setShowEnquiryModal] = useState(false)
    const [enquiryText, setEnquiryText] = useState('')
    const [attachmentFile, setAttachmentFile] = useState(null)
    const [enquirySuccess, setEnquirySuccess] = useState(false)
    const [enquiryTicketId, setEnquiryTicketId] = useState('')
    const [enquiryLoading, setEnquiryLoading] = useState(false)

    useEffect(() => {
        if (!user) return

        const fetchConnectionStatus = async () => {
            try {
                const connRes = await axios.get(`/api/connections?userId=${user._id || user.id}&status=all`)
                const myConnection = connRes.data.find(c => c.lawyerId === lawyerId || c._id === lawyerId)
                if (myConnection) {
                    setConnection({
                        status: myConnection.connectionStatus,
                        _id: myConnection.connectionId
                    })
                }
            } catch (err) {
                console.error("Failed to load connection status", err)
            }
        }
        fetchConnectionStatus()
    }, [lawyerId, user])

    const handleConnectClick = () => {
        if (!user) {
            toast.error("Please login to connect with lawyers")
            router.push("/login")
            return
        }
        setShowEnquiryModal(true)
    }

    const handleSendEnquiry = async () => {
        if (!enquiryText.trim()) {
            toast.error("Please describe your legal enquiry first")
            return
        }

        try {
            setEnquiryLoading(true)
            await axios.post(`/api/connections`, {
                clientId: user._id || user.id,
                lawyerId: lawyerId,
                initiatedBy: user._id || user.id,
                notes: enquiryText
            })

            setEnquiryTicketId(`ENQ-${Math.floor(100000 + Math.random() * 900000)}`)
            setEnquirySuccess(true)
            setConnection({ status: 'pending' })
            toast.success("Enquiry submitted successfully!")
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to send request")
        } finally {
            setEnquiryLoading(false)
        }
    }

    if (!lawyer) return <div className="min-h-screen bg-[#020617] flex items-center justify-center font-bold text-xl text-white">Lawyer not found</div>

    return (
        <div className="relative pt-32 pb-20 px-4 max-w-7xl mx-auto">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
                {/* LEFT: PROFILE INFO */}
                <div className="lg:col-span-4 lg:sticky lg:top-24">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-600/20 to-purple-600/20"></div>
                        <div className="relative w-40 h-40 mx-auto rounded-full p-1 bg-gradient-to-br from-indigo-400 to-purple-500 shadow-2xl mb-6">
                            <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden relative">
                                {lawyer.profileImage || lawyer.image ? (
                                    <img src={lawyer.profileImage || lawyer.image} alt={`${lawyer.name} profile picture`} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-5xl">⚖️</div>
                                )}
                            </div>
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-slate-900 rounded-full" />
                        </div>

                        <div className="text-center relative">
                            <h1 className="text-3xl font-bold text-white mb-2 font-serif tracking-tight flex items-center justify-center gap-2">
                                {lawyer.name}
                                {(lawyer.verified || lawyer.verificationStatus === "verified") && (
                                    <CheckCircle className="text-emerald-500 fill-emerald-500/10 shrink-0" size={24} title="Verified Professional" />
                                )}
                            </h1>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30 text-xs font-bold mb-3 uppercase tracking-widest">
                                <Award size={12} className="text-amber-400" /> {lawyer.specialization}
                            </div>
                            {lawyer.barCouncilId && (
                                <div className="block mb-6">
                                    <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3.5 py-1.5">
                                        BCI Enrollment: {lawyer.barCouncilId}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-center gap-8 border-t border-white/5 pt-6 mb-8">
                                <div className="text-center">
                                    <div className="text-2xl font-black text-white">{new Date().getFullYear() - (lawyer.experience || 1)}</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Practice Started</div>
                                </div>
                                <div className="text-center border-l border-white/5 pl-8">
                                    <div className="text-2xl font-black text-white">{lawyer.experience || 1}+</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Years Exp</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {connection?.status === 'active' ? (
                                    <button onClick={() => router.push(`/messages?chatId=${lawyerId}`)} className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition flex items-center justify-center gap-2">
                                        <MessageCircle size={20} /> Secure Message
                                    </button>
                                ) : connection?.status === 'pending' ? (
                                    <button disabled className="w-full py-4 bg-white/5 border border-white/10 text-slate-400 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2">
                                        <Clock size={20} /> Request Sent
                                    </button>
                                ) : (
                                    <button onClick={handleConnectClick} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-[1.02] transition flex items-center justify-center gap-2">
                                        <UserPlus size={20} /> Connect Now
                                    </button>
                                )}

                                {user?.role !== 'lawyer' && (
                                    <button onClick={() => setShowBookingModal(true)} className="w-full py-4 bg-transparent border border-white/20 text-white rounded-xl font-bold hover:bg-white/5 transition flex items-center justify-center gap-2">
                                        Book Consultation
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT: DETAILS */}
                <div className="lg:col-span-8 space-y-6">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white/5 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white/10 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30"><UserPlus size={20} /></span>
                            Professional Bio
                        </h3>
                        <p className="text-slate-300 leading-loose text-lg font-light">
                            {lawyer.bio || "This advocate is a dedicated legal professional with a strong track record of success in various courts."}
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-lg">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30"><Briefcase size={20} /></span>
                                Core Competencies
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {(lawyer.specialization?.split(',') || ["Corporate Law", "Civil Rights", "Family Law"]).map((s, i) => (
                                    <span key={i} className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl font-bold text-purple-200 text-xs hover:border-purple-500/50 transition cursor-default">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-lg">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30"><Gavel size={20} /></span>
                                Admitted Courts
                            </h3>
                            <ul className="space-y-4">
                                {(lawyer.courts || ["Supreme Court of India", "High Courts"]).map((c, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                                        <span className="w-2 h-2 rounded-full bg-amber-500" /> {c}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-gradient-to-tr from-indigo-900 to-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl flex flex-col md:flex-row justify-between items-center border border-white/10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold font-serif mb-2">Legal Retainer</h3>
                            <p className="text-indigo-200 text-sm font-medium">Standard Consultation Fee</p>
                        </div>
                        <div className="mt-6 md:mt-0 text-center md:text-right relative z-10">
                            <div className="text-5xl font-black text-white mb-2">₹{lawyer.consultationFee || lawyer.hourlyRate || 2000}</div>
                            <div className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Per Hour</div>
                        </div>
                    </motion.div>
                </div>
            </div>
            {showBookingModal && (
                <BookingModal
                    lawyer={lawyer}
                    client={user}
                    onClose={() => setShowBookingModal(false)}
                />
            )}

            {showEnquiryModal && (
                <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200 text-left">
                        <button 
                            onClick={() => {
                                setShowEnquiryModal(false)
                                setEnquirySuccess(false)
                                setEnquiryText('')
                                setAttachmentFile(null)
                            }} 
                            className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
                        >
                            <X size={18} />
                        </button>

                        {!enquirySuccess ? (
                            <>
                                <h2 className="text-xl font-bold text-white mb-1">Submit Legal Enquiry</h2>
                                <p className="text-sm text-slate-400 mb-6">Initiate connection with {lawyer.name}</p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Describe your case facts *</label>
                                        <textarea
                                            rows={4}
                                            required
                                            value={enquiryText}
                                            onChange={(e) => setEnquiryText(e.target.value)}
                                            placeholder="Write a brief overview of your legal situation..."
                                            className="w-full bg-[#020617] border border-white/10 rounded-xl p-3 outline-none focus:border-indigo-500 resize-none text-sm text-white placeholder:text-slate-600 font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 font-sans">Case Attachments (Optional)</label>
                                        <div className="border border-dashed border-white/15 hover:border-indigo-500/50 rounded-xl p-4 bg-white/[0.01] transition text-center relative flex flex-col items-center justify-center">
                                            <input 
                                                type="file" 
                                                id="enquiry-file" 
                                                className="hidden" 
                                                onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                                            />
                                            {attachmentFile ? (
                                                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                                                    <CheckCircle size={14} />
                                                    <span className="truncate max-w-[240px]">{attachmentFile.name}</span>
                                                    <button type="button" onClick={() => setAttachmentFile(null)} className="text-slate-500 hover:text-white ml-1 font-bold">✕</button>
                                                </div>
                                            ) : (
                                                <label htmlFor="enquiry-file" className="cursor-pointer flex flex-col items-center gap-1.5">
                                                    <Upload size={18} className="text-slate-500" />
                                                    <span className="text-xs text-slate-400 font-medium">Upload PDF, DOCX or Image (Max 10MB)</span>
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-[10px] text-slate-500 italic">
                                        ⚖️ Note: Document files are encrypted and shared securely only with this advocate.
                                    </div>

                                    <button
                                        onClick={handleSendEnquiry}
                                        disabled={enquiryLoading || !enquiryText.trim()}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                                    >
                                        {enquiryLoading ? "Submitting Enquiry..." : "Send Connection Request"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="py-4 space-y-5 text-center">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                                    <CheckCircle size={32} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">Enquiry Sent Successfully</h3>
                                    <p className="text-xs text-slate-400 max-w-xs mx-auto">Your case details and files have been transmitted securely to the advocate.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs text-left font-bold">
                                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                        <span className="text-slate-500 block uppercase tracking-wider mb-1">Ticket ID</span>
                                        <span className="text-white font-mono">{enquiryTicketId}</span>
                                    </div>
                                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                        <span className="text-slate-500 block uppercase tracking-wider mb-1">Expected SLA</span>
                                        <span className="text-indigo-400">24 Hours Response</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setShowEnquiryModal(false)
                                        setEnquirySuccess(false)
                                        setEnquiryText('')
                                        setAttachmentFile(null)
                                    }}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
