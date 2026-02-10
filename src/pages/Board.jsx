import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Plus,
    MoreHorizontal,
    MessageSquare,
    Clock,
    Layout,
    Trash2,
    Edit2,
    AlertCircle,
    FileDown,
    FileUp,
    Trello,
    LayoutGrid,
    Table as TableIcon,
    ChevronRight,
    Image as ImageIcon,
    File as FileIcon, // Added FileIcon
    ZoomIn,
    Calendar
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import AddMemberModal from '../components/projects/AddMemberModal';
import AddTaskModal from '../components/projects/AddTaskModal';
import { useAuth } from '../context/AuthContext';
import { usePermission, PERMISSIONS } from '../context/PermissionContext';
import { formatDate, cn } from '../lib/utils';
import AttachmentViewer from '../components/AttachmentViewer';
import TaskCalendar from '../components/TaskCalendar';
import ProjectChat from '../components/projects/ProjectChat';

const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-slate-200' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-amber-400' },
    { id: 'review', title: 'Review', color: 'bg-blue-400' },
    // { id: 'done', title: 'Done', color: 'bg-green-500' },
];

export default function Board() {
    const { projectId } = useParams();
    const { getTasks, createTask, updateTask, updateTaskStatus, deleteTask, projects } = useProjects();
    const { hasPermission, role } = usePermission();
    const { fetchUsers } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [project, setProject] = useState(null);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('todo');
    const [selectedTask, setSelectedTask] = useState(null);
    const [memberNames, setMemberNames] = useState({});
    const [isImporting, setIsImporting] = useState(false);
    const [viewMode, setViewMode] = useState('kanban'); // kanban, grid, table
    const [viewingAttachment, setViewingAttachment] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        if (projectId) {
            const foundProject = projects.find(p => p.id === projectId);
            setProject(foundProject);

            const unsubscribe = getTasks(projectId, (data) => {
                setTasks(data);
            });
            loadMemberNames();
            return unsubscribe;
        }
    }, [projectId, projects, getTasks]);

    const loadMemberNames = async () => {
        try {
            const users = await fetchUsers();
            const namesMap = {};
            users.forEach(u => {
                namesMap[u.uid] = u.name;
            });
            setMemberNames(namesMap);
        } catch (error) {
            console.error('Error loading member names:', error);
        }
    };

    const handleDragStart = (e, taskId) => {
        e.dataTransfer.setData('taskId', taskId);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, newStatus) => {
        const taskId = e.dataTransfer.getData('taskId');

        if (role === 'member' && newStatus === 'done') {
            alert('Members can only move tasks between To Do, In Progress, and Review.');
            return;
        }

        await updateTaskStatus(projectId, taskId, newStatus);
    };

    const handleExportCSV = () => {
        if (tasks.length === 0) {
            alert('No tasks to export');
            return;
        }

        const headers = ['Task ID', 'Title', 'Description', 'Status', 'Priority', 'Deadline', 'Assigned To'];
        const csvRows = [headers.join(',')];

        tasks.forEach(task => {
            const row = [
                task.customId || '',
                `"${(task.title || '').replace(/"/g, '""')}"`,
                `"${(task.description || '').replace(/"/g, '""')}"`,
                task.status || '',
                task.priority || '',
                task.deadline || '',
                `"${(memberNames[task.assignedTo] || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${project?.name || 'tasks'}_export.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportCSV = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target.result;
                const lines = text.split('\n');
                if (lines.length < 2) {
                    alert('Invalid CSV file');
                    setIsImporting(false);
                    return;
                }

                // Simple CSV parser that handles quotes
                const parseLine = (line) => {
                    const result = [];
                    let cur = '';
                    let inQuotes = false;
                    for (let i = 0; i < line.length; i++) {
                        const char = line[i];
                        if (char === '"') {
                            if (inQuotes && line[i + 1] === '"') {
                                cur += '"';
                                i++;
                            } else {
                                inQuotes = !inQuotes;
                            }
                        } else if (char === ',' && !inQuotes) {
                            result.push(cur.trim());
                            cur = '';
                        } else {
                            cur += char;
                        }
                    }
                    result.push(cur.trim());
                    return result;
                };

                const firstLine = parseLine(lines[0].toLowerCase());
                const isHeader = firstLine.includes('title');

                let headerMap = {
                    'title': firstLine.indexOf('title'),
                    'description': firstLine.indexOf('description'),
                    'status': firstLine.indexOf('status'),
                    'priority': firstLine.indexOf('priority'),
                    'deadline': firstLine.indexOf('deadline'),
                    'assigned to': firstLine.indexOf('assigned to')
                };

                // Fallback for files without headers (using standard index mapping)
                if (!isHeader) {
                    headerMap = {
                        'title': 0,
                        'description': 1,
                        'status': 2,
                        'priority': 3,
                        'deadline': 4,
                        'assigned to': 5
                    };
                }

                const tasksToCreate = [];
                const startIdx = isHeader ? 1 : 0;

                // Filter out empty lines and process data
                for (let i = startIdx; i < lines.length; i++) {
                    if (!lines[i].trim()) continue;
                    const data = parseLine(lines[i]);

                    const taskObj = {
                        title: data[headerMap['title']] || 'Imported Task',
                        description: data[headerMap['description']] || '',
                        status: (data[headerMap['status']] || 'todo').toLowerCase(),
                        priority: data[headerMap['priority']] || 'Medium',
                        deadline: data[headerMap['deadline']] || '',
                        assignedTo: '', // Keep unassigned by default
                        comments: 0,
                        attachments: 0,
                        progress: 0
                    };

                    // Validate status
                    if (!['todo', 'in-progress', 'review', 'done'].includes(taskObj.status)) {
                        taskObj.status = 'todo';
                    }

                    tasksToCreate.push(taskObj);
                }

                if (tasksToCreate.length === 0) {
                    alert('No valid tasks found in CSV');
                } else {
                    for (const t of tasksToCreate) {
                        await createTask(projectId, t);
                    }
                    alert(`Successfully imported ${tasksToCreate.length} tasks!`);
                }
            } catch (error) {
                console.error('Import failed:', error);
                alert('Import failed. Please check the console for details.');
            } finally {
                setIsImporting(false);
                e.target.value = ''; // Reset input
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform flex-shrink-0">
                        <Layout size={24} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white transition-colors truncate">{project?.name || 'Project Board'}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm transition-colors truncate">Workspace / {project?.name || 'Kanban'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl sm:mr-4 shadow-inner">
                        <button
                            onClick={() => setViewMode('kanban')}
                            title="Kanban View"
                            className={cn(
                                "p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-200",
                                viewMode === 'kanban'
                                    ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            )}
                        >
                            <Trello size={16} className="sm:hidden" />
                            <Trello size={18} className="hidden sm:block" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            title="Grid View"
                            className={cn(
                                "p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-200",
                                viewMode === 'grid'
                                    ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            )}
                        >
                            <LayoutGrid size={16} className="sm:hidden" />
                            <LayoutGrid size={18} className="hidden sm:block" />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            title="Table View"
                            className={cn(
                                "p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-200",
                                viewMode === 'table'
                                    ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            )}
                        >
                            <TableIcon size={16} className="sm:hidden" />
                            <TableIcon size={18} className="hidden sm:block" />
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            title="Calendar View"
                            className={cn(
                                "p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-200",
                                viewMode === 'calendar'
                                    ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            )}
                        >
                            <Calendar size={16} className="sm:hidden" />
                            <Calendar size={18} className="hidden sm:block" />
                        </button>
                    </div>

                    {role !== 'member' && (
                        <div className="flex items-center gap-2 sm:mr-4 sm:border-r border-slate-200 dark:border-slate-800 sm:pr-4 animate-in slide-in-from-right-4 duration-500">
                            <button
                                onClick={handleExportCSV}
                                title="Export to CSV"
                                className="p-2 sm:p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-primary hover:border-primary/50 transition-all shadow-sm flex items-center gap-2 text-sm font-bold"
                            >
                                <FileDown size={18} />
                                <span className="hidden md:inline">Export</span>
                            </button>

                            <label className="p-2 sm:p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-primary hover:border-primary/50 transition-all shadow-sm flex items-center gap-2 text-sm font-bold cursor-pointer transition-transform hover:scale-105 active:scale-95">
                                <FileUp size={18} />
                                <span className="hidden md:inline">Import</span>
                                <input
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleImportCSV}
                                    disabled={isImporting}
                                />
                            </label>
                        </div>
                    )}

                    <div className="hidden sm:flex -space-x-3">
                        {project?.members?.slice(0, 4).map((memberUid, i) => (
                            <div
                                key={memberUid}
                                title={memberNames[memberUid] || 'Loading...'}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-4 border-white dark:border-slate-950 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary font-bold text-xs shadow-sm cursor-help transition-all hover:-translate-y-1 hover:z-10"
                            >
                                {memberNames[memberUid]?.charAt(0) || '?'}
                            </div>
                        ))}
                        {project?.members?.length > 4 && (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-4 border-white dark:border-slate-950 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-[10px] shadow-sm">
                                +{project.members.length - 4}
                            </div>
                        )}
                        {hasPermission(PERMISSIONS.CREATE_PROJECT) && (
                            <button
                                onClick={() => setIsAddMemberOpen(true)}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-4 border-white dark:border-slate-950 bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 hover:rotate-90 transition-all cursor-pointer z-10"
                            >
                                <Plus size={16} />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="ml-2 w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm relative group"
                        title="Project Chat"
                    >
                        <MessageSquare size={20} />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full hidden"></span>
                    </button>
                </div>
            </div>

            <AddMemberModal
                isOpen={isAddMemberOpen}
                onClose={() => setIsAddMemberOpen(false)}
                projectId={projectId}
                currentMembers={project?.members}
            />

            <AddTaskModal
                isOpen={isAddTaskOpen}
                onClose={() => {
                    setIsAddTaskOpen(false);
                    setSelectedTask(null);
                }}
                projectId={projectId}
                members={project?.members}
                initialStatus={selectedStatus}
                task={selectedTask}
            />

            <AttachmentViewer
                isOpen={!!viewingAttachment}
                onClose={() => setViewingAttachment(null)}
                attachment={viewingAttachment}
            />

            {viewMode === 'kanban' && (
                <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
                    {columns.map((column) => (
                        <div
                            key={column.id}
                            className="min-w-[320px] w-[320px] flex flex-col gap-4"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <span className={`w-2 h-6 rounded-full ${column.color}`}></span>
                                    <h3 className="font-bold text-slate-700 dark:text-slate-300 transition-colors">{column.title}</h3>
                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-lg transition-colors">
                                        {tasks.filter(t => t.status === column.id).length}
                                    </span>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col gap-4 min-h-[500px]">
                                {tasks.filter(t => t.status === column.id).map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        projectId={projectId}
                                        role={role}
                                        hasPermission={hasPermission}
                                        memberNames={memberNames}
                                        deleteTask={deleteTask}
                                        onEdit={(t) => {
                                            setSelectedTask(t);
                                            setIsAddTaskOpen(true);
                                        }}
                                        onViewAttachment={setViewingAttachment}
                                    />
                                ))}

                                {hasPermission(PERMISSIONS.CREATE_TASK) && (
                                    <button
                                        onClick={() => {
                                            setSelectedStatus(column.id);
                                            setSelectedTask(null);
                                            setIsAddTaskOpen(true);
                                        }}
                                        className="w-full py-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-slate-400 dark:text-slate-600 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-center justify-center gap-2 outline-none group"
                                    >
                                        <Plus size={18} className="group-hover:scale-125 transition-transform" />
                                        <span>Add Task</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {tasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            projectId={projectId}
                            role={role}
                            hasPermission={hasPermission}
                            memberNames={memberNames}
                            deleteTask={deleteTask}
                            onEdit={(t) => {
                                setSelectedTask(t);
                                setIsAddTaskOpen(true);
                            }}
                            onViewAttachment={setViewingAttachment}
                        />
                    ))}
                    {hasPermission(PERMISSIONS.CREATE_TASK) && (
                        <button
                            onClick={() => {
                                setSelectedStatus('todo');
                                setSelectedTask(null);
                                setIsAddTaskOpen(true);
                            }}
                            className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-primary/30 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                <Plus size={24} />
                            </div>
                            <span className="font-bold">Add New Task</span>
                        </button>
                    )}
                </div>
            )}

            {viewMode === 'table' && (
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            {/* ... (table content) ... */}
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Asset ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Task Information</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Owner</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Progress</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Priority</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Due Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {tasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-1 rounded-lg uppercase tracking-wider w-fit">
                                                    {task.customId || 'TK-000'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 max-w-md">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors text-base flex items-center gap-2">
                                                    {task.title}
                                                    {task.imageUrl && <ImageIcon size={14} className="text-slate-400" />}
                                                </span>
                                                {task.description && (
                                                    <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1 italic">
                                                        {task.description}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="relative group/assignee">
                                                <select
                                                    value={task.assignedTo || ''}
                                                    onChange={(e) => updateTask(projectId, task.id, { assignedTo: e.target.value })}
                                                    disabled={role === 'member'}
                                                    className={cn(
                                                        "appearance-none bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none w-full pr-10 overflow-hidden text-ellipsis whitespace-nowrap box-border",
                                                        role === 'member' ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                                                    )}
                                                >
                                                    <option value="">Unassigned</option>
                                                    {project?.members?.map(memberId => (
                                                        <option key={memberId} value={memberId}>
                                                            {memberNames[memberId] || 'Member'}
                                                        </option>
                                                    ))}
                                                </select>
                                                {role !== 'member' && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/assignee:text-primary transition-colors">
                                                        <ChevronRight size={14} className="rotate-90" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="relative group/status">
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => updateTaskStatus(projectId, task.id, e.target.value)}
                                                    className={cn(
                                                        "appearance-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border outline-none cursor-pointer w-full pr-10",
                                                        task.status === 'done' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' :
                                                            task.status === 'review' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                                                                task.status === 'in-progress' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                                                                    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                    )}
                                                >
                                                    {columns.map(col => (
                                                        <option key={col.id} value={col.id}>{col.title}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                                    <ChevronRight size={12} className="rotate-90" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="relative group/priority">
                                                <select
                                                    value={task.priority}
                                                    onChange={(e) => updateTask(projectId, task.id, { priority: e.target.value })}
                                                    disabled={role === 'member'}
                                                    className={cn(
                                                        "appearance-none px-4 py-2 rounded-xl border bg-white dark:bg-slate-900/50 shadow-sm outline-none w-full pr-10 text-xs font-black uppercase tracking-tight transition-all",
                                                        task.priority === 'High' ? 'border-red-100 text-red-600 dark:border-red-900/30 dark:text-red-400' :
                                                            task.priority === 'Medium' ? 'border-amber-100 text-amber-600 dark:border-amber-900/30 dark:text-amber-400' :
                                                                'border-blue-100 text-blue-600 dark:border-blue-900/30 dark:text-blue-400',
                                                        role === 'member' ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                                                    )}
                                                >
                                                    <option value="High">High</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="Low">Low</option>
                                                </select>
                                                {role !== 'member' && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                                        <ChevronRight size={12} className="rotate-90" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm bg-slate-50 dark:bg-slate-800/50 w-fit px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                                <Clock size={14} className="text-primary/60" />
                                                {formatDate(task.deadline)}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                                                {role !== 'member' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTask(task);
                                                            setIsAddTaskOpen(true);
                                                        }}
                                                        className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                                                        title="Edit Task"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                                {hasPermission(PERMISSIONS.DELETE_TASK) && (
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Delete this task?')) deleteTask(projectId, task.id);
                                                        }}
                                                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                                                        title="Delete Task"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {viewMode === 'calendar' && (
                <TaskCalendar tasks={tasks} />
            )}

            <ProjectChat
                projectId={projectId}
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
            />
        </div>
    );
}

function TaskCard({ task, projectId, role, hasPermission, memberNames, deleteTask, onEdit, onViewAttachment }) {
    const handleDragStart = (e, taskId) => {
        e.dataTransfer.setData('taskId', taskId);
    };

    const attachment = task.attachment || (task.imageUrl ? { url: task.imageUrl, type: 'image/jpeg', name: 'Attachment' } : null);

    return (
        <div
            draggable
            onDragStart={(e) => handleDragStart(e, task.id)}
            className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all cursor-grab active:cursor-grabbing group"
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">
                    {task.customId || 'TK-000'}
                </span>
                <div className="flex items-center gap-1">
                    {role !== 'member' && (
                        <button
                            onClick={() => onEdit(task)}
                            className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Edit2 size={14} />
                        </button>
                    )}
                    {hasPermission(PERMISSIONS.DELETE_TASK) && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Delete this task?')) deleteTask(projectId, task.id);
                            }}
                            className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {attachment && (
                <div
                    className="mb-4 rounded-xl overflow-hidden h-32 w-full border border-slate-100 dark:border-slate-800 cursor-pointer relative group/image"
                    onClick={() => onViewAttachment(attachment)}
                >
                    {attachment.type.startsWith('image/') ? (
                        <img src={attachment.url} alt={attachment.name || task.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400 group-hover/image:text-primary transition-colors">
                            <FileIcon size={32} />
                            <span className="text-xs font-bold mt-2 uppercase tracking-wider">{attachment.type.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                        <ZoomIn className="text-white drop-shadow-md" size={24} />
                    </div>
                </div>
            )}

            <h4 className="font-bold text-slate-900 dark:text-white mb-4 line-clamp-2 transition-colors uppercase tracking-tight">{task.title}</h4>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs transition-colors">
                        <MessageSquare size={14} />
                        <span>{task.comments || 0}</span>
                    </div>
                    {task.assignedTo && (
                        <div
                            title={`Assigned to ${memberNames[task.assignedTo] || '...'}`}
                            className="w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary transition-colors"
                        >
                            {memberNames[task.assignedTo]?.charAt(0) || 'U'}
                        </div>
                    )}
                </div>
                {task.deadline && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg transition-colors">
                        <Clock size={12} />
                        <span>{formatDate(task.deadline)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
