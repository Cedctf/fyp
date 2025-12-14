import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import Link from "next/link";
import { Mail, Linkedin, Instagram, Github } from "lucide-react";

import ScrollReveal from "../components/ScrollReveal";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
    const [isDark, setIsDark] = useState(false);

    const loaderRef = null; // Removed
    const counterRef = null; // Removed
    // const missionRef = useRef(null); // Removed, as ScrollReveal handles its own ref

    // Theme Constants matching DOPEWS-MY
    const theme = {
        light: { bg: "bg-white", text: "text-slate-800", cursor: "bg-slate-800" },
        dark: { bg: "bg-[rgb(27,55,121)]", text: "text-white", cursor: "bg-white" },
        accent: "rgb(27, 55, 121)"
    };

    useEffect(() => {
        // 1. Initialize Lenis (Smooth Scroll)
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // 2. Custom Cursor Logic Removed

        // Hover Effects Removed

        // 3. Entry Animations (Text Reveal)
        const tl = gsap.timeline({ delay: 0.2 });
        tl.fromTo('.reveal-text span',
            { yPercent: 110 },
            {
                yPercent: 0,
                duration: 1.2,
                stagger: 0.1,
                ease: "power4.out"
            }
        )
            .to('.animate-up', {
                opacity: 1,
                y: 0,
                duration: 1,
                stagger: 0.1,
                ease: "power3.out"
            }, "<0.2"); // Start 0.2s after the text reveal starts (almost simultaneous)

        // 4. Scroll Animations
        // Marquee
        gsap.to('.marquee-content', {
            xPercent: -50,
            repeat: -1,
            duration: 20,
            ease: "linear"
        });

        // Parallax Images
        document.querySelectorAll('.parallax-img').forEach(img => {
            gsap.to(img, {
                scale: 1.1,
                y: 50,
                scrollTrigger: {
                    trigger: img.parentElement,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });

        // Vision/Manifesto Reveal - NOW HANDLED BY ScrollReveal COMPONENT

        // Theme Switching
        const sections = document.querySelectorAll('section, footer');
        sections.forEach(section => {
            ScrollTrigger.create({
                trigger: section,
                start: "top 50%",
                end: "bottom 50%", // Slightly earlier theme switch
                onEnter: () => setIsDark(section.dataset.theme === 'dark'),
                onEnterBack: () => setIsDark(section.dataset.theme === 'dark')
            });
        });

        return () => {
            lenis.destroy();
            tl.kill(); // Kill the entry timeline
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    return (
        <div className={`min-h-screen font-sans transition-colors duration-700 ease-out ${isDark ? theme.dark.bg + ' ' + theme.dark.text : theme.light.bg + ' ' + theme.light.text}`}>
            <Head>
                <title>About DOPEWS-MY</title>
                <style>{`
                  .reveal-text { overflow: hidden; display: block; }
                  .reveal-text span { display: block; transform: translateY(0); }
                `}</style>
            </Head>



            <Navbar isDark={isDark} />

            <main className="w-full relative">
                {/* Hero Section */}
                <section className="min-h-screen w-full flex flex-col relative pt-32" data-theme="light">
                    <div className="container mx-auto px-4">
                        <h1 className="text-[10vw] leading-[1.1] font-bold font-serif tracking-tighter mb-8 z-10 text-[rgb(27,55,121)] flex flex-wrap items-baseline justify-start gap-y-4">
                            <div className="flex items-baseline gap-[0.25em] mr-4 md:mr-0">
                                <div className="reveal-text w-max pt-2 pb-4"><span>Predicting</span></div>
                                <div className="reveal-text w-max pt-2 pb-4 pr-4"><span className="italic text-slate-400 font-serif">The</span></div>
                            </div>
                            <div className="reveal-text w-max pt-2 pb-4"><span>Invisible</span></div>
                        </h1>

                        <div className="flex flex-col md:flex-row justify-between items-end w-full border-t border-[rgb(27,55,121)] pt-8 transition-colors duration-500">
                            <p className="text-base md:text-lg opacity-0 animate-up font-medium text-slate-600">
                                By combining advanced modeling with public-health intelligence, we enable decision-makers to move from reactive measures to proactive dengue prevention.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Marquee Section */}
                <section className="py-16 border-y border-white/20 overflow-hidden bg-[rgb(27,55,121)] text-white" data-theme="dark">
                    <div className="whitespace-nowrap flex overflow-hidden">
                        <div className="marquee-content text-8xl md:text-[10rem] font-serif font-bold uppercase tracking-tight leading-none px-4">
                            Predict. Prevent. Protect.
                        </div>
                        <div className="marquee-content text-8xl md:text-[10rem] font-serif font-bold uppercase tracking-tight leading-none px-4">
                            Predict. Prevent. Protect.
                        </div>
                    </div>
                </section>

                {/* Vision / Manifesto */}
                <section id="mission" className="py-40 min-h-screen flex items-center justify-center relative" data-theme="light">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <ScrollReveal
                            textClassName="text-4xl md:text-6xl lg:text-7xl font-medium leading-[1.1] text-slate-400 font-serif"
                            baseOpacity={0.05}
                            enableBlur={true}
                            baseRotation={5}
                            blurStrength={10}
                            scrub={false}
                            stagger={0.05}
                        >
                            Dengue is a silent killer. <span className="text-[rgb(27,55,121)]">We give it a voice.</span>
                            {' '}By combining satellite imagery, larval heatmaps, and meteorological data, we don't just track mosquitoes—we <span className="italic text-[rgb(27,55,121)]">predict the future of public health.</span>
                        </ScrollReveal>
                    </div>
                </section>

                {/* DATA / Deployments */}
                <section id="data" className="py-24 transition-colors duration-700" data-theme="light">
                    <div className="container mx-auto px-4 space-y-32">
                        {/* Deployment 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                            <div className="md:col-span-8 relative group cursor-pointer hover-trigger">
                                <div className="overflow-hidden aspect-[16/9] relative">
                                    {/* Overlay UI elements for "Tech" feel */}
                                    <div className="absolute top-4 left-4 z-10 text-[10px] text-white bg-black/50 px-2 py-1 uppercase tracking-widest backdrop-blur-sm border border-white/20">Zone: Southeast Asia</div>
                                    <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2500&auto=format&fit=crop" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700 ease-expo parallax-img grayscale hover:grayscale-0 transition-all" />
                                </div>
                            </div>
                            <div className="md:col-span-4 pl-0 md:pl-8">
                                <h3 className="text-5xl font-serif font-light mb-4 text-[rgb(27,55,121)]">Urban Heatmap</h3>
                                <p className="text-sm uppercase tracking-widest text-slate-500 mb-6 font-bold">Geospatial Analysis</p>
                                <p className="text-lg opacity-80 text-slate-700">Identifying breeding hotspots in high-density urban zones using thermal imaging and moisture detection.</p>
                            </div>
                        </div>

                        {/* Deployment 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                            <div className="md:col-span-4 pr-0 md:pr-8 md:order-1 order-2">
                                <h3 className="text-5xl font-serif font-light mb-4 text-[rgb(27,55,121)]">Vector Density</h3>
                                <p className="text-sm uppercase tracking-widest text-slate-500 mb-6 font-bold">Larval AI Counting</p>
                                <p className="text-lg opacity-80 text-slate-700">Automated ovitrap analysis using computer vision to quantify mosquito populations in real-time.</p>
                            </div>
                            <div className="md:col-span-8 md:order-2 order-1 relative group cursor-pointer hover-trigger">
                                <div className="overflow-hidden aspect-[16/9] relative">
                                    <div className="absolute top-4 left-4 z-10 text-[10px] text-white bg-black/50 px-2 py-1 uppercase tracking-widest backdrop-blur-sm border border-white/20">Data: Ovitrap v2.1</div>
                                    <img src="https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=2500&auto=format&fit=crop" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700 ease-expo parallax-img grayscale hover:grayscale-0 transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* System Capabilities (Dark Mode Trigger) */}
                <section id="models" className="py-32 relative transition-colors duration-700" data-theme="dark">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="mb-24 flex justify-between items-end">
                            <div>
                                <h2 className="text-xs uppercase tracking-widest opacity-60 mb-4 font-bold">System Capabilities</h2>
                                <h3 className="text-5xl md:text-7xl font-serif font-light max-w-2xl">Precision Defense.</h3>
                            </div>
                        </div>

                        <div className="space-y-0">
                            {/* Feature 1 */}
                            <div className={`service-item group border-t ${isDark ? 'border-white/10' : 'border-[rgb(27,55,121)]/20'} transition-all duration-300 cursor-pointer overflow-hidden hover-trigger`}>
                                <div className="py-12 flex flex-col md:flex-row justify-between md:items-center">
                                    <h2 className="text-4xl md:text-6xl font-light font-serif group-hover:translate-x-4 transition-transform duration-500 ease-expo">Risk Forecasting</h2>
                                    <div className="flex items-center gap-6 mt-4 md:mt-0">
                                        <span className="text-sm font-mono opacity-50 group-hover:opacity-100 transition-opacity">MOD-01 // PREDICT</span>
                                        <span className="service-icon text-2xl font-light">+</span>
                                    </div>
                                </div>
                                <div className="service-details max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-500 ease-out">
                                    <p className={`pb-12 text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-2xl font-light leading-relaxed`}>
                                        Our core engine leverages historical epidemiological data and real-time climate inputs to predict dengue outbreak clusters up to 4 weeks in advance with 94% accuracy.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className={`service-item group border-t ${isDark ? 'border-white/10' : 'border-[rgb(27,55,121)]/20'} transition-all duration-300 cursor-pointer overflow-hidden hover-trigger`}>
                                <div className="py-12 flex flex-col md:flex-row justify-between md:items-center">
                                    <h2 className="text-4xl md:text-6xl font-light font-serif group-hover:translate-x-4 transition-transform duration-500 ease-expo">Rapid Response</h2>
                                    <div className="flex items-center gap-6 mt-4 md:mt-0">
                                        <span className="text-sm font-mono opacity-50 group-hover:opacity-100 transition-opacity">MOD-02 // DEPLOY</span>
                                        <span className="service-icon text-2xl font-light">+</span>
                                    </div>
                                </div>
                                <div className="service-details max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-500 ease-out">
                                    <p className={`pb-12 text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-2xl font-light leading-relaxed`}>
                                        A tactical interface that optimizes resource allocation by directing vector control teams to high-risk zones before transmission cycles peak, effectively breaking the chain of infection.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className={`service-item group border-t ${isDark ? 'border-white/10' : 'border-[rgb(27,55,121)]/20'} transition-all duration-300 cursor-pointer overflow-hidden hover-trigger`}>
                                <div className="py-12 flex flex-col md:flex-row justify-between md:items-center">
                                    <h2 className="text-4xl md:text-6xl font-light font-serif group-hover:translate-x-4 transition-transform duration-500 ease-expo">Citizen Alerts</h2>
                                    <div className="flex items-center gap-6 mt-4 md:mt-0">
                                        <span className="text-sm font-mono opacity-50 group-hover:opacity-100 transition-opacity">MOD-03 // WARN</span>
                                        <span className="service-icon text-2xl font-light">+</span>
                                    </div>
                                </div>
                                <div className="service-details max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-500 ease-out">
                                    <p className={`pb-12 text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-2xl font-light leading-relaxed`}>
                                        Automated SMS and app-based notifications that alert residents in potential hotspots. The system provides actionable preventive measures tailored to the specific vector density of their neighborhood.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 4 */}
                            <div className={`service-item group border-t border-b ${isDark ? 'border-white/10' : 'border-[rgb(27,55,121)]/20'} transition-all duration-300 cursor-pointer overflow-hidden hover-trigger`}>
                                <div className="py-12 flex flex-col md:flex-row justify-between md:items-center">
                                    <h2 className="text-4xl md:text-6xl font-light font-serif group-hover:translate-x-4 transition-transform duration-500 ease-expo">Climate Correlation</h2>
                                    <div className="flex items-center gap-6 mt-4 md:mt-0">
                                        <span className="text-sm font-mono opacity-50 group-hover:opacity-100 transition-opacity">MOD-04 // ANALYZE</span>
                                        <span className="service-icon text-2xl font-light">+</span>
                                    </div>
                                </div>
                                <div className="service-details max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-500 ease-out">
                                    <p className={`pb-12 text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-2xl font-light leading-relaxed`}>
                                        Deep learning algorithms cross-reference humidity, rainfall, and temperature patterns to identify micro-climates conducive to Aedes aegypti breeding, adjusting risk models in real-time.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}