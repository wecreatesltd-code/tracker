import React, { useState } from 'react';
import {
    Folder,
    MoreVertical,
    Users,
    Calendar,
    ChevronRight,
    Plus,
    Trash2,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermission, PERMISSIONS } from '../context/PermissionContext';
import { useProjects } from '../context/ProjectContext';
import CreateProjectModal from '../components/projects/CreateProjectModal';

export default function Projects() {
    const { hasPermission } = usePermission();
    const { projects, deleteProject } = useProjects();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const navigate = useNavigate();

    const handleDeleteProject = async (e, projectId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            try {
                await deleteProject(projectId);
                setActiveDropdown(null);
            } catch (error) {
                console.error('Failed to delete project:', error);
                alert('Failed to delete project');
            }
        }
    };

    // Click outside to close dropdown
    React.useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white transition-colors">Projects</h2>
                    <p className="text-slate-500 dark:text-slate-400 transition-colors">Manage and track all your active projects.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        onClick={() => navigate(`/board/${project.id}`)}
                        className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <Folder size={24} />
                            </div>
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveDropdown(activeDropdown === project.id ? null : project.id);
                                    }}
                                    className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <MoreVertical size={20} />
                                </button>

                                {activeDropdown === project.id && (
                                    <div className="absolute right-0 top-10 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 overflow-hidden animate-in fade-in zoom-in duration-200">
                                        {hasPermission(PERMISSIONS.DELETE_PROJECT) ? (
                                            <button
                                                onClick={(e) => handleDeleteProject(e, project.id)}
                                                className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                                Delete Project
                                            </button>
                                        ) : (
                                            <div className="px-4 py-3 text-xs text-slate-400 text-center">No actions available</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 truncate transition-colors">{project.name}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6 h-10 transition-colors">{project.description}</p>

                        <div className="flex items-center gap-4 py-4 border-y border-slate-50 dark:border-slate-800 mb-6 transition-colors">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                                <Users size={16} />
                                <span>{project.members?.length || 1} members</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                                <Calendar size={16} />
                                <span>{project.deadline || 'No deadline'}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-lg uppercase tracking-wider transition-colors ${project.status === 'Active' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                                project.status === 'Planning' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}>
                                {project.status || 'Planning'}
                            </span>
                            <div className="text-primary font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                View Board <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>
                ))}

                {hasPermission(PERMISSIONS.CREATE_PROJECT) && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-4 text-slate-400 dark:text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/5 transition-all outline-none min-h-[300px]"
                    >
                        <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                            <Plus size={32} className="opacity-50" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-lg">Create New Project</p>
                            <p className="text-xs max-w-[180px] mx-auto opacity-70">Launch a new collab space for your team</p>
                        </div>
                    </button>
                )}
            </div>

            <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
