import React, { useState } from 'react';
import {
    ShieldCheck,
    Lock,
    Users,
    Save,
    ChevronRight,
    Info,
    CheckCircle2,
    XCircle,
    AlertTriangle
} from 'lucide-react';
import { usePermission, PERMISSIONS } from '../context/PermissionContext';

export default function AdminSettings() {
    const { rolePermissions, updatePermissions, hasPermission } = usePermission();
    const [localPermissions, setLocalPermissions] = useState(rolePermissions);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null); // 'success', 'error'

    // Separate permissions into categories for better UI
    const categories = {
        'Project Management': [
            { id: PERMISSIONS.CREATE_PROJECT, label: 'Create Projects', desc: 'Allow creating new project workspaces' },
            { id: PERMISSIONS.UPDATE_PROJECT, label: 'Update Projects', desc: 'Edit project details and settings' },
            { id: PERMISSIONS.DELETE_PROJECT, label: 'Delete Projects', desc: 'Permenantly remove projects' },
            { id: PERMISSIONS.ASSIGN_PROJECT, label: 'Assign Members', desc: 'Add or remove members from projects' },
            { id: PERMISSIONS.CHANGE_PROJECT_STATUS, label: 'Change Status', desc: 'Move projects between active/archived' },
            { id: PERMISSIONS.VIEW_ALL_PROJECTS, label: 'View All Projects', desc: 'Bypass assignment to see all content' },
        ],
        'Task Operations': [
            { id: PERMISSIONS.CREATE_TASK, label: 'Create Tasks', desc: 'Add new tasks to any board' },
            { id: PERMISSIONS.ASSIGN_TASK, label: 'Assign Tasks', desc: 'Change task ownership' },
            { id: PERMISSIONS.UPDATE_TASK_STATUS, label: 'Update Progress', desc: 'Drag and drop tasks between columns' },
            { id: PERMISSIONS.DELETE_TASK, label: 'Delete Tasks', desc: 'Remove tasks from boards' },
        ],
        'Administration': [
            { id: PERMISSIONS.VIEW_REPORTS, label: 'View Analytics', desc: 'Access productivity and workload reports' },
            { id: PERMISSIONS.MANAGE_USERS, label: 'User Management', desc: 'Invite or deactivate user accounts' },
            { id: PERMISSIONS.VIEW_TEAM_WORKLOAD, label: 'Team Workload', desc: 'Monitor task distribution across team' },
            { id: PERMISSIONS.ACCESS_SETTINGS, label: 'Access Settings', desc: 'View basic application settings' },
            { id: PERMISSIONS.MANAGE_PERMISSIONS, label: 'Manage RBAC', desc: 'Edit role-based access controls' },
        ]
    };

    const roles = [
        { id: 'manager', label: 'Manager', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { id: 'member', label: 'Team Member', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' }
    ];

    const handleToggle = (roleId, permissionId) => {
        setLocalPermissions(prev => {
            const current = prev[roleId] || [];
            const updated = current.includes(permissionId)
                ? current.filter(id => id !== permissionId)
                : [...current, permissionId];
            return { ...prev, [roleId]: updated };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        try {
            await updatePermissions(localPermissions);
            setStatus('success');
            setTimeout(() => setStatus(null), 3000);
        } catch (error) {
            console.error('Failed to save permissions:', error);
            setStatus('error');
        } finally {
            setSaving(false);
        }
    };

    if (!hasPermission(PERMISSIONS.MANAGE_PERMISSIONS)) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Lock size={48} className="text-slate-300" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Access Required</h2>
                <p className="text-slate-500">You don't have permission to manage system privileges.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Privilege Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm sm:text-base transition-colors">Configure Role-Based Access Control (RBAC) for your workspace.</p>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                    {status === 'success' && (
                        <div className="flex items-center gap-2 text-emerald-600 font-bold animate-in fade-in slide-in-from-right-4 text-sm sm:text-base">
                            <CheckCircle2 size={18} />
                            <span className="hidden sm:inline">Control List Updated</span>
                            <span className="sm:hidden">Saved</span>
                        </div>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-primary text-white px-6 sm:px-8 py-3 rounded-xl sm:rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 text-sm sm:text-base"
                    >
                        {saving ? <ShieldCheck className="animate-pulse" size={18} /> : <Save size={18} />}
                        <span>Save Permissions</span>
                    </button>
                </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex gap-4 transition-colors">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 h-fit rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
                    <AlertTriangle size={20} />
                </div>
                <div className="space-y-1">
                    <p className="font-bold text-amber-800 dark:text-amber-300 text-sm sm:text-base">Important Note</p>
                    <p className="text-xs sm:text-sm text-amber-700/70 dark:text-amber-400/60 leading-relaxed">
                        Administrators always have full access to all features regardless of these settings. Changes made here apply instantly to all active users in the selected roles.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-12">
                {Object.entries(categories).map(([category, perms]) => (
                    <div key={category} className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-1 bg-primary rounded-full"></div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">{category}</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {perms.map((perm) => (
                                <div
                                    key={perm.id}
                                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/20 transition-all shadow-sm group"
                                >
                                    <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-all shrink-0">
                                            <ShieldCheck size={20} className="sm:hidden" />
                                            <ShieldCheck size={24} className="hidden sm:block" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white transition-colors">{perm.label}</h4>
                                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors">{perm.desc}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-6 sm:gap-8 border-t border-slate-50 dark:border-slate-800 md:border-none pt-4 md:pt-0">
                                        {roles.map(role => (
                                            <div key={role.id} className="flex flex-col items-center gap-2">
                                                <button
                                                    onClick={() => handleToggle(role.id, perm.id)}
                                                    className={`
                                                        w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border-2 transition-all outline-none
                                                        ${localPermissions[role.id]?.includes(perm.id)
                                                            ? `${role.bg} ${role.color} border-transparent scale-110 shadow-lg`
                                                            : 'border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-700 hover:border-slate-200'
                                                        }
                                                    `}
                                                >
                                                    {localPermissions[role.id]?.includes(perm.id)
                                                        ? <CheckCircle2 size={20} className="sm:hidden" />
                                                        : <XCircle size={20} className="opacity-40 sm:hidden" />
                                                    }
                                                    {localPermissions[role.id]?.includes(perm.id)
                                                        ? <CheckCircle2 size={24} className="hidden sm:block" />
                                                        : <XCircle size={24} className="opacity-40 hidden sm:block" />
                                                    }
                                                </button>
                                                <span className={`text-[10px] font-black uppercase tracking-tighter ${role.color}`}>{role.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
