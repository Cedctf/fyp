import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100 font-sans`}
    >
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
        <Image
          src="/next.svg"
                alt="Logo"
                width={80}
                height={16}
          priority
                className="dark:invert"
              />
            </div>
            
            <div className="flex items-center gap-4">
              {status === "loading" ? (
                <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200"></div>
              ) : session ? (
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {session.user.name || "User"}
                    </p>
                    <p className="text-gray-500">{session.user.email}</p>
                  </div>
                  {session.user.image && (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                  <button
                    onClick={() => signOut()}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/auth/signin"
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-4xl space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Welcome to Your App
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              {session ? (
                <>
                  You're signed in as{" "}
                  <span className="font-semibold text-blue-600">
                    {session.user.email}
                  </span>
                  . Your authentication is working perfectly!
                </>
              ) : (
                <>
                  Get started by signing up for an account or signing in with
                  your existing credentials.
                </>
              )}
            </p>
          </div>

          {session ? (
            <div className="rounded-2xl bg-white p-8 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Authentication Successful!
                  </h2>
                </div>
                
                <div className="space-y-3 text-left">
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
                    <p className="mt-1 font-mono text-gray-900">{session.user.name || "Not provided"}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  Your session is secured with JWT tokens and will expire in 30 days.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/auth/signup"
                className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 px-8 text-base font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
              >
                Get started
              </Link>
              <Link
                href="/auth/signin"
                className="flex h-12 w-full items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-8 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
              >
                Sign in
              </Link>
            </div>
          )}

          <div className="grid gap-6 pt-8 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">JWT Authentication</h3>
              <p className="mt-2 text-sm text-gray-600">
                Secure token-based authentication with automatic session management
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">OAuth Providers</h3>
              <p className="mt-2 text-sm text-gray-600">
                Sign in with Google, GitHub, or traditional email/password
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 mb-4">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Production Ready</h3>
              <p className="mt-2 text-sm text-gray-600">
                Built with NextAuth.js, the industry-standard auth solution
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
