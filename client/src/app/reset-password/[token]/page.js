'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
    const params = useParams()
    const router = useRouter()
    const token = typeof params?.token === 'string' ? params.token : ''

    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!token) return toast.error("This reset link is missing its token.")
        if (password.length < 8) return toast.error("Password must be at least 8 characters")
        if (password !== confirm) return toast.error("Passwords do not match")

        setLoading(true)
        try {
            await axios.post('/api/auth/reset-password', { token, newPassword: password })
            setDone(true)
            toast.success("Password updated! Please log in.")
        } catch (err) {
            const msg = err.response?.data?.message ||
                err.response?.data?.error ||
                "Reset link is invalid or has expired. Please request a new one."
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#1e293b,transparent)] pointer-events-none opacity-50"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-midnight-900 border border-white/10 p-8 rounded-[2rem] shadow-2xl relative z-10 backdrop-blur-xl"
            >
                <div className="text-center space-y-3 mb-10">
                    <h1 className="text-3xl font-black text-white tracking-tight italic">NYAY<span className="text-gold-500">NOW</span>.</h1>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Set New Password</h2>
                    <p className="text-slate-400 text-sm font-medium">Choose a new password for your account.</p>
                </div>

                {!token && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-2xl p-4 mb-6 text-center">
                        This reset link is incomplete. Please open the link from your email again, or
                        <Link href="/forgot-password" className="text-gold-500 font-bold underline ml-1">request a new one</Link>.
                    </div>
                )}

                {!done ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">New Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:border-gold-500/50 outline-none transition-all duration-300 font-medium"
                                placeholder="At least 8 characters"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:border-gold-500/50 outline-none transition-all duration-300 font-medium"
                                placeholder="Repeat password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !token}
                            className="w-full py-4 bg-gradient-to-r from-gold-500 to-yellow-600 text-midnight-950 font-black text-sm uppercase tracking-widest rounded-2xl hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-gold-500/10"
                        >
                            {loading ? "Updating..." : "Reset Password"}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-6 space-y-6">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/20">
                            <span className="text-3xl">✓</span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-white font-bold text-lg">Password updated</p>
                            <p className="text-slate-400 text-sm leading-relaxed px-4">Your password has been changed and any existing sessions were signed out.</p>
                            <button
                                onClick={() => router.push('/login')}
                                className="mt-2 px-6 py-3 bg-gold-500 text-midnight-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gold-400 transition"
                            >
                                Go to Login
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-10 pt-8 border-t border-white/5 text-center">
                    <Link href="/login" className="text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">← Back to Login</Link>
                </div>
            </motion.div>
        </main>
    )
}
