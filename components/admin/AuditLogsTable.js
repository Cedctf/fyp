import { useState, useEffect } from "react";

export default function AuditLogsTable({ searchTerm, filterType }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200 text-sm">
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
                                <tr key={log._id} className={`hover:bg-[rgb(27,55,121)]/10 transition-colors duration-200 ${index % 2 === 0 ? '' : 'bg-[rgb(27,55,121)]/5'}`}>
                                    <td className="pl-4 pr-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-[rgb(27,55,121)]">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-xs font-semibold
                                            ${log.action.includes('REVOKE') || log.action.includes('DELETE') ? 'text-red-600' :
                                                log.action.includes('CREATE') || log.action.includes('SIGNUP') ? 'text-green-600' :
                                                    'text-blue-600'}`}>
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
        </div>
    );
}
