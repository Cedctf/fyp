import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Example of a protected page
 * This page can only be accessed by authenticated users
 */
export default function ProtectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apiData, setApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch data from protected API route
  const fetchProtectedData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/protected-example");
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to fetch data");
      } else {
        setApiData(data);
      }
    } catch (err) {
      setError("An error occurred while fetching data");
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              ← Back to Home
            </Link>
            <div className="text-sm text-gray-600">
              Signed in as <span className="font-medium">{session.user.email}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="space-y-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-4xl font-bold text-gray-900">
              Protected Page
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              This page can only be accessed by authenticated users
            </p>
          </div>

          {/* Session Information */}
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Session Information
            </h2>
            <div className="space-y-3">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-500">User ID</p>
                <p className="mt-1 font-mono text-gray-900">{session.user.id || "N/A"}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 font-mono text-gray-900">{session.user.email}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="mt-1 font-mono text-gray-900">
                  {session.user.name || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* API Example */}
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Protected API Example
            </h2>
            <p className="text-gray-600 mb-6">
              Click the button below to fetch data from a protected API route that
              requires authentication.
            </p>

            <button
              onClick={fetchProtectedData}
              disabled={isLoading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Loading..." : "Fetch Protected Data"}
            </button>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-600">
                {error}
              </div>
            )}

            {apiData && (
              <div className="mt-6 rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-sm font-medium text-green-800 mb-2">
                  API Response:
                </p>
                <pre className="text-sm text-green-700 overflow-x-auto">
                  {JSON.stringify(apiData, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Code Examples */}
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How This Works
            </h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Client-Side Protection:
                </h3>
                <p className="text-sm">
                  This page uses the <code className="px-2 py-1 bg-gray-100 rounded">useSession()</code> hook
                  to check if a user is authenticated. If not, they're redirected to the sign-in page.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Server-Side Protection:
                </h3>
                <p className="text-sm">
                  Protected API routes use{" "}
                  <code className="px-2 py-1 bg-gray-100 rounded">getServerSession()</code> to verify
                  authentication on the server before returning data.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">JWT Tokens:</h3>
                <p className="text-sm">
                  Your session is stored in a secure, HTTP-only JWT token that automatically
                  refreshes and is sent with each request.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

