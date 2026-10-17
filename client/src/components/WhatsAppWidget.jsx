"use client"
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';

const WhatsAppWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    // WhatsApp Support Number and message
    const whatsappNumber = "918076612053"; 
    const prefilledText = "Hello NyayNow, I need legal information regarding...";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(prefilledText)}`;

    return (
        <div className="fixed bottom-6 right-6 z-[99999] flex flex-col items-end">
            {/* Tooltip Popup */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ delay: 1.5, duration: 0.3 }}
                        className="mb-3 px-4 py-2 rounded-xl bg-slate-900 border border-emerald-500/20 text-emerald-400 text-xs font-bold shadow-2xl flex items-center gap-2 cursor-pointer hover:border-emerald-500/40 transition-colors select-none"
                        onClick={() => window.open(whatsappUrl, '_blank')}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Chat with Support
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button with pulsing glow */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open(whatsappUrl, '_blank')}
                className="relative w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/20 flex items-center justify-center text-white shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-colors duration-300 group overflow-hidden"
                aria-label="Contact Support on WhatsApp"
            >
                {/* Glowing ring animation */}
                <div className="absolute inset-0 rounded-full border border-emerald-400 opacity-0 group-hover:scale-125 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
                
                {/* Custom WhatsApp SVG Icon */}
                <svg
                    className="w-7 h-7 fill-current"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.666.988 3.311 1.485 5.35 1.486 5.568 0 10.1-4.52 10.104-10.078.002-2.693-1.04-5.226-2.937-7.125C17.228 1.54 14.7.498 12.01.498c-5.568 0-10.1 4.52-10.104 10.079-.001 2.086.553 4.122 1.614 5.893l-1.006 3.674 3.754-.984zm11.33-6.852c-.346-.174-2.05-1.012-2.368-1.127-.319-.116-.551-.174-.782.174-.23.348-.892 1.127-1.093 1.358-.201.23-.403.256-.75.081-.346-.174-1.46-.539-2.784-1.72-1.03-.918-1.724-2.053-1.926-2.399-.2-.347-.021-.534.152-.707.156-.154.347-.405.52-.608.174-.203.23-.348.346-.579.117-.23.058-.433-.028-.608-.088-.174-.782-1.884-1.071-2.58-.282-.677-.568-.584-.782-.595-.202-.011-.433-.013-.665-.013-.23 0-.606.087-.923.434-.317.348-1.213 1.187-1.213 2.894 0 1.708 1.243 3.359 1.417 3.59.174.23 2.446 3.736 5.927 5.239.828.358 1.474.57 1.977.73.832.264 1.587.227 2.186.138.667-.1 2.05-.838 2.338-1.65.289-.813.289-1.506.202-1.65-.088-.145-.318-.231-.665-.405z" />
                </svg>
            </motion.button>
        </div>
    );
};

export default WhatsAppWidget;
