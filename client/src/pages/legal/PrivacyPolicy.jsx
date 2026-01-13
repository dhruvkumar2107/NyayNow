import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            <Navbar />
            <div className="flex-grow container mx-auto px-6 py-12 max-w-4xl">
                <h1 className="text-4xl font-extrabold mb-8 text-slate-800">Privacy Policy</h1>
                <p className="text-sm text-slate-500 mb-8 uppercase tracking-wider font-bold">Last Updated: {new Date().toLocaleDateString()}</p>

                <div className="space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
                    <section>
                        <h2 className="text-xl font-bold mb-3 text-slate-800">1. Information We Collect</h2>
                        <p className="text-slate-600 leading-relaxed mb-3">
                            We collect information you provide directly to us, such as when you create an account, fill out a profile, or communicate with us. This may include:
                        </p>
                        <ul className="list-disc pl-5 text-slate-600 space-y-2">
                            <li>Name, email address, and contact details.</li>
                            <li>Professional credentials (for Lawyers).</li>
                            <li>Case details and consultation history (stored securely).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-slate-800">2. How We Use Your Information</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We use the collected information to:
                        </p>
                        <ul className="list-disc pl-5 text-slate-600 space-y-2 mt-2">
                            <li>Provide, maintain, and improve our services.</li>
                            <li>Match clients with appropriate legal professionals.</li>
                            <li>Process transactions and send related information.</li>
                            <li>Monitor and analyze trends and usage.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-slate-800">3. AI Data Processing</h2>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                            <p className="text-blue-800 leading-relaxed text-sm font-medium">
                                Our AI tools process input data to generate insights. We do not use your private case data to train our public models without your explicit consent. All data processing is done in accordance with industry-standard security protocols.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-slate-800">4. Data Sharing</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We do not sell your personal data. We may share information with legal professionals you choose to connect with, or as required by law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-slate-800">5. Security</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                        </p>
                    </section>
                </div>
            </div>
        </div>
        </div >
    );
};

export default PrivacyPolicy;
