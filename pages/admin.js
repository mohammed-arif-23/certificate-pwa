import { useState, useEffect } from 'react';
import Head from 'next/head';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [stats, setStats] = useState(null);
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Color palette
    const COLORS = ['#FF8042', '#FFBB28', '#FFBB28', '#00C49F', '#00685E'];

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('https://certificate-pwa-backend.onrender.com/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            if (res.ok) {
                setIsAuthenticated(true);
                setError('');
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            setError('Connection failed');
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const statsRes = await fetch('https://certificate-pwa-backend.onrender.com/admin/stats');
            const dataRes = await fetch('https://certificate-pwa-backend.onrender.com/admin/feedback');

            if (statsRes.ok) setStats(await statsRes.json());
            if (dataRes.ok) setFeedbackList(await dataRes.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (email) => {
        if (!confirm(`Are you sure you want to delete feedback from ${email}?`)) return;

        try {
            const res = await fetch(`https://certificate-pwa-backend.onrender.com/admin/feedback/${email}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchData(); // Refresh
            } else {
                alert("Failed to delete");
            }
        } catch (err) {
            alert("Error deleting");
        }
    };

    // Prepare chart data
    const chartData = stats ? [
        { name: '1 Star', count: stats.rating_counts['1'] || 0 },
        { name: '2 Stars', count: stats.rating_counts['2'] || 0 },
        { name: '3 Stars', count: stats.rating_counts['3'] || 0 },
        { name: '4 Stars', count: stats.rating_counts['4'] || 0 },
        { name: '5 Stars', count: stats.rating_counts['5'] || 0 },
    ] : [];

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
                    <h2 className="text-2xl font-bold mb-6 text-[#00685E] text-center">Admin Login</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Username"
                            className="w-full p-3 border rounded-lg"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full p-3 border rounded-lg"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button type="submit" className="w-full bg-[#00685E] text-white py-3 rounded-lg font-bold hover:bg-[#004d46]">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head>
                <title>Admin Dashboard - Valli Hospital</title>
            </Head>

            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 p-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <img src="/header_logo.png" alt="Logo" className="h-10" />
                        <span className="text-xl font-bold text-gray-800">Admin Dashboard</span>
                    </div>
                    <button
                        onClick={() => setIsAuthenticated(false)}
                        className="text-red-500 hover:text-red-700 font-medium"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-6">
                {loading && <p className="text-center text-gray-500">Loading data...</p>}

                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* KPI Cards */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-sm font-medium uppercase">Total Feedback</p>
                            <p className="text-4xl font-bold text-[#00685E] mt-2">{stats.total_feedback}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-sm font-medium uppercase">Average Rating</p>
                            <div className="flex items-baseline mt-2">
                                <p className="text-4xl font-bold text-[#F26C22]">{stats.average_rating}</p>
                                <span className="text-gray-400 ml-2">/ 5.0</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                            <p className="text-gray-500 text-sm font-medium uppercase mb-4">Rating Distribution</p>
                            <div className="h-32 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                        <Tooltip />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Data Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-800">Recent Feedback</h3>
                        <button onClick={fetchData} className="text-[#00685E] hover:underline text-sm">Refresh</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Rating</th>
                                    <th className="p-4">Q1</th>
                                    <th className="p-4">Q2</th>
                                    <th className="p-4">Q3</th>
                                    <th className="p-4">Q4</th>
                                    <th className="p-4">Q5</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {feedbackList.map((item) => (
                                    <tr key={item.id || item.email} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-900">
                                            {item.name}
                                            <div className="text-xs text-gray-400 font-normal">{item.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.rating >= 4 ? 'bg-green-100 text-green-800' : item.rating >= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                {item.rating} ★
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600">{item.q1_relevance}</td>
                                        <td className="p-4 text-gray-600">{item.q2_confidence}</td>
                                        <td className="p-4 text-gray-600">{item.q3_instructor}</td>
                                        <td className="p-4 text-gray-600">{item.q4_duration}</td>
                                        <td className="p-4 text-gray-600">{item.q5_satisfaction}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(item.email)}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {feedbackList.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="8" className="p-8 text-center text-gray-400">No feedback found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
