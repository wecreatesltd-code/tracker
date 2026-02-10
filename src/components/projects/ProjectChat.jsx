import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Send, Paperclip, X, Image as ImageIcon, File, Loader2, Download } from 'lucide-react';

export default function ProjectChat({ projectId, isOpen, onClose }) {
    const { user, userData } = useAuth();
    const { getMessages, sendMessage } = useProjects();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !projectId) return;

        const unsubscribe = getMessages(projectId, (data) => {
            setMessages(data);
        });

        return unsubscribe;
    }, [projectId, isOpen, getMessages]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !isUploading) || isSending) return;

        setIsSending(true);
        try {
            await sendMessage(projectId, {
                text: newMessage.trim(),
                senderId: user.uid,
                senderName: userData?.name || user.email,
                type: 'text',
                createdAt: new Date() // Server timestamp will override this
            });
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // Upload file
            const storageRef = ref(storage, `projects/${projectId}/chat/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Determine type
            const type = file.type.startsWith('image/') ? 'image' : 'file';

            // Send message with attachment
            await sendMessage(projectId, {
                text: '',
                senderId: user.uid,
                senderName: userData?.name || user.email,
                type: type,
                fileUrl: downloadURL,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type
            });
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload file');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Team Chat</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Share updates and files</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/30">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 opacity-50">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Send size={20} />
                        </div>
                        <p className="text-sm font-medium">No messages yet</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === user.uid;
                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${isMe ? 'ml-auto' : 'mr-auto'}`}>
                                <div className="flex items-center gap-2 mb-1 px-1">
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                                        {isMe ? 'You' : msg.senderName}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {msg.createdAt?.seconds
                                            ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : 'Just now'
                                        }
                                    </span>
                                </div>

                                <div className={`p-3 rounded-2xl ${isMe
                                    ? 'bg-primary text-white rounded-tr-sm'
                                    : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-sm shadow-sm'
                                    }`}>
                                    {msg.type === 'image' && (
                                        <div className="mb-2 rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
                                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                                                <img src={msg.fileUrl} alt="Shared image" className="max-w-full h-auto max-h-[200px] object-cover" />
                                            </a>
                                        </div>
                                    )}

                                    {msg.type === 'file' && (
                                        <a
                                            href={msg.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-3 p-3 rounded-xl mb-1 transition-colors ${isMe
                                                ? 'bg-white/10 hover:bg-white/20'
                                                : 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                                <File size={20} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold truncate max-w-[150px]">{msg.fileName}</p>
                                                <p className="text-[10px] opacity-70">{(msg.fileSize / 1024).toFixed(1)} KB</p>
                                            </div>
                                            <Download size={16} className="opacity-70" />
                                        </a>
                                    )}

                                    {msg.text && (
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <form onSubmit={handleSend} className="flex items-end gap-2">


                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all flex items-center">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={isUploading ? "Uploading..." : "Type a message..."}
                            className="w-full bg-transparent border-none focus:ring-0 p-3 max-h-[100px] min-h-[44px] resize-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            disabled={isUploading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending || isUploading}
                        className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                        {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                </form>
            </div>
        </div>
    );
}
