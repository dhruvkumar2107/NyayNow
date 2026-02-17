import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Lock, CheckCircle, Loader } from 'lucide-react';

const DigiLockerMock = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/register';

    const [step, setStep] = useState('login'); // login, otp, consent, success
    const [loading, setLoading] = useState(false);
    const [aadhaar, setAadhaar] = useState('');
    const [otp, setOtp] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep('otp');
        }, 1500);
    };

    const handleOtp = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep('consent');
        }, 1500);
    };

    const handleConsent = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep('success');
            setTimeout(() => {
                // Redirect back with success flag
                navigate(`${returnUrl}?digilocker_verified=true`);
            }, 1000);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
            {/* HEADER */}
            <header className="bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/23/DigiLocker.svg" alt="DigiLocker" className="h-8" />
                    <div className="border-l border-gray-300 pl-3 h-8 flex items-center">
                        <span className="text-gray-600 font-bold text-sm tracking-wider uppercase">Meri Pehchan</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-green-600 text-xs font-bold bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    <Lock size={12} /> Secure Gateway
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-gray-200 overflow-hidden relative">
                    {/* Top Bar */}
                    <div className="bg-[#1c3a6e] h-2 w-full"></div>

                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold text-gray-800">Sign in to your account</h2>
                            <p className="text-sm text-gray-500 mt-1">Authenticate via Aadhaar/Mobile</p>
                        </div>

                        {step === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Aadhaar / Mobile Number</label>
                                    <input
                                        type="text"
                                        value={aadhaar}
                                        onChange={(e) => setAadhaar(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        placeholder="Enter 12 digit Aadhaar"
                                        required
                                    />
                                </div>
                                <button disabled={loading} className="w-full py-3 bg-[#1c3a6e] text-white font-bold rounded-lg hover:bg-[#152c55] transition flex justify-center items-center">
                                    {loading ? <Loader size={20} className="animate-spin" /> : "Next"}
                                </button>
                            </form>
                        )}

                        {step === 'otp' && (
                            <form onSubmit={handleOtp} className="space-y-6">
                                <div className="text-center mb-4">
                                    <p className="text-sm text-gray-600">OTP sent to mobile linked with Aadhaar ending in **** 8902</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Enter OTP</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-center tracking-[0.5em] font-bold text-xl"
                                        placeholder="000000"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                                <button disabled={loading} className="w-full py-3 bg-[#1c3a6e] text-white font-bold rounded-lg hover:bg-[#152c55] transition flex justify-center items-center">
                                    {loading ? <Loader size={20} className="animate-spin" /> : "Verify OTP"}
                                </button>
                            </form>
                        )}

                        {step === 'consent' && (
                            <div className="space-y-6">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                                    <Shield className="text-yellow-600 shrink-0" size={20} />
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">NyayNow requests access</p>
                                        <p className="text-xs text-gray-600 mt-1">To verify your identity using your Aadhaar Card and Bar Council Certificate.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        className="flex-1 py-3 border border-gray-300 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition"
                                        onClick={() => navigate(returnUrl)}
                                    >
                                        Deny
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConsent}
                                        className="flex-1 py-3 bg-[#1c3a6e] text-white font-bold rounded-lg hover:bg-[#152c55] transition flex justify-center items-center"
                                    >
                                        {loading ? <Loader size={20} className="animate-spin" /> : "Allow"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={32} className="text-green-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Success!</h3>
                                <p className="text-gray-500 text-sm">Redirecting back to NyayNow...</p>
                            </div>
                        )}

                    </div>

                    <div className="bg-gray-50 p-4 border-t border-gray-200 text-center">
                        <p className="text-[10px] text-gray-400">
                            This is a simulation for demonstration purposes. Not connected to real DigiLocker.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DigiLockerMock;
