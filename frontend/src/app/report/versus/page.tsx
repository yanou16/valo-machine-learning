'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Crosshair, Trophy, Map, Target, TrendingUp, ArrowLeft, Loader2, Zap, Skull } from 'lucide-react';
import Link from 'next/link';
import { formatMapName } from '@/lib/mapUtils';

// Types
interface TeamStats {
    name: string;
    series_winrate: number;
    map_winrate: number;
    maps_played: number;
    best_map: string;
    best_map_winrate: number;
    recent_form: string;
    win_probability: number;
    pistol_round_win_rate?: number;
    first_blood_percentage?: number;
}

interface Comparison {
    series_winrate: { team1: number; team2: number; advantage: string };
    map_winrate: { team1: number; team2: number; advantage: string };
    map_pool: { team1: number; team2: number; advantage: string };
    best_map: { team1: { map: string; winrate: number }; team2: { map: string; winrate: number }; advantage: string };
}

interface VersusData {
    team1: TeamStats;
    team2: TeamStats;
    comparison: Comparison;
    prediction_text: string;
}

// Mock data for immediate design preview
const MOCK_DATA: VersusData = {
    team1: {
        name: "Sentinels",
        series_winrate: 70,
        map_winrate: 59,
        maps_played: 7,
        best_map: "Lotus",
        best_map_winrate: 85.7,
        recent_form: "W-W-W-L-W",
        win_probability: 62.5
    },
    team2: {
        name: "LOUD",
        series_winrate: 65,
        map_winrate: 54,
        maps_played: 6,
        best_map: "Bind",
        best_map_winrate: 78.3,
        recent_form: "W-L-W-W-L",
        win_probability: 37.5
    },
    comparison: {
        series_winrate: { team1: 70, team2: 65, advantage: "Sentinels" },
        map_winrate: { team1: 59, team2: 54, advantage: "Sentinels" },
        map_pool: { team1: 7, team2: 6, advantage: "Sentinels" },
        best_map: { team1: { map: "Lotus", winrate: 85.7 }, team2: { map: "Bind", winrate: 78.3 }, advantage: "Sentinels" }
    },
    prediction_text: "Sentinels are favored to win this matchup with their superior map control and consistency across all maps. Their dominance on Lotus (85.7% WR) gives them a significant advantage in map picks. LOUD's only path to victory lies in forcing Bind early in the series and capitalizing on any anti-eco weaknesses."
};

function VersusPageContent() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<VersusData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const team1Param = searchParams.get('team1') || searchParams.get('team');
    const team2Param = searchParams.get('team2') || searchParams.get('opponent');

    useEffect(() => {
        async function fetchData() {
            if (!team1Param || !team2Param) {
                setData(MOCK_DATA);
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:8001/api/report/versus', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ team1_name: team1Param, team2_name: team2Param, match_count: 10 })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch comparison data');
                }

                const result = await response.json();
                setData(result);
            } catch (err) {
                setError((err as Error).message);
                setData(MOCK_DATA); // Fallback to mock
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [team1Param, team2Param]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#ff4655] animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Analyzing matchup...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <p className="text-red-500">{error || 'Failed to load data'}</p>
            </div>
        );
    }

    const { team1, team2, comparison, prediction_text } = data;

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-[#ff4655]/10 via-transparent to-transparent" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-500/10 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Crosshair className="w-5 h-5 text-[#ff4655]" />
                        <span className="font-bold">MATCH PREDICTION</span>
                    </div>
                    <div className="w-20" />
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">

                {/* ========== BATTLE BAR ========== */}
                <motion.section
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    {/* Team Names */}
                    <div className="flex items-center justify-center gap-8 mb-6">
                        <div className="text-right flex-1">
                            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff4655] to-[#ff8080]">
                                {team1.name.toUpperCase()}
                            </h1>
                            <p className="text-slate-500 mt-1">Best Map: {formatMapName(team1.best_map)}</p>
                        </div>

                        {/* VS Badge */}
                        <div className="relative flex-shrink-0">
                            <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full" />
                            <div className="relative w-20 h-20 md:w-24 md:h-24 bg-slate-900 border-4 border-white/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl md:text-3xl font-black text-white">VS</span>
                            </div>
                        </div>

                        <div className="text-left flex-1">
                            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                                {team2.name.toUpperCase()}
                            </h1>
                            <p className="text-slate-500 mt-1">Best Map: {formatMapName(team2.best_map)}</p>
                        </div>
                    </div>

                    {/* Probability Bar */}
                    <div className="relative h-16 bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden">
                        {/* Team 1 Fill */}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${team1.win_probability}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#ff4655] to-[#ff6b77]"
                        />
                        {/* Team 2 Fill */}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${team2.win_probability}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="absolute top-0 right-0 h-full bg-gradient-to-l from-blue-500 to-cyan-500"
                        />

                        {/* Labels */}
                        <div className="absolute inset-0 flex items-center justify-between px-6">
                            <div className="flex items-center gap-3">
                                <Trophy className="w-6 h-6 text-white" />
                                <span className="text-2xl md:text-3xl font-black text-white">{team1.win_probability}%</span>
                            </div>
                            <span className="text-sm text-white/60 font-medium">WIN PROBABILITY</span>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl md:text-3xl font-black text-white">{team2.win_probability}%</span>
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* ========== COMPARISON CARDS ========== */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-12"
                >
                    <h2 className="text-center text-sm uppercase tracking-widest text-slate-500 mb-6">Head-to-Head Stats</h2>

                    <div className="space-y-4">
                        {/* Series Winrate */}
                        <ComparisonRow
                            label="Series Winrate"
                            team1Value={`${comparison.series_winrate.team1}%`}
                            team2Value={`${comparison.series_winrate.team2}%`}
                            advantage={comparison.series_winrate.advantage}
                            team1Name={team1.name}
                            icon={<Trophy className="w-4 h-4" />}
                        />

                        {/* Map Winrate */}
                        <ComparisonRow
                            label="Map Winrate"
                            team1Value={`${comparison.map_winrate.team1}%`}
                            team2Value={`${comparison.map_winrate.team2}%`}
                            advantage={comparison.map_winrate.advantage}
                            team1Name={team1.name}
                            icon={<Map className="w-4 h-4" />}
                        />

                        {/* Map Pool */}
                        <ComparisonRow
                            label="Map Pool Depth"
                            team1Value={`${comparison.map_pool.team1} maps`}
                            team2Value={`${comparison.map_pool.team2} maps`}
                            advantage={comparison.map_pool.advantage}
                            team1Name={team1.name}
                            icon={<Target className="w-4 h-4" />}
                        />

                        {/* Best Map */}
                        <ComparisonRow
                            label="Best Map Performance"
                            team1Value={`${formatMapName(comparison.best_map.team1.map)} (${comparison.best_map.team1.winrate}%)`}
                            team2Value={`${formatMapName(comparison.best_map.team2.map)} (${comparison.best_map.team2.winrate}%)`}
                            advantage={comparison.best_map.advantage}
                            team1Name={team1.name}
                            icon={<TrendingUp className="w-4 h-4" />}
                        />

                        {/* Pistol Round WR */}
                        <ComparisonRow
                            label="Pistol Round WR"
                            team1Value={`${team1.pistol_round_win_rate || 50}%`}
                            team2Value={`${team2.pistol_round_win_rate || 50}%`}
                            advantage={(team1.pistol_round_win_rate || 50) > (team2.pistol_round_win_rate || 50) ? team1.name : team2.name}
                            team1Name={team1.name}
                            icon={<Zap className="w-4 h-4" />}
                        />

                        {/* First Blood % */}
                        <ComparisonRow
                            label="First Blood %"
                            team1Value={`${team1.first_blood_percentage || 50}%`}
                            team2Value={`${team2.first_blood_percentage || 50}%`}
                            advantage={(team1.first_blood_percentage || 50) > (team2.first_blood_percentage || 50) ? team1.name : team2.name}
                            team1Name={team1.name}
                            icon={<Skull className="w-4 h-4" />}
                        />
                    </div>
                </motion.section>

                {/* ========== TACTICAL INSIGHT ========== */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#ff4655]/20 rounded-xl flex items-center justify-center">
                            <Crosshair className="w-5 h-5 text-[#ff4655]" />
                        </div>
                        <h3 className="text-lg font-bold">AI Prediction Insight</h3>
                        {/* Confidence Badge */}
                        <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded ${Math.max(team1.win_probability, team2.win_probability) > 60
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                            {Math.max(team1.win_probability, team2.win_probability) > 60 ? '⚡ HIGH CONFIDENCE' : '⚠️ MODERATE'}
                        </span>
                    </div>
                    {/* Highlighted prediction text */}
                    <p className="text-slate-300 leading-relaxed">
                        {prediction_text.split(' ').map((word, i) => {
                            const isTeamName = word.toLowerCase().includes(team1.name.toLowerCase()) ||
                                word.toLowerCase().includes(team2.name.toLowerCase());
                            const isKeyword = ['dominance', 'advantage', 'superior', 'favored', 'weakness', 'critical'].some(
                                kw => word.toLowerCase().includes(kw)
                            );
                            if (isTeamName || isKeyword) {
                                return <span key={i} className="font-bold text-white">{word} </span>;
                            }
                            return word + ' ';
                        })}
                    </p>
                </motion.section>
            </main>
        </div>
    );
}

// Comparison Row Component
function ComparisonRow({
    label,
    team1Value,
    team2Value,
    advantage,
    team1Name,
    icon
}: {
    label: string;
    team1Value: string;
    team2Value: string;
    advantage: string;
    team1Name: string;
    icon: React.ReactNode;
}) {
    const team1Wins = advantage === team1Name;
    const team2Wins = advantage !== team1Name && advantage !== "Tie";

    return (
        <div className="flex items-center bg-slate-900/30 border border-white/5 rounded-xl p-4">
            {/* Team 1 */}
            <div className={`flex-1 text-right pr-4 ${team1Wins ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span className="text-lg font-bold">{team1Value}</span>
            </div>

            {/* Label */}
            <div className="flex-shrink-0 w-48 text-center">
                <div className="flex items-center justify-center gap-2 text-slate-400">
                    {icon}
                    <span className="text-sm font-medium uppercase tracking-wide">{label}</span>
                </div>
            </div>

            {/* Team 2 */}
            <div className={`flex-1 text-left pl-4 ${team2Wins ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span className="text-lg font-bold">{team2Value}</span>
            </div>
        </div>
    );
}

// Main Export with Suspense
export default function VersusPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#ff4655] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <VersusPageContent />
        </Suspense>
    );
}
