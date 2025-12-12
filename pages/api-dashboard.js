import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import ApiKeyManager from "@/components/ApiKeyManager";
import Navbar from "../components/Navbar";

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
            <div className="min-h-screen bg-white text-[rgb(27,55,121)] font-sans">
                <Navbar />
                <div className="flex min-h-screen items-center justify-center">
                    <div className="text-center">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[rgb(27,55,121)] border-t-transparent mx-auto"></div>
                        <p className="mt-4 text-[rgb(27,55,121)]/70">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    // If not authenticated, show nothing (will redirect)
    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white text-[rgb(27,55,121)] font-sans">
            <Head>
                <title>API Dashboard</title>
                <meta name="description" content="Manage your API keys and test your integration" />
            </Head>

            <Navbar />

            <main className="container mx-auto px-4 pt-24 pb-16">
                <header className="mb-12 mt-8">
                    <h1 className="text-4xl md:text-5xl font-serif tracking-tight border-none">
                        API Management
                    </h1>
                    <p className="text-[rgb(27,55,121)]/70 mt-3">
                        Manage your API keys and test your integration with our public endpoints.
                    </p>
                    <div className="h-px bg-[rgb(27,55,121)]/15 mt-6" />
                </header>

                <section className="space-y-10">
                    {/* API Key Management */}
                        <ApiKeyManager />

                    {/* Divider */}
                    <div className="h-px bg-[rgb(27,55,121)]/20"></div>

                    {/* Public API Demo */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h2 className="text-3xl font-serif font-semibold text-[rgb(27,55,121)] mb-4">
                                        API Playground
                                    </h2>
                                    <p className="text-[rgb(27,55,121)]/70 mt-1">
                                        Test the <code className="bg-[rgb(27,55,121)]/10 px-1 py-0.5 rounded">/api/v1/data</code> endpoint live.
                                    </p>
                                </div>
                            <div className="bg-[rgb(27,55,121)]/10 text-[rgb(27,55,121)] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ml-6">
                                    GET Request
                            </div>
                        </div>

                        <form onSubmit={runApiDemo} className="space-y-4 mt-6">
                            <div>
                                <label className="block text-sm font-semibold uppercase tracking-widest text-[rgb(27,55,121)]/70 mb-2">
                                    Your API Key
                                </label>
                                <div className="flex items-center justify-between">
                                    <input
                                        type="text"
                                        value={testKey}
                                        onChange={(e) => setTestKey(e.target.value)}
                                        placeholder="Paste your API Key here (fyp_sk_...)"
                                        className="flex-1 px-3 py-2 border border-[rgb(27,55,121)]/20 rounded-md focus:ring-2 focus:ring-[rgb(27,55,121)] focus:border-[rgb(27,55,121)] font-mono text-sm bg-white text-[rgb(27,55,121)]"
                                    />
                                    <button
                                        type="submit"
                                        disabled={demoLoading}
                                        className="ml-2 bg-[rgb(27,55,121)] text-white px-4 py-2 rounded-md font-semibold hover:bg-[rgb(27,55,121)]/90 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-3 whitespace-nowrap min-w-[200px]"
                                    >
                                        <Send className="w-4 h-4" />
                                        {demoLoading ? "Sending..." : "Send Request"}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {demoError && (
                            <div className="mx-6 mb-4 rounded-md bg-red-50 border border-red-200 p-4 text-red-600 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {demoError}
                            </div>
                        )}

                        {demoData && (
                            <div className="mx-6 mb-4 rounded-md bg-[rgb(27,55,121)] p-4 overflow-hidden shadow-inner">
                                <div className="flex justify-between items-center mb-2 border-b border-[rgb(27,55,121)]/30 pb-2">
                                    <span className="text-green-400 font-mono text-sm font-bold">Status: 200 OK</span>
                                    <span className="text-[rgb(27,55,121)]/50 text-xs font-mono">application/json</span>
                                </div>
                                <pre className="text-green-400 font-mono text-sm overflow-x-auto custom-scrollbar">
                                    {JSON.stringify(demoData, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
