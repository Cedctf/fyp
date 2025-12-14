import { useEffect, useState } from 'react';

export default function Preloader({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Simulate loading progress over 2 seconds
        const duration = 1500; // 2 seconds
        const interval = 30; // Update every 30ms
        const increment = 100 / (duration / interval);

        const timer = setInterval(() => {
            setProgress((prev) => {
                const next = Math.min(prev + increment, 100);

                if (next >= 100) {
                    clearInterval(timer);

                    // Fade out after completion
                    setTimeout(() => {
                        setIsVisible(false);
                        if (onComplete) onComplete();
                    }, 200);
                }

                return next;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [onComplete]);

    if (!isVisible) return null;

    const inverseProgress = 100 - progress;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 transition-opacity duration-500"
            style={{ opacity: progress >= 100 ? 0 : 1 }}>

            {/* Preloader Container */}
            <div className="relative inline-block">
                {/* Layer 1: Grey Base */}
                <div className="relative">
                    <div className="text-5xl sm:text-7xl font-extrabold tracking-wider text-gray-200 leading-none whitespace-nowrap">
                        DOPEWS-MY
                    </div>
                    <div className="mt-2 sm:mt-3 h-1 sm:h-1.5 w-full bg-gray-200 rounded-full"></div>
                </div>

                {/* Layer 2: Blue Overlay (Clipped) */}
                <div
                    className="absolute top-0 left-0 w-full h-full transition-all duration-100 ease-linear"
                    style={{ clipPath: `inset(0 ${inverseProgress}% 0 0)` }}
                >
                    <div className="text-5xl sm:text-7xl font-extrabold tracking-wider text-[rgb(27,55,121)] leading-none whitespace-nowrap">
                        DOPEWS-MY
                    </div>
                    <div className="mt-2 sm:mt-3 h-1 sm:h-1.5 w-full bg-[rgb(27,55,121)] rounded-full"></div>
                </div>
            </div>

            {/* Loading Percentage */}
            <div className="mt-8 text-sm font-semibold tracking-widest text-[rgb(27,55,121)] transition-opacity duration-300"
                style={{ opacity: progress > 0 ? 1 : 0 }}>
                {Math.floor(progress)}%
            </div>
        </div>
    );
}
