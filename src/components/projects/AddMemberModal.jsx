import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';

export default function AddMemberModal({ isOpen, onClose, projectId, currentMembers }) {
    const { fetchUsers } = useAuth();
    const { updateProjectMembers } = useProjects();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    useEffect(() => {
        if (isOpen) {
            loadUsers();
            setSelectedMembers(currentMembers || []);
        }
    }, [isOpen, currentMembers]);

    const loadUsers = async () => {
        try {
            const allUsers = await fetchUsers();
            setUsers(allUsers);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleMember = (userId) => {
        setSelectedMembers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            await updateProjectMembers(projectId, selectedMembers);
            onClose();
        } catch (error) {
            console.error('Error updating members:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 sm:p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white transition-colors">Add Team Members</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Select people to join this project</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 shadow-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                <Loader2 className="animate-spin text-primary" size={32} />
                                <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Fetching team members...</p>
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                {filteredUsers.map(user => (
                                    <div
                                        key={user.uid}
                                        onClick={() => toggleMember(user.uid)}
                                        className={`flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer transition-all border-2 ${selectedMembers.includes(user.uid)
                                            ? 'bg-primary/5 dark:bg-primary/10 border-primary shadow-sm'
                                            : 'bg-white dark:bg-slate-900 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-base sm:text-lg transition-colors ${selectedMembers.includes(user.uid)
                                                ? 'bg-primary text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                }`}>
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white transition-colors">{user.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedMembers.includes(user.uid)
                                            ? 'bg-primary border-primary text-white scale-110'
                                            : 'border-slate-200 dark:border-slate-700'
                                            }`}>
                                            {selectedMembers.includes(user.uid) && <Check size={14} />}
                                        </div>
                                    </div>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <div className="text-center py-12">
                                        <p className="text-slate-400 dark:text-slate-500 font-medium transition-colors">No team members found</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 sm:p-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex gap-4 transition-colors">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-xl sm:rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={submitting}
                        className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-primary text-white font-bold rounded-xl sm:rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                    >
                        {submitting ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <UserPlus size={20} />
                        )}
                        <span>Update Team</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
