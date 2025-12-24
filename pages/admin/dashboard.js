import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../../components/Navbar';
import { Check, X, Clock, FileText, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // 'pending', 'approved', 'rejected'

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/articles');
            const data = await res.json();
            setArticles(data);
        } catch (error) {
            console.error('Failed to load articles', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const res = await fetch('/api/admin/articles', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (res.ok) {
                // Update local state
                setArticles(prev => prev.map(article =>
                    article._id === id ? { ...article, status: newStatus } : article
                ));
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const filteredArticles = articles.filter(article =>
        filter === 'all' ? true : article.status === filter
    );

    return (
        <div className="min-h-screen bg-slate-50 text-[rgb(27,55,121)] font-sans">
            <Head>
                <title>Admin Dashboard - Dengue Education Hub</title>
            </Head>

            <Navbar />

            <main className="container mx-auto px-4 pt-24 pb-20">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-serif text-[rgb(27,55,121)] mb-2">Editorial Dashboard</h1>
                        <p className="text-[rgb(27,55,121)]/60">Manage and review community submissions</p>
                    </div>

                    <div className="flex bg-white rounded-lg p-1 shadow-sm border border-[rgb(27,55,121)]/10">
                        {['pending', 'approved', 'rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${filter === status
                                        ? 'bg-[rgb(27,55,121)] text-white shadow-md'
                                        : 'text-[rgb(27,55,121)]/60 hover:bg-[rgb(27,55,121)]/5'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 opacity-50">Loading request...</div>
                ) : (
                    <div className="grid gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredArticles.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-20 border-2 border-dashed border-[rgb(27,55,121)]/10 rounded-xl"
                                >
                                    <p className="text-[rgb(27,55,121)]/40">No {filter} articles found</p>
                                </motion.div>
                            ) : (
                                filteredArticles.map((article) => (
                                    <motion.div
                                        key={article._id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white rounded-xl p-6 shadow-sm border border-[rgb(27,55,121)]/10 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow"
                                    >
                                        {/* Status Indicator */}
                                        <div className={`w-2 self-stretch rounded-full flex-shrink-0 ${article.status === 'pending' ? 'bg-amber-400' :
                                                article.status === 'approved' ? 'bg-emerald-500' :
                                                    'bg-rose-500'
                                            }`} />

                                        {/* Content */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="inline-block px-3 py-1 rounded-full bg-[rgb(27,55,121)]/5 text-[rgb(27,55,121)] text-xs font-bold uppercase tracking-wider mb-2">
                                                        {article.category}
                                                    </span>
                                                    <h3 className="text-xl font-bold font-serif text-[rgb(27,55,121)]">{article.title}</h3>
                                                </div>
                                                <div className="text-sm font-mono text-[rgb(27,55,121)]/40 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(article.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>

                                            <p className="text-[rgb(27,55,121)]/70 leading-relaxed font-sans">{article.excerpt}</p>

                                            {/* Media Preview - Collapsible or small thumbnail could go here */}
                                            {article.imageUrl && (
                                                <div className="relative h-20 w-32 rounded-lg overflow-hidden border border-[rgb(27,55,121)]/10 mt-2">
                                                    <img src={article.imageUrl} alt="Cover" className="object-cover w-full h-full" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {article.status === 'pending' && (
                                            <div className="flex md:flex-col gap-3 justify-center md:border-l md:border-[rgb(27,55,121)]/10 md:pl-6">
                                                <button
                                                    onClick={() => handleStatusUpdate(article._id, 'approved')}
                                                    className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-600 transition-colors shadow-sm w-full justify-center"
                                                >
                                                    <Check className="w-4 h-4" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(article._id, 'rejected')}
                                                    className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-rose-100 transition-colors w-full justify-center"
                                                >
                                                    <X className="w-4 h-4" /> Reject
                                                </button>
                                            </div>
                                        )}
                                        {article.status !== 'pending' && (
                                            <div className="flex md:flex-col justify-center md:border-l md:border-[rgb(27,55,121)]/10 md:pl-6 min-w-[120px]">
                                                <div className="text-center space-y-1">
                                                    <div className={`text-sm font-bold ${article.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {article.status.toUpperCase()}
                                                    </div>
                                                    <button
                                                        onClick={() => handleStatusUpdate(article._id, 'pending')}
                                                        className="text-xs text-[rgb(27,55,121)]/40 hover:text-[rgb(27,55,121)] underline decoration-dotted"
                                                    >
                                                        Undo
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}
