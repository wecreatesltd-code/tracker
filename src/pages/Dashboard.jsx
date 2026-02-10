import React, { useState, useEffect } from 'react';
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { usePermission } from '../context/PermissionContext';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { formatDate, cn } from '../lib/utils';

export default function Dashboard() {
    const { projects } = useProjects();
    const { user } = useAuth();
    const { role } = usePermission();
    const [metrics, setMetrics] = useState({
        activeProjects: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        highPriorityTasks: 0,
        myPendingTasks: 0
    });
    const [recentTasks, setRecentTasks] = useState([]);
    const [upcomingTasks, setUpcomingTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            setLoading(true);
            try {
                let totalCompleted = 0;
                let totalInProgress = 0;
                let totalHighPriority = 0;
                let myPending = 0;
                let myCompleted = 0;
                let myHighPriority = 0;
                const allTasks = [];

                for (const project of projects) {
                    const tasksSnapshot = await getDocs(collection(db, 'projects', project.id, 'tasks'));
                    const tasks = tasksSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        projectId: project.id,
                        projectName: project.name
                    }));

                    totalCompleted += tasks.filter(t => t.status === 'done').length;
                    totalInProgress += tasks.filter(t => t.status === 'in-progress' || t.status === 'review' || t.status === 'todo').length;
                    totalHighPriority += tasks.filter(t => t.priority === 'High').length;

                    // Personal metrics for members
                    const myTasks = tasks.filter(t => t.assignedTo === user.uid);
                    myPending += myTasks.filter(t => t.status !== 'done').length;
                    myCompleted += myTasks.filter(t => t.status === 'done').length;
                    myHighPriority += myTasks.filter(t => t.priority === 'High' && t.status !== 'done').length;

                    allTasks.push(...tasks);
                }

                if (role === 'member') {
                    setMetrics({
                        activeProjects: projects.length,
                        completedTasks: myCompleted,
                        inProgressTasks: myPending,
                        highPriorityTasks: myHighPriority
                    });
                } else {
                    setMetrics({
                        activeProjects: projects.filter(p => p.status === 'Active' || !p.status).length,
                        completedTasks: totalCompleted,
                        inProgressTasks: totalInProgress,
                        highPriorityTasks: totalHighPriority
                    });
                }

                // Recent Activity (Global or Personal)
                const relevantTasks = role === 'member'
                    ? allTasks.filter(t => t.assignedTo === user.uid)
                    : allTasks;

                setRecentTasks(relevantTasks.slice(0, 5));

                // Upcoming Tasks (Specifically for the member)
                const upcoming = allTasks
                    .filter(t => t.assignedTo === user.uid && t.status !== 'done' && t.deadline)
                    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

                setUpcomingTasks(upcoming.slice(0, 5));
            } catch (error) {
                console.error('Error fetching dashboard metrics:', error);
            } finally {
                setLoading(false);
            }
        };

        if (projects.length > 0) {
            fetchMetrics();
        } else {
            setLoading(false);
        }
    }, [projects, user, role]);

    const stats = [
        {
            label: role === 'member' ? 'My Projects' : 'Active Projects',
            value: metrics.activeProjects,
            icon: TrendingUp,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: role === 'member' ? 'My Completed' : 'Total Completed',
            value: metrics.completedTasks,
            icon: CheckCircle2,
            color: 'text-green-600',
            bg: 'bg-green-50'
        },
        {
            label: role === 'member' ? 'My To-Do' : 'In Progress',
            value: metrics.inProgressTasks,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
        {
            label: role === 'member' ? 'My High Priority' : 'High Priority',
            value: metrics.highPriorityTasks,
            icon: AlertCircle,
            color: 'text-red-600',
            bg: 'bg-red-50'
        },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-slate-500 font-medium">Calculating metrics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white transition-colors">Dashboard Overview</h2>
                <p className="text-slate-500 dark:text-slate-400 transition-colors">Welcome back! Here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.bg} ${stat.color} dark:bg-opacity-20 p-2 sm:p-3 rounded-xl`}>
                                <stat.icon size={20} className="sm:hidden" />
                                <stat.icon size={24} className="hidden sm:block" />
                            </div>
                            <span className="hidden sm:flex text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg items-center gap-1">
                                +{Math.floor(Math.random() * 20)}% <ArrowUpRight size={12} />
                            </span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white transition-colors">{stat.value}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-1 transition-colors">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                <div className="bg-white dark:bg-slate-900 p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                        {role === 'member' ? 'My Recent Activity' : 'Recent Activity'}
                    </h3>
                    <div className="space-y-6">
                        {recentTasks.length > 0 ? recentTasks.map((task, i) => (
                            <div key={task.id} className="flex gap-4">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        Task <span className="font-black text-primary bg-primary/5 px-1.5 py-0.5 rounded text-[10px] mr-1">{task.customId || 'TK-000'}</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{task.title}</span> in <span className="font-medium text-primary">{task.projectName}</span> is <span className="font-bold">{task.status}</span>
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Updated recently</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-500 text-sm italic">No recent activity found.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                        {role === 'member' ? 'Upcoming Deadlines' : 'Priority Tasks'}
                    </h3>
                    <div className="space-y-4">
                        {(role === 'member' ? upcomingTasks : recentTasks.filter(t => t.priority === 'High')).slice(0, 5).map((task, i) => (
                            <div key={task.id} className="flex items-center justify-between p-4 border border-slate-50 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
                                        task.priority === 'High' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-primary/10 text-primary'
                                    )}>
                                        {task.priority === 'High' ? '!' : <Clock size={18} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-primary/60 uppercase tracking-wider">{task.customId || 'TK-000'}</span>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{task.title}</h4>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{task.projectName} • <span className="font-bold">{formatDate(task.deadline)}</span></p>
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold px-3 py-1 rounded-full uppercase",
                                    task.status === 'done' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                                )}>
                                    {task.status}
                                </span>
                            </div>
                        ))}
                        {(role === 'member' ? upcomingTasks : recentTasks.filter(t => t.priority === 'High')).length === 0 && (
                            <p className="text-slate-500 text-sm italic text-center py-4">No tasks to display.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
