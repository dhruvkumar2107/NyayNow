'use client'
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Star, X, Zap, Loader2, Sparkles, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";

export default function PaywallModal({ isOpen, onClose, title = "Upgrade to Access", feature = "premium tools" }) {
  const { user } = useAuth();
  const [loadingPack, setLoadingPack] = useState(null);

  if (!isOpen) return null;

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

  const handleBuyCredits = async (packName, priceRupees) => {
    if (!user) {
      toast.error("Please log in to purchase credits.");
      setTimeout(() => window.location.href = '/login', 1200);
      return;
    }

    setLoadingPack(packName);
    toast.loading(`Initiating credit purchase...`, { id: 'credit-toast' });

    try {
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!res) {
        toast.error("Razorpay SDK failed to load.", { id: 'credit-toast' });
        setLoadingPack(null);
        return;
      }

      const token = localStorage.getItem("token");
      const orderRes = await fetch(`${API_BASE}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ amount_rupees: priceRupees, plan: packName })
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
        description: `Purchase ${packName.replace('credits_', '')} Credits`,
        order_id: orderData.orderId,
        handler: async function (response) {
          toast.loading("Verifying payment...", { id: "credit-toast" });
          try {
            const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: packName,
                amount: priceRupees
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              toast.success(`Credits added to your account!`, { id: "credit-toast", duration: 5000 });
              setTimeout(() => window.location.reload(), 1500);
            } else {
              toast.error("Payment verification failed", { id: "credit-toast" });
            }
          } catch (err) {
            console.error("Verification Error:", err);
            toast.error("Error verifying payment", { id: "credit-toast" });
          } finally {
            setLoadingPack(null);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: {
          color: "#6366f1"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      toast.dismiss('credit-toast');
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Payment initiation failed", { id: 'credit-toast' });
      setLoadingPack(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-midnight-950/80 backdrop-blur-lg" onClick={onClose}></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-[#020617] border border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        {/* Decorative Gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 p-10 md:p-12 text-center">
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition"><X /></button>

          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-indigo-500/20 text-3xl">
            ⚖️
          </div>

          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{title}</h2>
          <p className="text-slate-400 text-sm mb-8 max-w-lg mx-auto leading-relaxed">
            You need query credits or an upgraded subscription plan to unlock access to <span className="text-white font-bold">{feature}</span>.
          </p>

          {/* Monetization Options */}
          <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all">
              <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">Pay-Per-Use</h3>
              <div className="text-2xl font-bold text-white mb-3">₹99 <span className="text-slate-500 text-xs">/ draft</span></div>
              <p className="text-slate-500 text-[11px] leading-tight mb-4">Perfect for drafting a single official rent agreement or legal contract immediately.</p>
              <button 
                onClick={() => handleBuyCredits("credits_1", 99)}
                disabled={loadingPack !== null}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                {loadingPack === "credits_1" ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Buy 1 Draft Credit
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-bl-lg uppercase">Best Value</div>
              <h3 className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">Query Credits Pack</h3>
              <div className="text-2xl font-bold text-white mb-3">₹199 <span className="text-slate-500 text-xs">/ 20 queries</span></div>
              <p className="text-slate-500 text-[11px] leading-tight mb-4">Get 20 high-priority legal research & drafting queries. Credits do not expire.</p>
              <button 
                onClick={() => handleBuyCredits("credits_20", 199)}
                disabled={loadingPack !== null}
                className="w-full py-2 bg-gradient-to-r from-amber-400 to-amber-600 disabled:opacity-50 text-black font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                {loadingPack === "credits_20" ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                Buy 20 Credits Pack
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/pricing"
              onClick={onClose}
              className="bg-white text-black hover:bg-slate-200 w-full py-3 rounded-xl font-bold text-sm tracking-wide transition shadow-lg shadow-white/5 flex items-center justify-center gap-2"
            >
              Start Unlimited Subscription (Pro/Firm) <ArrowRight size={16} />
            </Link>
            <button onClick={onClose} className="text-slate-500 hover:text-white font-bold text-xs uppercase tracking-wider transition">
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
