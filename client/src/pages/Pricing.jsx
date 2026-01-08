import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Pricing() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Toggles for Client vs Lawyer
  const [activeTab, setActiveTab] = useState(user?.role === "lawyer" ? "lawyer" : "client");

  const plans = {
    client: [
      {
        title: "Free",
        price: "0",
        features: [
          "3 Free AI Usages (Shared)",
          "Basic Lawyer Search",
          "6-Hour Trial Window"
        ],
        benefit: "For Verification",
        highlight: false,
        limitations: "Limited AI Tools"
      },
      {
        title: "Silver",
        price: "499",
        features: [
          "1 User (Individual)",
          "Full Agreement Analysis",
          "District Courts & Local Tribunals",
          "Standard Email Support",
          "Unlimited Drafting (No FIRs)"
        ],
        benefit: "Essential Legal Access",
        highlight: false,
        limitations: "No Criminal or Cybercrime support"
      },
      {
        title: "Gold",
        price: "999",
        features: [
          "State/High Courts + District Courts",
          "All cases (Criminal & Cybercrime included)",
          "Priority AI Processing",
          "Comparative Agreement Analysis",
          "Priority Chat Support"
        ],
        benefit: "Complete Protection",
        highlight: true
      },
      {
        title: "Diamond",
        price: "2499",
        features: [
          "Family Coverage (User + Spouse)",
          "Supreme Court + All Tribunals",
          "Concierge Legal Review",
          "Drafting + Human Verification",
          "24/7 Priority Manager"
        ],
        benefit: "Elite Family Coverage",
        highlight: false
      }
    ],
    lawyer: [
      {
        title: "Silver",
        price: "1000",
        features: [
          "Individual Practitioner Profile",
          "Listed for District-level queries",
          "Access to basic Civil Leads",
          "Basic Digital Signature Tools",
          "Profile visible in local searches"
        ],
        benefit: "For Starting Practice",
        highlight: false,
        limitations: "No High/Supreme Court Leads"
      },
      {
        title: "Gold",
        price: "2500",
        features: [
          "\"Verified Professional\" Badge",
          "Listed for High Court & State level",
          "Access to high-stakes Criminal Leads",
          "Advanced Legal Research Database",
          "Priority listing in search results",
          "Client Management Dashboard (CRM)"
        ],
        benefit: "Accelerate Your Growth",
        highlight: true
      },
      {
        title: "Diamond",
        price: "5000",
        features: [
          "\"Elite Partner\" Status",
          "Featured at Top of Search",
          "Global/National Lead Generation",
          "Dedicated \"Virtual Office\" Tools",
          "Direct Booking Integration",
          "Profile View Analytics & Insights"
        ],
        benefit: "Dominate Your Market",
        highlight: false
      }
    ]
  };

  /* ===================== PAYMENT HANDLER (RAZORPAY) ===================== */
  const handleBuy = async (plan, price) => {
    if (!user) {
      if (confirm("You must be logged in to purchase a plan. Go to login?")) {
        navigate("/login");
      }
      return;
    }

    if (price === "0") return;

    setLoading(true);

    try {
      // 1️⃣ CREATE ORDER (BACKEND)
      const { data } = await axios.post(
        "/api/payments/create-order",
        {
          amount_rupees: Number(price),
          plan,
          email: user.email
        }
      );

      // 2️⃣ OPEN RAZORPAY CHECKOUT
      const options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        name: "Nyay-Sathi",
        description: `${plan} Subscription`,
        order_id: data.orderId,

        handler: async function (response) {
          // 3️⃣ VERIFY PAYMENT
          const verifyRes = await axios.post(
            "/api/payments/verify",
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan,
              email: user.email,
              amount: Number(price)
            }
          );

          if (verifyRes.data.success && verifyRes.data.user) {
            updateUser(verifyRes.data.user);
          }

          navigate("/payment/success");
        },

        prefill: {
          email: user.email
        },

        theme: {
          color: "#0B1120"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open(); // 🔥 OPENS RAZORPAY (UPI / CARDS / NETBANKING)

    } catch (err) {
      console.error("PAYMENT ERROR:", err);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== UI ===================== */
  return (
    <main className="min-h-screen bg-white text-slate-900 py-24 px-6 font-sans">
      <div className="max-w-[1128px] mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-4 text-[#0B1120] tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-slate-500 text-xl font-medium">
            Choose the plan that fits your legal needs
          </p>
        </div>

        {/* ROLE TABS */}
        <div className="flex justify-center mb-16">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 border border-slate-200/50">
            <button
              onClick={() => setActiveTab("client")}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "client" ? "bg-white text-[#0B1120] shadow-md shadow-slate-200" : "text-slate-500 hover:text-slate-800"}`}
            >
              For Clients
            </button>
            <button
              onClick={() => setActiveTab("lawyer")}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "lawyer" ? "bg-white text-[#0B1120] shadow-md shadow-slate-200" : "text-slate-500 hover:text-slate-800"}`}
            >
              For Lawyers
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {plans[activeTab].map((p, i) => (
            <div
              key={i}
              className={`relative p-8 rounded-3xl border transition-all duration-300 shadow-sm flex flex-col group hover:shadow-2xl hover:shadow-blue-900/5
                ${p.highlight
                  ? "border-blue-500 ring-4 ring-blue-500/10 z-10 bg-white"
                  : "border-slate-200 bg-white"}`}
            >
              {p.highlight && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/30">
                  Most Popular
                </span>
              )}

              <h3 className="text-xl font-bold mb-3 text-[#0B1120]">{p.title}</h3>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-extrabold text-[#0B1120]">₹{p.price}</span>
                <span className="text-slate-400 mb-1 font-medium">/mo</span>
              </div>
              <p className="text-sm text-blue-600 font-bold mb-8 bg-blue-50 w-fit px-3 py-1 rounded-lg">
                {p.benefit}
              </p>

              <ul className="space-y-4 flex-1 mb-8">
                {p.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm font-medium">
                    <span className="text-blue-600 font-bold mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleBuy(p.title, p.price)}
                disabled={loading || p.price === "0" || user?.plan?.toLowerCase() === p.title.toLowerCase()}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all transform active:scale-95
                  ${user?.plan?.toLowerCase() === p.title.toLowerCase()
                    ? "bg-green-50 text-green-700 cursor-default border border-green-200"
                    : p.highlight
                      ? "bg-[#0B1120] hover:bg-blue-700 text-white shadow-lg shadow-blue-900/10"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200"
                  }
                  ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {loading
                  ? "Processing..."
                  : user?.plan?.toLowerCase() === p.title.toLowerCase()
                    ? "Current Plan"
                    : "Get Started"}
              </button>
            </div>
          ))}
        </div>

        {/* Diamond Plan All Benefits Indicator */
          user?.plan === "diamond" && (
            <div className="mt-16 p-8 bg-[#0B1120] rounded-3xl text-white text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              <h2 className="text-3xl font-bold mb-3 relative z-10">💎 Elite Status Unlocked</h2>
              <p className="text-slate-300 max-w-2xl mx-auto relative z-10">
                You have access to the most powerful legal tools in the industry. Unlimited usage, concierge support, and global access.
              </p>
            </div>
          )}
      </div>
    </main>
  );
}
