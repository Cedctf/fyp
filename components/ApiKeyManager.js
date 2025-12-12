import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, AlertTriangle, Edit, Trash2, Plus } from 'lucide-react';

export default function ApiKeyManager() {
    const { data: session } = useSession();
    const [keys, setKeys] = useState([]);
    const [newKeyName, setNewKeyName] = useState('');
    const [createdKey, setCreatedKey] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [keyToRevoke, setKeyToRevoke] = useState(null);
    const [revoking, setRevoking] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            const res = await fetch('/api/keys');
            if (res.ok) {
                const data = await res.json();
                setKeys(data.keys);
            }
        } catch (err) {
            console.error("Failed to fetch keys", err);
        }
    };

    const handleCreateKey = async (e) => {
        e.preventDefault();
        if (!newKeyName.trim()) {
            setError('Key name is required');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKeyName }),
            });

            if (res.ok) {
                const data = await res.json();
                setCreatedKey(data.key);
                setNewKeyName('');
                setShowCreateDialog(false);
                fetchKeys();
            } else {
                const err = await res.json();
                setError(err.error || 'Failed to create key');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeClick = (key) => {
        setKeyToRevoke(key);
    };

    const handleRevokeConfirm = async () => {
        if (!keyToRevoke) return;

        setRevoking(true);
        try {
            const res = await fetch(`/api/keys?keyId=${keyToRevoke._id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchKeys();
                setKeyToRevoke(null);
            } else {
                setError('Failed to revoke key');
            }
        } catch (err) {
            console.error("Failed to revoke key", err);
            setError('An error occurred while revoking the key');
        } finally {
            setRevoking(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    const formatSecretKey = (prefix) => {
        return `${prefix}...`;
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h2 className="text-3xl font-serif font-semibold text-[rgb(27,55,121)] mb-4">
                        API keys
                    </h2>
                </div>
                <button
                    onClick={() => setShowCreateDialog(true)}
                    className="ml-6 bg-[rgb(27,55,121)] text-white px-4 py-2 rounded-md font-semibold hover:bg-[rgb(27,55,121)]/90 transition-colors flex items-center gap-2 whitespace-nowrap text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Create new API key
                </button>
            </div>

            {/* Create Key Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[500px] border-[rgb(27,55,121)]/20">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-[rgb(27,55,121)] font-serif font-semibold">
                            Create new API key
                        </DialogTitle>
                        <DialogDescription className="text-[rgb(27,55,121)]/70 font-serif">
                            Enter a name for your API key to help you identify it later.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateKey} className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-semibold text-[rgb(27,55,121)] mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                value={newKeyName}
                                onChange={(e) => {
                                    setNewKeyName(e.target.value);
                                    setError(null);
                                }}
                                placeholder="e.g. Production App"
                                className="w-full p-3 border border-[rgb(27,55,121)]/20 rounded-md focus:ring-2 focus:ring-[rgb(27,55,121)] focus:border-[rgb(27,55,121)] bg-white text-[rgb(27,55,121)]"
                            />
                            {error && (
                                <p className="text-[#D32F2F] mt-2 text-sm flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    {error}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateDialog(false);
                                    setNewKeyName('');
                                    setError(null);
                                }}
                                className="px-4 py-2 rounded-md font-semibold border border-[rgb(27,55,121)]/20 text-[rgb(27,55,121)] hover:bg-[rgb(27,55,121)]/5 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 rounded-md font-semibold bg-[rgb(27,55,121)] text-white hover:bg-[rgb(27,55,121)]/90 transition-colors disabled:opacity-50 text-sm"
                            >
                                {loading ? 'Creating...' : 'Create API Key'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Success Dialog for New Key */}
            <Dialog open={!!createdKey} onOpenChange={(open) => !open && setCreatedKey(null)}>
                <DialogContent className="sm:max-w-[600px] border-[rgb(27,55,121)]/20">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                            <DialogTitle className="text-2xl font-serif font-semibold text-[rgb(27,55,121)]">
                                New API Key Generated!
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-[rgb(27,55,121)]/70 text-base mt-2">
                            Please copy this key now. You won't be able to see it again.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="flex items-center gap-2 bg-[rgb(27,55,121)]/5 p-4 border border-[rgb(27,55,121)]/20 rounded-md">
                            <code className="flex-1 font-mono text-sm text-[rgb(27,55,121)] break-all">
                                {createdKey?.rawKey}
                            </code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(createdKey.rawKey);
                                }}
                                className="bg-[rgb(27,55,121)] text-white px-4 py-2 rounded-md font-semibold hover:bg-[rgb(27,55,121)]/90 transition-colors text-sm whitespace-nowrap"
                            >
                                Copy
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setCreatedKey(null)}
                                className="bg-[rgb(27,55,121)] text-white px-6 py-2 rounded-md font-semibold hover:bg-[rgb(27,55,121)]/90 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog for Revoke */}
            <Dialog open={!!keyToRevoke} onOpenChange={(open) => !open && setKeyToRevoke(null)}>
                <DialogContent className="sm:max-w-[500px] border-[#D32F2F]/20">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-0">
                                <AlertTriangle className="w-6 h-6 text-[#D32F2F]" />
                            </div>
                            <DialogTitle className="text-xl font-serif font-semibold text-[#D32F2F]">
                                Revoke API Key?
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-[rgb(27,55,121)]/70 text-base mt-2">
                            Are you sure you want to revoke the key <span className="font-semibold text-[rgb(27,55,121)]">{keyToRevoke?.name}</span>? This action cannot be undone and any applications using this key will immediately lose access.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                        <button
                            onClick={() => setKeyToRevoke(null)}
                            disabled={revoking}
                            className="px-6 py-2 rounded-md font-semibold border border-[rgb(27,55,121)]/20 text-[rgb(27,55,121)] hover:bg-[rgb(27,55,121)]/5 transition-colors disabled:opacity-50 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRevokeConfirm}
                            disabled={revoking}
                            className="px-6 py-2 rounded-md font-semibold bg-[#D32F2F] text-white hover:bg-[#D32F2F]/90 transition-colors disabled:opacity-50 text-sm"
                        >
                            {revoking ? 'Revoking...' : 'Revoke Key'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* API Keys Table */}
            <div className="w-full rounded-md overflow-hidden">
                {keys.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                        <p className="text-[rgb(27,55,121)]/70">No API keys found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="pl-0 pr-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">NAME</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">STATUS</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">SECRET KEY</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">CREATED</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">LAST USED</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">CREATED BY</th>
                                    <th className="pl-6 pr-0 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">PERMISSIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {keys.map((key) => (
                                    <tr key={key._id}>
                                        <td className="pl-0 pr-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-[rgb(27,55,121)]">{key.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-semibold text-green-600">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-mono text-[rgb(27,55,121)]/70">
                                                {formatSecretKey(key.prefix)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-[rgb(27,55,121)]/70">
                                                {formatDate(key.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-[rgb(27,55,121)]/70">
                                                {formatDate(key.lastUsed)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-[rgb(27,55,121)]/70">
                                                {session?.user?.name || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="pl-6 pr-0 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[rgb(27,55,121)]/70">All</span>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => {/* Edit functionality can be added later */}}
                                                        className="text-[rgb(27,55,121)]/70 hover:text-[rgb(27,55,121)] hover:bg-[rgb(27,55,121)]/10 rounded-md p-1 transition-all duration-200"
                                                        title="Edit permissions"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRevokeClick(key)}
                                                        className="text-[#D32F2F] hover:text-[#D32F2F] hover:bg-[#D32F2F]/10 rounded-md p-1 transition-all duration-200"
                                                        title="Delete key"
                                                    >
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M20.5001 6H3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                                            <path d="M18.8332 8.5L18.3732 15.3991C18.1962 18.054 18.1077 19.3815 17.2427 20.1907C16.3777 21 15.0473 21 12.3865 21H11.6132C8.95235 21 7.62195 21 6.75694 20.1907C5.89194 19.3815 5.80344 18.054 5.62644 15.3991L5.1665 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                                            <path d="M9.1709 4C9.58273 2.83481 10.694 2 12.0002 2C13.3064 2 14.4177 2.83481 14.8295 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
