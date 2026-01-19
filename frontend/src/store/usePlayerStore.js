import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

import { API_URL } from '../config';

const generateUserId = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Readable chars
    let result = 'NEXUS-';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const trackPlay = async (song, userId) => {
    if (!song) return;
    try {
        const id = song._id || song.id;
        await axios.post(`${API_URL}/api/analytics/track?song_id=${id}`, {}, {
            headers: { 'X-User-ID': userId }
        });
    } catch (err) {
        console.error("Failed to track play:", err);
    }
};

export const usePlayerStore = create(
    persist(
        (set, get) => ({
            isPlaying: false,
            volume: 1,
            currentSong: null,
            songs: [],
            queue: [],
            likedSongs: [],
            playlists: [],
            userName: 'Nexus User',
            userId: generateUserId(),
            isMobileMenuOpen: false,
            currentMoodFilter: null,
            deferredPrompt: null,

            setUserName: (name) => set({ userName: name }),
            setUserId: (id) => set({ userId: id }),
            setIsMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
            setDeferredPrompt: (prompt) => set({ deferredPrompt: prompt }),
            togglePlay: () => set((state) => {
                if (!state.currentSong) return state;
                return { isPlaying: !state.isPlaying };
            }),
            setVolume: (volume) => set({ volume }),
            setCurrentSong: (song) => {
                set({ currentSong: song, isPlaying: true });
                trackPlay(song, get().userId);
            },
            setSongs: (songs) => set({ songs }),
            setPlaylists: (playlists) => set({ playlists }),
            addPlaylist: (playlist) => set((state) => ({ playlists: [...state.playlists, playlist] })),
            updatePlaylist: (updatedPlaylist) => set((state) => ({
                playlists: state.playlists.map(p => (p._id || p.id) === (updatedPlaylist._id || updatedPlaylist.id) ? updatedPlaylist : p)
            })),
            removePlaylist: (id) => set((state) => ({
                playlists: state.playlists.filter(p => (p._id || p.id) !== id)
            })),
            deleteSong: (id) => set((state) => ({
                songs: state.songs.filter(s => (s._id || s.id) !== id),
                // remove from queue if present
                queue: state.queue.filter(s => (s._id || s.id) !== id),
                // remove from liked songs if present
                likedSongs: state.likedSongs.filter(s => (s._id || s.id) !== id)
            })),
            addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),
            stop: () => set({ isPlaying: false }),
            toggleLike: (song) => set((state) => {
                const songId = song._id || song.id;
                const isLiked = state.likedSongs.some((s) => (s._id || s.id) === songId);
                if (isLiked) {
                    return { likedSongs: state.likedSongs.filter((s) => (s._id || s.id) !== songId) };
                } else {
                    return { likedSongs: [...state.likedSongs, song] };
                }
            }),

            playNext: () => set((state) => {
                const list = state.queue.length > 0 ? state.queue : state.songs;
                if (!state.currentSong || list.length === 0) return {};

                const currentId = state.currentSong._id || state.currentSong.id;
                const currentIndex = list.findIndex(s => (s._id || s.id) === currentId);
                const nextIndex = (currentIndex + 1) % list.length;
                const nextSong = list[nextIndex];
                trackPlay(nextSong, state.userId);
                return { currentSong: nextSong, isPlaying: true };
            }),

            playPrevious: () => set((state) => {
                const list = state.queue.length > 0 ? state.queue : state.songs;
                if (!state.currentSong || list.length === 0) return {};

                const currentId = state.currentSong._id || state.currentSong.id;
                const currentIndex = list.findIndex(s => (s._id || s.id) === currentId);
                const prevIndex = (currentIndex - 1 + list.length) % list.length;
                const prevSong = list[prevIndex];
                trackPlay(prevSong, state.userId);
                return { currentSong: prevSong, isPlaying: true };
            }),

            setMoodFilter: (mood) => set({ currentMoodFilter: mood }),
        }),
        {
            name: 'nexus-player-storage',
            partialize: (state) => ({ likedSongs: state.likedSongs, volume: state.volume, userName: state.userName, userId: state.userId }),
        }
    )
)
