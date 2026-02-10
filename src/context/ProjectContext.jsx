import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    deleteDoc,
    serverTimestamp,
    runTransaction,
    orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
    const { user, userData } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !userData) {
            setProjects([]);
            setLoading(false);
            return;
        }

        let q;
        if (userData.role === 'admin') {
            q = query(collection(db, 'projects'));
        } else {
            q = query(
                collection(db, 'projects'),
                where('members', 'array-contains', user.uid)
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const projectsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProjects(projectsData);
            setLoading(false);
        });

        return unsubscribe;
    }, [user, userData]);

    const createProject = async (projectData) => {
        return await addDoc(collection(db, 'projects'), {
            ...projectData,
            managerId: user.uid,
            members: [user.uid, ...(projectData.members || [])],
            createdAt: serverTimestamp(),
            status: 'Planning'
        });
    };

    const updateProject = async (projectId, updates) => {
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, updates);
    };

    const deleteProject = async (projectId) => {
        await deleteDoc(doc(db, 'projects', projectId));
    };

    const getTasks = (projectId, callback) => {
        const q = query(
            collection(db, 'projects', projectId, 'tasks')
        );
        return onSnapshot(q, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(tasksData);
        });
    };

    const createTask = async (projectId, taskData) => {
        const projectRef = doc(db, 'projects', projectId);

        try {
            await runTransaction(db, async (transaction) => {
                const projectDoc = await transaction.get(projectRef);
                if (!projectDoc.exists()) {
                    throw "Project does not exist!";
                }

                const currentCounter = projectDoc.data().taskCounter || 0;
                const newTaskNo = currentCounter + 1;

                transaction.update(projectRef, { taskCounter: newTaskNo });

                const tasksColl = collection(db, 'projects', projectId, 'tasks');
                const newTaskRef = doc(tasksColl);

                transaction.set(newTaskRef, {
                    ...taskData,
                    taskNo: newTaskNo,
                    customId: `TK-${String(newTaskNo).padStart(3, '0')}`,
                    createdAt: serverTimestamp()
                });
            });
        } catch (e) {
            console.error("Task creation transaction failed:", e);
            throw e;
        }
    };

    const updateTaskStatus = async (projectId, taskId, newStatus) => {
        const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
        await updateDoc(taskRef, { status: newStatus });
    };

    const updateProjectMembers = async (projectId, members) => {
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, { members });
    };

    const deleteTask = async (projectId, taskId) => {
        const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
        await deleteDoc(taskRef);
    };

    const updateTask = async (projectId, taskId, updates) => {
        const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
        await updateDoc(taskRef, updates);
    };

    const getMessages = (projectId, callback) => {
        const q = query(
            collection(db, 'projects', projectId, 'messages'),
            orderBy('createdAt', 'asc')
        );
        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(messages);
        });
    };

    const sendMessage = async (projectId, messageData) => {
        await addDoc(collection(db, 'projects', projectId, 'messages'), {
            ...messageData,
            createdAt: serverTimestamp()
        });
    };

    const value = {
        projects,
        loading,
        createProject,
        updateProject,
        deleteProject,
        getTasks,
        createTask,
        updateTask,
        updateTaskStatus,
        updateProjectMembers,
        deleteTask,
        getMessages,
        sendMessage
    };

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
}

export const useProjects = () => useContext(ProjectContext);
