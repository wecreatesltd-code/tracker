import React, { useState, useEffect } from 'react';
import { Mail, Phone, MoreHorizontal, UserPlus, Loader2, X, Edit2, Trash2, Shield, Calendar, MapPin, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePermission, PERMISSIONS } from '../context/PermissionContext';
import { cn } from '../lib/utils';

export default function Team() {
    const { fetchUsers, updateUser, deleteUser, logout, user: currentUser } = useAuth();
    const { role: currentRole, hasPermission } = usePermission();
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState(null);
    const [viewMode, setViewMode] = useState(null); // 'profile', 'edit'
    const [editForm, setEditForm] = useState({ role: '', phoneNumber: '' });
    const [isActionLoading, setIsActionLoading] = useState(false);

    const loadTeam = async () => {
        try {
            const users = await fetchUsers();
            setTeam(users);
        } catch (error) {
            console.error('Error loading team:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTeam();
    }, []);

    const handleUpdateMember = async () => {
        if (!selectedMember) return;
        setIsActionLoading(true);
        try {
            await updateUser(selectedMember.uid, {
                role: editForm.role,
                phoneNumber: editForm.phoneNumber
            });
            await loadTeam();
            // Update the locally selected member so the profile view reflects changes immediately
            setSelectedMember(prev => ({ ...prev, ...editForm }));
            setViewMode('profile');
        } catch (error) {
            console.error('Error updating member:', error);
            alert('Failed to update member');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteMember = async (memberId) => {
        if (!window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) return;

        setIsActionLoading(true);
        try {
            await deleteUser(memberId);
            await loadTeam();
        } catch (error) {
            console.error('Error deleting member:', error);
            alert('Failed to delete member');
        } finally {
            setIsActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-slate-500 font-medium">Loading team members...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white transition-colors">Team Members</h2>
                    <p className="text-slate-500 dark:text-slate-400 transition-colors">Manage your team and their roles effectively.</p>
                </div>
                {hasPermission(PERMISSIONS.MANAGE_PERMISSIONS) && (
                    <button className="flex items-center gap-2 bg-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all outline-none text-sm sm:text-base">
                        <UserPlus size={20} />
                        <span>Invite Member</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {team.map((member, i) => (
                    <div key={member.uid || i} className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 p-4 sm:p-6 text-center hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className="relative inline-block mb-4">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-2xl sm:text-3xl font-bold text-primary shadow-inner group-hover:bg-primary group-hover:text-white transition-colors uppercase">
                                {member.name?.charAt(0) || 'U'}
                            </div>
                            <span className="absolute bottom-0 right-0 w-6 h-6 border-4 border-white dark:border-slate-900 rounded-full bg-green-500"></span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">{member.name}</h3>
                        <div className="flex flex-col items-center gap-2 mt-2">
                            <span className="text-xs font-black text-primary bg-primary/5 dark:bg-primary/20 px-3 py-1 rounded-full uppercase tracking-wider transition-colors">
                                {member.role || 'Member'}
                            </span>
                        </div>

                        <div className="space-y-3 text-slate-500 dark:text-slate-400 text-sm border-t border-slate-50 dark:border-slate-800 pt-6 mt-6 transition-colors">
                            <div className="flex items-center justify-center gap-2">
                                <Mail size={16} className="text-primary/60" />
                                <span className="truncate">{member.email}</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <Phone size={16} className="text-primary/60" />
                                <span className="truncate">{member.phoneNumber || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-2">
                            <button
                                onClick={() => {
                                    setSelectedMember(member);
                                    setViewMode('profile');
                                }}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors outline-none"
                            >
                                <Eye size={16} />
                                <span>Profile</span>
                            </button>

                            {(hasPermission(PERMISSIONS.MANAGE_PERMISSIONS) || member.uid === currentUser.uid) && (
                                <button
                                    onClick={() => {
                                        setSelectedMember(member);
                                        setEditForm({
                                            role: member.role || 'member',
                                            phoneNumber: member.phoneNumber || ''
                                        });
                                        setViewMode('edit');
                                    }}
                                    className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl hover:bg-primary/10 hover:text-primary outline-none transition-colors"
                                >
                                    <Edit2 size={18} />
                                </button>
                            )}

                            {hasPermission(PERMISSIONS.MANAGE_PERMISSIONS) && member.uid !== currentUser.uid && (
                                <button
                                    onClick={() => handleDeleteMember(member.uid)}
                                    className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 outline-none transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Profile/Edit Modal */}
            {viewMode && selectedMember && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="relative p-5 sm:p-8">
                            <button
                                onClick={() => {
                                    setViewMode(null);
                                    setSelectedMember(null);
                                }}
                                className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] sm:rounded-[2rem] bg-primary/10 flex items-center justify-center text-3xl sm:text-4xl font-black text-primary mb-4 shadow-inner uppercase">
                                    {selectedMember.name?.charAt(0)}
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{selectedMember.name}</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">{selectedMember.email}</p>

                                {viewMode === 'profile' ? (
                                    <div className="mt-8 w-full space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-2 text-primary mb-1">
                                                    <Shield size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Role</span>
                                                </div>
                                                <p className="font-bold text-slate-700 dark:text-slate-300 capitalize">{selectedMember.role || 'Member'}</p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-2 text-primary mb-1">
                                                    <Calendar size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Joined</span>
                                                </div>
                                                <p className="font-bold text-slate-700 dark:text-slate-300">
                                                    {selectedMember.createdAt ? new Date(selectedMember.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400">
                                                    <Mail size={18} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Address</p>
                                                    <p className="font-bold text-slate-700 dark:text-slate-300">{selectedMember.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400">
                                                    <Phone size={18} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Phone</p>
                                                    <p className="font-bold text-slate-700 dark:text-slate-300">{selectedMember.phoneNumber || 'Not set'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400">
                                                    <MapPin size={18} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Location</p>
                                                    <p className="font-bold text-slate-700 dark:text-slate-300">Mumbai, India</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-8 w-full space-y-6">
                                        <div className="space-y-4">
                                            {/* Phone Number Input */}
                                            <div className="space-y-2 text-left">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Mobile Number</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input
                                                        type="text"
                                                        placeholder="Enter mobile number"
                                                        value={editForm.phoneNumber}
                                                        onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-slate-700 dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            {/* Role Selection - Only for Admin */}
                                            {currentRole === 'admin' && (
                                                <div className="space-y-2 text-left">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Update Member Role</label>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {['admin', 'manager', 'member'].map((r) => (
                                                            <button
                                                                key={r}
                                                                disabled={isActionLoading || (r === 'admin' && currentRole !== 'admin')}
                                                                onClick={() => setEditForm({ ...editForm, role: r })}
                                                                className={cn(
                                                                    "w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group",
                                                                    editForm.role === r
                                                                        ? "border-primary bg-primary/5 text-primary"
                                                                        : "border-slate-100 dark:border-slate-800 text-slate-500 hover:border-primary/50"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-3 text-left">
                                                                    <div className={cn(
                                                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                                        editForm.role === r ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10"
                                                                    )}>
                                                                        <Shield size={20} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold capitalize">{r}</p>
                                                                        <p className="text-xs opacity-60">Full access and management capabilities</p>
                                                                    </div>
                                                                </div>
                                                                {editForm.role === r && (
                                                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                                                                        <MoreHorizontal size={14} />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleUpdateMember}
                                            disabled={isActionLoading}
                                            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                                        >
                                            {isActionLoading ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={20} />
                                                    <span>Updating...</span>
                                                </>
                                            ) : (
                                                <span>Save Changes</span>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
