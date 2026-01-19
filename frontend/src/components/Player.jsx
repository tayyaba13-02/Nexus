import React, { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { usePlayerStore } from '../store/usePlayerStore';
import { API_URL } from '../config';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Heart, ListMusic, Maximize2, Minimize2, ChevronDown, List, Trash2, Layout, MoreHorizontal, User, Wand2, Shuffle, Square, Rewind, FastForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';

export default function Player() {
    const {
        currentSong,
        isPlaying,
        togglePlay,
        volume,
        setVolume,
        stop,
        playNext,
        playPrevious
    } = usePlayerStore();

    const soundRef = useRef(null);

    // Dynamic Theme State
    const [theme, setTheme] = useState({ from: '#1e1b4b', to: '#020617', accent: '#6366f1' });

    useEffect(() => {
        if (currentSong?._id || currentSong?.id) {
            import('../utils/theme').then(({ generateGradient }) => {
                const colors = generateGradient(currentSong._id || currentSong.id);
                // Clamp accent to emerald if it wanders too far
                setTheme({
                    from: '#061914',
                    to: '#0d3128',
                    accent: '#268168'
                });
            });
        }
    }, [currentSong]);

    useEffect(() => {
        if (currentSong) {
            if (soundRef.current) {
                soundRef.current.unload();
            }

            let songUrl = currentSong.url;
            if (songUrl && !songUrl.startsWith('http')) {
                songUrl = `${API_URL}${songUrl}`;
            }

            if (!songUrl) {
                console.error("Invalid song URL:", currentSong);
                return;
            }

            // Determine format from original_filename
            const extension = currentSong.original_filename?.split('.').pop()?.toLowerCase();
            const formatHint = extension ? [extension] : [];

            try {
                soundRef.current = new Howl({
                    src: [songUrl],
                    format: formatHint,
                    html5: true, // Use HTML5 Audio for streaming large files
                    volume: volume,
                    onend: () => {
                        playNext(); // Auto-play next song
                    },
                    onload: () => {
                        setDuration(soundRef.current.duration());
                    },
                    onloaderror: (id, error) => {
                        console.error("Error loading song:", error);
                    }
                });
            } catch (error) {
                console.error("Error initializing player:", error);
            }

            if (isPlaying) {
                soundRef.current?.play();
            }

            // Set initial duration from metadata if available
            setDuration(currentSong.duration || 0);
            setSeek(0);
        }
    }, [currentSong]);

    useEffect(() => {
        if (soundRef.current) {
            if (isPlaying) {
                soundRef.current.play();
            } else {
                soundRef.current.pause();
            }
        }
    }, [isPlaying]);

    useEffect(() => {
        if (soundRef.current) {
            // Howler volume is 0.0 to 1.0.
            // Ensure state volume update reflects in Howler
            soundRef.current.volume(volume);
        }
    }, [volume]);

    const handleStop = () => {
        if (soundRef.current) {
            soundRef.current.stop();
        }
        stop();
    };

    const handleSeek = (seconds) => {
        if (soundRef.current) {
            const currentSeek = soundRef.current.seek();
            soundRef.current.seek(currentSeek + seconds);
        }
    };

    const [seek, setSeek] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        let interval;
        if (isPlaying && soundRef.current) {
            interval = setInterval(() => {
                const currentSeek = soundRef.current.seek();
                if (typeof currentSeek === 'number') {
                    setSeek(currentSeek);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    useEffect(() => {
        if (currentSong && soundRef.current) {
            // Check duration again just in case
            const updateDuration = () => {
                const howlDuration = soundRef.current.duration();
                if (howlDuration > 0) {
                    setDuration(howlDuration);
                }
            };

            if (soundRef.current.state() === 'loaded') {
                updateDuration();
            } else {
                soundRef.current.once('load', updateDuration);
            }
        }
    }, [currentSong]);

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleProgressBarClick = (e) => {
        if (!soundRef.current || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const clickedPercent = x / rect.width;
        const newSeek = clickedPercent * duration;
        setSeek(newSeek);
        soundRef.current.seek(newSeek);
    };

    const handleVolumeBarClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newVolume = Math.max(0, Math.min(1, x / rect.width));
        setVolume(newVolume);
    };

    return (
        <AnimatePresence>
            {currentSong && (
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    exit={{ y: 100 }}
                    className="fixed bottom-0 left-0 right-0 h-20 md:h-24 bg-[#0a1210]/95 backdrop-blur-xl border-t border-[#268168]/10 flex flex-col md:flex-row items-center px-4 md:px-8 justify-between z-50 shadow-2xl overflow-hidden"
                >
                    {/* Progress Bar (Full width on mobile top, integrated on desktop) */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 md:hidden cursor-pointer group" onClick={handleProgressBarClick}>
                        <div
                            className="absolute inset-y-0 left-0 bg-[#268168] shadow-[0_0_10px_rgba(38,129,104,0.5)] transition-all"
                            style={{ width: `${(seek / (duration || 1)) * 100}%` }}
                        />
                    </div>

                    {/* Dynamic Ambient Glow */}
                    <div
                        className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-1000"
                        style={{ background: `linear-gradient(to right, #061914, #26816830, #061914)` }}
                    />

                    {/* Song Info */}
                    <div className="w-full md:w-1/3 flex items-center gap-3 md:gap-4 relative z-10 py-2 md:py-0">
                        <div className="w-10 h-10 md:w-16 md:h-16 rounded-lg shadow-lg flex items-center justify-center relative overflow-hidden group flex-shrink-0">
                            <div
                                className="absolute inset-0 transition-colors duration-1000"
                                style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.accent})` }}
                            />
                            <span className="text-xl md:text-3xl relative z-10 transition-transform duration-300 group-hover:scale-110">🎵</span>
                        </div>
                        <div className="overflow-hidden flex-1">
                            <h3 className="text-white font-bold truncate text-sm md:text-lg pr-4 tracking-tight">{currentSong.title || currentSong.filename}</h3>
                            <p className="text-emerald-100/60 text-[10px] md:text-sm truncate font-medium uppercase tracking-wider">{currentSong.artist || 'Unknown Artist'}</p>
                        </div>
                        {/* Mobile Play/Pause toggle right in the info bar for quick access */}
                        <div className="md:hidden">
                            <Button
                                variant="primary"
                                size="sm"
                                className="w-10 h-10 rounded-full bg-[#268168] shadow-lg shadow-[#268168]/20"
                                onClick={togglePlay}
                            >
                                {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" className="translate-x-0.5" />}
                            </Button>
                        </div>
                    </div>

                    {/* Desktop Controls (Hidden on Mobile) */}
                    <div className="hidden md:flex w-1/3 flex-col items-center gap-2 relative z-10">
                        <div className="flex flex-col gap-1 w-full max-w-2xl px-8">
                            <div className="flex items-center justify-center gap-6 mb-2">
                                <button
                                    onClick={() => handleSeek(-10)}
                                    className="text-emerald-900/40 hover:text-[#268168] transition-all"
                                    title="-10s"
                                >
                                    <Rewind size={20} />
                                </button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-emerald-900/40 hover:text-[#268168] transition-all"
                                    onClick={playPrevious}
                                >
                                    <SkipBack size={24} fill="currentColor" />
                                </Button>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="w-14 h-14 rounded-full bg-[#268168] hover:bg-emerald-600 shadow-xl shadow-[#268168]/30 transition-all hover:scale-110 active:scale-95 border-0"
                                    onClick={togglePlay}
                                >
                                    {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} className="translate-x-1" fill="white" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-emerald-900/40 hover:text-[#268168] transition-all"
                                    onClick={playNext}
                                >
                                    <SkipForward size={24} fill="currentColor" />
                                </Button>
                                <button
                                    onClick={() => handleSeek(10)}
                                    className="text-emerald-900/40 hover:text-[#268168] transition-all"
                                    title="+10s"
                                >
                                    <FastForward size={20} />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 group">
                                <span className="text-[10px] font-mono text-white/50 w-10 text-right">
                                    {formatTime(seek)}
                                </span>
                                <div className="relative flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden cursor-pointer" onClick={handleProgressBarClick}>
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#268168] to-emerald-400 group-hover:from-emerald-400 group-hover:to-emerald-300 transition-all shadow-[0_0_10px_rgba(38,129,104,0.5)]"
                                        style={{ width: `${(seek / (duration || 1)) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-mono text-white/50 w-10">
                                    {formatTime(duration)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Volume & Mobile Secondary Controls */}
                    <div className="w-1/3 hidden md:flex items-center justify-end gap-3 group relative z-10">
                        <div className="flex items-center gap-4 w-48 justify-end">
                            <Volume2 size={18} className="text-white/40 group-hover:text-[#268168] transition-colors" />
                            <div className="relative w-24 h-1.5 bg-white/5 rounded-full overflow-hidden group cursor-pointer" onClick={handleVolumeBarClick}>
                                <div
                                    className="absolute inset-y-0 left-0 bg-[#268168] group-hover:bg-emerald-400 transition-all"
                                    style={{ width: `${volume * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
