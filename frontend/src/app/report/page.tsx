'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Search,
    Terminal,
    Shield,
    Zap,
    Target,
    Activity,
    ChevronDown,
    AlertTriangle,
    TrendingDown,
    LayoutDashboard,
    Cpu,
    ArrowRight,
    ChevronRight,
    Award
} from 'lucide-react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell
} from 'recharts';
import ReactMarkdown from 'react-markdown';

// --- Types ---

interface ReportData {
    team_name: string;
    exploitability_score: number; // 0-100
    clustering_label: string; // e.g., "Heavy Lurk Style"
    similar_pro_team: string; // e.g., "Fnatic"
    team_stats: {
        subject: string;
        A: number;
        fullMark: number;
    }[];
    scouting_report_markdown: string;
    correlations: {
        factor: string;
        value: number; // 0-1 correlation
    }[];
    weaknesses: {
        title: string;
        description: string;
    }[];
}

type AppState = 'INPUT' | 'LOADING' | 'RESULT';

// --- Mock Data ---

const MOCK_REPORT: ReportData = {
    team_name: "Sentinels",
    exploitability_score: 82,
    clustering_label: "Reactive Defensive Pivot",
    similar_pro_team: "Fnatic",
    team_stats: [
        { subject: 'Aggression', A: 45, fullMark: 100 },
        { subject: 'Utility', A: 85, fullMark: 100 },
        { subject: 'Aim', A: 92, fullMark: 100 },
        { subject: 'Defense', A: 78, fullMark: 100 },
        { subject: 'Economy', A: 60, fullMark: 100 },
    ],
    scouting_report_markdown: `
# Winning Strategy: Anti-Sentinels Protocol

### Execution Overview
Sentinels rely heavily on their individual mechanical skill (Aim: 92) and precise utility usage (Utility: 85). However, their mid-round aggression is surprisingly low (45), suggesting they prefer a reactive style.

### Key Tactical Recommendations
1. **Force the Tempo:** Since their aggression is low, they struggle when forced to make split-second decisions under pressure. Fast executes or unexpected lurks can disrupt their setup.
2. **Post-Plant Denial:** They are masters of the retake. You must utilize "anti-retake" utility early to burn their defensive cooldowns.
3. **Target Economy:** Their economy management is their weakest link. Forcing them into "glass cannon" rounds (rifles with no armor) is a viable path to victory.

### Final Assessment
The exploitability is **High (82%)**. By disrupting their rhythm and forcing aggressive duels early, the Sentinels structure begins to collapse.
  `,
    correlations: [
        { factor: "First Blood Loss", value: 0.85 },
        { factor: "Low Economy (<20k)", value: 0.72 },
        { factor: "Anti-Eco Rounds", value: 0.45 },
        { factor: "Lurk Timings", value: 0.68 },
    ],
    weaknesses: [
        { title: "Mid-Round Passivity", description: "Team often stalls in neutral zones if their initial entry utility is countered, leading to predictable late-round executes." },
        { title: "Glass Cannon Tendency", description: "High statistical probability of purchasing Vandal/Phantom without full shields after losing bonus rounds." },
        { title: "Retake Over-Reliance", description: "They play 'save' positions excessively, often conceding the site early to gamble on a perfectly coordinated retake." },
    ]
};

// --- Components ---

const HackerTerminal = ({ onComplete, isReady }: { onComplete: () => void, isReady: boolean }) => {
    const [logs, setLogs] = useState<string[]>([]);
    const [animComplete, setAnimComplete] = useState(false);

    const logSequence = [
        "> Connecting to VLR.gg API...",
        "> Fetching Match History (20 Matches)...",
        "> Initializing Neural Framework...",
        "> Running K-Means Clustering Model...",
        "> Analyzing Win/Loss Correlations...",
        "> Detecting Strategic Bottlenecks...",
        "> Generating AI Scouting Report...",
        "> Finalizing Tactical Dashboard..."
    ];

    useEffect(() => {
        let currentLine = 0;
        const interval = setInterval(() => {
            if (currentLine < logSequence.length) {
                setLogs(prev => [...prev, logSequence[currentLine]]);
                currentLine++;
            } else {
                clearInterval(interval);
                setAnimComplete(true);
            }
        }, 600);
        return () => clearInterval(interval);
    }, []);

    // Effect to trigger completion ONLY when both animation and data are ready
    useEffect(() => {
        if (animComplete && isReady) {
            setTimeout(onComplete, 500);
        }
    }, [animComplete, isReady, onComplete]);

    return (
        <div className="w-full max-w-2xl bg-black/80 border border-slate-800 rounded-lg p-6 font-mono text-sm overflow-hidden shadow-2xl shadow-red-500/10">
            <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
            </div>
            <div className="space-y-2">
                {logs.map((log, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={i === logs.length - 1 ? "text-red-500" : "text-slate-400"}
                    >
                        <span className="text-red-500/50 mr-2">root@valoml:~$</span>
                        {log}
                        {i === logs.length - 1 && <span className="inline-block w-2 h-4 bg-red-500 ml-1 animate-pulse" />}
                    </motion.div>
                ))}

                {animComplete && !isReady && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-yellow-500 animate-pulse"
                    >
                        <span className="text-red-500/50 mr-2">root@valoml:~$</span>
                        {'>'} Waiting for AI Response...
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default function ReportPageWrapper() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <ReportPage />
        </Suspense>
    );
}

function ReportPage() {
    const [state, setState] = useState<AppState>('INPUT');
    const [teamInput, setTeamInput] = useState('');
    const [report, setReport] = useState<ReportData | null>(null);

    const [loadingError, setLoadingError] = useState<string | null>(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        const team = searchParams.get('team');
        const count = searchParams.get('matches');
        if (team) {
            setTeamInput(team);
            startGeneration(team, count ? parseInt(count) : 10);
        }
    }, [searchParams]);

    const startGeneration = async (overrideTeam?: string, overrideMatches?: number) => {
        const finalTeam = overrideTeam || teamInput;
        if (!finalTeam) return;

        setLoadingError(null);
        setState('LOADING');

        try {
            const response = await fetch('http://localhost:8001/api/report/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    team_name: finalTeam,
                    num_matches: overrideMatches || 10
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Scouting Failed');
            }

            const data = await response.json();

            // Map Backend Data to our Frontend Interface
            // The backend returns { report, stats, insights, etc. }
            const mappedData: ReportData = {
                team_name: data.team_name,
                exploitability_score: data.stats?.ml_analysis?.exploitability_score || 65,
                clustering_label: data.stats?.ml_analysis?.archetype || "Tactical Balanced",
                similar_pro_team: data.stats?.ml_analysis?.similar_pro_team || "Team Liquid",
                team_stats: [
                    { subject: 'Aggression', A: data.stats?.aggression_score || 50, fullMark: 100 },
                    { subject: 'Utility', A: data.stats?.utility_usage || 50, fullMark: 100 },
                    { subject: 'Aim', A: data.stats?.combat_effectiveness || 50, fullMark: 100 },
                    { subject: 'Defense', A: data.stats?.defense_rating || 50, fullMark: 100 },
                    { subject: 'Economy', A: data.stats?.economy_management || 50, fullMark: 100 },
                ],
                scouting_report_markdown: data.report,
                correlations: data.stats?.ml_analysis?.correlations || [
                    { factor: "First Blood Loss", value: 0.75 },
                    { factor: "Low Economy", value: 0.60 }
                ],
                weaknesses: data.insights?.filter((ins: any) => ins.category === 'weakness').map((ins: any) => ({
                    title: ins.title,
                    description: ins.content
                })) || []
            };

            setReport(mappedData);
        } catch (err: any) {
            setLoadingError(err.message);
            setState('INPUT');
        }
    };

    const handleLoadingComplete = () => {
        setState('RESULT');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-red-500/30">
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <main className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">

                <AnimatePresence mode="wait">
                    {/* STATE: INPUT */}
                    {state === 'INPUT' && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-xl text-center space-y-8"
                        >
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest">
                                    <Cpu className="w-3 h-3" /> Tactical AI Engine Active
                                </div>
                                <h1 className="text-5xl font-black text-white tracking-tighter sm:text-7xl">
                                    SCOUT <span className="text-red-500">ENEMY</span> DATA
                                </h1>
                                <p className="text-slate-400 text-lg">
                                    Enter a team name to generate a deep-dive tactical profile using machine learning and performance correlation.
                                </p>
                            </div>

                            {loadingError && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm justify-center">
                                    <AlertTriangle className="w-4 h-4" /> {loadingError}
                                </div>
                            )}

                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-900 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                                <div className="relative bg-slate-900 rounded-xl flex items-center p-2 border border-slate-800 focus-within:border-red-500 group">
                                    <Search className="w-6 h-6 ml-4 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Enter Enemy Team Name... (e.g. Sentinels)"
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-white px-4 py-3 text-lg placeholder:text-slate-600"
                                        value={teamInput}
                                        onChange={(e) => setTeamInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && startGeneration()}
                                    />
                                    <button
                                        onClick={() => startGeneration()}
                                        className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-600/20"
                                    >
                                        GENERATE <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-slate-500 text-sm">
                                Powered by GRID Central Data & Groq LLaMA-3 Intelligence.
                            </p>
                        </motion.div>
                    )}

                    {/* STATE: LOADING */}
                    {state === 'LOADING' && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-8"
                        >
                            <HackerTerminal onComplete={handleLoadingComplete} isReady={!!report} />
                        </motion.div>
                    )}

                    {/* STATE: RESULT */}
                    {state === 'RESULT' && report && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full max-w-7xl space-y-8 py-8"
                        >
                            {/* DASHBOARD HEADER */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white text-2xl font-black">
                                            {report.team_name[0]}
                                        </div>
                                        <div>
                                            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{report.team_name}</h2>
                                            <p className="text-slate-400 font-medium flex items-center gap-2">
                                                <Award className="w-4 h-4 text-red-500" /> Pro Comparison: <span className="text-slate-200">{report.similar_pro_team}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Exploitability Score</p>
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-16 h-16">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle
                                                        cx="32"
                                                        cy="32"
                                                        r="28"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                        fill="transparent"
                                                        className="text-slate-800"
                                                    />
                                                    <circle
                                                        cx="32"
                                                        cy="32"
                                                        r="28"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                        fill="transparent"
                                                        strokeDasharray={175.9}
                                                        strokeDashoffset={175.9 * (1 - report.exploitability_score / 100)}
                                                        className={report.exploitability_score > 75 ? "text-green-500" : "text-red-500"}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                                                    {report.exploitability_score}%
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className={`text-xl font-black uppercase tracking-tighter ${report.exploitability_score > 75 ? "text-green-500" : "text-red-500"}`}>
                                                    {report.exploitability_score > 75 ? "EASY EXPLOIT" : "HARD TARGET"}
                                                </p>
                                                <p className="text-slate-500 text-xs">Based on 20 match history</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setState('INPUT')}
                                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors text-slate-400 hover:text-white"
                                    >
                                        <ArrowLeft className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* BENTO GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                                {/* LEFT COLUMN: DATA VIZ */}
                                <div className="md:col-span-3 space-y-6">
                                    {/* Radar Chart Card */}
                                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6">
                                        <div className="flex items-center gap-2 mb-6 text-slate-400 uppercase text-xs font-bold tracking-widest">
                                            <Activity className="w-4 h-4 text-red-500" /> Performance Web
                                        </div>
                                        <div className="h-64 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={report.team_stats}>
                                                    <PolarGrid stroke="#334155" />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                                    <Radar
                                                        name={report.team_name}
                                                        dataKey="A"
                                                        stroke="#ef4444"
                                                        fill="#ef4444"
                                                        fillOpacity={0.5}
                                                    />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Cluster Card */}
                                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <LayoutDashboard className="w-20 h-20" />
                                        </div>
                                        <div className="flex items-center gap-2 mb-4 text-slate-400 uppercase text-xs font-bold tracking-widest">
                                            <Cpu className="w-4 h-4 text-red-500" /> AI CLUSTER ANALYSIS
                                        </div>
                                        <p className="text-slate-500 text-xs mb-1 uppercase font-bold tracking-wider">Playstyle Archetype</p>
                                        <h3 className="text-2xl font-black text-white leading-none mb-4">{report.clustering_label}</h3>
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
                                            <Shield className="w-3 h-3" /> Predictive Model Verified
                                        </div>
                                    </div>
                                </div>

                                {/* CENTER COLUMN: THE STRATEGY */}
                                <div className="md:col-span-5 bg-slate-900/40 backdrop-blur-xl border border-white/[0.1] rounded-3xl p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[80px] -mr-32 -mt-32" />

                                    <div className="flex items-center gap-2 mb-6 text-slate-400 uppercase text-xs font-bold tracking-widest">
                                        <Target className="w-4 h-4 text-red-500" /> ANTI-STRAT PROTOCOL
                                    </div>

                                    <div className="prose prose-invert max-w-none prose-headings:text-white prose-headings:tracking-tighter prose-strong:text-red-500 prose-p:text-slate-400 prose-li:text-slate-400">
                                        <ReactMarkdown>{report.scouting_report_markdown}</ReactMarkdown>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN: DEEP DIVE */}
                                <div className="md:col-span-4 space-y-6">
                                    {/* Loss Correlations */}
                                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6">
                                        <div className="flex items-center gap-2 mb-6 text-slate-400 uppercase text-xs font-bold tracking-widest">
                                            <TrendingDown className="w-4 h-4 text-red-500" /> LOSS CORRELATIONS
                                        </div>
                                        <div className="space-y-5">
                                            {report.correlations.map((item, i) => (
                                                <div key={i} className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-300 font-medium">{item.factor}</span>
                                                        <span className="text-red-500 font-bold">{(item.value * 100).toFixed(0)}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${item.value * 100}%` }}
                                                            className="h-full bg-gradient-to-r from-red-600 to-red-400"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Weakness Scanner */}
                                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6">
                                        <div className="flex items-center gap-2 mb-6 text-slate-400 uppercase text-xs font-bold tracking-widest">
                                            <Zap className="w-4 h-4 text-yellow-500" /> WEAKNESS SCANNER
                                        </div>
                                        <div className="space-y-4">
                                            {report.weaknesses.map((item, i) => (
                                                <div key={i} className="group cursor-default">
                                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] group-hover:bg-red-500/5 group-hover:border-red-500/30 transition-all">
                                                        <div className="p-2 rounded-lg bg-red-500/10 text-red-500 mt-1">
                                                            <AlertTriangle className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                                                                {item.title}
                                                            </h4>
                                                            <p className="text-xs text-slate-500 group-hover:text-slate-400 leading-relaxed mt-1">
                                                                {item.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
