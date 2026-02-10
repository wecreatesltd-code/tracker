import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, FileText, File as FileIcon } from 'lucide-react';

export default function AttachmentViewer({ isOpen, onClose, attachment }) {
    const [scale, setScale] = useState(1);

    if (!isOpen || !attachment) return null;

    const { url, type, name } = attachment;
    const isImage = type.startsWith('image/');
    const isPdf = type === 'application/pdf';

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 5));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.5));

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Toolbar */}
            {/* Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-2 bg-slate-800/80 p-2 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-md z-50">
                <button onClick={handleZoomOut} className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors" title="Zoom Out">
                    <ZoomOut size={20} />
                </button>
                <span className="text-xs font-bold text-slate-400 min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
                <button onClick={handleZoomIn} className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors" title="Zoom In">
                    <ZoomIn size={20} />
                </button>
                <div className="w-px h-6 bg-slate-700 mx-2"></div>
                <a href={url} download={name} className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors" title="Download">
                    <Download size={20} />
                </a>
                <button onClick={onClose} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-xl transition-colors" title="Close">
                    <X size={20} />
                </button>
            </div>

            {/* Mobile Toolbar (Bottom) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex sm:hidden items-center gap-2 bg-slate-800/90 p-2 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-md z-50 overflow-x-auto max-w-[90vw]">
                <button onClick={handleZoomOut} className="p-2 text-slate-300 rounded-xl active:bg-slate-700">
                    <ZoomOut size={18} />
                </button>
                <button onClick={handleZoomIn} className="p-2 text-slate-300 rounded-xl active:bg-slate-700">
                    <ZoomIn size={18} />
                </button>
                <div className="w-px h-5 bg-slate-600 mx-1"></div>
                <a href={url} download={name} className="p-2 text-slate-300 rounded-xl active:bg-slate-700">
                    <Download size={18} />
                </a>
                <button onClick={onClose} className="p-2 text-red-400 rounded-xl active:bg-red-900/30">
                    <X size={18} />
                </button>
            </div>

            {/* Content Container with Grid Background */}
            <div className="w-full h-full overflow-auto custom-scrollbar flex items-center justify-center p-8 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px]">
                <div
                    className="transition-transform duration-200 ease-out origin-center"
                    style={{ transform: `scale(${scale})` }}
                >
                    {isImage && (
                        <img
                            src={url}
                            alt={name}
                            className="max-w-[95vw] max-h-[80vh] sm:max-w-[90vw] sm:max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        />
                    )}

                    {isPdf && (
                        <iframe
                            src={url}
                            title={name}
                            className="w-[95vw] h-[70vh] sm:w-[80vw] sm:h-[80vh] bg-white rounded-lg shadow-2xl border-none"
                        />
                    )}

                    {!isImage && !isPdf && (
                        <div className="flex flex-col items-center justify-center gap-4 p-6 sm:p-12 bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl max-w-[90vw]">
                            <div className="w-24 h-24 bg-slate-700 rounded-3xl flex items-center justify-center text-slate-400">
                                <FileText size={48} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-white font-bold text-lg mb-1">{name}</h3>
                                <p className="text-slate-400 text-sm">Cannot preview this file type.</p>
                            </div>
                            <a
                                href={url}
                                download={name}
                                className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2"
                            >
                                <Download size={18} />
                                Download File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
