'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { Shield, CreditCard, Calendar, FileText, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function InvoicePaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  const invoiceId = params?.id;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?redirect=/payment/${invoiceId}`);
      return;
    }

    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/invoices/${invoiceId}`);
        setInvoice(res.data);
      } catch (err) {
        console.error("Fetch invoice error:", err);
        setError(err.response?.data?.error || "Failed to load invoice details.");
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId, user, authLoading, router]);

  const loadScript = (src) => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && document.querySelector(`script[src="${src}"]`)) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!invoice) return;
    setPaying(true);
    const toastId = toast.loading("Initiating payment secure session...");

    try {
      const sdkLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!sdkLoaded) {
        toast.error("Razorpay SDK failed to load. Please check your internet connection.", { id: toastId });
        setPaying(false);
        return;
      }

      // 1. Create order in the backend
      const orderRes = await axios.post(`/api/payments/create-order`, {
        plan: `invoice_${invoice._id}`
      });

      const orderData = orderRes.data;

      // 2. Open Razorpay Checkout modal
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "NyayNow Secure Escrow",
        description: invoice.description || "Legal Services Invoice",
        order_id: orderData.orderId,
        handler: async function (paymentResponse) {
          toast.loading("Verifying payment transaction...", { id: toastId });
          try {
            const verifyRes = await axios.post(`/api/payments/verify`, {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature
            });

            if (verifyRes.data.success) {
              toast.success("Payment authorized successfully!", { id: toastId, duration: 5000 });
              router.push("/payment/success");
            } else {
              toast.error("Transaction verification failed.", { id: toastId });
            }
          } catch (err) {
            console.error("Verification Error:", err);
            toast.error(err.response?.data?.error || "Error verifying payment signature.", { id: toastId });
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: {
          color: "#fbbf24" // Amber/Gold color matching premium logo
        },
        modal: {
          ondismiss: function () {
            toast.dismiss(toastId);
            setPaying(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      toast.dismiss(toastId);
    } catch (err) {
      console.error("Payment setup error:", err);
      toast.error(err.response?.data?.error || "Payment initiation failed.", { id: toastId });
      setPaying(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center font-sans text-slate-300">
        <div className="w-12 h-12 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Loading Secure Transaction...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2rem] max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Transaction Error</h1>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">{error || "Invoice not found or unauthorized access."}</p>
          <button
            onClick={() => router.push(user?.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard")}
            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            <ArrowLeft size={16} /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (invoice.status === "paid") {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2rem] max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-6 border border-emerald-500/20">
            <CheckCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Already Paid</h1>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">This invoice has already been settled and marked as paid.</p>
          <button
            onClick={() => router.push(user?.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard")}
            className="w-full py-4 bg-gradient-to-r from-gold-500 to-yellow-600 text-midnight-950 font-bold rounded-xl transition flex items-center justify-center gap-2 text-sm uppercase tracking-wider hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            Return to Dashboard <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-gold-500/30 overflow-x-hidden relative flex flex-col justify-center items-center py-16 px-4">
      {/* Ambience background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-gold-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <button
          onClick={() => router.push(user?.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard")}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition mb-6"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
          {/* Header Banner */}
          <div className="p-8 bg-gradient-to-r from-gold-500/10 to-indigo-500/10 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-[10px] font-black uppercase tracking-wider mb-2">
                <Shield size={10} /> Secure Escrow Authorization
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Contract Payment</h1>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Invoice Reference</span>
              <p className="font-mono text-sm text-indigo-300">#{invoice._id.toUpperCase()}</p>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Assigned Legal Counsel</span>
                <p className="text-white font-bold text-lg">{invoice.clientName ? "Professional Advocate Services" : "Legal Advisor"}</p>
                <span className="text-xs text-slate-400">Verified NyayNow Partner</span>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Due Date</span>
                  <p className="text-white font-bold text-sm flex items-center gap-2">
                    <Calendar size={14} className="text-gold-400" />
                    {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "Immediate"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Service / Agreement Description</span>
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-slate-400 mt-0.5" />
                <p className="text-sm text-slate-300 leading-relaxed font-light">{invoice.description}</p>
              </div>
            </div>

            {/* Amount Summary */}
            <div className="p-6 bg-gradient-to-br from-midnight-950/50 to-midnight-900/50 rounded-2xl border border-white/5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Settlement Amount</span>
                <span className="text-xs text-slate-400">Includes all secure escrow transaction fees</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white tracking-tight">₹{invoice.amount.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-400 block font-bold">🔒 Escrow Protected</span>
              </div>
            </div>

            {/* Privacy note */}
            <p className="text-[10px] text-slate-500 leading-relaxed text-center">
              Payments are held securely and released only on terms agreed under the contract. In case of disputes, arbitration can be raised under NyayNow Dispute Center.
            </p>
          </div>

          {/* Action Footer */}
          <div className="p-8 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield size={24} className="text-gold-500" />
              <div className="text-left">
                <p className="text-xs text-white font-bold">128-bit Encryption</p>
                <p className="text-[10px] text-slate-500">Secure gateway powered by Razorpay</p>
              </div>
            </div>
            
            <button
              onClick={handlePayment}
              disabled={paying}
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-gold-500 to-yellow-600 text-midnight-950 font-black rounded-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-200 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              {paying ? (
                <>
                  <div className="w-4 h-4 border-2 border-midnight-950 border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={16} /> Pay Invoice
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
