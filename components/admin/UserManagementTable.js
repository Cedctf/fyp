import { useState, useEffect } from "react";
import { Users, Shield, UserPlus, X, MapPin, Phone, Calendar, Mail, AlertTriangle } from "lucide-react";
import { useSession } from "next-auth/react";

export default function UserManagementTable({ searchTerm, filterRole, showCreateModal, setShowCreateModal }) {
    const { data: session } = useSession();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Create User Modal - State for form data only
    const [newAdminData, setNewAdminData] = useState({ name: '', email: '', password: '' });
    const [createLoading, setCreateLoading] = useState(false);

    // User Details Modal
    const [selectedUser, setSelectedUser] = useState(null);

    const [demoteModalOpen, setDemoteModalOpen] = useState(false);
    const [userToDemote, setUserToDemote] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
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

    const handleRoleUpdate = (user, newRole) => {
        if (newRole === 'user') {
            setUserToDemote(user);
            setDemoteModalOpen(true);
        } else {
            if (confirm(`Are you sure you want to promote this user to Admin?`)) {
                executeRoleUpdate(user._id, newRole);
            }
        }
    };

    const executeRoleUpdate = async (userId, newRole) => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole })
            });

            if (res.ok) {
                fetchUsers();
                setDemoteModalOpen(false);
                setUserToDemote(null);
            } else {
                const data = await res.json();
                alert(data.error || "Failed to update role");
            }
        } catch (err) {
            alert("Network error");
        } finally {
            setActionLoading(false);
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

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterRole === 'ALL' || (user.role || 'user') === filterRole;

        return matchesSearch && matchesFilter;
    });

    return (
        <div>
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200 text-sm">
                    {error}
                </div>
            )}

            <div className="w-full overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full">
                        <thead className="border-b border-[rgb(27,55,121)]/20">
                            <tr>
                                <th className="pl-4 pr-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">User</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">Provider</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">Last Active</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">Joined</th>
                                <th className="pl-6 pr-4 py-3 text-right text-xs font-semibold text-[rgb(27,55,121)] uppercase tracking-wider font-serif">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, index) => (
                                <tr
                                    key={user._id}
                                    className={`hover:bg-[rgb(27,55,121)]/10 transition-colors duration-200 cursor-pointer ${index % 2 === 0 ? '' : 'bg-[rgb(27,55,121)]/5'}`}
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <td className="pl-4 pr-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-[rgb(27,55,121)]">
                                            {user.name}
                                        </div>
                                        <div className="text-xs text-[rgb(27,55,121)]/70">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-xs font-semibold text-[rgb(27,55,121)]">
                                            {user.role === 'admin' ? 'Admin' : 'User'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-[rgb(27,55,121)]/70 capitalize">
                                            {user.provider || 'email'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-[rgb(27,55,121)]/70">
                                            {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-[rgb(27,55,121)]/70">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="pl-6 pr-4 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                        {user.role === 'admin' ? (
                                            <button
                                                onClick={() => handleRoleUpdate(user, 'user')}
                                                className="text-red-600 hover:text-red-800 text-xs font-medium transition-colors"
                                                disabled={user._id === session?.user?.id}
                                            >
                                                Demote
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRoleUpdate(user, 'admin')}
                                                className="text-[rgb(27,55,121)] hover:text-[rgb(27,55,121)]/80 text-xs font-medium transition-colors"
                                            >
                                                Promote
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
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
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

            {/* Demote User Modal */}
            {demoteModalOpen && userToDemote && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDemoteModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-[rgb(27,55,121)]">
                            <AlertTriangle className="w-5 h-5" />
                            Demote Admin?
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to demote <span className="font-semibold text-gray-900">{userToDemote.name}</span> to a regular user? They will lose all administrative privileges.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDemoteModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md text-sm font-medium"
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => executeRoleUpdate(userToDemote._id, 'user')}
                                disabled={actionLoading}
                                className="px-4 py-2 bg-[rgb(27,55,121)] text-white rounded-md hover:bg-[rgb(27,55,121)]/90 text-sm font-medium"
                            >
                                {actionLoading ? 'Demoting...' : 'Demote'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-[rgb(27,55,121)]/10 rounded-full flex items-center justify-center text-[rgb(27,55,121)] text-2xl font-serif font-bold">
                                {selectedUser.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h2>
                                <span className="text-xs font-semibold text-[rgb(27,55,121)] mt-1 block">
                                    {selectedUser.role === 'admin' ? 'Admin' : 'User'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Email</p>
                                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Phone</p>
                                    <p className="text-sm text-gray-600">{selectedUser.phone || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Address</p>
                                    <p className="text-sm text-gray-600">{selectedUser.address || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Joined</p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(selectedUser.createdAt).toLocaleDateString()} at {new Date(selectedUser.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t mt-4">
                                <p className="text-xs text-gray-400 font-mono">ID: {selectedUser._id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
