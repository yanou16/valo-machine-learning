'use client';

import React, { useEffect, useState } from 'react';
import { Crosshair, Brain, Zap } from 'lucide-react';

interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: 'violet' | 'red' | 'cyan';
}

const features: Feature[] = [
    {
        icon: <Crosshair className="w-10 h-10" />,
        title: "PREDICTIVE TARGETING",
        description: "ML-powered aim analysis and pattern recognition across thousands of pro matches.",
        color: 'violet',
    },
    {
        icon: <Brain className="w-10 h-10" />,
        title: "NEURAL STRATEGY",
        description: "Deep learning models that decode team compositions and tactical preferences.",
        color: 'red',
    },
    {
        icon: <Zap className="w-10 h-10" />,
        title: "INSTANT INTEL",
        description: "Real-time scouting reports generated in seconds, not hours.",
        color: 'cyan',
    },
];

const colorSchemes = {
    violet: {
        primary: '#bd00ff',
        secondary: '#ff00ff',
        gradient: 'linear-gradient(135deg, #bd00ff 0%, #ff00ff 50%, #9c27b0 100%)',
        glow: 'rgba(189, 0, 255, 0.4)',
        bgGradient: 'linear-gradient(135deg, rgba(189, 0, 255, 0.15) 0%, rgba(156, 39, 176, 0.05) 100%)',
    },
    red: {
        primary: '#ff4655',
        secondary: '#ff9800',
        gradient: 'linear-gradient(135deg, #ff4655 0%, #ff5722 50%, #ff9800 100%)',
        glow: 'rgba(255, 70, 85, 0.4)',
        bgGradient: 'linear-gradient(135deg, rgba(255, 70, 85, 0.15) 0%, rgba(255, 87, 34, 0.05) 100%)',
    },
    cyan: {
        primary: '#00f0ff',
        secondary: '#0066ff',
        gradient: 'linear-gradient(135deg, #00f0ff 0%, #00bcd4 50%, #0066ff 100%)',
        glow: 'rgba(0, 240, 255, 0.4)',
        bgGradient: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(0, 102, 255, 0.05) 100%)',
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

export default function FeaturesSectionHud() {
    return (
        <section className="relative py-32 overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #050508 50%, #0a0a0f 100%)' }}>

            {/* Scanline Overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-4">

                {/* Glitched Title */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 mb-6 px-4 py-2" style={{ background: 'rgba(255, 70, 85, 0.1)', border: '1px solid rgba(255, 70, 85, 0.3)' }}>
                        <div className="w-2 h-2 bg-[#ff4655] animate-pulse" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                        <span className="text-xs font-mono text-[#ff4655] tracking-[0.3em] uppercase">ADVANCED FEATURES</span>
                    </div>

                    <h2
                        className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6"
                        style={{ textShadow: '0 0 40px rgba(255, 255, 255, 0.1)' }}
                    >
                        <GlitchText text="BEYOND BASIC" />
                        <br />
                        <span
                            className="bg-clip-text text-transparent"
                            style={{ backgroundImage: 'linear-gradient(90deg, #ff4655, #00f0ff, #bd00ff)' }}
                        >
                            <GlitchText text="STATS" />
                        </span>
                    </h2>

                    <p className="text-lg text-slate-500 font-mono max-w-2xl mx-auto">
            // Military-grade analytics powered by cutting-edge machine learning
                    </p>
                </div>

                {/* Feature Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-4">
                    {features.map((feature, index) => {
                        const colors = colorSchemes[feature.color];
                        const isMiddle = index === 1;

                        return (
                            <div key={index} className="relative group">
                                {/* Glow */}
                                <div
                                    className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl"
                                    style={{ background: colors.glow }}
                                />

                                {/* Panel */}
                                <div
                                    className="relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]"
                                    style={{
                                        clipPath: isMiddle
                                            ? 'polygon(8% 0%, 92% 0%, 100% 8%, 100% 92%, 92% 100%, 8% 100%, 0% 92%, 0% 8%)'
                                            : index === 0
                                                ? 'polygon(0% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 0% 100%, 0% 100%, 0% 0%)'
                                                : 'polygon(5% 0%, 100% 0%, 100% 0%, 100% 100%, 100% 100%, 5% 100%, 0% 95%, 0% 5%)',
                                        minHeight: '400px',
                                    }}
                                >
                                    {/* Border */}
                                    <div className="absolute inset-0" style={{ background: colors.gradient }} />

                                    {/* Inner */}
                                    <div
                                        className="absolute inset-[2px]"
                                        style={{
                                            background: 'linear-gradient(180deg, rgba(10, 15, 25, 0.98) 0%, rgba(5, 8, 15, 0.99) 100%)',
                                            clipPath: isMiddle
                                                ? 'polygon(8% 0%, 92% 0%, 100% 8%, 100% 92%, 92% 100%, 8% 100%, 0% 92%, 0% 8%)'
                                                : index === 0
                                                    ? 'polygon(0% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 0% 100%, 0% 100%, 0% 0%)'
                                                    : 'polygon(5% 0%, 100% 0%, 100% 0%, 100% 100%, 100% 100%, 5% 100%, 0% 95%, 0% 5%)',
                                        }}
                                    />

                                    {/* Content */}
                                    <div className="relative z-10 p-8 h-full flex flex-col">
                                        {/* Corner Flare */}
                                        <div
                                            className="absolute top-0 right-0 w-24 h-24 opacity-30 group-hover:opacity-60 transition-opacity"
                                            style={{
                                                background: `radial-gradient(circle at 100% 0%, ${colors.primary} 0%, transparent 70%)`,
                                            }}
                                        />

                                        {/* Number */}
                                        <div
                                            className="text-7xl font-black opacity-10 absolute top-4 right-6"
                                            style={{ fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif", color: colors.primary }}
                                        >
                                            0{index + 1}
                                        </div>

                                        {/* Icon */}
                                        <div
                                            className="w-20 h-20 mb-8 flex items-center justify-center relative"
                                            style={{
                                                background: colors.bgGradient,
                                                clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
                                            }}
                                        >
                                            <div style={{ color: colors.primary, filter: `drop-shadow(0 0 12px ${colors.primary})` }}>
                                                {feature.icon}
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3
                                            className="text-2xl font-black mb-4 tracking-wide"
                                            style={{
                                                fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif",
                                                color: colors.primary,
                                                textShadow: `0 0 20px ${colors.glow}`,
                                            }}
                                        >
                                            {feature.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-slate-400 font-mono text-sm leading-relaxed flex-grow">
                                            {feature.description}
                                        </p>

                                        {/* Bottom Accent */}
                                        <div className="mt-8 flex items-center gap-4">
                                            <div
                                                className="flex-1 h-0.5"
                                                style={{ background: `linear-gradient(90deg, ${colors.primary}, transparent)` }}
                                            />
                                            <div
                                                className="w-3 h-3 animate-pulse"
                                                style={{
                                                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                                                    background: colors.primary,
                                                    boxShadow: `0 0 10px ${colors.primary}`
                                                }}
                                            />
                                        </div>

                                        {/* Status */}
                                        <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-slate-600 uppercase tracking-wider">
                                            <span>MODULE ACTIVE</span>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                                                    style={{ background: colors.primary, boxShadow: `0 0 6px ${colors.primary}` }}
                                                />
                                                <span style={{ color: colors.primary }}>ONLINE</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Ambient Glows */}
            <div
                className="absolute top-1/4 -left-32 w-64 h-64 rounded-full blur-[100px] opacity-20 animate-pulse"
                style={{ background: 'radial-gradient(circle, #bd00ff, transparent)' }}
            />
            <div
                className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full blur-[100px] opacity-20 animate-pulse"
                style={{ background: 'radial-gradient(circle, #00f0ff, transparent)' }}
            />
        </section>
    );
}
