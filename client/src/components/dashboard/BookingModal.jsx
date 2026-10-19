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
                        color: "#C9A24B"
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="mi-glass-card animate-in fade-in zoom-in relative w-full max-w-md rounded-[var(--radius-lg)] p-6 shadow-2xl duration-200">
                <button onClick={onClose} className="absolute right-4 top-4 text-[var(--text-muted)] transition hover:text-[var(--text)]">✕</button>

                <h2 className="mi-body mb-1 text-xl font-bold text-[var(--text)]">Book Appointment</h2>
                <p className="mb-6 text-sm text-[var(--text-muted)]">Schedule a consultation with {lawyer.name}</p>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-[var(--text-muted)]">Select Date</label>
                        <input
                            type="date"
                            className="mi-focus w-full rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--bg)] p-3 text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
                            min={new Date().toISOString().split("T")[0]}
                            value={date}
                            onChange={e => {
                                setDate(e.target.value);
                                setSlot(""); // Reset slot on date change
                            }}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-[var(--text-muted)]">Select Time Slot</label>
                        <div className="grid grid-cols-3 gap-2">
                            {TIME_SLOTS.map(t => {
                                const isBooked = bookedSlots.includes(t);
                                return (
                                    <button
                                        key={t}
                                        onClick={() => setSlot(t)}
                                        disabled={isBooked || !date}
                                        className={`mi-focus rounded-[var(--radius-sm)] border py-2 text-xs font-medium transition ${slot === t
                                            ? "border-[var(--gold)] bg-[var(--gold)] text-[#0B1220] shadow-lg"
                                            : isBooked
                                                ? "cursor-not-allowed border-[var(--gold-hairline)] bg-[var(--bg)] text-[var(--text-muted)] line-through"
                                                : "border-[var(--gold-hairline)] bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--surface-2)]"
                                            }`}
                                    >
                                        {t}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-[var(--text-muted)]">Notes (Optional)</label>
                        <textarea
                            rows={2}
                            className="mi-focus w-full resize-none rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--bg)] p-3 text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
                            placeholder="Briefly describe your issue..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleBook}
                        disabled={loading}
                        className="mi-tap mi-focus w-full rounded-[var(--radius-md)] bg-[var(--gold)] py-3 font-semibold text-[#0B1220] shadow-lg transition hover:brightness-110 disabled:opacity-50"
                    >
                        {loading ? "Booking..." : "Confirm Booking"}
                    </button>
                </div>
            </div>
        </div>
    );
}
