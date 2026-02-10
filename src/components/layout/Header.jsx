import React from 'react';
import { Bell, Search, Plus, Sun, Moon } from 'lucide-react';
import { usePermission, PERMISSIONS } from '../../context/PermissionContext';
import { useTheme } from '../../context/ThemeContext';

export default function Header() {
    const { hasPermission } = usePermission();
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <header className="h-14 sm:h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10 transition-colors">
            <div className="flex items-center gap-4 flex-1 pl-10 lg:pl-0">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search tasks, projects..."
                        className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">


                <button
                    onClick={toggleDarkMode}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                </button>
            </div>
        </header>
    );
}
