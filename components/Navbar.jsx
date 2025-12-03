import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

const Navbar = () => {
    const { data: session, status } = useSession();

    return (
        <nav className="absolute top-0 left-0 w-full z-50 bg-transparent">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/next.svg"
                            alt="Logo"
                            width={80}
                            height={16}
                            priority
                            className="invert"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        {status === "loading" ? (
                            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200"></div>
                        ) : session ? (
                            <div className="flex items-center gap-4">
                                <div className="text-sm">
                                    <p className="font-medium text-white">
                                        {session.user.name || "User"}
                                    </p>
                                    <p className="text-gray-300">{session.user.email}</p>
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
    );
};

export default Navbar;
