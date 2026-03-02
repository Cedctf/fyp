import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { AnimatedFeatureCard } from "../../components/ui/animated-feature-card";

export default function UserType() {
  const router = useRouter();
  const { data: session } = useSession();

  // Redirect if already signed in
  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  return (
    <div className="min-h-screen bg-white text-[rgb(27,55,121)] font-sans">
      <Head>
        <title>Choose User Type</title>
        <meta name="description" content="Select your user type" />
      </Head>

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-12">
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight">
            Welcome
          </h1>
          <p className="text-[rgb(27,55,121)]/70">
            Choose your user type to continue
          </p>
        </div>

        <div className="mt-12 grid w-full max-w-5xl grid-cols-1 gap-8 mx-auto place-items-center justify-center md:grid-cols-2 md:gap-10">
          <AnimatedFeatureCard
            title="New User"
            description="Start your journey with a guided onboarding and create your account in minutes."
            imageSrc="https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=600&q=80"
            featureNumber="01"
            handle="@onboarding"
            onClick={() => router.push("/auth/signup")}
          />
          <AnimatedFeatureCard
            title="Existing User"
            description="Jump back into your dashboard and continue right where you left off."
            imageSrc="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80"
            featureNumber="02"
            handle="@welcome-back"
            onClick={() => router.push("/auth/signin")}
          />
        </div>
      </div>
    </div>
  );
}


