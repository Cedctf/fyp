import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import AuditLogsTable from "../components/admin/AuditLogsTable";
import UserManagementTable from "../components/admin/UserManagementTable";
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
