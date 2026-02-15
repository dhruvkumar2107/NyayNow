import { useState } from "react";
import axios from "axios";

export default function BookingModal({ lawyer, client, onClose }) {
    const [date, setDate] = useState("");
    const [slot, setSlot] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    // Mock available slots
    const TIME_SLOTS = ["10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"];

    const handleBook = async () => {
        if (!date || !slot) return alert("Please select date and time");

        setLoading(true);
        try {
            await axios.post("/api/appointments", {
                clientId: client._id || client.id,
                lawyerId: lawyer._id,
                date,
                slot,
                notes
            });
            alert(`Appointment requested with ${lawyer.name}!`);
            onClose();
        } catch (err) {
            alert(err.response?.data?.error || "Booking failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition">✕</button>

                <h2 className="text-xl font-bold text-white mb-1">Book Appointment</h2>
                <p className="text-sm text-slate-400 mb-6">Schedule a consultation with {lawyer.name}</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Select Date</label>
                        <input
                            type="date"
                            className="w-full bg-[#020617] border border-white/10 rounded-lg p-3 outline-none focus:border-indigo-500 text-white placeholder:text-slate-600"
                            min={new Date().toISOString().split("T")[0]}
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Select Time Slot</label>
                        <div className="grid grid-cols-3 gap-2">
                            {TIME_SLOTS.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setSlot(t)}
                                    className={`py-2 text-xs font-medium rounded-lg border transition ${slot === t
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20"
                                        : "bg-[#020617] text-slate-300 border-white/10 hover:bg-white/5 hover:text-white"
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Notes (Optional)</label>
                        <textarea
                            rows={2}
                            className="w-full bg-[#020617] border border-white/10 rounded-lg p-3 outline-none focus:border-indigo-500 resize-none text-white placeholder:text-slate-600"
                            placeholder="Briefly describe your issue..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleBook}
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                    >
                        {loading ? "Booking..." : "Confirm Booking"}
                    </button>
                </div>
            </div>
        </div>
    );
}
