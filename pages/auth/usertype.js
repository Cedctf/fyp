import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { AnimatedFeatureCard } from "../../components/ui/animated-feature-card";
import { MultiStepSignUp } from "@/components/ui/multi-step-signup";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function UserType() {
  const router = useRouter();
  const { data: session } = useSession();

  // "new" or "existing" or null
  const [expandedType, setExpandedType] = useState(null);

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Signup states
  const [signupError, setSignupError] = useState("");
  const [showSignupEmailForm, setShowSignupEmailForm] = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  // --- Login Handlers ---
  const handleCredentialsSignIn = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: loginEmail,
        password: loginPassword,
      });

      if (result?.error) {
        setLoginError("Invalid email or password. Please try again.");
      } else {
        router.push("/");
      }
    } catch (err) {
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: "/" });
    } catch (err) {
      setLoginError("Failed to sign in. Please try again.");
      setIsLoading(false);
    }
  };

  // --- Signup Handlers ---
  const handleMultiStepSubmit = async ({
    name,
    email,
    address,
    phone,
    password,
  }) => {
    setSignupError("");



    if (password.length < 8) {
      setSignupError("Password must be at least 8 characters long");
      return;
    }

    if (name.trim().length === 0) {
      setSignupError("Please enter your name");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase(),
          password,
          address: address.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSignupError(data.message || "Failed to create account");
        setIsLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        redirect: false,
        email: email.toLowerCase(),
        password,
      });

      if (signInResult?.error) {
        setSignupError("Account created! Please sign in manually.");
        setTimeout(() => {
          setExpandedType("existing");
        }, 2000);
      } else {
        router.push("/");
      }
    } catch (err) {
      setSignupError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (showSignupEmailForm) {
      setShowSignupEmailForm(false);
      setSignupError("");
    } else {
      setExpandedType(null);
      setLoginError("");
      setSignupError("");
    }
  };

  return (
    <div className="min-h-screen bg-white text-[rgb(27,55,121)] font-sans">
      <Head>
        <title>Choose User Type</title>
        <meta name="description" content="Select your user type" />
      </Head>

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-12">
        <LayoutGroup>
          <motion.div
            layout
            className="mx-auto max-w-3xl text-center space-y-4 mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight">
              Welcome
            </h1>
            <p className="text-[rgb(27,55,121)]/70">
              Choose your user type to continue
            </p>
          </motion.div>

          <div className="relative w-full min-h-[600px] flex justify-center items-start">
            <AnimatePresence mode="popLayout">
              {!expandedType ? (
                <motion.div
                  key="choices"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid w-full max-w-5xl grid-cols-1 gap-8 mx-auto place-items-center justify-center md:grid-cols-2 md:gap-10"
                >
                  {/* New User Card */}
                  <motion.div layoutId="card-new">
                    <AnimatedFeatureCard
                      title="New User"
                      description="Start your journey with a guided onboarding and create your account in minutes."
                      imageSrc="https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=600&q=80"
                      featureNumber="01"
                      handle="@onboarding"
                      onClick={() => setExpandedType("new")}
                    />
                  </motion.div>

                  {/* Existing User Card */}
                  <motion.div layoutId="card-existing">
                    <AnimatedFeatureCard
                      title="Existing User"
                      description="Jump back into your dashboard and continue right where you left off."
                      imageSrc="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80"
                      featureNumber="02"
                      handle="@welcome-back"
                      onClick={() => setExpandedType("existing")}
                    />
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Expanded New User */}
            <AnimatePresence>
              {expandedType === "new" && (
                <motion.div
                  layoutId="card-new"
                  className="absolute top-0 w-full max-w-5xl rounded-3xl bg-gradient-to-b from-green-50/50 to-emerald-50/30 backdrop-blur-sm border border-[rgb(27,55,121)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden z-20"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                >
                  <div className="flex flex-col md:flex-row divide-y md:divide-y-0 h-[600px] relative">
                    <button
                      onClick={() => {
                        setExpandedType(null);
                        setShowSignupEmailForm(false);
                        setSignupError("");
                      }}
                      className="absolute top-8 left-8 z-30 inline-flex items-center text-[rgb(27,55,121)]/60 hover:text-[rgb(27,55,121)] transition-colors font-semibold tracking-wide text-sm group"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                      CHANGE USER TYPE
                    </button>
                    {/* Left info panel */}
                    <div className="hidden md:flex w-full md:w-1/2 p-8 items-center justify-center">
                      <div className="w-full max-w-md space-y-6 text-center">
                        <div className="mx-auto mb-6 flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-100">
                          <img
                            src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=600&q=80"
                            alt="New User"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <h3 className="text-2xl font-semibold text-slate-900">
                          New User
                        </h3>
                        <p className="mt-3 text-sm text-slate-600 px-8">
                          Start your journey with a guided onboarding and create your account in minutes.
                        </p>
                        <p className="mt-4 text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                          @onboarding
                        </p>

                      </div>
                    </div>

                    {/* Separator */}
                    <div className="hidden md:block w-px bg-[rgb(27,55,121)]/20 my-10 self-stretch rounded-full" />
                    {/* Right form panel */}
                    <div className="w-full md:w-1/2 p-8 bg-white/60 backdrop-blur-md overflow-hidden relative flex flex-col justify-center">
                      <div className="md:hidden mb-6">
                        <button
                          onClick={handleBack}
                          className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1"
                        >
                          ← Back
                        </button>
                      </div>

                      <div className="mb-6">
                        <h2 className="text-3xl font-bold text-gray-900">
                          Create Account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                          {showSignupEmailForm ? "Fill in your details to register." : "Choose how you want to sign up."}
                        </p>
                      </div>

                      {signupError && (
                        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                          {signupError}
                        </div>
                      )}

                      <AnimatePresence mode="wait" initial={false}>
                        {!showSignupEmailForm ? (
                          <motion.div
                            key="signup-options"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                          >
                            <div className="space-y-3">
                              <button
                                onClick={() => handleOAuthSignIn("google")}
                                disabled={isLoading}
                                className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-gray-300 bg-white/80 px-4 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
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
                                Sign up with Google
                              </button>

                              <button
                                onClick={() => handleOAuthSignIn("github")}
                                disabled={isLoading}
                                className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-gray-300 bg-white/80 px-4 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                              >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                                Sign up with GitHub
                              </button>
                            </div>

                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                              </div>
                              <div className="relative flex justify-center text-sm">
                                <span className="bg-transparent px-3 text-gray-500 font-medium bg-white/50 backdrop-blur-sm rounded-full">OR</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setShowSignupEmailForm(true)}
                              disabled={isLoading}
                              className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-gray-300 bg-white/80 px-4 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                            >
                              <img src="/email.svg" alt="Email icon" className="h-5 w-5" />
                              Sign up with Email
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="signup-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <MultiStepSignUp
                              onSubmit={handleMultiStepSubmit}
                              isSubmitting={isLoading}
                              onBack={() => setShowSignupEmailForm(false)}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expanded Existing User */}
            <AnimatePresence>
              {expandedType === "existing" && (
                <motion.div
                  layoutId="card-existing"
                  className="absolute top-0 w-full max-w-5xl rounded-3xl bg-gradient-to-b from-green-50/50 to-emerald-50/30 backdrop-blur-sm border border-[rgb(27,55,121)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden z-20"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                >
                  <div className="flex flex-col md:flex-row divide-y md:divide-y-0 h-[600px] relative">
                    <button
                      onClick={handleBack}
                      className="absolute top-8 left-8 z-30 inline-flex items-center text-[rgb(27,55,121)]/60 hover:text-[rgb(27,55,121)] transition-colors font-semibold tracking-wide text-sm group"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                      CHANGE USER TYPE
                    </button>
                    {/* Left info panel - Visual match to card */}
                    <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
                      <div className="w-full max-w-md space-y-6 text-center">
                        <div className="mx-auto mb-6 flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-100">
                          <img
                            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80"
                            alt="Existing User"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <h3 className="text-2xl font-semibold text-slate-900">
                          Existing User
                        </h3>
                        <p className="mt-3 text-sm text-slate-600">
                          Jump back into your dashboard and continue right where you left off.
                        </p>

                        <p className="mt-4 text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                          @welcome-back
                        </p>
                      </div>
                    </div>

                    {/* Separator */}
                    <div className="hidden md:block w-px bg-[rgb(27,55,121)]/20 my-10 self-stretch rounded-full" />
                    {/* Right sign-in form - Animated In */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                      className="w-full md:w-1/2 p-8 space-y-8 bg-white/60 backdrop-blur-md"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900">
                            Sign in
                          </h2>
                          <p className="mt-2 text-sm text-gray-600">
                            Welcome back! Please enter your details.
                          </p>
                        </div>
                      </div>

                      {loginError && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                          {loginError}
                        </div>
                      )}

                      {/* OAuth Buttons */}
                      <div className="space-y-3">
                        <button
                          onClick={() => handleOAuthSignIn("google")}
                          disabled={isLoading}
                          className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-gray-300 bg-white/80 px-4 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
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
                          className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-gray-300 bg-white/80 px-4 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Sign in with GitHub
                        </button>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="bg-transparent px-4 text-gray-500 font-medium bg-white/50 backdrop-blur-sm rounded-full">
                            Or continue with email
                          </span>
                        </div>
                      </div>

                      {/* Email/Password Form */}
                      <form onSubmit={handleCredentialsSignIn} className="space-y-5">
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Email address
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white/80 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            placeholder="you@example.com"
                            required
                            disabled={isLoading}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Password
                          </label>
                          <input
                            id="password"
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white/80 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                          {isLoading ? "Signing in..." : "Sign in"}
                        </button>
                      </form>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </div >
    </div >
  );
}

