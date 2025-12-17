import { useState, useEffect } from 'react';
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BlogCard from './ui/blog-cards';

const Navbar = ({ isDark }) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    // Determine if we should show light text (Beige)
    // If isDark prop is passed, use it. Otherwise default to True only for Home ('/').
    // BUT: "isDark" usually means Background is Dark, so Text is Light.
    // If isDark prop is provided, we respect it.
    // If not, we fall back to route check: Home = Dark Bg (Light Text), Others = Light Bg (Dark Text).
    const isDarkTheme = isDark !== undefined ? isDark : (router.pathname === '/');

    // Text Color:
    // Open Menu -> Blue
    // Dark Theme -> Beige
    // Light Theme -> Blue
    const textColorClass = isOpen ? 'text-[rgb(27,55,121)]' : (isDarkTheme ? 'text-[rgb(242,240,235)]' : 'text-[rgb(27,55,121)]');
    const buttonColor = isOpen ? 'rgb(27,55,121)' : (isDarkTheme ? 'rgb(242,240,235)' : 'rgb(27,55,121)');

    const menuItems = [
        { title: "HOME", date: "01", description: "Return to the main landing page.", href: "/" },
        { title: "DENGUE DASHBOARD", date: "02", description: "Real-time statistics and heatmaps.", href: "/dengue-heatmap" },
        { title: "API MANAGEMENT DASHBOARD", date: "03", description: "Developer tools and API access.", href: "/api-dashboard" },
        { title: "EDUCATION HUB", date: "04", description: "Learn about prevention and safety.", href: "/education" },
        ...(session?.user?.role === 'admin' ? [{ title: "ADMIN DASHBOARD", date: "05", description: "Manage users and content.", href: "/admin" }] : []),
    ];

    const menuContainerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        },
        exit: {
            opacity: 0,
            transition: {
                staggerChildren: 0.05,
                staggerDirection: -1
            }
        }
    };

    const menuItemVariants = {
        hidden: { y: -20, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1]
            }
        },
        exit: {
            y: -20,
            opacity: 0,
            transition: {
                duration: 0.3
            }
        }
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-transparent">
            <div className="container mx-auto px-4">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo (Top Left) */}
                    <Link
                        href="/"
                        className={`text-2xl font-bold font-serif tracking-tight z-50 relative ${textColorClass}`}
                    >
                        DOPEWS-MY
                    </Link>

                    {/* Menu Toggle (Top Right) */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="z-50 relative p-2 rounded-full transition-colors hover:bg-black/5"
                        style={{ color: buttonColor }}
                    >
                        <AnimatePresence mode="wait">
                            {isOpen ? (
                                <motion.div
                                    key="close"
                                    initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                    exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <X className="w-8 h-8" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="menu"
                                    initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                    exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <Menu className="w-8 h-8" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>

                    {/* Overlay Menu */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="fixed inset-0 bg-white z-40 overflow-y-auto"
                            >
                                <div className="container mx-auto px-4 pt-24 pb-8 md:pt-32 md:pb-12 flex flex-col justify-between min-h-screen">
                                    {/* Middle Section: Main Navigation Links */}
                                    <div className="flex flex-col flex-grow justify-center w-full pt-12 md:pt-0">
                                        <motion.div
                                            variants={menuContainerVariants}
                                            initial="hidden"
                                            animate="show"
                                            exit="exit"
                                            className="grid grid-cols-1 md:grid-cols-2 w-full gap-x-8 gap-y-4"
                                        >
                                            {menuItems.map((item, index) => (
                                                <motion.div variants={menuItemVariants} key={index} className="w-full">
                                                    <Link
                                                        href={item.href}
                                                        onClick={() => setIsOpen(false)}
                                                        className="w-full block"
                                                    >
                                                        <BlogCard
                                                            title={item.title}
                                                            date={item.date}
                                                            description={item.description}
                                                            isActive={router.pathname === item.href}
                                                        />
                                                    </Link>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    </div>

                                    {/* Bottom Section: Secondary Links & Footer */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5, duration: 0.5 }}
                                        className="w-full flex flex-col md:flex-row justify-between items-end md:items-center mt-12 pt-8 border-t border-neutral-100"
                                    >
                                        {/* Secondary Links (Legals/About) */}
                                        <div className="flex gap-8 text-neutral-500 font-medium text-sm md:text-base mb-6 md:mb-0">
                                            <Link href="/about" className="hover:text-[rgb(27,55,121)] transition-colors">ABOUT US</Link>
                                            <Link href="/contact" className="hover:text-[rgb(27,55,121)] transition-colors">CONTACT US</Link>
                                        </div>

                                        {/* Auth Buttons / CTA Area */}
                                        <div className="flex gap-4 items-center">
                                            {session ? (
                                                <>
                                                    <Link href="/profile" onClick={() => setIsOpen(false)} className="hover:text-[rgb(27,55,121)] transition-colors font-medium text-sm md:text-base uppercase text-neutral-500">
                                                        MY PROFILE
                                                    </Link>
                                                    <button
                                                        onClick={() => { signOut(); setIsOpen(false); }}
                                                        className="bg-black text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-[rgb(27,55,121)] transition-colors"
                                                    >
                                                        SIGN OUT
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <Link
                                                        href="/auth/signin"
                                                        onClick={() => setIsOpen(false)}
                                                        className="text-black px-6 py-3 text-xs font-bold tracking-widest uppercase border border-black hover:bg-black hover:text-white transition-colors"
                                                    >
                                                        SIGN IN
                                                    </Link>
                                                    <Link
                                                        href="/auth/signup"
                                                        onClick={() => setIsOpen(false)}
                                                        className="bg-black text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-[rgb(27,55,121)] transition-colors"
                                                    >
                                                        SIGN UP
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
