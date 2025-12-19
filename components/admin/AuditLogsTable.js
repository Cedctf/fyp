import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function AuditLogsTable({ searchTerm, filterType }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
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

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase());

        let matchesFilter = true;
        if (filterType === 'AUTH') {
            matchesFilter = ['USER_SIGNUP', 'USER_LOGIN', 'USER_LOGIN_OAUTH'].some(a => log.action.includes(a));
        } else if (filterType === 'API') {
            matchesFilter = ['API_KEY'].some(a => log.action.includes(a));
        } else if (filterType === 'USER_MGMT') {
            matchesFilter = ['USER_ROLE', 'ADMIN_USER'].some(a => log.action.includes(a));
        }

        return matchesSearch && matchesFilter;
    });

    return (
        <div>
            {error && (
                <div className="bg-[rgb(87,17,17)]/5 text-[rgb(87,17,17)] p-4 rounded-lg mb-6 border border-[rgb(87,17,17)]/20 text-sm">
                    {error}
                </div>
            )}

            <div className="w-full overflow-hidden">
                <div className="overflow-x-auto h-[600px] overflow-y-auto no-scrollbar">
                    <table className="w-full">
                        <thead className="border-b border-[rgb(27,55,121)]/20">
                            <tr>
                                <th className="pl-4 pr-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">Timestamp</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">User ID</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">Resource</th>
                                <th className="pl-6 pr-4 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log, index) => (
                                <tr
                                    key={log._id}
                                    className={`hover:bg-[rgb(27,55,121)]/10 transition-colors duration-200 cursor-pointer ${index % 2 === 0 ? '' : 'bg-[rgb(27,55,121)]/5'}`}
                                    onClick={() => setSelectedLog(log)}
                                >
                                    <td className="pl-4 pr-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-[rgb(27,55,121)]">
                                            {new Date(log.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}, {new Date(log.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-xs font-semibold text-[rgb(27,55,121)]">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-xs font-mono text-[rgb(27,55,121)]/70">
                                            {log.userId}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-[rgb(27,55,121)]/70">
                                            {log.resource}
                                        </div>
                                    </td>
                                    <td className="pl-6 pr-4 py-4 whitespace-nowrap">
                                        <div className="text-xs font-mono text-[rgb(27,55,121)]/50 max-w-xs truncate">
                                            {JSON.stringify(log.details)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-[rgb(27,55,121)]/50">
                                        No matching logs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Log Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setSelectedLog(null)}>
                    <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                        <div className="fixed inset-0 bg-black/50 transition-opacity" aria-hidden="true" />
                        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
                        <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full sm:p-6" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-semibold mb-4 text-[rgb(27,55,121)] font-serif">Log Details</h2>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Timestamp</p>
                                    <p className="text-gray-900">{new Date(selectedLog.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}, {new Date(selectedLog.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Action</p>
                                        <span className="inline-block mt-1 text-sm font-semibold text-[rgb(27,55,121)]">
                                            {selectedLog.action}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Resource</p>
                                        <p className="text-gray-900 mt-1">{selectedLog.resource}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">User ID</p>
                                    <p className="text-gray-900 font-mono text-sm">{selectedLog.userId}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Details JSON</p>
                                    <div className="bg-gray-50 p-3 rounded-md border border-gray-100 overflow-x-auto">
                                        <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap break-all">
                                            {JSON.stringify(selectedLog.details, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
