export const calculateProgress = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / tasks.length) * 100);
};

export const getProjectHealth = (project, tasks) => {
    if (!project.deadline) return 'On Track';

    const progress = calculateProgress(tasks);
    const deadline = new Date(project.deadline);
    const today = new Date();

    if (progress < 100 && deadline < today) return 'Overdue';
    if (progress < 50 && deadline - today < 3 * 24 * 60 * 60 * 1000) return 'At Risk';

    return 'On Track';
};
