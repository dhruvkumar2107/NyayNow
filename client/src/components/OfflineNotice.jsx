'use client'

import React, { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export default function OfflineNotice() {
    const [isOffline, setIsOffline] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const handleOnline = () => setIsOffline(false)
        const handleOffline = () => setIsOffline(true)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Set initial state
        setIsOffline(!navigator.onLine)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (!isOffline) return null

    return (
        <div className="fixed bottom-6 left-6 z-[999] max-w-sm bg-red-950/95 border border-red-500/30 text-red-200 p-4 rounded-xl shadow-2xl backdrop-blur-md flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <WifiOff className="text-red-400 flex-shrink-0 mt-0.5" size={20} aria-hidden="true" />
            <div className="space-y-1">
                <h4 className="font-bold text-sm text-white">Connection Interrupted</h4>
                <p className="text-xs text-slate-400 leading-normal">
                    You are currently offline. Some features like the AI Assistant and Lawyer Marketplace may not work. We'll automatically reconnect once network returns.
                </p>
                <div className="pt-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Check server status: <a href="https://status.nyaynow.in" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">status.nyaynow.in</a>
                </div>
            </div>
        </div>
    )
}
