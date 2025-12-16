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
    const [selectedEndpoint, setSelectedEndpoint] = useState('/api/v1/data');



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
            const res = await fetch(selectedEndpoint, {
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
                                    Test the <code className="bg-[rgb(27,55,121)]/10 px-1 py-0.5 rounded">{selectedEndpoint}</code> endpoint live.
                                </p>
                            </div>
                            <div className="bg-[rgb(27,55,121)]/10 text-[rgb(27,55,121)] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ml-6">
                                GET Request
                            </div>
                        </div>

                        <form onSubmit={runApiDemo} className="space-y-4 mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold uppercase tracking-widest text-[rgb(27,55,121)]/70 mb-2">
                                        Endpoint
                                    </label>
                                    <select
                                        value={selectedEndpoint}
                                        onChange={(e) => setSelectedEndpoint(e.target.value)}
                                        className="w-full px-3 py-2 border border-[rgb(27,55,121)]/20 rounded-md focus:ring-2 focus:ring-[rgb(27,55,121)] focus:border-[rgb(27,55,121)] font-mono text-sm bg-white text-[rgb(27,55,121)]"
                                    >
                                        <option value="/api/v1/data">/api/v1/data</option>
                                        <option value="/api/v1/areas">/api/v1/areas</option>
                                        <option value="/api/v1/availability">/api/v1/availability</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold uppercase tracking-widest text-[rgb(27,55,121)]/70 mb-2">
                                        Your API Key
                                    </label>
                                    <input
                                        type="text"
                                        value={testKey}
                                        onChange={(e) => setTestKey(e.target.value)}
                                        placeholder="Paste your API Key here (fyp_sk_...)"
                                        className="w-full px-3 py-2 border border-[rgb(27,55,121)]/20 rounded-md focus:ring-2 focus:ring-[rgb(27,55,121)] focus:border-[rgb(27,55,121)] font-mono text-sm bg-white text-[rgb(27,55,121)]"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={demoLoading}
                                    className="bg-[rgb(27,55,121)] text-white px-4 py-2 rounded-md font-semibold hover:bg-[rgb(27,55,121)]/90 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-3 whitespace-nowrap min-w-[150px]"
                                >
                                    <Send className="w-4 h-4" />
                                    {demoLoading ? "Sending..." : "Send Request"}
                                </button>
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


                    {/* API Documentation */}
                    <div className="h-px bg-[rgb(27,55,121)]/20"></div>

                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-serif font-semibold text-[rgb(27,55,121)] mb-4">
                                Documentation
                            </h2>
                            <p className="text-[rgb(27,55,121)]/70">
                                Official reference for the Dengue Data API.
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            {/* Authentication */}
                            <div className="bg-white border border-[rgb(27,55,121)]/10 rounded-lg p-6 shadow-sm">
                                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <span className="bg-[rgb(27,55,121)] text-white text-xs px-2 py-1 rounded">AUTH</span>
                                    Authentication
                                </h3>
                                <p className="text-sm text-[rgb(27,55,121)]/70 mb-4">
                                    All API requests must include your API key in the header.
                                </p>
                                <div className="bg-gray-50 p-3 rounded border border-gray-200 font-mono text-xs text-[rgb(27,55,121)]">
                                    x-api-key: YOUR_API_KEY
                                </div>
                            </div>

                            {/* Response Format */}
                            <div className="bg-white border border-[rgb(27,55,121)]/10 rounded-lg p-6 shadow-sm">
                                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">JSON</span>
                                    Standard Response
                                </h3>
                                <pre className="bg-gray-50 p-3 rounded border border-gray-200 font-mono text-xs text-[rgb(27,55,121)] overflow-x-auto">
                                    {`{
  "message": "Success",
  "meta": {
    "count": 100,
    "timestamp": "2025-12-14T...",
    "request_id": "abc123xyz"
  },
  "data": [...]
}`}
                                </pre>
                            </div>
                        </div>

                        {/* Endpoints */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold border-b border-[rgb(27,55,121)]/10 pb-2">Endpoints</h3>

                            {/* GET /data */}
                            <div className="group">
                                <div className="flex items-center gap-4 mb-2">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold font-mono">GET</span>
                                    <code className="text-lg font-mono text-[rgb(27,55,121)]">/api/v1/data</code>
                                </div>
                                <p className="text-sm text-[rgb(27,55,121)]/70 mb-4">
                                    Retrieve dengue case records with optional filtering.
                                </p>
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-[rgb(27,55,121)]/50 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2">Parameter</th>
                                            <th className="px-4 py-2">Type</th>
                                            <th className="px-4 py-2">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <tr>
                                            <td className="px-4 py-2 font-mono text-[rgb(27,55,121)]">area</td>
                                            <td className="px-4 py-2 text-gray-500">string</td>
                                            <td className="px-4 py-2">Filter by area name (e.g., "Kepong")</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 font-mono text-[rgb(27,55,121)]">date</td>
                                            <td className="px-4 py-2 text-gray-500">YYYY-MM-DD</td>
                                            <td className="px-4 py-2">Get cases for a specific date</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 font-mono text-[rgb(27,55,121)]">start_date</td>
                                            <td className="px-4 py-2 text-gray-500">YYYY-MM-DD</td>
                                            <td className="px-4 py-2">Filter records from this date</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 font-mono text-[rgb(27,55,121)]">end_date</td>
                                            <td className="px-4 py-2 text-gray-500">YYYY-MM-DD</td>
                                            <td className="px-4 py-2">Filter records up to this date</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 font-mono text-[rgb(27,55,121)]">limit</td>
                                            <td className="px-4 py-2 text-gray-500">number</td>
                                            <td className="px-4 py-2">Max records (default: 5). Set to 0 for all.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 bg-gray-50 p-3 rounded border border-gray-200 font-mono text-xs text-[rgb(27,55,121)] overflow-x-auto">
                                <span className="text-gray-400 select-none block mb-1"># Example Request</span>
                                <code className="block whitespace-pre">
                                    curl -H "x-api-key: YOUR_KEY" "http://localhost:3000/api/v1/data?area=Kepong&limit=5"
                                </code>
                            </div>

                            {/* GET /areas */}
                            <div className="group pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-4 mb-2">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold font-mono">GET</span>
                                    <code className="text-lg font-mono text-[rgb(27,55,121)]">/api/v1/areas</code>
                                </div>
                                <p className="text-sm text-[rgb(27,55,121)]/70">
                                    Get a list of all available districts/areas in the database.
                                </p>
                                <div className="mb-4 bg-gray-50 p-3 rounded border border-gray-200 font-mono text-xs text-[rgb(27,55,121)] overflow-x-auto">
                                    <span className="text-gray-400 select-none block mb-1"># Example Request</span>
                                    <code className="block whitespace-pre">
                                        curl -H "x-api-key: YOUR_KEY" "http://localhost:3000/api/v1/areas"
                                    </code>
                                </div>
                            </div>

                            {/* GET /availability */}
                            <div className="group pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-4 mb-2">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold font-mono">GET</span>
                                    <code className="text-lg font-mono text-[rgb(27,55,121)]">/api/v1/availability</code>
                                </div>
                                <p className="text-sm text-[rgb(27,55,121)]/70">
                                    Get metadata about the dataset, including the full date range of available records.
                                </p>
                                <div className="mb-4 bg-gray-50 p-3 rounded border border-gray-200 font-mono text-xs text-[rgb(27,55,121)] overflow-x-auto">
                                    <span className="text-gray-400 select-none block mb-1"># Example Request</span>
                                    <code className="block whitespace-pre">
                                        curl -H "x-api-key: YOUR_KEY" "http://localhost:3000/api/v1/availability"
                                    </code>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
