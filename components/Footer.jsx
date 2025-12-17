import React, { useRef } from "react";
import { useRouter } from "next/router";
import { motion, useMotionValue } from "framer-motion";
import { ArrowUp } from "lucide-react";
import TextPressure from "./TextPressure";

// --- Utility Components ---

const Magnetic = ({ children }) => {
    const ref = useRef(null);
    const position = { x: useMotionValue(0), y: useMotionValue(0) };

    const handleMouse = (e) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        position.x.set(middleX * 0.1);
        position.y.set(middleY * 0.1);
    };

    const reset = () => {
        position.x.set(0);
        position.y.set(0);
    };

    const { x, y } = position;
    return (
        <motion.div
            style={{ x, y }}
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        >
            {children}
        </motion.div>
    );
};

// --- Footer Component ---

export default function Footer() {
    const router = useRouter();
    const isAbout = router.pathname === "/about";

    // Colors
    const theme = isAbout ? {
        bg: "bg-[rgb(242,240,235)]",
        text: "text-[rgb(27,55,121)]",
        textSecondary: "text-[rgb(27,55,121)]/70",
        border: "border-[rgb(27,55,121)]/10",
        buttonBg: "bg-[rgb(27,55,121)]",
        buttonText: "text-white",
        textPressureColor: "#1B3779",
        hover: "hover:text-black"
    } : {
        bg: "bg-[rgb(27,55,121)]",
        text: "text-white",
        textSecondary: "text-slate-300",
        border: "border-white/10",
        buttonBg: "bg-white",
        buttonText: "text-[rgb(27,55,121)]",
        textPressureColor: "#FFFFFF",
        hover: "hover:text-white"
    };

    return (
        <footer
            id="footer"
            className={`fixed bottom-0 left-0 w-full z-0 h-[50vh] md:h-[450px] ${theme.bg} ${theme.text} transition-colors duration-300`}
        >
            <div className="container mx-auto px-4 h-full">
                {/* Card Container - using fixed height/width inside */}
                <div
                    className="relative h-full w-full flex flex-col justify-between py-6 md:py-10 overflow-hidden"
                >
                    {/* Top Navigation */}
                    <div className={`flex flex-col md:flex-row justify-between items-start md:items-center text-sm font-medium ${theme.textSecondary} gap-8 md:gap-0`}>
                        <div className="flex gap-8">
                            {[
                                { name: "About Us", link: "/about" },
                                { name: "Education Hub", link: "/education" },
                                { name: "Dengue Hotspot Dashboard", link: "/dengue-heatmap" }
                            ].map((item) => (
                                <Magnetic key={item.name}>
                                    <a href={item.link} className={`transition-colors ${theme.hover}`}>{item.name}</a>
                                </Magnetic>
                            ))}
                        </div>
                        <div className="flex flex-col md:items-end gap-2 text-right">
                            <span className={`${theme.text} font-semibold`}>Our Services</span>
                            <div className={`flex gap-6 text-xs ${theme.textSecondary}`}>
                                <a href="/dengue-heatmap" className={`transition-colors ${theme.hover}`}>Early Warning System</a>
                                <a href="/api-dashboard" className={`transition-colors ${theme.hover}`}>API Key</a>
                                <a href="/contact" className={`transition-colors ${theme.hover}`}>Contact Us</a>
                            </div>
                        </div>
                    </div>



                    {/* Center Graphic */}
                    <div className="flex-1 flex items-end justify-start w-full pb-4 relative" style={{ minHeight: '100px' }}>
                        <div className="w-full h-50 relative max-w-4xl">
                            <TextPressure
                                text="DOPEWS-MY"
                                flex={true}
                                alpha={false}
                                stroke={false}
                                width={true}
                                weight={true}
                                italic={true}
                                textColor={theme.textPressureColor}
                                minFontSize={36}
                            />
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className={`flex flex-col md:flex-row justify-between items-end md:items-center text-xs ${theme.textSecondary} font-medium border-t ${theme.border}`}>
                        <div className="flex flex-col md:flex-row gap-4 md:gap-8 mb-4 md:mb-0">
                            <span>© 2025 DOPEWS-MY</span>
                            <span className="flex items-center gap-1">
                                Powered by <span className={`${theme.text} font-bold`}>TAYLOR'S UNIVERSITY</span>
                            </span>
                        </div>

                        <div className="flex gap-6 items-center">
                            {["Privacy Policy", "Terms and Conditions", "Security", "LinkedIn"].map((item) => (
                                <Magnetic key={item}>
                                    <a href="#" className={`transition-colors ${theme.hover}`}>{item}</a>
                                </Magnetic>
                            ))}
                            {/* Scroll to Top Button */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className={`h-12 w-12 ${theme.buttonBg} ${theme.buttonText} rounded-full grid place-items-center leading-none ml-4 p-0 cursor-pointer relative z-50 shadow-lg`}
                            >
                                <ArrowUp size={20} className="relative z-10" strokeWidth={2.5} />
                            </motion.button>
                        </div>
                    </div>

                </div>
            </div>
        </footer>
    );
};