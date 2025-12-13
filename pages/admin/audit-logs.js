import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { Shield, Clock, Search, Filter } from "lucide-react";

export default function AuditLogs() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (status === "authenticated") {
            if (session.user.role !== 'admin') {
                router.push("/"); // Redirect non-admins
            } else {
                fetchLogs();
            }
        }
    }, [status, session, router]);

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/admin/logs');
            const data = await res.json();
            if (res.ok) {
                setLogs(data.data);
            } else {
                setError(data.error || "Failed to fetch logs");
            }
        } catch (err) {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
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
                <title>Audit Logs | Admin</title>
            </Head>

            <Navbar />

            <main className="container mx-auto px-4 pt-24 pb-16">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-serif font-semibold flex items-center gap-3">
                            <Shield className="w-8 h-8" />
                            Audit Logs
                        </h1>
                        <p className="text-[rgb(27,55,121)]/70 mt-2">
                            Immutable record of system activities and data changes.
                        </p>
                    </div>
                    <div className="text-sm bg-gray-100 px-3 py-1 rounded-full font-mono">
                        Total Events: {logs.length}
                    </div>
                </header>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
                        {error}
                    </div>
                )}

                <div className="bg-white border border-[rgb(27,55,121)]/10 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-[rgb(27,55,121)]/60 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Timestamp</th>
                                    <th className="px-6 py-3 font-semibold">Action</th>
                                    <th className="px-6 py-3 font-semibold">User ID</th>
                                    <th className="px-6 py-3 font-semibold">Resource</th>
                                    <th className="px-6 py-3 font-semibold">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${log.action.includes('REVOKE') || log.action.includes('DELETE') ? 'bg-red-100 text-red-800' :
                                                    log.action.includes('CREATE') || log.action.includes('SIGNUP') ? 'bg-green-100 text-green-800' :
                                                        'bg-blue-100 text-blue-800'}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                            {log.userId}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {log.resource}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs max-w-xs truncate">
                                            {JSON.stringify(log.details)}
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No audit logs found.
                                        </td>
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
