import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Send, ChevronDown, Check } from "lucide-react";
import ApiKeyManager from "@/components/ApiKeyManager";
import Navbar from "../components/Navbar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from "sonner";


export default function ApiDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Demo State
    const [demoData, setDemoData] = useState(null);
    const [demoLoading, setDemoLoading] = useState(false);
    const [demoError, setDemoError] = useState(null);
    const [testKey, setTestKey] = useState('');
    const [selectedEndpoint, setSelectedEndpoint] = useState('/api/v1/data');

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
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="w-full md:w-[200px]">
                                    <label className="block text-sm font-semibold uppercase tracking-widest text-[rgb(27,55,121)]/70 mb-2">
                                        Endpoint
                                    </label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className="w-full px-3 py-2 border border-[rgb(27,55,121)] rounded-md focus:outline-none font-mono text-sm bg-white text-[rgb(27,55,121)] flex items-center justify-between"
                                                aria-label="Select endpoint"
                                            >
                                                <span>{selectedEndpoint}</span>
                                                <ChevronDown className="h-4 w-4 opacity-50" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] text-[rgb(27,55,121)] bg-white border border-[rgb(27,55,121)]/20">
                                            {['/api/v1/data', '/api/v1/areas', '/api/v1/availability'].map(endpoint => (
                                                <DropdownMenuItem
                                                    key={endpoint}
                                                    onSelect={() => setSelectedEndpoint(endpoint)}
                                                    className="flex items-center gap-2 text-[rgb(27,55,121)] data-[highlighted]:bg-[rgb(27,55,121)]/10 data-[highlighted]:text-[rgb(27,55,121)] font-mono text-sm cursor-pointer px-3 py-2 outline-none"
                                                >
                                                    <span className="flex-1">{endpoint}</span>
                                                    {selectedEndpoint === endpoint && <Check className="h-4 w-4" />}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-semibold uppercase tracking-widest text-[rgb(27,55,121)]/70 mb-2">
                                        Your API Key
                                    </label>
                                    <input
                                        type="text"
                                        value={testKey}
                                        onChange={(e) => setTestKey(e.target.value)}
                                        placeholder="Paste your API Key here (fyp_sk_...)"
                                        className="w-full px-3 py-2 border border-[rgb(27,55,121)] rounded-md focus:outline-none font-mono text-sm bg-white text-[rgb(27,55,121)]"
                                    />
                                </div>
                                <div className="w-full md:w-auto">
                                    <button
                                        type="submit"
                                        disabled={demoLoading}
                                        className="w-full md:w-auto bg-[rgb(27,55,121)] text-white px-4 py-2 rounded-md font-semibold hover:bg-[rgb(27,55,121)]/90 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-2 whitespace-nowrap min-w-[200px]"
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
                            <div className="mb-4 rounded-md bg-white p-4 overflow-hidden shadow-inner border border-[rgb(27,55,121)]">
                                <div className="flex justify-between items-center mb-2 border-b border-[rgb(27,55,121)]/30 pb-2">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[rgb(27,55,121)] font-mono text-sm font-bold">Status: 200 OK</span>
                                        <span className="text-[rgb(27,55,121)]/50 text-xs font-mono">application/json</span>
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(JSON.stringify(demoData, null, 2));
                                                toast.success("Copied to clipboard");
                                            }}
                                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[rgb(27,55,121)]/10 rounded-md transition-colors text-[rgb(27,55,121)]"
                                            title="Copy to clipboard"
                                        >
                                            <svg viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                                                <path d="M8.25005 8.5C8.25005 8.91421 8.58584 9.25 9.00005 9.25C9.41426 9.25 9.75005 8.91421 9.75005 8.5H8.25005ZM9.00005 8.267H9.75006L9.75004 8.26283L9.00005 8.267ZM9.93892 5.96432L10.4722 6.49171L9.93892 5.96432ZM12.2311 5V4.24999L12.2269 4.25001L12.2311 5ZM16.269 5L16.2732 4.25H16.269V5ZM18.5612 5.96432L18.0279 6.49171V6.49171L18.5612 5.96432ZM19.5 8.267L18.75 8.26283V8.267H19.5ZM19.5 12.233H18.75L18.7501 12.2372L19.5 12.233ZM18.5612 14.5357L18.0279 14.0083L18.5612 14.5357ZM16.269 15.5V16.25L16.2732 16.25L16.269 15.5ZM16 14.75C15.5858 14.75 15.25 15.0858 15.25 15.5C15.25 15.9142 15.5858 16.25 16 16.25V14.75ZM9.00005 9.25C9.41426 9.25 9.75005 8.91421 9.75005 8.5C9.75005 8.08579 9.41426 7.75 9.00005 7.75V9.25ZM8.73105 8.5V7.74999L8.72691 7.75001L8.73105 8.5ZM6.43892 9.46432L6.97218 9.99171L6.43892 9.46432ZM5.50005 11.767H6.25006L6.25004 11.7628L5.50005 11.767ZM5.50005 15.734L6.25005 15.7379V15.734H5.50005ZM8.73105 19L8.72691 19.75H8.73105V19ZM12.769 19V19.75L12.7732 19.75L12.769 19ZM15.0612 18.0357L14.5279 17.5083L15.0612 18.0357ZM16 15.733H15.25L15.2501 15.7372L16 15.733ZM16.75 15.5C16.75 15.0858 16.4143 14.75 16 14.75C15.5858 14.75 15.25 15.0858 15.25 15.5H16.75ZM9.00005 7.75C8.58584 7.75 8.25005 8.08579 8.25005 8.5C8.25005 8.91421 8.58584 9.25 9.00005 9.25V7.75ZM12.7691 8.5L12.7732 7.75H12.7691V8.5ZM15.0612 9.46432L15.5944 8.93694V8.93694L15.0612 9.46432ZM16.0001 11.767L15.2501 11.7628V11.767H16.0001ZM15.2501 15.5C15.2501 15.9142 15.5858 16.25 16.0001 16.25C16.4143 16.25 16.7501 15.9142 16.7501 15.5H15.2501ZM9.75005 8.5V8.267H8.25005V8.5H9.75005ZM9.75004 8.26283C9.74636 7.60005 10.0061 6.96296 10.4722 6.49171L9.40566 5.43694C8.65985 6.19106 8.24417 7.21056 8.25006 8.27117L9.75004 8.26283ZM10.4722 6.49171C10.9382 6.02046 11.5724 5.75365 12.2352 5.74999L12.2269 4.25001C11.1663 4.25587 10.1515 4.68282 9.40566 5.43694L10.4722 6.49171ZM12.2311 5.75H16.269V4.25H12.2311V5.75ZM16.2649 5.74999C16.9277 5.75365 17.5619 6.02046 18.0279 6.49171L19.0944 5.43694C18.3486 4.68282 17.3338 4.25587 16.2732 4.25001L16.2649 5.74999ZM18.0279 6.49171C18.494 6.96296 18.7537 7.60005 18.7501 8.26283L20.25 8.27117C20.2559 7.21056 19.8402 6.19106 19.0944 5.43694L18.0279 6.49171ZM18.75 8.267V12.233H20.25V8.267H18.75ZM18.7501 12.2372C18.7537 12.8999 18.494 13.537 18.0279 14.0083L19.0944 15.0631C19.8402 14.3089 20.2559 13.2894 20.25 12.2288L18.7501 12.2372ZM18.0279 14.0083C17.5619 14.4795 16.9277 14.7463 16.2649 14.75L16.2732 16.25C17.3338 16.2441 18.3486 15.8172 19.0944 15.0631L18.0279 14.0083ZM16.269 14.75H16V16.25H16.269V14.75ZM9.00005 7.75H8.73105V9.25H9.00005V7.75ZM8.72691 7.75001C7.6663 7.75587 6.65146 8.18282 5.90566 8.93694L6.97218 9.99171C7.43824 9.52046 8.07241 9.25365 8.73519 9.24999L8.72691 7.75001ZM5.90566 8.93694C5.15985 9.69106 4.74417 10.7106 4.75006 11.7712L6.25004 11.7628C6.24636 11.1001 6.50612 10.463 6.97218 9.99171L5.90566 8.93694ZM4.75005 11.767V15.734H6.25005V11.767H4.75005ZM4.75006 15.7301C4.73847 17.9382 6.51879 19.7378 8.72691 19.75L8.7352 18.25C7.35533 18.2424 6.2428 17.1178 6.25004 15.7379L4.75006 15.7301ZM8.73105 19.75H12.769V18.25H8.73105V19.75ZM12.7732 19.75C13.8338 19.7441 14.8486 19.3172 15.5944 18.5631L14.5279 17.5083C14.0619 17.9795 13.4277 18.2463 12.7649 18.25L12.7732 19.75ZM15.5944 18.5631C16.3402 17.8089 16.7559 16.7894 16.75 15.7288L15.2501 15.7372C15.2537 16.3999 14.994 17.037 14.5279 17.5083L15.5944 18.5631ZM16.75 15.733V15.5H15.25V15.733H16.75ZM9.00005 9.25H12.7691V7.75H9.00005V9.25ZM12.7649 9.24999C13.4277 9.25365 14.0619 9.52046 14.5279 9.99171L15.5944 8.93694C14.8486 8.18282 13.8338 7.75587 12.7732 7.75001L12.7649 9.24999ZM14.5279 9.99171C14.994 10.463 15.2537 11.1001 15.2501 11.7628L16.75 11.7712C16.7559 10.7106 16.3402 9.69106 15.5944 8.93694L14.5279 9.99171ZM15.2501 11.767V15.5H16.7501V11.767H15.2501Z" fill="currentColor" />
                                            </svg>
                                            <span className="text-xs uppercase tracking-wider">Copy</span>
                                        </button>

                                    </div>
                                </div>
                                <pre className="text-[rgb(27,55,121)] font-mono text-sm overflow-x-auto custom-scrollbar columns-1 md:columns-2 gap-8">
                                    {JSON.stringify(demoData, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-[rgb(27,55,121)]/20"></div>

                    {/* Test Alert System */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h2 className="text-3xl font-serif font-semibold text-[rgb(27,55,121)] mb-4">
                                    Test Alert System
                                </h2>
                                <p className="text-[rgb(27,55,121)]/70 mt-1">
                                    Trigger the backend email alert system manually. This will scan for high-risk users and trigger email alerts.
                                </p>
                            </div>
                            <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ml-6">
                                ADMIN ONLY
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={runAlertTest}
                                disabled={alertLoading}
                                className="bg-[rgb(27,55,121)] text-white px-6 py-3 rounded-md font-semibold hover:bg-[rgb(27,55,121)]/90 disabled:opacity-50 transition-colors text-sm flex items-center gap-3 shadow-lg shadow-[rgb(27,55,121)]/10"
                            >
                                <Send className="w-4 h-4" />
                                {alertLoading ? "Triggering Alerts..." : "Trigger Email Alerts"}
                            </button>
                        </div>

                        {alertResponse && (
                            <div className="mt-6 rounded-md bg-[rgb(27,55,121)] p-4 overflow-hidden shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex justify-between items-center mb-2 border-b border-[rgb(27,55,121)]/30 pb-2">
                                    <span className="text-green-400 font-mono text-sm font-bold">System Log</span>
                                    <span className="text-[rgb(27,55,121)]/50 text-xs font-mono">timestamp: {new Date().toLocaleTimeString()}</span>
                                </div>
                                <pre className="text-green-400 font-mono text-sm overflow-x-auto custom-scrollbar">
                                    {JSON.stringify(alertResponse, null, 2)}
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

                        <div className="space-y-6">
                            {/* Authentication */}
                            <div className="group">
                                <div className="flex items-center gap-4 mb-2">
                                    <span className="bg-[rgb(27,55,121)] text-white px-2 py-1 rounded text-xs font-bold font-mono">AUTH</span>
                                    <h3 className="text-lg font-mono text-[rgb(27,55,121)] font-semibold">Authentication</h3>
                                </div>
                                <p className="text-sm text-[rgb(27,55,121)]/70 mb-4">
                                    All API requests must include your API key in the header.
                                </p>
                                <div className="mb-4 rounded-md bg-white p-4 overflow-hidden shadow-inner border border-[rgb(27,55,121)]">
                                    <div className="flex justify-between items-center mb-2 border-b border-[rgb(27,55,121)]/30 pb-2">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[rgb(27,55,121)] font-mono text-sm font-bold">Header Example</span>
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText('x-api-key: YOUR_API_KEY');
                                                    toast.success("Copied to clipboard");
                                                }}
                                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-[rgb(27,55,121)]/10 rounded-md transition-colors text-[rgb(27,55,121)]"
                                                title="Copy to clipboard"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                                </svg>
                                                <span className="text-xs uppercase tracking-wider">Copy</span>
                                            </button>
                                        </div>
                                    </div>
                                    <pre className="text-[rgb(27,55,121)] font-mono text-sm overflow-x-auto custom-scrollbar">
                                        x-api-key: YOUR_API_KEY
                                    </pre>
                                </div>
                            </div>

                            {/* Response Format */}
                            <div className="group pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-4 mb-2">
                                    <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold font-mono">JSON</span>
                                    <h3 className="text-lg font-mono text-[rgb(27,55,121)] font-semibold">Standard Response</h3>
                                </div>
                                <div className="mb-4 rounded-md bg-white p-4 overflow-hidden shadow-inner border border-[rgb(27,55,121)]">
                                    <div className="flex justify-between items-center mb-2 border-b border-[rgb(27,55,121)]/30 pb-2">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[rgb(27,55,121)] font-mono text-sm font-bold">JSON Structure</span>
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`{
    "message": "Success",
    "meta": {
        "count": 100,
        "timestamp": "2025-12-14T...",
        "request_id": "abc123xyz"
    },
    "data": [...]
}`);
                                                    toast.success("Copied to clipboard");
                                                }}
                                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-[rgb(27,55,121)]/10 rounded-md transition-colors text-[rgb(27,55,121)]"
                                                title="Copy to clipboard"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                                </svg>
                                                <span className="text-xs uppercase tracking-wider">Copy</span>
                                            </button>
                                        </div>
                                    </div>
                                    <pre className="text-[rgb(27,55,121)] font-mono text-sm overflow-x-auto custom-scrollbar">
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
                        </div>

                        {/* Endpoints */}
                        <div className="h-px bg-[rgb(27,55,121)]/20"></div>
                        <div className="space-y-6">
                            <h2 className="text-3xl font-serif font-semibold text-[rgb(27,55,121)] mb-4">Endpoints</h2>

                            {/* GET /data */}
                            <div className="group">
                                <div className="flex items-center gap-4 mb-2">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold font-mono">GET</span>
                                    <code className="text-lg font-mono text-[rgb(27,55,121)]">/api/v1/data</code>
                                </div>
                                <p className="text-sm text-[rgb(27,55,121)]/70 mb-4">
                                    Retrieve dengue case records with optional filtering.
                                </p>
                                <div className="rounded-md overflow-hidden">
                                    <table className="w-full text-sm text-left overflow-x-auto no-scrollbar">
                                        <thead className="text-xs text-[rgb(27,55,121)] uppercase bg-gray-50 font-serif tracking-wider font-semibold">
                                            <tr>
                                                <th className="px-4 py-2">Parameter</th>
                                                <th className="px-4 py-2">Type</th>
                                                <th className="px-4 py-2">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[rgb(27,55,121)]/20">
                                            <tr className="hover:bg-[rgb(27,55,121)]/10 cursor-pointer transition-colors bg-[rgb(27,55,121)]/5">
                                                <td className="px-4 py-4 font-mono text-[rgb(27,55,121)] font-medium">area</td>
                                                <td className="px-4 py-4 text-[rgb(27,55,121)]/70">string</td>
                                                <td className="px-4 py-4 text-[rgb(27,55,121)]/70">Filter by area name (e.g., "Kepong")</td>
                                            </tr>
                                            <tr className="hover:bg-[rgb(27,55,121)]/10 cursor-pointer transition-colors">
                                                <td className="px-4 py-4 font-mono text-[rgb(27,55,121)] font-medium">date</td>
                                                <td className="px-4 py-4 text-[rgb(27,55,121)]/70">YYYY-MM-DD</td>
                                                <td className="px-4 py-4 text-[rgb(27,55,121)]/70">Get cases for a specific date</td>
                                            </tr>
                                            <tr className="hover:bg-[rgb(27,55,121)]/10 cursor-pointer transition-colors bg-[rgb(27,55,121)]/5">
                                                <td className="px-4 py-4 font-mono text-[rgb(27,55,121)] font-medium">start_date</td>
                                                <td className="px-4 py-4 text-[rgb(27,55,121)]/70">YYYY-MM-DD</td>
                                                <td className="px-4 py-4 text-[rgb(27,55,121)]/70">Filter records from this date</td>
                                            </tr>
                                            <tr className="hover:bg-[rgb(27,55,121)]/10 cursor-pointer transition-colors">
                                                <td className="px-4 py-4 font-mono text-[rgb(27,55,121)] font-medium">end_date</td>
                                                <td className="px-4 py-4 text-[rgb(27,55,121)]/70">YYYY-MM-DD</td>
                                                <td className="px-4 py-4 text-[rgb(27,55,121)]/70">Filter records up to this date</td>
                                            </tr>
                                            <tr className="hover:bg-[rgb(27,55,121)]/10 cursor-pointer transition-colors bg-[rgb(27,55,121)]/5">
                                                <td className="px-4 py-4 font-mono text-[rgb(27,55,121)] font-medium">limit</td>
                                                <td className="px-4 py-4 text-[rgb(27,55,121)]/70">number</td>
                                                <td className="px-4 py-4 text-[rgb(27,55,121)]/70">Max records (default: 5). Set to 0 for all.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="mt-4 mb-4 rounded-md bg-white p-4 overflow-hidden shadow-inner border border-[rgb(27,55,121)]">
                                <div className="flex justify-between items-center mb-2 border-b border-[rgb(27,55,121)]/30 pb-2">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[rgb(27,55,121)] font-mono text-sm font-bold">Example Request</span>
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText('curl -H "x-api-key: YOUR_KEY" "http://localhost:3000/api/v1/data?area=Kepong&limit=5"');
                                                toast.success("Copied to clipboard");
                                            }}
                                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[rgb(27,55,121)]/10 rounded-md transition-colors text-[rgb(27,55,121)]"
                                            title="Copy to clipboard"
                                        >
                                            <svg viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                                                <path d="M8.25005 8.5C8.25005 8.91421 8.58584 9.25 9.00005 9.25C9.41426 9.25 9.75005 8.91421 9.75005 8.5H8.25005ZM9.00005 8.267H9.75006L9.75004 8.26283L9.00005 8.267ZM9.93892 5.96432L10.4722 6.49171L9.93892 5.96432ZM12.2311 5V4.24999L12.2269 4.25001L12.2311 5ZM16.269 5L16.2732 4.25H16.269V5ZM18.5612 5.96432L18.0279 6.49171V6.49171L18.5612 5.96432ZM19.5 8.267L18.75 8.26283V8.267H19.5ZM19.5 12.233H18.75L18.7501 12.2372L19.5 12.233ZM18.5612 14.5357L18.0279 14.0083L18.5612 14.5357ZM16.269 15.5V16.25L16.2732 16.25L16.269 15.5ZM16 14.75C15.5858 14.75 15.25 15.0858 15.25 15.5C15.25 15.9142 15.5858 16.25 16 16.25V14.75ZM9.00005 9.25C9.41426 9.25 9.75005 8.91421 9.75005 8.5C9.75005 8.08579 9.41426 7.75 9.00005 7.75V9.25ZM8.73105 8.5V7.74999L8.72691 7.75001L8.73105 8.5ZM6.43892 9.46432L6.97218 9.99171L6.43892 9.46432ZM5.50005 11.767H6.25006L6.25004 11.7628L5.50005 11.767ZM5.50005 15.734L6.25005 15.7379V15.734H5.50005ZM8.73105 19L8.72691 19.75H8.73105V19ZM12.769 19V19.75L12.7732 19.75L12.769 19ZM15.0612 18.0357L14.5279 17.5083L15.0612 18.0357ZM16 15.733H15.25L15.2501 15.7372L16 15.733ZM16.75 15.5C16.75 15.0858 16.4143 14.75 16 14.75C15.5858 14.75 15.25 15.0858 15.25 15.5H16.75ZM9.00005 7.75C8.58584 7.75 8.25005 8.08579 8.25005 8.5C8.25005 8.91421 8.58584 9.25 9.00005 9.25V7.75ZM12.7691 8.5L12.7732 7.75H12.7691V8.5ZM15.0612 9.46432L15.5944 8.93694V8.93694L15.0612 9.46432ZM16.0001 11.767L15.2501 11.7628V11.767H16.0001ZM15.2501 15.5C15.2501 15.9142 15.5858 16.25 16.0001 16.25C16.4143 16.25 16.7501 15.9142 16.7501 15.5H15.2501ZM9.75005 8.5V8.267H8.25005V8.5H9.75005ZM9.75004 8.26283C9.74636 7.60005 10.0061 6.96296 10.4722 6.49171L9.40566 5.43694C8.65985 6.19106 8.24417 7.21056 8.25006 8.27117L9.75004 8.26283ZM10.4722 6.49171C10.9382 6.02046 11.5724 5.75365 12.2352 5.74999L12.2269 4.25001C11.1663 4.25587 10.1515 4.68282 9.40566 5.43694L10.4722 6.49171ZM12.2311 5.75H16.269V4.25H12.2311V5.75ZM16.2649 5.74999C16.9277 5.75365 17.5619 6.02046 18.0279 6.49171L19.0944 5.43694C18.3486 4.68282 17.3338 4.25587 16.2732 4.25001L16.2649 5.74999ZM18.0279 6.49171C18.494 6.96296 18.7537 7.60005 18.7501 8.26283L20.25 8.27117C20.2559 7.21056 19.8402 6.19106 19.0944 5.43694L18.0279 6.49171ZM18.75 8.267V12.233H20.25V8.267H18.75ZM18.7501 12.2372C18.7537 12.8999 18.494 13.537 18.0279 14.0083L19.0944 15.0631C19.8402 14.3089 20.2559 13.2894 20.25 12.2288L18.7501 12.2372ZM18.0279 14.0083C17.5619 14.4795 16.9277 14.7463 16.2649 14.75L16.2732 16.25C17.3338 16.2441 18.3486 15.8172 19.0944 15.0631L18.0279 14.0083ZM16.269 14.75H16V16.25H16.269V14.75ZM9.00005 7.75H8.73105V9.25H9.00005V7.75ZM8.72691 7.75001C7.6663 7.75587 6.65146 8.18282 5.90566 8.93694L6.97218 9.99171C7.43824 9.52046 8.07241 9.25365 8.73519 9.24999L8.72691 7.75001ZM5.90566 8.93694C5.15985 9.69106 4.74417 10.7106 4.75006 11.7712L6.25004 11.7628C6.24636 11.1001 6.50612 10.463 6.97218 9.99171L5.90566 8.93694ZM4.75005 11.767V15.734H6.25005V11.767H4.75005ZM4.75006 15.7301C4.73847 17.9382 6.51879 19.7378 8.72691 19.75L8.7352 18.25C7.35533 18.2424 6.2428 17.1178 6.25004 15.7379L4.75006 15.7301ZM8.73105 19.75H12.769V18.25H8.73105V19.75ZM12.7732 19.75C13.8338 19.7441 14.8486 19.3172 15.5944 18.5631L14.5279 17.5083C14.0619 17.9795 13.4277 18.2463 12.7649 18.25L12.7732 19.75ZM15.5944 18.5631C16.3402 17.8089 16.7559 16.7894 16.75 15.7288L15.2501 15.7372C15.2537 16.3999 14.994 17.037 14.5279 17.5083L15.5944 18.5631ZM16.75 15.733V15.5H15.25V15.733H16.75ZM9.00005 9.25H12.7691V7.75H9.00005V9.25ZM12.7649 9.24999C13.4277 9.25365 14.0619 9.52046 14.5279 9.99171L15.5944 8.93694C14.8486 8.18282 13.8338 7.75587 12.7732 7.75001L12.7649 9.24999ZM14.5279 9.99171C14.994 10.463 15.2537 11.1001 15.2501 11.7628L16.75 11.7712C16.7559 10.7106 16.3402 9.69106 15.5944 8.93694L14.5279 9.99171ZM15.2501 11.767V15.5H16.7501V11.767H15.2501Z" fill="currentColor" />
                                            </svg>
                                            <span className="text-xs uppercase tracking-wider">Copy</span>
                                        </button>

                                    </div>
                                </div>
                                <pre className="text-[rgb(27,55,121)] font-mono text-sm overflow-x-auto custom-scrollbar">
                                    curl -H "x-api-key: YOUR_KEY" "http://localhost:3000/api/v1/data?area=Kepong&limit=5"
                                </pre>
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
                                <div className="my-4 rounded-md overflow-hidden">
                                    <table className="w-full text-sm text-left overflow-x-auto no-scrollbar">
                                        <thead className="text-xs text-[rgb(27,55,121)] uppercase bg-gray-50 font-serif tracking-wider font-semibold">
                                            <tr>
                                                <th className="px-4 py-2">Parameter</th>
                                                <th className="px-4 py-2">Type</th>
                                                <th className="px-4 py-2">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[rgb(27,55,121)]/20">
                                            <tr className="hover:bg-[rgb(27,55,121)]/10 cursor-pointer transition-colors bg-[rgb(27,55,121)]/5">
                                                <td className="px-4 py-4 font-mono text-[rgb(27,55,121)] font-medium">area</td>
                                                <td className="px-4 py-4 text-[rgb(27,55,121)]/70">string</td>
                                                <td className="px-4 py-4 text-[rgb(27,55,121)]/70">Filter by area name (e.g., "Kepong")</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mb-4 rounded-md bg-white p-4 overflow-hidden shadow-inner border border-[rgb(27,55,121)]">
                                    <div className="flex justify-between items-center mb-2 border-b border-[rgb(27,55,121)]/30 pb-2">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[rgb(27,55,121)] font-mono text-sm font-bold">Example Request</span>
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText('curl -H "x-api-key: YOUR_KEY" "http://localhost:3000/api/v1/areas"');
                                                    toast.success("Copied to clipboard");
                                                }}
                                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-[rgb(27,55,121)]/10 rounded-md transition-colors text-[rgb(27,55,121)]"
                                                title="Copy to clipboard"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                                </svg>
                                                <span className="text-xs uppercase tracking-wider">Copy</span>
                                            </button>
                                        </div>
                                    </div>
                                    <pre className="text-[rgb(27,55,121)] font-mono text-sm overflow-x-auto custom-scrollbar">
                                        curl -H "x-api-key: YOUR_KEY" "http://localhost:3000/api/v1/areas"
                                    </pre>
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
                                <div className="my-4 rounded-md overflow-hidden">
                                    <table className="w-full text-sm text-left overflow-x-auto no-scrollbar">
                                        <thead className="text-xs text-[rgb(27,55,121)] uppercase bg-gray-50 font-serif tracking-wider font-semibold">
                                            <tr>
                                                <th className="px-4 py-2">Parameter</th>
                                                <th className="px-4 py-2">Type</th>
                                                <th className="px-4 py-2">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[rgb(27,55,121)]/20">
                                            <tr className="hover:bg-[rgb(27,55,121)]/10 cursor-pointer transition-colors bg-[rgb(27,55,121)]/5">
                                                <td className="px-4 py-4 font-mono text-[rgb(27,55,121)] font-medium">start_date</td>
                                                <td className="px-4 py-4 text-[rgb(27,55,121)]/70">YYYY-MM-DD</td>
                                                <td className="px-4 py-4 text-[rgb(27,55,121)]/70">Filter records from this date</td>
                                            </tr>
                                            <tr className="hover:bg-[rgb(27,55,121)]/10 cursor-pointer transition-colors">
                                                <td className="px-4 py-4 font-mono text-[rgb(27,55,121)] font-medium">end_date</td>
                                                <td className="px-4 py-4 text-[rgb(27,55,121)]/70">YYYY-MM-DD</td>
                                                <td className="px-4 py-4 text-[rgb(27,55,121)]/70">Filter records up to this date</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mb-4 rounded-md bg-white p-4 overflow-hidden shadow-inner border border-[rgb(27,55,121)]">
                                    <div className="flex justify-between items-center mb-2 border-b border-[rgb(27,55,121)]/30 pb-2">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[rgb(27,55,121)] font-mono text-sm font-bold">Example Request</span>
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText('curl -H "x-api-key: YOUR_KEY" "http://localhost:3000/api/v1/availability"');
                                                    toast.success("Copied to clipboard");
                                                }}
                                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-[rgb(27,55,121)]/10 rounded-md transition-colors text-[rgb(27,55,121)]"
                                                title="Copy to clipboard"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                                </svg>
                                                <span className="text-xs uppercase tracking-wider">Copy</span>
                                            </button>
                                        </div>
                                    </div>
                                    <pre className="text-[rgb(27,55,121)] font-mono text-sm overflow-x-auto custom-scrollbar">
                                        curl -H "x-api-key: YOUR_KEY" "http://localhost:3000/api/v1/availability"
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
