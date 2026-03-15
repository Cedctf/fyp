import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import AuditLogsTable from "../components/admin/AuditLogsTable";
import UserManagementTable from "../components/admin/UserManagementTable";
import { LayoutDashboard, Users, Shield, Bell, Send, UploadCloud, FileText, X } from "lucide-react";
import ArticleApprovalTable from "../components/admin/ArticleApprovalTable";
import { Search, ChevronDown, Check, UserPlus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

// Visual Settings Configuration
const VISUAL_SETTINGS = {
    '7d': { threshold: 1, maxIntensity: 22, radius: 0.025 },
    '14d': { threshold: 3, maxIntensity: 30, radius: 0.028 },
    '28d': { threshold: 6, maxIntensity: 50, radius: 0.030 }
};

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

    // Dataset Upload State
    const [stagedFiles, setStagedFiles] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadPhase, setUploadPhase] = useState('idle'); // 'idle' | 'uploading' | 'done'

    // Fetch persisted uploaded files from server memory on mount
    const fetchUploadedFiles = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/dataset');
            if (res.ok) {
                const data = await res.json();
                setUploadedFiles(data);
            }
        } catch (e) {
            console.error("Failed to fetch uploaded datasets", e);
        }
    }, []);

    useEffect(() => {
        fetchUploadedFiles();
    }, [fetchUploadedFiles]);

    // Upload staged files to server memory
    const handleUpload = async () => {
        if (stagedFiles.length === 0) return;
        setIsUploading(true);
        setUploadPhase('uploading');
        try {
            const fileMeta = stagedFiles.map((f) => ({
                name: f.name,
                size: f.size,
                type: f.type,
            }));
            // Run API call and 2s minimum spinner in parallel
            const [res] = await Promise.all([
                fetch('/api/admin/dataset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ files: fileMeta }),
                }),
                new Promise((resolve) => setTimeout(resolve, 2000)),
            ]);
            if (res.ok) {
                setUploadPhase('done');
                await fetchUploadedFiles();
                // Show green tick for 1.5s then clear staged files
                await new Promise((resolve) => setTimeout(resolve, 1500));
                setStagedFiles([]);
                setUploadPhase('idle');
            }
        } catch (e) {
            console.error("Failed to upload datasets", e);
            setUploadPhase('idle');
        } finally {
            setIsUploading(false);
        }
    };

    // Delete a single uploaded file from server memory
    const handleDeleteFile = async (fileId) => {
        try {
            await fetch(`/api/admin/dataset?id=${fileId}`, { method: 'DELETE' });
            await fetchUploadedFiles();
        } catch (e) {
            console.error("Failed to delete dataset", e);
        }
    };

    // Clear all uploaded files from server memory
    const handleClearAll = async () => {
        try {
            await fetch('/api/admin/dataset?all=true', { method: 'DELETE' });
            setUploadedFiles([]);
        } catch (e) {
            console.error("Failed to clear datasets", e);
        }
    };

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

    // Visual Calibration State
    const [forecastHorizon, setForecastHorizon] = useState('14d');
    const [manualThreshold, setManualThreshold] = useState(VISUAL_SETTINGS['14d'].threshold);
    const [manualIntensity, setManualIntensity] = useState(VISUAL_SETTINGS['14d'].maxIntensity);
    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);



    // Alert Thresholds State
    const [alertRadius, setAlertRadius] = useState(1.0);
    const [alertMinIntensity, setAlertMinIntensity] = useState(0);
    const [alertSettingsLoaded, setAlertSettingsLoaded] = useState(false);

    // 1. Fetch Cloud Settings on Mount (Visual & Alert)
    useEffect(() => {
        const fetchSettings = async () => {
            // Fetch Visual Settings
            try {
                const res = await fetch('/api/settings/visual');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data['14d']) {
                        Object.assign(VISUAL_SETTINGS, data);
                        if (VISUAL_SETTINGS[forecastHorizon]) {
                            setManualThreshold(VISUAL_SETTINGS[forecastHorizon].threshold);
                            setManualIntensity(VISUAL_SETTINGS[forecastHorizon].maxIntensity);
                        }
                    }
                }
            } catch (e) { console.error("Failed to load visual settings", e); } finally { setSettingsLoaded(true); }

            // Fetch Alert Settings
            try {
                const res = await fetch('/api/settings/alert');
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        setAlertRadius(data.radius !== undefined ? data.radius : 1.0);
                        setAlertMinIntensity(data.minIntensity !== undefined ? data.minIntensity : 0);
                    }
                }
            } catch (e) {
                console.error("Failed to load alert settings", e);
            } finally {
                setAlertSettingsLoaded(true);
            }
        };
        fetchSettings();
    }, []); // Run once

    // 2. Sync Local State Changes to Global Config Object
    useEffect(() => {
        if (!settingsLoaded) return;
        // Update the global config object in memory so switching tabs preserves it
        if (VISUAL_SETTINGS[forecastHorizon]) {
            VISUAL_SETTINGS[forecastHorizon].threshold = manualThreshold;
            VISUAL_SETTINGS[forecastHorizon].maxIntensity = manualIntensity;
        }
    }, [manualThreshold, manualIntensity, forecastHorizon, settingsLoaded]);

    // 3. Debounce Auto-Save to Server (Visual)
    useEffect(() => {
        if (!settingsLoaded) return;
        const timer = setTimeout(async () => {
            setIsSaving(true);
            try {
                await fetch('/api/settings/visual', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(VISUAL_SETTINGS)
                });
            } catch (e) { console.error("Failed to save settings", e); } finally { setIsSaving(false); }
        }, 1000); // 1 second debounce
        return () => clearTimeout(timer);
    }, [manualThreshold, manualIntensity, settingsLoaded]);

    // 4. Debounce Auto-Save to Server (Alert System)
    useEffect(() => {
        if (!alertSettingsLoaded) return;
        const timer = setTimeout(async () => {
            try {
                await fetch('/api/settings/alert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ radius: alertRadius, minIntensity: alertMinIntensity })
                });
            } catch (e) { console.error("Failed to save alert settings", e); }
        }, 1000);
        return () => clearTimeout(timer);
    }, [alertRadius, alertMinIntensity, alertSettingsLoaded]);

    // Sync Manual Settings with Forecast Horizon (Local State Update)
    // Note: We modified this to NOT reset if we just verified the setting is same.
    // The previous logic completely overwrote manualThreshold on horizon change.
    // That is desired behavior (switching to 28d load 28d defaults).
    useEffect(() => {
        if (forecastHorizon && VISUAL_SETTINGS[forecastHorizon]) {
            setManualThreshold(VISUAL_SETTINGS[forecastHorizon].threshold);
            setManualIntensity(VISUAL_SETTINGS[forecastHorizon].maxIntensity);
        }
    }, [forecastHorizon]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/usertype");
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
                        <button
                            onClick={() => setActiveTab('alerts')}
                            className={`relative flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'alerts'
                                ? 'text-[rgb(27,55,121)]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Alert System
                            {activeTab === 'alerts' && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[rgb(27,55,121)]"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('dataset')}
                            className={`relative flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'dataset'
                                ? 'text-[rgb(27,55,121)]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Upload Dataset
                            {activeTab === 'dataset' && (
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Trigger Alerts & Configuration */}
                                <div className="space-y-6">
                                    {/* Trigger Panel */}
                                    <div className="bg-white border rounded-xl p-6 shadow-sm">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <h2 className="text-xl font-bold text-[rgb(27,55,121)] mb-2">
                                                    Trigger Email Alerts
                                                </h2>
                                                <p className="text-[rgb(27,55,121)]/70 text-sm">
                                                    Manually trigger the backend to scan for high-risk users and send email notifications.
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0 bg-red-50 border border-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
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

                                    {/* Alert Configuration Panel */}
                                    <div className="bg-white border rounded-xl p-6 shadow-sm">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h2 className="text-base font-bold text-[rgb(27,55,121)] mb-1">
                                                    Detection Thresholds
                                                </h2>
                                                <p className="text-[rgb(27,55,121)]/70 text-xs">
                                                    Calibrate the sensitivity of the alert trigger system.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Radius Slider */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-xs text-gray-600 mb-2">
                                                <span>Proximity Radius (KM)</span>
                                                <span className="font-bold font-mono bg-blue-50 px-2 py-0.5 rounded text-[rgb(27,55,121)]">{alertRadius.toFixed(1)} KM</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0.1"
                                                max="5.0"
                                                step="0.1"
                                                value={alertRadius}
                                                onChange={(e) => setAlertRadius(parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[rgb(27,55,121)]"
                                            />
                                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                                <span>0.1 KM (Strict)</span>
                                                <span>5.0 KM (Broad)</span>
                                            </div>
                                        </div>

                                        {/* Intensity Slider */}
                                        <div>
                                            <div className="flex justify-between text-xs text-gray-600 mb-2">
                                                <span>Min Risk Intensity (Cases)</span>
                                                <span className="font-bold font-mono bg-red-50 px-2 py-0.5 rounded text-red-600">{alertMinIntensity}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="50"
                                                step="1"
                                                value={alertMinIntensity}
                                                onChange={(e) => setAlertMinIntensity(parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                                            />
                                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                                <span>0 (All Alerts)</span>
                                                <span>50 (Severe Only)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Visual Calibration */}
                                <div className="bg-white border rounded-xl p-6 shadow-sm">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-[rgb(27,55,121)] mb-2">
                                                Visual Calibration
                                            </h2>
                                            <p className="text-[rgb(27,55,121)]/70 text-sm">
                                                Construct scale and intensity settings for the heatmap visualization.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Forecast Selection */}
                                    <div className="mb-6">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                                            Forecast Period
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['7d', '14d', '28d'].map((period) => (
                                                <button
                                                    key={period}
                                                    onClick={() => setForecastHorizon(period)}
                                                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${forecastHorizon === period
                                                        ? 'bg-[rgb(27,55,121)] border-[rgb(27,55,121)] text-white shadow-md'
                                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {period.replace('d', '')} Days
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Visual Calibration Sliders */}
                                    <div className="space-y-6">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex justify-between">
                                            <span>Calibration Controls</span>
                                            <div className="flex gap-2">
                                                {isSaving && <span className="text-[10px] text-green-600 animate-pulse">Saving...</span>}
                                                <button
                                                    onClick={() => {
                                                        // Hard Reset Logic (Manual Overrides)
                                                        const defaults = {
                                                            '7d': { threshold: 1, maxIntensity: 22 },
                                                            '14d': { threshold: 3, maxIntensity: 30 },
                                                            '28d': { threshold: 6, maxIntensity: 50 },
                                                        };
                                                        if (defaults[forecastHorizon]) {
                                                            setManualThreshold(defaults[forecastHorizon].threshold);
                                                            setManualIntensity(defaults[forecastHorizon].maxIntensity);
                                                        }
                                                    }}
                                                    className="text-[10px] text-[rgb(27,55,121)] hover:underline"
                                                >
                                                    Reset to Default
                                                </button>
                                            </div>
                                        </label>

                                        {/* Threshold Slider */}
                                        <div>
                                            <div className="flex justify-between text-xs text-gray-600 mb-2">
                                                <span>Filter Noise (Min Cases)</span>
                                                <span className="font-bold font-mono bg-gray-100 px-2 py-0.5 rounded text-[rgb(27,55,121)]">{manualThreshold}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="15"
                                                step="1"
                                                value={manualThreshold}
                                                onChange={(e) => setManualThreshold(parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[rgb(27,55,121)]"
                                            />
                                        </div>

                                        {/* Intensity Slider */}
                                        <div>
                                            <div className="flex justify-between text-xs text-gray-600 mb-2">
                                                <span>Red Intensity (Max Cases)</span>
                                                <span className="font-bold font-mono bg-gray-100 px-2 py-0.5 rounded text-red-600">{manualIntensity}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="10"
                                                max="100"
                                                step="5"
                                                value={manualIntensity}
                                                onChange={(e) => setManualIntensity(parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                                            />
                                        </div>
                                    </div>
                                </div>
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

                    {activeTab === 'dataset' && (
                        <div className="space-y-8">
                            <div className="bg-white border rounded-xl p-6 shadow-sm">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-[rgb(27,55,121)] mb-2">
                                            Upload Dataset
                                        </h2>
                                        <p className="text-[rgb(27,55,121)]/70 text-sm">
                                            Drag and drop your dataset files below, or click to browse. Accepted formats include CSV, JSON, XLSX, and XLS.
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 bg-blue-50 border border-blue-100 text-[rgb(27,55,121)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                                        ADMIN ONLY
                                    </div>
                                </div>

                                {/* Drag & Drop Zone */}
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDragging(false);
                                        const droppedFiles = Array.from(e.dataTransfer.files);
                                        setStagedFiles((prev) => [...prev, ...droppedFiles]);
                                    }}
                                    onClick={() => document.getElementById('dataset-file-input').click()}
                                    className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragging
                                        ? 'border-[rgb(27,55,121)] bg-[rgb(27,55,121)]/5 scale-[1.01]'
                                        : 'border-gray-300 hover:border-[rgb(27,55,121)]/50 hover:bg-gray-50/50'
                                        }`}
                                >
                                    <input
                                        id="dataset-file-input"
                                        type="file"
                                        multiple
                                        accept=".csv,.json,.xlsx,.xls"
                                        className="hidden"
                                        onChange={(e) => {
                                            const selectedFiles = Array.from(e.target.files);
                                            setStagedFiles((prev) => [...prev, ...selectedFiles]);
                                            e.target.value = '';
                                        }}
                                    />
                                    <div className="flex flex-col items-center gap-4">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${isDragging ? 'bg-[rgb(27,55,121)]/10' : 'bg-gray-100'
                                            }`}>
                                            <UploadCloud className={`w-8 h-8 transition-colors duration-300 ${isDragging ? 'text-[rgb(27,55,121)]' : 'text-gray-400'
                                                }`} />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-semibold transition-colors duration-300 ${isDragging ? 'text-[rgb(27,55,121)]' : 'text-gray-600'
                                                }`}>
                                                {isDragging ? 'Release to add files' : 'Drag & drop files here'}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                or <span className="text-[rgb(27,55,121)] font-medium underline underline-offset-2">browse from your computer</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            {['CSV', 'JSON', 'XLSX', 'XLS'].map((format) => (
                                                <span key={format} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">
                                                    .{format.toLowerCase()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Staged Files List */}
                                {stagedFiles.length > 0 && (
                                    <div className="mt-6 border-t pt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-bold text-[rgb(27,55,121)]">
                                                Ready to Upload ({stagedFiles.length} {stagedFiles.length === 1 ? 'file' : 'files'})
                                            </h3>
                                            <button
                                                onClick={() => setStagedFiles([])}
                                                className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {stagedFiles.map((file, idx) => (
                                                <div
                                                    key={`staged-${file.name}-${idx}`}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[rgb(27,55,121)]/20 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-300 ${uploadPhase === 'done'
                                                            ? 'bg-green-50 border border-green-200'
                                                            : 'bg-gray-100 border border-gray-200'
                                                            }`}>
                                                            {uploadPhase === 'done' ? (
                                                                <Check className="w-5 h-5 text-green-500" />
                                                            ) : uploadPhase === 'uploading' ? (
                                                                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                                                    {[...Array(8)].map((_, i) => {
                                                                        const angle = (i * 360) / 8;
                                                                        const rad = (angle * Math.PI) / 180;
                                                                        const cx = 12 + 8 * Math.cos(rad);
                                                                        const cy = 12 + 8 * Math.sin(rad);
                                                                        return (
                                                                            <circle
                                                                                key={i}
                                                                                cx={cx}
                                                                                cy={cy}
                                                                                r={1.5}
                                                                                fill="currentColor"
                                                                                className="text-gray-400"
                                                                                style={{ opacity: 0.15 + (i / 8) * 0.85 }}
                                                                            />
                                                                        );
                                                                    })}
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                                                    {[...Array(8)].map((_, i) => {
                                                                        const angle = (i * 360) / 8;
                                                                        const rad = (angle * Math.PI) / 180;
                                                                        const cx = 12 + 8 * Math.cos(rad);
                                                                        const cy = 12 + 8 * Math.sin(rad);
                                                                        return (
                                                                            <circle
                                                                                key={i}
                                                                                cx={cx}
                                                                                cy={cy}
                                                                                r={1.5}
                                                                                fill="currentColor"
                                                                                className="text-gray-400"
                                                                                style={{ opacity: 0.15 + (i / 8) * 0.85 }}
                                                                            />
                                                                        );
                                                                    })}
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-[rgb(27,55,121)] truncate">{file.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-mono">
                                                                {(file.size / 1024).toFixed(1)} KB · <span className={`font-semibold ${uploadPhase === 'done' ? 'text-green-500' : 'text-gray-500'}`}>{uploadPhase === 'done' ? 'Uploaded' : 'Pending'}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setStagedFiles((prev) => prev.filter((_, i) => i !== idx));
                                                        }}
                                                        className="flex-shrink-0 ml-2 p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Upload Button */}
                                <div className="mt-6 flex items-center justify-end gap-3">
                                    <button
                                        disabled={stagedFiles.length === 0 || isUploading}
                                        onClick={handleUpload}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-sm transition-all duration-200 shadow-lg ${stagedFiles.length > 0 && !isUploading
                                            ? 'bg-[rgb(27,55,121)] text-white hover:bg-[rgb(20,40,90)] shadow-[rgb(27,55,121)]/10 cursor-pointer'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                            }`}
                                    >
                                        {isUploading ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-4 h-4" />
                                                {stagedFiles.length > 0
                                                    ? `Upload ${stagedFiles.length} ${stagedFiles.length === 1 ? 'File' : 'Files'}`
                                                    : 'Upload'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Uploaded Files Section */}
                            {uploadedFiles.length > 0 && (
                                <div className="bg-white border rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-[rgb(27,55,121)] mb-1">
                                                Uploaded Files
                                            </h2>
                                            <p className="text-[rgb(27,55,121)]/70 text-sm">
                                                {uploadedFiles.length} {uploadedFiles.length === 1 ? 'file has' : 'files have'} been successfully uploaded.
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleClearAll}
                                            className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {uploadedFiles.map((file) => (
                                            <div
                                                key={`uploaded-${file.id}`}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[rgb(27,55,121)]/20 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
                                                        <Check className="w-5 h-5 text-green-500" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-[rgb(27,55,121)] truncate">{file.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-mono">
                                                            {(file.size / 1024).toFixed(1)} KB · <span className="text-green-600 font-semibold">Uploaded</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteFile(file.id);
                                                    }}
                                                    className="flex-shrink-0 ml-2 p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
        </div >
    );
}
