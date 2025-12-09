import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Share2, Bookmark } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { ARTICLES } from '../../data/articles';

export default function ArticlePage() {
    const router = useRouter();
    const { id } = router.query;

    // Find article based on ID. 
    // Data is loaded client-side for simplicity in this static export example.
    const article = ARTICLES.find(a => a.id.toString() === id);

    if (!article && typeof window !== 'undefined' && id) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Article not found.</p>
                <Link href="/education" className="ml-4 text-blue-600 hover:underline">Go Back</Link>
            </div>
        );
    }

    if (!article) return null; // Loading state or skeletal loader could go here

    return (
        <div className="min-h-screen bg-white text-[rgb(27,55,121)] font-sans">
            <Head>
                <title>{article.title} | Dengue Education Hub</title>
                <meta name="description" content={article.excerpt} />
            </Head>

            <Navbar />

            <main className="pt-24 pb-20">
                {/* Back Button */}
                <div className="container mx-auto px-4 mb-8">
                    <Link href="/education" className="inline-flex items-center text-[rgb(27,55,121)]/60 hover:text-[rgb(27,55,121)] transition-colors font-semibold tracking-wide text-sm group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        BACK TO HUB
                    </Link>
                </div>

                <article className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <header className="mb-12 text-center">
                        <div className="flex items-center justify-center gap-4 mb-6 text-sm font-semibold tracking-wider text-[rgb(27,55,121)]/60">
                            <span className="uppercase">{article.category}</span>
                            <span className="w-1 h-1 rounded-full bg-[rgb(27,55,121)]/30"></span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {article.date}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-[rgb(27,55,121)]/30"></span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {article.readTime}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[rgb(27,55,121)] leading-[1.1] mb-8 max-w-3xl mx-auto">
                            {article.title}
                        </h1>

                        <p className="text-xl md:text-2xl text-[rgb(27,55,121)]/70 font-serif italic max-w-2xl mx-auto leading-relaxed">
                            "{article.excerpt}"
                        </p>
                    </header>

                    {/* Featured Image - Wide */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl mb-16"
                    >
                        {article.image ? (
                            <div className="relative w-full h-full flex items-center justify-center bg-gray-50 overflow-hidden">
                                {/* Blurred Background */}
                                <div className="absolute inset-0">
                                    <img src={article.image} alt="" className="w-full h-full object-cover blur-3xl opacity-50 scale-110" />
                                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                                </div>

                                {/* Main Image - Book Style */}
                                <motion.div
                                    className="relative z-10 h-[85%] aspect-[3/4] rounded-r-lg rounded-l-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                >
                                    <img src={article.image} alt={article.title} className="w-full h-full object-cover rounded-r-lg rounded-l-sm" />
                                    {/* Spine effect */}
                                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/20 to-transparent z-20 rounded-l-sm"></div>
                                    {/* Gloss effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-40 rounded-r-lg pointer-events-none"></div>
                                </motion.div>
                            </div>
                        ) : (
                            <div className={`absolute inset-0 bg-gradient-to-br ${article.imageGradient} flex items-center justify-center`}>
                                <span className="text-white/20 text-4xl font-bold tracking-widest uppercase">Dengue Control</span>
                            </div>
                        )}
                    </motion.div>

                    {/* Content Body */}
                    <div className="grid md:grid-cols-12 gap-12">
                        {/* Sidebar / Socials */}
                        <div className="hidden md:flex md:col-span-1 flex-col items-center gap-6 sticky top-32 h-fit">
                            <button className="p-3 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[rgb(27,55,121)] transition-colors">
                                <Share2 className="w-5 h-5" />
                            </button>
                            <button className="p-3 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[rgb(27,55,121)] transition-colors">
                                <Bookmark className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Main Content */}
                        <div className="md:col-span-10 text-lg text-[rgb(27,55,121)]/80 leading-[1.8] font-sans">
                            {article.content}

                            {/* Author/Footer */}
                            <div className="mt-16 pt-8 border-t border-[rgb(27,55,121)]/10 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-[rgb(27,55,121)] uppercase tracking-wider mb-1">Written By</p>
                                    <p className="font-serif text-xl italic">The Dengue Prediction Team</p>
                                </div>
                                <div className="flex gap-4">
                                    {/* Social icons could go here */}
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}
