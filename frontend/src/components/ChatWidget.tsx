'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, X, Send, Bot, Loader2, Sparkles,
    HelpCircle, Trash2, Shield, ChevronDown, Wifi
} from 'lucide-react';
import { useReport } from '@/context/ReportContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ChatBubble from './ChatBubble';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isNew?: boolean;
}

interface Team {
    id: string;
    name: string;
    logo: string;
    color: string;
}

const TEAMS: Team[] = [
    { id: 'sentinels', name: 'Sentinels', logo: 'SEN', color: '#ff4655' },
    { id: 'fnatic', name: 'Fnatic', logo: 'FNC', color: '#ff5900' },
    { id: 'cloud9', name: 'Cloud9', logo: 'C9', color: '#00a1e9' },
    { id: 'prx', name: 'Paper Rex', logo: 'PRX', color: '#e60012' },
    { id: 'drx', name: 'DRX', logo: 'DRX', color: '#0057b8' },
    { id: 'loud', name: 'LOUD', logo: 'LLL', color: '#00ff87' },
    { id: 'geng', name: 'Gen.G', logo: 'GEN', color: '#aa8a00' },
    { id: 'nrg', name: 'NRG', logo: 'NRG', color: '#ff4444' },
];

const TACTICAL_CHIPS = [
    { id: 'weaknesses', label: '🚨 WEAKNESSES', prompt: 'What are the main weaknesses and exploitable patterns of this team?' },
    { id: 'maps', label: '🗺️ MAP POOL', prompt: 'What are their best and worst maps based on win rate?' },
    { id: 'playstyle', label: '🧠 PLAYSTYLE', prompt: 'Describe their overall playstyle and tactical tendencies.' },
    { id: 'counter', label: '⚔️ COUNTER', prompt: 'What strategies should we use to counter this team?' },
];

const FAQ_CHIPS = [
    { id: 'exploit', label: '❓ EXPLOIT SCORE', prompt: 'How is the Exploitability Score calculated?' },
    { id: 'ml', label: '🤖 ML MODEL', prompt: 'How does the machine learning model analyze teams?' },
    { id: 'data', label: '📊 DATA SOURCE', prompt: 'Where does ValoML get its data from?' },
];

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [isFaqMode, setIsFaqMode] = useState(false);
    const [showTeamSelector, setShowTeamSelector] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { reportData, hasReport } = useReport();

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Set selected team from report context
    useEffect(() => {
        if (hasReport && reportData?.team_name) {
            const matchingTeam = TEAMS.find(t =>
                t.name.toLowerCase() === reportData.team_name.toLowerCase()
            );
            if (matchingTeam) {
                setSelectedTeam(matchingTeam);
            }
        }
    }, [hasReport, reportData?.team_name]);

    // Add welcome message when opened
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMessage: Message = {
                id: 'welcome',
                role: 'assistant',
                content: selectedTeam
                    ? `🎯 **TACTICAL LINK ESTABLISHED**\n\nAnalyzing **${selectedTeam.name}**. Select a quick action or provide your intel request.`
                    : "⚡ **VALOML COMMAND CHANNEL ACTIVE**\n\nSelect a team above to begin tactical analysis. I can provide intel on strategies, weaknesses, and counter-plays.",
                timestamp: new Date(),
                isNew: true,
            };
            setMessages([welcomeMessage]);
        }
    }, [isOpen, selectedTeam, messages.length]);

    // Build conversation history for context (last 3 exchanges)
    const buildHistoryContext = useCallback(() => {
        const recentMessages = messages.slice(-6); // Last 6 messages (3 exchanges)
        return recentMessages.map(m => ({
            role: m.role,
            content: m.content,
        }));
    }, [messages]);

    const sendMessage = async (messageText?: string) => {
        const text = messageText || inputValue.trim();
        if (!text || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date(),
            isNew: true,
        };

        // Mark old messages as not new
        setMessages(prev => prev.map(m => ({ ...m, isNew: false })));
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Build context from selected team or report
            let contextData = null;
            if (hasReport && reportData?.stats) {
                contextData = {
                    ...reportData.stats,
                    insights: reportData.insights,
                };
            } else if (selectedTeam) {
                contextData = {
                    team_name: selectedTeam.name,
                    note: "Limited data available - generate a full report for detailed analysis."
                };
            }

            // Include conversation history
            const history = buildHistoryContext();

            const response = await fetch('http://localhost:8081/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    context_data: contextData,
                    history: history,
                }),
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
                isNew: true, // This triggers typewriter effect
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "⚠️ **TRANSMISSION ERROR**\n\nUnable to reach the analysis server. Check your connection and retry.",
                timestamp: new Date(),
                isNew: true,
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleChipClick = (prompt: string) => {
        sendMessage(prompt);
    };

    const clearContext = () => {
        setMessages([]);
        setSelectedTeam(null);
    };

    const currentChips = isFaqMode ? FAQ_CHIPS : TACTICAL_CHIPS;

    return (
        <>
            {/* ===== FLOATING BUTTON ===== */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 text-white flex items-center justify-center transition-transform"
                style={{
                    background: 'linear-gradient(135deg, #ff4655, #cc0011)',
                    clipPath: 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)',
                    boxShadow: '0 0 30px rgba(255, 70, 85, 0.5)',
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="TACTICAL COMMS"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                        >
                            <MessageCircle className="w-6 h-6" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pulse indicator when has context */}
                {(hasReport || selectedTeam) && !isOpen && (
                    <span
                        className="absolute top-0 right-0 w-3 h-3 animate-pulse"
                        style={{ background: '#00ff87', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
                    />
                )}
            </motion.button>

            {/* ===== CHAT WINDOW ===== */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-24 right-6 z-50 w-[420px] h-[620px] flex flex-col overflow-hidden"
                        style={{
                            background: 'linear-gradient(180deg, rgba(10, 12, 20, 0.98), rgba(5, 6, 12, 0.99))',
                            border: '1px solid rgba(255, 70, 85, 0.3)',
                            clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
                            boxShadow: '0 0 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 70, 85, 0.2)',
                        }}
                    >
                        {/* ===== HEADER ===== */}
                        <div
                            className="flex items-center justify-between px-4 py-3 border-b border-[#ff4655]/30"
                            style={{ background: 'rgba(255, 70, 85, 0.05)' }}
                        >
                            <div className="flex items-center gap-3">
                                {/* Logo */}
                                <div
                                    className="w-10 h-10 flex items-center justify-center"
                                    style={{
                                        background: 'linear-gradient(135deg, #ff4655, #cc0011)',
                                        clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                                        boxShadow: '0 0 15px rgba(255, 70, 85, 0.4)',
                                    }}
                                >
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3
                                        className="text-sm font-black uppercase tracking-wider"
                                        style={{ fontFamily: "var(--font-rajdhani), 'Rajdhani', sans-serif", color: '#ff4655' }}
                                    >
                                        TACTICAL COMMS
                                    </h3>
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                                        <Wifi className="w-3 h-3 text-emerald-400" />
                                        <span>{selectedTeam ? `TARGET: ${selectedTeam.name}` : 'NO TARGET'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Header Actions */}
                            <div className="flex items-center gap-2">
                                {/* Context Badge */}
                                {(hasReport || selectedTeam) && (
                                    <div
                                        className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono uppercase"
                                        style={{ background: 'rgba(0, 255, 135, 0.1)', border: '1px solid rgba(0, 255, 135, 0.3)', color: '#00ff87' }}
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        <span>INTEL ACTIVE</span>
                                    </div>
                                )}

                                {/* Clear Button */}
                                <button
                                    onClick={clearContext}
                                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-[#ff4655] transition-colors"
                                    title="Clear Context"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* ===== TEAM SELECTOR ===== */}
                        <div className="px-3 py-2 border-b border-white/5" style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
                            <button
                                onClick={() => setShowTeamSelector(!showTeamSelector)}
                                className="w-full flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
                            >
                                <span>// SELECT TARGET</span>
                                <ChevronDown className={cn("w-4 h-4 transition-transform", showTeamSelector && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {showTeamSelector && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="grid grid-cols-4 gap-2 pt-3">
                                            {TEAMS.map((team) => (
                                                <motion.button
                                                    key={team.id}
                                                    onClick={() => {
                                                        setSelectedTeam(team);
                                                        setShowTeamSelector(false);
                                                        setMessages([]); // Reset messages for new team
                                                    }}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className={cn(
                                                        "relative flex flex-col items-center gap-1 p-2 transition-all",
                                                        selectedTeam?.id === team.id
                                                            ? "border-2"
                                                            : "border border-white/10 hover:border-white/20"
                                                    )}
                                                    style={{
                                                        borderColor: selectedTeam?.id === team.id ? team.color : undefined,
                                                        background: selectedTeam?.id === team.id ? `${team.color}15` : 'rgba(255,255,255,0.02)',
                                                        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)',
                                                    }}
                                                >
                                                    {/* Team Icon */}
                                                    <div
                                                        className="w-8 h-8 flex items-center justify-center"
                                                        style={{
                                                            background: `${team.color}30`,
                                                            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                                                            boxShadow: selectedTeam?.id === team.id ? `0 0 10px ${team.color}` : 'none',
                                                        }}
                                                    >
                                                        <Shield className="w-4 h-4" style={{ color: team.color }} />
                                                    </div>
                                                    <span className="text-[10px] font-bold" style={{ color: team.color }}>
                                                        {team.logo}
                                                    </span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ===== MESSAGES ===== */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            {messages.map((message) => (
                                <ChatBubble
                                    key={message.id}
                                    role={message.role}
                                    content={message.content}
                                    timestamp={message.timestamp}
                                    isNew={message.isNew}
                                    teamColor={selectedTeam?.color}
                                />
                            ))}

                            {/* Typing indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-3"
                                >
                                    <div
                                        className="w-9 h-9 flex items-center justify-center"
                                        style={{
                                            background: 'linear-gradient(135deg, #ff4655, #cc0011)',
                                            clipPath: 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)',
                                        }}
                                    >
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                    <div
                                        className="px-4 py-3 bg-slate-900/90 border-l-2 border-[#ff4655]"
                                        style={{ clipPath: 'polygon(0 0, 100% 0, 98% 8px, 98% calc(100% - 8px), 100% 100%, 0 100%)' }}
                                    >
                                        <div className="flex gap-1.5">
                                            <span className="w-2 h-2 bg-[#ff4655] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-[#ff4655] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-[#ff4655] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* ===== QUICK ACTIONS ===== */}
                        <div className="px-3 py-2 border-t border-white/5" style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                                {currentChips.map((chip) => (
                                    <motion.button
                                        key={chip.id}
                                        onClick={() => handleChipClick(chip.prompt)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={isLoading}
                                        className="flex-shrink-0 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                                        style={{
                                            background: 'rgba(255, 70, 85, 0.1)',
                                            border: '1px solid rgba(255, 70, 85, 0.3)',
                                            color: '#ff4655',
                                            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                                        }}
                                    >
                                        {chip.label}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* ===== INPUT AREA ===== */}
                        <div
                            className="p-3 border-t border-[#ff4655]/20"
                            style={{ background: 'rgba(255, 70, 85, 0.03)' }}
                        >
                            <div className="flex gap-2">
                                {/* FAQ Toggle */}
                                <button
                                    onClick={() => setIsFaqMode(!isFaqMode)}
                                    className="w-10 h-10 flex items-center justify-center transition-all"
                                    style={{
                                        background: isFaqMode ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                        border: isFaqMode ? '1px solid rgba(0, 240, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                                        color: isFaqMode ? '#00f0ff' : '#64748b',
                                        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
                                    }}
                                    title={isFaqMode ? "Show Tactical Actions" : "Show FAQ"}
                                >
                                    <HelpCircle className="w-4 h-4" />
                                </button>

                                {/* Text Input */}
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={selectedTeam ? `Intel request for ${selectedTeam.name}...` : "Enter command..."}
                                    className="flex-1 px-4 py-2 bg-slate-900/80 border text-sm text-white placeholder:text-slate-600 focus:outline-none font-mono"
                                    style={{
                                        borderColor: 'rgba(255, 70, 85, 0.3)',
                                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                                    }}
                                    disabled={isLoading}
                                />

                                {/* Send Button */}
                                <button
                                    onClick={() => sendMessage()}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="w-10 h-10 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                                    style={{
                                        background: 'linear-gradient(135deg, #ff4655, #cc0011)',
                                        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
                                        boxShadow: '0 0 15px rgba(255, 70, 85, 0.3)',
                                    }}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </button>
                            </div>

                            {/* Status Bar */}
                            <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-slate-600 uppercase tracking-wider">
                                <span>VALOML v2.0 // TACTICAL INTERFACE</span>
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    SECURE CHANNEL
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
