import React from 'react';
import {
  Trophy,
  Gamepad2,
  DollarSign,
  Radio,
  Volume2,
  VolumeX,
  ArrowLeftRight,
  TrendingUp,
  Code,
  Zap,
  Smartphone,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { ActiveMainTab, ProviderId, SportCategory } from '../types';
import { GAMING_PROVIDERS } from '../data/mockData';
import { sound } from '../utils/sound';

interface SidebarProps {
  activeTab: ActiveMainTab;
  onSelectTab: (tab: ActiveMainTab) => void;
  selectedSport: SportCategory;
  onSelectSport: (sport: SportCategory) => void;
  selectedProvider: ProviderId;
  onSelectProvider: (provider: ProviderId) => void;
  onOpenCashier: (tab?: 'deposit' | 'withdraw' | 'swap' | 'ledger') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenApkModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  selectedSport,
  onSelectSport,
  selectedProvider,
  onSelectProvider,
  onOpenCashier,
  soundEnabled,
  onToggleSound,
  onOpenApkModal,
}) => {
  const sportCategories: Array<{ id: SportCategory; label: string }> = [
    { id: 'all', label: 'All Sports Matches' },
    { id: 'football', label: 'Football (UCL & Premier League)' },
    { id: 'basketball', label: 'Basketball (NBA)' },
    { id: 'esports', label: 'Esports (CS2 Major)' },
    { id: 'tennis', label: 'Tennis (ATP Masters)' },
    { id: 'mma', label: 'UFC & Championship MMA' },
  ];

  const isSportsView = activeTab === 'sportsbook' || activeTab === 'live_sports';
  const isCasinoView =
    activeTab === 'casino' || activeTab === 'live_dealers' || activeTab === 'originals';

  return (
    <>
      {/* Mobile Navigation Strip */}
      <div className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-900 border-b border-slate-800 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onSelectTab('casino')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'casino' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-300 bg-slate-800/80'
          }`}
        >
          🎰 Online Casino
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('live_dealers')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'live_dealers' ? 'bg-rose-500 text-white font-semibold' : 'text-slate-300 bg-slate-800/80'
          }`}
        >
          🎡 Evolution Live
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('games_api')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'games_api' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-cyan-300 bg-cyan-500/15'
          }`}
        >
          ⚡ Games API
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('sportsbook')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'sportsbook' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-300 bg-slate-800/80'
          }`}
        >
          ⚽ Sportsbook
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('affiliate_commission')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'affiliate_commission'
              ? 'bg-amber-500 text-slate-950 font-semibold'
              : 'text-amber-300 bg-amber-500/15'
          }`}
        >
          💰 Agent RevShare
        </button>
        {onOpenApkModal && (
          <button
            type="button"
            onClick={onOpenApkModal}
            className="px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors text-emerald-300 bg-emerald-500/15 border border-emerald-500/30"
          >
            📱 Download APK
          </button>
        )}
        <button
          type="button"
          onClick={() => onSelectTab('admin_panel')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'admin_panel'
              ? 'bg-rose-500 text-white font-semibold'
              : 'text-rose-300 bg-rose-500/15 border border-rose-500/30'
          }`}
        >
          🛡️ Admin Panel
        </button>
      </div>

      {/* Desktop Left Sidebar */}
      <aside
        aria-label="Platform Sidebar Navigation"
        className="hidden lg:flex flex-col w-64 shrink-0 bg-slate-950 border-r border-slate-800/80 p-4 select-none justify-between"
      >
        <div className="space-y-5">
          {/* View Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onSelectTab('sportsbook');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                isSportsView
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Sports</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onSelectTab('casino');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                isCasinoView
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Casino</span>
            </button>
          </div>

          {/* Affiliate & Agent Commission Priority Banner */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectTab('affiliate_commission');
            }}
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors cursor-pointer ${
              activeTab === 'affiliate_commission'
                ? 'bg-amber-500/20 border-amber-500/80 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800/90 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Agent Commission Hub</div>
                <div className="text-[11px] text-amber-400">Earn up to 50% RevShare</div>
              </div>
            </div>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </button>

          {/* Games API & Integration Hub Banner */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectTab('games_api');
            }}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
              activeTab === 'games_api'
                ? 'bg-cyan-500/20 border-cyan-500/80 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800/90 border-cyan-500/30 text-cyan-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="p-1 bg-cyan-500/20 text-cyan-400 rounded-lg">
                <Code className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Games API & Webhooks</div>
                <div className="text-[10px] text-cyan-400">Ice Fishing & Crazy Time</div>
              </div>
            </div>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {/* Android APK Download Card */}
          {onOpenApkModal && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenApkModal();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-colors cursor-pointer bg-gradient-to-r from-emerald-950/40 to-slate-900 border-emerald-500/30 text-emerald-300 hover:border-emerald-500/60 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Download Android APK</div>
                  <div className="text-[10px] text-emerald-400 font-mono">v2.4.0 (24.8 MB) · 120 FPS</div>
                </div>
              </div>
              <Download className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          )}

          {/* SuperAdmin Backoffice Portal Button */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectTab(activeTab === 'admin_panel' ? 'casino' : 'admin_panel');
            }}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
              activeTab === 'admin_panel'
                ? 'bg-rose-500/20 border-rose-500/80 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800/90 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="p-1 bg-rose-500/20 text-rose-400 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Admin Control Center</div>
                <div className="text-[10px] text-rose-400">GGR, Limits &amp; Payouts</div>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
              ROOT
            </span>
          </button>

          {/* Gaming Providers with Commission Rate Tags */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-semibold text-slate-400">Gaming Providers</span>
              <span className="text-[10px] text-amber-400 font-mono">Commission</span>
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSelectProvider('all');
                  if (!isCasinoView) onSelectTab('casino');
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedProvider === 'all' && activeTab === 'casino'
                    ? 'bg-slate-900 text-white font-semibold border border-slate-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
                }`}
              >
                <span>All Providers (880+ Games)</span>
                <span className="text-emerald-400 font-mono text-[11px]">Up to 40%</span>
              </button>

              {GAMING_PROVIDERS.map((p) => {
                const isSelected = isCasinoView && selectedProvider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onSelectProvider(p.id);
                      if (p.id === 'evolution') {
                        onSelectTab('live_dealers');
                      } else {
                        onSelectTab('casino');
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white font-semibold border border-slate-800'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="font-mono tabular-nums text-[11px] text-amber-400 font-semibold">
                      {p.commissionRate}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sports Categories */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-semibold text-slate-400">Live Sportsbook</span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                <Radio className="w-3 h-3 animate-pulse" /> LIVE
              </span>
            </div>
            <div className="space-y-0.5">
              {sportCategories.map((cat) => {
                const isSelected = isSportsView && selectedSport === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onSelectSport(cat.id);
                      if (!isSportsView) onSelectTab('sportsbook');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white font-semibold border border-slate-800'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
                    }`}
                  >
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Quick Controls */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenCashier('swap');
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900/60 transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Instant Currency Swap</span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/70 hover:bg-slate-900 text-slate-300 border border-slate-800/80 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>Sound Effects</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {soundEnabled ? 'ON' : 'MUTED'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
