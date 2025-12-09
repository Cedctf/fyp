import { useSession } from "next-auth/react";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import HeroSection from "../components/HeroSection";
import Navbar from "../components/Navbar";

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
      className={`${geistSans.className} ${geistMono.className} relative flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100 font-sans`}
    >
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 pointer-events-none">
        <div className="space-y-6 max-w-4xl px-4 pointer-events-auto mt-16">
          <h1 className="text-6xl md:text-8xl font-serif italic text-white tracking-tighter leading-tight">
            The Anatomy
            <br />
            <span className="not-italic font-normal font-sans tracking-widest text-5xl md:text-7xl block mt-2">
              OF AN OUTBREAK
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light tracking-wide">
            Uncover the hidden signals in everyday places,
            <br />
            and see how dengue begins long before it is seen.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button className="px-8 py-3 bg-transparent border border-white text-white rounded-full hover:bg-white hover:text-black transition-all duration-300 tracking-widest text-sm font-medium">
              VIEW DENGUE TRENDS
            </button>
            <button className="px-8 py-3 bg-white text-black rounded-full hover:bg-gray-200 transition-all duration-300 tracking-widest text-sm font-medium">
              OPEN API DASHBOARD
            </button>
          </div>
        </div>
      </div>

      {/* 3D Background */}
      <HeroSection />
    </div>
  );
}
