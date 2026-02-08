import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

export default function Pricing() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(user?.role === "lawyer" ? "lawyer" : "client");

  const plans = {
    client: [
      {
        title: "Free", price: "0",
        features: ["3 Free AI Usages", "Basic Lawyer Search", "Standard Support"],
        benefit: "For Verification", highlight: false
      },
      {
        title: "Silver", price: "499",
        features: ["1 User", "Full Agreement Analysis", "District Courts Access", "Unlimited Drafting"],
        benefit: "Essential Access", highlight: false
      },
      {
        title: "Gold", price: "999",
        features: ["State/High Courts", "Priority AI Processing", "Comparisons", "Moot VR Access"],
        benefit: "Complete Protection", highlight: true
      },
      {
        title: "Diamond", price: "2499",
        features: ["Family Coverage", "Supreme Court Access", "Concierge Review", "Real-time eCourt Sync"],
        benefit: "Elite Status", highlight: false
      }
    ],
    lawyer: [
      {
        title: "Silver", price: "1000",
        features: ["Individual Profile", "District Queries", "Basic Leads", "Digital Signature"],
        benefit: "For Starters", highlight: false
      },
      {
        title: "Gold", price: "2500",
        features: ["Verified Badge", "High Court Listings", "Criminal Leads", "CRM Access"],
        benefit: "For Growth", highlight: true
      },
      {
        title: "Diamond", price: "5000",
        features: ["Elite Partner Status", "Top of Search", "National Leads", "Virtual Office"],
        benefit: "Market Dominance", highlight: false
      }
    ]
  };

  const handleBuy = async (plan, price) => {
    if (!user) {
      if (window.confirm("Please login to purchase.")) navigate("/login");
      return;
    }
    if (price === "0") return;
    setLoading(true);
    try {
      const { data } = await axios.post("/api/payments/create-order", { amount_rupees: Number(price), plan, email: user.email });
      const options = {
        key: data.key, amount: data.amount, currency: "INR", name: "NyayNow", description: `${plan} Plan`, order_id: data.orderId,
        handler: async function (response) {
          const verifyRes = await axios.post("/api/payments/verify", {
            razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature,
            plan, email: user.email, amount: Number(price)
          });
          if (verifyRes.data.success && verifyRes.data.user) updateUser(verifyRes.data.user);
          navigate("/payment/success");
        },
        prefill: { email: user.email }, theme: { color: "#0B1120" }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-32 text-center">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-16">
          <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Simple, Transparent Pricing.</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">Investment in legal security is investment in peace of mind.</p>
        </motion.div>

        {/* TOGGLE */}
        <div className="flex justify-center mb-16">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex relative">
            <button onClick={() => setActiveTab('client')} className={`relative z-10 px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'client' ? "text-slate-900" : "text-slate-400"}`}>Client Plans</button>
            <button onClick={() => setActiveTab('lawyer')} className={`relative z-10 px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'lawyer' ? "text-slate-900" : "text-slate-400"}`}>Lawyer Plans</button>
            <motion.div
              layoutId="activeTab"
              className="absolute top-1.5 bottom-1.5 rounded-xl bg-slate-100 shadow-inner"
              initial={false}
              animate={{
                left: activeTab === 'client' ? '6px' : '50%',
                width: 'calc(50% - 9px)'
              }}
            />
          </div>
        </div>

        {/* PLANS GRID */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
          {plans[activeTab].map((p, i) => (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className={`relative p-8 rounded-3xl border flex flex-col items-center text-center transition-all duration-300
                    ${p.highlight
                  ? "bg-slate-900 text-white border-slate-900 shadow-2xl scale-105 z-10"
                  : "bg-white text-slate-900 border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1"}`}
            >
              {p.highlight && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">Most Popular</div>}

              <h3 className="text-lg font-bold mb-4 opacity-80">{p.title}</h3>
              <div className="text-5xl font-black mb-2">₹{p.price}</div>
              <p className={`text-sm mb-8 font-medium ${p.highlight ? "text-blue-400" : "text-blue-600"}`}>{p.benefit}</p>

              <ul className="space-y-4 mb-8 flex-1 w-full text-left">
                {p.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-medium opacity-80">
                    <span className={p.highlight ? "text-blue-400" : "text-blue-600"}>✓</span> {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleBuy(p.title, p.price)}
                disabled={loading || p.price === "0" || user?.plan?.toLowerCase() === p.title.toLowerCase()}
                className={`w-full py-4 rounded-xl font-bold text-sm transition-transform active:scale-95 ${p.highlight
                  ? "bg-white text-slate-900 hover:bg-slate-100"
                  : "bg-slate-900 text-white hover:bg-slate-800"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? "Processing..." : user?.plan?.toLowerCase() === p.title.toLowerCase() ? "Current Plan" : "Get Started"}
              </button>
            </motion.div>
          ))}
        </div>

        {user?.plan === "diamond" && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-16 p-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <h2 className="text-3xl font-bold mb-2">💎 Elite Membership Active</h2>
                <p className="text-blue-100">You have unlocked the full potential of NyayNow. Enjoy!</p>
              </div>
              <button onClick={() => navigate('/dashboard')} className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition">Go to Dashboard</button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
