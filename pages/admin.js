import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import AuditLogsTable from "../components/admin/AuditLogsTable";
import UserManagementTable from "../components/admin/UserManagementTable";
import { LayoutDashboard, Users, Shield, Bell, Send } from "lucide-react";

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('users'); // Default to users

    // Alert Test State
    const [alertLoading, setAlertLoading] = useState(false);
    const [alertResponse, setAlertResponse] = useState(null);

    const runAlertTest = async () => {
        setAlertLoading(true);
        setAlertResponse(null);
        try {
            const res = await fetch('/api/alerts/trigger', { method: 'POST' });
            const data = await res.json();
            setAlertResponse(data);
        } catch (err) {
            setAlertResponse({ error: "Failed to trigger alerts" });
        } finally {
            setAlertLoading(false);
        }
    };

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (status === "authenticated") {
            if (session.user.role !== 'admin') {
                router.push("/");
            }
        }
    }, [status, session, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(27,55,121)]"></div>
            </div>
        );
    }

    if (!session || session.user.role !== 'admin') {
        return null;
    }

    return (
        <div className="min-h-screen bg-white text-[rgb(27,55,121)] font-sans">
            <Head>
                <title>Admin Dashboard</title>
            </Head>

            <Navbar />

            <main className="container mx-auto px-4 pt-24 pb-16">
                <header className="mb-8">
                    <h1 className="text-3xl font-serif font-semibold flex items-center gap-3">
                        <LayoutDashboard className="w-8 h-8" />
                        Admin Dashboard
                    </h1>
                    <p className="text-[rgb(27,55,121)]/70 mt-2">
                        Manage your application users and security.
                    </p>
                </header>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-8">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'users'
                            ? 'border-[rgb(27,55,121)] text-[rgb(27,55,121)]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('audit')}
                        className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'audit'
                            ? 'border-[rgb(27,55,121)] text-[rgb(27,55,121)]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Shield className="w-4 h-4" />
                        Audit Logs
                    </button>
                    <button
                        onClick={() => setActiveTab('alerts')}
                        className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'alerts'
                            ? 'border-[rgb(27,55,121)] text-[rgb(27,55,121)]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Bell className="w-4 h-4" />
                        Alert System
                    </button>
                </div>

                {/* Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {activeTab === 'users' && <UserManagementTable />}
                    {activeTab === 'audit' && <AuditLogsTable />}
                    {activeTab === 'alerts' && (
                        <div className="space-y-8">
                            <div className="bg-white border rounded-xl p-6 shadow-sm max-w-2xl">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-[rgb(27,55,121)] mb-2">
                                            Trigger Email Alerts
                                        </h2>
                                        <p className="text-[rgb(27,55,121)]/70 text-sm">
                                            Manually trigger the backend to scan for high-risk users and send email notifications.
                                            This is usually an automated scheduled task.
                                        </p>
                                    </div>
                                    <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                                        ADMIN ONLY
                                    </div>
                                </div>

                                <div className="mt-6 border-t pt-6">
                                    <button
                                        onClick={runAlertTest}
                                        disabled={alertLoading}
                                        className="bg-[rgb(27,55,121)] text-white px-6 py-3 rounded-md font-semibold hover:bg-[rgb(27,55,121)]/90 disabled:opacity-50 transition-colors text-sm flex items-center gap-3 shadow-lg shadow-[rgb(27,55,121)]/10"
                                    >
                                        <Send className="w-4 h-4" />
                                        {alertLoading ? "Triggering Alerts..." : "Trigger System Scan Now"}
                                    </button>
                                </div>

                                {/* Logs Output */}
                                {alertResponse && (
                                    <div className="mt-6 rounded-md bg-gray-900 p-4 overflow-hidden shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
                                            <span className="text-green-400 font-mono text-xs font-bold">SYSTEM LOG</span>
                                            <span className="text-gray-500 text-[10px] font-mono">{new Date().toLocaleTimeString()}</span>
                                        </div>
                                        <pre className="text-green-400 font-mono text-xs overflow-x-auto custom-scrollbar">
                                            {JSON.stringify(alertResponse, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>

                            <RiskMonitorTable />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function RiskMonitorTable() {
    const [riskData, setRiskData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRiskData = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/alerts/status');
                const data = await res.json();
                setRiskData(data);
            } catch (err) {
                console.error("Failed to fetch risk data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRiskData();
        // Poll every 30 seconds
        const interval = setInterval(fetchRiskData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="text-sm text-gray-500">Loading risk data...</div>;
    if (!riskData) return <div className="text-sm text-red-500">Failed to load risk monitor.</div>;

    return (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-[rgb(27,55,121)]">Real-time Risk Monitor</h2>
                    <p className="text-[rgb(27,55,121)]/70 text-sm">
                        Live surveillance of high-risk zones across Kuala Lumpur based on AI predictions.
                    </p>
                </div>
                <div className="flex gap-4 text-sm font-medium">
                    <div className="flex flex-col items-end">
                        <span className="text-[rgb(27,55,121)]/50 text-xs uppercase tracking-wider">Total Scanned</span>
                        <span className="text-[rgb(27,55,121)]">{riskData.total_locations_scanned} Locations</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[rgb(27,55,121)]/50 text-xs uppercase tracking-wider">High Risk Detected</span>
                        <span className="text-red-600">{riskData.high_risk_count} Areas</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-[rgb(27,55,121)]/50 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 font-semibold">District / Area</th>
                            <th className="px-4 py-3 font-semibold">Coordinates</th>
                            <th className="px-4 py-3 font-semibold">Streak</th>
                            <th className="px-4 py-3 font-semibold">Current Cases</th>
                            <th className="px-4 py-3 font-semibold">Predicted (7 Days)</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {riskData.high_risk_areas.length > 0 ? (
                            riskData.high_risk_areas.map((area, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-[rgb(27,55,121)]">
                                        {area.district || "Unknown District"}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                                        {area.coordinates}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <span className={`font-bold ${area.consecutive_days >= 2 ? "text-red-600" : "text-amber-500"}`}>
                                                {area.consecutive_days} Days
                                            </span>
                                            {area.consecutive_days >= 2 && (
                                                <span className="text-[10px] bg-red-100 text-red-700 px-1 py-0.5 rounded border border-red-200">
                                                    ALERT
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {area.current_cases}
                                    </td>
                                    <td className="px-4 py-3 text-[rgb(27,55,121)] font-bold">
                                        {area.predicted_cases_7d} <span className="text-xs font-normal text-gray-400">cases</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 animate-pulse">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                            HIGH RISK
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic bg-gray-50/30 rounded-b-lg">
                                    No high-risk areas detected at this moment.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
