import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const VoiceAssistant = () => {
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('en-IN'); // Default: English (India)

    // Refs for Speech Recognition
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            toast.error("Browser does not support Voice Recognition. Try Chrome.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language;

        recognition.onstart = () => setListening(true);
        recognition.onend = () => setListening(false);
        recognition.onerror = (event) => {
            console.error("Speech Error:", event.error);
            setListening(false);
            toast.error("Could not hear you. Please try again.");
        };

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            setTranscript(text);
            handleSend(text); // Auto-send on silence
        };

        recognitionRef.current = recognition;
    }, [language]);

    const toggleListen = () => {
        if (listening) {
            recognitionRef.current.stop();
        } else {
            setTranscript('');
            recognitionRef.current.start();
        }
    };

    const handleSend = async (text) => {
        if (!text) return;
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/ai/assistant', {
                question: text,
                language: language // Pass selected language context
            }, {
                headers: { Authorization: token ? `Bearer ${token}` : '' }
            });

            const aiText = res.data.answer;
            setResponse(aiText);
            speak(aiText);

        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.answer || err.response?.data?.error || "AI Connection Failed";
            toast.error(errorMessage);
            speak("Sorry, I encountered an error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const speak = (text) => {
        // Strip markdown for speaking
        const cleanText = text.replace(/[*#]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = language;
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white flex flex-col items-center justify-center p-4">

            {/* Header */}
            <div className="absolute top-6 left-6 flex items-center gap-3">
                <span className="text-3xl">🎙️</span>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    NyayVoice
                </h1>
            </div>

            {/* Language Selector */}
            <div className="absolute top-6 right-6">
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="en-IN">English (India)</option>
                    <option value="hi-IN">Hindi (हिंदी)</option>
                    <option value="ta-IN">Tamil (தமிழ்)</option>
                    <option value="te-IN">Telugu (తెలుగు)</option>
                </select>
            </div>

            {/* Main Visualizer (Pulse) */}
            <div className="relative mb-12">
                <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 ${listening ? 'bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.6)] scale-110' : 'bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.4)]'}`}>
                    <button
                        onClick={toggleListen}
                        className="text-6xl focus:outline-none hover:scale-105 transition-transform"
                    >
                        {listening ? '⏹️' : '🎙️'}
                    </button>
                </div>
                {listening && (
                    <div className="absolute -inset-4 border-2 border-red-500/50 rounded-full animate-ping"></div>
                )}
            </div>

            {/* Status Text */}
            <div className="text-center max-w-2xl space-y-6">
                <p className="text-gray-400 text-lg">
                    {listening ? "Listening..." : "Tap the mic and say: 'Mera landlord deposit wapas nahi kar raha'"}
                </p>

                {/* User Transcript */}
                {transcript && (
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm animate-fade-in-up">
                        <p className="text-lg font-medium text-white">" {transcript} "</p>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center gap-2 text-purple-400">
                        <span className="animate-bounce">●</span>
                        <span className="animate-bounce delay-100">●</span>
                        <span className="animate-bounce delay-200">●</span>
                        <span>Thinking...</span>
                    </div>
                )}

                {/* AI Response */}
                {response && !loading && (
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-2xl border border-purple-500/30 text-left shadow-2xl animate-fade-in max-h-96 overflow-y-auto custom-scrollbar">
                        <div className="prose prose-invert max-w-none text-gray-200">
                            {/* Simple Markdown Rendering */}
                            {response.split('\n').map((line, i) => (
                                <p key={i} className="mb-2">{line}</p>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceAssistant;
