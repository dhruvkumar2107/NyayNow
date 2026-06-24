'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email) return toast.error("Email is required")
        
        setLoading(true)
        try {
            await axios.post('/api/auth/forgot-password', { email })
            setSubmitted(true)
            toast.success("Reset link sent to your email!")
        } catch (err) {
            console.error(err)
            toast.error(err.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#1e293b,transparent)] pointer-events-none opacity-50"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-midnight-900 border border-white/10 p-8 rounded-[2rem] shadow-2xl relative z-10 backdrop-blur-xl"
            >
                <div className="text-center space-y-3 mb-10">
                    <h1 className="text-3xl font-black text-white tracking-tight italic">NYAY<span className="text-gold-500">NOW</span>.</h1>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Recover Account</h2>
                    <p className="text-slate-400 text-sm font-medium">Enter your email to receive a secure reset link.</p>
                </div>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:border-gold-500/50 outline-none transition-all duration-300 font-medium" 
                                placeholder="lawyer@example.com"
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-gold-500 to-yellow-600 text-midnight-950 font-black text-sm uppercase tracking-widest rounded-2xl hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-gold-500/10"
                        >
                            {loading ? "Verifying..." : "Send Reset Link"}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-6 space-y-6">
                        <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto text-gold-500 border border-gold-500/20">
                            <span className="text-3xl">✉️</span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-white font-bold text-lg">Check your inbox</p>
                            <p className="text-slate-400 text-sm leading-relaxed px-4">If an account exists for {email}, you'll receive a password reset link shortly.</p>
                        </div>
                        <button 
                            onClick={() => setSubmitted(false)}
                            className="text-gold-500 font-bold text-xs uppercase tracking-widest hover:underline"
                        >
                            Didn't get it? Try again
                        </button>
                    </div>
                )}

                <div className="mt-10 pt-8 border-t border-white/5 text-center">
                    <Link href="/login" className="text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2 group">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Login
                    </Link>
                </div>
            </motion.div>
        </main>
    )
}
