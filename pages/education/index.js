import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import { Calendar, ArrowRight, BookOpen, Search, ChevronDown, Check, Plus } from 'lucide-react';
import { ARTICLES } from '../../data/articles';
import { getArticlesCollection } from '../../lib/mongodb';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

const CATEGORIES = ["All", "prevention", "symptoms", "education", "tech & innovation", "community"];
const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
];

export default function EducationPage({ dbArticles = [] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("newest"); // newest, oldest, readTimeAsc, readTimeDesc

    // Combine static and dynamic articles
    const allArticles = [...dbArticles, ...ARTICLES];

    // Filter Logic
    const filteredArticles = allArticles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || article.category.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    }).sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.date) - new Date(a.date);
        } else if (sortBy === 'oldest') {
            return new Date(a.date) - new Date(b.date);
        }
        return 0;
    });

    const featuredArticle = ARTICLES.find(a => a.featured);
    // Be careful not to filter out the featured article from the *list* if it matches the search/filter criteria, 
    // but the original design separated them. 
    // The original logic was: otherArticles = filteredArticles.filter(a => a.id !== featuredArticle?.id);
    // Let's keep that to avoid duplication if the featured article is also in the list.
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
                        Dengue Education Hub
                        <br />
                        <span className="text-3xl font-normal font-[family-name:var(--font-inter)] block mt-2">Empowering Prevention with Knowledge and Innovation</span>
                    </motion.h1>
                </section>

                {/* Search & Filter Section */}
                <section className="mb-20 pt-10 border-t border-[rgb(27,55,121)]/10">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-8 md:gap-16">
                        {/* Search Input */}
                        <div className="flex-1 w-full md:max-w-md relative group">
                            <div className="relative flex items-center border-b border-[rgb(27,55,121)]/20 py-2 group-focus-within:border-[rgb(27,55,121)] transition-colors">
                                <span className="text-[rgb(27,55,121)] font-sans mr-4">Search</span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent text-[rgb(27,55,121)] text-lg font-serif placeholder-[rgb(27,55,121)]/30 focus:outline-none"
                                />
                                <Search className="w-5 h-5 text-[rgb(27,55,121)]" />
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
                            {/* Sort By */}
                            <div className="flex items-center gap-4 relative group">
                                <span className="text-sm font-sans text-[rgb(27,55,121)]">Sort by</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            className="flex items-center gap-2 bg-transparent pr-8 py-1 text-sm font-sans font-medium text-[rgb(27,55,121)] transition focus:outline-none"
                                            aria-label="Sort articles"
                                        >
                                            <span>{SORT_OPTIONS.find(opt => opt.value === sortBy)?.label}</span>
                                            <ChevronDown className="h-4 w-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="min-w-[14rem] text-[rgb(27,55,121)]">
                                        {SORT_OPTIONS.map(option => (
                                            <DropdownMenuItem
                                                key={option.value}
                                                onSelect={() => setSortBy(option.value)}
                                                className="flex items-center gap-2 text-[rgb(27,55,121)] data-[highlighted]:text-[rgb(27,55,121)]"
                                            >
                                                <span className="flex-1">{option.label}</span>
                                                {sortBy === option.value && <Check className="h-4 w-4" />}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Filter */}
                            <div className="flex items-center gap-4 relative group">
                                <span className="text-sm font-sans text-[rgb(27,55,121)]">Filter</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            className="flex items-center gap-2 bg-transparent pr-8 py-1 text-sm font-sans font-medium text-[rgb(27,55,121)] transition focus:outline-none"
                                            aria-label="Filter articles"
                                        >
                                            <span>{selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</span>
                                            <ChevronDown className="h-4 w-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="min-w-[14rem] text-[rgb(27,55,121)]">
                                        {CATEGORIES.map(cat => (
                                            <DropdownMenuItem
                                                key={cat}
                                                onSelect={() => setSelectedCategory(cat)}
                                                className="flex items-center gap-2 text-[rgb(27,55,121)] data-[highlighted]:text-[rgb(27,55,121)]"
                                            >
                                                <span className="flex-1">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                                                {selectedCategory === cat && <Check className="h-4 w-4" />}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Post Button */}
                            <Link href="/education/new">
                                <button
                                    className="flex items-center gap-2 bg-[rgb(27,55,121)] text-white px-6 py-2 rounded-full text-sm font-sans font-medium hover:bg-[rgb(20,40,90)] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    aria-label="Post new article"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Post Article</span>
                                </button>
                            </Link>
                        </div>
                    </div>
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
                            <div key={article.id} className="relative">
                                <Link href={`/education/${article.id}`}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group grid grid-cols-1 md:grid-cols-12 gap-8 items-start cursor-pointer"
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
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                                {index !== otherArticles.length - 1 && (
                                    <hr className="my-12 border-t-2 border-[rgb(27,55,121)]/20" />
                                )}
                            </div>
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

export async function getServerSideProps() {
    try {
        const collection = await getArticlesCollection();
        const articles = await collection.find({ status: 'approved' })
            .sort({ createdAt: -1 })
            .toArray();

        // Serialize for Next.js props
        const serializedArticles = articles.map(article => ({
            ...article,
            _id: article._id.toString(),
            createdAt: article.createdAt.toISOString(),
            // Map DB fields to UI fields if needed
            id: article._id.toString(),
            date: article.date || new Date(article.createdAt).toLocaleDateString(),
            image: article.imageUrl || null,
            readTime: article.readTime || '5 min read'
        }));

        return {
            props: {
                dbArticles: serializedArticles,
            },
        };
    } catch (error) {
        console.error("Error fetching articles:", error);
        return {
            props: {
                dbArticles: [],
            },
        };
    }
}
