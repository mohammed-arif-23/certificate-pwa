import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Certificate() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        const storedEmail = localStorage.getItem('user_email');

        if (!storedName || !storedEmail) {
            router.push('/');
        } else {
            setName(storedName);

            // Auto-trigger email ONLY if coming from feedback (new submission)
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('new') === 'true') {
                fetch('https://certificate-pwa-backend.onrender.com/send-certificate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: storedEmail }),
                }).catch(err => console.error("Auto-email failed", err));
            }
        }
    }, [router]);

    const handleDownload = async () => {
        const email = localStorage.getItem('user_email');
        if (!email) return;

        setLoading(true);

        try {
            // logic similar to feedback page
            const resVal = await fetch('https://certificate-pwa-backend.onrender.com/generate-certificate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (resVal.ok) {
                const blob = await resVal.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Certificate_${name.replace(/\s+/g, '_')}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 font-sans">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 w-full max-w-lg">

                {/* Header Section with Logo */}
                <div className="w-full bg-white border-b border-gray-100 p-6 flex justify-center items-center">
                    <img
                        src="/header_logo.png"
                        alt="Valli Super Speciality Hospital"
                        className="max-w-full h-auto object-contain max-h-24"
                    />
                </div>

                <div className="p-10 text-center">
                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-[#E0F2F1] mb-6">
                        <svg className="h-12 w-12 text-[#00685E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold mb-4 text-[#00685E]">Thank You, {name}!</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Your feedback has been successfully recorded. Your certificate has been generated and sent to your email.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={handleDownload}
                            disabled={loading}
                            className={`w-full py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white uppercase tracking-wider transform transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus:outline-none ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#F26C22] to-[#d95a12] hover:from-[#00685E] hover:to-[#004d46]'}`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </span>
                            ) : 'Download Certificate'}
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-4 px-6 border-2 border-gray-200 rounded-xl text-lg font-medium text-gray-600 hover:text-[#00685E] hover:border-[#00685E] hover:bg-gray-50 transition-all focus:outline-none"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-4 text-center text-gray-400 text-xs">
                &copy; {new Date().getFullYear()} Valli Super Speciality Hospital
            </div>
        </div>
    );
}
