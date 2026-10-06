import React, { useState, useEffect } from 'react';
import {
  Search,
  Flame,
  Radio,
  SlidersHorizontal,
  Play,
  Sparkles,
  Users,
  Trophy,
  Code,
  Zap,
  Fish,
  Crown,
  ChevronRight,
  TrendingUp,
  Smartphone,
  Download,
} from 'lucide-react';
import { CasinoGame, GameCategory, GamingProvider, ProviderId } from '../types';
import { GAMING_PROVIDERS, CASINO_GAMES } from '../data/mockData';
import { sound } from '../utils/sound';

interface CasinoLobbyViewProps {
  selectedProvider: ProviderId;
  onSelectProvider: (provider: ProviderId) => void;
  onLaunchGame: (game: CasinoGame) => void;
  onOpenCommissionHub: () => void;
  onOpenGamesApi?: () => void;
  onOpenApkModal?: () => void;
}

export const CasinoLobbyView: React.FC<CasinoLobbyViewProps> = ({
  selectedProvider,
  onSelectProvider,
  onLaunchGame,
  onOpenCommissionHub,
  onOpenGamesApi,
  onOpenApkModal,
}) => {
  const [activeCategory, setActiveCategory] = useState<GameCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'rtp' | 'max_win'>('popular');
  const [jackpotAmount, setJackpotAmount] = useState<number>(1849204.6);

  // Progressive Jackpot live ticker increment
  useEffect(() => {
    const timer = setInterval(() => {
      setJackpotAmount((prev) => Number((prev + (Math.random() * 0.45 + 0.15)).toFixed(2)));
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const categories: Array<{ id: GameCategory; label: string; icon: string }> = [
    { id: 'all', label: 'All Casino (880+)', icon: '🎰' },
    { id: 'game_shows', label: 'Crazy Time & Game Shows', icon: '🎡' },
    { id: 'fishing_arcade', label: 'Ice Fishing & Arcade', icon: '🎣' },
    { id: 'live_dealer', label: 'Evolution Live Tables', icon: '♠️' },
    { id: 'slots', label: 'Video Slots & Drops', icon: '🍒' },
    { id: 'crash_instant', label: 'Aviator & Turbo Crash', icon: '🚀' },
    { id: 'table_games', label: 'Blackjack & Baccarat', icon: '🎲' },
  ];

  const filteredGames = CASINO_GAMES.filter((g) => {
    if (selectedProvider !== 'all' && g.providerId !== selectedProvider) return false;
    if (activeCategory !== 'all' && g.category !== activeCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const hit =
        g.title.toLowerCase().includes(q) ||
        g.providerName.toLowerCase().includes(q) ||
        g.tagline.toLowerCase().includes(q);
      if (!hit) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rtp') {
      return parseFloat(b.rtp) - parseFloat(a.rtp);
    }
    if (sortBy === 'max_win') {
      const parseVal = (str: string) => {
        const num = parseFloat(str.replace(/[^0-9.]/g, ''));
        return isNaN(num) ? 0 : num;
      };
      return parseVal(b.maxWin) - parseVal(a.maxWin);
    }
    return (b.livePlayersCount || 0) - (a.livePlayersCount || 0);
  });

  const activeProviderInfo = GAMING_PROVIDERS.find((p) => p.id === selectedProvider);

  // Featured flagship games
  const crazyTimeGame = CASINO_GAMES.find((g) => g.id === 'evo-crazy-time');
  const iceFishingGame = CASINO_GAMES.find((g) => g.id === 'jili-ice-fishing');
  const bigBallerGame = CASINO_GAMES.find((g) => g.id === 'evo-monopoly-live');

  return (
    <div className="space-y-6 pb-12">
      {/* Live High-Roller Ticker */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs overflow-hidden shadow-inner">
        <div className="flex items-center gap-2 text-amber-400 font-bold shrink-0">
          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="font-mono uppercase text-[11px] tracking-wide">Live Winners Feed:</span>
        </div>
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap text-slate-300 text-xs font-mono ml-4">
          <span className="text-emerald-400">
            ⚡ Player #9901 won <strong>$4,820.00</strong> on Crazy Time 3D Wheel (100x Top Slot)
          </span>
          <span className="text-cyan-400">
            🎣 Player #3120 caught Frost Kraken for <strong>$1,250.00</strong> on Ice Fishing Catch Live
          </span>
          <span className="text-amber-400">
            🏆 Player #4410 hit <strong>$2,500.00</strong> on XXXtreme Lightning Roulette (500x Lucky Number)
          </span>
          <span className="text-purple-400">
            🚢 Player #7821 scored <strong>$3,640.00</strong> on Monopoly Big Baller (5 Rolls Mayfair)
          </span>
          <span className="text-rose-400">
            🚀 Player #1204 cashed out <strong>$1,890.00</strong> at 18.9x on Aviator Crash
          </span>
        </div>
      </div>

      {/* Grand Casino Hero Banner & Progressive Jackpot */}
      <section
        aria-label="Online Casino Flagship Hub"
        className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-6 sm:p-8 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-amber-500/15 via-rose-500/10 to-transparent pointer-events-none rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> 880+ LIVE CASINO GAMES
              </span>
              <span className="text-amber-400 font-mono">· Evolution Gaming · Jili · Pragmatic Play</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-tight">
              {activeProviderInfo
                ? `${activeProviderInfo.name} Live Studio (${activeProviderInfo.commissionRate}% RevShare)`
                : 'Premier Online Casino & Live Game Shows'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Step into high-roller 4K streams with real studio dealers: spin the iconic{' '}
              <strong className="text-rose-400">Crazy Time 3D Wheel</strong>, drill Arctic holes in{' '}
              <strong className="text-cyan-400">Ice Fishing Catch Live</strong>, hop onto the 1920s riverboat for{' '}
              <strong className="text-emerald-400">Monopoly Big Baller</strong>, and multiply wagers up to 25,000x with automated agent commission payouts.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {onOpenGamesApi && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onOpenGamesApi();
                  }}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <Code className="w-4 h-4 fill-slate-950" />
                  <span>Inspect Live Games API & Webhooks</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenCommissionHub();
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Crown className="w-4 h-4" />
                <span>Earn 15%–40% Provider Commissions</span>
              </button>

              {onOpenApkModal && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onOpenApkModal();
                  }}
                  className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Download Android APK (v2.4.0)</span>
                </button>
              )}
            </div>
          </div>

          {/* Progressive Jackpot Widget */}
          <div className="shrink-0 p-5 rounded-2xl bg-slate-950/90 border border-amber-500/40 shadow-2xl flex flex-col items-center justify-center text-center space-y-1.5 min-w-[260px]">
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" /> GLOBAL PROGRESSIVE JACKPOT
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow-md">
              ${jackpotAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] font-mono text-emerald-400">
              Drops randomly on any live table or video slot wager
            </div>
          </div>
        </div>

        {/* Featured Flagship Game Highlights Carousel Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
          {crazyTimeGame && (
            <div
              onClick={() => onLaunchGame(crazyTimeGame)}
              className="group p-3.5 rounded-xl bg-gradient-to-r from-rose-950/60 to-slate-950 border border-rose-500/40 hover:border-rose-400 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎡</span>
                <div>
                  <div className="text-xs font-mono text-rose-400 font-bold">EVOLUTION #1 GAME SHOW</div>
                  <div className="text-sm font-bold text-white font-display">{crazyTimeGame.title}</div>
                  <div className="text-[11px] text-slate-400">4 Bonus Rounds · 25,000x Max Win</div>
                </div>
              </div>
              <Play className="w-4 h-4 text-rose-400 group-hover:scale-125 transition-transform shrink-0" />
            </div>
          )}

          {iceFishingGame && (
            <div
              onClick={() => onLaunchGame(iceFishingGame)}
              className="group p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/60 to-slate-950 border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎣</span>
                <div>
                  <div className="text-xs font-mono text-cyan-400 font-bold">JILI ARCADE FISHING</div>
                  <div className="text-sm font-bold text-white font-display">{iceFishingGame.title}</div>
                  <div className="text-[11px] text-slate-400">Drill Ice Holes · 1,000x Frost Kraken</div>
                </div>
              </div>
              <Play className="w-4 h-4 text-cyan-400 group-hover:scale-125 transition-transform shrink-0" />
            </div>
          )}

          {bigBallerGame && (
            <div
              onClick={() => onLaunchGame(bigBallerGame)}
              className="group p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🚢</span>
                <div>
                  <div className="text-xs font-mono text-emerald-400 font-bold">EVOLUTION RIVERBOAT</div>
                  <div className="text-sm font-bold text-white font-display">{bigBallerGame.title}</div>
                  <div className="text-[11px] text-slate-400">3D Monopoly Board · 10,000x Rolls</div>
                </div>
              </div>
              <Play className="w-4 h-4 text-emerald-400 group-hover:scale-125 transition-transform shrink-0" />
            </div>
          )}
        </div>

        {/* Provider Fast-Filter Badges Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mt-5">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectProvider('all');
            }}
            className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
              selectedProvider === 'all'
                ? 'bg-slate-800 border-emerald-500 text-white font-semibold'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-[10px] text-emerald-400 font-mono font-bold">ALL STUDIOS</div>
            <div className="text-xs font-bold text-white mt-0.5 truncate">All Providers</div>
            <div className="text-[10px] text-slate-500 mt-0.5">880+ Games</div>
          </button>

          {GAMING_PROVIDERS.map((p) => {
            const isSelected = selectedProvider === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSelectProvider(p.id);
                }}
                className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-amber-500 text-white font-semibold shadow-md'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-[10px] font-mono text-amber-400 font-bold truncate">
                  {p.commissionRate}% REVSHARE
                </div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">{p.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{p.gamesCount} Games</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section aria-label="Casino Game Filters" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto max-w-full">
            {categories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                aria-label="Search casino games or providers"
                placeholder="Search Ice Fishing, Crazy Time..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 w-48 sm:w-60"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                aria-label="Sort games"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'popular' | 'rtp' | 'max_win')}
                className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="popular" className="bg-slate-900 text-slate-100">
                  Most Popular
                </option>
                <option value="rtp" className="bg-slate-900 text-slate-100">
                  Highest RTP %
                </option>
                <option value="max_win" className="bg-slate-900 text-slate-100">
                  Highest Max Win
                </option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Casino Games Catalog Grid */}
      <section aria-label="Casino Games Grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredGames.length === 0 ? (
          <div className="col-span-full py-16 text-center space-y-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-8">
            <Trophy className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-200">
              No games found matching your search
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Reset your filters to view Crazy Time, Ice Fishing, Monopoly Big Baller, and the complete live catalog.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                onSelectProvider('all');
              }}
              className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredGames.map((game) => {
            const providerInfo = GAMING_PROVIDERS.find((p) => p.id === game.providerId);
            return (
              <div
                key={game.id}
                className="group rounded-2xl border border-slate-800/90 bg-slate-900 hover:border-slate-700 transition-all flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl"
              >
                {/* Visual Thumbnail Area */}
                <div
                  className={`relative h-44 w-full bg-gradient-to-br ${game.thumbnailGradient} p-4 flex flex-col justify-between overflow-hidden`}
                >
                  <div className="flex items-center justify-between z-10">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950/80 text-white border border-slate-700/80 backdrop-blur-sm">
                      {game.providerName}
                    </span>

                    {game.isLive ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        <Radio className="w-2.5 h-2.5 animate-pulse text-rose-400" /> LIVE 4K
                      </span>
                    ) : game.isHot ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        <Flame className="w-2.5 h-2.5 text-amber-400" /> HOT
                      </span>
                    ) : null}
                  </div>

                  {/* Title & Commission Pill */}
                  <div className="z-10 flex flex-col items-start gap-1">
                    <div className="text-lg font-bold text-white font-display tracking-tight drop-shadow-md">
                      {game.title}
                    </div>
                    {providerInfo && (
                      <div className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-slate-950 shadow-sm">
                        Earn {providerInfo.commissionRate}% RevShare
                      </div>
                    )}
                  </div>

                  {/* Play Overlay on Hover */}
                  <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        onLaunchGame(game);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-xl transform group-hover:scale-105 transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>{game.isLive ? 'Join Live Studio' : 'Launch Game'}</span>
                    </button>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-3.5 space-y-2.5">
                  <div className="text-xs text-slate-300 line-clamp-1">{game.tagline}</div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                    <div>
                      <div className="text-slate-500 text-[10px]">RTP Rate</div>
                      <div className="font-semibold text-emerald-400">{game.rtp}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">Max Win</div>
                      <div className="font-semibold text-amber-400">{game.maxWin}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-500 text-[10px]">Active</div>
                      <div className="text-slate-300 flex items-center justify-end gap-1">
                        <Users className="w-2.5 h-2.5 text-slate-400" />
                        <span>{game.livePlayersCount?.toLocaleString() || '1.2k'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onLaunchGame(game);
                    }}
                    className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3 h-3 text-emerald-400" />
                    <span>{game.isLive ? 'Launch Live Stream' : 'Play Interactive Game'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};
