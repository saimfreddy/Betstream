import React, { useState } from 'react';
import {
  Search,
  Activity,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Play,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  MarketOption,
  OddsFormat,
  SelectedOdd,
  SportCategory,
  SportMatch,
} from '../types';
import { sound } from '../utils/sound';

interface SportsbookViewProps {
  matches: SportMatch[];
  selectedSport: SportCategory;
  onSelectSport: (sport: SportCategory) => void;
  liveOnlyFilter: boolean;
  onToggleLiveOnly: (liveOnly: boolean) => void;
  selectedOdds: SelectedOdd[];
  onToggleOdd: (odd: SelectedOdd) => void;
  onSimulateMatchGoal: (matchId: string) => void;
}

export function formatOdds(decimalOdds: number, format: OddsFormat): string {
  if (format === 'decimal') return decimalOdds.toFixed(2);
  if (format === 'american') {
    if (decimalOdds >= 2.0) return `+${Math.round((decimalOdds - 1) * 100)}`;
    return `${Math.round(-100 / (decimalOdds - 1))}`;
  }
  const net = decimalOdds - 1;
  const denominators = [1, 2, 4, 5, 8, 10, 20];
  let bestNum = Math.round(net);
  let bestDen = 1;
  let minDiff = Math.abs(net - bestNum);
  for (const d of denominators) {
    const n = Math.round(net * d);
    const diff = Math.abs(net - n / d);
    if (diff < minDiff && n > 0) {
      minDiff = diff;
      bestNum = n;
      bestDen = d;
    }
  }
  return `${bestNum}/${bestDen}`;
}

export const SportsbookView: React.FC<SportsbookViewProps> = ({
  matches,
  selectedSport,
  onSelectSport,
  liveOnlyFilter,
  onToggleLiveOnly,
  selectedOdds,
  onToggleOdd,
  onSimulateMatchGoal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [oddsFormat, setOddsFormat] = useState<OddsFormat>('decimal');
  const [activeTrackerMatchId, setActiveTrackerMatchId] = useState<string>('m-ucl-1');
  const [expandedMatchIds, setExpandedMatchIds] = useState<Record<string, boolean>>({
    'm-ucl-1': true,
  });

  const trackerMatch =
    matches.find((m) => m.id === activeTrackerMatchId) ||
    matches.find((m) => m.isLive) ||
    matches[0];

  const filteredMatches = matches.filter((m) => {
    if (selectedSport !== 'all' && m.sport !== selectedSport) return false;
    if (liveOnlyFilter && !m.isLive) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const hit =
        m.homeTeam.toLowerCase().includes(q) ||
        m.awayTeam.toLowerCase().includes(q) ||
        m.league.toLowerCase().includes(q);
      if (!hit) return false;
    }
    return true;
  });

  const isSelectionActive = (selectionId: string) =>
    selectedOdds.some((s) => s.selectionId === selectionId);

  const handleSelectOption = (
    match: SportMatch,
    marketName: string,
    option: MarketOption
  ) => {
    sound.playClick();
    onToggleOdd({
      selectionId: option.id,
      matchId: match.id,
      matchTitle: `${match.homeTeam} vs ${match.awayTeam}`,
      league: match.league,
      marketName,
      optionLabel: option.subLabel ? `${option.subLabel} (${option.label})` : option.label,
      odds: option.odds,
      isLive: match.isLive,
    });
  };

  const toggleExpandMatch = (matchId: string) => {
    sound.playClick();
    setExpandedMatchIds((prev) => ({ ...prev, [matchId]: !prev[matchId] }));
  };

  const sportTabs: Array<{ id: SportCategory; label: string }> = [
    { id: 'all', label: 'All Events' },
    { id: 'football', label: 'Football' },
    { id: 'basketball', label: 'Basketball' },
    { id: 'esports', label: 'Esports' },
    { id: 'tennis', label: 'Tennis' },
    { id: 'mma', label: 'MMA / UFC' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Featured Live Match Center & Tactical Pitch Visualizer */}
      {trackerMatch && (
        <section
          aria-label="Featured Live Match Center"
          className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 p-5 lg:p-6 relative shadow-xl"
        >
          {/* Top Line: League & Simulate Live Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="font-semibold text-emerald-400 font-mono">
                {trackerMatch.isLive ? `LIVE ${trackerMatch.matchTime}` : trackerMatch.matchTime}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-200">{trackerMatch.league}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">{trackerMatch.region}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">{trackerMatch.period}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playWin();
                onSimulateMatchGoal(trackerMatch.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulate Live Goal / Score</span>
            </button>
          </div>

          {/* Center: Scoreboard & Tactical Pitch SVG */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 py-5 items-center">
            {/* Left 7 Cols: Scoreboard & 1X2 Market Buttons */}
            <div className="xl:col-span-7 space-y-4">
              <div className="grid grid-cols-7 items-center gap-3">
                <div className="col-span-3">
                  <div className="text-xs text-slate-400 mb-1">Home Team</div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white font-display tracking-tight truncate">
                    {trackerMatch.homeTeam}
                  </h1>
                </div>

                <div className="col-span-1 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 text-3xl font-black font-mono tabular-nums text-white">
                    <span>{trackerMatch.homeScore}</span>
                    <span className="text-slate-600">:</span>
                    <span>{trackerMatch.awayScore}</span>
                  </div>
                </div>

                <div className="col-span-3 text-right">
                  <div className="text-xs text-slate-400 mb-1">Away Team</div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white font-display tracking-tight truncate">
                    {trackerMatch.awayTeam}
                  </h2>
                </div>
              </div>

              {/* Live Commentary Feed */}
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 rounded-lg">
                <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono text-emerald-400 shrink-0 font-bold">MATCH TRACKER</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="truncate">{trackerMatch.stats.lastEvent}</span>
              </div>

              {/* Instant 1X2 Winner Market Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {trackerMatch.markets.winner.map((opt) => {
                  const active = isSelectionActive(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(trackerMatch, 'Match Winner', opt)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-xs transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800'
                      }`}
                    >
                      <span className="truncate mr-2">
                        <span className={active ? 'text-slate-950 font-bold' : 'text-slate-400'}>
                          {opt.label}
                        </span>{' '}
                        <span>{opt.subLabel || ''}</span>
                      </span>
                      <span
                        className={`font-mono tabular-nums font-bold ${
                          active ? 'text-slate-950' : 'text-emerald-400'
                        }`}
                      >
                        {formatOdds(opt.odds, oddsFormat)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right 5 Cols: SVG Tactical Pitch Visualizer */}
            <div className="xl:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-200">Tactical Pitch Visualizer</span>
                <span>
                  Momentum:{' '}
                  <strong className="text-emerald-400">
                    {trackerMatch.stats.attackingTeam === 'home'
                      ? trackerMatch.homeTeam
                      : trackerMatch.stats.attackingTeam === 'away'
                      ? trackerMatch.awayTeam
                      : 'Contested'}
                  </strong>
                </span>
              </div>

              {/* Pitch Visualizer */}
              <div className="relative h-28 w-full rounded-lg overflow-hidden bg-emerald-950/40 border border-emerald-500/20">
                <svg
                  viewBox="0 0 200 90"
                  className="w-full h-full"
                  aria-label="Live match tactical pitch position"
                >
                  <rect x="4" y="4" width="192" height="82" fill="none" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1" />
                  <line x1="100" y1="4" x2="100" y2="86" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1" />
                  <circle cx="100" cy="45" r="14" fill="none" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1" />
                  <rect x="4" y="22" width="24" height="46" fill="none" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1" />
                  <rect x="172" y="22" width="24" height="46" fill="none" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1" />
                  <circle
                    cx={Math.max(12, Math.min(188, trackerMatch.stats.ballPos.x * 2))}
                    cy={Math.max(12, Math.min(78, trackerMatch.stats.ballPos.y * 0.85))}
                    r="4"
                    fill="#fbbf24"
                    stroke="#0b0f17"
                    strokeWidth="1"
                  />
                </svg>
              </div>

              {/* Tabular Stats Row */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center border-t border-slate-800 text-xs">
                <div>
                  <div className="text-[11px] text-slate-500">Possession</div>
                  <div className="font-mono tabular-nums font-semibold text-slate-200 mt-0.5">
                    {trackerMatch.stats.possession[0]}% · {trackerMatch.stats.possession[1]}%
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">On Target</div>
                  <div className="font-mono tabular-nums font-semibold text-slate-200 mt-0.5">
                    {trackerMatch.stats.shotsOnTarget[0]} : {trackerMatch.stats.shotsOnTarget[1]}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Corners / Aces</div>
                  <div className="font-mono tabular-nums font-semibold text-slate-200 mt-0.5">
                    {trackerMatch.stats.cornersOrAces[0]} : {trackerMatch.stats.cornersOrAces[1]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter and Odds Format Selector */}
      <section aria-label="Sportsbook Filters" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto max-w-full">
            {sportTabs.map((tab) => {
              const active = selectedSport === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onSelectSport(tab.id);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                aria-label="Search teams or leagues"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 w-44 sm:w-56"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                aria-label="Odds Format"
                value={oddsFormat}
                onChange={(e) => setOddsFormat(e.target.value as OddsFormat)}
                className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="decimal" className="bg-slate-900 text-slate-100">Decimal (1.95)</option>
                <option value="american" className="bg-slate-900 text-slate-100">American (-105)</option>
                <option value="fractional" className="bg-slate-900 text-slate-100">Fractional (19/20)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* High-Density Odds Grid */}
      <section
        aria-label="Sports Odds Table"
        className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg"
      >
        <div className="hidden xl:grid xl:grid-cols-12 gap-3 px-4 py-3 bg-slate-950 border-b border-slate-800 text-[11px] font-semibold text-slate-400">
          <div className="xl:col-span-4">Fixture & Match Info</div>
          <div className="xl:col-span-3 text-center">Match Winner (1X2 / ML)</div>
          <div className="xl:col-span-2 text-center">Handicap / Spread</div>
          <div className="xl:col-span-2 text-center">Total Line (O/U)</div>
          <div className="xl:col-span-1 text-right">Markets</div>
        </div>

        <div className="divide-y divide-slate-800">
          {filteredMatches.map((match) => {
            const isExpanded = !!expandedMatchIds[match.id];
            const isBeingTracked = trackerMatch?.id === match.id;

            return (
              <div key={match.id} className="transition-colors hover:bg-slate-800/40">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 p-4 items-center">
                  {/* Col 1-4: Match Metadata & Teams */}
                  <div className="xl:col-span-4 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 flex-wrap">
                      <span className={match.isLive ? 'text-emerald-400 font-mono font-bold' : 'text-slate-300 font-mono'}>
                        {match.isLive ? `LIVE ${match.matchTime}` : match.matchTime}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-300 font-medium truncate">{match.league}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-500 truncate">{match.period}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between pr-2">
                        <span className="text-sm font-bold text-slate-100 truncate">{match.homeTeam}</span>
                        <span className="text-sm font-mono tabular-nums font-bold text-white w-6 text-right">
                          {match.isLive ? match.homeScore : '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pr-2">
                        <span className="text-sm font-bold text-slate-100 truncate">{match.awayTeam}</span>
                        <span className="text-sm font-mono tabular-nums font-bold text-white w-6 text-right">
                          {match.isLive ? match.awayScore : '—'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setActiveTrackerMatchId(match.id);
                        }}
                        className={`text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                          isBeingTracked ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Play className="w-3 h-3" />
                        <span>{isBeingTracked ? 'Active in Pitch Tracker' : 'Load Tactical Tracker'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Col 5-7: 1X2 Winner Markets */}
                  <div className={`xl:col-span-3 grid gap-1.5 ${match.markets.winner.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    {match.markets.winner.map((opt) => {
                      const active = isSelectionActive(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(match, 'Match Winner', opt)}
                          className={`flex flex-col justify-between p-2.5 rounded-lg border text-left transition-colors cursor-pointer whitespace-nowrap ${
                            active
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                              : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full text-[11px]">
                            <span className={active ? 'text-slate-950 font-bold' : 'text-slate-400'}>{opt.label}</span>
                            {opt.trend === 'up' && !active && <ArrowUpRight className="w-3 h-3 text-emerald-400" />}
                            {opt.trend === 'down' && !active && <ArrowDownRight className="w-3 h-3 text-amber-400" />}
                          </div>
                          <div className={`text-xs font-mono tabular-nums font-bold mt-1 ${active ? 'text-slate-950' : 'text-emerald-400'}`}>
                            {formatOdds(opt.odds, oddsFormat)}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Col 8-9: Handicap / Spread */}
                  <div className="xl:col-span-2 grid grid-cols-2 gap-1.5">
                    {match.markets.spread.map((opt) => {
                      const active = isSelectionActive(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(match, 'Handicap Spread', opt)}
                          className={`flex flex-col justify-between p-2.5 rounded-lg border text-left transition-colors cursor-pointer whitespace-nowrap ${
                            active
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                              : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800'
                          }`}
                        >
                          <span className={`text-[11px] truncate ${active ? 'text-slate-950 font-bold' : 'text-slate-400'}`}>
                            {opt.label}
                          </span>
                          <span className={`text-xs font-mono tabular-nums font-bold mt-1 ${active ? 'text-slate-950' : 'text-slate-100'}`}>
                            {formatOdds(opt.odds, oddsFormat)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Col 10-11: Totals */}
                  <div className="xl:col-span-2 grid grid-cols-2 gap-1.5">
                    {match.markets.total.map((opt) => {
                      const active = isSelectionActive(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(match, 'Total Line', opt)}
                          className={`flex flex-col justify-between p-2.5 rounded-lg border text-left transition-colors cursor-pointer whitespace-nowrap ${
                            active
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                              : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800'
                          }`}
                        >
                          <span className={`text-[11px] truncate ${active ? 'text-slate-950 font-bold' : 'text-slate-400'}`}>
                            {opt.label}
                          </span>
                          <span className={`text-xs font-mono tabular-nums font-bold mt-1 ${active ? 'text-slate-950' : 'text-slate-100'}`}>
                            {formatOdds(opt.odds, oddsFormat)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Col 12: Expand Props */}
                  <div className="xl:col-span-1 flex justify-end">
                    <button
                      type="button"
                      aria-label="Toggle extra markets"
                      onClick={() => toggleExpandMatch(match.id)}
                      className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-mono bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>+{match.extraMarkets.length + 2}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {isExpanded && match.extraMarkets.length > 0 && (
                  <div className="px-4 pb-4 pt-2 bg-slate-950/70 border-t border-slate-800 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {match.extraMarkets.map((group) => (
                        <div key={group.id} className="space-y-1.5">
                          <div className="text-xs font-medium text-slate-400">{group.name}</div>
                          <div className={`grid gap-2 ${group.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                            {group.options.map((opt) => {
                              const active = isSelectionActive(opt.id);
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleSelectOption(match, group.name, opt)}
                                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer whitespace-nowrap ${
                                    active
                                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                                  }`}
                                >
                                  <span className="truncate mr-2">{opt.label}</span>
                                  <span className={`font-mono font-bold ${active ? 'text-slate-950' : 'text-emerald-400'}`}>
                                    {formatOdds(opt.odds, oddsFormat)}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
