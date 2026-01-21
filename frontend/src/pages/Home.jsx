import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import { Button } from '../components/ui/Button';
import { usePlayerStore } from '../store/usePlayerStore';
import { Upload, Music, Play, Pause, Heart, MoreHorizontal, Plus, ListMusic, Trash2, Download } from 'lucide-react';
import InstallGuideModal from '../components/InstallGuideModal';
import axios from 'axios';
import PlaylistModal from '../components/PlaylistModal';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

import { API_URL } from '../config';

export default function Home() {
    const { setCurrentSong, currentSong, isPlaying, togglePlay, songs, setSongs, likedSongs, toggleLike, currentMoodFilter, deferredPrompt } = usePlayerStore();
    const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
    const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
    const [songToAdd, setSongToAdd] = useState(null);

    useEffect(() => {
        fetchSongs();
    }, []);

    const fetchSongs = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/songs`, {
                headers: { 'X-User-ID': usePlayerStore.getState().userId }
            });
            setSongs(response.data);
        } catch (error) {
            console.error("Error fetching songs:", error);
        }
    };

    const handleStartListening = () => {
        if (songs.length > 0) {
            playSong(songs[0]);
        } else {
            // If no songs, maybe scroll to uploads?
            const element = document.getElementById('recent-uploads');
            element?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleInstallClick = async () => {
        const isIframe = window.self !== window.top;
        if (isIframe) {
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
            usePlayerStore.getState().setDeferredPrompt(null);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(`${API_URL}/api/songs/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            fetchSongs(); // Refresh list
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const playSong = (song) => {
        const fullUrl = `${API_URL}${song.url}`;
        setCurrentSong({ ...song, url: fullUrl });
    };

    // Filter songs by mood if a mood filter is active
    const displayedSongs = currentMoodFilter
        ? songs.filter(song => song.moods && song.moods.includes(currentMoodFilter))
        : songs;

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

    return (
        <>
            <Hero onPlayClick={handleStartListening} />

            {/* Song List */}
            <div id="recent-uploads" className="w-full px-4 md:px-0">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-white">Recent Tracks</h2>
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">{songs.length} uploads</span>
                </div>

                <div className="bg-[#0d1a17]/40 rounded-[1.5rem] md:rounded-[2rem] border border-[#268168]/10 overflow-hidden backdrop-blur-sm shadow-xl">
                    {displayedSongs.length === 0 ? (
                        <div className="text-center py-20 px-4">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#268168]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Music size={32} className="text-[#268168] md:w-10 md:h-10" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                                {currentMoodFilter ? `No ${currentMoodFilter} songs yet` : 'No songs yet'}
                            </h3>
                            <p className="text-emerald-100/60 text-sm md:text-base mb-8">
                                {currentMoodFilter ? `Upload or import songs and tag them as ${currentMoodFilter}` : 'Upload your first song or import from YouTube'}
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button
                                    variant="outline"
                                    className="rounded-full px-8 bg-[#268168]/10 border-[#268168]/20 text-[#268168] hover:bg-[#268168]/20"
                                    onClick={handleInstallClick}
                                >
                                    <Download size={18} className="mr-2" />
                                    Install on Phone
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#268168]/5">
                            {displayedSongs.map((song, index) => {
                                const isCurrentSong = currentSong && (currentSong._id || currentSong.id) === (song._id || song.id);
                                const isPlayingCurrent = isCurrentSong && isPlaying;

                                return (
                                    <div
                                        key={song._id || song.id}
                                        className={`group p-3 md:p-4 flex items-center justify-between transition-all cursor-pointer rounded-xl md:rounded-2xl mx-1 md:mx-2 my-1 ${isCurrentSong ? 'bg-[#268168]/10 border-l-2 md:border-l-4 border-[#268168]' : 'hover:bg-[#268168]/5 border-l-2 md:border-l-4 border-transparent'}`}
                                        onClick={() => isCurrentSong ? togglePlay() : playSong(song)}
                                    >
                                        <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
                                            <span className={`hidden sm:block w-8 text-center text-sm font-black group-hover:hidden ${isCurrentSong ? 'text-[#268168]' : 'text-white/20'}`}>
                                                {isCurrentSong && isPlaying ? <div className="text-[#268168] animate-pulse">il.</div> : (index + 1).toString().padStart(2, '0')}
                                            </span>
                                            <div className="w-6 hidden group-hover:flex justify-center flex-shrink-0">
                                                {isPlayingCurrent ? (
                                                    <Pause size={14} className="text-white fill-white" />
                                                ) : (
                                                    <Play size={14} className="text-white fill-white" />
                                                )}
                                            </div>

                                            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#268168]/20 to-emerald-900/20 rounded-lg md:rounded-xl flex items-center justify-center text-[#268168] flex-shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                                                {isCurrentSong ? (
                                                    isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />
                                                ) : (
                                                    <Music size={20} />
                                                )}
                                            </div>
                                            <div className="min-w-0 pr-4">
                                                <h4 className={`font-bold text-sm md:text-lg transition-colors truncate ${isCurrentSong ? 'text-[#268168]' : 'text-white group-hover:text-[#268168]'}`}>{song.filename}</h4>
                                                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest truncate">{song.artist || 'Unknown Artist'}</p>
                                                {song.moods && song.moods.length > 0 && (
                                                    <div className="flex gap-1 mt-1 flex-wrap">
                                                        {song.moods.slice(0, 3).map((mood) => (
                                                            <span key={mood} className="text-[9px] px-1.5 py-0.5 bg-[#268168]/20 text-[#268168] rounded-full font-bold flex items-center gap-0.5">
                                                                <span>{moodEmojis[mood]}</span>
                                                                <span className="hidden sm:inline">{mood}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`p-2 rounded-full hover:bg-[#268168]/10 transition-colors ${likedSongs.some(s => (s._id || s.id) === (song._id || song.id)) ? 'text-red-500' : 'text-white/10 md:text-white/20 hover:text-white'}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleLike(song);
                                                }}
                                            >
                                                <Heart size={16} fill={likedSongs.some(s => (s._id || s.id) === (song._id || song.id)) ? "currentColor" : "none"} />
                                            </Button>

                                            <span className="hidden sm:block text-white/20 text-sm font-black min-w-[3rem] text-right group-hover:text-white/40">
                                                {song.duration ? (() => {
                                                    const m = Math.floor(song.duration / 60);
                                                    const s = Math.floor(song.duration % 60);
                                                    return `${m}:${s < 10 ? '0' : ''}${s}`;
                                                })() : '--:--'}
                                            </span>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="p-2 rounded-full text-white/10 md:text-white/20 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all flex"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(song._id || song.id);
                                                }}
                                                title="Delete Song"
                                            >
                                                <Trash2 size={16} />
                                            </Button>

                                            <div className="relative group/menu">
                                                <Button variant="ghost" size="sm" className="p-2 rounded-full text-white/10 md:text-white/20 hover:text-[#268168] opacity-0 group-hover:opacity-100 md:opacity-0 transition-opacity">
                                                    <MoreHorizontal size={16} />
                                                </Button>
                                                {/* Dropdown Menu */}
                                                <div className={`absolute right-0 w-44 md:w-48 bg-[#111d1a] border border-[#268168]/20 rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 p-1 ${index >= songs.length - 2 && index > 0 ? 'bottom-full mb-2' : 'top-8'}`}>
                                                    <button
                                                        className="w-full text-left px-3 py-2 text-xs md:text-sm text-white/60 hover:bg-[#268168]/10 hover:text-[#268168] rounded-lg flex items-center transition-all font-bold"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSongToAdd(song);
                                                            setIsAddToPlaylistModalOpen(true);
                                                        }}
                                                    >
                                                        <ListMusic size={14} className="mr-2" />
                                                        Add to Playlist
                                                    </button>
                                                    <button
                                                        className="w-full text-left px-3 py-2 text-xs md:text-sm text-red-500/60 hover:bg-red-500/10 hover:text-red-500 rounded-lg flex items-center transition-all font-bold"
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (confirm('Are you sure you want to delete this song?')) {
                                                                try {
                                                                    const id = song._id || song.id;
                                                                    await axios.delete(`${API_URL}/api/songs/${id}`);
                                                                    const { deleteSong } = usePlayerStore.getState();
                                                                    deleteSong(id);
                                                                } catch (err) {
                                                                    console.error("Failed to delete song", err);
                                                                }
                                                                // Close menu implicitly by focus loss or we can just hope it closes
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 size={14} className="mr-2" />
                                                        Delete Song
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
            <AddToPlaylistModal
                isOpen={isAddToPlaylistModalOpen}
                onClose={() => setIsAddToPlaylistModalOpen(false)}
                songToAdd={songToAdd}
            />
            <InstallGuideModal
                isOpen={isInstallGuideOpen}
                onClose={() => setIsInstallGuideOpen(false)}
            />
        </>
    );
}
