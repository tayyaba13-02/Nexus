export const generateGradient = (id) => {
    if (!id) return { from: '#061914', to: '#0a1210', accent: '#268168' };

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate HSL colors constrained to Emerald/Teal spectrum (140-180)
    const hue = 140 + (Math.abs(hash) % 40);
    const hue2 = 140 + ((Math.abs(hash) + 20) % 40);

    return {
        from: `hsl(${hue}, 60%, 10%)`,
        to: `hsl(${hue}, 80%, 5%)`,
        accent: `hsl(${hue2}, 70%, 40%)`
    };
};
