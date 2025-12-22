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
import { toast } from "sonner";

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
    const [keyToEdit, setKeyToEdit] = useState(null);
    const [updating, setUpdating] = useState(false);

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
                toast.success('API Key Created', { style: { color: '#1B7946' } });
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
                toast.success('API Key Revoked', { style: { color: 'rgb(211, 47, 47)' } });
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

    const handleEditClick = (key) => {
        setKeyToEdit(key);
    };

    const handleUpdateStatus = async (status) => {
        if (!keyToEdit) return;

        setUpdating(true);
        try {
            const res = await fetch('/api/keys', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyId: keyToEdit._id, status }),
            });

            if (res.ok) {
                fetchKeys();
                setKeyToEdit(null);
            } else {
                const err = await res.json();
                setError(err.error || 'Failed to update key status');
            }
        } catch (err) {
            console.error("Failed to update key status", err);
            setError('An error occurred while updating the key status');
        } finally {
            setUpdating(false);
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
                <DialogContent className="border-[rgb(27,55,121)]/20 p-6 max-w-3xl">
                    <DialogHeader className="space-y-3">
                        <DialogTitle className="text-xl font-bold text-[rgb(27,55,121)]">
                            Save your key
                        </DialogTitle>
                        <div className="space-y-4">
                            <DialogDescription className="text-[rgb(27,55,121)]/70 text-sm leading-relaxed">
                                Please save your secret key in a safe place since <span className="font-semibold text-[rgb(27,55,121)]">you won't be able to view it again.</span> Keep it secure, as anyone with your API key can make requests on your behalf. If you do lose it, you'll need to generate a new one.
                            </DialogDescription>

                            <a href="#" className="text-sm text-[rgb(27,55,121)]/70 underline hover:text-[rgb(27,55,121)] inline-block">
                                Learn more about API key best practices <span className="inline-block ml-0.5">↗</span>
                            </a>
                        </div>
                    </DialogHeader>

                    <div className="mt-6 space-y-6">
                        <div className="relative">
                            <div className="flex items-center justify-between w-full px-3 py-2 bg-[rgb(27,55,121)]/5 border border-[rgb(27,55,121)]/20 rounded-md">
                                <code className="flex-1 min-w-0 font-mono text-sm text-[rgb(27,55,121)] break-all whitespace-normal mr-2">
                                    {createdKey?.rawKey}
                                </code>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(createdKey.rawKey);
                                        toast.success("Copied to clipboard");
                                    }}
                                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[rgb(27,55,121)]/20 rounded text-sm font-medium text-[rgb(27,55,121)] hover:bg-[rgb(27,55,121)]/5 transition-colors shadow-sm"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-[rgb(27,55,121)]">Permissions</h4>
                            <p className="text-sm text-[rgb(27,55,121)]/70">Read and write API resources</p>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setCreatedKey(null)}
                                className="px-4 py-2 bg-[rgb(27,55,121)] text-white text-sm font-medium rounded-md hover:bg-[rgb(27,55,121)]/90 transition-colors"
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

            {/* Edit Status Dialog */}
            <Dialog open={!!keyToEdit} onOpenChange={(open) => !open && setKeyToEdit(null)}>
                <DialogContent className="sm:max-w-[500px] border-[rgb(27,55,121)]/20">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-serif font-semibold text-[rgb(27,55,121)]">
                            Edit API Key Status
                        </DialogTitle>
                        <DialogDescription className="text-[rgb(27,55,121)]/70 font-serif">
                            Change the status for <span className="font-semibold">{keyToEdit?.name}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => handleUpdateStatus('active')}
                                disabled={updating || keyToEdit?.status === 'active'}
                                className={`p-3 rounded-md border text-left flex items-center justify-between transition-all ${keyToEdit?.status === 'active'
                                    ? 'bg-[#1B7946]/10 border-[#1B7946]/20 ring-1 ring-[#1B7946]'
                                    : 'bg-white border-gray-200 hover:border-[rgb(27,55,121)]/30'
                                    }`}
                            >
                                <div>
                                    <div className={`font-semibold ${keyToEdit?.status === 'active' ? 'text-[#1B7946]' : 'text-gray-700'}`}>Active</div>
                                    <div className="text-xs text-gray-500">Key can be used for API requests</div>
                                </div>
                                {keyToEdit?.status === 'active' && <CheckCircle2 className="w-5 h-5 text-[#1B7946]" />}
                            </button>

                            <button
                                onClick={() => handleUpdateStatus('inactive')}
                                disabled={updating || keyToEdit?.status === 'inactive'}
                                className={`p-3 rounded-md border text-left flex items-center justify-between transition-all ${keyToEdit?.status === 'inactive'
                                    ? 'bg-red-50 border-red-200 ring-1 ring-red-500'
                                    : 'bg-white border-gray-200 hover:border-[rgb(27,55,121)]/30'
                                    }`}
                            >
                                <div>
                                    <div className={`font-semibold ${keyToEdit?.status === 'inactive' ? 'text-red-700' : 'text-gray-700'}`}>Inactive</div>
                                    <div className="text-xs text-gray-500">Key is disabled and cannot be used</div>
                                </div>
                                {keyToEdit?.status === 'inactive' && <CheckCircle2 className="w-5 h-5 text-red-600" />}
                            </button>
                        </div>
                    </div>
                    <DialogFooter className="mt-2">
                        <button
                            onClick={() => setKeyToEdit(null)}
                            className="px-4 py-2 rounded-md font-semibold border border-[rgb(27,55,121)]/20 text-[rgb(27,55,121)] hover:bg-[rgb(27,55,121)]/5 transition-colors text-sm"
                        >
                            Cancel
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
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-[rgb(27,55,121)] uppercase bg-gray-50 font-serif tracking-wider font-semibold">
                                <tr>
                                    <th className="px-4 py-2">NAME</th>
                                    <th className="px-4 py-2">STATUS</th>
                                    <th className="px-4 py-2">SECRET KEY</th>
                                    <th className="px-4 py-2">CREATED</th>
                                    <th className="px-4 py-2">LAST USED</th>
                                    <th className="px-4 py-2">CREATED BY</th>
                                    <th className="px-4 py-2">PERMISSIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[rgb(27,55,121)]/20">
                                {keys.map((key, index) => (
                                    <tr
                                        key={key._id}
                                        className={`hover:bg-[rgb(27,55,121)]/10 cursor-pointer transition-colors ${index % 2 === 1 ? 'bg-[rgb(27,55,121)]/5' : ''}`}
                                    >
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="font-medium text-[rgb(27,55,121)]">{key.name}</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`text-xs font-semibold ${key.status === 'inactive' ? 'text-red-600' : 'text-[#1B7946]'}`}>
                                                {key.status === 'inactive' ? 'Inactive' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="font-mono text-[rgb(27,55,121)]/70">
                                                {formatSecretKey(key.prefix)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="text-[rgb(27,55,121)]/70">
                                                {formatDate(key.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="text-[rgb(27,55,121)]/70">
                                                {formatDate(key.lastUsed)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="text-[rgb(27,55,121)]/70">
                                                {session?.user?.name || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[rgb(27,55,121)]/70">All</span>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleEditClick(key)}
                                                        className="text-[rgb(27,55,121)]/70 hover:text-[rgb(27,55,121)] hover:bg-[rgb(27,55,121)]/10 rounded-md p-1 transition-all duration-200"
                                                        title="Edit status"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRevokeClick(key)}
                                                        className="text-[#D32F2F] hover:text-[#D32F2F] hover:bg-[#D32F2F]/10 rounded-md p-1 transition-all duration-200"
                                                        title="Delete key"
                                                    >
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M20.5001 6H3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                            <path d="M18.8332 8.5L18.3732 15.3991C18.1962 18.054 18.1077 19.3815 17.2427 20.1907C16.3777 21 15.0473 21 12.3865 21H11.6132C8.95235 21 7.62195 21 6.75694 20.1907C5.89194 19.3815 5.80344 18.054 5.62644 15.3991L5.1665 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                            <path d="M9.1709 4C9.58273 2.83481 10.694 2 12.0002 2C13.3064 2 14.4177 2.83481 14.8295 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
