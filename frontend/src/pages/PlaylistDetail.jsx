import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Play, Pause, Music, MoreHorizontal, ListMusic, Trash2, Edit2, XCircle } from 'lucide-react';
import axios from 'axios';
import { usePlayerStore } from '../store/usePlayerStore';
import EditPlaylistModal from '../components/EditPlaylistModal';

import { API_URL } from '../config';

export default function PlaylistDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { setCurrentSong, currentSong, isPlaying, togglePlay, removePlaylist, updatePlaylist, userName, setSongs } = usePlayerStore();

    useEffect(() => {
        const fetchPlaylistAndSongs = async () => {
            setIsLoading(true); // Keep loading state management
            try {
                const [playlistRes, songsRes] = await Promise.all([
                    axios.get(`${API_URL}/api/playlists/${id}`, {
                        headers: { 'X-User-ID': usePlayerStore.getState().userId }
                    }),
                    axios.get(`${API_URL}/api/songs`, {
                        headers: { 'X-User-ID': usePlayerStore.getState().userId }
                    })
                ]);
                setPlaylist(playlistRes.data);
                // Also update global songs list just in case
                setSongs(songsRes.data);
            } catch (err) {
                console.error("Failed to fetch playlist data:", err);
            } finally {
                setIsLoading(false); // Keep loading state management
            }
        };
        fetchPlaylistAndSongs();
    }, [id, setSongs]);

    const handleDeletePlaylist = async () => {
        if (!window.confirm("Are you sure you want to delete this playlist?")) return;
        try {
            await axios.delete(`${API_URL}/api/playlists/${id}`, {
                headers: { 'X-User-ID': usePlayerStore.getState().userId }
            });
            removePlaylist(id);
            navigate('/');
        } catch (error) {
            console.error("Error deleting playlist:", error);
            alert("Failed to delete playlist. Are you the owner?");
        }
    };

    const handleRemoveSong = async (songId, e) => {
        e.stopPropagation();
        try {
            const response = await axios.delete(`${API_URL}/api/playlists/${id}/songs/${songId}`, {
                headers: { 'X-User-ID': usePlayerStore.getState().userId }
            });
            setPlaylist(response.data);
            updatePlaylist(response.data);
        } catch (error) {
            console.error("Error removing song:", error);
            alert("Failed to remove song. Are you the owner?");
        }
    };

    const playSong = (song) => {
        // Ensure URL is absolute if needed, consistent with other parts of the app
        const fullUrl = song.url.startsWith('http') ? song.url : `${API_URL}${song.url}`;
        setCurrentSong({ ...song, url: fullUrl });
    };

    if (isLoading) {
        return <div className="p-12 text-center text-emerald-100/40 font-medium">Loading playlist...</div>;
    }

    if (!playlist) {
        return <div className="p-12 text-center text-emerald-100/40 font-medium">Playlist not found</div>;
    }

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 h-auto md:h-80 bg-gradient-to-b from-[#111d1a] to-[#0a1210] p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-[#268168]/10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-[#268168]/10 blur-[80px] md:blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="w-40 h-40 md:w-56 md:h-56 bg-[#111d1a] border border-[#268168]/10 rounded-2xl md:rounded-3xl shadow-2xl flex items-center justify-center z-10 relative group flex-shrink-0">
                    <ListMusic size={60} className="text-[#268168] md:w-20 md:h-20 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-[#268168]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl md:rounded-3xl" />
                </div>

                <div className="mb-2 md:mb-6 z-10 relative flex-1 text-center md:text-left w-full">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-3 md:mb-4">
                        <div className="px-3 py-1 bg-[#268168]/20 rounded-full text-[#268168] text-[10px] md:text-xs font-bold uppercase tracking-widest">Collection</div>
                    </div>
                    <h1 className="text-3xl md:text-6xl font-black text-white mb-3 md:mb-4 tracking-tighter truncate">{playlist.name}</h1>
                    <p className="text-white/60 text-sm md:text-lg mb-6 md:mb-8 max-w-2xl font-medium leading-relaxed line-clamp-2 md:line-clamp-none">{playlist.description}</p>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-white/40 text-xs md:text-sm font-medium">
                            <span className="text-white">{userName}</span>
                            <span className="opacity-40">•</span>
                            <span>{playlist.songs.length} songs</span>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                            <Button variant="ghost" size="sm" className="h-9 px-3 text-[10px] md:text-xs font-black uppercase tracking-widest text-white/40 hover:text-[#268168] bg-[#268168]/5 hover:bg-[#268168]/10 rounded-full" onClick={() => setIsEditModalOpen(true)}>
                                <Edit2 size={14} className="mr-1.5 md:mr-2" />
                                Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="h-9 px-3 text-[10px] md:text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 rounded-full" onClick={handleDeletePlaylist}>
                                <Trash2 size={14} className="mr-1.5 md:mr-2" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#0d1a17]/40 rounded-2xl md:rounded-[2rem] border border-[#268168]/10 min-h-[300px] md:min-h-[400px] overflow-hidden backdrop-blur-sm shadow-xl">
                {playlist.songs.length === 0 ? (
                    <div className="p-10 md:p-12 text-center text-white/40 flex flex-col items-center justify-center h-full">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-[#268168]/10 rounded-full flex items-center justify-center mb-4">
                            <Music size={24} className="text-[#268168] opacity-50 md:w-8 md:h-8" />
                        </div>
                        <p className="text-base md:text-lg font-bold text-white">This playlist is empty.</p>
                        <p className="text-xs md:text-sm mt-1 mb-8">Add some songs from your library.</p>
                        <Link to="/">
                            <Button variant="outline" className="rounded-full px-6 md:px-8 h-10 md:h-11 text-[10px] md:text-xs font-black uppercase tracking-widest text-[#268168] border-[#268168]/20 hover:bg-[#268168]/10">Browse Library</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-[#268168]/5 px-1 md:px-2 py-1">
                        {playlist.songs.map((song, index) => (
                            <div
                                key={index}
                                className="group p-3 md:p-4 hover:bg-[#268168]/5 flex items-center justify-between transition-all cursor-pointer rounded-xl md:rounded-2xl mb-1"
                                onClick={() => playSong(song)}
                            >
                                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                    <span className="hidden sm:block text-white/20 w-6 text-center text-sm font-black group-hover:hidden">{index + 1}</span>
                                    <div className="w-6 hidden group-hover:flex justify-center flex-shrink-0">
                                        <Play size={14} className="text-white fill-white" />
                                    </div>

                                    <div className="w-10 h-10 md:w-14 md:h-14 bg-[#111d1a] rounded-lg md:rounded-xl flex items-center justify-center text-[#268168] shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
                                        <Music size={18} className="md:w-6 md:h-6" />
                                    </div>
                                    <div className="min-w-0 pr-4">
                                        <h4 className="font-bold text-sm md:text-lg text-white group-hover:text-[#268168] transition-colors truncate">{song.filename}</h4>
                                        <p className="text-[10px] text-white/40 font-black uppercase tracking-widest truncate">{song.artist || 'Unknown Artist'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                                    <span className="hidden sm:block text-white/20 text-[10px] md:text-sm font-black min-w-[3rem] text-right group-hover:text-white/40">
                                        {song.duration ? (() => {
                                            const m = Math.floor(song.duration / 60);
                                            const s = Math.floor(song.duration % 60);
                                            return `${m}:${s < 10 ? '0' : ''}${s}`;
                                        })() : '--:--'}
                                    </span>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-2 rounded-full text-white/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => handleRemoveSong(song.id, e)}
                                        title="Remove from playlist"
                                    >
                                        <XCircle size={16} className="md:w-[18px] md:h-[18px]" />
                                    </Button>

                                    <div className="relative group/menu">
                                        <Button variant="ghost" size="sm" className="p-2 rounded-full text-white/10 md:text-white/20 hover:text-[#268168] opacity-0 group-hover:opacity-100 md:opacity-0 transition-opacity">
                                            <MoreHorizontal size={16} />
                                        </Button>
                                        {/* Dropdown Menu */}
                                        <div className={`absolute right-0 w-48 bg-[#111d1a] border border-[#268168]/20 rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 p-1 ${index >= playlist.songs.length - 2 && index > 0 ? 'bottom-full mb-2' : 'top-8'}`}>
                                            <button
                                                className="w-full text-left px-3 py-2 text-xs md:text-sm text-red-500/60 hover:bg-red-500/10 hover:text-red-500 rounded-lg flex items-center transition-all font-bold"
                                                onClick={(e) => handleRemoveSong(song.id, e)}
                                            >
                                                <XCircle size={14} className="mr-2" />
                                                Remove from Playlist
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <EditPlaylistModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                playlist={playlist}
                onUpdate={(updatedPlaylist) => setPlaylist(updatedPlaylist)}
            />
        </div>
    );
}
