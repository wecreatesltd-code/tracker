import React, { useState, useEffect } from 'react';
import {
    CheckSquare,
    Search,
    Calendar,
    ChevronRight,
    AlertCircle,
    LayoutList,
    Table as TableIcon
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { formatDate } from '../lib/utils';
import TaskCalendar from '../components/TaskCalendar';

export default function MyTasks() {
    const { projects } = useProjects();
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState('table'); // 'table', 'list', 'calendar'

    useEffect(() => {
        if (!user || projects.length === 0) {
            setLoading(false);
            return;
        }

        const unsubscribes = projects.map(project => {
            const tasksRef = collection(db, 'projects', project.id, 'tasks');
            return onSnapshot(tasksRef, (snapshot) => {
                const projectTasks = snapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        projectId: project.id,
                        projectName: project.name,
                        ...doc.data()
                    }))
                    .filter(task => task.assignedTo === user.uid);

                setTasks(prev => {
                    // Filter out existing tasks from this project and add new ones
                    const otherProjectTasks = prev.filter(t => t.projectId !== project.id);
                    return [...otherProjectTasks, ...projectTasks];
                });
            });
        });

        setLoading(false);

        return () => unsubscribes.forEach(unsub => unsub());
    }, [user, projects]);

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.projectName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'todo': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
            case 'in-progress': return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
            case 'review': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
            case 'done': return 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'text-red-500';
            case 'Medium': return 'text-amber-500';
            case 'Low': return 'text-blue-500';
            default: return 'text-slate-500';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12 sm:pb-24 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">My Tasks</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium transition-colors">You have {tasks.filter(t => t.status !== 'done').length} active tasks across {projects.length} projects.</p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mr-2">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            title="Table View"
                        >
                            <TableIcon size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            title="List View"
                        >
                            <LayoutList size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            title="Calendar View"
                        >
                            <Calendar size={18} />
                        </button>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="pl-10 sm:pl-12 pr-4 sm:pr-6 py-2.5 sm:py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none w-40 sm:w-64 text-sm sm:text-base text-slate-900 dark:text-white transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm text-slate-700 dark:text-slate-300 font-bold transition-all appearance-none cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="done">Done</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 p-16 text-center transition-colors">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <CheckSquare size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">No tasks found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium transition-colors">
                        {searchTerm || statusFilter !== 'all'
                            ? "Try adjusting your filters to find what you're looking for."
                            : "You don't have any tasks assigned to you at the moment."}
                    </p>
                </div>
            ) : viewMode === 'calendar' ? (
                <TaskCalendar tasks={filteredTasks} />
            ) : viewMode === 'list' ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all group flex flex-col md:flex-row md:items-center gap-6"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`w-2 h-2 rounded-full ${getStatusColor(task.status).split(' ')[0].replace('bg-', 'bg-')}`}></span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{task.projectName}</span>
                                    <span className="text-[10px] font-black bg-primary/5 text-primary px-2 py-0.5 rounded-md">{task.customId || 'N/A'}</span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{task.title}</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 line-clamp-1 font-medium transition-colors">{task.description}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-4 py-2 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle size={14} className={getPriorityColor(task.priority)} />
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors">{task.priority}</span>
                                    </div>
                                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-slate-400" />
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors">{formatDate(task.deadline)}</span>
                                    </div>
                                </div>

                                <div className={`px-4 py-2 rounded-xl text-xs font-bold capitalize ${getStatusColor(task.status)} transition-colors`}>
                                    {task.status.replace('-', ' ')}
                                </div>

                                <button className="p-2 text-slate-300 dark:text-slate-600 hover:text-primary dark:hover:text-primary transition-colors">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">ID</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Task Details</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Project</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Priority</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Deadline</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {filteredTasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-primary bg-primary/5 px-2 py-1 rounded-lg">{task.customId || 'N/A'}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{task.title}</p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{task.projectName}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle size={14} className={getPriorityColor(task.priority)} />
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{task.priority}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                <Calendar size={14} />
                                                <span className="text-sm font-bold">{formatDate(task.deadline)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(task.status)}`}>
                                                {task.status.replace('-', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 text-slate-300 hover:text-primary transition-colors">
                                                <ChevronRight size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
