import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-200 text-slate-600 font-sans pt-24 pb-12 relative overflow-hidden">

            {/* Background Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-500/[0.03] blur-[120px] rounded-full pointer-events-none"></div>

            <div className="container mx-auto px-6 max-w-[1400px] relative z-10">

                {/* TOP SECTION: BRAND & NEWSLETTER */}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-20">
                    <div className="max-w-md">
                        <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                            <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                N
                            </div>
                            <span className="text-2xl font-bold text-slate-900 tracking-tight">NyayNow</span>
                        </Link>
                        <p className="text-slate-600 text-lg leading-relaxed mb-8">
                            The operating system for the Indian Justice System. We are democratizing legal intelligence for 1.4 billion people with AI.
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon path="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                            <SocialIcon path="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            <SocialIcon path="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </div>
                    </div>

                    <div className="w-full lg:w-auto bg-slate-50 border border-slate-200 rounded-2xl p-8 shadow-sm">
                        <h4 className="text-lg font-bold text-slate-900 mb-2">Stay ahead of the curve.</h4>
                        <p className="text-sm text-slate-600 mb-6 max-w-xs">
                            Get the latest updates on Supreme Court judgments and new AI features.
                        </p>
                        <form className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full"
                            />
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-lg text-sm transition shadow-lg shadow-indigo-600/10">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                {/* LINKS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-24">
                    <FooterColumn title="Product">
                        <FooterLink to="/assistant">AI Assistant</FooterLink>
                        <FooterLink to="/judge-ai">Judge AI <span className="text-[10px] text-indigo-200 bg-indigo-500/20 px-1.5 py-0.5 rounded ml-2 font-bold">New</span></FooterLink>
                        <FooterLink to="/voice-assistant">NyayVoice</FooterLink>
                        <FooterLink to="/moot-court">Moot Court VR</FooterLink>
                        <FooterLink to="/marketplace">Find Lawyers</FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Resources">
                        <FooterLink to="/research">Legal Research</FooterLink>
                        <FooterLink to="/drafting">Drafting Lab</FooterLink>
                        <FooterLink to="/agreements">Agreement Analyzer</FooterLink>
                        <FooterLink to="/ecourts">E-Courts Status</FooterLink>
                        <FooterLink to="/blog">Blog & Insights</FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Company">
                        <FooterLink to="/about">About Us</FooterLink>
                        <FooterLink to="/careers">Careers <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded ml-2 font-bold">Hiring</span></FooterLink>
                        <FooterLink to="/contact">Contact Support</FooterLink>
                        <FooterLink to="/partners">Partners</FooterLink>
                        <FooterLink to="/press">Press Kit</FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Use Cases">
                        <FooterLink to="/lawyer/dashboard">For Law Firms</FooterLink>
                        <FooterLink to="/client/dashboard">For Individuals</FooterLink>
                        <FooterLink to="/career">For Students</FooterLink>
                        <FooterLink to="/enterprises">For Enterprises</FooterLink>
                        <FooterLink to="/judiciary">For Judiciary</FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Legal">
                        <FooterLink to="/terms">Terms of Service</FooterLink>
                        <FooterLink to="/privacy">Privacy Policy</FooterLink>
                        <FooterLink to="/security">Security</FooterLink>
                        <FooterLink to="/help">Help Center</FooterLink>
                        <span className="text-yellow-400 text-xs font-bold border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 rounded-full uppercase inline-block mt-2">Startup India</span>
                    </FooterColumn>
                </div>

                {/* BOTTOM BAR */}
                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-500 text-sm font-medium">
                        © {new Date().getFullYear()} NyayNow Legal Tech Pvt Ltd. All rights reserved.
                    </p>
                    <div className="flex gap-8 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <span className="flex items-center gap-2 hover:text-emerald-600 cursor-pointer transition">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            All Systems Operational
                        </span>
                        <span className="hover:text-slate-900 cursor-pointer transition">Status</span>
                        <span className="hover:text-slate-900 cursor-pointer transition">Twitter</span>
                        <span className="hover:text-slate-900 cursor-pointer transition">Github</span>
                    </div>
                </div>

            </div>
        </footer>
    );
};

const FooterColumn = ({ title, children }) => (
    <div className="flex flex-col gap-4">
        <h3 className="font-bold text-slate-900 uppercase tracking-wider text-sm">{title}</h3>
        <ul className="flex flex-col gap-3">
            {children}
        </ul>
    </div>
);

const FooterLink = ({ to, children }) => (
    <li>
        <Link to={to} className="text-sm hover:text-indigo-600 transition-colors duration-200 flex items-center">
            {children}
        </Link>
    </li>
);

const SocialIcon = ({ path }) => (
    <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300 shadow-sm">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">{path}</svg>
    </a>
);

export default Footer;
