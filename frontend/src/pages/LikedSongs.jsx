import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Heart, Play, Pause, Music, Clock, MoreHorizontal, ListMusic } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { Link } from 'react-router-dom';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

import { API_URL } from '../config';

export default function LikedSongs() {
    const { likedSongs, setCurrentSong, toggleLike, currentSong, isPlaying, togglePlay, userName } = usePlayerStore();
    const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
    const [songToAdd, setSongToAdd] = useState(null);

    const playSong = (song) => {
        const fullUrl = `${API_URL}${song.url}`;
        setCurrentSong({ ...song, url: fullUrl }); // Maintain compatibility if url is relative
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 h-auto md:h-80 bg-gradient-to-b from-[#111d1a] to-[#0a1210] p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-[#268168]/10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-[#268168]/10 blur-[80px] md:blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="w-40 h-40 md:w-56 md:h-56 bg-brand-gradient rounded-2xl md:rounded-3xl shadow-2xl flex items-center justify-center relative z-10 group flex-shrink-0">
                    <Heart size={48} className="text-white fill-white md:w-20 md:h-20 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl md:rounded-3xl" />
                </div>
                <div className="mb-2 md:mb-6 z-10 relative text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-3 md:mb-4">
                        <div className="px-3 py-1 bg-[#268168]/20 rounded-full text-[#268168] text-[10px] md:text-xs font-bold uppercase tracking-widest">Personal</div>
                        <span className="text-white/40 text-[10px] md:text-xs font-black uppercase tracking-widest">Playlist</span>
                    </div>
                    <h1 className="text-3xl md:text-6xl font-black text-white mb-4 md:mb-6 tracking-tighter">Liked Songs</h1>
                    <div className="flex items-center justify-center md:justify-start gap-3 text-white/40 text-xs md:text-sm font-medium">
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#268168]/20 flex items-center justify-center text-[8px] md:text-[10px] text-[#268168] font-black">{userName.charAt(0).toUpperCase()}</div>
                        <span className="text-white">{userName}</span>
                        <span className="opacity-40">•</span>
                        <span>{likedSongs.length} songs</span>
                    </div>
                </div>
            </div>

            <div className="bg-[#0d1a17]/40 rounded-2xl md:rounded-[2rem] border border-[#268168]/10 min-h-[300px] md:min-h-[400px] overflow-hidden backdrop-blur-sm shadow-xl">
                {likedSongs.length === 0 ? (
                    <div className="p-10 md:p-12 text-center text-white/40 flex flex-col items-center justify-center h-full">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-[#268168]/10 rounded-full flex items-center justify-center mb-4">
                            <Heart size={24} className="text-[#268168] opacity-50 md:w-8 md:h-8" />
                        </div>
                        <p className="text-base md:text-lg font-bold text-white">You haven't liked any songs yet.</p>
                        <p className="text-xs md:text-sm mt-1 mb-8">Find songs you love and tap the heart icon.</p>
                        <Link to="/">
                            <Button variant="outline" className="rounded-full px-6 md:px-8 h-10 md:h-11 text-[10px] md:text-xs font-black uppercase tracking-widest text-[#268168] border-[#268168]/20 hover:bg-[#268168]/10">Browse Library</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-[#268168]/5 px-1 md:px-2 py-1">
                        {likedSongs.map((song, index) => {
                            const isCurrentSong = currentSong && (currentSong._id || currentSong.id) === (song._id || song.id);
                            const isPlayingCurrent = isCurrentSong && isPlaying;

                            return (
                                <div
                                    key={song._id || song.id}
                                    className={`group p-2 md:p-4 flex items-center justify-between transition-all cursor-pointer rounded-xl md:rounded-2xl mb-1 ${isCurrentSong ? 'bg-[#268168]/15 border-l-2 md:border-l-4 border-[#268168]' : 'hover:bg-[#268168]/5 border-l-2 md:border-l-4 border-transparent'}`}
                                    onClick={() => isCurrentSong ? togglePlay() : playSong(song)}
                                >
                                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                        <span className={`hidden sm:block w-6 text-center text-sm font-black group-hover:hidden ${isCurrentSong ? 'text-[#268168]' : 'text-white/20'}`}>
                                            {isCurrentSong && isPlaying ? <div className="animate-pulse">il.</div> : index + 1}
                                        </span>
                                        <div className="w-6 hidden group-hover:flex justify-center flex-shrink-0">
                                            {isPlayingCurrent ? (
                                                <Pause size={14} className="text-white fill-white" />
                                            ) : (
                                                <Play size={14} className="text-white fill-white" />
                                            )}
                                        </div>

                                        <div className="w-10 h-10 md:w-14 md:h-14 bg-[#111d1a] rounded-lg md:rounded-xl flex items-center justify-center text-[#268168] shadow-inner flex-shrink-0">
                                            {isCurrentSong ? (
                                                isPlaying ? <Pause size={18} fill="currentColor" className="md:w-6 md:h-6" /> : <Play size={18} fill="currentColor" className="md:w-6 md:h-6" />
                                            ) : (
                                                <Music size={18} className="md:w-6 md:h-6" />
                                            )}
                                        </div>
                                        <div className="min-w-0 pr-4">
                                            <h4 className={`font-bold text-sm md:text-lg transition-colors truncate ${isCurrentSong ? 'text-[#268168]' : 'text-white group-hover:text-[#268168]'}`}>{song.filename}</h4>
                                            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest truncate">{song.artist || 'Unknown Artist'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-2 rounded-full text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleLike(song);
                                            }}
                                        >
                                            <Heart size={16} fill="currentColor" className="md:w-[18px] md:h-[18px]" />
                                        </Button>
                                        <span className="hidden sm:block text-white/20 text-[10px] md:text-sm font-black w-12 text-right group-hover:text-white/40">
                                            {song.duration ? (() => {
                                                const m = Math.floor(song.duration / 60);
                                                const s = Math.floor(song.duration % 60);
                                                return `${m}:${s < 10 ? '0' : ''}${s}`;
                                            })() : '--:--'}
                                        </span>
                                        <div className="relative group/menu">
                                            <Button variant="ghost" size="sm" className="p-2 rounded-full text-white/10 md:text-white/20 hover:text-[#268168] opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal size={16} />
                                            </Button>
                                            {/* Dropdown Menu */}
                                            <div className={`absolute right-0 w-44 md:w-52 bg-[#111d1a] border border-[#268168]/20 rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 p-1 ${index >= likedSongs.length - 2 && index > 0 ? 'bottom-full mb-2' : 'top-8'}`}>
                                                <button
                                                    className="w-full text-left px-3 py-2 text-xs md:text-sm text-white/60 hover:bg-[#268168]/10 hover:text-[#268168] rounded-lg transition-all flex items-center font-bold"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSongToAdd(song);
                                                        setIsAddToPlaylistModalOpen(true);
                                                    }}
                                                >
                                                    <ListMusic size={14} className="mr-2" />
                                                    Add to Playlist
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

            <AddToPlaylistModal
                isOpen={isAddToPlaylistModalOpen}
                onClose={() => setIsAddToPlaylistModalOpen(false)}
                songToAdd={songToAdd}
            />
        </div>
    );
}
