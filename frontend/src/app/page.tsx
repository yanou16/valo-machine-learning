'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  ChevronDown,
  Crosshair,
  Sparkles,
  Brain,
  Target,
  Zap,
  BarChart3,
  Github,
  ArrowRight,
  Menu,
  X,
  Shield,
  Users
} from 'lucide-react';
import Image from 'next/image';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ThemeToggle } from '@/components/ThemeToggle';
import TeamSelectionWindow from '@/components/TeamSelectionWindow';
import StatsSectionHud from '@/components/StatsSectionHud';
import FeaturesSectionHud from '@/components/FeaturesSectionHud';
import CtaSection from '@/components/CtaSection';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [matchCount, setMatchCount] = useState(10);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Dual Mode State
  const [searchMode, setSearchMode] = useState<'scouting' | 'versus'>('scouting');
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [showTeamASelector, setShowTeamASelector] = useState(false);
  const [showTeamBSelector, setShowTeamBSelector] = useState(false);

  // Refs for Portal positioning
  const scoutingSelectorRef = useRef<HTMLButtonElement>(null);
  const teamASelectorRef = useRef<HTMLButtonElement>(null);
  const teamBSelectorRef = useRef<HTMLButtonElement>(null);

  const popularTeams = [
    // Americas
    { name: 'Sentinels', region: 'Americas' },
    { name: 'Cloud9', region: 'Americas' },
    { name: 'LOUD', region: 'Americas' },
    { name: '100 Thieves', region: 'Americas' },
    { name: 'NRG', region: 'Americas' },
    { name: 'Evil Geniuses', region: 'Americas' },
    { name: 'Leviatan', region: 'Americas' },
    { name: 'FURIA', region: 'Americas' },
    { name: 'KRU Esports', region: 'Americas' },
    { name: 'MIBR', region: 'Americas' },
    // Pacific
    { name: 'Paper Rex', region: 'Pacific' },
    { name: 'DRX', region: 'Pacific' },
    { name: 'T1', region: 'Pacific' },
    { name: 'Gen.G', region: 'Pacific' },
    { name: 'ZETA DIVISION', region: 'Pacific' },
    { name: 'DetonatioN FocusMe', region: 'Pacific' },
    { name: 'Team Secret', region: 'Pacific' },
    { name: 'Talon Esports', region: 'Pacific' },
    { name: 'Global Esports', region: 'Pacific' },
    { name: 'Rex Regum Qeon', region: 'Pacific' },
    // EMEA
    { name: 'Fnatic', region: 'EMEA' },
    { name: 'Team Vitality', region: 'EMEA' },
    { name: 'Team Liquid', region: 'EMEA' },
    { name: 'Karmine Corp', region: 'EMEA' },
    { name: 'NAVI', region: 'EMEA' },
    { name: 'FUT Esports', region: 'EMEA' },
    { name: 'Giants Gaming', region: 'EMEA' },
    { name: 'BBL Esports', region: 'EMEA' },
    { name: 'Team Heretics', region: 'EMEA' },
    { name: 'KOI', region: 'EMEA' },
    // China
    { name: 'EDward Gaming', region: 'China' },
    { name: 'Bilibili Gaming', region: 'China' },
    { name: 'FunPlus Phoenix', region: 'China' },
    { name: 'JD Gaming', region: 'China' },
    { name: 'All Gamers', region: 'China' },
  ];


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGenerate = () => {
    if (teamName.trim()) {
      router.push(`/report?team=${encodeURIComponent(teamName)}&matches=${matchCount}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleGenerate();
  };

  const handleVersusPredict = () => {
    if (teamA.trim() && teamB.trim()) {
      router.push(`/report/versus?team1=${encodeURIComponent(teamA)}&team2=${encodeURIComponent(teamB)}`);
    }
  };

  const stats = [
    { value: '50,000+', label: 'VCT Rounds Analyzed' },
    { value: '98%', label: 'Prediction Accuracy' },
    { value: '200+', label: 'Teams Tracked' },
    { value: '<2s', label: 'Report Generation' },
  ];

  const features = [
    {
      icon: Brain,
      title: 'Pattern Recognition',
      description: 'Detects eco-round stacks, force-buy tendencies, and predictable setups instantly.',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Target,
      title: 'Draft Clustering',
      description: 'ML-powered composition analysis predicts enemy agent selections with K-Means clustering.',
      color: 'from-[#ff4655] to-orange-500',
      bgColor: 'bg-[#ff4655]/10',
    },
    {
      icon: Zap,
      title: 'Win Conditions',
      description: 'AI-generated strategic paths based on exploitable weaknesses and loss correlations.',
      color: 'from-emerald-500 to-cyan-500',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 relative overflow-x-hidden transition-colors duration-300">
      {/* ============ BACKGROUND PHYSICS ============ */}

      {/* Dot Grid Pattern for Light Mode */}
      <div
        className="fixed inset-0 opacity-[0.4] dark:opacity-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
      {/* Grid Pattern for Dark Mode */}
      <div
        className="fixed inset-0 opacity-0 dark:opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Radial Spotlight - Light mode: subtle warm, Dark mode: purple glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-30%,rgba(255,70,85,0.05),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-30%,rgba(120,119,198,0.2),transparent)]" />

      {/* Blurred Orbs - Hidden in light mode, visible in dark */}
      <div className="fixed top-20 left-1/4 w-[500px] h-[500px] bg-[#ff4655]/20 rounded-full blur-[120px] animate-pulse opacity-0 dark:opacity-100" style={{ animationDuration: '4s' }} />
      <div className="fixed top-40 right-1/4 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse opacity-0 dark:opacity-100" style={{ animationDuration: '6s', animationDelay: '1s' }} />


      {/* ============ SECTION 1: NAVBAR ============ */}
      <Navbar />



      {/* ============ SECTION 2: THE HERO ============ */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20">

        {/* === AGGRESSIVE BACKGROUND EFFECTS === */}

        {/* Tech Grid Overlay */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,70,85,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,70,85,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Diagonal Accent Lines - Top Right */}
        <div className="absolute top-0 right-0 w-[600px] h-[400px] overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-[-100px] w-[500px] h-[3px] bg-gradient-to-r from-transparent via-[#ff4655] to-[#ff4655] rotate-[-35deg]" />
          <div className="absolute top-32 right-[-80px] w-[400px] h-[2px] bg-gradient-to-r from-transparent via-[#ff4655]/60 to-[#ff4655]/60 rotate-[-35deg]" />
          <div className="absolute top-44 right-[-60px] w-[300px] h-[1px] bg-gradient-to-r from-transparent to-[#ff4655]/40 rotate-[-35deg]" />
        </div>

        {/* Diagonal Accent Lines - Bottom Left */}
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] overflow-hidden pointer-events-none">
          <div className="absolute bottom-32 left-[-100px] w-[500px] h-[3px] bg-gradient-to-l from-transparent via-[#ff4655] to-[#ff4655] rotate-[-35deg]" />
          <div className="absolute bottom-44 left-[-80px] w-[400px] h-[2px] bg-gradient-to-l from-transparent via-[#ff4655]/60 to-[#ff4655]/60 rotate-[-35deg]" />
        </div>

        {/* Omen Character Watermark */}
        <div className="absolute inset-0 flex items-center justify-end pointer-events-none">
          <div className="relative w-[500px] h-[700px] sm:w-[700px] sm:h-[900px] mr-[-100px]">
            <Image
              src="/phantom-character.png"
              alt=""
              fill
              className="object-contain opacity-20 dark:opacity-40 mix-blend-luminosity"
              priority
            />
            {/* Gradient fade */}
            <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-slate-950 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-transparent to-transparent" />
          </div>
        </div>

        {/* HUD Corner Brackets */}
        <div className="absolute top-24 left-8 w-16 h-16 border-l-2 border-t-2 border-[#ff4655]/50" />
        <div className="absolute top-24 right-8 w-16 h-16 border-r-2 border-t-2 border-[#ff4655]/50" />
        <div className="absolute bottom-24 left-8 w-16 h-16 border-l-2 border-b-2 border-[#ff4655]/50" />
        <div className="absolute bottom-24 right-8 w-16 h-16 border-r-2 border-b-2 border-[#ff4655]/50" />

        {/* Main Content */}
        <div className="max-w-5xl mx-auto text-center relative z-10">

          {/* Status Badge - Military Style */}
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-900/80 dark:bg-slate-900/90 border border-[#ff4655]/30 mb-8"
            style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>
            <div className="w-2 h-2 bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400 font-mono uppercase tracking-[0.2em]">System Online</span>
            <div className="w-px h-4 bg-slate-700" />
            <span className="text-xs text-[#ff4655] font-mono uppercase tracking-wider">GRID Connected</span>
          </div>

          {/* Hero Title - VICTORY IS */}
          <h1 className="relative mb-2">
            <span className="block text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white dark:text-white/90"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
              VICTORY IS
            </span>
          </h1>

          {/* CALCULATED - With Glitch Effect */}
          <div className="relative mb-8">
            {/* Ghost/Glitch Layer - Cyan offset */}
            <span
              className="absolute inset-0 text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-cyan-500/30 select-none"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                transform: 'translate(3px, 3px)',
                letterSpacing: '-0.04em'
              }}
              aria-hidden="true"
            >
              CALCULATED.
            </span>
            {/* Ghost/Glitch Layer - Red offset */}
            <span
              className="absolute inset-0 text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-[#ff4655]/20 select-none"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                transform: 'translate(-2px, -2px)',
                letterSpacing: '-0.04em'
              }}
              aria-hidden="true"
            >
              CALCULATED.
            </span>
            {/* Main Text */}
            <span
              className="relative block text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-[#ff4655]"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '-0.04em',
                textShadow: '0 0 40px rgba(255,70,85,0.4), 0 0 80px rgba(255,70,85,0.2)'
              }}
            >
              CALCULATED.
            </span>
          </div>

          {/* Subtitle - Military Briefing Style */}
          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto mb-12 font-mono leading-relaxed">
            <span className="text-[#ff4655]">//</span> AI-powered tactical analysis for{' '}
            <span className="text-white font-semibold">Tier 1 & Tier 2</span> esports teams.
            <br />
            <span className="text-[#ff4655]">//</span> Instant scouting reports. Exploitable weaknesses.
          </p>

          {/* ============ HUD SEARCH BAR ============ */}
          <div className="w-full max-w-3xl mx-auto">

            {/* Tactical Mode Switcher Tabs - Attached to top-left */}
            <div className="flex items-end mb-[-2px] ml-3 relative z-10">
              {/* SCOUTING Tab */}
              <button
                onClick={() => setSearchMode('scouting')}
                className={cn(
                  "relative px-6 py-2 text-xs font-mono uppercase tracking-wider transition-all duration-200",
                  searchMode === 'scouting'
                    ? "bg-[#ff4655] text-white"
                    : "bg-transparent text-slate-500 hover:text-white border-t border-l border-r border-slate-700/50 hover:border-[#ff4655]/50"
                )}
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0% 100%)',
                  marginRight: '-8px'
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="text-[10px]">🎯</span>
                  SCOUTING
                </span>
              </button>

              {/* VERSUS Tab */}
              <button
                onClick={() => setSearchMode('versus')}
                className={cn(
                  "relative px-6 py-2 text-xs font-mono uppercase tracking-wider transition-all duration-200",
                  searchMode === 'versus'
                    ? "bg-[#ff4655] text-white"
                    : "bg-transparent text-slate-500 hover:text-white border-t border-l border-r border-slate-700/50 hover:border-[#ff4655]/50"
                )}
                style={{
                  clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)',
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="text-[10px]">⚔️</span>
                  VERSUS
                </span>
              </button>
            </div>

            {/* The Angular HUD Container - Refactored for Dropdown Visibility */}
            <div className="relative group/hud">
              {/* background/border layer (the one with clip-path) */}
              <div
                className="absolute inset-0 p-[2px] bg-gradient-to-r from-[#ff4655] via-slate-700 to-slate-800 transition-all duration-300 group-focus-within/hud:from-[#ff4655] group-focus-within/hud:via-[#ff4655]/40"
                style={{
                  clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
                  zIndex: 0
                }}
              >
                <div
                  className="w-full h-full bg-slate-900/95 backdrop-blur-xl"
                  style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
                />
              </div>

              {/* Functional Content Layer (no clip-path here to allow dropdowns to overflow) */}
              <div className="relative z-10 flex items-center h-16 pointer-events-auto">
                {/* ========== SCOUTING MODE ========== */}
                {searchMode === 'scouting' && (
                  <>
                    {/* Team Selector */}
                    <div className="relative">
                      <button
                        ref={scoutingSelectorRef}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTeamSelector(!showTeamSelector);
                        }}
                        className="flex items-center gap-2 h-16 px-5 border-r border-slate-700/50 text-sm font-mono uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Shield className="w-4 h-4 text-[#ff4655]" />
                        <span>Select</span>
                        <ChevronDown className={cn("w-4 h-4 transition-transform", showTeamSelector && "rotate-180")} />
                      </button>

                      <TeamSelectionWindow
                        isOpen={showTeamSelector}
                        onClose={() => setShowTeamSelector(false)}
                        onSelect={(name) => setTeamName(name)}
                        teams={popularTeams}
                        triggerRef={scoutingSelectorRef}
                        variant="scouting"
                        title="TARGET SELECTION"
                      />
                    </div>

                    {/* Search Input */}
                    <div className="flex-1 flex items-center gap-3 px-4">
                      <Search className="w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter team name..."
                        className="flex-1 bg-transparent text-white text-lg font-mono placeholder:text-slate-600 focus:outline-none"
                      />
                    </div>

                    {/* Generate Button */}
                    <button
                      onClick={handleGenerate}
                      disabled={!teamName.trim()}
                      className={cn(
                        "relative h-full px-8 font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center gap-2 overflow-hidden",
                        teamName.trim()
                          ? "bg-[#ff4655] text-white hover:bg-[#ff5a67]"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      )}
                      style={{
                        clipPath: 'polygon(15px 0, 100% 0, 100% 100%, 0 100%, 0 15px)',
                        transform: 'skewX(-5deg)',
                        marginRight: '2px'
                      }}
                    >
                      <span style={{ transform: 'skewX(5deg)' }} className="flex items-center gap-2">
                        Generate
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </button>
                  </>
                )}

                {/* ========== VERSUS MODE ========== */}
                {searchMode === 'versus' && (
                  <>
                    {/* Team A Selector + Input */}
                    <div className="relative flex items-center">
                      <button
                        ref={teamASelectorRef}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTeamASelector(!showTeamASelector);
                          setShowTeamBSelector(false);
                        }}
                        className="flex items-center gap-2 h-16 px-4 border-r border-slate-700/50 text-sm font-mono uppercase tracking-wider text-emerald-400 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Shield className="w-4 h-4" />
                        <ChevronDown className={cn("w-3 h-3 transition-transform", showTeamASelector && "rotate-180")} />
                      </button>

                      <TeamSelectionWindow
                        isOpen={showTeamASelector}
                        onClose={() => setShowTeamASelector(false)}
                        onSelect={(name) => setTeamA(name)}
                        teams={popularTeams}
                        triggerRef={teamASelectorRef}
                        variant="teamA"
                        title="YOUR TEAM"
                      />
                    </div>

                    {/* Team A Input */}
                    <div className="flex-1 flex items-center gap-2 px-3 border-r border-slate-700/50">
                      <input
                        type="text"
                        value={teamA}
                        onChange={(e) => setTeamA(e.target.value)}
                        placeholder="Your team..."
                        className="flex-1 bg-transparent text-white font-mono placeholder:text-slate-600 focus:outline-none text-sm"
                      />
                    </div>

                    {/* VS Badge */}
                    <div className="px-3 flex items-center justify-center">
                      <div className="w-8 h-8 bg-slate-800 border border-[#ff4655]/50 flex items-center justify-center"
                        style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
                        <span className="text-[#ff4655] font-black text-[10px]">VS</span>
                      </div>
                    </div>

                    {/* Team B Input */}
                    <div className="flex-1 flex items-center gap-2 px-3 border-l border-slate-700/50">
                      <input
                        type="text"
                        value={teamB}
                        onChange={(e) => setTeamB(e.target.value)}
                        placeholder="Opponent..."
                        className="flex-1 bg-transparent text-white font-mono placeholder:text-slate-600 focus:outline-none text-sm"
                      />
                    </div>

                    {/* Team B Selector */}
                    <div className="relative flex items-center">
                      <button
                        ref={teamBSelectorRef}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTeamBSelector(!showTeamBSelector);
                          setShowTeamASelector(false);
                        }}
                        className="flex items-center gap-2 h-16 px-4 border-l border-slate-700/50 text-sm font-mono uppercase tracking-wider text-[#ff4655] hover:text-white hover:bg-white/5 transition-all"
                      >
                        <ChevronDown className={cn("w-3 h-3 transition-transform", showTeamBSelector && "rotate-180")} />
                        <Shield className="w-4 h-4" />
                      </button>

                      <TeamSelectionWindow
                        isOpen={showTeamBSelector}
                        onClose={() => setShowTeamBSelector(false)}
                        onSelect={(name) => setTeamB(name)}
                        teams={popularTeams}
                        triggerRef={teamBSelectorRef}
                        variant="teamB"
                        title="OPPONENT"
                      />
                    </div>

                    {/* Predict Button */}
                    <button
                      onClick={handleVersusPredict}
                      disabled={!teamA.trim() || !teamB.trim()}
                      className={cn(
                        "relative h-full px-6 font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center gap-2 overflow-hidden",
                        teamA.trim() && teamB.trim()
                          ? "bg-[#ff4655] text-white hover:bg-[#ff5a67]"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      )}
                      style={{
                        clipPath: 'polygon(15px 0, 100% 0, 100% 100%, 0 100%, 0 15px)',
                        transform: 'skewX(-5deg)',
                        marginRight: '2px'
                      }}
                    >
                      <span style={{ transform: 'skewX(5deg)' }} className="flex items-center gap-2">
                        Predict
                        <Crosshair className="w-4 h-4" />
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>


            {/* Keyboard Hint */}
            <div className="mt-4 flex items-center justify-center gap-2 text-slate-600 text-sm font-mono">
              <kbd className="px-2 py-1 bg-slate-800/50 border border-slate-700 text-xs">↵</kbd>
              <span>to execute</span>
            </div>
          </div>
        </div>

        {/* Bottom HUD Elements */}
        <div className="absolute bottom-8 left-8 flex items-center gap-4 text-xs font-mono text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#ff4655] animate-pulse" />
            <span>ValoML v2.0</span>
          </div>
          <div className="w-px h-4 bg-slate-700" />
          <span>GRID API</span>
        </div>
        <div className="absolute bottom-8 right-8 text-xs font-mono text-slate-600 uppercase tracking-wider">
          Tactical Intelligence System
        </div>

      </section>



      {/* ============ SECTION 3: TACTICAL DATA FEED (HUD STATS) ============ */}
      <StatsSectionHud />


      {/* ============ SECTION 4: BEYOND BASIC STATS (HUD FEATURES) ============ */}
      <FeaturesSectionHud />






      {/* ============ SECTION 5: CTA ============ */}
      <CtaSection />


      {/* ============ SECTION 6: FOOTER ============ */}
      <Footer />
    </div>
  );
}
