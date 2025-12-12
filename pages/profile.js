import Head from "next/head";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { User, Mail, Phone, MapPin } from "lucide-react";
import Navbar from "../components/Navbar";
import LocationAndAlertsSettings from "../components/LocationAndAlertsSettings";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  const user = session?.user || {};
  const displayName = user.name || "User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const profileFields = [
    { label: "Name", value: user.name, Icon: User },
    { label: "Email", value: user.email, Icon: Mail },
    { label: "Phone", value: user.phone, Icon: Phone },
    { label: "Address", value: user.address, Icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-white text-[rgb(27,55,121)] font-sans">
      <Head>
        <title>User Profile</title>
        <meta name="description" content="Your profile information" />
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <header className="mb-12 mt-8">
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight border-none">
            Profile
          </h1>
          <p className="text-[rgb(27,55,121)]/70 mt-3">
            View your personal information.
          </p>
          <div className="h-px bg-[rgb(27,55,121)]/15 mt-6" />
        </header>

        {status === "loading" && (
          <div className="text-[rgb(27,55,121)]/70">Loading profile…</div>
        )}

        {status === "unauthenticated" && (
          <div className="space-y-4">
            <p className="text-[rgb(27,55,121)]/80">
              You are not signed in.
            </p>
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center rounded-md bg-[rgb(27,55,121)] px-4 py-2 text-white text-sm font-medium shadow hover:shadow-md transition"
            >
              Go to sign in
            </Link>
          </div>
        )}

        {status === "authenticated" && (
          <section className="space-y-10">
            <div className="space-y-2">
              <div className="px-6 py-5">
                <div className="flex items-center justify-center gap-3">
                  <User className="w-5 h-5 text-[rgb(27,55,121)]" />
                  <h2 className="text-3xl font-serif font-semibold text-[rgb(27,55,121)]">
                    Personal Details
                  </h2>
                </div>
              </div>

              {profileFields.map(({ label, value, Icon }) => (
                <div
                  key={label}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[rgb(27,55,121)]/70" />
                    <span className="text-base font-semibold uppercase tracking-widest text-[rgb(27,55,121)]/70">
                      {label}
                    </span>
                  </div>
                  <span className="text-lg font-medium text-[rgb(27,55,121)]">
                    {value || "—"}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <LocationAndAlertsSettings />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

