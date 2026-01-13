import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MootCourt = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Lobby, 2: Setup, 3: "VR" Mode
    const [micPermission, setMicPermission] = useState(false);

    useEffect(() => {
        if (step === 3) {
            // Simulate "Connecting to VR Server"
            const timer = setTimeout(() => {
                // Maybe play a sound?
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    const handleStart = () => {
        if (user?.plan === 'free' || user?.plan === 'silver') {
            alert("Upgrade to Gold/Diamond to access MootCourt VR.");
            navigate("/pricing");
            return;
        }
        setStep(2);
    };

    const handleConnectMic = () => {
        // Fake permission check
        navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
            setMicPermission(true);
            setTimeout(() => setStep(3), 1500);
        }).catch(() => {
            alert("Microphone access needed for Oral Arguments.");
        });
    };

    return (
        <div className="min-h-screen bg-[#050510] font-sans text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>

            {/* HEADER */}
            <div className="relative z-10 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="font-mono text-xs text-red-400">LIVE SESSION</span>
                </div>
                <h1 className="text-xl font-bold tracking-widest uppercase">Moot VR Experience</h1>
                <button onClick={() => navigate("/dashboard")} className="text-sm text-slate-400 hover:text-white border px-4 py-1 rounded border-slate-600">EXIT</button>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center h-[80vh]">

                {/* STEP 1: LOBBY */}
                {step === 1 && (
                    <div className="text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 rounded-full bg-purple-600/20 border border-purple-500/50 flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(168,85,247,0.4)]">
                            <span className="text-4xl">👓</span>
                        </div>
                        <h2 className="text-4xl font-extrabold mb-4">Welcome to Virtual Court No. 1</h2>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto">
                            Practice your arguments in a hyper-realistic AI environment.
                            The Judge is waiting.
                        </p>
                        <button
                            onClick={handleStart}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-purple-600/40 transition-all transform hover:scale-105"
                        >
                            Enter Courtroom
                        </button>
                    </div>
                )}

                {/* STEP 2: SETUP */}
                {step === 2 && (
                    <div className="bg-black/50 backdrop-blur-xl p-12 rounded-3xl border border-white/10 text-center max-w-lg w-full">
                        <h3 className="text-2xl font-bold mb-8">System Check</h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                                <span className="flex items-center gap-3">
                                    🎤 <span>Microphone</span>
                                </span>
                                {micPermission ? <span className="text-green-400">Connected</span> : <span className="text-yellow-400">Waiting...</span>}
                            </div>
                        </div>

                        <button
                            onClick={handleConnectMic}
                            disabled={micPermission}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${micPermission ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-500'}`}
                        >
                            {micPermission ? 'Entering Session...' : 'Connect Audio Device'}
                        </button>
                    </div>
                )}

                {/* STEP 3: "VR" SIMULATION */}
                {step === 3 && (
                    <div className="w-full max-w-4xl h-[60vh] bg-black rounded-2xl border border-slate-800 relative overflow-hidden shadow-2xl">
                        {/* 3D PLACEHOLDER IMAGE */}
                        <img
                            src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=2000"
                            className="w-full h-full object-cover opacity-60"
                            alt="Courtroom"
                        />

                        {/* OVERLAYS */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-6 py-2 rounded-full border border-white/10 text-center">
                            <p className="text-xs text-slate-400 uppercase tracking-widest">Presiding Judge</p>
                            <p className="font-bold text-white">Hon. Justice AI</p>
                        </div>

                        <div className="absolute bottom-8 left-8 right-8 flex gap-4">
                            <div className="flex-grow bg-black/80 backdrop-blur rounded-xl p-4 border border-white/10">
                                <p className="text-cyan-400 text-xs font-mono mb-2">TRANSCRIPT [LIVE]</p>
                                <div className="h-20 overflow-hidden relative">
                                    <p className="text-slate-300 text-sm animate-pulse">Listening to your argument...</p>
                                </div>
                            </div>
                            <div className="w-1/3 bg-black/80 backdrop-blur rounded-xl p-4 border border-white/10 flex flex-col justify-between">
                                <p className="text-xs text-slate-400">ARGUMENT SCORE</p>
                                <div className="text-3xl font-bold text-green-400">85/100</div>
                            </div>
                        </div>

                        {/* SPEECH WAVEFORM SIMULATION */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1 h-12 items-end">
                            {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                <div key={i} className="w-2 bg-purple-500 rounded-full animate-bounce" style={{ height: Math.random() * 40 + 'px', animationDelay: i * 0.1 + 's' }}></div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default MootCourt;
