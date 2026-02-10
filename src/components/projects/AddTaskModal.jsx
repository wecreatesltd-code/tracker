import React, { useState } from 'react';
import { X, CheckSquare, Calendar, Flag, User, Loader2, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { usePermission } from '../../context/PermissionContext';

export default function AddTaskModal({ isOpen, onClose, projectId, members, initialStatus, task }) {
    const { createTask, updateTask } = useProjects();
    const { fetchUsers } = useAuth();
    const { role } = usePermission();
    const [loading, setLoading] = useState(false);
    const [teamNames, setTeamNames] = useState({});
    const [attachment, setAttachment] = useState(null); // { file: File | null, preview: string | null, type: string, name: string }
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: initialStatus || 'todo',
        priority: 'Medium',
        deadline: '',
        assignedTo: ''
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create preview for images only
            const isImage = file.type.startsWith('image/');
            setAttachment({
                file,
                preview: isImage ? URL.createObjectURL(file) : null,
                type: file.type || 'application/octet-stream',
                name: file.name
            });
        }
    };

    React.useEffect(() => {
        if (isOpen) {
            if (task) {
                setFormData({
                    title: task.title || '',
                    description: task.description || '',
                    status: task.status || 'todo',
                    priority: task.priority || 'Medium',
                    deadline: task.deadline || '',
                    assignedTo: task.assignedTo || ''
                });
                // Initialize attachment state from existing task data
                if (task.attachment) {
                    setAttachment({
                        file: null,
                        preview: task.attachment.type.startsWith('image/') ? task.attachment.url : null,
                        type: task.attachment.type,
                        name: task.attachment.name,
                        existingUrl: task.attachment.url // Flag to know it's already uploaded
                    });
                } else if (task.imageUrl) {
                    // Backward compatibility for old image-only tasks
                    setAttachment({
                        file: null,
                        preview: task.imageUrl,
                        type: 'image/jpeg', // Assumption
                        name: 'Attachment',
                        existingUrl: task.imageUrl
                    });
                } else {
                    setAttachment(null);
                }
            } else if (initialStatus) {
                setFormData(prev => ({
                    ...prev,
                    title: '',
                    description: '',
                    status: initialStatus,
                    priority: 'Medium',
                    deadline: '',
                    assignedTo: ''
                }));
                setAttachment(null);
            }
            loadTeamNames();
        }
    }, [isOpen, initialStatus, task]);

    const loadTeamNames = async () => {
        try {
            const users = await fetchUsers();
            const namesMap = {};
            users.forEach(u => {
                if (members?.includes(u.uid)) {
                    namesMap[u.uid] = u.name;
                }
            });
            setTeamNames(namesMap);
        } catch (error) {
            console.error('Error loading team names:', error);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let attachmentData = null;

            // Use existing attachment or process new one
            if (attachment?.existingUrl) {
                attachmentData = {
                    url: attachment.existingUrl,
                    type: attachment.type,
                    name: attachment.name
                };
            } else if (attachment?.file) {
                // Convert file to Base64
                const base64Url = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(attachment.file);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                });

                attachmentData = {
                    url: base64Url,
                    type: attachment.type,
                    name: attachment.name
                };
            }

            const taskPayload = {
                ...formData,
                attachment: attachmentData,
                // Legacy support/clearing
                imageUrl: attachmentData?.type.startsWith('image/') ? attachmentData.url : (task?.imageUrl || null)
            };

            if (task) {
                await updateTask(projectId, task.id, taskPayload);
            } else {
                await createTask(projectId, {
                    ...taskPayload,
                    comments: 0,
                    attachments: attachmentData ? 1 : 0,
                    progress: 0
                });
            }

            if (!task) {
                setFormData({
                    title: '',
                    description: '',
                    status: 'todo',
                    priority: 'Medium',
                    deadline: '',
                    assignedTo: ''
                });
                setAttachment(null);
            }
            onClose();
        } catch (err) {
            console.error(err);
            alert(task ? 'Failed to update task' : 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh] sm:max-h-[85vh]">
                <div className="p-4 sm:p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 transition-colors text-slate-400 dark:text-slate-500 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 dark:bg-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary transition-colors">
                            <CheckSquare size={20} className="sm:hidden" />
                            <CheckSquare size={24} className="hidden sm:block" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white transition-colors">
                                {task ? (
                                    <span>Edit Task <span className="text-primary">{task.customId}</span></span>
                                ) : (
                                    'Add New Task'
                                )}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">{task ? 'Modify task details and status.' : 'Define a new task for this project.'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 shadow-sm">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Task Title</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Design Dashboard UI"
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-6 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Description</label>
                        <textarea
                            rows="3"
                            placeholder="What needs to be done?"
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl p-4 sm:p-6 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none font-medium"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Attachment</label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all group w-full">
                                <Upload size={20} className="text-slate-400 group-hover:text-primary transition-colors" />
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                                    {attachment ? attachment.name : 'Upload File (Image, PDF, Doc)'}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*,.pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        {attachment && (
                            <div className="relative mt-2 w-full h-40 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 group bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                {attachment.preview ? (
                                    <img src={attachment.preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <FileText size={48} />
                                        <span className="text-sm font-bold">{attachment.type.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setAttachment(null)}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Priority</label>
                            <div className="relative">
                                <Flag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer font-medium"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Status</label>
                            <select
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-6 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer font-medium"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="review">Review</option>
                                {role !== 'member' && <option value="done">Done</option>}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Deadline</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                                <input
                                    type="date"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium [color-scheme:light] dark:[color-scheme:dark]"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Assign To</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer font-medium"
                                    value={formData.assignedTo}
                                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                >
                                    <option value="">Unassigned</option>
                                    {members?.map((memberUid) => (
                                        <option key={memberUid} value={memberUid}>
                                            {teamNames[memberUid] || 'Loading...'}
                                        </option>
                                    ))}
                                </select>
                            </div>
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
                            className="flex-[2] bg-primary text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                task ? 'Update Task' : 'Create Task'
                            )}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}
