import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function CalendarWidget({ user }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = useCallback(async () => {
        if (!user) return;
        try {
            const uId = user._id || user.id;
            const res = await axios.get(`/api/events?userId=${uId}`);
            setEvents(res.data);
        } catch (err) {
            console.error("Failed calendar fetch");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const today = new Date();

    return (
        <div className="flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/40 p-5">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-[var(--text)]">Your Schedule</h3>
                <button className="text-xs font-semibold text-[var(--gold)] transition hover:text-[var(--gold-soft)]">+ Add Event</button>
            </div>

            {loading ? <div className="h-32 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-2)]/60"></div> : (
                <div className="mi-scroll flex-1 space-y-3 overflow-y-auto">
                    {events.length === 0 ? (
                        <div className="py-8 text-center">
                            <div className="mb-2 text-3xl opacity-50">📅</div>
                            <p className="text-xs text-[var(--text-muted)]">No events scheduled.</p>
                        </div>
                    ) : (
                        events.map(ev => (
                            <div key={ev._id} className="flex items-start gap-3 rounded-[var(--radius-sm)] border-l-2 border-l-[var(--gold)] py-2 pl-3 pr-2 transition hover:bg-[var(--surface-2)]/60">
                                <div className="min-w-[40px] flex-col text-center">
                                    <span className="block text-xs font-bold text-[var(--text-muted)]">{new Date(ev.start).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="block text-lg font-bold leading-none text-[var(--text)]">{new Date(ev.start).getDate()}</span>
                                </div>
                                <div>
                                    <h4 className="line-clamp-1 text-sm font-semibold text-[var(--text)]">{ev.title}</h4>
                                    <p className="text-[10px] text-[var(--text-muted)]">{new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {ev.type}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
