import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { Play, TrendingUp } from 'lucide-react';

export default function Hero({ onPlayClick }) {
    return (
        <section className="relative h-[400px] w-full rounded-3xl overflow-hidden mb-12 group">
            {/* Background Image with Gradient Overlay */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center grayscale brightness-[0.3] contrast-[1.2] transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1210] via-[#0a1210]/90 to-[#268168]/20" />

            <div className="relative h-full flex flex-col justify-center px-12 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#268168]/20 border border-[#268168]/30 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 backdrop-blur-md">
                        <TrendingUp size={12} />
                        <span>Trending Now</span>
                    </div>

                    <h1 className="text-6xl font-black text-white mb-4 leading-[1.1] tracking-tighter">
                        Discover the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#268168] to-emerald-300">Rhythm</span> of Your Soul
                    </h1>

                    <p className="text-white/60 text-lg mb-8 max-w-lg font-medium leading-relaxed">
                        Immerse yourself in high-fidelity audio with our next-generation player.
                        Curated playlists and seamless streaming.
                    </p>

                    <div className="flex gap-4">
                        <Button onClick={onPlayClick} size="lg" className="rounded-full px-10 shadow-[0_0_20px_rgba(38,129,104,0.4)]">
                            <Play size={20} className="mr-3 fill-white" />
                            Start Listening
                        </Button>
                        <Link to="/search">
                            <Button variant="outline" size="lg" className="rounded-full px-10 backdrop-blur-md bg-white/5 border-white/10 text-white hover:border-[#268168] hover:bg-[#268168]/10">
                                Explore Genres
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
