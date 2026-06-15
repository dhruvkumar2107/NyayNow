import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE } from "../../config";

export default function BookingModal({ lawyer, client, onClose }) {
    const [date, setDate] = useState("");
    const [slot, setSlot] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [bookedSlots, setBookedSlots] = useState([]);

    // Real available slots
    const TIME_SLOTS = ["10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"];

    // Fetch booked slots when date changes
    React.useEffect(() => {
        if (date && lawyer._id) {
            axios.get(`/api/appointments/booked-slots?lawyerId=${lawyer._id}&date=${date}`)
                .then(res => setBookedSlots(res.data))
                .catch(err => console.error("Failed to fetch slots", err));
        }
    }, [date, lawyer._id]);

    const loadScript = (src) => {
        return new Promise((resolve) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                return resolve(true);
            }
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleBook = async () => {
        if (!date || !slot) return toast.error("Please select date and time");

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // 1. Create pending appointment
            const res = await axios.post("/api/appointments", {
                clientId: client._id || client.id,
                lawyerId: lawyer._id,
                date,
                slot,
                notes
            }, { headers });

            const appointment = res.data;
            const feeAmount = appointment.fee || 0;

            if (feeAmount > 0) {
                // 2. Launch Razorpay payment
                const sdkLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
                if (!sdkLoaded) {
                    toast.error("Razorpay SDK failed to load.");
                    setLoading(false);
                    return;
                }



                // Create Razorpay order
                const orderRes = await fetch(`${API_BASE}/payments/create-order`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { Authorization: `Bearer ${token}` })
                    },
                    body: JSON.stringify({ amount_rupees: feeAmount, plan: `appointment_${appointment._id}` })
                });

                if (!orderRes.ok) {
                    const errText = await orderRes.text();
                    throw new Error(`Failed to create order: ${orderRes.status} ${errText}`);
                }

                const orderData = await orderRes.json();

                const options = {
                    key: orderData.key,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: "NyayNow",
                    description: `Consultation Booking with ${lawyer.name}`,
                    order_id: orderData.orderId,
                    handler: async function (paymentResponse) {
                        toast.loading("Verifying payment...", { id: "payment-toast" });
                        try {
                            const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...(token && { Authorization: `Bearer ${token}` })
                                },
                                body: JSON.stringify({
                                    razorpay_order_id: paymentResponse.razorpay_order_id,
                                    razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                    razorpay_signature: paymentResponse.razorpay_signature,
                                    plan: `appointment_${appointment._id}`,
                                    amount: feeAmount
                                })
                            });

                            const verifyData = await verifyRes.json();
                            if (verifyData.success) {
                                toast.success(`Appointment confirmed and paid!`, { id: "payment-toast", duration: 5000 });
                                onClose();
                            } else {
                                toast.error("Payment verification failed", { id: "payment-toast" });
                            }
                        } catch (err) {
                            console.error("Verification Error:", err);
                            toast.error("Error verifying payment", { id: "payment-toast" });
                        }
                    },
                    prefill: {
                        name: client?.name || "",
                        email: client?.email || "",
                        contact: client?.phone || ""
                    },
                    theme: {
                        color: "#6366f1"
                    }
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();
            } else {
                toast.success(`Appointment requested with ${lawyer.name}!`);
                onClose();
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || err.message || "Booking failed");
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
                            onChange={e => {
                                setDate(e.target.value);
                                setSlot(""); // Reset slot on date change
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Select Time Slot</label>
                        <div className="grid grid-cols-3 gap-2">
                            {TIME_SLOTS.map(t => {
                                const isBooked = bookedSlots.includes(t);
                                return (
                                    <button
                                        key={t}
                                        onClick={() => setSlot(t)}
                                        disabled={isBooked || !date}
                                        className={`py-2 text-xs font-medium rounded-lg border transition ${slot === t
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20"
                                            : isBooked
                                                ? "bg-[#020617] text-slate-600 border-white/5 cursor-not-allowed decoration-slice line-through"
                                                : "bg-[#020617] text-slate-300 border-white/10 hover:bg-white/5 hover:text-white"
                                            }`}
                                    >
                                        {t}
                                    </button>
                                );
                            })}
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
