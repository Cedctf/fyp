import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";

export default function ArticleApprovalTable({ searchTerm, selectedCategory, sortBy }) {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(null);
    const [selectedArticle, setSelectedArticle] = useState(null);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            // Fetch only pending articles for approval
            const res = await fetch('/api/admin/articles?status=pending');
            if (res.ok) {
                const data = await res.json();
                setArticles(data);
            } else {
                setError("Failed to fetch articles");
            }
        } catch (err) {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (articleId, newStatus) => {
        setUpdating(articleId);
        try {
            const res = await fetch('/api/admin/articles', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: articleId, status: newStatus })
            });

            if (res.ok) {
                setArticles(prev => prev.filter(article => article._id !== articleId));
            } else {
                const data = await res.json();
                alert(data.message || "Failed to update article");
            }
        } catch (err) {
            alert("Network error");
        } finally {
            setUpdating(null);
        }
    };

    // Filter and Sort Logic
    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (article.category && article.category.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === "All" || (article.category && article.category.toLowerCase() === selectedCategory.toLowerCase());

        return matchesSearch && matchesCategory;
    }).sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortBy === 'oldest') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
        return 0;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(27,55,121)]"></div>
            </div>
        );
    }

    return (
        <div>
            {error && (
                <div className="bg-[rgb(87,17,17)]/5 text-[rgb(87,17,17)] p-4 rounded-lg mb-6 border border-[rgb(87,17,17)]/20 text-sm">
                    {error}
                </div>
            )}

            {filteredArticles.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-500">No pending articles found.</p>
                </div>
            ) : (
                <div className="w-full overflow-hidden">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full">
                            <thead className="border-b border-[rgb(27,55,121)]/20">
                                <tr>
                                    <th className="pl-4 pr-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">Summary</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">Submitted</th>
                                    <th className="pl-6 pr-4 py-3 text-right text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredArticles.map((article, index) => (
                                    <tr
                                        key={article._id}
                                        className={`hover:bg-[rgb(27,55,121)]/10 transition-colors duration-200 cursor-pointer ${index % 2 === 0 ? '' : 'bg-[rgb(27,55,121)]/5'}`}
                                        onClick={() => setSelectedArticle(article)}
                                    >
                                        <td className="pl-4 pr-6 py-4">
                                            <div className="font-medium text-[rgb(27,55,121)]">
                                                {article.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-[rgb(27,55,121)]/70 line-clamp-2 max-w-sm">
                                                {article.excerpt}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-semibold text-[rgb(27,55,121)] capitalize">
                                                {article.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-[rgb(27,55,121)]/70">
                                                {new Date(article.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="pl-6 pr-4 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-3" onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={() => handleUpdateStatus(article._id, 'approved')}
                                                    disabled={updating === article._id}
                                                    className="px-3 py-1 bg-[rgb(27,55,121)] text-white rounded-full hover:bg-[rgb(27,55,121)]/90 shadow-sm hover:shadow text-xs font-medium flex items-center gap-1 transition-all disabled:opacity-50"
                                                >
                                                    <Check className="w-3 h-3" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(article._id, 'rejected')}
                                                    disabled={updating === article._id}
                                                    className="px-3 py-1 border border-[rgb(87,17,17)]/20 text-[rgb(87,17,17)] rounded-full hover:bg-[rgb(87,17,17)]/5 hover:border-[rgb(87,17,17)]/30 text-xs font-medium flex items-center gap-1 transition-all disabled:opacity-50"
                                                >
                                                    <X className="w-3 h-3" />
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {selectedArticle && (
                <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setSelectedArticle(null)}>
                    <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                        <div className="fixed inset-0 bg-black/50 transition-opacity" aria-hidden="true" />
                        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
                        <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full sm:p-6" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setSelectedArticle(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="mb-6">
                                <span className="text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider mb-2 block">{selectedArticle.category}</span>
                                <h2 className="text-xl font-serif font-semibold text-[rgb(27,55,121)] pr-8">{selectedArticle.title}</h2>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-[rgb(27,55,121)] uppercase tracking-wider mb-1">Summary</h3>
                                    <p className="text-sm text-[rgb(27,55,121)]/80 leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-100">
                                        {selectedArticle.excerpt}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-[rgb(27,55,121)] uppercase tracking-wider mb-1">Status</h3>
                                    <span className="capitalize font-medium text-sm text-[rgb(27,55,121)]/80">
                                        {selectedArticle.status}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-[rgb(27,55,121)] uppercase tracking-wider mb-1">Submitted</h3>
                                    <p className="text-sm text-[rgb(27,55,121)]/80">
                                        {new Date(selectedArticle.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-4 flex justify-end gap-3 mt-auto">
                                <button
                                    onClick={() => {
                                        handleUpdateStatus(selectedArticle._id, 'rejected');
                                        setSelectedArticle(null);
                                    }}
                                    disabled={updating === selectedArticle._id}
                                    className="px-6 py-2.5 border border-[rgb(87,17,17)]/20 text-[rgb(87,17,17)] rounded-full hover:bg-[rgb(87,17,17)]/5 hover:border-[rgb(87,17,17)]/30 text-sm font-medium transition-all hover:scale-105 flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Reject
                                </button>
                                <button
                                    onClick={() => {
                                        handleUpdateStatus(selectedArticle._id, 'approved');
                                        setSelectedArticle(null);
                                    }}
                                    disabled={updating === selectedArticle._id}
                                    className="px-6 py-2.5 bg-[rgb(27,55,121)] text-white rounded-full hover:bg-[rgb(27,55,121)]/90 shadow-md hover:shadow-lg text-sm font-medium transition-all hover:scale-105 flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    Approve
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
