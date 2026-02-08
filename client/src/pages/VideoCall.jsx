import { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

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
                        primary: '#2563EB',
                        warning: '#D97706',
                        error: '#DC2626',
                        success: '#059669',
                        surface: '#0F172A', // Dark Slate
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
                DEFAULT_BACKGROUND: '#0B1120',
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
        <div className="h-screen w-full bg-[#0B1120] flex flex-col overflow-hidden font-sans">
            <Navbar />

            <div className="flex-1 relative pt-16">
                {/* LOADING STATE */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#0B1120] text-white">
                        <div className="text-center">
                            <div className="flex justify-center gap-2 mb-4">
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 bg-blue-500 rounded-full"></motion.div>
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-4 h-4 bg-indigo-500 rounded-full"></motion.div>
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-4 h-4 bg-purple-500 rounded-full"></motion.div>
                            </div>
                            <h2 className="text-xl font-bold tracking-widest uppercase">Secure Link Establishing</h2>
                            <p className="text-slate-500 text-xs mt-2">End-to-End Encrypted Session</p>
                        </div>
                    </div>
                )}

                {/* VIDEO CONTAINER */}
                <div className="absolute inset-0 p-4 md:p-8">
                    <div className="w-full h-full rounded-3xl overflow-hidden border border-slate-700 shadow-2xl relative bg-black">
                        {/* Secure Badge */}
                        <div className="absolute top-4 left-6 z-10 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Encrypted</span>
                        </div>

                        <div ref={jitsiContainer} className="w-full h-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
