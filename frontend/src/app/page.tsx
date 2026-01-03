'use client';

import { useState, useEffect } from 'react';
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

  const popularTeams = [
    { name: 'Sentinels', region: 'Americas' },
    { name: 'Cloud9', region: 'Americas' },
    { name: 'LOUD', region: 'Americas' },
    { name: '100 Thieves', region: 'Americas' },
    { name: 'NRG', region: 'Americas' },
    { name: 'Evil Geniuses', region: 'Americas' },
    { name: 'Leviatan', region: 'Americas' },
    { name: 'Paper Rex', region: 'Pacific' },
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
    <div className="min-h-screen bg-slate-950 relative overflow-x-hidden">
      {/* ============ BACKGROUND PHYSICS ============ */}

      {/* Grid Pattern */}
      <div
        className="fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Radial Spotlight from Top */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-30%,rgba(120,119,198,0.2),transparent)]" />

      {/* Blurred Orbs */}
      <div className="fixed top-20 left-1/4 w-[500px] h-[500px] bg-[#ff4655]/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="fixed top-40 right-1/4 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />


      {/* ============ SECTION 1: NAVBAR ============ */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.05]"
          : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[#ff4655] blur-lg opacity-40" />
                <div className="relative w-9 h-9 bg-gradient-to-br from-[#ff4655] to-[#ff6b77] rounded-xl flex items-center justify-center ring-1 ring-white/10">
                  <Crosshair className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">VALOML</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-4">
              <button className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">
                Sign In
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/5">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block py-2 text-slate-300 hover:text-white">Features</a>
              <a href="#" className="block py-2 text-slate-300 hover:text-white">Pricing</a>
              <a href="https://github.com" className="block py-2 text-slate-300 hover:text-white">GitHub</a>
              <button className="w-full mt-4 px-4 py-2 text-sm font-medium text-white bg-[#ff4655] rounded-lg">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>


      {/* ============ SECTION 2: THE HERO ============ */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20 overflow-hidden">

        {/* Phantom Character Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-[600px] h-[800px] sm:w-[800px] sm:h-[1000px]">
            <Image
              src="/phantom-character.png"
              alt=""
              fill
              className="object-contain grayscale opacity-[0.08] mix-blend-overlay blur-[1px] scale-110"
              priority
            />
            {/* Vertical Fade Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400 font-medium">Powered by GRID Esports Data</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400">
              VICTORY IS
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4655] via-[#ff6b77] to-[#ff8f97]">
              CALCULATED
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            The AI-powered analyst for <span className="text-white">Tier 1 & Tier 2</span> esports teams.
            Instant scouting reports. Exploitable weaknesses. Winning strategies.
          </p>

          {/* ============ DUAL MODE SEARCH ============ */}
          <div className="w-full max-w-2xl mx-auto">
            {/* Mode Switcher Tabs */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex p-1 bg-white/5 border border-white/10 rounded-full">
                <button
                  onClick={() => setSearchMode('scouting')}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    searchMode === 'scouting'
                      ? "bg-white text-slate-900 shadow-lg"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  🕵️ Scouting Report
                </button>
                <button
                  onClick={() => setSearchMode('versus')}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    searchMode === 'versus'
                      ? "bg-white text-slate-900 shadow-lg"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  ⚔️ Match Prediction
                </button>
              </div>
            </div>

            {/* Search Container */}
            <div
              className={cn(
                "relative transition-all duration-300",
                isFocused && "scale-[1.02]"
              )}
            >
              {/* Glow Effect */}
              <div className={cn(
                "absolute -inset-1 bg-gradient-to-r from-[#ff4655]/30 via-purple-500/20 to-[#ff4655]/30 rounded-2xl blur-xl transition-opacity duration-500",
                isFocused ? "opacity-100" : "opacity-0"
              )} />

              {/* ========== SCOUTING MODE ========== */}
              {searchMode === 'scouting' && (
                <div className={cn(
                  "relative h-16 bg-white/5 backdrop-blur-xl rounded-2xl border transition-all duration-300 flex items-center",
                  isFocused
                    ? "border-[#ff4655]/40 ring-2 ring-[#ff4655]/20"
                    : "border-white/10 hover:border-white/20"
                )}>
                  {/* Quick Team Selector */}
                  <div className="relative pl-2">
                    <button
                      onClick={() => setShowTeamSelector(!showTeamSelector)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all"
                    >
                      <Shield className="w-4 h-4 text-[#ff4655]" />
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    </button>

                    {showTeamSelector && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                        <div className="px-3 py-2 border-b border-white/10">
                          <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Popular Teams</span>
                        </div>
                        {popularTeams.map((team) => (
                          <button
                            key={team.name}
                            onClick={() => {
                              setTeamName(team.name);
                              setShowTeamSelector(false);
                            }}
                            className="w-full px-3 py-2.5 text-left text-sm hover:bg-white/10 transition-colors flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-slate-500 group-hover:text-[#ff4655] transition-colors" />
                              <span className="text-slate-300 group-hover:text-white transition-colors">{team.name}</span>
                            </div>
                            <span className="text-xs text-slate-600">{team.region}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="h-6 w-px bg-white/10 mx-2" />

                  <div className="pl-1">
                    <Search className={cn(
                      "w-5 h-5 transition-colors",
                      isFocused ? "text-[#ff4655]" : "text-slate-500"
                    )} />
                  </div>

                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Search team..."
                    className="flex-1 h-full px-4 bg-transparent text-white text-lg placeholder:text-slate-500 focus:outline-none"
                  />

                  <div className="relative mr-3">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all"
                    >
                      <span className="text-slate-500">Matches:</span>
                      <span className="font-mono font-semibold text-white">{matchCount}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    </button>

                    {showDropdown && (
                      <div className="absolute top-full right-0 mt-2 w-36 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                        {[5, 10, 15, 20].map((count) => (
                          <button
                            key={count}
                            onClick={() => { setMatchCount(count); setShowDropdown(false); }}
                            className={cn(
                              "w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors flex items-center justify-between",
                              matchCount === count ? "text-[#ff4655] bg-[#ff4655]/10" : "text-slate-300"
                            )}
                          >
                            {count} matches
                            {matchCount === count && <Sparkles className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={!teamName.trim()}
                    className={cn(
                      "h-12 px-6 mr-2 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2",
                      teamName.trim()
                        ? "bg-gradient-to-r from-[#ff4655] to-[#ff5a67] text-white hover:shadow-lg hover:shadow-[#ff4655]/30 hover:scale-105"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    )}
                  >
                    Generate
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ========== VERSUS MODE ========== */}
              {searchMode === 'versus' && (
                <div className={cn(
                  "relative bg-white/5 backdrop-blur-xl rounded-2xl border transition-all duration-300 p-4",
                  isFocused
                    ? "border-[#ff4655]/40 ring-2 ring-[#ff4655]/20"
                    : "border-white/10 hover:border-white/20"
                )}>
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    {/* Team A Input */}
                    <div className="flex-1 w-full">
                      <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">Your Team</label>
                      <div className="relative flex items-center h-12 bg-white/5 rounded-xl border border-white/10">
                        <div className="relative pl-2">
                          <button
                            onClick={() => setShowTeamASelector(!showTeamASelector)}
                            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all"
                          >
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <ChevronDown className="w-3 h-3 text-slate-500" />
                          </button>

                          {showTeamASelector && (
                            <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                              <div className="px-3 py-2 border-b border-white/10">
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Popular Teams</span>
                              </div>
                              {popularTeams.map((team) => (
                                <button
                                  key={team.name}
                                  onClick={() => {
                                    setTeamA(team.name);
                                    setShowTeamASelector(false);
                                  }}
                                  className="w-full px-3 py-2.5 text-left text-sm hover:bg-white/10 transition-colors flex items-center justify-between group"
                                >
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                                    <span className="text-slate-300 group-hover:text-white transition-colors">{team.name}</span>
                                  </div>
                                  <span className="text-xs text-slate-600">{team.region}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          value={teamA}
                          onChange={(e) => setTeamA(e.target.value)}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                          placeholder="Enter team..."
                          className="flex-1 h-full px-3 bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* VS Badge */}
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-[#ff4655] blur-xl opacity-40 rounded-full" />
                      <div className="relative w-12 h-12 bg-slate-900 border-2 border-[#ff4655] rounded-full flex items-center justify-center">
                        <span className="text-[#ff4655] font-black text-sm">VS</span>
                      </div>
                    </div>

                    {/* Team B Input */}
                    <div className="flex-1 w-full">
                      <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">Opponent</label>
                      <div className="relative flex items-center h-12 bg-white/5 rounded-xl border border-white/10">
                        <div className="relative pl-2">
                          <button
                            onClick={() => setShowTeamBSelector(!showTeamBSelector)}
                            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all"
                          >
                            <Shield className="w-4 h-4 text-[#ff4655]" />
                            <ChevronDown className="w-3 h-3 text-slate-500" />
                          </button>

                          {showTeamBSelector && (
                            <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                              <div className="px-3 py-2 border-b border-white/10">
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Popular Teams</span>
                              </div>
                              {popularTeams.map((team) => (
                                <button
                                  key={team.name}
                                  onClick={() => {
                                    setTeamB(team.name);
                                    setShowTeamBSelector(false);
                                  }}
                                  className="w-full px-3 py-2.5 text-left text-sm hover:bg-white/10 transition-colors flex items-center justify-between group"
                                >
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-slate-500 group-hover:text-[#ff4655] transition-colors" />
                                    <span className="text-slate-300 group-hover:text-white transition-colors">{team.name}</span>
                                  </div>
                                  <span className="text-xs text-slate-600">{team.region}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          value={teamB}
                          onChange={(e) => setTeamB(e.target.value)}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                          placeholder="Enter opponent..."
                          className="flex-1 h-full px-3 bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Predict Button */}
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={handleVersusPredict}
                      disabled={!teamA.trim() || !teamB.trim()}
                      className={cn(
                        "h-12 px-8 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2",
                        teamA.trim() && teamB.trim()
                          ? "bg-gradient-to-r from-[#ff4655] to-[#ff5a67] text-white hover:shadow-lg hover:shadow-[#ff4655]/30 hover:scale-105"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      )}
                    >
                      Predict Match
                      <Crosshair className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Keyboard Hint */}
            <div className="mt-4 flex items-center justify-center gap-2 text-slate-600 text-sm">
              <kbd className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-mono">↵</kbd>
              <span>{searchMode === 'scouting' ? 'to search' : 'to predict'}</span>
            </div>
          </div>

          {/* Analytics Preview (3D Tilt) */}
          <div className="mt-16 relative" style={{ perspective: '1000px' }}>
            <div
              className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-lg mx-auto"
              style={{ transform: 'rotateX(8deg) rotateY(-2deg)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-auto text-xs text-slate-500 font-mono">report.tsx</span>
              </div>
              <pre className="text-left text-[11px] sm:text-xs text-slate-400 font-mono leading-relaxed overflow-hidden">
                <code>{`{
  "team": "Sentinels",
  "exploitability_score": 72,
  "weaknesses": [
    "Weak anti-eco (37% loss)",
    "Poor clutches (28% win)"
  ],
  "recommendation": "Force Split"
}`}</code>
              </pre>
            </div>
            {/* Shadow */}
            <div className="absolute inset-x-8 -bottom-4 h-8 bg-[#ff4655]/10 blur-2xl rounded-full" />
          </div>
        </div>
      </section>


      {/* ============ SECTION 3: SOCIAL PROOF / STATS ============ */}
      <section className="relative z-10 py-32 border-y border-white/5 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500 font-medium">Trusted by Analysts</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white font-mono mb-2">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ============ SECTION 4: FEATURES GRID ============ */}
      <section id="features" className="relative z-10 py-32 sm:py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              Beyond Basic Stats
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Machine learning meets esports intelligence. Powered by sklearn, trained on VCT data.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 transition-all duration-300 hover:border-white/[0.12] hover:bg-slate-900/60 hover:-translate-y-1"
              >
                {/* Glow on Hover */}
                <div className={cn(
                  "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl",
                  `bg-gradient-to-br ${feature.color}`
                )} style={{ opacity: 0.05 }} />

                <div className="relative">
                  {/* Icon */}
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6", feature.bgColor)}>
                    <feature.icon className={cn("w-6 h-6", `text-transparent bg-clip-text bg-gradient-to-r ${feature.color}`)} style={{ color: feature.color.includes('ff4655') ? '#ff4655' : feature.color.includes('purple') ? '#a855f7' : '#10b981' }} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ============ SECTION 5: CTA ============ */}
      <section className="relative z-10 py-32 sm:py-40">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to dominate your next match?
          </h2>
          <p className="text-lg text-slate-400 mb-10">
            Generate your first scouting report in seconds. No signup required.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-8 py-4 bg-gradient-to-r from-[#ff4655] to-[#ff5a67] text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-[#ff4655]/25 transition-all hover:scale-105"
          >
            Start Scouting — It&apos;s Free
          </button>
        </div>
      </section>


      {/* ============ SECTION 6: FOOTER ============ */}
      <footer className="relative z-10 py-12 border-t border-white/5 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#ff4655] to-[#ff6b77] rounded-lg flex items-center justify-center">
                  <Crosshair className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">VALOML</span>
              </div>
              <p className="text-sm text-slate-500">
                AI-powered scouting for competitive VALORANT.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="https://github.com" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              © 2026 VALOML. All rights reserved.
            </p>
            <p className="text-sm text-slate-600">
              Built for <span className="text-slate-400">Cloud9 × JetBrains Hackathon</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
