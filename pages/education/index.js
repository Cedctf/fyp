import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import SearchBar from '../../components/visionos/SearchBar';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { ARTICLES } from '../../data/articles';

const CATEGORIES = ["All", "prevention", "symptoms", "education", "tech & innovation", "community"];

export default function EducationPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Filter Logic
    const filteredArticles = ARTICLES.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || article.category.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    const featuredArticle = ARTICLES.find(a => a.featured);
    const otherArticles = filteredArticles.filter(a => a.id !== featuredArticle?.id);

    return (
        <div className="min-h-screen bg-white text-[rgb(27,55,121)] font-sans">
            <Head>
                <title>Dengue Education Hub</title>
                <meta name="description" content="Learn about Dengue prevention, symptoms, and latest research." />
            </Head>

            <Navbar />

            <main className="container mx-auto px-4 pt-24 pb-20">

                {/* Header Section */}
                <section className="mb-20 mt-8 text-left max-w-4xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-light font-serif text-[rgb(27,55,121)] leading-[1.1] tracking-tight"
                    >
                        Dengue Education Hub:
                        <br />
                        <span className="text-3xl font-normal font-[family-name:var(--font-inter)] block mt-2">Empowering Prevention with Knowledge and Innovation</span>
                    </motion.h1>
                </section>

                {/* Search & Filter Section */}
                <section className="mb-12 max-w-4xl mx-auto space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <SearchBar value={searchQuery} onChange={setSearchQuery} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-2"
                    >
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`
                  px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 font-sans
                  ${selectedCategory === cat
                                        ? 'bg-[rgb(87,17,17)] text-white shadow-lg'
                                        : 'bg-[rgb(242,240,235)] text-[rgb(27,55,121)] hover:bg-[rgb(27,55,121)] hover:text-white'}
                `}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </motion.div>
                </section>

                {/* Featured Article */}
                {selectedCategory === "All" && !searchQuery && featuredArticle && (
                    <Link href={`/education/${featuredArticle.id}`}>
                        <section className="mb-32 cursor-pointer group">
                            <div className="grid md:grid-cols-2 gap-15 items-center">
                                {/* Left: Text Content */}
                                <div className="space-y-10 group-hover:opacity-90 transition-opacity">
                                    <h2 className="text-3xl md:text-4xl font-serif font-light text-[rgb(27,55,121)] leading-[1.1] max-w-2xl pr-8">
                                        {featuredArticle.title}
                                    </h2>
                                    <p className="text-xl text-[rgb(27,55,121)]/60 font-sans leading-relaxed max-w-xl text-justify">
                                        {featuredArticle.excerpt}
                                    </p>
                                    <div className="space-y-6 pt-4">
                                        <div className="text-[rgb(27,55,121)]/40 font-mono text-lg">
                                            {featuredArticle.date}
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <span className="px-5 py-2 rounded-full border border-[rgb(27,55,121)]/20 text-[rgb(27,55,121)] text-xs font-bold uppercase tracking-widest font-sans hover:bg-[rgb(27,55,121)] hover:text-white transition-colors cursor-pointer">
                                                {featuredArticle.category}
                                            </span>
                                            <span className="px-5 py-2 rounded-full border border-[rgb(27,55,121)]/20 text-[rgb(27,55,121)] text-xs font-bold uppercase tracking-widest font-sans flex items-center gap-2">
                                                <Clock className="w-3 h-3" /> {featuredArticle.readTime}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Large Book Cover */}
                                <div className="relative w-full max-w-md mx-auto md:ml-auto">
                                    <motion.div
                                        whileHover={{ y: -5, boxShadow: "40px 40px 80px -10px rgba(0,0,0,0.9)" }}
                                        className="relative aspect-[3.5/5] w-full rounded-r-2xl rounded-l-md bg-white cursor-pointer group transition-all duration-300"
                                        style={{ boxShadow: "30px 30px 60px -15px rgba(0,0,0,0.7)" }}
                                    >
                                        {/* Spine */}
                                        <div className="absolute left-0 top-0 bottom-0 w-4 bg-black/20 z-20 rounded-l-md blur-[1px]"></div>
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30 z-30 opacity-50"></div>

                                        {/* Cover Content */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${featuredArticle.image ? '' : (featuredArticle.imageGradient || 'from-blue-900 to-slate-900')} rounded-r-2xl rounded-l-md overflow-hidden flex flex-col items-center justify-between p-8 text-white`}>

                                            {featuredArticle.image ? (
                                                <>
                                                    <img
                                                        src={featuredArticle.image}
                                                        alt={featuredArticle.title}
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10"></div>
                                                    <div className="absolute bottom-8 left-0 right-0 text-center z-10 tracking-[0.2em] font-light text-white/90 text-sm">
                                                        THE SILENT THREAT
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    {/* Texture Overlay */}
                                                    <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
                                                    <div className="absolute inset-0 bg-black/10"></div>

                                                    {/* Top Element */}
                                                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 z-10">
                                                        <div className="w-8 h-8 bg-white/80 rounded-full"></div>
                                                    </div>

                                                    {/* Center Graphic */}
                                                    <div className="relative z-10 w-full aspect-square border border-white/10 rounded-full flex items-center justify-center">
                                                        <div className="w-3/4 h-3/4 border border-white/20 rounded-full animate-pulse"></div>
                                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-full opacity-30"></div>
                                                    </div>

                                                    {/* Bottom Text */}
                                                    <div className="text-center z-10 tracking-[0.2em] font-light text-white/80 text-sm">
                                                        THE SILENT THREAT
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                    </motion.div>
                                </div>
                            </div>
                        </section >
                    </Link>
                )
                }

                {/* Article List */}
                <section>
                    {selectedCategory !== "All" && (
                        <h2 className="text-2xl font-bold mb-8 text-[rgb(27,55,121)] border-b border-[rgb(27,55,121)]/10 pb-4 font-serif">
                            {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Articles
                        </h2>
                    )}

                    <div className="space-y-12">
                        {otherArticles.map((article, index) => (
                            <Link href={`/education/${article.id}`} key={article.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-b border-[rgb(27,55,121)]/5 pb-12 last:border-0 cursor-pointer"
                                >
                                    {/* Date - Left Column */}
                                    <div className="md:col-span-2 text-[rgb(27,55,121)] font-mono text-lg pt-2 opacity-60">
                                        {article.date}
                                    </div>

                                    {/* Book Cover - Middle Column */}
                                    <div className="md:col-span-3">
                                        <div className="relative aspect-[3/4] w-full max-w-[200px] mx-auto md:mx-0 rounded-r-lg rounded-l-sm bg-white transition-all duration-500 group-hover:-translate-y-2 cursor-pointer"
                                            style={{ boxShadow: "20px 20px 40px -5px rgba(0,0,0,0.6)" }}
                                        >
                                            {/* Spine effect */}
                                            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/20 to-transparent z-10 rounded-l-sm"></div>

                                            {/* Cover Art */}
                                            <div className={`absolute inset-0 bg-gradient-to-br ${article.image ? '' : (article.imageGradient || 'from-slate-200 to-slate-300')} rounded-r-lg rounded-l-sm flex items-center justify-center p-4 text-center overflow-hidden`}>
                                                {article.image ? (
                                                    <>
                                                        <img
                                                            src={article.image}
                                                            alt={article.title}
                                                            className="absolute inset-0 w-full h-full object-cover rounded-r-lg rounded-l-sm"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-r-lg rounded-l-sm"></div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply"></div>
                                                        <span className="text-[rgb(27,55,121)]/20 font-bold text-xs tracking-widest uppercase rotate-90 absolute right-2 bottom-4 origin-bottom-right font-sans">
                                                            Dengue Mission
                                                        </span>
                                                        <h4 className="text-[rgb(27,55,121)] font-serif italic text-xl leading-tight opacity-40">
                                                            {article.title}
                                                        </h4>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content - Right Column */}
                                    <div className="md:col-span-7 flex flex-col items-start gap-4">
                                        <div className="flex justify-between w-full items-start">
                                            <h3 className="text-3xl font-bold text-[rgb(27,55,121)] group-hover:text-[rgb(87,17,17)] transition-colors cursor-pointer leading-tight font-serif text-justify">
                                                {article.title}
                                            </h3>
                                            <ArrowRight className="w-6 h-6 text-[rgb(27,55,121)] -rotate-45 group-hover:rotate-0 transition-transform duration-300 flex-shrink-0 ml-4" />
                                        </div>

                                        <p className="text-lg text-[rgb(27,55,121)]/70 leading-relaxed max-w-2xl font-sans text-justify">
                                            {article.excerpt}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="px-3 py-1 rounded-full border border-[rgb(27,55,121)]/20 text-[rgb(27,55,121)]/60 text-xs font-semibold uppercase tracking-wider font-sans">
                                                {article.category}
                                            </span>
                                            <span className="px-3 py-1 rounded-full border border-[rgb(27,55,121)]/20 text-[rgb(27,55,121)]/60 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 font-sans">
                                                <Clock className="w-3 h-3" /> {article.readTime}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>

                    {otherArticles.length === 0 && (
                        <div className="text-center py-20 border-t border-[rgb(27,55,121)]/10 mt-8">
                            <p className="text-[rgb(27,55,121)]/50 text-lg">No articles found matching your criteria.</p>
                        </div>
                    )}
                </section>

            </main >
        </div >
    );
}
