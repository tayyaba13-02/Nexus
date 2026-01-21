import React from 'react';
import ReactDOM from 'react-dom';
import { X, Share, PlusSquare, Smartphone } from 'lucide-react';
import { Button } from './ui/Button';

export default function InstallGuideModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-[#0a1210]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-[#111d1a] border border-[#268168]/20 rounded-[2rem] w-full max-w-lg p-6 md:p-8 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-emerald-900/40 hover:text-[#268168] transition-colors z-10"
                >
                    <X size={24} />
                </button>

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-[#268168]/20 rounded-2xl flex items-center justify-center text-[#268168]">
                        <Smartphone size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Install Nexus</h2>
                        <p className="text-emerald-100/60 text-sm">Add to your home screen for the best experience</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#0a1210]/40 rounded-2xl p-4 border border-[#268168]/10">
                        <h3 className="text-[#268168] text-xs font-black uppercase tracking-widest mb-4">On iPhone / iPad</h3>
                        <ol className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-[#268168]/10 text-[#268168] text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">1</div>
                                <p className="text-sm text-white/80 leading-relaxed">
                                    Tap the <span className="inline-flex items-center px-1.5 py-0.5 bg-white/5 rounded border border-white/10 mx-0.5"><Share size={14} className="text-blue-400" /> Share</span> button in Safari.
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-[#268168]/10 text-[#268168] text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">2</div>
                                <p className="text-sm text-white/80 leading-relaxed">
                                    Scroll down and tap <span className="inline-flex items-center px-1.5 py-0.5 bg-white/5 rounded border border-white/10 mx-0.5"><PlusSquare size={14} /> Add to Home Screen</span>.
                                </p>
                            </li>
                        </ol>
                    </div>

                    <div className="bg-[#0a1210]/40 rounded-2xl p-4 border border-[#268168]/10 opacity-60">
                        <h3 className="text-[#268168] text-xs font-black uppercase tracking-widest mb-4">On Android</h3>
                        <p className="text-sm text-white/80 leading-relaxed">
                            Tap the "Install App" button in the library, or tap the three dots <span className="font-bold">⋮</span> in Chrome and select <span className="font-bold">Install App</span>.
                        </p>
                    </div>

                    <Button variant="primary" className="w-full h-12 rounded-xl text-sm font-bold" onClick={onClose}>
                        Got it!
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}
