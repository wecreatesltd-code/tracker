import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const PermissionContext = createContext();

export const PERMISSIONS = {
    CREATE_PROJECT: 'create_project',
    UPDATE_PROJECT: 'update_project',
    DELETE_PROJECT: 'delete_project',
    ASSIGN_PROJECT: 'assign_project',
    CHANGE_PROJECT_STATUS: 'change_project_status',
    VIEW_ALL_PROJECTS: 'view_all_projects',
    CREATE_TASK: 'create_task',
    ASSIGN_TASK: 'assign_task',
    UPDATE_TASK_STATUS: 'update_task_status',
    DELETE_TASK: 'delete_task',
    VIEW_REPORTS: 'view_reports',
    MANAGE_USERS: 'manage_users',
    VIEW_TEAM_WORKLOAD: 'view_team_workload',
    ACCESS_SETTINGS: 'access_settings',
    MANAGE_PERMISSIONS: 'manage_permissions'
};

const DEFAULT_ROLE_PERMISSIONS = {
    admin: Object.values(PERMISSIONS),
    manager: [
        PERMISSIONS.CREATE_PROJECT,
        PERMISSIONS.UPDATE_PROJECT,
        PERMISSIONS.ASSIGN_PROJECT,
        PERMISSIONS.CHANGE_PROJECT_STATUS,
        PERMISSIONS.VIEW_ALL_PROJECTS,
        PERMISSIONS.CREATE_TASK,
        PERMISSIONS.ASSIGN_TASK,
        PERMISSIONS.UPDATE_TASK_STATUS,
        PERMISSIONS.DELETE_TASK,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_TEAM_WORKLOAD
    ],
    member: [
        PERMISSIONS.UPDATE_TASK_STATUS
    ]
};

export function PermissionProvider({ children }) {
    const { userData } = useAuth();
    const [rolePermissions, setRolePermissions] = useState(DEFAULT_ROLE_PERMISSIONS);
    const [loading, setLoading] = useState(true);
    const role = userData?.role || 'member';

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'config', 'permissions'),
            (doc) => {
                if (doc.exists()) {
                    setRolePermissions(doc.data());
                } else {
                    // Initialize if not exists
                    setDoc(doc.ref, DEFAULT_ROLE_PERMISSIONS).catch(console.error);
                }
                setLoading(false);
            },
            (error) => {
                console.error("Permission context error:", error);
                setLoading(false);
            }
        );

        return () => unsub();
    }, []);

    const hasPermission = (permission) => {
        if (role === 'admin') return true;
        return rolePermissions[role]?.includes(permission);
    };

    const updatePermissions = async (newPermissions) => {
        if (role !== 'admin') return;
        await setDoc(doc(db, 'config', 'permissions'), newPermissions);
    };

    const value = {
        hasPermission,
        role,
        rolePermissions,
        updatePermissions,
        loading
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
}

export const usePermission = () => useContext(PermissionContext);
