'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, Shield, ArrowLeft, Loader2, Sparkles, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

export default function NyayVoicePage() {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [response, setResponse] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [language, setLanguage] = useState('en-IN')

    const recognitionRef = useRef(null)

    useEffect(() => {
        if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.continuous = false
            recognitionRef.current.interimResults = true
            recognitionRef.current.lang = language

            recognitionRef.current.onresult = (event) => {
                const current = event.resultIndex
                const transcriptResult = event.results[current][0].transcript
                setTranscript(transcriptResult)

                if (event.results[current].isFinal) {
                    processVoiceCommand(transcriptResult)
                }
            }

            recognitionRef.current.onerror = (event) => {
                console.error("Speech Recognition Error:", event.error)
                setError("Could not access microphone or understand audio.")
                setIsListening(false)
            }

            recognitionRef.current.onend = () => {
                setIsListening(false)
            }
        } else {
            setError("Speech recognition is not supported in this browser.")
        }
    }, [language])

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop()
        } else {
            setTranscript('')
            setResponse('')
            setError(null)
            setIsListening(true)
            recognitionRef.current?.start()
        }
    }

    const processVoiceCommand = async (text) => {
        setIsLoading(true)
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/ai/chat`, {
                message: `[VOICE CONSULTATION] User asked: ${text}. Provide a concise, professional legal response suitable for voice playback.`
            })
            const aiText = res.data.response
            setResponse(aiText)
            speakResponse(aiText)
        } catch (err) {
            console.error(err)
            setError("Assistant failed to process your request.")
        } finally {
            setIsLoading(false)
        }
    }

    const speakResponse = (text) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = language
            utterance.rate = 1.0
            utterance.pitch = 1.0
            window.speechSynthesis.speak(utterance)
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans overflow-hidden pt-24">
            {/* GRADIENT BLOBS */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
            </div>

            {/* HEADER */}
            <header className="relative z-10 p-8 flex justify-between items-center">
                <Link href="/client/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold">Dashboard</span>
                </Link>

                <div className="flex items-center gap-4">
                     <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-slate-400 focus:outline-none focus:border-blue-500/50"
                     >
                        <option value="en-IN">English (India)</option>
                        <option value="hi-IN">Hindi (हिन्दी)</option>
                        <option value="bn-IN">Bengali (বাংলা)</option>
                        <option value="ta-IN">Tamil (தமிழ்)</option>
                     </select>
                     <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400">
                        Neural Engine Active
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 max-w-4xl mx-auto w-full">
                <div className="text-center mb-16">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black tracking-tighter mb-4"
                    >
                        Nyay<span className="text-blue-500">Voice</span> Intelligence
                    </motion.h1>
                    <p className="text-slate-400 font-medium tracking-tight text-lg">
                        Consult your legal department via specialized voice models.
                    </p>
                </div>

                {/* VOICE VISUALIZER / MIC BUTTON */}
                <div className="relative mb-24">
                    <AnimatePresence>
                        {isListening && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                {[...Array(3)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scale: 0.8, opacity: 0.5 }}
                                        animate={{ scale: 2, opacity: 0 }}
                                        transition={{ 
                                            repeat: Infinity, 
                                            duration: 2, 
                                            delay: i * 0.6,
                                            ease: "easeOut"
                                        }}
                                        className="absolute w-40 h-40 rounded-full border border-blue-500/50"
                                    />
                                ))}
                            </div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleListening}
                        className={`relative z-20 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
                            isListening ? 'bg-red-500 shadow-red-500/20' : 'bg-blue-600 shadow-blue-600/20'
                        }`}
                    >
                        {isListening ? <MicOff size={40} /> : <Mic size={40} />}
                        
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full backdrop-blur-sm">
                                <Loader2 size={40} className="animate-spin text-white" />
                            </div>
                        )}
                    </motion.button>

                    {/* STATUS TEXT */}
                    <div className="absolute top-full mt-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">
                            {isListening ? "Listening Authentically..." : isLoading ? "Processing Neural Data..." : "Tap to Speak"}
                        </span>
                    </div>
                </div>

                {/* TRANSCRIPT & RESPONSE */}
                <div className="w-full space-y-8">
                    <AnimatePresence>
                        {transcript && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-3xl"
                            >
                                <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <Mic size={12} />
                                    <span>Captured Input</span>
                                </div>
                                <p className="text-xl font-medium text-slate-200">"{transcript}"</p>
                            </motion.div>
                        )}

                        {response && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-8 rounded-[40px] bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 backdrop-blur-3xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4">
                                    <Sparkles size={20} className="text-blue-400 opacity-50" />
                                </div>
                                <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-blue-400">
                                    <Volume2 size={12} />
                                    <span>AI Interpretation</span>
                                </div>
                                <p className="text-lg leading-relaxed text-white font-medium italic">
                                    {response}
                                </p>
                            </motion.div>
                        )}

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center p-4 text-red-400 text-sm font-bold"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* FOOTER HINT */}
            <footer className="relative z-10 p-8 text-center">
                <div className="inline-flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1.5 underline underline-offset-4 decoration-blue-500/50">
                        <Shield size={10} />
                        <span>Biometric Voice Isolation</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-800" />
                    <span>End-to-End Encrypted</span>
                </div>
            </footer>
        </div>
    )
}
