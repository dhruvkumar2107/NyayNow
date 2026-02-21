import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Calendar as CalendarIcon, Clock, ChevronRight, Video, RefreshCw } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Calendar() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) fetchAppointments();
    }, [user]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/appointments?userId=${user._id || user.id}&role=${user.role}`);
            const mapped = res.data.map(apt => ({
                id: apt._id,
                title: user.role === 'lawyer' ? `Meeting with ${apt.clientId?.name || 'Client'}` : `Consultation: ${apt.lawyerId?.name || 'Lawyer'}`,
                date: apt.date,
                time: apt.slot,
                status: apt.status
            }));
            if (mapped.length === 0) {
                setEvents([]);
            } else {
                setEvents(mapped);
            }
        } catch (err) {
            console.error("Failed to fetch appointments");
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] font-sans text-slate-400">
            <Navbar />
            <div className="px-6 py-12 pt-28">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 font-serif">Command Center Calendar</h1>
                        <p className="text-slate-400">Manage your hearings, consultations, and deadlines.</p>
                    </div>
                    <button
                        onClick={fetchAppointments}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Sync
                    </button>
                </header>

                <div className="grid lg:grid-cols-12 gap-8 h-[600px]">

                    {/* LEFT: CALENDAR GRID (7 Cols) */}
                    <div className="lg:col-span-7 bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-xl text-white">February 2026</h2>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-slate-400 transition">←</button>
                                <button className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-slate-400 transition">→</button>
                            </div>
                        </div>

                        {/* Calendar Header */}
                        <div className="grid grid-cols-7 gap-2 mb-4 text-center">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <div key={d} className="text-xs font-bold text-slate-500 uppercase tracking-widest">{d}</div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-2 flex-1">
                            {/* Empty days padding */}
                            {[...Array(4).keys()].map(i => <div key={`e-${i}`} className="opacity-0"></div>)}

                            {[...Array(28).keys()].map(index => {
                                const day = index + 1;
                                // Check if this day has any events
                                const dateString = `2026-02-${day.toString().padStart(2, '0')}`;
                                const hasEvent = events.some(e => e.date.includes(dateString));
                                const isToday = day === 15; // Keeping today fixed for demo or use new Date()

                                return (
                                    <div key={day} className={`
                                        relative rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5 transition cursor-pointer flex flex-col items-center justify-center
                                        ${isToday ? 'bg-indigo-600/20 border-indigo-500/50' : ''}
                                    `}>
                                        <span className={`text-lg font-medium ${isToday ? 'text-indigo-400 font-bold' : hasEvent ? 'text-white' : 'text-slate-500'}`}>{day}</span>
                                        {hasEvent && <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-1 shadow-[0_0_5px_rgba(250,204,21,0.8)]"></div>}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* RIGHT: UPCOMING FEED (5 Cols) */}
                    <div className="lg:col-span-5 flex flex-col gap-6">

                        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-3xl p-6 border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><CalendarIcon size={120} /></div>
                            <p className="text-indigo-300 font-bold uppercase text-xs tracking-wider mb-1">Up Next</p>
                            <h3 className="text-2xl font-bold text-white mb-4">Case Strategy Session</h3>
                            <div className="flex items-center gap-4 text-sm text-slate-300 mb-6">
                                <span className="flex items-center gap-2"><Clock size={16} /> 10:00 AM - 11:00 AM</span>
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase rounded">Confirmed</span>
                            </div>
                            <button className="w-full py-3 bg-white text-midnight-900 font-bold rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-2">
                                <Video size={18} /> Join Virtual Court
                            </button>
                        </div>

                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex-1 overflow-y-auto custom-scrollbar">
                            <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-4">Upcoming Schedule</h3>
                            <div className="space-y-3">
                                {events.map((ev) => (
                                    <div key={ev.id} className="p-4 rounded-xl bg-black/20 border border-white/5 hover:border-indigo-500/30 transition group cursor-pointer flex justify-between items-center">
                                        <div>
                                            <h4 className="font-bold text-slate-200 group-hover:text-white transition">{ev.title}</h4>
                                            <p className="text-xs text-slate-500 mt-1">{ev.date} • {ev.time}</p>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition group-hover:translate-x-1" />
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
}
