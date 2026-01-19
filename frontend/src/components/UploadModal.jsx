import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Button } from './ui/Button';
import { X, Upload } from 'lucide-react';
import MoodSelector from './MoodSelector';
import axios from 'axios';
import { usePlayerStore } from '../store/usePlayerStore';
import { API_URL } from '../config';

export default function UploadModal({ isOpen, onClose, onSuccess }) {
    const [selectedMoods, setSelectedMoods] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { userId, setSongs } = usePlayerStore();

    if (!isOpen) return null;

    const handleMoodToggle = (mood) => {
        setSelectedMoods(prev =>
            prev.includes(mood)
                ? prev.filter(m => m !== mood)
                : [...prev, mood]
        );
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('moods', selectedMoods.join(','));

        try {
            await axios.post(`${API_URL}/api/songs/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-User-ID': userId
                },
            });

            // Refresh songs list
            const songsRes = await axios.get(`${API_URL}/api/songs/`, {
                headers: { 'X-User-ID': userId }
            });
            setSongs(songsRes.data);

            setSelectedMoods([]);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Failed to upload song. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-[#0a1210]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-[#111d1a] border border-[#268168]/20 rounded-[2rem] w-full max-w-lg p-6 md:p-8 shadow-2xl relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#268168]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-emerald-900/40 hover:text-[#268168] transition-colors z-10"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-2 text-white">Upload Song</h2>
                <p className="text-emerald-100/60 text-sm mb-6">Choose moods that match your song's vibe</p>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-[#268168] uppercase tracking-widest mb-3">
                            Select Moods (Optional)
                        </label>
                        <MoodSelector
                            selectedMoods={selectedMoods}
                            onMoodToggle={handleMoodToggle}
                        />
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="audio/*"
                        className="hidden"
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isUploading}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            <Upload size={18} className="mr-2" />
                            {isUploading ? 'Uploading...' : 'Choose File'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
