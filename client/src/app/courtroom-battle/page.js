'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gavel, Send, User, Bot, Scale, AlertTriangle, Shield, CheckCircle2, Loader2, Info } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

export default function NyayCourtPage() {
    const [gameState, setGameState] = useState('initial') // 'initial', 'battle', 'result'
    const [caseScenario, setCaseScenario] = useState('')
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [intensity, setIntensity] = useState(0)

    const scrollRef = useRef(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const startBattle = async () => {
        if (!caseScenario.trim()) return
        setIsLoading(true)
        setGameState('battle')
        
        // Initial Judge Opening
        const initialMessages = [
            { role: 'judge', text: "Quiet in the court. We are here to deliberate on the following matter: " + caseScenario + ". Counsel for the opposition, please state your opening objection.", name: "Justice AI" },
        ]
        setMessages(initialMessages)
        
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/ai/chat`, {
                message: `[Moot Court Simulation] Context: ${caseScenario}. You are the 'Opposing Counsel'. Provide a sharp, aggressive 2-sentence legal objection to the user's position.`
            })
            setMessages(prev => [...prev, { role: 'opponent', text: res.data.response, name: "Adv. Adversary-Bot" }])
            setIntensity(30)
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSend = async () => {
        if (!input.trim() || isLoading) return
        
        const userMsg = { role: 'user', text: input, name: "You" }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsLoading(true)

        try {
            // 1. Opponent Counters
            const opponentRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/ai/chat`, {
                message: `[Moot Court Simulation] Context: ${caseScenario}. Current History: ${messages.map(m => m.text).join('\n')}. User just said: ${input}. You are the 'Opposing Counsel'. Counter their argument aggressively in 2 sentences.`
            })
            
            // 2. Judge Interjects
            const judgeRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/ai/chat`, {
                message: `[Moot Court Simulation] Context: ${caseScenario}. History: ${messages.map(m => m.text).join('\n')}. You are the 'Presiding Judge'. Based on the user's argument and the opponent's counter, ask a probing legal question or make an observation. Be neutral but strict.`
            })

            setMessages(prev => [
                ...prev, 
                { role: 'opponent', text: opponentRes.data.response, name: "Adv. Adversary-Bot" },
                { role: 'judge', text: judgeRes.data.response, name: "Justice AI" }
            ])
            
            setIntensity(prev => Math.min(prev + 15, 100))
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans overflow-hidden">
            {/* BACKGROUND ANIMATION */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]" />
                {gameState === 'battle' && (
                    <motion.div 
                        animate={{ opacity: intensity / 100 }}
                        className="absolute inset-0 bg-red-600/5 blur-[100px]" 
                    />
                )}
            </div>

            {/* HEADER */}
            <header className="relative z-10 p-8 border-b border-white/5 flex justify-between items-center backdrop-blur-3xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                        <Gavel size={20} className="text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight uppercase tracking-[0.2em]">Nyay<span className="text-blue-500">Court</span></h1>
                        <p className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase">Trial Simulation Engine v3.0</p>
                    </div>
                </div>

                <Link href="/client/dashboard" className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-white transition-colors">
                    Leave Chamber
                </Link>
            </header>

            <main className="flex-1 overflow-hidden flex flex-col items-center justify-center relative z-10">
                <AnimatePresence mode="wait">
                    {gameState === 'initial' && (
                        <motion.div 
                            key="setup"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="w-full max-w-2xl px-6 py-12 text-center"
                        >
                            <div className="mb-8 p-12 rounded-[48px] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl">
                                <h2 className="text-3xl font-bold mb-6 tracking-tight">Enter Case Parameters</h2>
                                <textarea 
                                    className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-6 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all text-lg font-medium leading-relaxed"
                                    placeholder="Briefly describe the dispute (e.g., Unfair dismissal, property boundary dispute, contract breach...)"
                                    value={caseScenario}
                                    onChange={(e) => setCaseScenario(e.target.value)}
                                />
                                <button
                                    onClick={startBattle}
                                    disabled={!caseScenario.trim() || isLoading}
                                    className="mt-8 w-full py-5 bg-white text-slate-950 font-black rounded-3xl text-sm uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-2xl shadow-white/5 disabled:opacity-50 group"
                                >
                                    {isLoading ? <Loader2 className="animate-spin mx-auto" /> : (
                                        <span className="flex items-center justify-center gap-2">
                                            Initialize Simulation <Gavel size={18} className="group-hover:rotate-12 transition-transform" />
                                        </span>
                                    )}
                                </button>
                                <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                    <div className="flex items-center gap-2"><Bot size={14} /> AI Opponent Active</div>
                                    <div className="flex items-center gap-2"><Scale size={14} /> Neutral Judge Panel</div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {gameState === 'battle' && (
                        <motion.div 
                            key="court"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full h-full flex flex-col max-w-6xl mx-auto px-6"
                        >
                            {/* INTENSITY BAR */}
                            <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${intensity}%`, backgroundColor: intensity > 70 ? '#ef4444' : '#3b82f6' }}
                                    className="h-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto py-8 space-y-8 scroll-smooth" ref={scrollRef}>
                                {messages.map((msg, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`flex gap-6 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center border ${
                                            msg.role === 'judge' ? 'bg-amber-600/10 border-amber-500/20 text-amber-500' :
                                            msg.role === 'opponent' ? 'bg-red-600/10 border-red-500/20 text-red-500' :
                                            'bg-blue-600/10 border-blue-500/20 text-blue-500'
                                        }`}>
                                            {msg.role === 'judge' ? <Gavel size={20} /> : 
                                             msg.role === 'opponent' ? <Bot size={20} /> : <User size={20} />}
                                        </div>
                                        <div className={`relative p-8 rounded-[40px] shadow-2xl backdrop-blur-3xl ${
                                            msg.role === 'judge' ? 'bg-amber-600/5 border border-amber-500/10' :
                                            msg.role === 'opponent' ? 'bg-red-600/5 border border-red-500/10' :
                                            'bg-white/5 border border-white/10'
                                        }`}>
                                            <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 opacity-50 flex items-center gap-2">
                                                {msg.name}
                                                {msg.role === 'judge' && <Shield size={10} />}
                                            </div>
                                            <p className="text-lg leading-relaxed font-medium text-slate-200">
                                                {msg.text}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-4 items-center text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse p-8">
                                        <Loader2 className="animate-spin" size={14} /> Adversary is preparing rebuttal...
                                    </div>
                                )}
                            </div>

                            {/* INPUT AREA */}
                            <div className="p-8 border-t border-white/5 bg-[#030712]/50 backdrop-blur-2xl">
                                <div className="max-w-4xl mx-auto flex gap-4">
                                    <input 
                                        className="flex-1 bg-white/5 border border-white/10 rounded-3xl px-8 py-5 text-lg font-medium focus:outline-none focus:border-blue-500/50 transition-all"
                                        placeholder="Present your argument..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    />
                                    <button 
                                        onClick={handleSend}
                                        disabled={isLoading || !input.trim()}
                                        className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all text-white disabled:opacity-50"
                                    >
                                        <Send size={24} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
