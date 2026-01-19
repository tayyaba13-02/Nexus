import React, { useState } from 'react';
import { Button } from './ui/Button';
import axios from 'axios';
import { usePlayerStore } from '../store/usePlayerStore';
import { X, ListMusic, Check } from 'lucide-react';

import { API_URL } from '../config';

export default function AddToPlaylistModal({ isOpen, onClose, songToAdd }) {
    const { playlists, updatePlaylist } = usePlayerStore();
    const [isLoading, setIsLoading] = useState(false);
    const [successId, setSuccessId] = useState(null);

    if (!isOpen || !songToAdd) return null;

    const handleAddToPlaylist = async (playlistId) => {
        try {
            const songRef = {
                id: songToAdd._id || songToAdd.id,
                filename: songToAdd.filename,
                title: songToAdd.filename, // Assuming title is filename, adjust if needed
                artist: songToAdd.artist || "Unknown",
                duration: songToAdd.duration,
                url: songToAdd.url
            };
            const res = await axios.post(`${API_URL}/api/playlists/${playlistId}/songs`, songRef, {
                headers: { 'X-User-ID': usePlayerStore.getState().userId }
            });
            updatePlaylist(res.data);
            onClose();
        } catch (err) {
            console.error("Failed to add to playlist:", err);
            alert("Failed to add song. Are you the owner of this playlist?");
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0a1210]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#111d1a] border border-[#268168]/20 rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#268168]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-white/40 hover:text-[#268168] transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold mb-2 text-white">Add to Playlist</h2>
                <p className="text-white/60 text-sm mb-6">Select a playlist to add <span className="text-[#268168] font-bold">{songToAdd.filename}</span></p>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {playlists.length === 0 ? (
                        <p className="text-center text-white/40 py-8 font-medium italic">No playlists found. Create one first!</p>
                    ) : (
                        playlists.map((playlist) => (
                            <button
                                key={playlist._id}
                                onClick={() => handleAddToPlaylist(playlist._id)}
                                disabled={isLoading}
                                className="w-full text-left p-4 rounded-2xl hover:bg-[#268168]/10 border border-transparent hover:border-[#268168]/20 transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center text-white font-bold">
                                    <div className="w-10 h-10 bg-[#0a1210] rounded-xl flex items-center justify-center mr-4 shadow-inner border border-[#268168]/5">
                                        <ListMusic size={20} className="text-[#268168]/60 group-hover:text-[#268168] transition-colors" />
                                    </div>
                                    {playlist.name}
                                </div>
                                {successId === playlist._id && (
                                    <div className="w-6 h-6 bg-[#268168] rounded-full flex items-center justify-center shadow-lg shadow-[#268168]/20">
                                        <Check size={14} className="text-white" />
                                    </div>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
