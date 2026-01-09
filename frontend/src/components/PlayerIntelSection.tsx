'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Crosshair, Target, Zap, Brain,
    ChevronDown, ChevronUp, User, Sword
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// ============ TYPES ============

interface PlayerTendencies {
    aggression_score: number;
    survival_rate: number;
    primary_weapon: string;
    badges: string[];
}

interface DefensiveSetup {
    map: string;
    preferred_site: string;
    hold_frequency: string;
}

interface PlayerStats {
    matches_analyzed: number;
    kd: number;
    opening_duels: number;
    opening_success: number;
}

interface PlayerIntel {
    name: string;
    team?: string;
    agent: string;
    role: string;
    agent_pool?: string[];
    tendencies: PlayerTendencies;
    defensive_setup: DefensiveSetup;
    stats: PlayerStats;
}

interface PlayerIntelSectionProps {
    rosterIntel: PlayerIntel[];
    teamName?: string;
    teamColor?: string;
}

// ============ ROLE ICONS ============

const RoleIcons: Record<string, React.ReactNode> = {
    Duelist: <Sword className="w-4 h-4" />,
    Controller: <Brain className="w-4 h-4" />,
    Initiator: <Target className="w-4 h-4" />,
    Sentinel: <Shield className="w-4 h-4" />,
    Unknown: <User className="w-4 h-4" />,
};

// ============ SITE VISUALIZATION ============

interface SiteBarProps {
    sites: string[];
    preferredSite: string;
    frequency: string;
    accentColor: string;
}

function SiteBar({ sites, preferredSite, frequency, accentColor }: SiteBarProps) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex h-6 overflow-hidden" style={{ minWidth: '120px' }}>
                {sites.map((site, index) => {
                    const isActive = preferredSite.toLowerCase().includes(site.toLowerCase());
                    return (
                        <div
                            key={site}
                            className={cn(
                                "flex-1 flex items-center justify-center text-[9px] font-mono font-bold uppercase border-r border-slate-700 last:border-r-0 transition-all",
                                isActive ? "text-white" : "text-slate-600"
                            )}
                            style={{
                                background: isActive ? accentColor : 'rgba(30, 41, 59, 0.5)',
                                boxShadow: isActive ? `0 0 10px ${accentColor}50` : 'none',
                            }}
                        >
                            {site}
                        </div>
                    );
                })}
            </div>
            <span className="text-[10px] font-mono text-slate-400">
                {frequency}
            </span>
        </div>
    );
}

// ============ AGGRESSION GAUGE ============

interface AggressionGaugeProps {
    score: number;
    size?: 'sm' | 'md';
}

function AggressionGauge({ score, size = 'sm' }: AggressionGaugeProps) {
    const width = size === 'sm' ? 60 : 80;
    const height = size === 'sm' ? 6 : 8;
    const percentage = Math.round(score * 100);

    // Color based on aggression level
    const getColor = () => {
        if (score >= 0.7) return '#ff4655'; // Red - very aggressive
        if (score >= 0.4) return '#ff9800'; // Orange - moderate
        return '#00f0ff'; // Cyan - passive
    };

    return (
        <div className="flex items-center gap-2">
            <div
                className="relative overflow-hidden bg-slate-800/80"
                style={{
                    width,
                    height,
                    clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
                }}
            >
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0"
                    style={{
                        background: getColor(),
                        boxShadow: `0 0 8px ${getColor()}`,
                    }}
                />
            </div>
            <span
                className="text-[10px] font-mono font-bold"
                style={{ color: getColor() }}
            >
                {percentage}%
            </span>
        </div>
    );
}

// ============ BADGE COMPONENT ============

interface BadgeProps {
    label: string;
}

function Badge({ label }: BadgeProps) {
    // Determine color based on badge content
    const getColors = () => {
        if (label.includes('🦅') || label.includes('⚔️') || label.includes('💥')) {
            return { bg: 'rgba(255, 70, 85, 0.15)', border: 'rgba(255, 70, 85, 0.4)', text: '#ff4655' };
        }
        if (label.includes('🛡️') || label.includes('🧱') || label.includes('🏰')) {
            return { bg: 'rgba(0, 240, 255, 0.15)', border: 'rgba(0, 240, 255, 0.4)', text: '#00f0ff' };
        }
        if (label.includes('💀') || label.includes('⭐') || label.includes('🔥')) {
            return { bg: 'rgba(255, 152, 0, 0.15)', border: 'rgba(255, 152, 0, 0.4)', text: '#ff9800' };
        }
        if (label.includes('🎯')) {
            return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#10b981' };
        }
        return { bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.3)', text: '#94a3b8' };
    };

    const colors = getColors();

    return (
        <span
            className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider"
            style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                color: colors.text,
            }}
        >
            {label}
        </span>
    );
}

// ============ PLAYER INTEL ROW ============

interface PlayerIntelRowProps {
    player: PlayerIntel;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
    accentColor: string;
}

function PlayerIntelRow({ player, index, isExpanded, onToggle, accentColor }: PlayerIntelRowProps) {
    // Safe defaults for missing data
    const defensiveSetup = player.defensive_setup || { map: 'Unknown', preferred_site: 'A', hold_frequency: '0%' };
    const tendencies = player.tendencies || { aggression_score: 0.5, survival_rate: 0.5, primary_weapon: 'Vandal', badges: [] };
    const stats = player.stats || { matches_analyzed: 0, kd: 1.0, opening_duels: 0, opening_success: 0.5 };

    // Determine sites based on map
    const getSites = (map: string) => {
        const threeHitters = ['Haven', 'Lotus'];
        if (threeHitters.some(m => map.toLowerCase().includes(m.toLowerCase()))) {
            return ['A', 'B', 'C'];
        }
        return ['A', 'B'];
    };

    const sites = getSites(defensiveSetup.map);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
        >
            {/* Main Row */}
            <div
                onClick={onToggle}
                className="relative flex items-center gap-4 p-4 cursor-pointer transition-all hover:bg-white/[0.02]"
                style={{
                    background: 'linear-gradient(90deg, rgba(10, 15, 25, 0.8), rgba(15, 20, 30, 0.6))',
                    borderLeft: `3px solid ${accentColor}40`,
                }}
            >
                {/* Left: Agent Icon + Name */}
                <div className="flex items-center gap-3 min-w-[180px]">
                    {/* Agent Icon */}
                    <div
                        className="w-10 h-10 flex items-center justify-center"
                        style={{
                            background: `linear-gradient(135deg, ${accentColor}30, transparent)`,
                            clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
                            border: `1px solid ${accentColor}40`,
                        }}
                    >
                        <span style={{ color: accentColor }}>
                            {RoleIcons[player.role] || RoleIcons.Unknown}
                        </span>
                    </div>

                    {/* Name + Agent */}
                    <div>
                        <div
                            className="text-sm font-black uppercase tracking-wide"
                            style={{ fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif" }}
                        >
                            {player.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase">
                            {player.agent} • {player.role}
                        </div>
                    </div>
                </div>

                {/* Center: Site Anchor Visualization */}
                <div className="flex-1 flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">
                            DEFENSE SETUP
                        </span>
                        <SiteBar
                            sites={sites}
                            preferredSite={defensiveSetup.preferred_site}
                            frequency={defensiveSetup.hold_frequency}
                            accentColor={accentColor}
                        />
                    </div>

                    {/* Map badge */}
                    <div
                        className="px-2 py-1 text-[9px] font-mono uppercase"
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        {defensiveSetup.map}
                    </div>
                </div>

                {/* Right: Tendencies */}
                <div className="flex items-center gap-4">
                    {/* Aggression Gauge */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-slate-600 uppercase">AGGRESSION</span>
                        <AggressionGauge score={tendencies.aggression_score} />
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {tendencies.badges.slice(0, 2).map((badge, i) => (
                            <Badge key={i} label={badge} />
                        ))}
                    </div>

                    {/* Expand Icon */}
                    <button className="p-1 text-slate-500 hover:text-white transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div
                            className="p-4 grid grid-cols-4 gap-6 border-t border-white/5"
                            style={{ background: 'rgba(0, 0, 0, 0.3)' }}
                        >
                            {/* Stats */}
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">PERFORMANCE</span>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">K/D</span>
                                        <span className="font-mono font-bold text-white">{stats.kd}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Opening Duels</span>
                                        <span className="font-mono font-bold text-white">{stats.opening_duels}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Opening Success</span>
                                        <span className="font-mono font-bold" style={{ color: stats.opening_success >= 0.5 ? '#10b981' : '#ff4655' }}>
                                            {Math.round(stats.opening_success * 100)}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tendencies Details */}
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">TENDENCIES</span>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Survival Rate</span>
                                        <span className="font-mono font-bold text-[#00f0ff]">
                                            {Math.round(tendencies.survival_rate * 100)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Primary Weapon</span>
                                        <span className="font-mono text-white">{tendencies.primary_weapon}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Agent Pool */}
                            {player.agent_pool && player.agent_pool.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">AGENT POOL</span>
                                    <div className="flex flex-wrap gap-1">
                                        {player.agent_pool.map((agent, i) => (
                                            <span
                                                key={agent}
                                                className="px-2 py-0.5 text-[9px] font-mono uppercase"
                                                style={{
                                                    background: i === 0 ? `${accentColor}20` : 'rgba(255,255,255,0.03)',
                                                    border: `1px solid ${i === 0 ? accentColor : 'rgba(255,255,255,0.1)'}`,
                                                    color: i === 0 ? accentColor : '#94a3b8',
                                                }}
                                            >
                                                {agent}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* All Badges */}
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">INTEL TAGS</span>
                                <div className="flex flex-wrap gap-1">
                                    {tendencies.badges.map((badge, i) => (
                                        <Badge key={i} label={badge} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ============ MAIN SECTION COMPONENT ============

export default function PlayerIntelSection({ rosterIntel, teamName, teamColor = '#ff4655' }: PlayerIntelSectionProps) {
    const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

    if (!rosterIntel || rosterIntel.length === 0) {
        return null;
    }

    return (
        <section className="relative py-8">
            {/* Section Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <Crosshair className="w-5 h-5" style={{ color: teamColor }} />
                    <h3
                        className="text-xl font-black uppercase tracking-wider"
                        style={{ fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif", color: teamColor }}
                    >
                        ROSTER INTEL
                    </h3>
                </div>
                {teamName && (
                    <span className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider" style={{
                        background: `${teamColor}15`,
                        border: `1px solid ${teamColor}30`,
                        color: teamColor,
                    }}>
                        {teamName}
                    </span>
                )}
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Player Rows */}
            <div
                className="space-y-1 overflow-hidden"
                style={{
                    background: 'linear-gradient(180deg, rgba(10, 15, 25, 0.5), rgba(5, 8, 15, 0.8))',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
                }}
            >
                {/* Header Row */}
                <div
                    className="flex items-center gap-4 px-4 py-2 text-[9px] font-mono text-slate-600 uppercase tracking-widest"
                    style={{ background: 'rgba(255, 70, 85, 0.05)', borderBottom: '1px solid rgba(255, 70, 85, 0.1)' }}
                >
                    <div className="min-w-[180px]">PLAYER</div>
                    <div className="flex-1">DEFENSIVE SETUP</div>
                    <div className="w-[100px]">AGGRESSION</div>
                    <div className="w-[200px]">INTEL TAGS</div>
                    <div className="w-[24px]"></div>
                </div>

                {/* Player Rows */}
                {rosterIntel.map((player, index) => (
                    <PlayerIntelRow
                        key={player.name}
                        player={player}
                        index={index}
                        isExpanded={expandedPlayer === player.name}
                        onToggle={() => setExpandedPlayer(expandedPlayer === player.name ? null : player.name)}
                        accentColor={teamColor}
                    />
                ))}
            </div>

            {/* Footer Info */}
            <div className="mt-4 flex items-center justify-between text-[9px] font-mono text-slate-600 uppercase tracking-wider">
                <span>// SPATIAL ANALYSIS FROM {rosterIntel[0]?.stats?.matches_analyzed || 0} MATCHES</span>
                <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    DATA VERIFIED
                </span>
            </div>
        </section>
    );
}
