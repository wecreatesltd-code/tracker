import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Trash2,
    Edit3,
    Save,
    X,
    StickyNote,
    MoreVertical,
    Calendar,
    Cloud,
    CloudOff,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { cn } from '../lib/utils';

export default function Notepad() {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        if (!user) return;

        const notesRef = collection(db, 'users', user.uid, 'notes');
        const q = query(notesRef, orderBy('updatedAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotes(notesData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleCreateNote = async () => {
        if (!user) return;

        const newNote = {
            title: 'Untitled Note',
            content: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            color: 'bg-white'
        };

        try {
            const docRef = await addDoc(collection(db, 'users', user.uid, 'notes'), newNote);
            setSelectedNote({ id: docRef.id, ...newNote });
            setTitle('Untitled Note');
            setContent('');
            setIsEditing(true);
        } catch (error) {
            console.error('Error creating note:', error);
        }
    };

    const handleSaveNote = async () => {
        if (!user || !selectedNote) return;

        setIsSaving(true);
        try {
            const noteRef = doc(db, 'users', user.uid, 'notes', selectedNote.id);
            await updateDoc(noteRef, {
                title: title.trim() || 'Untitled Note',
                content: content,
                updatedAt: serverTimestamp()
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving note:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteNote = async (id, event) => {
        event?.stopPropagation();
        if (!user) return;

        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                await deleteDoc(doc(db, 'users', user.uid, 'notes', id));
                if (selectedNote?.id === id) {
                    setSelectedNote(null);
                    setIsEditing(false);
                }
            } catch (error) {
                console.error('Error deleting note:', error);
            }
        }
    };

    const handleSelectNote = (note) => {
        setSelectedNote(note);
        setTitle(note.title);
        setContent(note.content);
        setIsEditing(false);
    };

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    return (
        <div className="h-auto md:h-[calc(100vh-140px)] flex flex-col gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sidebar List */}
            <div className="w-full md:w-80 flex flex-col gap-4 md:h-full">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">My Notes</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Personal space</p>
                    </div>
                    <button
                        onClick={handleCreateNote}
                        className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                    />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar max-h-[250px] md:max-h-none">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="animate-spin text-primary" size={24} />
                            </div>
                        ) : filteredNotes.length > 0 ? (
                            filteredNotes.map((note) => (
                                <motion.div
                                    layout
                                    key={note.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={() => handleSelectNote(note)}
                                    className={cn(
                                        "p-4 rounded-2xl border cursor-pointer transition-all group relative",
                                        selectedNote?.id === note.id
                                            ? "bg-primary border-primary shadow-lg shadow-primary/10"
                                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary/50"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={cn(
                                            "font-bold truncate pr-6",
                                            selectedNote?.id === note.id ? "text-white" : "text-slate-900 dark:text-white"
                                        )}>
                                            {note.title}
                                        </h3>
                                        <button
                                            onClick={(e) => handleDeleteNote(note.id, e)}
                                            className={cn(
                                                "opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all absolute top-3 right-3",
                                                selectedNote?.id === note.id ? "text-white/80 hover:bg-white/20" : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                                            )}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className={cn(
                                        "text-sm line-clamp-2 mb-3",
                                        selectedNote?.id === note.id ? "text-white/80" : "text-slate-500 dark:text-slate-400"
                                    )}>
                                        {note.content || 'No content...'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={12} className={selectedNote?.id === note.id ? "text-white/60" : "text-slate-400"} />
                                        <span className={cn(
                                            "text-[10px] font-medium",
                                            selectedNote?.id === note.id ? "text-white/60" : "text-slate-400"
                                        )}>
                                            {formatDate(note.updatedAt)}
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-10 px-6">
                                <StickyNote className="mx-auto text-slate-300 mb-3" size={40} />
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No notes found</p>
                                <p className="text-slate-400 text-xs mt-1">Start by creating your first personal note!</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden transition-colors min-h-[400px] md:min-h-0 md:h-full">
                {selectedNote ? (
                    <>
                        <div className="p-4 sm:p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                    <StickyNote size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            {isSaving ? (
                                                <span className="flex items-center gap-1.5 text-primary">
                                                    <Loader2 size={12} className="animate-spin" />
                                                    Saving...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-green-500">
                                                    <CheckCircle2 size={12} />
                                                    Saved
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                                    >
                                        <Edit3 size={18} />
                                        Edit
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSaveNote}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 text-sm sm:text-base"
                                    >
                                        <Save size={18} />
                                        Save Note
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto custom-scrollbar">
                            {isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Note Title"
                                        className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none mb-4 sm:mb-6 placeholder:text-slate-300 dark:placeholder:text-slate-700 w-full"
                                    />
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Start writing..."
                                        className="flex-1 text-slate-700 dark:text-slate-300 bg-transparent border-none outline-none resize-none leading-relaxed placeholder:text-slate-300 dark:placeholder:text-slate-700 text-base sm:text-lg min-h-[200px]"
                                    />
                                </>
                            ) : (
                                <article className="prose dark:prose-invert max-w-none">
                                    <h1 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">
                                        {selectedNote.title}
                                    </h1>
                                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-lg">
                                        {selectedNote.content}
                                    </p>
                                    {!selectedNote.content && (
                                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                                            <Edit3 size={40} className="text-slate-200 mb-4" />
                                            <p className="text-slate-400 font-medium">This note is empty</p>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="mt-4 text-primary font-bold hover:underline"
                                            >
                                                Start adding content
                                            </button>
                                        </div>
                                    )}
                                </article>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4 sm:mb-6 border border-slate-100 dark:border-slate-800/50">
                            <StickyNote size={48} />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3 transition-colors">Select a note to read</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs transition-colors">
                            Choose a note from the list on the left or create a new one to get started.
                        </p>
                        <button
                            onClick={handleCreateNote}
                            className="mt-6 sm:mt-8 flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95"
                        >
                            <Plus size={20} />
                            Create New Note
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
