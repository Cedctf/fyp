import Head from "next/head";
import Navbar from "../components/Navbar";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import { Github, Linkedin, Mail, ArrowDownRight, Quote } from "lucide-react";
import Link from "next/link";
import ScrollVelocity from "../components/ui/ScrollVelocity";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
    const teamMembers = [
        {
            name: "Tan Che Hui",
            course: "Bachelor of Computer Science Specialisation in Artificial Intelligence",
            role: "Full Stack Developer",
            linkedin: "https://www.linkedin.com/in/che-hui-tan-6b81862a2/",
            github: "https://github.com/Czeh0210",
            email: "chuiitan02@gmail.com",
            image: "/contact/CheHui.jpeg"
        },
        {
            name: "Cedric Chung Teng Fung",
            course: "Bachelor of Computer Science Specialisation in Artificial Intelligence",
            role: "Backend Developer",
            linkedin: "https://www.linkedin.com/in/cedric-chung-2756b4310/",
            github: "https://github.com/Cedctf",
            email: "#",
            image: "/contact/Cedric.jpeg"
        },
        {
            name: "Loy Qun Jie",
            course: "Bachelor of Computer Science Specialisation in Artificial Intelligence",
            role: "Backend Developer",
            linkedin: "https://www.linkedin.com/in/loy-qun-jie-904916328/",
            github: "https://github.com/Jay-366",
            email: "loyqunjie@gmail.com",
            image: "/contact/QunJie.jpeg"
        },
        {
            name: "Lim Fang Yee",
            course: "Bachelor of Computer Science Specialisation in Cybersecurity",
            role: "Quality Assurance & Tester",
            linkedin: "https://www.linkedin.com/in/lim-fang-yee-54398433b/",
            github: "https://github.com/TisuPaper",
            email: "fangyee0304@gmail.com",
            image: "/contact/FangYee.jpeg"
        },
        {
            name: "Lee Wai Yee",
            course: "Bachelor of Computer Science Specialisation in Artificial Intelligence",
            role: "Frontend Developer",
            linkedin: "https://www.linkedin.com/in/lee-wai-yee/",
            github: "https://github.com/wwaiyyee",
            email: "wwaiyyee@gmail.com",
            image: "/contact/WaiYee.jpeg"
        },
    ];

    const studentSectionRef = useRef(null);
    const studentTrackRef = useRef(null);
    const quoteRef = useRef(null);
    const supervisorRef = useRef(null);

    useEffect(() => {
        // 1. Smooth Scroll (Lenis)
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

        // 2. Animations (GSAP)
        const ctx = gsap.context(() => {
            // Text Reveal
            const revealElements = document.querySelectorAll('.reveal-text');
            revealElements.forEach(el => {
                gsap.fromTo(el,
                    { y: 50, opacity: 0 },
                    {
                        scrollTrigger: {
                            trigger: el,
                            start: "top 85%"
                        },
                        y: 0,
                        opacity: 1,
                        duration: 1.2,
                        ease: "power3.out",
                        delay: el.dataset.delay || 0
                    }
                );
            });



            // Staggered Grids
            const grids = document.querySelectorAll('.stagger-grid');
            grids.forEach(grid => {
                const children = grid.children;
                gsap.fromTo(children,
                    { y: 60, opacity: 0 },
                    {
                        scrollTrigger: {
                            trigger: grid,
                            start: "top 75%"
                        },
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        stagger: 0.15,
                        ease: "power3.out"
                    }
                );
            });

            // Footer Scale
            gsap.to('.scale-on-scroll', {
                scrollTrigger: {
                    trigger: '#contact-footer',
                    start: "top bottom",
                    end: "center center",
                    scrub: 1
                },
                scale: 1.2,
                transformOrigin: "center center"
            });

            // Student Horizontal Scroll
            const track = studentTrackRef.current;
            const section = studentSectionRef.current;

            if (track && section) {
                gsap.to(track, {
                    x: () => -(track.scrollWidth - track.parentElement.offsetWidth),
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        pin: true,
                        scrub: 1,
                        start: "top 20%",
                        // Span the scroll duration based on width difference
                        end: () => "+=" + (track.scrollWidth - track.parentElement.offsetWidth),
                        invalidateOnRefresh: true,
                    }
                });
            }

            // Quote Staggered Text
            const quoteText = quoteRef.current;
            if (quoteText) {
                const text = quoteText.textContent;
                quoteText.innerHTML = text.split("").map(char => `<span class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`).join("");

                gsap.from(quoteText.querySelectorAll("span"), {
                    scrollTrigger: {
                        trigger: quoteText,
                        start: "top 85%",
                        end: "top 35%",
                        scrub: true,
                    },
                    opacity: 0,
                    y: 50,
                    duration: 1,
                    stagger: 0.1,
                    stagger: 0.1,
                });
            }

            // Supervisor Section Animation
            const supervisorEl = supervisorRef.current;
            if (supervisorEl) {
                gsap.from(supervisorEl.children, {
                    scrollTrigger: {
                        trigger: supervisorEl,
                        start: "top 80%",
                    },
                    y: 60,
                    opacity: 0,
                    duration: 1.2,
                    stagger: 0.2,
                    ease: "power3.out"
                });
            }
        });

        return () => {
            lenis.destroy();
            ctx.revert();
        };
    }, []);


    return (
        <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-[rgb(27,55,121)] selection:text-white">
            <Head>
                <title>Contact Us | DOPEWS-MY</title>
                <style>{`
                    .cursor-none { cursor: none; } /* Only used for specialized hover areas */
                `}</style>
            </Head>

            <Navbar />

            <main className="w-full relative">
                {/* Hero Section */}
                <section className="pt-40 pb-20 min-h-[80vh] flex flex-col justify-center">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 gap-12 items-start">
                            {/* Top: Big Title */}
                            <div className="relative">
                                <h1 className="text-7xl md:text-8xl font-light font-serif text-[rgb(27,55,121)] leading-[1.1] tracking-tight reveal-text">
                                    Meet<br />&nbsp;&nbsp;&nbsp;/<span className="text-[rgb(27,55,121)]/50 italic">Our Team</span>
                                </h1>
                            </div>


                            {/* Bottom: Description */}
                            <div className="pt-4">
                                <div className="mb-8 overflow-hidden w-full">
                                    <ScrollVelocity
                                        texts={['Collaboration is the heart of innovation.']}
                                        velocity={40}
                                        className="text-3xl md:text-5xl font-serif leading-tight text-[rgb(27,55,121)]"
                                    />
                                </div>
                                <p className="text-slate-600 text-lg md:text-xl leading-relaxed justify reveal-text" data-delay="0.2">
                                    We are a dedicated team of students, guided by industry veterans and working alongside visionary clients. Together, we are building solutions that bridge the gap between academic theory and real-world application.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 1. SUPERVISOR SECTION */}
                <section className="pb-16">
                    <div className="container mx-auto px-4">
                        <div className="h-px bg-[rgb(27,55,121)]/20 w-full mb-16" />
                        <div className="flex flex-col lg:flex-row gap-5 lg:gap-10">
                            {/* Left Column: Header */}
                            <div className="lg:w-1/4 flex-shrink-0">
                                <div className="text-[rgb(27,55,121)] opacity-50 sticky top-24">
                                    <span className="text-xl font-bold tracking-[0.3em] uppercase block mb-6">Project<br />Supervisor</span>
                                    <ArrowDownRight className="w-12 h-12" />
                                </div>
                            </div>

                            {/* Right Column: Content */}
                            <div className="lg:flex-1">
                                <div ref={supervisorRef} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12 items-start">
                                    {/* Left: Static Image */}
                                    <div className="w-full md:w-[85%] aspect-[3/4] bg-slate-200 overflow-hidden relative rounded-sm">
                                        <img
                                            src="/contact/DrHadi.jpeg"
                                            className="w-full h-full object-cover"
                                            alt="Dr. Hadi"
                                        />
                                    </div>

                                    {/* Right: Detailed Info */}
                                    <div className="flex flex-col h-full">
                                        {/* Name & Role */}
                                        <h3 className="text-5xl md:text-6xl font-serif text-[rgb(27,55,121)] mb-2">Dr. Abdul Hadi<br />Mohammad</h3>
                                        <div className="flex justify-between items-end mb-4">
                                            <p className="text-xl text-slate-500 font-serif italic">Project Supervisor</p>
                                            <div className="flex items-center gap-3">
                                                <a href="https://www.linkedin.com/in/abdulhadimohamad/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[rgb(27,55,121)] transition-colors">
                                                    <Linkedin className="w-5 h-5" />
                                                </a>
                                                <a href="mailto:abdulhadi.mohamad@taylors.edu.my" className="text-slate-400 hover:text-[rgb(27,55,121)] transition-colors">
                                                    <Mail className="w-5 h-5" />
                                                </a>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="w-full h-[1px] bg-[rgb(27,55,121)]/20 mb-4"></div>

                                        {/* Contact Details */}
                                        {/* Updated Spacing */}


                                        {/* Bio */}
                                        <div className="text-slate-600 leading-relaxed text-lg max-w-lg">
                                            <p className="mb-4">
                                                Dr. Abdul Hadi Mohammad plays a pivotal role in the DOPEWS-MY project, providing the strategic oversight needed to fuse academic research with industrial innovation.
                                                He brings broad-ranging expertise in Data Analytics, Software Engineering, and Public Health, guiding our team to ensure the system meets rigorous professional standards and effectively bridges the gap between theoretical modeling and real-world application.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. CLIENTS SECTION */}
                <section className="pb-24">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row gap-5 lg:gap-10">
                            {/* Left Column: Header */}
                            <div className="lg:w-1/4 flex-shrink-0">
                                <div className="text-[rgb(27,55,121)] opacity-50 sticky top-24">
                                    <span className="text-xl font-bold tracking-[0.3em] uppercase block mb-6">Our<br />Clients</span>
                                    <ArrowDownRight className="w-12 h-12" />
                                </div>
                            </div>

                            {/* Right Column: Content */}
                            <div className="lg:flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 stagger-grid">
                                    {[
                                        {
                                            name: "Dr Wong Eng Hwa",
                                            title: "Professor\nSchool of Medicine\nFaculty of Health & Medical Sciences",
                                            img: "/contact/DrWong.jpeg",
                                            linkedin: "https://www.linkedin.com/in/eng-hwa-wong-3b533a61/",
                                            email: "EngHwa.Wong@taylors.edu.my"
                                        },
                                        {
                                            name: "Dr Priya A/P Madhavan",
                                            title: "Associate Professor\nSchool of Medicine\nFaculty of Health & Medical Sciences",
                                            img: "/contact/DrPriya.jpeg",
                                            linkedin: "https://www.linkedin.com/in/priya-madhavan-2950b065/",
                                            email: "priya.madhavan@taylors.edu.my"
                                        }
                                    ].map((client, i) => (
                                        <div key={i} className="flex flex-row items-center gap-6 max-w-lg w-full mx-auto md:mx-0">
                                            {/* Left Column: Image (Bigger) */}
                                            <div className="w-32 h-32 md:w-36 md:h-36 flex-shrink-0 rounded-full overflow-hidden shadow-md bg-slate-200">
                                                <img src={client.img} className="w-full h-full object-cover" alt={client.name} />
                                            </div>

                                            {/* Right Column: Name+Icons / Role */}
                                            <div className="flex flex-col flex-grow">
                                                {/* Row 1: Name + Icons */}
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-xl font-serif font-bold tracking-wide text-[rgb(27,55,121)] leading-none mr-4">{client.name}</h3>
                                                    <div className="flex items-center gap-3">
                                                        <a href={`mailto:${client.email}`} className="text-slate-400 hover:text-[rgb(27,55,121)] transition-colors">
                                                            <Mail className="w-5 h-5" />
                                                        </a>
                                                        <a href={client.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[rgb(27,55,121)] transition-colors">
                                                            <Linkedin className="w-5 h-5" />
                                                        </a>
                                                    </div>
                                                </div>

                                                {/* Divider */}
                                                <div className="w-full h-[1px] bg-[rgb(27,55,121)]/20 mb-3"></div>

                                                {/* Row 2: Title */}
                                                <p className="text-slate-500 font-medium text-sm whitespace-pre-line">{client.title}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. STUDENT TEAM SECTION */}
                <section className="pb-24" ref={studentSectionRef}>
                    <div className="container mx-auto px-4 overflow-hidden">
                        <div className="flex flex-col lg:flex-row gap-5 lg:gap-10 items-start">
                            {/* Left Column: Header */}
                            <div className="lg:w-1/4 flex-shrink-0">
                                <div className="text-[rgb(27,55,121)] opacity-50 relative lg:sticky lg:top-24">
                                    <span className="text-xl font-bold tracking-[0.3em] uppercase block mb-6">Developers</span>
                                    <ArrowDownRight className="w-12 h-12" />
                                </div>
                            </div>

                            {/* Right Column: Content */}
                            <div className="lg:flex-1 overflow-hidden">
                                <div ref={studentTrackRef} className="flex gap-8 w-max">
                                    {teamMembers.map((member, i) => (
                                        <div key={i} className="flex flex-col group cursor-default w-[60vw] md:w-[280px] flex-shrink-0">
                                            <div className="aspect-square w-full rounded-sm overflow-hidden mb-6 bg-slate-200 relative">
                                                <img src={member.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={member.name} />
                                            </div>

                                            <div className="flex flex-col flex-grow">
                                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{member.role}</span>
                                                <h4 className="text-2xl font-serif text-[rgb(27,55,121)] mb-6 leading-tight">{member.name}</h4>

                                                <div className="mt-auto pt-6 flex items-center justify-between">
                                                    <span className="inline-block px-3 py-1 bg-slate-50 text-slate-500 text-[11px] font-bold rounded-full uppercase tracking-wider">
                                                        {member.course.includes('Specialisation in') ? member.course.split('Specialisation in ')[1] : 'CS Student'}
                                                    </span>

                                                    <div className="flex items-center gap-3">
                                                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[rgb(27,55,121)] transition-colors">
                                                            <Linkedin className="w-5 h-5" />
                                                        </a>
                                                        <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[rgb(27,55,121)] transition-colors">
                                                            <Github className="w-5 h-5" />
                                                        </a>
                                                        <a href={`mailto:${member.email}`} className="text-slate-400 hover:text-[rgb(27,55,121)] transition-colors">
                                                            <Mail className="w-5 h-5" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quote Section */}
                <section className="py-24 bg-slate-100">
                    <div className="container mx-auto px-4 flex flex-col items-center text-center">
                        <Quote className="w-12 h-12 text-[rgb(27,55,121)] mb-8 opacity-50 fill-current" />
                        <h2 ref={quoteRef} className="text-3xl md:text-5xl font-serif text-center leading-tight max-w-4xl mb-8 text-[rgb(27,55,121)]">
                            "We adapt to dynamic outbreak patterns. <br />We deliver precision AI forecasting. We partner with public health authorities to ensure every insight drives strategic, life-saving action."
                        </h2>
                        <div className="h-[1px] w-20 bg-[rgb(27,55,121)]/20 my-6"></div>
                        <p className="font-bold tracking-widest text-sm uppercase text-slate-500">The Development Team</p>
                    </div>
                </section>

            </main>
        </div>
    );
}
