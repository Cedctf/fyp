import Head from "next/head";
import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect } from "react";
import Navbar from "../../components/Navbar";
import { Mail, Lock, LogIn } from "lucide-react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Redirect if already signed in
  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  const handleCredentialsSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: "/" });
    } catch (err) {
      setError("Failed to sign in. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[rgb(27,55,121)] font-sans">
      <Head>
        <title>Sign In</title>
        <meta name="description" content="Sign in to your account" />
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <header className="mb-12 mt-8">
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight border-none">
            Sign In
          </h1>
          <p className="text-[rgb(27,55,121)]/70 mt-3">
            Sign in to your account to continue
          </p>
          <div className="h-px bg-[rgb(27,55,121)]/15 mt-6" />
        </header>

        <div className="max-w-md mx-auto space-y-8">
          {error && (
            <div className="rounded-lg bg-[rgb(87,17,17)]/5 border border-[rgb(87,17,17)]/20 p-4 text-sm text-[rgb(87,17,17)]">
              {error}
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleOAuthSignIn("google")}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-md border-2 border-[rgb(27,55,121)]/20 bg-white px-4 py-3 font-medium text-[rgb(27,55,121)] transition-all hover:bg-[rgb(27,55,121)]/5 hover:border-[rgb(27,55,121)]/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            <button
              onClick={() => handleOAuthSignIn("github")}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-md border-2 border-[rgb(27,55,121)]/20 bg-white px-4 py-3 font-medium text-[rgb(27,55,121)] transition-all hover:bg-[rgb(27,55,121)]/5 hover:border-[rgb(27,55,121)]/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Sign in with GitHub
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgb(27,55,121)]/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-[rgb(27,55,121)]/70 font-medium">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleCredentialsSignIn} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold uppercase tracking-widest text-[rgb(27,55,121)]/70 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(27,55,121)]/70" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-[rgb(27,55,121)]/20 px-4 py-3 pl-10 text-[rgb(27,55,121)] placeholder-[rgb(27,55,121)]/40 focus:border-[rgb(27,55,121)] focus:outline-none focus:ring-2 focus:ring-[rgb(27,55,121)] bg-white transition-all duration-200"
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold uppercase tracking-widest text-[rgb(27,55,121)]/70 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(27,55,121)]/70" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-[rgb(27,55,121)]/20 px-4 py-3 pl-10 text-[rgb(27,55,121)] placeholder-[rgb(27,55,121)]/40 focus:border-[rgb(27,55,121)] focus:outline-none focus:ring-2 focus:ring-[rgb(27,55,121)] bg-white transition-all duration-200"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-[rgb(27,55,121)] text-white px-4 py-3 font-semibold hover:bg-[rgb(27,55,121)]/90 transition-all focus:outline-none focus:ring-2 focus:ring-[rgb(27,55,121)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 duration-200"
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-[rgb(27,55,121)]/70">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="font-medium text-[rgb(27,55,121)] hover:text-[rgb(27,55,121)]/80 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

