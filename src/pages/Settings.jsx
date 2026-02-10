import React, { useState, useEffect } from 'react';
import {
    User,
    Bell,
    Shield,
    Palette,
    Database,
    ChevronRight,
    Loader2,
    Check,
    Mail,
    UserCircle,
    HardDrive
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
    const { userData, updateProfile } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        workspaceName: 'Acme Corp Tracker'
    });

    useEffect(() => {
        if (userData) {
            setFormData(prev => ({
                ...prev,
                name: userData.name || '',
                email: userData.email || '',
                role: userData.role || 'member'
            }));
        }
    }, [userData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        try {
            await updateProfile({ name: formData.name });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const sections = [
        { icon: Shield, title: 'Security', desc: 'Secure your account with 2FA and password management.' },
        { icon: Bell, title: 'Notifications', desc: 'Manage your desktop and email notification preferences.' },
        { icon: Palette, title: 'Appearance', desc: 'Custom branding and layout options.' },
        { icon: HardDrive, title: 'Data & Storage', desc: 'View your workspace storage and cleanup options.' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12 pb-12 sm:pb-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">Settings</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium transition-colors">Control your experience and account preferences.</p>
                </div>
                {success && (
                    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-2 rounded-2xl font-bold animate-in fade-in slide-in-from-top-4 transition-colors">
                        <Check size={18} />
                        <span>Changes Saved</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all hover:shadow-primary/5">
                <div className="p-5 sm:p-10 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10 transition-colors">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                        <div className="relative group">
                            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-3xl sm:text-4xl font-black text-white shadow-2xl shadow-primary/30 group-hover:scale-105 transition-transform duration-500">
                                {userData?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-50 dark:border-slate-700 flex items-center justify-center text-primary cursor-pointer hover:bg-primary hover:text-white transition-all">
                                <Palette size={18} />
                            </div>
                        </div>
                        <div className="space-y-1 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white transition-colors">{userData?.name || 'User Name'}</h3>
                                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg">
                                    {userData?.role || 'Member'}
                                </span>
                            </div>
                            <p className="text-slate-400 dark:text-slate-500 font-medium flex items-center gap-2 transition-colors">
                                <Mail size={14} />
                                {userData?.email || 'email@example.com'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 sm:p-10 space-y-8 sm:space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Full Name</label>
                            <div className="relative group">
                                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-800 rounded-3xl outline-none transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 opacity-60">
                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={20} />
                                <input
                                    readOnly
                                    type="email"
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-3xl outline-none transition-all font-bold text-slate-400 dark:text-slate-500 cursor-not-allowed"
                                    value={formData.email}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-50 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-6 ml-1">
                            <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Configuration Settings</h4>
                            <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md">New</span>
                        </div>

                        <div className="grid grid-cols-1 gap-6 bg-slate-50/50 dark:bg-slate-800/30 p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-900 dark:text-white transition-colors">Dark Mode</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Switch between light and dark themes.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={toggleDarkMode}
                                    className={`relative w-14 h-8 rounded-full transition-all duration-500 outline-none ${darkMode ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-500 transform ${darkMode ? 'left-7 rotate-[360deg]' : 'left-1'}`}>
                                        {darkMode ? (
                                            <div className="w-full h-full flex items-center justify-center text-primary">
                                                <Database size={12} className="fill-current" />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <Palette size={12} />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            </div>

                            <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-900 dark:text-white transition-colors">Workspace Name</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">The branding for this project tracker instance.</p>
                                </div>
                                <input
                                    type="text"
                                    className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    value={formData.workspaceName}
                                    onChange={(e) => setFormData({ ...formData, workspaceName: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-50 dark:border-slate-800">
                        <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 ml-1">Other Sections</h4>
                        <div className="grid grid-cols-1 gap-4">
                            {sections.map((section, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group text-left outline-none"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-all duration-300">
                                            <section.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">{section.title}</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{section.desc}</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-primary">
                                        <ChevronRight size={20} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-5 sm:px-10 py-6 sm:py-8 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 transition-colors">
                    <button
                        type="button"
                        className="px-8 py-4 rounded-2xl font-bold text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all"
                    >
                        Reset Defaults
                    </button>
                    <button
                        disabled={loading}
                        type="submit"
                        className="min-w-[180px] px-8 py-4 rounded-2xl font-black text-white bg-primary hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-3 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <Database size={20} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="rounded-2xl sm:rounded-[2.5rem] bg-red-50 dark:bg-red-900/10 p-5 sm:p-8 border border-red-100 dark:border-red-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
                <div>
                    <h4 className="text-red-600 dark:text-red-400 font-black text-lg">Danger Zone</h4>
                    <p className="text-red-500/70 dark:text-red-400/50 font-medium">Once you delete your account, there is no going back. Please be certain.</p>
                </div>
                <button className="px-6 sm:px-8 py-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-red-600 dark:border-red-500 text-red-600 dark:text-red-500 font-black hover:bg-red-600 dark:hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-200 dark:shadow-none w-full sm:w-auto">
                    Delete Account
                </button>
            </div>
        </div>
    );
}
