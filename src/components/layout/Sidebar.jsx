import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    Settings,
    LogOut,
    Trello,
    Activity,
    ShieldCheck,
    CheckSquare,
    ClipboardList,
    StickyNote,
    UserPlus,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePermission, PERMISSIONS } from '../../context/PermissionContext';
import { cn } from '../../lib/utils';
import logo from '../../assets/WeCreatesLogo.jpg';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FolderKanban, label: 'Projects', path: '/projects' },
    { icon: Activity, label: 'Tracker', path: '/tracker', permission: PERMISSIONS.VIEW_REPORTS },
    { icon: CheckSquare, label: 'My Tasks', path: '/tasks' },
    { icon: ClipboardList, label: 'Team Tasks', path: '/team-tasks', permission: PERMISSIONS.VIEW_TEAM_WORKLOAD },
    { icon: Users, label: 'Team', path: '/team', permission: PERMISSIONS.VIEW_TEAM_WORKLOAD },
    { icon: ShieldCheck, label: 'Admin Panel', path: '/admin/permissions', permission: PERMISSIONS.MANAGE_PERMISSIONS },
    { icon: UserPlus, label: 'Signup', path: '/signupadmin', permission: PERMISSIONS.MANAGE_USERS },
    { icon: StickyNote, label: 'Notepad', path: '/notepad' },
    { icon: Settings, label: 'Settings', path: '/settings', permission: PERMISSIONS.ACCESS_SETTINGS },
];

export default function Sidebar() {
    const { logout, userData } = useAuth();
    const { hasPermission } = usePermission();
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const sidebarContent = (
        <>
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800">
                    <img src={logo} alt="We Creates" className=" object-cover" />
                </div>
                <div>
                    <h1 className="font-bold text-slate-900 dark:text-white leading-none transition-colors">We Creates</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">Project Hub</p>
                </div>
                {/* Close button on mobile */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="ml-auto p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all lg:hidden"
                >
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                    if (item.permission && !hasPermission(item.permission)) return null;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                            )}
                        >
                            <item.icon size={20} className={cn(
                                "transition-transform duration-200 group-hover:scale-110",
                                "text-current"
                            )} />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-4 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {userData?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate transition-colors">{userData?.name || 'User'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize transition-colors">{userData?.role || 'Member'}</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all duration-200"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile hamburger button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-50 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg text-slate-600 dark:text-slate-400 hover:text-primary transition-all lg:hidden"
                aria-label="Open menu"
            >
                <Menu size={22} />
            </button>

            {/* Desktop sidebar - always visible */}
            <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col h-screen overflow-hidden transition-colors">
                {sidebarContent}
            </aside>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setMobileOpen(false)}
                    />
                    {/* Sidebar drawer */}
                    <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen overflow-hidden shadow-2xl animate-in slide-in-from-left duration-300">
                        {sidebarContent}
                    </aside>
                </div>
            )}
        </>
    );
}
