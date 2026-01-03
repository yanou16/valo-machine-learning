'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, X, Send, Bot, User, Loader2, Sparkles,
    HelpCircle, AlertTriangle, Map, Crosshair, Brain
} from 'lucide-react';
import { useReport } from '@/context/ReportContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
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
];

const TACTICAL_CHIPS = [
    { id: 'weaknesses', label: '🚨 Weaknesses', prompt: 'What are the main weaknesses and exploitable patterns of this team?' },
    { id: 'maps', label: '🗺️ Best Maps', prompt: 'What are their best and worst maps based on win rate?' },
    { id: 'pistol', label: '🔫 Pistol Stats', prompt: 'How does this team perform in pistol rounds and eco rounds?' },
    { id: 'playstyle', label: '🧠 Playstyle', prompt: 'Describe their overall playstyle and tactical tendencies.' },
];

const FAQ_CHIPS = [
    { id: 'exploit', label: '❓ Exploitability Score', prompt: 'How is the Exploitability Score calculated?' },
    { id: 'wr', label: '❓ What is WR?', prompt: 'What does WR (Win Rate) mean in this context?' },
    { id: 'clustering', label: '❓ AI Clustering', prompt: 'How does the K-Means clustering analysis work?' },
    { id: 'export', label: '📄 Export PDF', prompt: 'How can I export this report as a PDF?' },
];

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [isFaqMode, setIsFaqMode] = useState(false);
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
                    ? `Ready to analyze **${selectedTeam.name}**! Select a quick action or ask me anything about their performance.`
                    : "Welcome to ValoML! Select a team above or generate a report to unlock tactical insights. I can still answer general questions.",
                timestamp: new Date(),
            };
            setMessages([welcomeMessage]);
        }
    }, [isOpen, selectedTeam, messages.length]);

    const sendMessage = async (messageText?: string) => {
        const text = messageText || inputValue.trim();
        if (!text || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date(),
        };

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
                // Minimal context for selected team without report
                contextData = {
                    team_name: selectedTeam.name,
                    note: "Limited data available - generate a full report for detailed analysis."
                };
            }

            const response = await fetch('http://localhost:8001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    context_data: contextData,
                }),
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sorry, I encountered an error. Please try again.",
                timestamp: new Date(),
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

    const currentChips = isFaqMode ? FAQ_CHIPS : TACTICAL_CHIPS;

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#ff4655] to-[#ff6b77] text-white shadow-lg shadow-[#ff4655]/30 flex items-center justify-center hover:scale-110 transition-transform"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Ask AI Analyst"
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
                    <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-24 right-6 z-50 w-[400px] h-[580px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-[#ff4655] to-[#ff6b77] rounded-lg flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">ValoML Assistant</h3>
                                    <p className="text-xs text-slate-500">
                                        {selectedTeam ? `Analyzing ${selectedTeam.name}` : 'Select a team'}
                                    </p>
                                </div>
                            </div>
                            {(hasReport || selectedTeam) && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 rounded-full">
                                    <Sparkles className="w-3 h-3 text-emerald-400" />
                                    <span className="text-xs text-emerald-400">Context Active</span>
                                </div>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    {/* Avatar */}
                                    <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${message.role === 'user'
                                            ? 'bg-blue-500/20'
                                            : 'bg-[#ff4655]/20'
                                        }`}>
                                        {message.role === 'user' ? (
                                            <User className="w-4 h-4 text-blue-400" />
                                        ) : (
                                            <Bot className="w-4 h-4 text-[#ff4655]" />
                                        )}
                                    </div>

                                    {/* Bubble */}
                                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${message.role === 'user'
                                            ? 'bg-blue-500/20 text-blue-100 rounded-br-none'
                                            : 'bg-white/5 text-slate-300 rounded-bl-none'
                                        }`}>
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing indicator */}
                            {isLoading && (
                                <div className="flex gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-[#ff4655]/20 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-[#ff4655]" />
                                    </div>
                                    <div className="px-3 py-2 bg-white/5 rounded-xl rounded-bl-none">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* ========== INPUT AREA WITH SELECTORS ========== */}
                        <div className="border-t border-white/10 bg-slate-900/80">

                            {/* Layer 1: Team Selector */}
                            <div className="px-3 py-2 border-b border-white/5">
                                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                                    {TEAMS.map((team) => (
                                        <motion.button
                                            key={team.id}
                                            onClick={() => setSelectedTeam(team)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                                                selectedTeam?.id === team.id
                                                    ? "ring-2 ring-offset-2 ring-offset-slate-900"
                                                    : "opacity-60 hover:opacity-100"
                                            )}
                                            style={{
                                                backgroundColor: `${team.color}20`,
                                                color: team.color,
                                                ringColor: selectedTeam?.id === team.id ? team.color : undefined,
                                            }}
                                            title={team.name}
                                        >
                                            {team.logo}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Layer 2: Quick Actions / FAQ Chips */}
                            <div className="px-3 py-2 border-b border-white/5">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={isFaqMode ? 'faq' : 'tactical'}
                                        initial={{ opacity: 0, x: isFaqMode ? 20 : -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: isFaqMode ? -20 : 20 }}
                                        className="flex items-center gap-2 overflow-x-auto scrollbar-none"
                                    >
                                        {currentChips.map((chip) => (
                                            <motion.button
                                                key={chip.id}
                                                onClick={() => handleChipClick(chip.prompt)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                disabled={isLoading}
                                                className={cn(
                                                    "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                                    "bg-white/5 border border-white/10 text-slate-400",
                                                    "hover:bg-white/10 hover:text-white hover:border-white/20",
                                                    "disabled:opacity-50 disabled:cursor-not-allowed"
                                                )}
                                            >
                                                {chip.label}
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Layer 3: Input */}
                            <div className="p-3">
                                <div className="flex gap-2">
                                    {/* FAQ Toggle */}
                                    <button
                                        onClick={() => setIsFaqMode(!isFaqMode)}
                                        className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                            isFaqMode
                                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                                : "bg-white/5 text-slate-500 border border-white/10 hover:text-white"
                                        )}
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
                                        placeholder={selectedTeam ? `Ask about ${selectedTeam.name}...` : "Ask anything..."}
                                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff4655]/40 focus:ring-1 focus:ring-[#ff4655]/20"
                                        disabled={isLoading}
                                    />

                                    {/* Send Button */}
                                    <button
                                        onClick={() => sendMessage()}
                                        disabled={!inputValue.trim() || isLoading}
                                        className="w-10 h-10 bg-gradient-to-br from-[#ff4655] to-[#ff6b77] rounded-xl flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
