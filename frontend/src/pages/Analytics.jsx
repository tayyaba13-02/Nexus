import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Music, Clock, PlayCircle, Award, Calendar } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

import { API_URL } from '../config';

export default function Analytics() {
    const { userId } = usePlayerStore();
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/analytics/stats`, {
                    headers: { 'X-User-ID': userId }
                });
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) { // Only fetch if userId is available
            fetchStats();
        } else {
            setIsLoading(false); // If no userId, stop loading and show empty state or error
        }
    }, [userId]); // Re-run effect if userId changes

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-[#268168] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const COLORS = ['#268168', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

    return (
        <div className="space-y-6 md:space-y-8 pb-12 px-4 md:px-0">
            <div>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tighter">Listening Analytics</h1>
                <p className="text-emerald-100/60 text-xs md:text-sm font-bold uppercase tracking-widest opacity-80">Your musical journey in numbers.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-[#0d1a17]/40 border border-[#268168]/10 p-5 md:p-8 rounded-2xl md:rounded-[2rem] backdrop-blur-sm shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#268168]/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-[#268168]/20 rounded-xl md:rounded-2xl flex items-center justify-center text-[#268168] shadow-inner">
                            <PlayCircle size={24} className="md:w-7 md:h-7" />
                        </div>
                        <div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-0.5 md:mb-1">Total Plays</p>
                            <h3 className="text-xl md:text-3xl font-black text-white">{stats?.total_plays || 0}</h3>
                        </div>
                    </div>
                    <div className="h-1 bg-[#0a1210] rounded-full overflow-hidden">
                        <div className="h-full bg-brand-gradient w-2/3 shadow-[0_0_10px_rgba(38,129,104,0.3)]"></div>
                    </div>
                </div>

                <div className="bg-[#0d1a17]/40 border border-[#268168]/10 p-5 md:p-8 rounded-2xl md:rounded-[2rem] backdrop-blur-sm shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-teal-500/20 rounded-xl md:rounded-2xl flex items-center justify-center text-teal-400 shadow-inner">
                            <Music size={24} className="md:w-7 md:h-7" />
                        </div>
                        <div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-0.5 md:mb-1">Active Tracks</p>
                            <h3 className="text-xl md:text-3xl font-black text-white">{stats?.top_songs.length || 0}</h3>
                        </div>
                    </div>
                    <div className="h-1 bg-[#0a1210] rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 w-1/3 shadow-[0_0_10px_rgba(20,184,166,0.3)]"></div>
                    </div>
                </div>

                <div className="bg-[#0d1a17]/40 border border-[#268168]/10 p-5 md:p-8 rounded-2xl md:rounded-[2rem] backdrop-blur-sm shadow-xl overflow-hidden relative group sm:col-span-2 md:col-span-1">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-emerald-500/20 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner">
                            <TrendingUp size={24} className="md:w-7 md:h-7" />
                        </div>
                        <div className="min-w-0 pr-2">
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-0.5 md:mb-1">Top Artist</p>
                            <h3 className="text-xl md:text-3xl font-black text-white truncate">
                                {stats?.top_songs[0]?.artist || 'N/A'}
                            </h3>
                        </div>
                    </div>
                    <div className="h-1 bg-[#0a1210] rounded-full overflow-hidden">
                        <div className="h-full bg-[#268168] w-1/2 shadow-[0_0_10px_rgba(38,129,104,0.3)]"></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Daily Activity Chart */}
                <div className="bg-[#0d1a17]/40 border border-[#268168]/10 p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] backdrop-blur-sm shadow-xl">
                    <div className="flex items-center gap-3 mb-6 md:mb-10">
                        <div className="p-2 bg-[#268168]/10 rounded-xl">
                            <Calendar size={18} className="text-[#268168] md:w-6 md:h-6" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Daily Activity</h2>
                    </div>
                    <div className="h-[250px] md:h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.daily_activity}>
                                <defs>
                                    <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#268168" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#268168" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#268168" strokeOpacity={0.1} vertical={false} />
                                <XAxis dataKey="name" stroke="#34d399" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 800 }} />
                                <YAxis stroke="#34d399" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 800 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0a1210', border: '1px solid #26816820', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontSize: '10px' }}
                                    itemStyle={{ color: '#268168', fontWeight: 800 }}
                                />
                                <Area type="monotone" dataKey="plays" stroke="#268168" strokeWidth={2} fillOpacity={1} fill="url(#colorPlays)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Songs Chart */}
                <div className="bg-[#0d1a17]/40 border border-[#268168]/10 p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] backdrop-blur-sm shadow-xl">
                    <div className="flex items-center gap-3 mb-6 md:mb-10">
                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                            <Award size={18} className="text-emerald-400 md:w-6 md:h-6" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Most Played</h2>
                    </div>
                    <div className="h-[250px] md:h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.top_songs} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#268168" strokeOpacity={0.05} horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="filename"
                                    type="category"
                                    stroke="#34d399"
                                    width={80}
                                    tick={{ fontSize: 8, fontWeight: 800 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#26816810' }}
                                    contentStyle={{ backgroundColor: '#0a1210', border: '1px solid #26816820', borderRadius: '12px', fontSize: '10px' }}
                                />
                                <Bar dataKey="plays" radius={[0, 4, 4, 0]}>
                                    {stats?.top_songs.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top List Table */}
            <div className="bg-[#0d1a17]/40 border border-[#268168]/10 rounded-2xl md:rounded-[2.5rem] backdrop-blur-sm shadow-xl overflow-hidden">
                <div className="p-5 md:p-8 border-b border-[#268168]/5 bg-[#0a1210]/40">
                    <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                        <div className="p-2 bg-teal-500/10 rounded-xl">
                            <TrendingUp size={18} className="text-teal-400 md:w-6 md:h-6" />
                        </div>
                        Rankings
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[500px]">
                        <thead>
                            <tr className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] border-b border-[#268168]/5">
                                <th className="px-6 md:px-10 py-4 md:py-6">#</th>
                                <th className="px-6 md:px-10 py-4 md:py-6">Song</th>
                                <th className="px-6 md:px-10 py-4 md:py-6">Artist</th>
                                <th className="px-6 md:px-10 py-4 md:py-6 text-right">Plays</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#268168]/5">
                            {stats?.top_songs.map((song, index) => (
                                <tr key={song.id || index} className="group hover:bg-[#268168]/5 transition-all">
                                    <td className="px-6 md:px-10 py-4 md:py-5 text-white/20 font-black font-mono text-[10px] md:text-xs">{index + 1}</td>
                                    <td className="px-6 md:px-10 py-4 md:py-5 font-bold text-sm md:text-base text-white group-hover:text-[#268168] transition-colors truncate max-w-[150px] md:max-w-none">{song.filename}</td>
                                    <td className="px-6 md:px-10 py-4 md:py-5 text-emerald-100/60 font-bold text-xs md:text-sm">{song.artist || 'Unknown'}</td>
                                    <td className="px-6 md:px-10 py-4 md:py-5 text-right font-black text-[#268168] text-sm md:text-base">{song.plays}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
