import { useState, useEffect } from "react";
import { Shield, Search, Filter } from "lucide-react";

export default function AuditLogsTable() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("ALL");

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
            <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-serif font-semibold flex items-center gap-3">
                        <Shield className="w-6 h-6" />
                        Audit Logs
                    </h2>
                    <p className="text-[rgb(27,55,121)]/70 mt-1 text-sm">
                        Immutable record of system activities.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className="pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[rgb(27,55,121)] w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            className="pl-9 pr-8 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[rgb(27,55,121)] appearance-none bg-white"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="ALL">All Events</option>
                            <option value="AUTH">Authentication</option>
                            <option value="API">API Keys</option>
                            <option value="USER_MGMT">User Mgmt</option>
                        </select>
                    </div>
                    <div className="text-xs bg-gray-100 px-3 py-2 rounded-md font-mono whitespace-nowrap">
                        {filteredLogs.length} Events
                    </div>
                </div>
            </header>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white border border-[rgb(27,55,121)]/10 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto h-[600px] overflow-y-auto relative">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-[rgb(27,55,121)]/60 uppercase bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Timestamp</th>
                                <th className="px-6 py-3 font-semibold">Action</th>
                                <th className="px-6 py-3 font-semibold">User ID</th>
                                <th className="px-6 py-3 font-semibold">Resource</th>
                                <th className="px-6 py-3 font-semibold">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLogs.map((log) => (
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
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
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
