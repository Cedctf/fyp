import { useState, useEffect } from 'react';

export default function ApiKeyManager() {
    const [keys, setKeys] = useState([]);
    const [newKeyName, setNewKeyName] = useState('');
    const [createdKey, setCreatedKey] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    const handleRevokeKey = async (id) => {
        if (!confirm('Are you sure you want to revoke this key? This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/keys?keyId=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchKeys();
            }
        } catch (err) {
            console.error("Failed to revoke key", err);
        }
    };

    return (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">API Keys</h2>

            <div className="mb-6">
                <form onSubmit={handleCreateKey} className="flex gap-2">
                    <input
                        type="text"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="Key Name (e.g. Production App)"
                        className="flex-1 p-2 border rounded text-gray-700"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate New Key'}
                    </button>
                </form>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>

            {createdKey && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
                    <h3 className="text-green-800 font-bold mb-2">New Key Generated!</h3>
                    <p className="text-sm text-green-700 mb-2">Please copy this key now. You won't be able to see it again.</p>
                    <div className="flex items-center gap-2 bg-white p-2 border rounded">
                        <code className="flex-1 font-mono text-gray-800 break-all">{createdKey.rawKey}</code>
                        <button
                            onClick={() => navigator.clipboard.writeText(createdKey.rawKey)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                        >
                            Copy
                        </button>
                    </div>
                    <button
                        onClick={() => setCreatedKey(null)}
                        className="mt-2 text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Done
                    </button>
                </div>
            )}

            <div className="space-y-4">
                {keys.length === 0 ? (
                    <p className="text-gray-500 italic">No API keys found.</p>
                ) : (
                    keys.map((key) => (
                        <div key={key._id} className="flex items-center justify-between p-4 border rounded bg-gray-50">
                            <div>
                                <h4 className="font-semibold text-gray-800">{key.name}</h4>
                                <p className="text-sm text-gray-500 font-mono">Prefix: {key.prefix}...</p>
                                <p className="text-xs text-gray-400">Created: {new Date(key.createdAt).toLocaleDateString()}</p>
                                {key.lastUsed && <p className="text-xs text-gray-400">Last used: {new Date(key.lastUsed).toLocaleDateString()}</p>}
                            </div>
                            <button
                                onClick={() => handleRevokeKey(key._id)}
                                className="text-red-600 hover:text-red-800 text-sm font-semibold px-3 py-1 border border-red-200 rounded hover:bg-red-50"
                            >
                                Revoke
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
