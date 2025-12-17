import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import AuditLogsTable from "../components/admin/AuditLogsTable";
import UserManagementTable from "../components/admin/UserManagementTable";
import { LayoutDashboard, Users, Shield, Bell, Send } from "lucide-react";
import ArticleApprovalTable from "../components/admin/ArticleApprovalTable";
import { Search, ChevronDown, Check, UserPlus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('users');

    // Shared State (resets on tab change)
    const [searchTerm, setSearchTerm] = useState("");

    // Users State
    const [userFilter, setUserFilter] = useState("ALL");
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Audit State
    const [auditFilter, setAuditFilter] = useState("ALL");

    // Articles State
    const [articleCategory, setArticleCategory] = useState("All");
    const [articleSort, setArticleSort] = useState("newest");

    // Constants
    const ARTICLE_CATEGORIES = ["All", "prevention", "symptoms", "education", "tech & innovation", "community"];
    const ARTICLE_SORT_OPTIONS = [
        { value: "newest", label: "Newest First" },
        { value: "oldest", label: "Oldest First" },
    ];

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

    // Reset search when tab changes
    useEffect(() => {
        setSearchTerm("");
    }, [activeTab]);

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
                <section className="mb-20 mt-8 text-left max-w-4xl">
                    <h1 className="text-5xl font-light font-serif text-[rgb(27,55,121)] leading-[1.1] tracking-tight">
                        Admin Dashboard
                        <br />
                        <span className="text-3xl font-normal font-[family-name:var(--font-inter)] block mt-2">Enabling Secure User Management Through Control and Insight</span>
                    </h1>
                </section>

                {/* Tabs & Controls Container */}
                <div className="flex flex-col xl:flex-row items-end xl:items-center justify-between pt-10 border-t border-[rgb(27,55,121)]/10 mb-8 gap-4">

                    {/* Tabs */}
                    <div className="flex w-full xl:w-auto overflow-x-auto no-scrollbar relative">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`relative flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'users'
                                ? 'text-[rgb(27,55,121)]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            User Management
                            {activeTab === 'users' && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[rgb(27,55,121)]"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('audit')}
                            className={`relative flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'audit'
                                ? 'text-[rgb(27,55,121)]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Audit Logs
                            {activeTab === 'audit' && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[rgb(27,55,121)]"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('articles')}
                            className={`relative flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'articles'
                                ? 'text-[rgb(27,55,121)]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Article Approval
                            {activeTab === 'articles' && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[rgb(27,55,121)]"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto pb-2">
                        {/* Search Input */}
                        <div className="w-full md:w-64 relative group">
                            <div className="relative flex items-center border-b border-[rgb(27,55,121)]/20 py-1 group-focus-within:border-[rgb(27,55,121)] transition-colors h-8">
                                <Search className="w-4 h-4 text-[rgb(27,55,121)] absolute left-0" />
                                <span className={`absolute top-1/2 -translate-y-1/2 text-sm font-sans pointer-events-none transition-all duration-500 ease-in-out whitespace-nowrap
                                    ${searchTerm ? 'right-[calc(100%-4rem)] opacity-0 text-[rgb(27,55,121)]' : 'right-0 text-[rgb(27,55,121)]/50 group-focus-within:right-[calc(100%-4rem)] group-focus-within:text-[rgb(27,55,121)]'}
                                `}>
                                    Search
                                </span>

                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-transparent text-[rgb(27,55,121)] text-sm font-sans focus:outline-none pl-6 z-10"
                                />
                            </div>
                        </div>

                        {/* Sort/Filter Controls based on Active Tab */}
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            {activeTab === 'users' && (
                                <>
                                    <div className="flex items-center gap-2 relative group">
                                        <span className="text-sm font-sans text-[rgb(27,55,121)]">Role</span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="flex items-center gap-2 bg-transparent pr-2 py-1 text-sm font-sans font-medium text-[rgb(27,55,121)] transition focus:outline-none">
                                                    <span>{userFilter === 'ALL' ? 'All' : (userFilter === 'user' ? 'Users' : 'Admins')}</span>
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="min-w-[10rem] text-[rgb(27,55,121)]">
                                                <DropdownMenuItem onSelect={() => setUserFilter('ALL')} className="flex items-center gap-2 cursor-pointer">
                                                    <span className="flex-1">All Roles</span>
                                                    {userFilter === 'ALL' && <Check className="h-4 w-4" />}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => setUserFilter('user')} className="flex items-center gap-2 cursor-pointer">
                                                    <span className="flex-1">Users</span>
                                                    {userFilter === 'user' && <Check className="h-4 w-4" />}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => setUserFilter('admin')} className="flex items-center gap-2 cursor-pointer">
                                                    <span className="flex-1">Admins</span>
                                                    {userFilter === 'admin' && <Check className="h-4 w-4" />}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="bg-[rgb(27,55,121)] text-white px-4 py-1.5 rounded-full font-medium hover:bg-[rgb(20,40,90)] transition-colors shadow-sm text-xs whitespace-nowrap flex items-center gap-1"
                                    >
                                        <UserPlus className="w-3 h-3" />
                                        Create Admin
                                    </button>
                                </>
                            )}

                            {activeTab === 'audit' && (
                                <div className="flex items-center gap-2 relative group">
                                    <span className="text-sm font-sans text-[rgb(27,55,121)]">Filter</span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex items-center gap-2 bg-transparent pr-2 py-1 text-sm font-sans font-medium text-[rgb(27,55,121)] transition focus:outline-none">
                                                <span>
                                                    {auditFilter === 'ALL' ? 'All' :
                                                        auditFilter === 'AUTH' ? 'Auth' :
                                                            auditFilter === 'API' ? 'API' : 'User'}
                                                </span>
                                                <ChevronDown className="h-4 w-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="min-w-[10rem] text-[rgb(27,55,121)]">
                                            <DropdownMenuItem onSelect={() => setAuditFilter('ALL')} className="flex items-center gap-2 cursor-pointer">
                                                <span className="flex-1">All Events</span>
                                                {auditFilter === 'ALL' && <Check className="h-4 w-4" />}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setAuditFilter('AUTH')} className="flex items-center gap-2 cursor-pointer">
                                                <span className="flex-1">Authentication</span>
                                                {auditFilter === 'AUTH' && <Check className="h-4 w-4" />}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setAuditFilter('API')} className="flex items-center gap-2 cursor-pointer">
                                                <span className="flex-1">API Keys</span>
                                                {auditFilter === 'API' && <Check className="h-4 w-4" />}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setAuditFilter('USER_MGMT')} className="flex items-center gap-2 cursor-pointer">
                                                <span className="flex-1">User Mgmt</span>
                                                {auditFilter === 'USER_MGMT' && <Check className="h-4 w-4" />}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}

                            {activeTab === 'articles' && (
                                <>
                                    <div className="flex items-center gap-2 relative group">
                                        <span className="text-sm font-sans text-[rgb(27,55,121)]">Sort</span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="flex items-center gap-2 bg-transparent pr-2 py-1 text-sm font-sans font-medium text-[rgb(27,55,121)] transition focus:outline-none">
                                                    <span>{ARTICLE_SORT_OPTIONS.find(opt => opt.value === articleSort)?.label}</span>
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="min-w-[10rem] text-[rgb(27,55,121)]">
                                                {ARTICLE_SORT_OPTIONS.map(option => (
                                                    <DropdownMenuItem
                                                        key={option.value}
                                                        onSelect={() => setArticleSort(option.value)}
                                                        className="flex items-center gap-2 text-[rgb(27,55,121)] cursor-pointer"
                                                    >
                                                        <span className="flex-1">{option.label}</span>
                                                        {articleSort === option.value && <Check className="h-4 w-4" />}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="flex items-center gap-2 relative group">
                                        <span className="text-sm font-sans text-[rgb(27,55,121)]">Filter</span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="flex items-center gap-2 bg-transparent pr-2 py-1 text-sm font-sans font-medium text-[rgb(27,55,121)] transition focus:outline-none">
                                                    <span>{articleCategory === "All" ? "All" : articleCategory.charAt(0).toUpperCase() + articleCategory.slice(1)}</span>
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="min-w-[10rem] text-[rgb(27,55,121)]">
                                                {ARTICLE_CATEGORIES.map(cat => (
                                                    <DropdownMenuItem
                                                        key={cat}
                                                        onSelect={() => setArticleCategory(cat)}
                                                        className="flex items-center gap-2 text-[rgb(27,55,121)] cursor-pointer"
                                                    >
                                                        <span className="flex-1">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                                                        {articleCategory === cat && <Check className="h-4 w-4" />}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">

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
                    {activeTab === 'users' && (
                        <UserManagementTable
                            searchTerm={searchTerm}
                            filterRole={userFilter}
                            showCreateModal={showCreateModal}
                            setShowCreateModal={setShowCreateModal}
                        />
                    )}
                    {activeTab === 'audit' && (
                        <AuditLogsTable
                            searchTerm={searchTerm}
                            filterType={auditFilter}
                        />
                    )}
                    {activeTab === 'articles' && (
                        <ArticleApprovalTable
                            searchTerm={searchTerm}
                            selectedCategory={articleCategory}
                            sortBy={articleSort}
                        />
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
