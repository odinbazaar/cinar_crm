import React from 'react';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
    light?: boolean;
}

export default function Logo({ className = '', size = 'md', showText = true, light = false }: LogoProps) {
    const sizes = {
        sm: { icon: 'w-6 h-6', text: 'text-xs', gap: 'gap-2' },
        md: { icon: 'w-8 h-8', text: 'text-sm', gap: 'gap-3' },
        lg: { icon: 'w-10 h-10', text: 'text-lg', gap: 'gap-3' },
        xl: { icon: 'w-16 h-16', text: 'text-2xl', gap: 'gap-4' },
    };

    const config = sizes[size];

    return (
        <div className={`flex items-center ${config.gap} ${className}`}>
            <div className={`${config.icon} bg-red-600 rounded flex items-center justify-center shrink-0 shadow-sm`}>
                <span className="text-white font-black italic tracking-tighter" style={{ fontSize: size === 'xl' ? '1.5rem' : '1rem' }}>
                    IAR
                </span>
            </div>
            {showText && (
                <div className="flex flex-col leading-tight">
                    <span className={`font-black tracking-tight ${light ? 'text-white' : 'text-gray-900'} ${config.text}`}>
                        İZMİR AÇIK HAVA
                    </span>
                    <span className={`font-bold tracking-[0.2em] uppercase ${light ? 'text-white/80' : 'text-gray-500'} ${size === 'xl' ? 'text-xs' : 'text-[10px]'}`}>
                        REKLAM
                    </span>
                </div>
            )}
        </div>
    );
}
