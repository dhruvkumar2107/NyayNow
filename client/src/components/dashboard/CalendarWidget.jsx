import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CalendarWidget({ user }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchEvents();
    }, [user]);

    const fetchEvents = async () => {
        try {
            const uId = user._id || user.id;
            const res = await axios.get(`/api/events?userId=${uId}`);
            setEvents(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed calendar fetch");
        }
    };

    const today = new Date();

    return (
        <div className="bg-[#0f172a] rounded-xl border border-white/10 shadow-sm p-5 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white">Your Schedule</h3>
                <button className="text-xs text-blue-400 font-bold hover:text-blue-300 transition">+ Add Event</button>
            </div>

            {loading ? <div className="animate-pulse bg-white/5 h-32 rounded-lg"></div> : (
                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                    {events.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-3xl mb-2 opacity-50">📅</div>
                            <p className="text-slate-500 text-xs">No events scheduled.</p>
                        </div>
                    ) : (
                        events.map(ev => (
                            <div key={ev._id} className="flex gap-3 items-start p-2 hover:bg-white/5 rounded-lg transition border-l-2 border-l-blue-500 pl-3">
                                <div className="flex-col text-center min-w-[40px]">
                                    <span className="block text-xs font-bold text-slate-500">{new Date(ev.start).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="block text-lg font-black text-white leading-none">{new Date(ev.start).getDate()}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-200 text-sm line-clamp-1">{ev.title}</h4>
                                    <p className="text-[10px] text-slate-500">{new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {ev.type}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
