'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
    Download,
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Target,
    Shield,
    Swords,
    Map,
    Users,
    Loader2,
    CheckCircle2,
    XCircle,
    Zap,
    Activity
} from 'lucide-react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from 'recharts';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// Premium Card Component
function Card({
    children,
    className,
    hover = true
}: {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}) {
    return (
        <div className={cn(
            "relative bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/[0.08] ring-1 ring-white/[0.05]",
            hover && "transition-all duration-300 hover:border-white/[0.15] hover:bg-slate-900/50 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-0.5",
            className
        )}>
            {children}
        </div>
    );
}

// Section Header
function SectionHeader({ icon: Icon, title, iconColor = "text-[#ff4655]", bgColor = "bg-[#ff4655]/10" }: {
    icon: React.ElementType;
    title: string;
    iconColor?: string;
    bgColor?: string;
}) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className={cn("p-2.5 rounded-xl", bgColor)}>
                <Icon className={cn("w-5 h-5", iconColor)} />
            </div>
            <h2 className="text-lg font-semibold text-white tracking-tight">{title}</h2>
        </div>
    );
}

// Mock data
const mockData = {
    team_name: "Sentinels",
    matches_analyzed: 15,
    stats: {
        series_wins: 11,
        series_losses: 4,
        series_win_rate: 73.3,
        map_wins: 28,
        map_losses: 14,
        map_win_rate: 66.7,
        map_stats: {
            "Lotus": { wins: 6, losses: 1 },
            "Ascent": { wins: 6, losses: 2 },
            "Haven": { wins: 5, losses: 3 },
            "Bind": { wins: 4, losses: 2 },
            "Split": { wins: 4, losses: 4 },
            "Icebox": { wins: 3, losses: 2 },
        },
        opponents: {
            "Cloud9": { wins: 2, losses: 0 },
            "100 Thieves": { wins: 2, losses: 1 },
            "NRG Esports": { wins: 1, losses: 1 },
            "LOUD": { wins: 1, losses: 2 },
            "Evil Geniuses": { wins: 2, losses: 0 },
        }
    },
    playstyle: {
        aggression: 78,
        utility: 65,
        trading: 82,
        mapControl: 70,
        economy: 58,
    },
    weaknesses: [
        { severity: "high", text: "Weak anti-eco rounds (37% loss rate)", recommendation: "Exploit second round after pistol wins" },
        { severity: "high", text: "Poor late-round clutches (28% success)", recommendation: "Force 1vX situations" },
        { severity: "medium", text: "Predictable B-site executes on Haven", recommendation: "Stack B with utility" },
        { severity: "medium", text: "Struggles vs. Viper lineups", recommendation: "Run Viper on Bind/Lotus" },
    ],
    report: `## Executive Summary

Sentinels enters this matchup as heavy favorites with a **73% series win rate** over their last 15 matches. However, they show exploitable patterns.

## Key Strategic Observations

### 1. Early Round Vulnerability
- **Anti-eco weakness**: Sentinels loses 37% of anti-eco rounds, significantly above average
- They tend to dry-peek aggressively after winning pistol

### 2. Map Pool Analysis
- **Strongest**: Lotus (86%), Ascent (75%)
- **Weakest**: Split (50%) — force this in veto
- They ban Icebox consistently

### 3. Playstyle Tendencies
- Heavy duelist-focused compositions (avg 2.1 duelists per map)
- Rely on TenZ for opening picks (67% first blood attempts)
- Utility usage peaks in first 30 seconds of rounds

## How to Win

1. **Force Split** in map veto — their weakest map
2. **Play anti-eco passively** — let them over-extend
3. **Run Viper compositions** — no answer for lineups
4. **Target sentinel player** in late rounds — lowest clutch rating
5. **Counter aggression with utility** — save flashes for retakes`,
    ml_analysis: {
        exploitability_score: 62,
    }
};

function ReportContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const teamParam = searchParams.get('team') || '';
    const matchesParam = searchParams.get('matches') || '10';

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState<typeof mockData | null>(null);

    useEffect(() => {
        const fetchReport = async () => {
            if (!teamParam) {
                router.push('/');
                return;
            }

            setLoading(true);
            setError('');

            try {
                const res = await fetch('http://localhost:8001/api/report/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        team_name: teamParam,
                        num_matches: parseInt(matchesParam)
                    }),
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.detail || 'Failed to generate report');
                }

                const reportData = await res.json();
                setData({
                    ...mockData,
                    team_name: reportData.team_name,
                    matches_analyzed: reportData.matches_analyzed,
                    stats: reportData.stats,
                    report: reportData.report,
                    ml_analysis: reportData.ml_analysis || mockData.ml_analysis,
                });
            } catch (err) {
                console.error('API Error:', err);
                setData({ ...mockData, team_name: teamParam });
                setError(err instanceof Error ? err.message : 'Using demo data');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [teamParam, matchesParam, router]);

    const radarData = data ? [
        { stat: 'Aggression', value: data.playstyle?.aggression || 70, fullMark: 100 },
        { stat: 'Utility', value: data.playstyle?.utility || 60, fullMark: 100 },
        { stat: 'Trading', value: data.playstyle?.trading || 75, fullMark: 100 },
        { stat: 'Map Ctrl', value: data.playstyle?.mapControl || 65, fullMark: 100 },
        { stat: 'Economy', value: data.playstyle?.economy || 55, fullMark: 100 },
    ] : [];

    const formatMarkdown = (text: string) => {
        return text
            .replace(/^### (.*$)/gim, '<h3 class="text-sm font-semibold text-white/90 mt-5 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-white mt-6 mb-3 pb-2 border-b border-white/10">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-lg font-bold text-white mb-4">$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#ff4655] font-semibold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>')
            .replace(/^- (.*$)/gim, '<li class="py-0.5 pl-4 relative text-slate-400 text-sm before:content-[\'›\'] before:absolute before:left-0 before:text-[#ff4655]">$1</li>')
            .replace(/^(\d+)\. (.*$)/gim, '<li class="py-0.5 pl-5 relative text-slate-400 text-sm"><span class="absolute left-0 text-[#ff4655] font-mono text-xs">$1.</span>$2</li>')
            .replace(/\n\n/g, '</p><p class="mb-2 text-slate-400 text-sm leading-relaxed">')
            .replace(/\n/g, '<br />');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,70,85,0.1),transparent_70%)]" />
                <div className="text-center relative z-10">
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-[#ff4655] blur-2xl opacity-30 animate-pulse" />
                        <Loader2 className="w-12 h-12 text-[#ff4655] animate-spin relative" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2 tracking-tight">Generating Intel</h2>
                    <p className="text-slate-500">Analysing {teamParam}...</p>
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#ff4655] animate-pulse" />
                        <span className="text-xs text-slate-600 font-mono">PROCESSING</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Intel Unavailable</h2>
                    <p className="text-slate-500 mb-4">{error || 'Something went wrong'}</p>
                    <Link href="/" className="text-[#ff4655] hover:underline">Return to base</Link>
                </div>
            </div>
        );
    }

    const winRate = data.stats.series_win_rate ||
        (data.stats.series_wins / (data.stats.series_wins + data.stats.series_losses) * 100);

    return (
        <div className="min-h-screen bg-black relative">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.1),transparent)]" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,70,85,0.05),transparent_50%)]" />

            {/* Grid Pattern */}
            <div
                className="fixed inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px'
                }}
            />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left */}
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm hidden sm:inline">Back</span>
                            </Link>

                            <div className="h-5 w-px bg-white/10" />

                            <div className="flex items-center gap-4">
                                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{data.team_name}</h1>
                                <span className={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide",
                                    winRate >= 60
                                        ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                                        : winRate >= 45
                                            ? "bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20"
                                            : "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
                                )}>
                                    {winRate >= 50 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {winRate.toFixed(1)}% WR
                                </span>
                            </div>
                        </div>

                        {/* Right */}
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
                                <Activity className="w-4 h-4" />
                                <span>{data.matches_analyzed} matches</span>
                            </div>
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 rounded-xl text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-white/5 group"
                            >
                                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span className="hidden sm:inline">Export PDF</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Error Banner */}
            {error && (
                <div className="bg-yellow-500/5 border-b border-yellow-500/10 px-4 py-2.5">
                    <div className="max-w-7xl mx-auto flex items-center gap-2 text-yellow-400/80 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-mono text-xs">{error}</span>
                        <span className="text-yellow-500/40">— Demo mode active</span>
                    </div>
                </div>
            )}

            {/* Bento Grid */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Section A: The Winning Strategy */}
                    <Card className="lg:col-span-2 p-6">
                        <SectionHeader icon={Target} title="The Winning Strategy" />
                        <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: formatMarkdown(data.report) }}
                        />
                    </Card>

                    {/* Right Column Stack */}
                    <div className="space-y-6">
                        {/* Playstyle Radar */}
                        <Card className="p-6">
                            <SectionHeader icon={Swords} title="Playstyle Profile" iconColor="text-blue-400" bgColor="bg-blue-500/10" />
                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={radarData} margin={{ top: 20, right: 25, bottom: 20, left: 25 }}>
                                        <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                        <PolarAngleAxis
                                            dataKey="stat"
                                            tick={{ fill: 'rgba(148,163,184,0.8)', fontSize: 10 }}
                                        />
                                        <PolarRadiusAxis
                                            angle={90}
                                            domain={[0, 100]}
                                            tick={{ fill: 'rgba(100,116,139,0.6)', fontSize: 9 }}
                                            axisLine={false}
                                        />
                                        <Radar
                                            dataKey="value"
                                            stroke="#ff4655"
                                            fill="#ff4655"
                                            fillOpacity={0.15}
                                            strokeWidth={2}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Exploitability Score */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-[#ff4655]" />
                                    <span className="text-sm text-slate-400">Exploitability</span>
                                </div>
                                <span className="text-3xl font-bold text-white font-mono">
                                    {data.ml_analysis?.exploitability_score || 62}
                                    <span className="text-base text-slate-600">/100</span>
                                </span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-[#ff4655] transition-all duration-1000"
                                    style={{ width: `${data.ml_analysis?.exploitability_score || 62}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-600 mt-3">
                                Higher = more vulnerabilities detected
                            </p>
                        </Card>
                    </div>

                    {/* Section C: Map Pool */}
                    <Card className="p-6">
                        <SectionHeader icon={Map} title="Map Pool" iconColor="text-purple-400" bgColor="bg-purple-500/10" />
                        <div className="space-y-4">
                            {Object.entries(data.stats.map_stats || {}).slice(0, 6).map(([mapName, stats]) => {
                                const total = stats.wins + stats.losses;
                                const winRate = total > 0 ? Math.round((stats.wins / total) * 100) : 0;

                                return (
                                    <div key={mapName} className="group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-white/80 capitalize font-medium">{mapName}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-slate-600 font-mono">
                                                    {stats.wins}W {stats.losses}L
                                                </span>
                                                <span className={cn(
                                                    "text-sm font-semibold font-mono tabular-nums",
                                                    winRate >= 65 ? "text-emerald-400" :
                                                        winRate >= 45 ? "text-yellow-400" :
                                                            "text-red-400"
                                                )}>
                                                    {winRate}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-700 group-hover:opacity-100 opacity-80",
                                                    winRate >= 65 ? "bg-gradient-to-r from-emerald-600 to-emerald-400" :
                                                        winRate >= 45 ? "bg-gradient-to-r from-yellow-600 to-yellow-400" :
                                                            "bg-gradient-to-r from-red-600 to-red-400"
                                                )}
                                                style={{ width: `${winRate}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Section D: Weakness Scanner */}
                    <Card className="lg:col-span-2 p-6">
                        <SectionHeader icon={AlertTriangle} title="Weakness Scanner" iconColor="text-red-400" bgColor="bg-red-500/10" />
                        <div className="grid sm:grid-cols-2 gap-4">
                            {(data.weaknesses || mockData.weaknesses).map((weakness, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "p-4 rounded-xl border-l-2 transition-all duration-200 hover:scale-[1.02]",
                                        weakness.severity === 'high'
                                            ? "bg-red-500/5 border-red-500 hover:bg-red-500/10"
                                            : "bg-yellow-500/5 border-yellow-500 hover:bg-yellow-500/10"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            "p-1.5 rounded-lg mt-0.5",
                                            weakness.severity === 'high' ? "bg-red-500/10" : "bg-yellow-500/10"
                                        )}>
                                            {weakness.severity === 'high'
                                                ? <XCircle className="w-4 h-4 text-red-400" />
                                                : <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white/90 font-medium mb-1">{weakness.text}</p>
                                            <p className="text-xs text-slate-500">
                                                <span className="text-slate-600">→</span> {weakness.recommendation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Recent Opponents */}
                    <Card className="p-6">
                        <SectionHeader icon={Users} title="Recent Opponents" iconColor="text-cyan-400" bgColor="bg-cyan-500/10" />
                        <div className="space-y-1">
                            {Object.entries(data.stats.opponents || {}).slice(0, 5).map(([opponent, stats]) => {
                                const isWinning = stats.wins > stats.losses;
                                return (
                                    <div
                                        key={opponent}
                                        className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 group hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors"
                                    >
                                        <span className="text-sm text-white/80 group-hover:text-white transition-colors">{opponent}</span>
                                        <div className="flex items-center gap-2">
                                            {isWinning
                                                ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                : <XCircle className="w-4 h-4 text-red-400" />
                                            }
                                            <span className={cn(
                                                "text-sm font-mono font-medium tabular-nums",
                                                isWinning ? "text-emerald-400" : "text-red-400"
                                            )}>
                                                {stats.wins}-{stats.losses}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default function ReportPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-[#ff4655] blur-2xl opacity-30 animate-pulse" />
                    <Loader2 className="w-12 h-12 text-[#ff4655] animate-spin relative" />
                </div>
            </div>
        }>
            <ReportContent />
        </Suspense>
    );
}
