import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";

export default function ArticleApprovalTable({ searchTerm, selectedCategory, sortBy }) {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(null);

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
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200 text-sm">
                    {error}
                </div>
            )}

            {filteredArticles.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-500">No pending articles found.</p>
                </div>
            ) : (
                <div className="w-full overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-[rgb(27,55,121)]/20">
                                <tr>
                                    <th className="pl-4 pr-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">Article</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">Submitted</th>
                                    <th className="pl-6 pr-4 py-3 text-right text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredArticles.map((article, index) => (
                                    <tr key={article._id} className={`hover:bg-[rgb(27,55,121)]/10 transition-colors duration-200 ${index % 2 === 0 ? '' : 'bg-[rgb(27,55,121)]/5'}`}>
                                        <td className="pl-4 pr-6 py-4">
                                            <div className="font-medium text-[rgb(27,55,121)] mb-1">
                                                {article.title}
                                            </div>
                                            <div className="text-xs text-[rgb(27,55,121)]/70 line-clamp-2 max-w-md">
                                                {article.excerpt}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-semibold text-blue-600 capitalize">
                                                {article.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-[rgb(27,55,121)]/70">
                                                {new Date(article.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="pl-6 pr-4 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleUpdateStatus(article._id, 'approved')}
                                                    disabled={updating === article._id}
                                                    className="text-green-600 hover:text-green-800 text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                                                >
                                                    <Check className="w-3 h-3" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(article._id, 'rejected')}
                                                    disabled={updating === article._id}
                                                    className="text-red-600 hover:text-red-800 text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
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
        </div>
    );
}
