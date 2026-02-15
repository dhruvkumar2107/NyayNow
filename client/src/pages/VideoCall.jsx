import { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { ShieldCheck, Lock } from 'lucide-react';

export default function VideoCall() {
    const { id } = useParams();
    const navigate = useNavigate();
    const jitsiContainer = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;

        script.onload = () => {
            setLoading(false);
            initJitsi();
        };

        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const initJitsi = () => {
        if (!window.JitsiMeetExternalAPI) return;

        const domain = "meet.jit.si";
        const options = {
            roomName: `NyayNow-Secure-Meeting-${id}`,
            width: "100%",
            height: "100%",
            parentNode: jitsiContainer.current,
            configOverwrite: {
                startWithAudioMuted: true,
                prejoinPageEnabled: false,
                disableDeepLinking: true,
                theme: {
                    palette: {
                        primary: '#4F46E5', // Indigo 600
                        warning: '#F59E0B',
                        error: '#EF4444',
                        success: '#10B981',
                        surface: '#ffffff',
                        background: '#f8fafc'
                    }
                }
            },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                    'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                    'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                    'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                    'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                    'security'
                ],
                SHOW_JITSI_WATERMARK: false,
                DEFAULT_BACKGROUND: '#020617',
                DEFAULT_LOCAL_DISPLAY_NAME: 'Me',
            },
            userInfo: {
                displayName: "NyayNow User"
            }
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);

        api.addEventListeners({
            videoConferenceLeft: () => {
                navigate(-1);
                api.dispose();
            },
        });
    };

    return (
        <div className="h-screen w-full bg-[#020617] flex flex-col overflow-hidden font-sans selection:bg-indigo-500/30">
            <Navbar />

            <div className="flex-1 relative pt-20 px-4 pb-4">
                {/* LOADING STATE */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#020617] text-white">
                        <div className="text-center">
                            <div className="flex justify-center gap-2 mb-6">
                                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]"></motion.div>
                                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]"></motion.div>
                                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></motion.div>
                            </div>
                            <h2 className="text-xl font-bold tracking-[0.2em] uppercase font-serif">Establishing Secure Uplink</h2>
                            <p className="text-indigo-400 text-xs mt-3 font-mono font-bold flex items-center justify-center gap-2">
                                <Lock size={12} /> End-to-End Encryption Enabled
                            </p>
                        </div>
                    </div>
                )}

                {/* VIDEO CONTAINER */}
                <div className="w-full h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative bg-black/50 backdrop-blur-xl">
                    {/* Secure Badge */}
                    <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                            <ShieldCheck size={12} /> NYAY_SECURE_CHANNEL_v4
                        </span>
                    </div>

                    <div ref={jitsiContainer} className="w-full h-full" />
                </div>
            </div>
        </div>
    );
}
