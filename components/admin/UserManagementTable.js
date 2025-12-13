import { useState, useEffect } from "react";
import { Users, Shield, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";

export default function UserManagementTable() {
    const { data: session } = useSession();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Create User Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAdminData, setNewAdminData] = useState({ name: '', email: '', password: '' });
    const [createLoading, setCreateLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (res.ok) {
                setUsers(data.data);
            } else {
                setError(data.error || "Failed to fetch users");
            }
        } catch (err) {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole })
            });

            if (res.ok) {
                fetchUsers(); // Refresh list
            } else {
                const data = await res.json();
                alert(data.error || "Failed to update role");
            }
        } catch (err) {
            alert("Network error");
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAdminData)
            });

            const data = await res.json();
            if (res.ok) {
                setShowCreateModal(false);
                setNewAdminData({ name: '', email: '', password: '' });
                fetchUsers();
                alert("Admin user created successfully");
            } else {
                alert(data.error || "Failed to create user");
            }
        } catch (err) {
            alert("Network error");
        } finally {
            setCreateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(27,55,121)]"></div>
            </div>
        );
    }

    return (
        <div>
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-serif font-semibold flex items-center gap-3">
                        <Users className="w-6 h-6" />
                        User Management
                    </h2>
                    <p className="text-[rgb(27,55,121)]/70 mt-1 text-sm">
                        Manage user roles and access.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-[rgb(27,55,121)] text-white px-4 py-2 rounded-md font-semibold hover:bg-[rgb(27,55,121)]/90 transition-colors flex items-center gap-2 text-sm"
                >
                    <UserPlus className="w-4 h-4" />
                    Create Admin
                </button>
            </header>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white border border-[rgb(27,55,121)]/10 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-[rgb(27,55,121)]/60 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 font-semibold">User</th>
                                <th className="px-6 py-3 font-semibold">Role</th>
                                <th className="px-6 py-3 font-semibold">Joined</th>
                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-[rgb(27,55,121)]">{user.name}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                                            {user.role || 'user'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {user.role === 'admin' ? (
                                            <button
                                                onClick={() => handleRoleUpdate(user._id, 'user')}
                                                className="text-red-600 hover:text-red-800 text-xs font-medium"
                                                disabled={user._id === session?.user?.id} // Cannot demote self
                                            >
                                                Demote to User
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRoleUpdate(user._id, 'admin')}
                                                className="text-[rgb(27,55,121)] hover:text-[rgb(27,55,121)]/80 text-xs font-medium"
                                            >
                                                Promote to Admin
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Admin Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <UserPlus className="w-5 h-5" />
                            Create New Admin
                        </h2>
                        <form onSubmit={handleCreateAdmin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded-md px-3 py-2"
                                    value={newAdminData.name}
                                    onChange={e => setNewAdminData({ ...newAdminData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full border rounded-md px-3 py-2"
                                    value={newAdminData.email}
                                    onChange={e => setNewAdminData({ ...newAdminData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    className="w-full border rounded-md px-3 py-2"
                                    value={newAdminData.password}
                                    onChange={e => setNewAdminData({ ...newAdminData, password: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="px-4 py-2 bg-[rgb(27,55,121)] text-white rounded-md hover:bg-[rgb(27,55,121)]/90 text-sm"
                                >
                                    {createLoading ? 'Creating...' : 'Create Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
