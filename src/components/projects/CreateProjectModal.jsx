import React, { useState } from 'react';
import { X, Layout, Users, Calendar, Rocket } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';

export default function CreateProjectModal({ isOpen, onClose }) {
    const { createProject } = useProjects();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        deadline: '',
        budget: '',
        priority: 'Medium'
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createProject(formData);
            onClose();
        } catch (err) {
            console.error(err);
            alert('Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-4 sm:p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 dark:bg-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary transition-colors">
                            <Rocket size={20} className="sm:hidden" />
                            <Rocket size={24} className="hidden sm:block" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white transition-colors">Create New Project</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Launch a new workspace for your team.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <X size={20} className="text-slate-400 dark:text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Project Name</label>
                        <div className="relative">
                            <Layout className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                            <input
                                required
                                type="text"
                                placeholder="e.g. Website Redesign"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Description</label>
                        <textarea
                            required
                            rows="3"
                            placeholder="Briefly describe the project goals..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl p-4 sm:p-6 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Deadline</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                                <input
                                    required
                                    type="date"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Priority</label>
                            <select
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl py-3 sm:py-4 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="Low">Low Priority</option>
                                <option value="Medium">Medium Priority</option>
                                <option value="High">High Priority</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all outline-none"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            className="flex-[2] bg-primary text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
                        >
                            {loading ? 'Launching...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
