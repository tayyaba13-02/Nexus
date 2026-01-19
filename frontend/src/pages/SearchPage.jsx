import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { usePlayerStore } from '../store/usePlayerStore';
import { Play, Pause, Music, Heart, ListMusic, Search, Ghost, Youtube, Download, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import MoodSelector from '../components/MoodSelector';

import { API_URL } from '../config';

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState({ songs: [], playlists: [] });
    const [externalResults, setExternalResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [importingId, setImportingId] = useState(null);
    const [importedSong, setImportedSong] = useState(null);
    const [selectedMoods, setSelectedMoods] = useState([]);
    const [showMoodSelector, setShowMoodSelector] = useState(false);
    const [pendingImport, setPendingImport] = useState(null);
    const { setCurrentSong, currentSong, isPlaying, togglePlay, likedSongs, toggleLike, songs, setSongs } = usePlayerStore();

    useEffect(() => {
        if (query) {
            performSearch();
        }
    }, [query]);

    const performSearch = async () => {
        setIsLoading(true);
        try {
            // Local search
            const localRes = await axios.get(`${API_URL}/api/search/?query=${encodeURIComponent(query)}`);
            setResults(localRes.data);

            // External search (YouTube)
            const externalRes = await axios.get(`${API_URL}/api/external/search?q=${encodeURIComponent(query)}`);
            setExternalResults(externalRes.data.results);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImport = async (video, moods = []) => {
        setImportingId(video.id);
        try {
            const moodsParam = moods.length > 0 ? `&moods=${moods.join(',')}` : '';
            const res = await axios.post(`${API_URL}/api/external/import?video_url=${video.link}${moodsParam}`, {}, {
                headers: { 'X-User-ID': usePlayerStore.getState().userId }
            });
            setImportedSong(res.data);
            // Add to global state
            setSongs([res.data, ...songs]);

            // Clear message after 3s
            setTimeout(() => setImportedSong(null), 3000);
        } catch (err) {
            console.error("Import failed:", err);
            alert("Failed to import song. Please try again.");
        } finally {
            setImportingId(null);
            setShowMoodSelector(false);
            setSelectedMoods([]);
            setPendingImport(null);
        }
    };

    const handleMoodToggle = (mood) => {
        setSelectedMoods(prev =>
            prev.includes(mood)
                ? prev.filter(m => m !== mood)
                : [...prev, mood]
        );
    };

    const startImport = (video) => {
        setPendingImport(video);
        setShowMoodSelector(true);
    };

    const confirmImport = () => {
        if (pendingImport) {
            handleImport(pendingImport, selectedMoods);
        }
    };

    const playSong = (song) => {
        const fullUrl = song.url.startsWith('http') ? song.url : `${API_URL}${song.url}`;
        setCurrentSong({ ...song, url: fullUrl });
    };

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="bg-gradient-to-r from-[#111d1a] to-transparent p-6 md:p-8 rounded-2xl md:rounded-[2rem] border border-[#268168]/10">
                <h1 className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tighter flex items-center gap-3 md:gap-4">
                    <Search className="text-[#268168]" size={24} />
                    Search for "{query}"
                </h1>
                <p className="text-emerald-100/60 text-xs md:text-sm font-medium">Found results across your library and global sources.</p>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                    <div className="w-12 h-12 border-4 border-[#268168] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-emerald-100/40 font-bold uppercase tracking-widest text-xs animate-pulse">Scanning the airwaves...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Local Results */}
                    <div className="lg:col-span-8 space-y-8 md:space-y-12">
                        {results.songs.length > 0 && (
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-white mb-4 md:mb-6 flex items-center gap-3 tracking-tight">
                                    <div className="p-2 bg-[#268168]/10 rounded-xl">
                                        <Music size={18} className="text-[#268168]" />
                                    </div>
                                    Library Results
                                </h2>
                                <div className="divide-y divide-[#268168]/5 bg-[#0d1a17]/40 rounded-2xl md:rounded-[2.5rem] border border-[#268168]/10 overflow-hidden backdrop-blur-sm shadow-xl">
                                    {results.songs.map((song, index) => {
                                        const isCurrentSong = currentSong && (currentSong._id || currentSong.id) === (song._id || song.id);

                                        return (
                                            <div
                                                key={song._id || song.id}
                                                className={`group p-4 md:p-5 flex items-center justify-between transition-all cursor-pointer hover:bg-[#268168]/5 ${isCurrentSong ? 'bg-[#268168]/10' : ''}`}
                                                onClick={() => isCurrentSong && isPlaying ? togglePlay() : playSong(song)}
                                            >
                                                <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
                                                    <div className="w-10 h-10 md:w-14 md:h-14 bg-[#111d1a] rounded-xl md:rounded-2xl flex items-center justify-center text-[#268168] shadow-inner relative group/icon overflow-hidden flex-shrink-0">
                                                        {isCurrentSong && isPlaying ? (
                                                            <div className="flex items-end gap-0.5 h-3 md:h-4">
                                                                <div className="w-0.5 md:w-1 bg-[#268168] animate-[music-bar_0.6s_ease-in-out_infinite]"></div>
                                                                <div className="w-0.5 md:w-1 bg-[#268168] animate-[music-bar_0.8s_ease-in-out_infinite]"></div>
                                                                <div className="w-0.5 md:w-1 bg-[#268168] animate-[music-bar_0.5s_ease-in-out_infinite]"></div>
                                                            </div>
                                                        ) : (
                                                            <Music size={20} className="group-hover/icon:scale-110 transition-transform md:w-6 md:h-6" />
                                                        )}
                                                        <div className="absolute inset-0 bg-[#268168] flex items-center justify-center opacity-0 group-hover/icon:opacity-100 transition-opacity">
                                                            {isCurrentSong && isPlaying ? <Pause size={20} fill="white" className="md:w-6 md:h-6" /> : <Play size={20} fill="white" className="md:w-6 md:h-6" />}
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className={`font-bold text-sm md:text-lg transition-colors truncate ${isCurrentSong ? 'text-[#268168]' : 'text-white group-hover:text-[#268168]'}`}>{song.filename}</h4>
                                                        <p className="text-[10px] text-emerald-100/40 font-black uppercase tracking-widest truncate">{song.artist || 'Unknown Artist'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`p-2 rounded-full hover:bg-[#268168]/20 transition-all ${likedSongs.some(s => (s._id || s.id) === (song._id || song.id)) ? 'text-[#268168]' : 'text-white/20 hover:text-white'}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleLike(song);
                                                        }}
                                                    >
                                                        <Heart size={16} fill={likedSongs.some(s => (s._id || s.id) === (song._id || song.id)) ? "currentColor" : "none"} className="md:w-[18px] md:h-[18px]" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {results.playlists.length > 0 && (
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-white mb-4 md:mb-6 flex items-center gap-3 tracking-tight">
                                    <div className="p-2 bg-teal-500/10 rounded-xl">
                                        <ListMusic size={18} className="text-teal-400" />
                                    </div>
                                    Playlists
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {results.playlists.map(playlist => (
                                        <Link to={`/playlist/${playlist._id || playlist.id}`} key={playlist._id || playlist.id}>
                                            <div className="bg-[#0d1a17]/40 hover:bg-[#268168]/5 border border-[#268168]/10 hover:border-[#268168]/40 p-4 md:p-6 rounded-2xl md:rounded-[2rem] group transition-all duration-500 h-full flex flex-col backdrop-blur-sm relative overflow-hidden shadow-lg">
                                                <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-[#268168]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                                <div className="w-10 h-10 md:w-14 md:h-14 bg-[#268168]/10 rounded-xl md:rounded-2xl flex items-center justify-center text-[#268168] mb-4 md:mb-6 group-hover:bg-[#268168] group-hover:text-white transition-all duration-500 shadow-inner">
                                                    <ListMusic size={20} className="md:w-7 md:h-7" />
                                                </div>
                                                <h3 className="font-bold text-white text-sm md:text-lg mb-1 md:mb-2 tracking-tight group-hover:text-[#268168] transition-colors line-clamp-1">{playlist.name}</h3>
                                                <p className="text-emerald-100/40 text-[10px] md:text-xs font-bold uppercase tracking-widest">{playlist.songs?.length || 0} tracks</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* External Results */}
                    <div className="lg:col-span-4 space-y-6 md:space-y-8">
                        <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                            <div className="p-2 bg-red-500/10 rounded-xl">
                                <Youtube size={18} className="text-red-500" />
                            </div>
                            Global Search
                        </h2>
                        <div className="space-y-4">
                            {externalResults.map((video) => (
                                <div
                                    key={video.id}
                                    className="bg-[#0d1a17]/40 border border-[#268168]/10 p-4 rounded-3xl hover:border-[#268168]/40 transition-all group relative overflow-hidden flex flex-col"
                                >
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-24 h-16 bg-[#111d1a] rounded-lg overflow-hidden flex-shrink-0 relative">
                                            <img src={video.thumbnails[0].url} alt={video.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[8px] font-bold text-white uppercase tracking-widest">{video.duration}</div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-bold text-sm text-white line-clamp-2 leading-tight group-hover:text-[#268168] transition-colors">{video.title}</h4>
                                            <p className="text-[10px] text-emerald-100/40 font-black uppercase tracking-[0.1em] mt-1">{video.channel}</p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => startImport(video)}
                                        disabled={importingId === video.id}
                                        className={`w-full text-[10px] font-black uppercase tracking-widest h-10 ${importingId === video.id ? 'bg-[#268168] text-white animate-pulse' : 'bg-[#268168]/10 text-[#268168] hover:bg-[#268168] hover:text-white'
                                            }`}
                                    >
                                        {importingId === video.id ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 size={12} className="animate-spin" />
                                                Importing...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Download size={12} />
                                                Import to Library
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && results.songs.length === 0 && results.playlists.length === 0 && externalResults.length === 0 && (
                <div className="text-center py-32 bg-[#0d1a17]/40 rounded-[3rem] border border-[#268168]/10 backdrop-blur-sm">
                    <div className="w-24 h-24 bg-[#268168]/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Ghost size={48} className="text-[#268168]/40" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Zero matches found</h3>
                    <p className="text-emerald-100/40 font-bold uppercase tracking-widest text-xs">Try broader keywords or check your spelling</p>
                </div>
            )}
            {/* Import Success Notification */}
            <AnimatePresence>
                {importedSong && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[60] bg-[#0d1a17] border border-[#268168] px-6 py-4 rounded-2xl shadow-[0_0_50px_rgba(38,129,104,0.3)] flex items-center gap-4 min-w-[320px] backdrop-blur-xl"
                    >
                        <div className="w-12 h-12 bg-[#268168] rounded-xl flex items-center justify-center shadow-lg shadow-[#268168]/20">
                            <Sparkles className="text-white" size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-2">
                                <CheckCircle size={14} className="text-emerald-400" />
                                Imported Successfully
                            </h4>
                            <p className="text-emerald-100/60 text-xs font-medium line-clamp-1 mt-0.5">{importedSong.filename || importedSong.title || 'Song added to library'}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mood Selector Modal */}
            {showMoodSelector && (
                <div className="fixed inset-0 bg-[#0a1210]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#111d1a] border border-[#268168]/20 rounded-[2rem] w-full max-w-lg p-8 shadow-2xl relative"
                    >
                        <h3 className="text-2xl font-bold mb-2 text-white">Select Moods</h3>
                        <p className="text-emerald-100/60 text-sm mb-6">Choose moods that match this song's vibe (optional)</p>

                        <MoodSelector
                            selectedMoods={selectedMoods}
                            onMoodToggle={handleMoodToggle}
                        />

                        <div className="flex justify-end gap-3 mt-8">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setShowMoodSelector(false);
                                    setPendingImport(null);
                                    setSelectedMoods([]);
                                }}
                                disabled={importingId !== null}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={confirmImport}
                                disabled={importingId !== null}
                            >
                                {importingId !== null ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} className="mr-2" />
                                        Import Song
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
