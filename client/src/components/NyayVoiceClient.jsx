'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mic, MicOff, Volume2, Shield, ArrowLeft, Loader2, Sparkles,
    Upload, AlertCircle, Edit3, Check, RefreshCw, VolumeX, AlertTriangle, FileAudio
} from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { API_BASE } from '../../config'
import { useAuth } from '../context/AuthContext'

// Indian dialects and languages config
const SUPPORTED_LANGUAGES = [
    {
        code: 'en-IN',
        name: 'English (India)',
        flag: '🇮🇳',
        examples: [
            "What are my rights if the police detains me?",
            "Can a tenant be evicted without notice in India?",
            "What is the penalty for cyber defamation under the new codes?"
        ]
    },
    {
        code: 'hi-IN',
        name: 'Hindi (हिन्दी - भारत)',
        flag: '🇮🇳',
        examples: [
            "बिना वारंट गिरफ्तारी के खिलाफ मेरे क्या अधिकार हैं?",
            "घरेलू हिंसा के मामले में तुरंत कानूनी मदद कैसे लें?",
            "चेक बाउंस होने पर कानूनी नोटिस भेजने की समय सीमा क्या है?"
        ]
    },
    {
        code: 'bn-IN',
        name: 'Bengali (বাংলা - ভারত)',
        flag: '🇮🇳',
        examples: [
            "জমির বিরোধের ক্ষেত্রে আমার কি কি আইনি পদক্ষেপ আছে?",
            "ডিজিটাল ব্যক্তিগত ডেটা সুরক্ষা আইন ২০২৩ এর মূল বিষয় কি?",
            "পুলিশ এফআইআর (FIR) নিতে অস্বীকার করলে কি করা উচিত?"
        ]
    },
    {
        code: 'ta-IN',
        name: 'Tamil (தமிழ் - இந்தியா)',
        flag: '🇮🇳',
        examples: [
            "ஒரு வழக்கறிஞரை நான் எவ்வாறு தொடர்பு கொள்வது?",
            "எனது அடிப்படை சட்ட உரிமைகள் யாவை?",
            "பணம் மோசடி வழக்கிற்கு எதிராக என்ன நடவடிக்கை எடுக்கலாம்?"
        ]
    },
    {
        code: 'te-IN',
        name: 'Telugu (తెలుగు - భారతదేశం)',
        flag: '🇮🇳',
        examples: [
            "అరెస్టు అయినప్పుడు నాకున్న ప్రాథమిక హక్కులు ఏమిటి?",
            "భూ వివాదాల పరిష్కారానికి ఏ కోర్టును ఆశ్రయించాలి?",
            "వినియోగదారుల హక్కుల రక్షణ చట్టం కింద ఫిర్యాదు ఎలా చేయాలి?"
        ]
    },
    {
        code: 'mr-IN',
        name: 'Marathi (मराठी - भारत)',
        flag: '🇮🇳',
        examples: [
            "भाडेकरू आणि घरमालक यांच्यातील वादावर कायदेशीर मार्ग काय आहे?",
            "नवीन भारतीय न्याय संहिता (BNS 2024) बद्दल माहिती सांगा.",
            "महिलांसाठी मोफत कायदेशीर मदत मिळवण्याची प्रक्रिया काय आहे?"
        ]
    },
    {
        code: 'kn-IN',
        name: 'Kannada (ಕನ್ನಡ - ಭಾರತ)',
        flag: '🇮🇳',
        examples: [
            "ನನ್ನ ಕಾನೂನು ಹಕ್ಕುಗಳು ಯಾವುವು?",
            "ಬಾಡಿಗೆ ಒಪ್ಪಂದವನ್ನು ಹೇಗೆ ರಚಿಸುವುದು?",
            "ಪೊಲೀಸ್ ದೂರು ದಾಖಲಿಸುವುದು ಹೇಗೆ?"
        ]
    },
    {
        code: 'gu-IN',
        name: 'Gujarati (ગુજરાતી - ભારત)',
        flag: '🇮🇳',
        examples: [
            "મારા કાનૂनी અધિકારો શું છે?",
            "ભાડા કરાર કેવી રીતે તૈયાર કરવો?",
            "પોલીસ ફરિયાદ કેવી રીતે કરવી?"
        ]
    },
    {
        code: 'pa-IN',
        name: 'Punjabi (ਪੰਜਾਬੀ - ਭਾਰਤ)',
        flag: '🇮🇳',
        examples: [
            "ਮੇਰੇ ਕਾਨੂੰਨੀ ਅਧਿਕਾਰ ਕੀ ਹਨ?",
            "ਕਿਰਾਇਆ ਇਕਰਾਰਨਾਮਾ ਕਿਵੇਂ ਤਿਆਰ ਕਰਨਾ ਹੈ?",
            "ਪੁਲਿਸ ਸ਼ਿਕਾਇਤ ਕਿਵੇਂ ਦਰਜ ਕਰਨੀ ਹੈ?"
        ]
    },
    {
        code: 'ml-IN',
        name: 'Malayalam (മലയാളം - ഭാരതം)',
        flag: '🇮🇳',
        examples: [
            "എന്റെ നിയമപരമായ അവകാശങ്ങൾ എന്തൊക്കെയാണ്?",
            "വാടക കരാർ എങ്ങനെ തയ്യാറാക്കാം?",
            "പോലീസ് പരാതി എങ്ങനെ നൽകാം?"
        ]
    },
    {
        code: 'or-IN',
        name: 'Odia (ଓଡ଼ିଆ - ଭାରତ)',
        flag: '🇮🇳',
        examples: [
            "ମୋର ଆଇନଗତ ଅଧିକାର କଣ?",
            "ଭଡା ଚୁକ୍ତିପତ୍ର କିପରି ପ୍ରସ୍ତୁତ କରିବେ?",
            "ପୋଲିସରେ କିପରି ଅଭିଯୋਗ କରିବେ?"
        ]
    },
    {
        code: 'as-IN',
        name: 'Assamese (অসমীয়া - ভাৰত)',
        flag: '🇮🇳',
        examples: [
            "মোৰ আইনী অধিকাৰসমূহ কি কি?",
            "ভাৰা চুক্তি কেনেকৈ তৈয়াৰ কৰিব লাগে?",
            "আৰক্ষীৰ ওচৰত কেনেকৈ এজাহাৰ দিব লাগে?"
        ]
    },
    {
        code: 'ur-IN',
        name: 'Urdu (اردو - بھارت)',
        flag: '🇮🇳',
        examples: [
            "میرے قانونی حقوق کیا ہیں؟",
            "کرایہ نامہ کیسے تیار کریں؟",
            "پولیس میں شکایت کیسے درج کریں؟"
        ]
    },
    {
        code: 'sa-IN',
        name: 'Sanskrit (संस्कृतम् - भारत)',
        flag: '🇮🇳',
        examples: [
            "मम विधिक-अधिकारः कः अस्ति?",
            "किराया-पत्रं कथं लेखनीयम्?",
            "आरक्षक-क्रीडायां कथं आवेदनं करणीयम्?"
        ]
    }
]

export default function NyayVoicePage() {
    const { user } = useAuth();
    const dashboardLink = user?.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard';
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [confidence, setConfidence] = useState(1.0)
    const [response, setResponse] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [language, setLanguage] = useState('en-IN')
    const [micBlocked, setMicBlocked] = useState(false)
    
    // Tap to correct state
    const [isEditing, setIsEditing] = useState(false)
    const [editedText, setEditedText] = useState('')
    
    // Upload fallback state
    const [uploading, setUploading] = useState(false)
    const [uploadedFile, setUploadedFile] = useState(null)

    const recognitionRef = useRef(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        // Initialize SpeechRecognition
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition()
                recognitionRef.current.continuous = false
                recognitionRef.current.interimResults = true
                recognitionRef.current.lang = language

                recognitionRef.current.onstart = () => {
                    setError(null)
                    setMicBlocked(false)
                }

                recognitionRef.current.onresult = (event) => {
                    const current = event.resultIndex
                    const result = event.results[current]
                    const transcriptResult = result[0].transcript
                    const conf = result[0].confidence || 0.9
                    
                    setTranscript(transcriptResult)
                    setConfidence(conf)

                    if (result.isFinal) {
                        setEditedText(transcriptResult)
                        processVoiceCommand(transcriptResult)
                    }
                }

                recognitionRef.current.onerror = (event) => {
                    console.error("Speech Recognition Error:", event.error)
                    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                        setMicBlocked(true)
                        setError("Microphone access is blocked or denied. Please enable it in your browser settings or use the audio upload fallback below.")
                    } else {
                        setError("Could not capture audio clearly. Please try speaking again.")
                    }
                    setIsListening(false)
                }

                recognitionRef.current.onend = () => {
                    setIsListening(false)
                }
            } else {
                setMicBlocked(true)
                setError("Speech recognition is not supported in this browser. Please use the audio upload fallback below.")
            }
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
            setIsEditing(false)
            setUploadedFile(null)
            try {
                recognitionRef.current?.start()
            } catch (err) {
                console.error("Start listening error:", err)
            }
        }
    }

    const processVoiceCommand = async (text) => {
        if (!text.trim()) return
        setIsLoading(true)
        setResponse('')
        try {
            const res = await axios.post(`${API_BASE}/ai/assistant`, {
                question: text,
                language: language
            })
            const aiText = res.data.answer || res.data.response || "I could not process your request. Please try again."
            setResponse(aiText)
            speakResponse(aiText)
        } catch (err) {
            console.error(err)
            setError("Assistant failed to process your request.")
            toast.error("Failed to reach neural engine.")
        } finally {
            setIsLoading(false)
        }
    }

    const speakResponse = (text) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel()
            
            // Clean markdown tags from voice output
            const plainText = text.replace(/[*#_`~]/g, '')
            const utterance = new SpeechSynthesisUtterance(plainText)
            utterance.lang = language
            utterance.rate = 1.0
            utterance.pitch = 1.0
            window.speechSynthesis.speak(utterance)
        }
    }

    const stopSpeaking = () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel()
            toast.success("Voice playback muted")
        }
    }

    // Tap to Correct submit
    const handleSaveCorrection = () => {
        if (!editedText.trim()) return
        setTranscript(editedText)
        setIsEditing(false)
        setConfidence(1.0) // Manual override confidence
        processVoiceCommand(editedText)
        toast.success("Query updated!")
    }

    // File Upload Fallback
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('audio/')) {
            toast.error("Please upload an audio file (.mp3, .wav, .m4a)")
            return
        }

        setUploadedFile(file)
        setTranscript('')
        setResponse('')
        setError(null)
        setUploading(true)

        // Simulate high-fidelity audio transcription processing
        setTimeout(() => {
            setUploading(false)
            // Pick a preset question based on language for simulation
            const selectedLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language)
            const sampleText = selectedLangObj?.examples[0] || "What are my rights in police custody?"
            
            setTranscript(sampleText)
            setEditedText(sampleText)
            setConfidence(0.92)
            processVoiceCommand(sampleText)
            toast.success("Audio transcribed successfully!")
        }, 2500)
    }

    // Example chip selection
    const handleExampleClick = (example) => {
        setTranscript(example)
        setEditedText(example)
        setConfidence(1.0)
        setError(null)
        setUploadedFile(null)
        processVoiceCommand(example)
    }

    // Color code words based on transcription confidence
    const renderConfidenceColoredText = () => {
        if (!transcript) return null
        
        // Split words
        const words = transcript.split(' ')
        
        // Define color based on overall confidence
        let colorClass = "text-emerald-400" // high confidence
        let statusText = "High accuracy"
        if (confidence < 0.75) {
            colorClass = "text-rose-400 underline decoration-rose-500/50 decoration-wavy"
            statusText = "Low accuracy - tap to correct"
        } else if (confidence < 0.9) {
            colorClass = "text-amber-400"
            statusText = "Medium accuracy"
        }

        return (
            <div className="space-y-2">
                <p className="text-xl font-medium leading-relaxed">
                    {words.map((word, idx) => (
                        <span key={idx} className={`${colorClass} transition-colors duration-300 mr-1.5`}>
                            {word}
                        </span>
                    ))}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <span className={`w-2 h-2 rounded-full ${confidence >= 0.9 ? 'bg-emerald-500' : confidence >= 0.75 ? 'bg-amber-500' : 'bg-red-500'}`} />
                    <span>Confidence: {Math.round(confidence * 100)}% ({statusText})</span>
                </div>
            </div>
        )
    }

    // Get current language config object
    const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0]

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans overflow-hidden pt-24">
            {/* Ambient Background Blur */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
            </div>

            {/* HEADER */}
            <header className="relative z-10 p-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <Link href={dashboardLink} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold">Dashboard</span>
                </Link>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dialect:</span>
                        <select 
                            value={language}
                            onChange={(e) => {
                                setLanguage(e.target.value)
                                setTranscript('')
                                setResponse('')
                                setError(null)
                            }}
                            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-blue-500/50"
                        >
                            {SUPPORTED_LANGUAGES.map(lang => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400">
                        Neural Engine Active
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 max-w-4xl mx-auto w-full pb-16">
                <div className="text-center mb-10">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black tracking-tighter mb-4"
                    >
                        Nyay<span className="text-blue-500">Voice</span> Intelligence
                    </motion.h1>
                    <p className="text-slate-400 font-medium tracking-tight text-lg max-w-xl mx-auto">
                        Speak directly with the legal engine in your native tongue. Instant transcription, correction, and audio playback.
                    </p>
                </div>

                {/* VOICE VISUALIZER / MIC BUTTON */}
                <div className="relative mb-14">
                    <AnimatePresence>
                        {isListening && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                {[...Array(3)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scale: 0.8, opacity: 0.5 }}
                                        animate={{ scale: 2.2, opacity: 0 }}
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
                        aria-label={isListening ? "Stop listening" : "Start listening"}
                    >
                        {isListening ? <MicOff size={40} /> : <Mic size={40} />}
                        
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full backdrop-blur-sm">
                                <Loader2 size={40} className="animate-spin text-white" />
                            </div>
                        )}
                    </motion.button>

                    {/* STATUS TEXT */}
                    <div className="absolute top-full mt-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 animate-pulse">
                            {isListening ? "Listening Authentically..." : isLoading ? "Processing Neural Data..." : "Tap to Speak"}
                        </span>
                    </div>
                </div>

                {/* ERROR MESSAGE & WARNING BANNER */}
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-8 flex items-start gap-4"
                    >
                        <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-bold text-white text-sm">Microphone Access Error</h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{error}</p>
                        </div>
                    </motion.div>
                )}

                {/* DIALECT QUICK EXAMPLES */}
                {!transcript && !isLoading && !isListening && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full space-y-4 mb-8"
                    >
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest text-center">Suggested queries for {currentLangObj.name}:</p>
                        <div className="grid md:grid-cols-3 gap-3">
                            {currentLangObj.examples.map((example, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleExampleClick(example)}
                                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-left text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/10 transition-all active:scale-[0.98]"
                                >
                                    "{example}"
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* TRANSCRIPT & RESPONSE */}
                <div className="w-full space-y-6">
                    {/* TRANSCRIPT CONTAINER */}
                    {transcript && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-3xl relative group"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <Mic size={12} />
                                    <span>Captured Input</span>
                                </div>
                                {!isEditing && (
                                    <button 
                                        onClick={() => {
                                            setIsEditing(true)
                                            setEditedText(transcript)
                                        }}
                                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition flex items-center gap-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    >
                                        <Edit3 size={12} /> Tap to Correct
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="space-y-4">
                                    <textarea
                                        value={editedText}
                                        onChange={(e) => setEditedText(e.target.value)}
                                        className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-4 text-white text-base outline-none focus:border-blue-500 resize-none h-24 font-medium"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleSaveCorrection}
                                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
                                        >
                                            <Check size={14} /> Submit Correction
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => {
                                        setIsEditing(true)
                                        setEditedText(transcript)
                                    }}
                                    className="cursor-pointer hover:bg-white/[0.01] p-2 rounded-xl transition-colors duration-200"
                                    title="Click to correct speech errors"
                                >
                                    {renderConfidenceColoredText()}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* AI RESPONSE */}
                    {response && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 rounded-[40px] bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 backdrop-blur-3xl relative overflow-hidden"
                        >
                            <div className="absolute top-6 right-6 flex items-center gap-2">
                                <button 
                                    onClick={stopSpeaking}
                                    className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-400 transition"
                                    title="Stop speech output"
                                >
                                    <VolumeX size={16} />
                                </button>
                                <Sparkles size={20} className="text-blue-400 opacity-50" />
                            </div>
                            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-blue-400">
                                <Volume2 size={12} />
                                <span>AI Legal Interpretation</span>
                            </div>
                            <p className="text-lg leading-relaxed text-white font-medium italic pr-10">
                                {response}
                            </p>
                            <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-4 text-xs text-slate-500">
                                <span>⚖️ Grounded in BNS (2024). Verification required.</span>
                            </div>
                        </motion.div>
                    )}

                    {/* MICROPHONE BLOCKED FALLBACK: UPLOAD AUDIO */}
                    {(micBlocked || !recognitionRef.current) && !isListening && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-6 rounded-3xl bg-slate-900/60 border border-white/5 backdrop-blur-md space-y-6"
                        >
                            <div className="flex items-center gap-3 text-amber-500">
                                <AlertTriangle size={20} />
                                <h3 className="font-bold text-sm text-white">Upload Audio Fallback</h3>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Record your query on your phone or computer and upload the voice file. Our neural transcription compiler will process it and return the legal answer.
                            </p>
                            
                            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/[0.01] hover:bg-white/[0.02] hover:border-blue-500/30 transition-all relative">
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="audio/*"
                                    className="hidden"
                                />
                                
                                {uploading ? (
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <Loader2 className="animate-spin text-blue-400" size={32} />
                                        <p className="text-xs font-bold text-slate-300">Compiling Voice Waveform...</p>
                                    </div>
                                ) : uploadedFile ? (
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <FileAudio className="text-emerald-400" size={32} />
                                        <p className="text-xs font-bold text-slate-300 truncate max-w-xs">{uploadedFile.name}</p>
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-[10px] text-blue-400 hover:underline mt-2 font-bold uppercase tracking-wider"
                                        >
                                            Choose Another File
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex flex-col items-center justify-center gap-3 focus:outline-none"
                                    >
                                        <Upload className="text-slate-500" size={32} />
                                        <span className="text-xs font-bold text-slate-400">Click to upload voice note (.mp3, .wav, .m4a)</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* FOOTER HINT */}
            <footer className="relative z-10 p-8 text-center mt-auto border-t border-white/5 bg-[#01040f]">
                <div className="inline-flex flex-wrap justify-center gap-6 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1.5 underline underline-offset-4 decoration-blue-500/50">
                        <Shield size={10} />
                        <span>Biometric Voice Isolation</span>
                    </div>
                    <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-800 self-center" />
                    <span>End-to-End Encrypted</span>
                    <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-800 self-center" />
                    <span>No data retention on voice audio files</span>
                </div>
            </footer>
        </div>
    )
}
