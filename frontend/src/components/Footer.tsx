'use client';

import React from 'react';
import { Github, Twitter, MessageCircle, Shield, Activity, Wifi, Clock, Cpu, Database, Server } from 'lucide-react';
import Link from 'next/link';

interface FooterLink {
    label: string;
    href: string;
}

interface FooterColumn {
    title: string;
    links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
    {
        title: 'NAVIGATION',
        links: [
            { label: 'HOME', href: '/' },
            { label: 'SCOUTING', href: '#hero' },
            { label: 'FEATURES', href: '#features' },
            { label: 'ABOUT', href: '#about' },
        ],
    },
    {
        title: 'RESOURCES',
        links: [
            { label: 'API DOCS', href: '/docs' },
            { label: 'CHANGELOG', href: '/changelog' },
            { label: 'STATUS PAGE', href: '/status' },
            { label: 'SUPPORT', href: '/support' },
        ],
    },
    {
        title: 'LEGAL',
        links: [
            { label: 'PRIVACY POLICY', href: '/privacy' },
            { label: 'TERMS OF SERVICE', href: '/terms' },
            { label: 'DATA USAGE', href: '/data' },
            { label: 'DISCLAIMER', href: '/disclaimer' },
        ],
    },
];

interface SystemStatus {
    name: string;
    status: 'online' | 'active' | 'warning';
    value?: string;
    icon: React.ReactNode;
}

const systemStatuses: SystemStatus[] = [
    { name: 'GRID API', status: 'online', icon: <Database className="w-3 h-3" /> },
    { name: 'ML ENGINE', status: 'active', icon: <Cpu className="w-3 h-3" /> },
    { name: 'LATENCY', status: 'warning', value: '24ms', icon: <Clock className="w-3 h-3" /> },
    { name: 'UPTIME', status: 'online', value: '99.9%', icon: <Server className="w-3 h-3" /> },
];

const statusColors = {
    online: { bg: '#10b981', text: 'ONLINE' },
    active: { bg: '#00f0ff', text: 'ACTIVE' },
    warning: { bg: '#f59e0b', text: '' },
};

export default function Footer() {
    return (
        <footer className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #050508 0%, #030305 100%)' }}>

            {/* Top Separator - Glowing Red Line */}
            <div className="relative h-1">
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(90deg, transparent, #ff4655, #ff4655, transparent)',
                        boxShadow: '0 0 30px rgba(255, 70, 85, 0.5), 0 0 60px rgba(255, 70, 85, 0.3)',
                    }}
                />
            </div>

            {/* Background Watermark */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black uppercase opacity-[0.02] pointer-events-none select-none whitespace-nowrap"
                style={{ fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif", color: '#ffffff' }}
            >
                VALOML
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">

                    {/* Brand Column */}
                    <div className="lg:col-span-2 lg:border-r border-white/5 lg:pr-8">
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-6">
                            <div
                                className="w-10 h-10 flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(135deg, #ff4655, #cc0011)',
                                    clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
                                    boxShadow: '0 0 20px rgba(255, 70, 85, 0.4)',
                                }}
                            >
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3
                                    className="text-2xl font-black uppercase tracking-wide"
                                    style={{
                                        fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif",
                                        color: '#ff4655',
                                        textShadow: '0 0 20px rgba(255, 70, 85, 0.3)',
                                    }}
                                >
                                    VALOML
                                </h3>
                                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                                    Tactical Intelligence System
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-slate-500 font-mono leading-relaxed mb-6 max-w-sm">
              // AI-powered scouting reports for VALORANT esports. Analyze teams, discover patterns, dominate matches.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            {[
                                { icon: Github, href: 'https://github.com/yanou16', label: 'GitHub' },
                                { icon: Twitter, href: '#', label: 'Twitter' },
                                { icon: MessageCircle, href: '#', label: 'Discord' },
                            ].map((social, i) => (
                                <Link
                                    key={i}
                                    href={social.href}
                                    target="_blank"
                                    className="w-10 h-10 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        clipPath: 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)',
                                    }}
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-4 h-4 text-slate-500 group-hover:text-[#ff4655] transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    {footerColumns.map((column, colIndex) => (
                        <div
                            key={colIndex}
                            className={`${colIndex < footerColumns.length - 1 ? 'lg:border-r border-white/5' : ''} lg:px-6`}
                        >
                            {/* Column Title */}
                            <h4
                                className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2"
                                style={{
                                    fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif",
                                    color: '#ff4655',
                                }}
                            >
                                <div
                                    className="w-1.5 h-1.5"
                                    style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', background: '#ff4655' }}
                                />
                                {column.title}
                            </h4>

                            {/* Links */}
                            <ul className="space-y-3">
                                {column.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <Link
                                            href={link.href}
                                            className="text-xs font-mono text-slate-500 uppercase tracking-widest hover:text-[#ff4655] transition-colors duration-200 flex items-center gap-2 group"
                                        >
                                            <span className="w-1 h-1 bg-slate-700 group-hover:bg-[#ff4655] transition-colors" />
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* System Status Bar */}
                <div className="mt-16 pt-8 border-t border-white/5">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        {/* System Metrics */}
                        <div className="flex flex-wrap items-center gap-6">
                            <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-3 h-3 text-[#00f0ff]" />
                                SYSTEM METRICS
                            </span>

                            <div className="flex flex-wrap items-center gap-4">
                                {systemStatuses.map((status, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[10px] font-mono">
                                        <span className="text-slate-600">{status.icon}</span>
                                        <span className="text-slate-500 uppercase">{status.name}:</span>
                                        <div className="flex items-center gap-1">
                                            <div
                                                className="w-1.5 h-1.5 rounded-full animate-pulse"
                                                style={{ background: statusColors[status.status].bg, boxShadow: `0 0 6px ${statusColors[status.status].bg}` }}
                                            />
                                            <span style={{ color: statusColors[status.status].bg }}>
                                                {status.value || statusColors[status.status].text}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Connection Status */}
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
                            <Wifi className="w-3 h-3 text-[#10b981]" />
                            <span>SECURE CONNECTION</span>
                            <span className="text-slate-700">|</span>
                            <span>TLS 1.3</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar - Technical Readout */}
            <div
                className="relative py-4 px-4"
                style={{ background: 'rgba(0, 0, 0, 0.5)', borderTop: '1px solid rgba(255, 255, 255, 0.03)' }}
            >
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                    {/* Left - Copyright */}
                    <div className="flex items-center gap-2">
                        <span>© 2026 VALOML</span>
                        <span className="text-slate-700">//</span>
                        <span>ALL RIGHTS RESERVED</span>
                    </div>

                    {/* Center - Build Info */}
                    <div
                        className="flex items-center gap-3 px-4 py-1"
                        style={{ background: 'rgba(255, 70, 85, 0.1)', border: '1px solid rgba(255, 70, 85, 0.2)' }}
                    >
                        <span className="text-[#ff4655]">VERSION 2.0</span>
                        <span className="text-slate-700">//</span>
                        <span className="text-slate-500">CLOUD9 HACKATHON BUILD</span>
                    </div>

                    {/* Right - Technical Info */}
                    <div className="flex items-center gap-2">
                        <span>GRID API v3.1</span>
                        <span className="text-slate-700">|</span>
                        <span>NEXT.JS 16</span>
                        <span className="text-slate-700">|</span>
                        <span className="text-[#00f0ff]">ML CORE ACTIVE</span>
                    </div>
                </div>
            </div>

            {/* Corner Decorations */}
            <div className="absolute bottom-4 left-4 w-8 h-8">
                <div className="w-full h-px bg-gradient-to-r from-[#ff4655]/50 to-transparent" />
                <div className="h-full w-px bg-gradient-to-b from-[#ff4655]/50 to-transparent" />
            </div>
            <div className="absolute bottom-4 right-4 w-8 h-8">
                <div className="w-full h-px bg-gradient-to-l from-[#ff4655]/50 to-transparent" />
                <div className="h-full w-px bg-gradient-to-b from-[#ff4655]/50 to-transparent absolute right-0" />
            </div>
        </footer>
    );
}
