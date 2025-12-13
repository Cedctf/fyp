import { useState, useEffect } from "react";
import { Shield } from "lucide-react";

export default function AuditLogsTable() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(27,55,121)]"></div>
            </div>
        );
    }

    return (
        <div>
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-serif font-semibold flex items-center gap-3">
                        <Shield className="w-6 h-6" />
                        Audit Logs
                    </h2>
                    <p className="text-[rgb(27,55,121)]/70 mt-1 text-sm">
                        Immutable record of system activities and data changes.
                    </p>
                </div>
                <div className="text-xs bg-gray-100 px-3 py-1 rounded-full font-mono">
                    Total Events: {logs.length}
                </div>
            </header>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200 text-sm">
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
        </div>
    );
}
