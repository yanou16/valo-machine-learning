'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useDragControls, AnimatePresence } from 'framer-motion';
import { Minus, Square, X, Shield, Scan } from 'lucide-react';

interface Team {
    name: string;
    region: string;
}

interface TeamSelectionWindowProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (teamName: string) => void;
    teams: Team[];
    triggerRef: React.RefObject<HTMLElement | null>;
    variant?: 'scouting' | 'teamA' | 'teamB';
    title?: string;
}

export default function TeamSelectionWindow({
    isOpen,
    onClose,
    onSelect,
    teams,
    triggerRef,
    variant = 'scouting',
    title = 'TEAM SELECTION'
}: TeamSelectionWindowProps) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const windowRef = useRef<HTMLDivElement>(null);
    const dragControls = useDragControls();

    // Get accent color based on variant
    const getAccentColor = () => {
        switch (variant) {
            case 'teamA': return '#10b981'; // emerald
            case 'teamB': return '#ff4655'; // red
            default: return '#00f0ff'; // cyan for main scouting
        }
    };

    const accentColor = getAccentColor();

    // Mount check for SSR
    useEffect(() => {
        setMounted(true);
    }, []);

    // Calculate initial position based on trigger element
    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const windowWidth = 320; // w-80
            const windowHeight = 400;

            // Center below the trigger, but ensure it stays in viewport
            let x = rect.left + (rect.width / 2) - (windowWidth / 2);
            let y = rect.bottom + 12;

            // Clamp to viewport
            x = Math.max(20, Math.min(x, window.innerWidth - windowWidth - 20));
            y = Math.max(20, Math.min(y, window.innerHeight - windowHeight - 20));

            setPosition({ x, y });
            setIsMinimized(false);
            setIsMaximized(false);
        }
    }, [isOpen, triggerRef]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Start drag from header
    const startDrag = (event: React.PointerEvent) => {
        dragControls.start(event);
    };

    if (!mounted || !isOpen) return null;

    const windowContent = (
        <AnimatePresence>
            <motion.div
                ref={windowRef}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{
                    opacity: 1,
                    scale: isMaximized ? 1 : 1,
                    y: 0,
                    width: isMaximized ? '90vw' : 320,
                    height: isMaximized ? '80vh' : 'auto',
                    x: isMaximized ? '5vw' : position.x,
                    // y position handled by top style when maximized
                }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                drag
                dragControls={dragControls}
                dragListener={false}
                dragMomentum={false}
                dragConstraints={{
                    top: 0,
                    left: 0,
                    right: typeof window !== 'undefined' ? window.innerWidth - 320 : 1000,
                    bottom: typeof window !== 'undefined' ? window.innerHeight - 100 : 800
                }}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                className="fixed"
                style={{
                    top: isMaximized ? '10vh' : position.y,
                    left: isMaximized ? 0 : 0,
                    zIndex: 9999,
                    width: isMaximized ? '90vw' : 320,
                    // Glassmorphism + Neon effect
                    background: 'rgba(10, 15, 30, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: `1px solid ${accentColor}`,
                    boxShadow: `
            0 0 30px ${accentColor}40,
            0 0 60px ${accentColor}20,
            0 25px 80px rgba(0, 0, 0, 0.7),
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
          `,
                    // Angular cut corners
                    clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
                }}
            >
                {/* ===== WINDOW HEADER (Drag Handle) ===== */}
                <div
                    onPointerDown={startDrag}
                    className={`
            flex items-center justify-between px-4 py-3 
            border-b select-none
            ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          `}
                    style={{
                        borderColor: `${accentColor}60`,
                        background: 'rgba(0, 0, 0, 0.3)',
                    }}
                >
                    {/* Left: Icon + Title */}
                    <div className="flex items-center gap-3">
                        <Scan
                            className="w-4 h-4 animate-pulse"
                            style={{ color: accentColor }}
                        />
                        <span
                            className="text-xs font-mono uppercase tracking-[0.2em] font-bold"
                            style={{
                                color: accentColor,
                                textShadow: `0 0 10px ${accentColor}80`
                            }}
                        >
                            {title}
                        </span>
                    </div>

                    {/* Right: Window Controls */}
                    <div className="flex items-center gap-1">
                        {/* Minimize Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMinimized(!isMinimized);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-sm transition-all duration-150 hover:bg-yellow-500/20 group"
                            title="Minimize"
                        >
                            <Minus className="w-3.5 h-3.5 text-slate-500 group-hover:text-yellow-400 transition-colors" />
                        </button>

                        {/* Maximize Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMaximized(!isMaximized);
                                setIsMinimized(false);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-sm transition-all duration-150 hover:bg-green-500/20 group"
                            title="Maximize"
                        >
                            <Square className="w-3 h-3 text-slate-500 group-hover:text-green-400 transition-colors" />
                        </button>

                        {/* Close Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-sm transition-all duration-150 hover:bg-red-500/30 group"
                            title="Close"
                        >
                            <X className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 transition-colors" />
                        </button>
                    </div>
                </div>

                {/* ===== WINDOW CONTENT (Team List) ===== */}
                <AnimatePresence>
                    {!isMinimized && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            {/* Search/Filter Header */}
                            <div
                                className="px-4 py-2 border-b flex items-center gap-2"
                                style={{ borderColor: `${accentColor}30` }}
                            >
                                <span
                                    className="text-[10px] font-mono uppercase tracking-wider opacity-60"
                                    style={{ color: accentColor }}
                                >
                  // {variant === 'teamA' ? 'YOUR TEAM' : variant === 'teamB' ? 'OPPONENT' : 'SELECT TARGET'}
                                </span>
                                <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${accentColor}30, transparent)` }} />
                            </div>

                            {/* Team List - Scrollable */}
                            <div
                                className="max-h-[300px] overflow-y-auto"
                                style={{
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: `${accentColor} rgba(30, 41, 59, 0.3)`
                                }}
                            >
                                {teams.map((team, index) => (
                                    <motion.button
                                        key={team.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        onClick={() => {
                                            onSelect(team.name);
                                            onClose();
                                        }}
                                        className="w-full px-4 py-3 text-left transition-all duration-150 flex items-center justify-between group border-b"
                                        style={{ borderColor: 'rgba(51, 65, 85, 0.2)' }}
                                        whileHover={{
                                            backgroundColor: `${accentColor}15`,
                                            x: 4
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Animated Indicator Bar */}
                                            <motion.div
                                                className="w-1 h-5 rounded-full"
                                                style={{ background: 'rgba(100, 116, 139, 0.4)' }}
                                                whileHover={{
                                                    background: accentColor,
                                                    boxShadow: `0 0 12px ${accentColor}`,
                                                    height: 24
                                                }}
                                            />

                                            {/* Team Name - Tech Style */}
                                            <span className="font-mono text-sm uppercase tracking-wide text-slate-300 group-hover:text-white transition-colors">
                                                {team.name}
                                            </span>
                                        </div>

                                        {/* Region Tag */}
                                        <span
                                            className="text-[10px] font-mono uppercase tracking-wider opacity-40 group-hover:opacity-80 transition-opacity"
                                            style={{ color: accentColor }}
                                        >
                                            {team.region}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Footer Status Bar */}
                            <div
                                className="px-4 py-2 border-t flex items-center justify-between"
                                style={{
                                    borderColor: `${accentColor}30`,
                                    background: 'rgba(0, 0, 0, 0.2)'
                                }}
                            >
                                <span className="text-[10px] font-mono text-slate-600">
                                    {teams.length} TEAMS AVAILABLE
                                </span>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-2 h-2 rounded-full animate-pulse"
                                        style={{ background: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
                                    />
                                    <span
                                        className="text-[10px] font-mono uppercase"
                                        style={{ color: accentColor }}
                                    >
                                        ONLINE
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );

    return createPortal(windowContent, document.body);
}
