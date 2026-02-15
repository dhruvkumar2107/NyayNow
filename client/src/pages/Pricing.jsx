import React, { useState } from 'react';
import Navbar from '../components/Navbar';

import { motion } from 'framer-motion';
import { Check, Star, Zap, Shield } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Pricing = () => {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [userType, setUserType] = useState('client'); // 'client' | 'lawyer'

  const handleUpgrade = async (plan, price) => {
    if (!user) return alert("Please login first");
    try {
      alert(`Initiating upgrade to ${plan} Plan for ${userType === 'client' ? 'Clients' : 'Lawyers'}`);
    } catch (error) {
      console.error(error);
    }
  };

  const clientPlans = [
    {
      title: "Basic",
      price: "Free",
      desc: "Essential legal help for everyone.",
      features: ['Basic Legal Q&A (5/day)', 'Access to Marketplace', 'Standard Support'],
      icon: <Shield className="text-slate-400" />
    },
    {
      title: "Pro",
      price: billingCycle === 'monthly' ? "₹499" : "₹4,999",
      period: billingCycle === 'monthly' ? "/mo" : "/yr",
      desc: "For individuals needing regular advice.",
      features: ['Unlimited AI Chat', 'Document Drafting (5/mo)', 'Priority Support', 'Legal Research Access'],
      highlight: true,
      popular: true,
      icon: <Zap className="text-white" />
    },
    {
      title: "Premium",
      price: billingCycle === 'monthly' ? "₹1,499" : "₹14,999",
      period: billingCycle === 'monthly' ? "/mo" : "/yr",
      desc: "Complete family legal protection.",
      features: ['Everything in Pro', 'Lawyer Consulation (1/mo)', 'Agreement Review', 'Dedicated Manager'],
      special: true,
      icon: <Star className="text-amber-400" />
    }
  ];

  const lawyerPlans = [
    {
      title: "Starter",
      price: "Free",
      desc: "Build your digital presence.",
      features: ['Basic Profile Listing', 'Accept Client Inquiries', 'Access to Forum'],
      icon: <Shield className="text-slate-400" />
    },
    {
      title: "Professional",
      price: billingCycle === 'monthly' ? "₹1,999" : "₹19,999",
      period: billingCycle === 'monthly' ? "/mo" : "/yr",
      desc: "Grow your practice with verified leads.",
      features: ['Verified Badge', '10 Qualified Leads/mo', 'Case Management Tool', 'Priority Support'],
      highlight: true,
      popular: true,
      icon: <Zap className="text-white" />
    },
    {
      title: "Elite",
      price: billingCycle === 'monthly' ? "₹4,999" : "₹49,999",
      period: billingCycle === 'monthly' ? "/mo" : "/yr",
      desc: "Dominate your legal niche.",
      features: ['Top Ranking in Search', 'Unlimited Leads', 'AI Paralegal Access', 'Moot Court VR Access'],
      special: true,
      icon: <Star className="text-amber-400" />
    }
  ];

  const plans = userType === 'client' ? clientPlans : lawyerPlans;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-400 font-sans selection:bg-indigo-500/30">
      <Navbar />

      {/* HERO */}
      <div className="pt-32 pb-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
        <div className="relative z-10 px-6">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-white">Invest in Your Legal Security.</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Choose the plan that fits your needs. Whether you are seeking justice or delivering it.
          </p>

          {/* USER TYPE TOGGLE */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-[#0f172a] border border-white/10 p-1 rounded-xl shadow-inner">
              <button
                onClick={() => setUserType('client')}
                className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${userType === 'client' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                For Clients
              </button>
              <button
                onClick={() => setUserType('lawyer')}
                className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${userType === 'lawyer' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                For Lawyers
              </button>
            </div>
          </div>

          {/* BILLING TOGGLE */}
          <div className="inline-flex bg-[#0f172a] border border-white/10 p-1 rounded-full backdrop-blur-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'yearly' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Yearly <span className="text-[10px] text-emerald-400 ml-1">-20%</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRICING CARDS */}
      <div className="container mx-auto px-6 pb-32 max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <PricingCard
              key={idx}
              {...plan}
              onAction={() => handleUpgrade(plan.title, plan.price)}
            />
          ))}
        </div>
      </div>


    </div>
  );
};

const PricingCard = ({ title, price, period, desc, features, highlight, popular, special, icon, onAction }) => (
  <motion.div
    whileHover={{ y: -10 }}
    className={`relative p-8 rounded-3xl border flex flex-col h-full backdrop-blur-sm ${special
      ? "bg-gradient-to-b from-[#0f172a] to-[#020617] border-amber-500/30 shadow-[0_0_30px_-5px_rgba(245,158,11,0.15)]"
      : highlight
        ? "bg-indigo-600/10 border-indigo-500/50 text-white shadow-2xl shadow-indigo-600/10"
        : "bg-white/5 border-white/10"
      }`}
  >
    {popular && (
      <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl uppercase tracking-wider shadow-lg">
        Most Popular
      </div>
    )}

    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-2xl ${highlight ? 'bg-indigo-500/20' : 'bg-white/5'}`}>
      {icon}
    </div>

    <h3 className={`text-xl font-bold mb-2 ${special ? 'text-amber-400' : 'text-white'}`}>{title}</h3>
    <p className={`text-sm mb-6 ${highlight ? 'text-indigo-200' : 'text-slate-400'}`}>{desc}</p>

    <div className="mb-8">
      <span className="text-4xl font-serif font-bold text-white">{price}</span>
      <span className={`text-sm ${highlight ? 'text-indigo-300' : 'text-slate-500'}`}>{period}</span>
    </div>

    <div className="space-y-4 mb-8 flex-1">
      {features.map((f, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className={`p-0.5 rounded-full ${highlight ? 'bg-indigo-500' : 'bg-slate-700'}`}>
            <Check size={10} className="text-white" />
          </div>
          <span className={`text-sm ${highlight ? 'text-indigo-100' : 'text-slate-300'}`}>{f}</span>
        </div>
      ))}
    </div>

    <button
      onClick={onAction}
      className={`w-full py-4 rounded-xl font-bold transition shadow-lg ${highlight
        ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30"
        : special
          ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90 shadow-amber-500/20"
          : "bg-white/10 hover:bg-white/20 text-white border border-white/5"
        }`}
    >
      Get Started
    </button>
  </motion.div>
);

export default Pricing;
