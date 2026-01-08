'use client';

import React, { useEffect, useState } from 'react';
import { Target, Zap, Brain, BarChart3, Activity } from 'lucide-react';

interface StatModule {
    icon: React.ReactNode;
    value: string;
    label: string;
    description: string;
    color: 'red' | 'cyan' | 'violet' | 'orange';
}

const stats: StatModule[] = [
    {
        icon: <Target className="w-10 h-10" />,
        value: "98.7%",
        label: "ACCURACY RATE",
        description: "Precision-engineered predictions powered by advanced neural networks.",
        color: 'red'
    },
    {
        icon: <Zap className="w-10 h-10" />,
        value: "2.4s",
        label: "AVG RESPONSE",
        description: "Lightning-fast analysis from query to comprehensive report.",
        color: 'cyan'
    },
    {
        icon: <Brain className="w-10 h-10" />,
        value: "50K+",
        label: "MATCHES ANALYZED",
        description: "Deep learning from the world's largest esports dataset.",
        color: 'violet'
    },
    {
        icon: <BarChart3 className="w-10 h-10" />,
        value: "150+",
        label: "PRO TEAMS TRACKED",
        description: "Real-time monitoring of elite competitive rosters.",
        color: 'orange'
    },
];

const colorSchemes = {
    red: {
        primary: '#ff4655',
        secondary: '#ff1f33',
        gradient: 'linear-gradient(135deg, #ff4655 0%, #ff1f33 50%, #cc0011 100%)',
        glow: 'rgba(255, 70, 85, 0.4)',
        bgGradient: 'linear-gradient(135deg, rgba(255, 70, 85, 0.15) 0%, rgba(204, 0, 17, 0.05) 100%)',
    },
    cyan: {
        primary: '#00f0ff',
        secondary: '#00bcd4',
        gradient: 'linear-gradient(135deg, #00f0ff 0%, #00bcd4 50%, #0088aa 100%)',
        glow: 'rgba(0, 240, 255, 0.4)',
        bgGradient: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(0, 136, 170, 0.05) 100%)',
    },
    violet: {
        primary: '#bd00ff',
        secondary: '#9c27b0',
        gradient: 'linear-gradient(135deg, #bd00ff 0%, #9c27b0 50%, #7b1fa2 100%)',
        glow: 'rgba(189, 0, 255, 0.4)',
        bgGradient: 'linear-gradient(135deg, rgba(189, 0, 255, 0.15) 0%, rgba(123, 31, 162, 0.05) 100%)',
    },
    orange: {
        primary: '#ff9800',
        secondary: '#ff5722',
        gradient: 'linear-gradient(135deg, #ff9800 0%, #ff5722 50%, #e64a19 100%)',
        glow: 'rgba(255, 152, 0, 0.4)',
        bgGradient: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(230, 74, 25, 0.05) 100%)',
    },
};

// Glitch Text Component
function GlitchText({ text }: { text: string }) {
    const [glitchActive, setGlitchActive] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 200);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative inline-block">
            <span className="relative z-10" style={{ fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif" }}>
                {text}
            </span>

            {/* Red Channel */}
            <span
                className={`absolute top-0 left-0 z-0 transition-all duration-100 ${glitchActive ? 'opacity-70' : 'opacity-0'}`}
                style={{
                    fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif",
                    color: '#ff0000',
                    transform: glitchActive ? 'translate(-3px, 0)' : 'translate(0, 0)',
                    clipPath: 'polygon(0 0, 100% 0, 100% 35%, 0 35%)',
                }}
                aria-hidden="true"
            >
                {text}
            </span>

            {/* Cyan Channel */}
            <span
                className={`absolute top-0 left-0 z-0 transition-all duration-100 ${glitchActive ? 'opacity-70' : 'opacity-0'}`}
                style={{
                    fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif",
                    color: '#00ffff',
                    transform: glitchActive ? 'translate(3px, 0)' : 'translate(0, 0)',
                    clipPath: 'polygon(0 65%, 100% 65%, 100% 100%, 0 100%)',
                }}
                aria-hidden="true"
            >
                {text}
            </span>
        </div>
    );
}

export default function StatsSectionHud() {
    return (
        <section className="relative py-32 overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #050508 50%, #0a0a0f 100%)' }}>

            {/* Scanline Overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                }}
            />

            {/* Circuit Board Background */}
            <div className="absolute inset-0 opacity-5">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="circuit-stats" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                            <path d="M 0 100 L 100 100 L 100 0" fill="none" stroke="rgba(0, 240, 255, 0.5)" strokeWidth="1" />
                            <path d="M 150 200 L 150 100 L 200 100" fill="none" stroke="rgba(255, 70, 85, 0.5)" strokeWidth="1" />
                            <circle cx="100" cy="100" r="3" fill="rgba(189, 0, 255, 0.5)" />
                            <circle cx="150" cy="100" r="2" fill="rgba(255, 152, 0, 0.5)" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#circuit-stats)" />
                </svg>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4">

                {/* Glitched Title Section */}
                <div className="text-center mb-20">
                    {/* Tag */}
                    <div className="inline-flex items-center gap-2 mb-6 px-4 py-2" style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
                        <Activity className="w-4 h-4 text-[#00f0ff] animate-pulse" />
                        <span className="text-xs font-mono text-[#00f0ff] tracking-[0.3em] uppercase">LIVE METRICS</span>
                    </div>

                    {/* Main Title */}
                    <h2
                        className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6"
                        style={{ textShadow: '0 0 40px rgba(255, 255, 255, 0.1)' }}
                    >
                        <GlitchText text="TACTICAL" />
                        <br />
                        <span
                            className="bg-clip-text text-transparent"
                            style={{ backgroundImage: 'linear-gradient(90deg, #ff4655, #00f0ff, #bd00ff, #ff9800)' }}
                        >
                            <GlitchText text="DATA FEED" />
                        </span>
                    </h2>

                    {/* Subtitle */}
                    <p className="text-lg text-slate-500 font-mono max-w-2xl mx-auto">
            // Real-time intelligence streaming from our neural analysis core
                    </p>
                </div>

                {/* Stat Panels - Premium Style like Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
                    {stats.map((stat, index) => {
                        const colors = colorSchemes[stat.color];
                        // Different clip-path for each position
                        const clipPaths = [
                            'polygon(0% 0%, 92% 0%, 100% 8%, 100% 100%, 8% 100%, 0% 92%)', // top-left cut
                            'polygon(8% 0%, 100% 0%, 100% 92%, 92% 100%, 0% 100%, 0% 8%)', // top-right cut
                            'polygon(0% 8%, 8% 0%, 100% 0%, 100% 92%, 92% 100%, 0% 100%)', // bottom-left cut
                            'polygon(0% 0%, 92% 0%, 100% 8%, 100% 100%, 8% 100%, 0% 92%)', // symmetric
                        ];

                        return (
                            <div key={index} className="relative group">
                                {/* Outer Glow */}
                                <div
                                    className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl"
                                    style={{ background: colors.glow }}
                                />

                                {/* Main Panel */}
                                <div
                                    className="relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]"
                                    style={{
                                        clipPath: clipPaths[index],
                                        minHeight: '320px',
                                    }}
                                >
                                    {/* Gradient Border */}
                                    <div className="absolute inset-0" style={{ background: colors.gradient }} />

                                    {/* Inner Background */}
                                    <div
                                        className="absolute inset-[2px]"
                                        style={{
                                            background: 'linear-gradient(180deg, rgba(10, 15, 25, 0.98) 0%, rgba(5, 8, 15, 0.99) 100%)',
                                            clipPath: clipPaths[index],
                                        }}
                                    />

                                    {/* Diagonal Light Streak */}
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                        style={{
                                            background: `linear-gradient(135deg, transparent 40%, ${colors.primary}10 50%, transparent 60%)`,
                                        }}
                                    />

                                    {/* Content */}
                                    <div className="relative z-10 p-6 h-full flex flex-col">
                                        {/* Corner Flare */}
                                        <div
                                            className="absolute top-0 right-0 w-20 h-20 opacity-30 group-hover:opacity-60 transition-opacity"
                                            style={{
                                                background: `radial-gradient(circle at 100% 0%, ${colors.primary} 0%, transparent 70%)`,
                                            }}
                                        />

                                        {/* Number Badge */}
                                        <div
                                            className="text-6xl font-black opacity-10 absolute top-2 right-4"
                                            style={{ fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif", color: colors.primary }}
                                        >
                                            0{index + 1}
                                        </div>

                                        {/* Icon Container */}
                                        <div
                                            className="w-16 h-16 mb-6 flex items-center justify-center relative"
                                            style={{
                                                background: colors.bgGradient,
                                                clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
                                            }}
                                        >
                                            <div
                                                className="absolute inset-0 animate-pulse opacity-50"
                                                style={{
                                                    background: colors.gradient,
                                                    clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
                                                    filter: 'blur(8px)',
                                                }}
                                            />
                                            <div style={{ color: colors.primary, filter: `drop-shadow(0 0 12px ${colors.primary})` }}>
                                                {stat.icon}
                                            </div>
                                        </div>

                                        {/* Value - Large and Glowing */}
                                        <div
                                            className="text-5xl lg:text-6xl font-black mb-2"
                                            style={{
                                                fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif",
                                                color: colors.primary,
                                                textShadow: `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}`,
                                            }}
                                        >
                                            {stat.value}
                                        </div>

                                        {/* Label */}
                                        <div
                                            className="text-sm font-black tracking-[0.15em] uppercase mb-3"
                                            style={{
                                                fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif",
                                                color: colors.primary,
                                            }}
                                        >
                                            {stat.label}
                                        </div>

                                        {/* Description */}
                                        <p className="text-slate-500 font-mono text-xs leading-relaxed flex-grow">
                                            {stat.description}
                                        </p>

                                        {/* Bottom Accent Line */}
                                        <div className="mt-4 flex items-center gap-3">
                                            <div
                                                className="flex-1 h-0.5"
                                                style={{ background: `linear-gradient(90deg, ${colors.primary}, transparent)` }}
                                            />
                                            <div
                                                className="w-2.5 h-2.5 animate-pulse"
                                                style={{
                                                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                                                    background: colors.primary,
                                                    boxShadow: `0 0 10px ${colors.primary}`
                                                }}
                                            />
                                        </div>

                                        {/* Status Bar */}
                                        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-600 uppercase tracking-wider">
                                            <span>STREAM ACTIVE</span>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                                                    style={{ background: colors.primary, boxShadow: `0 0 6px ${colors.primary}` }}
                                                />
                                                <span style={{ color: colors.primary }}>LIVE</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Energy Conduit Line */}
                <div className="mt-16 relative">
                    <div
                        className="h-1 max-w-2xl mx-auto"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255,70,85,0.5), rgba(0,240,255,0.5), rgba(189,0,255,0.5), rgba(255,152,0,0.5), transparent)',
                            boxShadow: '0 0 20px rgba(0,240,255,0.3)'
                        }}
                    />
                    <div
                        className="w-4 h-4 mx-auto -mt-2"
                        style={{
                            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                            background: 'linear-gradient(135deg, #ff4655, #00f0ff)',
                            boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)'
                        }}
                    />
                </div>
            </div>

            {/* Ambient Glows */}
            <div
                className="absolute top-1/4 -left-32 w-64 h-64 rounded-full blur-[100px] opacity-20 animate-pulse"
                style={{ background: 'radial-gradient(circle, #ff4655, transparent)' }}
            />
            <div
                className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full blur-[100px] opacity-20 animate-pulse"
                style={{ background: 'radial-gradient(circle, #00f0ff, transparent)' }}
            />
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[150px] opacity-10"
                style={{ background: 'radial-gradient(circle, #bd00ff, transparent)' }}
            />
        </section>
    );
}
