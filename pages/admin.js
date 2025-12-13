import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import AuditLogsTable from "../components/admin/AuditLogsTable";
import UserManagementTable from "../components/admin/UserManagementTable";
import { LayoutDashboard, Users, Shield } from "lucide-react";

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('users'); // Default to users

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
                </div>

                {/* Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {activeTab === 'users' && <UserManagementTable />}
                    {activeTab === 'audit' && <AuditLogsTable />}
                </div>
            </main>
        </div>
    );
}
