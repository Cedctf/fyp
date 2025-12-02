import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import ApiKeyManager from "@/components/ApiKeyManager";

export default function ApiDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Demo State
    const [demoData, setDemoData] = useState(null);
    const [demoLoading, setDemoLoading] = useState(false);
    const [demoError, setDemoError] = useState(null);
    const [testKey, setTestKey] = useState('');

    // Redirect to sign in if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
    }, [status, router]);

    // Test Public API Demo
    const runApiDemo = async (e) => {
        e.preventDefault();
        if (!testKey) {
            setDemoError("Please enter an API key.");
            return;
        }

        setDemoLoading(true);
        setDemoError(null);
        setDemoData(null);

        try {
            const res = await fetch('/api/v1/data', {
                headers: {
                    'x-api-key': testKey
                }
            });

            const data = await res.json();

            if (res.ok) {
                setDemoData(data);
            } else {
                setDemoError(data.error || "Request failed");
            }
        } catch (err) {
            setDemoError("Network error occurred");
        } finally {
            setDemoLoading(false);
        }
    };

    // Show loading state
    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, show nothing (will redirect)
    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Navigation */}
            <nav className="border-b border-gray-200 bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-xl font-bold text-gray-900">
                                FYP Platform
                            </Link>
                            <span className="text-gray-300">|</span>
                            <span className="font-semibold text-blue-600">Developer Dashboard</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/protected" className="text-sm text-gray-600 hover:text-gray-900">
                                User Dashboard
                            </Link>
                            <div className="text-sm text-gray-600">
                                Signed in as <span className="font-medium">{session.user.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="mx-auto max-w-4xl px-4 py-12">
                <div className="space-y-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            API Management
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Manage your API keys and test your integration with our public endpoints.
                        </p>
                    </div>

                    {/* API Key Management */}
                    <ApiKeyManager />

                    {/* Public API Demo */}
                    <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    API Playground
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    Test the <code>/api/v1/data</code> endpoint live.
                                </p>
                            </div>
                            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                                GET Request
                            </div>
                        </div>

                        <form onSubmit={runApiDemo} className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your API Key
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={testKey}
                                    onChange={(e) => setTestKey(e.target.value)}
                                    placeholder="Paste your API Key here (fyp_sk_...)"
                                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={demoLoading}
                                    className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                >
                                    {demoLoading ? "Sending..." : "Send Request"}
                                </button>
                            </div>
                        </form>

                        {demoError && (
                            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-600 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {demoError}
                            </div>
                        )}

                        {demoData && (
                            <div className="rounded-lg bg-gray-900 p-4 overflow-hidden shadow-inner">
                                <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
                                    <span className="text-green-400 font-mono text-sm font-bold">Status: 200 OK</span>
                                    <span className="text-gray-500 text-xs font-mono">application/json</span>
                                </div>
                                <pre className="text-green-400 font-mono text-sm overflow-x-auto custom-scrollbar">
                                    {JSON.stringify(demoData, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
