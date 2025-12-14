import { useEffect, useRef, useState } from 'react';
import HeroSection from "../components/HeroSection";
import Navbar from "../components/Navbar";
import Link from 'next/link';
import gsap from 'gsap';
import Preloader from "../components/Preloader";

export default function Home() {
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const buttonsRef = useRef(null);
  const [preloaderComplete, setPreloaderComplete] = useState(false);

  const handlePreloaderComplete = () => {
    setPreloaderComplete(true);
  };

  useEffect(() => {
    if (!preloaderComplete) return;

    // Scale-up animation for title
    gsap.fromTo(titleRef.current,
      { scale: 0.5, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1.5,
        ease: "power3.out",
        delay: 0.2
      }
    );

    // Fade-in animation for description
    gsap.fromTo(descriptionRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power3.out",
        delay: 0.6
      }
    );

    // Fade-in animation for buttons
    gsap.fromTo(buttonsRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power3.out",
        delay: 0.9
      }
    );
  }, [preloaderComplete]);

  return (
    <>
      <Preloader onComplete={handlePreloaderComplete} />

      <div
        className={`relative flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100 font-sans`}
      >


        {/* Navigation Bar */}
        <Navbar />

        {/* Main Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 pointer-events-none">
          <div className="space-y-6 max-w-4xl px-4 pointer-events-auto mt-16">
            <h1 ref={titleRef} className="text-5xl md:text-7xl font-serif text-white leading-tight" style={{ opacity: 0, transform: 'scale(0.5)' }}>
              Dissecting the <span className="italic">Anatomy</span>
              <br />
              <span className="font-normal font-serif text-5xl md:text-7xl block">
                of An Outbreak
              </span>
            </h1>

            <p ref={descriptionRef} className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light tracking-wide" style={{ opacity: 0, transform: 'translateY(50px)' }}>
              Uncover the hidden signals in everyday places,
              <br />
              and see how dengue begins long before it is seen.
            </p>

            <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center pt-8" style={{ opacity: 0, transform: 'translateY(50px)' }}>
              <Link href="/dengue-heatmap">
                <button className="relative px-8 py-3 bg-transparent border border-white text-white rounded-full transition-all duration-500 ease-out shadow-[inset_0_0_0_0_white] hover:shadow-[inset_0_-100px_0_0_white] hover:text-black tracking-widest text-sm font-medium cursor-pointer active:scale-90">
                  VIEW DENGUE TRENDS
                </button>
              </Link>
              <Link href="/api-dashboard">
                <button className="relative px-8 py-3 bg-white text-black rounded-full transition-all duration-500 ease-out shadow-[inset_0_0_0_0_rgb(27,55,121)] hover:shadow-[inset_0_-100px_0_0_rgb(27,55,121)] hover:text-white tracking-widest text-sm font-medium cursor-pointer active:scale-90">
                  OPEN API DASHBOARD
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* 3D Background */}
        <HeroSection />
      </div>
    </>
  );
}
