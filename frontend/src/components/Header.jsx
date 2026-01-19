import React, { useState } from 'react';
import { Music, Search, Bell, User, Edit2, Check, Menu } from 'lucide-react';
import { Button } from './ui/Button';
import { Link } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';

export default function Header() {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { userName, setUserName, isMobileMenuOpen, setIsMobileMenuOpen, userId, setUserId } = usePlayerStore();
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(userName);

    const handleNameSubmit = () => {
        if (tempName.trim()) {
            setUserName(tempName.trim());
            setIsEditingName(false);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-[#0a1210]/80 backdrop-blur-md border-b border-[#268168]/10 z-[50] flex items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden p-2 text-[#268168] hover:text-white transition-colors"
                >
                    <Menu size={24} />
                </button>
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#268168] to-emerald-700 rounded-lg flex items-center justify-center shadow-lg shadow-[#268168]/20">
                        <Music size={18} className="text-white" />
                    </div>
                    <span className="text-lg md:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-100 to-[#268168] tracking-tighter">
                        Nexus
                    </span>
                </Link>
            </div>

            <div className="flex-1 max-w-xs md:max-w-md mx-4 md:mx-8">
                <div className="relative group">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-800 group-focus-within:text-[#268168] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-[#111d1a] border border-[#268168]/10 rounded-full py-1.5 md:py-2 pl-9 md:pl-10 pr-4 text-xs md:text-sm text-emerald-50 focus:outline-none focus:border-[#268168] focus:ring-1 focus:ring-[#268168] transition-all placeholder:text-emerald-900/50"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                window.location.href = `/search?q=${encodeURIComponent(e.target.value)}`;
                            }
                        }}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <div className="relative">
                    <div
                        className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#111d1a] border border-[#268168]/20 flex items-center justify-center cursor-pointer hover:border-[#268168] transition-all shadow-inner group"
                        onClick={() => {
                            setShowProfileMenu(!showProfileMenu);
                            setIsEditingName(false);
                            setTempName(userName);
                        }}
                    >
                        <User size={16} className="text-[#268168] group-hover:text-white transition-colors" />
                    </div>

                    {showProfileMenu && (
                        <div className="absolute right-0 top-14 w-64 bg-[#111d1a] border border-[#268168]/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 z-50 p-2">
                            <div className="px-3 py-4 bg-[#0a1210]/40 rounded-xl space-y-4">
                                {/* Name Editor */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[10px] text-[#268168] font-black uppercase tracking-widest">Display Name</label>
                                        {!isEditingName ? (
                                            <button onClick={() => setIsEditingName(true)} className="text-[#268168] hover:text-white transition-colors">
                                                <Edit2 size={12} />
                                            </button>
                                        ) : (
                                            <button onClick={handleNameSubmit} className="text-[#268168] hover:text-white transition-colors">
                                                <Check size={14} />
                                            </button>
                                        )}
                                    </div>
                                    {isEditingName ? (
                                        <input
                                            type="text"
                                            value={tempName}
                                            onChange={(e) => setTempName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                                            className="w-full bg-[#0a1210] border border-[#268168]/20 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#268168] transition-all"
                                            autoFocus
                                        />
                                    ) : (
                                        <p className="text-sm font-bold text-white tracking-tight truncate">{userName}</p>
                                    )}
                                </div>

                                {/* Identity Key Section */}
                                <div className="pt-4 border-t border-[#268168]/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[10px] text-[#268168] font-black uppercase tracking-widest flex items-center gap-1.5">
                                            Secret Identity Key
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex-1 bg-[#0a1210] border border-[#268168]/20 rounded-lg px-2 py-2 text-[10px] font-mono text-emerald-400 select-all tracking-wider overflow-hidden truncate">
                                            {userId}
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(userId);
                                                alert("Key copied! Save this to access your music on other devices.");
                                            }}
                                            className="p-2 text-[#268168] hover:text-white transition-colors bg-[#0a1210] rounded-lg border border-[#268168]/10 hover:border-[#268168]"
                                            title="Copy Key"
                                        >
                                            <Check size={14} />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-emerald-900/60 leading-relaxed italic">
                                            Switching devices? Enter your old key here to restore your library.
                                        </p>
                                        <input
                                            type="text"
                                            placeholder="Enter Key..."
                                            className="w-full bg-[#0a1210] border border-[#268168]/20 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#268168]"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && e.target.value.trim()) {
                                                    if (confirm("Switch identity? Your current local library will be hidden.")) {
                                                        setUserId(e.target.value.trim());
                                                        window.location.reload();
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
