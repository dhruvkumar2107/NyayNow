import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-12 mt-auto">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    {/* BRAND */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
                                NyaySathi
                            </span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            AI-powered legal intelligence for the modern era. Democratizing access to justice.
                        </p>
                    </div>

                    {/* PRODUCT */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-4">Product</h3>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li><Link to="/marketplace" className="hover:text-blue-600 transition">Find Lawyers</Link></li>
                            <li><Link to="/agreement-analyzer" className="hover:text-blue-600 transition">Agreement Analyzer</Link></li>
                            <li><Link to="/judge-ai" className="hover:text-blue-600 transition">Judge AI</Link></li>
                            <li><Link to="/pricing" className="hover:text-blue-600 transition">Pricing</Link></li>
                        </ul>
                    </div>

                    {/* COMPANY */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-4">Company</h3>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li><Link to="/about" className="hover:text-blue-600 transition">About Us</Link></li>
                            <li><Link to="/careers" className="hover:text-blue-600 transition">Careers</Link></li>
                            <li><Link to="/blog" className="hover:text-blue-600 transition">Blog</Link></li>
                            <li><Link to="/contact" className="hover:text-blue-600 transition">Contact</Link></li>
                        </ul>
                    </div>

                    {/* LEGAL */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-4">Legal & Support</h3>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li><Link to="/terms" className="hover:text-blue-600 transition">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="hover:text-blue-600 transition">Privacy Policy</Link></li>
                            <li><Link to="/help" className="hover:text-blue-600 transition">Help Center</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-sm">
                        © {new Date().getFullYear()} NyaySathi Legal Tech. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-slate-400">
                        <a href="#" className="hover:text-blue-600 transition"><i className="fab fa-twitter"></i></a>
                        <a href="#" className="hover:text-blue-600 transition"><i className="fab fa-linkedin"></i></a>
                        <a href="#" className="hover:text-blue-600 transition"><i className="fab fa-github"></i></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
