'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
    AlertTriangle, Shield, FileText, Copy, Share2, Phone,
    MapPin, ChevronRight, Loader2, CheckCircle2,
    Siren, BookOpen, Zap, Lock, Download, RotateCcw
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const EMERGENCY_TYPES = [
    { id: 'arrest', label: 'Arrest / Detention', icon: '🚔', color: 'from-red-500 to-rose-600' },
    { id: 'fraud', label: 'Fraud / Cheating', icon: '💸', color: 'from-orange-500 to-amber-600' },
    { id: 'violence', label: 'Domestic Violence', icon: '🏠', color: 'from-pink-500 to-rose-600' },
    { id: 'theft', label: 'Theft / Robbery', icon: '🔓', color: 'from-violet-500 to-purple-600' },
    { id: 'harassment', label: 'Harassment / Stalking', icon: '🚨', color: 'from-yellow-500 to-orange-600' },
    { id: 'other', label: 'Other Emergency', icon: '⚠️', color: 'from-slate-500 to-slate-600' },
]

const StepDot = ({ n, current, label }) => {
    const done = current > n
    const active = current === n
    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all duration-500
        ${done ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]' : ''}
        ${active ? 'bg-red-500 border-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-pulse' : ''}
        ${!done && !active ? 'bg-white/5 border-white/10 text-slate-600' : ''}
      `}>
                {done ? <CheckCircle2 size={18} /> : n}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-red-400' : done ? 'text-emerald-400' : 'text-slate-600'}`}>
                {label}
            </span>
        </div>
    )
}

export default function LegalSOSClient() {
    const [step, setStep] = useState(1)
    const [emergencyType, setType] = useState('')
    const [situation, setSituation] = useState('')
    const [language, setLanguage] = useState('English')
    const [rights, setRights] = useState(null)
    const [firDraft, setFirDraft] = useState('')
    const [firDetails, setFirDetails] = useState({ name: '', date: '', place: '', against: '' })
    const [loading, setLoading] = useState(false)
    const [firLoading, setFirLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const textRef = useRef(null)

    const analyzeEmergency = async () => {
        if (!situation.trim() || !emergencyType) return
        setLoading(true)
        try {
            const { data } = await axios.post(`/api/ai/legal-sos`, {
                situation,
                emergencyType,
                language,
            })
            setRights(data)
            setStep(2)
        } catch (err) {
            toast.error('Analysis failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const generateFIR = async () => {
        setFirLoading(true)
        try {
            const { data } = await axios.post(`/api/ai/fir-generator`, {
                situation,
                emergencyType,
                language,
                complaintDetails: firDetails,
                rights,
            })
            setFirDraft(data.draft)
            setStep(3)
        } catch (err) {
            toast.error('FIR generation failed. Please try again.')
        } finally {
            setFirLoading(false)
        }
    }

    const copyFIR = () => {
        navigator.clipboard.writeText(firDraft)
        setCopied(true)
        toast.success('FIR draft copied!')
        setTimeout(() => setCopied(false), 2500)
    }

    const downloadFIR = () => {
        const blob = new Blob([firDraft], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'NyayNow_FIR_Draft.txt'
        a.click()
        toast.success('FIR draft downloaded!')
    }

    const urgencyColor = (u) =>
        u === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
            u === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'

    return (
        <div className="max-w-4xl mx-auto px-6 pb-32">
            <div className="flex items-center justify-center gap-4 mb-12">
                <StepDot n={1} current={step} label="Describe" />
                <div className={`h-0.5 w-24 rounded ${step > 1 ? 'bg-emerald-500' : 'bg-white/10'}`} />
                <StepDot n={2} current={step} label="Rights" />
                <div className={`h-0.5 w-24 rounded ${step > 2 ? 'bg-emerald-500' : 'bg-white/10'}`} />
                <StepDot n={3} current={step} label="FIR Draft" />
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                        <div>
                            <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2"><Zap size={20} className="text-red-500" /> Select Emergency</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {EMERGENCY_TYPES.map((type) => (
                                    <button key={type.id} onClick={() => setType(type.id)} className={`p-4 rounded-2xl border text-left transition ${emergencyType === type.id ? 'border-red-500/60 bg-red-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                                        <span className="text-2xl mb-2 block">{type.icon}</span>
                                        <span className="text-sm font-bold text-white">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2"><AlertTriangle size={20} className="text-amber-400" /> Describe Situation</h2>
                            <textarea value={situation} onChange={(e) => setSituation(e.target.value)} rows={5} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-red-500/50" placeholder="What's happening?" />
                        </div>
                        <button onClick={analyzeEmergency} disabled={loading || !situation || !emergencyType} className="w-full py-5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-lg shadow-lg shadow-red-500/20 flex items-center justify-center gap-3">
                            {loading ? <Loader2 className="animate-spin" /> : <><Siren /> Activate Legal SOS</>}
                        </button>
                    </motion.div>
                )}
                {step === 2 && rights && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                        <div className="bg-black/40 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Classified As</p>
                                <h3 className="text-white font-black text-2xl">{rights.classified_as}</h3>
                            </div>
                            <span className={`px-5 py-2 rounded-xl border font-black text-xs uppercase ${urgencyColor(rights.urgency)}`}>{rights.urgency} Priority</span>
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-white font-bold text-xl mb-5 flex items-center gap-2"><Shield size={20} className="text-emerald-400" /> Your Rights</h2>
                            {rights.rights?.map((r, i) => (
                                <div key={i} className="flex items-start gap-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">{i + 1}</div>
                                    <div>
                                        <p className="text-emerald-300 font-bold text-sm">{r.title}</p>
                                        <p className="text-slate-400 text-sm">{r.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={generateFIR} disabled={firLoading} className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg">
                            {firLoading ? "Drafting FIR..." : "Generate FIR Draft"}
                        </button>
                    </motion.div>
                )}
                {step === 3 && firDraft && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-4">
                            <CheckCircle2 size={24} className="text-emerald-400" />
                            <p className="text-emerald-300 font-bold">FIR Draft Ready</p>
                        </div>
                        <div className="bg-[#040d1f] border border-white/10 rounded-3xl p-8 font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                            {firDraft}
                        </div>
                        <div className="flex gap-4">
                            <button onClick={copyFIR} className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />} {copied ? 'Copied' : 'Copy'}
                            </button>
                            <button onClick={downloadFIR} className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                                <Download size={18} /> Download
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <p className="text-[10px] text-slate-600 italic text-center mt-8">
                ⚖️ This is AI-generated information. Verify with a qualified lawyer.
            </p>
        </div>
    )
}
