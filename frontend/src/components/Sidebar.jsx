import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/Button';
import { usePlayerStore } from '../store/usePlayerStore';
import { Upload, Music, Play, Heart, Plus, ListMusic, ChevronDown, ChevronUp, X, Download } from 'lucide-react';
import axios from 'axios';
import PlaylistModal from './PlaylistModal';
import UploadModal from './UploadModal';
import InstallGuideModal from './InstallGuideModal';
import { motion, AnimatePresence } from 'framer-motion';

import { API_URL } from '../config';

export default function Sidebar() {
    const {
        setCurrentSong,
        playlists,
        setPlaylists,
        addPlaylist,
        setSongs,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        deferredPrompt,
        setDeferredPrompt,
        userId,
        currentMoodFilter,
        setMoodFilter
    } = usePlayerStore();
    const fileInputRef = useRef(null);
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const location = useLocation();

    // Fetch playlists on mount
    useEffect(() => {
        const fetchPlaylists = async () => {
            if (!userId) return; // Ensure userId is available before fetching
            try {
                const res = await axios.get(`${API_URL}/api/playlists`, {
                    headers: { 'X-User-ID': userId }
                });
                setPlaylists(res.data);
            } catch (err) {
                console.error("Failed to fetch playlists:", err);
            }
        };
        fetchPlaylists();
    }, [setPlaylists, userId]); // Added userId to dependencies

    const handleCreatePlaylist = async (data) => {
        if (!userId) {
            console.error("User ID is not available. Cannot create playlist.");
            return;
        }
        try {
            await axios.post(`${API_URL}/api/playlists`, data, {
                headers: { 'X-User-ID': userId }
            });
            // Refetch playlists instead of adding manually to avoid duplicates
            const res = await axios.get(`${API_URL}/api/playlists`, {
                headers: { 'X-User-ID': userId }
            });
            setPlaylists(res.data);
            setIsPlaylistModalOpen(false);
        } catch (err) {
            console.error("Failed to create playlist:", err);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // For now, upload without moods - we'll add a modal later for better UX
        const formData = new FormData();
        formData.append('file', file);
        formData.append('moods', ''); // Empty for now

        try {
            await axios.post(`${API_URL}/api/songs/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-User-ID': userId
                },
            });
            const songsRes = await axios.get(`${API_URL}/api/songs/`, {
                headers: { 'X-User-ID': userId }
            });
            setSongs(songsRes.data);
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const handleInstallClick = async () => {
        const isIframe = window.self !== window.top;
        if (isIframe) {
            const directUrl = `https://${window.location.hostname.replace('.hf.space', '')}.hf.space`;
            if (confirm("Automatic installation doesn't work inside the Hugging Face wrapper. Would you like to open the direct link to install?")) {
                window.top.location.href = window.location.href;
            }
            return;
        }

        if (!deferredPrompt) {
            setIsInstallGuideOpen(true);
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    const SidebarContent = (
        <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6 lg:block">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#268168]">Library Actions</h3>
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="lg:hidden p-2 text-emerald-100/40 hover:text-white"
                >
                    <X size={20} />
                </button>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/*"
                className="hidden"
            />

            <div className="space-y-3">
                <Button
                    onClick={() => setIsUploadModalOpen(true)}
                    variant="primary"
                    className="w-full justify-start"
                >
                    <Upload size={18} className="mr-2" />
                    Upload Song
                </Button>

                <Button
                    onClick={deferredPrompt ? handleInstallClick : () => setIsInstallGuideOpen(true)}
                    variant="outline"
                    className="w-full justify-start border-[#268168]/20 text-[#268168] hover:bg-[#268168]/10 group relative overflow-hidden"
                >
                    <Download size={18} className="mr-2 group-hover:bounce transition-transform" />
                    Install App
                    {!deferredPrompt && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#268168] rounded-full animate-pulse" />
                    )}
                </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-[#268168]/10">
                <p className="text-[10px] text-emerald-100/40 uppercase font-black tracking-[0.2em] mb-4">Filter by Mood</p>
                <div className="flex flex-wrap gap-2">
                    {['Happy', 'Sad', 'Energetic', 'Chill', 'Romantic', 'Angry', 'Focused', 'Party'].map((mood) => {
                        const moodEmojis = {
                            'Happy': '😊',
                            'Sad': '😢',
                            'Energetic': '⚡',
                            'Chill': '😌',
                            'Romantic': '💕',
                            'Angry': '😤',
                            'Focused': '🎯',
                            'Party': '🎉'
                        };
                        const isActive = currentMoodFilter === mood;

                        return (
                            <button
                                key={mood}
                                onClick={() => {
                                    setMoodFilter(isActive ? null : mood);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`
                                    px-2.5 py-1.5 rounded-full text-xs font-bold transition-all
                                    flex items-center gap-1.5
                                    ${isActive
                                        ? 'bg-[#268168] text-white shadow-lg shadow-[#268168]/30'
                                        : 'bg-[#111d1a] text-white/60 hover:text-white border border-[#268168]/20 hover:border-[#268168]/40'
                                    }
                                `}
                            >
                                <span>{moodEmojis[mood]}</span>
                                <span>{mood}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#268168]/10">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] text-emerald-100/40 uppercase font-black tracking-[0.2em]">Playlists</p>
                    <button
                        onClick={() => setIsPlaylistModalOpen(true)}
                        className="text-emerald-900/60 hover:text-[#268168] transition-colors"
                    >
                        <Plus size={16} />
                    </button>
                </div>
                <ul className="space-y-1">
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                        <li className={`flex items-center hover:text-[#268168] cursor-pointer py-2 px-3 rounded-xl transition-all ${location.pathname === '/' ? 'bg-[#268168]/10 text-[#268168] font-bold' : 'text-emerald-900/60'}`}>
                            <div className="w-6 h-6 flex items-center justify-center mr-3">
                                <Play size={16} className={`${location.pathname === '/' ? 'fill-[#268168]' : ''}`} />
                            </div>
                            Home
                        </li>
                    </Link>
                    <Link to="/liked" onClick={() => setIsMobileMenuOpen(false)}>
                        <li className={`flex items-center hover:text-white cursor-pointer py-2 px-3 rounded-xl transition-all ${location.pathname === '/liked' ? 'bg-[#268168]/10 text-white font-bold' : 'text-emerald-100/60'}`}>
                            <div className="bg-gradient-to-br from-[#268168] to-teal-600 w-6 h-6 rounded flex items-center justify-center mr-3 shadow-lg shadow-[#268168]/20">
                                <Heart size={14} className="text-white fill-white" />
                            </div>
                            Liked Songs
                        </li>
                    </Link>
                    <Link to="/analytics" onClick={() => setIsMobileMenuOpen(false)}>
                        <li className={`flex items-center hover:text-white cursor-pointer py-2 px-3 rounded-xl transition-all ${location.pathname === '/analytics' ? 'bg-[#268168]/10 text-white font-bold' : 'text-emerald-100/60'}`}>
                            <div className="w-6 h-6 flex items-center justify-center mr-3">
                                <span className="text-[#268168]">📈</span>
                            </div>
                            Analytics
                        </li>
                    </Link>
                    {playlists.slice(0, showAll ? playlists.length : 1).map((playlist) => {
                        const playlistId = playlist._id || playlist.id;
                        return (
                            <Link key={playlistId} to={`/playlist/${playlistId}`} onClick={() => setIsMobileMenuOpen(false)}>
                                <li className={`flex items-center hover:text-white cursor-pointer py-2 px-3 rounded-xl transition-all ${location.pathname === `/playlist/${playlistId}` ? 'bg-[#268168]/10 text-white font-bold' : 'text-emerald-100/60'}`}>
                                    <ListMusic size={16} className="mr-3" />
                                    <span className="truncate">{playlist.name}</span>
                                </li>
                            </Link>
                        );
                    })}
                </ul>

                {playlists.length > 1 && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="mt-2 text-xs text-[#268168] hover:text-teal-400 font-medium flex items-center gap-1 transition-colors"
                    >
                        {showAll ? (
                            <>
                                <ChevronUp size={14} />
                                Show Less
                            </>
                        ) : (
                            <>
                                <ChevronDown size={14} />
                                See All Playlists ({playlists.length})
                            </>
                        )}
                    </button>
                )}
            </div>

            <PlaylistModal
                isOpen={isPlaylistModalOpen}
                onClose={() => {
                    setIsPlaylistModalOpen(false);
                    // Refetch playlists when modal closes
                    axios.get(`${API_URL}/api/playlists`, {
                        headers: { 'X-User-ID': userId }
                    }).then(res => setPlaylists(res.data));
                }}
                onAction={handleCreatePlaylist}
                userId={userId}
            />
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />
            <InstallGuideModal
                isOpen={isInstallGuideOpen}
                onClose={() => setIsInstallGuideOpen(false)}
            />
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 bg-[#0d1a17]/50 backdrop-blur-md border border-[#268168]/10 h-[calc(100vh-8rem)] sticky top-24 overflow-hidden rounded-3xl ml-4 shadow-xl">
                {SidebarContent}
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 bg-[#061914] z-[70] lg:hidden shadow-2xl border-r border-[#268168]/20"
                        >
                            {SidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
