'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, Crosshair, Zap } from 'lucide-react';
import Link from 'next/link';

// Glitch Button Component
function GlitchButton({ children, href }: { children: React.ReactNode; href: string }) {
    const [isHovered, setIsHovered] = useState(false);
    const [glitchActive, setGlitchActive] = useState(false);

    useEffect(() => {
        if (isHovered) {
            const interval = setInterval(() => {
                setGlitchActive(true);
                setTimeout(() => setGlitchActive(false), 100);
            }, 200);
            return () => clearInterval(interval);
        }
    }, [isHovered]);

    return (
        <Link
            href={href}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setGlitchActive(false); }}
            className="relative inline-block group"
        >
            {/* Main Button */}
            <div
                className="relative px-10 py-5 font-black text-lg uppercase tracking-[0.2em] transition-all duration-200"
                style={{
                    fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif",
                    background: glitchActive ? '#cc0011' : '#ff4655',
                    color: 'white',
                    clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
                    transform: glitchActive ? 'translateX(2px)' : 'translateX(0)',
                    boxShadow: isHovered ? '0 0 40px rgba(255, 70, 85, 0.6), 0 0 80px rgba(255, 70, 85, 0.3)' : '0 0 20px rgba(255, 70, 85, 0.4)',
                }}
            >
                <span className="flex items-center gap-3">
                    {children}
                    <ArrowRight className={`w-5 h-5 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
                </span>
            </div>

            {/* Glitch Layers */}
            {glitchActive && (
                <>
                    <div
                        className="absolute inset-0 px-10 py-5 font-black text-lg uppercase tracking-[0.2em] pointer-events-none"
                        style={{
                            fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif",
                            background: '#00f0ff',
                            color: 'white',
                            clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
                            transform: 'translateX(-4px)',
                            opacity: 0.5,
                        }}
                    />
                    <div
                        className="absolute inset-0 px-10 py-5 font-black text-lg uppercase tracking-[0.2em] pointer-events-none"
                        style={{
                            fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif",
                            background: '#ff0000',
                            color: 'white',
                            clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
                            transform: 'translateX(4px)',
                            opacity: 0.3,
                        }}
                    />
                </>
            )}

            {/* Corner Accents */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#ff4655] opacity-60" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#ff4655] opacity-60" />
        </Link>
    );
}

export default function CtaSection() {
    return (
        <section className="relative py-32 overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #050508 100%)' }}>

            {/* Topographic Map Pattern */}
            <div className="absolute inset-0 opacity-[0.04]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="topo-pattern" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
                            {/* Topographic lines */}
                            <ellipse cx="200" cy="200" rx="50" ry="30" fill="none" stroke="#00f0ff" strokeWidth="0.5" />
                            <ellipse cx="200" cy="200" rx="100" ry="60" fill="none" stroke="#00f0ff" strokeWidth="0.5" />
                            <ellipse cx="200" cy="200" rx="150" ry="90" fill="none" stroke="#ff4655" strokeWidth="0.5" />
                            <ellipse cx="200" cy="200" rx="200" ry="120" fill="none" stroke="#00f0ff" strokeWidth="0.5" />
                            <ellipse cx="200" cy="200" rx="250" ry="150" fill="none" stroke="#ff4655" strokeWidth="0.3" />
                            {/* Grid overlay */}
                            <line x1="0" y1="200" x2="400" y2="200" stroke="#ffffff" strokeWidth="0.2" />
                            <line x1="200" y1="0" x2="200" y2="400" stroke="#ffffff" strokeWidth="0.2" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#topo-pattern)" />
                </svg>
            </div>

            {/* Scanlines */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.02]"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
                }}
            />

            {/* Radial Glow */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] blur-[150px] opacity-20"
                style={{ background: 'radial-gradient(ellipse, #ff4655, transparent)' }}
            />

            <div className="relative z-10 max-w-5xl mx-auto px-4">

                {/* Main Container - Angular with Glow Border */}
                <div
                    className="relative p-1"
                    style={{
                        background: 'linear-gradient(135deg, #ff4655 0%, #00f0ff 50%, #ff4655 100%)',
                        clipPath: 'polygon(3% 0%, 97% 0%, 100% 8%, 100% 92%, 97% 100%, 3% 100%, 0% 92%, 0% 8%)',
                        boxShadow: '0 0 60px rgba(255, 70, 85, 0.3), 0 0 100px rgba(0, 240, 255, 0.2)',
                    }}
                >
                    {/* Inner Container */}
                    <div
                        className="relative py-20 px-8 md:px-16"
                        style={{
                            background: 'linear-gradient(180deg, rgba(10, 10, 20, 0.98) 0%, rgba(5, 5, 15, 0.99) 100%)',
                            clipPath: 'polygon(3% 0%, 97% 0%, 100% 8%, 100% 92%, 97% 100%, 3% 100%, 0% 92%, 0% 8%)',
                        }}
                    >
                        {/* Corner Icons */}
                        <div className="absolute top-6 left-6 flex items-center gap-2 text-[#ff4655]">
                            <Crosshair className="w-5 h-5 animate-pulse" />
                            <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">TARGET ACQUIRED</span>
                        </div>
                        <div className="absolute top-6 right-6 flex items-center gap-2 text-[#00f0ff]">
                            <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">READY CHECK</span>
                            <Zap className="w-5 h-5 animate-pulse" />
                        </div>

                        {/* Content */}
                        <div className="text-center">
                            {/* Pre-headline */}
                            <div className="inline-flex items-center gap-3 mb-6 px-4 py-2" style={{ background: 'rgba(255, 70, 85, 0.1)', border: '1px solid rgba(255, 70, 85, 0.3)' }}>
                                <div className="w-2 h-2 bg-[#ff4655] animate-pulse" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                                <span className="text-xs font-mono text-[#ff4655] tracking-[0.3em] uppercase">MATCH FOUND</span>
                                <div className="w-2 h-2 bg-[#ff4655] animate-pulse" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                            </div>

                            {/* Main Headline */}
                            <h2
                                className="text-5xl md:text-7xl lg:text-8xl font-black uppercase mb-6"
                                style={{
                                    fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif",
                                    color: 'white',
                                    textShadow: '0 0 40px rgba(255, 70, 85, 0.4)',
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                DOMINATE THE
                                <br />
                                <span
                                    className="bg-clip-text text-transparent"
                                    style={{ backgroundImage: 'linear-gradient(90deg, #ff4655, #ff8a8a, #ff4655)' }}
                                >
                                    LOBBY
                                </span>
                            </h2>

                            {/* Subtext */}
                            <p
                                className="text-lg md:text-xl font-mono text-slate-400 mb-10 max-w-lg mx-auto"
                                style={{ letterSpacing: '0.05em' }}
                            >
                // Data doesn&apos;t lie. <span className="text-[#ff4655]">Players do.</span>
                            </p>

                            {/* CTA Button */}
                            <GlitchButton href="#hero">
                                INITIATE SCOUTING
                            </GlitchButton>

                            {/* Stats Line */}
                            <div className="mt-12 flex items-center justify-center gap-8 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                                <span>🟢 SYSTEMS READY</span>
                                <span className="w-px h-4 bg-slate-700" />
                                <span>⚡ 2.4s AVG ANALYSIS</span>
                                <span className="w-px h-4 bg-slate-700" />
                                <span>🎯 98.7% ACCURACY</span>
                            </div>
                        </div>

                        {/* Bottom Decorative Line */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                            <div className="w-24 h-px bg-gradient-to-r from-transparent to-[#ff4655]/50" />
                            <div
                                className="w-3 h-3"
                                style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', background: '#ff4655' }}
                            />
                            <div className="w-24 h-px bg-gradient-to-l from-transparent to-[#ff4655]/50" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Ambient Side Glows */}
            <div
                className="absolute top-1/2 -left-32 w-64 h-64 rounded-full blur-[100px] opacity-20"
                style={{ background: 'radial-gradient(circle, #ff4655, transparent)' }}
            />
            <div
                className="absolute top-1/2 -right-32 w-64 h-64 rounded-full blur-[100px] opacity-20"
                style={{ background: 'radial-gradient(circle, #00f0ff, transparent)' }}
            />
        </section>
    );
}
