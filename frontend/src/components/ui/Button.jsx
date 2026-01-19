import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    className,
    ...props
}) {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#268168] disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-[#268168] hover:bg-emerald-600 text-white shadow-xl shadow-[#268168]/20 border-b-4 border-emerald-900 active:border-b-0 active:translate-y-[2px]",
        secondary: "bg-[#111d1a] hover:bg-emerald-900/40 text-emerald-100 border border-[#268168]/20",
        ghost: "bg-transparent hover:bg-[#268168]/10 text-emerald-900/60 hover:text-[#268168]",
        outline: "bg-transparent border border-[#268168]/20 text-emerald-100 hover:border-[#268168] hover:bg-[#268168]/5"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg"
    };

    return (
        <button
            className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
            {...props}
        >
            {children}
        </button>
    );
}
