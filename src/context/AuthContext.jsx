import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                setUser(user);
                if (user) {
                    // Fetch additional user data (role) from Firestore
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    }
                } else {
                    setUserData(null);
                }
            } catch (error) {
                console.error("Auth Context error:", error);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const signup = async (email, password, name, role = 'member') => {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = {
            uid: res.user.uid,
            name,
            email,
            role,
            createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', res.user.uid), newUser);
        setUserData(newUser);
        return res;
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const fetchUsers = async () => {
        const querySnapshot = await getDocs(collection(db, 'users'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const updateUser = async (userId, updates) => {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, updates);
    };

    const deleteUser = async (userId) => {
        const userRef = doc(db, 'users', userId);
        await deleteDoc(userRef);
    };

    const updateProfile = async (updates) => {
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, updates, { merge: true });
        setUserData(prev => ({ ...prev, ...updates }));
    };

    const value = {
        user,
        userData,
        signup,
        login,
        logout,
        fetchUsers,
        updateProfile,
        updateUser,
        deleteUser,
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
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
