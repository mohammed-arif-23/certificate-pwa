import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('https://certificate-pwa-backend.onrender.com/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('user_email', email);
                localStorage.setItem('user_name', data.name);

                if (data.has_submitted) {
                    // Already submitted: Go to certificate (manual download only)
                    router.push('/certificate');
                } else {
                    // New user: Go to feedback
                    router.push('/feedback');
                }
            } else {
                setError('Email not found. Please check and try again.');
            }
        } catch (err) {
            setError('Connection error. Is backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 font-sans">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 w-full max-w-lg">

                {/* Header Section with Logo */}
                <div className="w-full bg-white border-b border-gray-100 p-6 flex justify-center items-center">
                    <img
                        src="/header_logo.png"
                        alt="Valli Super Speciality Hospital"
                        className="max-w-full h-auto object-contain max-h-24"
                    />
                </div>

                <div className="p-8 sm:p-10">
                    <h1 className="text-3xl font-bold mb-2 text-center text-[#00685E]">Welcome</h1>
                    <p className="text-center text-gray-500 mb-8">Enter your email to verify your attendance.</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
                            <p className="font-medium">Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-[#00685E] mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00685E] focus:border-[#00685E] outline-none transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white uppercase tracking-wider transform transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus:outline-none ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#00685E] to-[#004d46] hover:from-[#F26C22] hover:to-[#d95a12]'}`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </span>
                            ) : 'Verify & Continue'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="fixed bottom-4 text-center text-gray-400 text-xs">
                &copy; {new Date().getFullYear()} Valli Super Speciality Hospital
            </div>
        </div>
    );
}
