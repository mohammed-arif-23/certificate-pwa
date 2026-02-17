import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Feedback() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Form State
    const [q1, setQ1] = useState('0'); // Content Relevance
    const [q2, setQ2] = useState('0'); // Confidence
    const [q3, setQ3] = useState('0'); // Instructors
    const [q4, setQ4] = useState('0'); // Duration
    const [q5, setQ5] = useState('0'); // Satisfaction/Recommendation

    // Overall Rating derived
    // The backend expects "rating" (int). We'll calculate the average of all 5 questions.

    useEffect(() => {
        if (!localStorage.getItem('user_email')) router.push('/');
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Ensure all questions are answered
        if (q1 === '0' || q2 === '0' || q3 === '0' || q4 === '0' || q5 === '0') {
            alert("Please answer all questions before submitting.");
            return;
        }

        setLoading(true);
        setMessage('Submitting...');

        const email = localStorage.getItem('user_email');
        const name = localStorage.getItem('user_name');

        // Calculate average rating
        const rating = Math.round((parseInt(q1) + parseInt(q2) + parseInt(q3) + parseInt(q4) + parseInt(q5)) / 5);

        try {
            // 1. Submit to Supabase
            const res = await fetch('http://localhost:8000/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    rating,
                    q1, q2, q3, q4, q5
                }),
            });

            if (!res.ok) throw new Error("Feedback failed");

            // Redirect to certificate page - Email/Download happens there
            // Mark as 'new' so certificate page knows to send email
            router.push('/certificate?new=true');
        } catch (err) {
            console.error(err);
            setMessage('Error occurred.');
            setLoading(false);
        }
    };

    const StarRating = ({ value, onChange, label }) => (
        <div className="mb-6 group">
            <label className="block text-lg font-semibold text-[#00685E] mb-2 transition-colors group-hover:text-[#F26C22]">{label}</label>
            <div className="flex space-x-3">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star.toString())}
                        className={`text-4xl transition-all transform hover:scale-110 focus:outline-none ${star <= parseInt(value) ? 'text-[#F26C22] drop-shadow-sm' : 'text-gray-200 hover:text-[#F26C22]/50'}`}
                    >
                        ★
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">

                {/* Header Section with Logo */}
                <div className="w-full bg-white border-b border-gray-100 p-6 flex justify-center items-center">
                    <img
                        src="/header_logo.png"
                        alt="Valli Super Speciality Hospital"
                        className="max-w-full h-auto object-contain max-h-32"
                    />
                </div>

                {/* Content Section */}
                <div className="p-8 sm:p-10">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold text-[#00685E]">CME Program Feedback</h2>
                        <p className="mt-2 text-gray-500">We value your input to improve our future programs.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <StarRating
                            label="1. How relevant was the course content (Triage, Surveys, Airway, Circulation) to your daily clinical practice?"
                            value={q1}
                            onChange={setQ1}
                        />
                        <StarRating
                            label="2. To what extent has this training improved your confidence in performing immediate interventions like BLS and ACLS?"
                            value={q2}
                            onChange={setQ2}
                        />
                        <StarRating
                            label="3. How effective were the instructors in demonstrating practical skills and clarifying doubts?"
                            value={q3}
                            onChange={setQ3}
                        />
                        <StarRating
                            label="4. Was the four-hour duration sufficient to cover the course highlights effectively?"
                            value={q4}
                            onChange={setQ4}
                        />
                        <StarRating
                            label="5. Overall, how satisfied are you with the program, and would you recommend it?"
                            value={q5}
                            onChange={setQ5}
                        />

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white uppercase tracking-wider transform transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#00685E] to-[#004d46] hover:from-[#F26C22] hover:to-[#d95a12]'}`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : 'Submit Feedback'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="mt-8 text-center text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Valli Super Speciality Hospital. All rights reserved.
            </div>
        </div>
    );
}
