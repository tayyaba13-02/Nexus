import React from 'react';
import { motion } from 'framer-motion';

const MOODS = [
    { name: 'Happy', emoji: '😊', color: '#FFD700' },
    { name: 'Sad', emoji: '😢', color: '#4A90E2' },
    { name: 'Energetic', emoji: '⚡', color: '#FF6B6B' },
    { name: 'Chill', emoji: '😌', color: '#268168' },
    { name: 'Romantic', emoji: '💕', color: '#FF69B4' },
    { name: 'Angry', emoji: '😤', color: '#E74C3C' },
    { name: 'Focused', emoji: '🎯', color: '#9B59B6' },
    { name: 'Party', emoji: '🎉', color: '#F39C12' }
];

export default function MoodSelector({ selectedMoods = [], onMoodToggle, compact = false }) {
    return (
        <div className={`flex flex-wrap gap-2 ${compact ? 'gap-1.5' : 'gap-2'}`}>
            {MOODS.map((mood) => {
                const isSelected = selectedMoods.includes(mood.name);

                return (
                    <motion.button
                        key={mood.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onMoodToggle(mood.name)}
                        className={`
                            ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'}
                            rounded-full font-bold transition-all
                            flex items-center gap-1.5
                            ${isSelected
                                ? 'bg-[#268168] text-white shadow-lg shadow-[#268168]/30'
                                : 'bg-[#111d1a] text-white/60 hover:text-white border border-[#268168]/20 hover:border-[#268168]/40'
                            }
                        `}
                        style={isSelected ? { backgroundColor: mood.color, borderColor: mood.color } : {}}
                    >
                        <span className={compact ? 'text-sm' : 'text-base'}>{mood.emoji}</span>
                        <span className="tracking-wide">{mood.name}</span>
                    </motion.button>
                );
            })}
        </div>
    );
}

export { MOODS };
