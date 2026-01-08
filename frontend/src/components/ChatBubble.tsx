'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Shield, Crosshair, Target, Zap, Brain, Sword } from 'lucide-react';

// ============ RICH WIDGET COMPONENTS ============

interface ProgressBarProps {
    label: string;
    value: number;
    color?: 'red' | 'cyan' | 'green' | 'orange' | 'violet';
}

function ProgressBar({ label, value, color = 'red' }: ProgressBarProps) {
    const [animatedValue, setAnimatedValue] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedValue(value), 100);
        return () => clearTimeout(timer);
    }, [value]);

    const colorSchemes = {
        red: { bg: 'bg-[#ff4655]', glow: 'shadow-[#ff4655]/50', text: 'text-[#ff4655]' },
        cyan: { bg: 'bg-[#00f0ff]', glow: 'shadow-[#00f0ff]/50', text: 'text-[#00f0ff]' },
        green: { bg: 'bg-emerald-500', glow: 'shadow-emerald-500/50', text: 'text-emerald-400' },
        orange: { bg: 'bg-orange-500', glow: 'shadow-orange-500/50', text: 'text-orange-400' },
        violet: { bg: 'bg-violet-500', glow: 'shadow-violet-500/50', text: 'text-violet-400' },
    };

    const scheme = colorSchemes[color];

    return (
        <div className="my-3 p-3 bg-slate-950/50 border border-white/5 rounded-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{label}</span>
                <span className={`text-sm font-bold font-mono ${scheme.text}`}>{value}%</span>
            </div>
            <div className="relative h-2 bg-slate-800/80 overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)' }}>
                <motion.div
                    className={`absolute inset-y-0 left-0 ${scheme.bg} shadow-lg ${scheme.glow}`}
                    initial={{ width: '0%' }}
                    animate={{ width: `${animatedValue}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ clipPath: 'polygon(0 0, 100% 0, 98% 100%, 0% 100%)' }}
                />
            </div>
        </div>
    );
}

interface AgentIconProps {
    name: string;
}

function AgentIcon({ name }: AgentIconProps) {
    // Map agent names to icons
    const agentIcons: Record<string, React.ReactNode> = {
        jett: <Zap className="w-4 h-4" />,
        reyna: <Sword className="w-4 h-4" />,
        sage: <Shield className="w-4 h-4" />,
        sova: <Target className="w-4 h-4" />,
        omen: <Brain className="w-4 h-4" />,
        default: <Crosshair className="w-4 h-4" />,
    };

    const icon = agentIcons[name.toLowerCase()] || agentIcons.default;

    return (
        <span
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#ff4655]/20 border border-[#ff4655]/30 rounded-sm text-[#ff4655] text-xs font-mono uppercase"
            title={name}
        >
            {icon}
            <span>{name}</span>
        </span>
    );
}

interface StatCardProps {
    label: string;
    value: string;
    trend?: 'up' | 'down' | 'neutral';
}

function StatCard({ label, value, trend = 'neutral' }: StatCardProps) {
    const trendColors = {
        up: 'text-emerald-400',
        down: 'text-[#ff4655]',
        neutral: 'text-[#00f0ff]',
    };

    return (
        <div className="inline-flex flex-col items-center p-2 bg-slate-950/50 border border-white/5 min-w-[80px]" style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }}>
            <span className="text-[10px] font-mono text-slate-500 uppercase">{label}</span>
            <span className={`text-lg font-black font-mono ${trendColors[trend]}`}>{value}</span>
        </div>
    );
}

// ============ MESSAGE PARSER ============

interface ParsedContent {
    type: 'text' | 'progress' | 'agent' | 'stat';
    content: string;
    props?: Record<string, unknown>;
}

function parseMessageContent(content: string): ParsedContent[] {
    const parts: ParsedContent[] = [];

    // Regex patterns for widget detection
    const progressPattern = /<ProgressBar\s+label="([^"]+)"\s+value=\{?(\d+)\}?\s*(?:color="([^"]+)")?\s*\/>/g;
    const agentPattern = /<AgentIcon\s+name="([^"]+)"\s*\/>/g;
    const statPattern = /<StatCard\s+label="([^"]+)"\s+value="([^"]+)"\s*(?:trend="([^"]+)")?\s*\/>/g;

    let lastIndex = 0;
    let match;

    // Create a combined pattern to find all widgets
    const combinedPattern = /(<ProgressBar[^>]+\/>|<AgentIcon[^>]+\/>|<StatCard[^>]+\/>)/g;

    while ((match = combinedPattern.exec(content)) !== null) {
        // Add text before this match
        if (match.index > lastIndex) {
            const textContent = content.slice(lastIndex, match.index).trim();
            if (textContent) {
                parts.push({ type: 'text', content: textContent });
            }
        }

        const widgetStr = match[1];

        // Parse specific widget
        if (widgetStr.startsWith('<ProgressBar')) {
            const prMatch = /<ProgressBar\s+label="([^"]+)"\s+value=\{?(\d+)\}?\s*(?:color="([^"]+)")?\s*\/>/.exec(widgetStr);
            if (prMatch) {
                parts.push({
                    type: 'progress',
                    content: '',
                    props: { label: prMatch[1], value: parseInt(prMatch[2]), color: prMatch[3] || 'red' },
                });
            }
        } else if (widgetStr.startsWith('<AgentIcon')) {
            const agMatch = /<AgentIcon\s+name="([^"]+)"\s*\/>/.exec(widgetStr);
            if (agMatch) {
                parts.push({
                    type: 'agent',
                    content: '',
                    props: { name: agMatch[1] },
                });
            }
        } else if (widgetStr.startsWith('<StatCard')) {
            const stMatch = /<StatCard\s+label="([^"]+)"\s+value="([^"]+)"\s*(?:trend="([^"]+)")?\s*\/>/.exec(widgetStr);
            if (stMatch) {
                parts.push({
                    type: 'stat',
                    content: '',
                    props: { label: stMatch[1], value: stMatch[2], trend: stMatch[3] || 'neutral' },
                });
            }
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
        const remainingText = content.slice(lastIndex).trim();
        if (remainingText) {
            parts.push({ type: 'text', content: remainingText });
        }
    }

    // If no widgets found, return entire content as text
    if (parts.length === 0) {
        parts.push({ type: 'text', content });
    }

    return parts;
}

// ============ TYPEWRITER HOOK ============

function useTypewriter(text: string, speed: number = 15, enabled: boolean = true) {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!enabled) {
            setDisplayedText(text);
            setIsComplete(true);
            return;
        }

        setDisplayedText('');
        setIsComplete(false);

        let currentIndex = 0;
        const intervalId = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayedText(text.slice(0, currentIndex + 1));
                currentIndex++;
            } else {
                setIsComplete(true);
                clearInterval(intervalId);
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [text, speed, enabled]);

    return { displayedText, isComplete };
}

// ============ TYPEWRITER TEXT COMPONENT ============

interface TypewriterTextProps {
    text: string;
    speed?: number;
    enabled?: boolean;
}

function TypewriterText({ text, speed = 15, enabled = true }: TypewriterTextProps) {
    const { displayedText, isComplete } = useTypewriter(text, speed, enabled);

    return (
        <span>
            {displayedText}
            {enabled && !isComplete && (
                <span className="inline-block w-2 h-4 bg-[#ff4655] animate-pulse ml-0.5" />
            )}
        </span>
    );
}

// ============ MAIN CHAT BUBBLE COMPONENT ============

export interface ChatBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isNew?: boolean;
    teamColor?: string;
}

export default function ChatBubble({ role, content, timestamp, isNew = false, teamColor }: ChatBubbleProps) {
    const isBot = role === 'assistant';
    const parsedContent = useMemo(() => parseMessageContent(content), [content]);

    // Only apply typewriter to new messages from bot
    const shouldTypewrite = isBot && isNew;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
        >
            {/* Avatar */}
            <div
                className={`flex-shrink-0 w-9 h-9 flex items-center justify-center relative`}
                style={{
                    clipPath: 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)',
                    background: isBot
                        ? 'linear-gradient(135deg, #ff4655, #cc0011)'
                        : 'linear-gradient(135deg, #00f0ff, #0088aa)',
                    boxShadow: isBot
                        ? '0 0 15px rgba(255, 70, 85, 0.4)'
                        : '0 0 15px rgba(0, 240, 255, 0.4)',
                }}
            >
                {isBot ? (
                    <Bot className="w-4 h-4 text-white" />
                ) : (
                    <User className="w-4 h-4 text-white" />
                )}

                {/* Glowing ring */}
                <div
                    className="absolute inset-0 animate-pulse opacity-50"
                    style={{
                        clipPath: 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)',
                        background: isBot
                            ? 'linear-gradient(135deg, #ff4655, transparent)'
                            : 'linear-gradient(135deg, #00f0ff, transparent)',
                        filter: 'blur(4px)',
                    }}
                />
            </div>

            {/* Message Bubble */}
            <div
                className={`relative max-w-[85%] px-4 py-3 ${isBot
                        ? 'bg-slate-900/90 border-l-2 border-[#ff4655]'
                        : 'bg-slate-800/80 border-r-2 border-cyan-500'
                    }`}
                style={{
                    clipPath: isBot
                        ? 'polygon(0 0, 100% 0, 98% 8px, 98% calc(100% - 8px), 100% 100%, 0 100%, 0 100%, 0 0)'
                        : 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 2% calc(100% - 8px), 2% 8px, 0 0, 0 0)',
                }}
            >
                {/* Corner Accent */}
                <div
                    className={`absolute top-0 ${isBot ? 'left-0' : 'right-0'} w-2 h-2`}
                    style={{
                        background: isBot ? '#ff4655' : '#00f0ff',
                        clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                    }}
                />

                {/* Render Content */}
                <div className="text-sm text-white leading-relaxed">
                    {parsedContent.map((part, index) => {
                        switch (part.type) {
                            case 'progress':
                                return (
                                    <ProgressBar
                                        key={index}
                                        label={part.props?.label as string}
                                        value={part.props?.value as number}
                                        color={part.props?.color as ProgressBarProps['color']}
                                    />
                                );
                            case 'agent':
                                return <AgentIcon key={index} name={part.props?.name as string} />;
                            case 'stat':
                                return (
                                    <StatCard
                                        key={index}
                                        label={part.props?.label as string}
                                        value={part.props?.value as string}
                                        trend={part.props?.trend as StatCardProps['trend']}
                                    />
                                );
                            case 'text':
                            default:
                                return (
                                    <span key={index} className="whitespace-pre-wrap">
                                        {shouldTypewrite ? (
                                            <TypewriterText text={part.content} speed={15} enabled={true} />
                                        ) : (
                                            part.content
                                        )}
                                    </span>
                                );
                        }
                    })}
                </div>

                {/* Timestamp */}
                <div
                    className={`mt-2 text-[10px] font-mono uppercase tracking-wider ${isBot ? 'text-slate-600' : 'text-slate-500'
                        }`}
                >
                    {timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </motion.div>
    );
}

// Export sub-components for external use
export { ProgressBar, AgentIcon, StatCard, TypewriterText };
