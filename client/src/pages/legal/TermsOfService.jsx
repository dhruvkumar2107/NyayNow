import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            <Navbar />
            <div className="flex-grow container mx-auto px-6 py-12 max-w-4xl">
                <h1 className="text-4xl font-extrabold mb-8 text-slate-800">Terms of Service</h1>
                <p className="text-sm text-slate-500 mb-8 uppercase tracking-wider font-bold">Last Updated: {new Date().toLocaleDateString()}</p>

                <div className="space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
                    <section>
                        <h2 className="text-xl font-bold mb-3 text-slate-800">1. Acceptance of Terms</h2>
                        <p className="text-slate-600 leading-relaxed">
                            By accessing and using NyaySathi ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-slate-800">2. Description of Services</h2>
                        <p className="text-slate-600 leading-relaxed">
                            NyaySathi is a legal technology platform that connects clients with legal professionals and provides AI-powered legal assistance. We are an intermediary platform and do not provide direct legal representation.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-slate-800">3. User Responsibilities</h2>
                        <ul className="list-disc pl-5 text-slate-600 space-y-2 leading-relaxed">
                            <li>You must provide accurate and complete information when creating an account.</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li>You agree not to use the platform for any illegal or unauthorized purpose.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-slate-800">4. Disclaimer of Liability</h2>
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                            <p className="text-amber-800 leading-relaxed text-sm font-medium">
                                The information provided by our AI tools is for informational purposes only and does not constitute official legal advice. Always consult with a qualified attorney for professional legal counsel. NyaySathi is not liable for actions taken based on AI-generated information.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-slate-800">5. Termination</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users of the Platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-slate-800">6. Governing Law</h2>
                        <p className="text-slate-600 leading-relaxed">
                            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts associated with our registered office.
                        </p>
                    </section>
                </div>
            </div>
        </div>
        </div >
    );
};

export default TermsOfService;
