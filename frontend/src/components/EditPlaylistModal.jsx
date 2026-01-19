import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import axios from 'axios';
import { usePlayerStore } from '../store/usePlayerStore';
import { X } from 'lucide-react';

import { API_URL } from '../config';

export default function EditPlaylistModal({ isOpen, onClose, playlist, onUpdate }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const { updatePlaylist } = usePlayerStore();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (playlist) {
            setName(playlist.name);
            setDescription(playlist.description || '');
        }
    }, [playlist]);

    if (!isOpen || !playlist) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const id = playlist._id || playlist.id;
            const response = await axios.put(`${API_URL}/api/playlists/${id}`, {
                name,
                description
            });
            updatePlaylist(response.data);
            if (onUpdate) onUpdate(response.data);
            onClose();
        } catch (error) {
            console.error("Error updating playlist:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0a1210]/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className="bg-[#111d1a] border border-[#268168]/20 rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#268168]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-white/40 hover:text-[#268168] transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-3xl font-black mb-2 text-white tracking-tighter">Edit Playlist</h2>
                <p className="text-white/60 text-sm mb-10 font-medium">Update the details of your collection.</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                        <label className="block text-xs font-black text-[#268168] uppercase tracking-[0.2em]">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#0a1210] border border-[#268168]/20 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#268168] focus:ring-1 focus:ring-[#268168] transition-all placeholder:text-white/10"
                            placeholder="My Awesome Playlist"
                            autoFocus
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-xs font-black text-[#268168] uppercase tracking-[0.2em]">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#0a1210] border border-[#268168]/20 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#268168] focus:ring-1 focus:ring-[#268168] transition-all placeholder:text-white/10 min-h-[140px]"
                            placeholder="Chill vibes only..."
                        />
                    </div>

                    <div className="flex justify-end gap-4 mt-10">
                        <Button type="button" variant="ghost" onClick={onClose} className="px-6 text-white/60 hover:text-white">
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" size="lg" disabled={isLoading || !name.trim()} className="px-10 rounded-full shadow-lg shadow-[#268168]/20">
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
