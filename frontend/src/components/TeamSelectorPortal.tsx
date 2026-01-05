'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Team {
    name: string;
    region: string;
}

interface TeamSelectorPortalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (teamName: string) => void;
    teams: Team[];
    triggerRef: React.RefObject<HTMLElement | null>;
    variant?: 'scouting' | 'teamA' | 'teamB';
    headerText?: string;
}

export default function TeamSelectorPortal({
    isOpen,
    onClose,
    onSelect,
    teams,
    triggerRef,
    variant = 'scouting',
    headerText = '// Select Target'
}: TeamSelectorPortalProps) {
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    // Get accent color based on variant
    const getAccentColor = () => {
        switch (variant) {
            case 'teamA': return '#10b981'; // emerald
            case 'teamB': return '#ff4655'; // red
            default: return '#ff4655'; // red for scouting
        }
    };

    const accentColor = getAccentColor();

    // Mount check for SSR
    useEffect(() => {
        setMounted(true);
    }, []);

    // Calculate position based on trigger element
    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 8, // 8px gap below trigger
                left: variant === 'teamB' ? rect.right - 256 : rect.left // 256px = w-64
            });
        }
    }, [isOpen, triggerRef, variant]);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose, triggerRef]);

    if (!mounted || !isOpen) return null;

    const dropdownContent = (
        <div
            ref={dropdownRef}
            className="fixed w-64 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
                top: position.top,
                left: position.left,
                zIndex: 9999,
                // Glassmorphism background
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                // Neon border glow
                border: `1px solid ${accentColor}40`,
                boxShadow: `
          0 0 20px ${accentColor}20,
          0 0 40px ${accentColor}10,
          0 25px 50px rgba(0, 0, 0, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.05)
        `,
                // Angular/bevel cut corners
                clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
                // Custom scrollbar
                scrollbarWidth: 'thin',
                scrollbarColor: `${accentColor} rgba(30, 41, 59, 0.5)`
            }}
        >
            {/* Header - Code comment style */}
            <div
                className="px-4 py-3 border-b sticky top-0 z-10"
                style={{
                    borderColor: `${accentColor}30`,
                    background: 'rgba(15, 23, 42, 0.98)'
                }}
            >
                <span
                    className="text-xs font-mono uppercase tracking-wider animate-pulse"
                    style={{ color: accentColor }}
                >
                    {headerText}
                </span>
            </div>

            {/* Team List */}
            {teams.map((team) => (
                <button
                    key={team.name}
                    onClick={() => {
                        onSelect(team.name);
                        onClose();
                    }}
                    className="w-full px-4 py-3 text-left transition-all duration-150 flex items-center justify-between group border-b last:border-0"
                    style={{
                        borderColor: 'rgba(51, 65, 85, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${accentColor}15`;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <div className="flex items-center gap-3">
                        {/* Indicator bar */}
                        <div
                            className="w-1 h-5 transition-all duration-150 group-hover:h-6 group-hover:shadow-lg"
                            style={{
                                background: 'rgba(100, 116, 139, 0.5)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = accentColor;
                                e.currentTarget.style.boxShadow = `0 0 10px ${accentColor}`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(100, 116, 139, 0.5)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                        {/* Team name - uppercase tech style */}
                        <span
                            className="font-mono text-sm uppercase tracking-wide transition-all duration-150 group-hover:tracking-wider"
                            style={{
                                color: 'rgba(203, 213, 225, 1)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#ffffff';
                                e.currentTarget.style.textShadow = `0 0 10px ${accentColor}60`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'rgba(203, 213, 225, 1)';
                                e.currentTarget.style.textShadow = 'none';
                            }}
                        >
                            {team.name}
                        </span>
                    </div>
                    {/* Region tag */}
                    <span
                        className="text-[10px] font-mono uppercase tracking-wider opacity-40 group-hover:opacity-70 transition-opacity"
                        style={{ color: accentColor }}
                    >
                        {team.region}
                    </span>
                </button>
            ))}
        </div>
    );

    return createPortal(dropdownContent, document.body);
}
