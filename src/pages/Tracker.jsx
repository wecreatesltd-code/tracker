import React, { useState, useEffect } from 'react';
import {
    Activity,
    BarChart3,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Search,
    Filter,
    ArrowUpRight,
    Target
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { usePermission, PERMISSIONS } from '../context/PermissionContext';
import { calculateProgress, getProjectHealth } from '../utils/projectUtils';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

import { Navigate } from 'react-router-dom';

export default function Tracker() {
    const { projects } = useProjects();
    const { role, hasPermission } = usePermission();
    const [projectData, setProjectData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    if (!hasPermission(PERMISSIONS.VIEW_REPORTS)) {
        return <Navigate to="/" />;
    }

    useEffect(() => {
        const fetchAllTasks = async () => {
            setLoading(true);
            const data = await Promise.all(projects.map(async (project) => {
                const tasksSnapshot = await getDocs(collection(db, 'projects', project.id, 'tasks'));
                const tasks = tasksSnapshot.docs.map(doc => doc.data());
                const progress = calculateProgress(tasks);
                const health = getProjectHealth(project, tasks);
                return {
                    ...project,
                    progress,
                    health,
                    taskCount: tasks.length,
                    completedTasks: tasks.filter(t => t.status === 'done').length
                };
            }));
            setProjectData(data);
            setLoading(false);
        };

        if (projects.length > 0) {
            fetchAllTasks();
        } else {
            setLoading(false);
        }
    }, [projects]);

    const filteredProjects = projectData.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = [
        {
            label: 'Avg. Progress',
            value: `${Math.round(projectData.reduce((acc, p) => acc + p.progress, 0) / (projectData.length || 1))}%`,
            icon: Target,
            color: 'text-primary'
        },
        {
            label: 'On Track',
            value: projectData.filter(p => p.health === 'On Track').length,
            icon: CheckCircle2,
            color: 'text-green-600'
        },
        {
            label: 'At Risk',
            value: projectData.filter(p => p.health === 'At Risk').length,
            icon: AlertTriangle,
            color: 'text-amber-600'
        },
        {
            label: 'Overdue',
            value: projectData.filter(p => p.health === 'Overdue').length,
            icon: Clock,
            color: 'text-red-600'
        },
    ];

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white transition-colors">Project Tracker</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors text-sm sm:text-base">Detailed performance and health metrics for projects.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Filter projects..."
                            className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-slate-900 dark:text-white transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        <Filter size={20} />
                    </button>
                    {role !== 'member' && (
                        <button className="flex-1 sm:flex-none bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all whitespace-nowrap">
                            Generate Report
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                <div className="p-6 sm:p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white transition-colors">Project Performance</h3>
                    <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            <span className="text-slate-600 dark:text-slate-300 transition-colors">On Track</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                            <span className="text-slate-600 dark:text-slate-300 transition-colors">At Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="text-slate-600 dark:text-slate-300 transition-colors">Overdue</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                                <th className="px-6 py-5 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Project Name</th>
                                <th className="px-6 py-5 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Status</th>
                                <th className="px-6 py-5 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Health</th>
                                <th className="px-6 py-5 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Progress</th>
                                <th className="px-6 py-5 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Tasks</th>
                                <th className="px-6 py-5 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800 transition-colors">
                            {filteredProjects.map((project) => (
                                <tr key={project.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-4 min-w-[200px]">
                                            <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center text-primary font-bold transition-colors shrink-0">
                                                {project.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate max-w-[150px]">{project.name}</p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 transition-colors">ID: {project.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${project.status === 'Active' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                                            project.status === 'Completed' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                                                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${project.health === 'On Track' ? 'bg-green-500' :
                                                project.health === 'At Risk' ? 'bg-amber-500' : 'bg-red-500'
                                                }`}></div>
                                            <span className={`text-sm font-bold transition-colors whitespace-nowrap ${project.health === 'On Track' ? 'text-green-600 dark:text-green-400' :
                                                project.health === 'At Risk' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                {project.health}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="w-full max-w-[160px] min-w-[120px]">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors">{project.progress}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden transition-colors">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${project.progress === 100 ? 'bg-green-500' : 'bg-primary'
                                                        }`}
                                                    style={{ width: `${project.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap">{project.completedTasks} / {project.taskCount}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors whitespace-nowrap">tasks done</p>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        {role !== 'member' && (
                                            <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-xl transition-all">
                                                <ArrowUpRight size={20} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
