import React, { useState } from 'react';
import { Button } from './ui/Button';
import axios from 'axios';
import { usePlayerStore } from '../store/usePlayerStore';
import { X } from 'lucide-react';

import { API_URL } from '../config';

export default function PlaylistModal({ isOpen, onClose, onAction, userId }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            await axios.post(`${API_URL}/api/playlists`,
                { name, description },
                { headers: { 'X-User-ID': userId } }
            );
            // Don't call onAction - let parent refetch to avoid duplicates
            setName('');
            setDescription('');
            onClose();
        } catch (error) {
            console.error("Failed to create playlist:", error);
            alert("Failed to create playlist. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0a1210]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#111d1a] border border-[#268168]/20 rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#268168]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-emerald-900/40 hover:text-[#268168] transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-white">Create Playlist</h2>

                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-[#268168] uppercase tracking-widest mb-3">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#0a1210] border border-[#268168]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#268168] focus:ring-1 focus:ring-[#268168] transition-all placeholder:text-white/20"
                            placeholder="My Awesome Playlist"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-[#268168] uppercase tracking-widest mb-3">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#0a1210] border border-[#268168]/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#268168] focus:ring-1 focus:ring-[#268168] transition-all placeholder:text-white/20 min-h-[120px]"
                            placeholder="Chill vibes only..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={isLoading || !name.trim()}>
                            {isLoading ? 'Creating...' : 'Create Playlist'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
