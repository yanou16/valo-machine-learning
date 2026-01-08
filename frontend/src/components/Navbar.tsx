'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Github, Grid3X3, X, Crosshair, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface NavLink {
    label: string;
    href: string;
}

const NAV_LINKS: NavLink[] = [
    { label: 'FEATURES', href: '#features' },
    { label: 'DOCS', href: '/docs' },
    { label: 'PRICING', href: '/pricing' },
    { label: 'GITHUB', href: 'https://github.com/yanou16/valo-machine-learning' },
];

// Hover Bracket Link Component
function NavLinkItem({ link, isActive }: { link: NavLink; isActive: boolean }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link
            href={link.href}
            target={link.href.startsWith('http') ? '_blank' : undefined}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative px-3 py-2 group"
        >
            <span className="relative flex items-center gap-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors">
                {/* Left Bracket */}
                <motion.span
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 5 }}
                    className="text-[#00f0ff]"
                >
                    [
                </motion.span>

                {/* Label */}
                <span className={cn(isActive && 'text-white')}>
                    {link.label}
                </span>

                {/* Right Bracket */}
                <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -5 }}
                    className="text-[#00f0ff]"
                >
                    ]
                </motion.span>
            </span>

            {/* Active Indicator */}
            {isActive && (
                <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1"
                >
                    <div className="w-1 h-1 bg-[#ff4655] rounded-full shadow-lg shadow-[#ff4655]/50" />
                    <div className="w-6 h-px bg-gradient-to-r from-[#ff4655] to-transparent" />
                </motion.div>
            )}
        </Link>
    );
}

export default function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loadingComplete, setLoadingComplete] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Loading line animation
    useEffect(() => {
        const timer = setTimeout(() => setLoadingComplete(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    scrolled
                        ? "bg-slate-950/95 backdrop-blur-xl border-b border-white/10"
                        : "bg-slate-950/80 backdrop-blur-md border-b border-white/5"
                )}
            >
                {/* Loading Line */}
                <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden">
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: loadingComplete ? '0%' : '-100%' }}
                        transition={{ duration: 1.5, ease: 'easeInOut' }}
                        className="h-full"
                        style={{
                            background: 'linear-gradient(90deg, transparent, #ff4655, #00f0ff, #ff4655, transparent)',
                            boxShadow: '0 0 10px rgba(255, 70, 85, 0.5)',
                        }}
                    />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* ===== LOGO AREA ===== */}
                        <div className="flex items-center gap-4">
                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-3 group">
                                <div
                                    className="w-9 h-9 flex items-center justify-center transition-all group-hover:scale-110"
                                    style={{
                                        background: 'linear-gradient(135deg, #ff4655, #cc0011)',
                                        clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                                        boxShadow: '0 0 20px rgba(255, 70, 85, 0.3)',
                                    }}
                                >
                                    <Shield className="w-4 h-4 text-white" />
                                </div>
                                <span
                                    className="text-xl font-black uppercase tracking-wider"
                                    style={{
                                        fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif",
                                        color: '#ff4655',
                                        textShadow: '0 0 20px rgba(255, 70, 85, 0.3)',
                                    }}
                                >
                                    VALOML
                                </span>
                            </Link>

                            {/* Beta Badge */}
                            <div
                                className="hidden sm:flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider"
                                style={{
                                    border: '1px solid rgba(0, 240, 255, 0.4)',
                                    color: '#00f0ff',
                                    background: 'rgba(0, 240, 255, 0.05)',
                                }}
                            >
                                <span>BETA</span>
                                <span className="text-slate-600">v2.0</span>
                            </div>
                        </div>

                        {/* ===== NAV LINKS (Center) ===== */}
                        <div className="hidden lg:flex items-center gap-1">
                            {NAV_LINKS.map((link) => (
                                <NavLinkItem
                                    key={link.label}
                                    link={link}
                                    isActive={pathname === link.href}
                                />
                            ))}
                        </div>

                        {/* ===== ACTIONS AREA (Right) ===== */}
                        <div className="flex items-center gap-4">
                            {/* System Status */}
                            <div className="hidden md:flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                                <div
                                    className="w-2 h-2 rounded-full animate-pulse"
                                    style={{ background: '#10b981', boxShadow: '0 0 8px #10b981' }}
                                />
                                <span className="text-emerald-500">SYSTEM ONLINE</span>
                            </div>

                            {/* Divider */}
                            <div className="hidden md:block w-px h-6 bg-white/10" />

                            {/* Sign In */}
                            <Link
                                href="/signin"
                                className="hidden sm:block text-xs font-bold uppercase tracking-[0.15em] text-slate-500 hover:text-white transition-colors"
                            >
                                SIGN IN
                            </Link>

                            {/* Get Started Button */}
                            <Link
                                href="#hero"
                                className="group relative"
                            >
                                <div
                                    className="px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-200"
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #ff4655',
                                        color: '#ff4655',
                                        clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                                    }}
                                >
                                    <span className="relative z-10 group-hover:text-white transition-colors flex items-center gap-1">
                                        GET STARTED
                                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                </div>

                                {/* Hover Fill */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    style={{
                                        background: '#ff4655',
                                        clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                                    }}
                                />
                            </Link>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden w-10 h-10 flex items-center justify-center transition-colors"
                                style={{
                                    background: mobileMenuOpen ? 'rgba(255, 70, 85, 0.2)' : 'transparent',
                                    border: '1px solid rgba(255, 70, 85, 0.3)',
                                    color: '#ff4655',
                                    clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
                                }}
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-5 h-5" />
                                ) : (
                                    <Grid3X3 className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Glowing Bottom Edge */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-px opacity-50"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255, 70, 85, 0.5), rgba(0, 240, 255, 0.5), rgba(255, 70, 85, 0.5), transparent)',
                    }}
                />
            </motion.nav>

            {/* ===== MOBILE MENU ===== */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-x-0 top-16 z-40 lg:hidden"
                        style={{
                            background: 'linear-gradient(180deg, rgba(5, 8, 15, 0.98), rgba(10, 15, 25, 0.95))',
                            backdropFilter: 'blur(20px)',
                            borderBottom: '1px solid rgba(255, 70, 85, 0.2)',
                        }}
                    >
                        <div className="px-4 py-6 space-y-2">
                            {/* System Status (Mobile) */}
                            <div className="flex items-center gap-2 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 border-b border-white/5 mb-4">
                                <div
                                    className="w-2 h-2 rounded-full animate-pulse"
                                    style={{ background: '#10b981', boxShadow: '0 0 8px #10b981' }}
                                />
                                <span className="text-emerald-500">SYSTEM ONLINE</span>
                                <span className="mx-2 text-slate-700">|</span>
                                <span>SECURE CHANNEL</span>
                            </div>

                            {/* Nav Links */}
                            {NAV_LINKS.map((link, index) => (
                                <motion.div
                                    key={link.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center justify-between px-4 py-3 group transition-all"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.02)',
                                            borderLeft: '2px solid transparent',
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Crosshair className="w-4 h-4 text-[#ff4655] opacity-50 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-sm font-bold uppercase tracking-[0.15em] text-slate-400 group-hover:text-white transition-colors">
                                                {link.label}
                                            </span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#ff4655] group-hover:translate-x-1 transition-all" />
                                    </Link>
                                </motion.div>
                            ))}

                            {/* Mobile Actions */}
                            <div className="pt-4 mt-4 border-t border-white/5 space-y-3">
                                <Link
                                    href="/signin"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.15em] text-slate-500 hover:text-white transition-colors"
                                >
                                    SIGN IN
                                </Link>

                                <Link
                                    href="#hero"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.15em] text-white transition-all"
                                    style={{
                                        background: '#ff4655',
                                        clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                                        boxShadow: '0 0 20px rgba(255, 70, 85, 0.3)',
                                    }}
                                >
                                    GET STARTED
                                </Link>
                            </div>

                            {/* Version Footer */}
                            <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-slate-600 uppercase tracking-wider">
                                <span>VALOML TACTICAL v2.0</span>
                                <span className="flex items-center gap-1">
                                    <Github className="w-3 h-3" />
                                    OPEN SOURCE
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop for mobile menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                        style={{ top: '64px' }}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
