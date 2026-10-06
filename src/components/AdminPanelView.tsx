import React, { useState } from 'react';
import {
  ShieldAlert,
  BarChart3,
  Users,
  Gamepad2,
  Wallet,
  Settings,
  Lock,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  SlidersHorizontal,
  Flame,
  Radio,
  Clock,
  Key,
  ShieldCheck,
  Check,
  Trophy,
} from 'lucide-react';
import {
  AdminGatewayConfig,
  AdminPendingWithdrawal,
  AdminPlayerRecord,
  AdminSystemAuditLog,
  CasinoGame,
  CurrencyCode,
  GamingProvider,
  SportMatch,
} from '../types';
import { CURRENCIES, GAMING_PROVIDERS, CASINO_GAMES, INITIAL_MATCHES } from '../data/mockData';
import { sound } from '../utils/sound';

interface AdminPanelViewProps {
  onBackToPlatform: () => void;
  onSimulateGoal: (matchId: string) => void;
  onLaunchGame: (game: CasinoGame) => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  onBackToPlatform,
  onSimulateGoal,
  onLaunchGame,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'providers' | 'games' | 'treasury' | 'players' | 'sportsbook' | 'audit'
  >('overview');

  const [notification, setNotification] = useState<string | null>(null);

  // Editable Providers State
  const [providersList, setProvidersList] = useState<
    Array<{ id: string; name: string; enabled: boolean; commissionRate: number; margin: number }>
  >([
    { id: 'evolution', name: 'Evolution Gaming', enabled: true, commissionRate: 15, margin: 4.5 },
    { id: 'pragmatic', name: 'Pragmatic Play', enabled: true, commissionRate: 16, margin: 3.8 },
    { id: 'jili', name: 'Jili & TaDa Gaming (Ice Fishing)', enabled: true, commissionRate: 16, margin: 4.2 },
    { id: 'spribe', name: 'Spribe (Aviator)', enabled: true, commissionRate: 18, margin: 3.0 },
    { id: 'hacksaw', name: 'Hacksaw Gaming', enabled: true, commissionRate: 14, margin: 4.0 },
    { id: 'playngo', name: 'Play\'n GO', enabled: true, commissionRate: 12, margin: 3.9 },
    { id: 'nolimit', name: 'Nolimit City', enabled: true, commissionRate: 15, margin: 4.2 },
    { id: 'originals', name: 'BetStream Originals', enabled: true, commissionRate: 40, margin: 1.0 },
  ]);

  // Editable Games State
  const [gamesList, setGamesList] = useState<
    Array<{ id: string; title: string; providerName: string; enabled: boolean; minBet: number; maxBet: number; rtp: string }>
  >([
    { id: 'evo-crazy-time', title: 'Crazy Time 3D Wheel', providerName: 'Evolution Gaming', enabled: true, minBet: 0.5, maxBet: 5000, rtp: '96.08%' },
    { id: 'evo-monopoly-live', title: 'Monopoly Big Baller Live', providerName: 'Evolution Gaming', enabled: true, minBet: 0.2, maxBet: 3000, rtp: '96.10%' },
    { id: 'jili-ice-fishing', title: 'Ice Fishing Catch Live', providerName: 'Jili & TaDa Gaming', enabled: true, minBet: 0.5, maxBet: 1000, rtp: '97.10%' },
    { id: 'evo-lightning-roulette', title: 'Lightning Roulette', providerName: 'Evolution Gaming', enabled: true, minBet: 1.0, maxBet: 10000, rtp: '97.30%' },
    { id: 'evo-mega-ball', title: 'Mega Ball 100x Live', providerName: 'Evolution Gaming', enabled: true, minBet: 0.1, maxBet: 1000, rtp: '95.40%' },
    { id: 'prag-gates-olympus', title: 'Gates of Olympus 1000', providerName: 'Pragmatic Play', enabled: true, minBet: 0.2, maxBet: 250, rtp: '96.50%' },
    { id: 'spribe-aviator', title: 'Aviator', providerName: 'Spribe', enabled: true, minBet: 0.1, maxBet: 1000, rtp: '97.00%' },
  ]);

  // Pending Withdrawals Queue
  const [pendingWithdrawals, setPendingWithdrawals] = useState<AdminPendingWithdrawal[]>([
    {
      id: 'wd-901',
      playerId: 'usr_89204_vip',
      playerUsername: 'WhaleKing_99',
      currency: 'USDT',
      amount: 2500,
      usdEquivalent: 2500,
      gateway: 'Tether TRC-20',
      destinationAddressOrCard: 'TJz7Yp4M9eR2BvLxQ19dK...',
      network: 'Tron Network',
      requestedAt: '3m ago',
      riskScore: 'Low (0.12)',
      status: 'pending',
    },
    {
      id: 'wd-902',
      playerId: 'usr_48122',
      playerUsername: 'SatoshiRoller',
      currency: 'BTC',
      amount: 0.045,
      usdEquivalent: 4016.25,
      gateway: 'Bitcoin Mainnet',
      destinationAddressOrCard: 'bc1qxy2kgdygjrsqtzq2n0yr...',
      network: 'Bitcoin SegWit',
      requestedAt: '12m ago',
      riskScore: 'Low (0.12)',
      status: 'pending',
    },
    {
      id: 'wd-903',
      playerId: 'usr_77189',
      playerUsername: 'LuckyStriker',
      currency: 'USD',
      amount: 850,
      usdEquivalent: 850,
      gateway: 'Visa Direct 3DS',
      destinationAddressOrCard: '•••• •••• •••• 4892',
      network: 'Visa Fast Funds',
      requestedAt: '28m ago',
      riskScore: 'Medium (0.48)',
      status: 'pending',
    },
  ]);

  // Player Records
  const [players, setPlayers] = useState<AdminPlayerRecord[]>([
    {
      id: 'usr_89204_vip',
      username: 'WhaleKing_99',
      email: 'whale99@crypto.net',
      country: 'United Kingdom',
      vipTier: 'Whale',
      balances: { USDT: 14200, BTC: 0.85, ETH: 6.4, SOL: 84, USD: 5200, EUR: 3100 },
      totalDepositedUSD: 48500,
      totalWithdrawnUSD: 24000,
      totalWageredUSD: 184000,
      status: 'active',
      registeredDate: '2026-08-14',
      lastLogin: 'Active Now',
      kycVerified: true,
    },
    {
      id: 'usr_48122',
      username: 'SatoshiRoller',
      email: 'satoshir@gmail.com',
      country: 'Germany',
      vipTier: 'Gold',
      balances: { USDT: 3200, BTC: 0.12, ETH: 1.1, SOL: 15, USD: 1200, EUR: 950 },
      totalDepositedUSD: 16200,
      totalWithdrawnUSD: 9800,
      totalWageredUSD: 72000,
      status: 'active',
      registeredDate: '2026-09-02',
      lastLogin: '4m ago',
      kycVerified: true,
    },
    {
      id: 'usr_77189',
      username: 'LuckyStriker',
      email: 'luckystriker@yahoo.com',
      country: 'Brazil',
      vipTier: 'Silver',
      balances: { USDT: 950, BTC: 0.01, ETH: 0.25, SOL: 4, USD: 450, EUR: 300 },
      totalDepositedUSD: 4200,
      totalWithdrawnUSD: 1200,
      totalWageredUSD: 21400,
      status: 'active',
      registeredDate: '2026-09-18',
      lastLogin: '28m ago',
      kycVerified: true,
    },
    {
      id: 'usr_10294',
      username: 'SuspiciousBettor',
      email: 'bot_runner4@proton.me',
      country: 'Unknown Proxy',
      vipTier: 'Bronze',
      balances: { USDT: 50, BTC: 0, ETH: 0, SOL: 0, USD: 0, EUR: 0 },
      totalDepositedUSD: 100,
      totalWithdrawnUSD: 0,
      totalWageredUSD: 850,
      status: 'flagged',
      registeredDate: '2026-10-04',
      lastLogin: '1d ago',
      kycVerified: false,
    },
  ]);

  // System Audit Trail
  const [auditLogs, setAuditLogs] = useState<AdminSystemAuditLog[]>([
    {
      id: 'aud-1',
      timestamp: '10:48:12',
      adminUser: 'SuperAdmin (root)',
      action: 'SET_REVSHARE_COMMISSION',
      category: 'PROVIDER',
      details: 'Adjusted Jili Ice Fishing RevShare to 16.0% and Evolution to 15.0%',
      ipAddress: '185.120.44.12',
      severity: 'info',
    },
    {
      id: 'aud-2',
      timestamp: '10:46:05',
      adminUser: 'FinanceOfficer_1',
      action: 'APPROVE_WITHDRAWAL',
      category: 'FINANCE',
      details: 'Approved 1,500.00 USDT payout for Player #2890 via Tron TRC-20',
      ipAddress: '92.118.39.81',
      severity: 'info',
    },
    {
      id: 'aud-3',
      timestamp: '10:42:50',
      adminUser: 'SecurityDaemon',
      action: 'FLAG_SUSPICIOUS_IP',
      category: 'SECURITY',
      details: 'Automated rate limit triggered on Rapid Aviator API from Tor exit node',
      ipAddress: '194.26.29.11',
      severity: 'warning',
    },
  ]);

  const showToast = (msg: string) => {
    setNotification(msg);
    sound.playWin();
    setTimeout(() => setNotification(null), 3000);
  };

  // Actions
  const handleApproveWithdrawal = (id: string) => {
    const wd = pendingWithdrawals.find((w) => w.id === id);
    if (!wd) return;

    setPendingWithdrawals((prev) => prev.filter((w) => w.id !== id));
    const newLog: AdminSystemAuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: 'Just now',
      adminUser: 'AdminOperator',
      action: 'APPROVE_WITHDRAWAL_ONCHAIN',
      category: 'FINANCE',
      details: `Approved & Broadcast ${wd.amount} ${wd.currency} to ${wd.playerUsername}`,
      ipAddress: '127.0.0.1',
      severity: 'info',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    showToast(`Approved ${wd.amount} ${wd.currency} payout for ${wd.playerUsername}! Broadcast on-chain.`);
  };

  const handleRejectWithdrawal = (id: string) => {
    const wd = pendingWithdrawals.find((w) => w.id === id);
    if (!wd) return;

    setPendingWithdrawals((prev) => prev.filter((w) => w.id !== id));
    const newLog: AdminSystemAuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: 'Just now',
      adminUser: 'AdminOperator',
      action: 'REJECT_WITHDRAWAL',
      category: 'FINANCE',
      details: `Rejected & Refunded ${wd.amount} ${wd.currency} to ${wd.playerUsername}`,
      ipAddress: '127.0.0.1',
      severity: 'warning',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    showToast(`Rejected payout #${id}. Funds refunded to player.`);
  };

  const handleToggleProvider = (providerId: string) => {
    setProvidersList((prev) =>
      prev.map((p) => {
        if (p.id === providerId) {
          const next = !p.enabled;
          showToast(`${p.name} is now ${next ? 'ACTIVE' : 'IN MAINTENANCE'}`);
          return { ...p, enabled: next };
        }
        return p;
      })
    );
  };

  const handleUpdateCommissionRate = (providerId: string, delta: number) => {
    setProvidersList((prev) =>
      prev.map((p) => {
        if (p.id === providerId) {
          const nextRate = Math.max(5, Math.min(60, p.commissionRate + delta));
          showToast(`${p.name} RevShare updated to ${nextRate}%`);
          return { ...p, commissionRate: nextRate };
        }
        return p;
      })
    );
  };

  const handleToggleGame = (gameId: string) => {
    setGamesList((prev) =>
      prev.map((g) => {
        if (g.id === gameId) {
          const next = !g.enabled;
          showToast(`${g.title} status updated to ${next ? 'ONLINE' : 'MAINTENANCE'}`);
          return { ...g, enabled: next };
        }
        return g;
      })
    );
  };

  const handleCreditBonus = (playerId: string) => {
    setPlayers((prev) =>
      prev.map((pl) => {
        if (pl.id === playerId) {
          showToast(`Credited +500.00 USDT VIP Bonus to ${pl.username}`);
          return {
            ...pl,
            balances: { ...pl.balances, USDT: pl.balances.USDT + 500 },
          };
        }
        return pl;
      })
    );
  };

  const handleTogglePlayerStatus = (playerId: string) => {
    setPlayers((prev) =>
      prev.map((pl) => {
        if (pl.id === playerId) {
          const nextStatus = pl.status === 'active' ? 'suspended' : 'active';
          showToast(`Player ${pl.username} status set to ${nextStatus.toUpperCase()}`);
          return { ...pl, status: nextStatus };
        }
        return pl;
      })
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {notification && (
        <div className="fixed top-16 right-6 z-50 p-3.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 fill-slate-950 text-white" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Top Header Banner */}
      <section
        aria-label="Admin Control Center"
        className="rounded-2xl border border-rose-500/40 bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 p-6 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-rose-500/10 via-amber-500/5 to-transparent pointer-events-none rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>SUPERADMIN COMMAND BACKOFFICE</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" /> LIVE PRODUCTION GATEWAY
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
              Casino &amp; Sportsbook Master Admin Panel
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Real-time oversight over Gaming Providers (Evolution, Jili, Pragmatic), games management,
              pending player withdrawal authorizations, live odds juice margins, and treasury liquidity.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onBackToPlatform}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              Exit to Player Portal
            </button>
            <span className="px-3 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold rounded-xl">
              ROOT_AUTHORIZED
            </span>
          </div>
        </div>

        {/* Global KPI Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 font-mono">GROSS GAMING (GGR)</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">$1,428,950</div>
            <div className="text-[10px] text-emerald-500 font-mono">+14.2% this wk</div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 font-mono">NET REVENUE (NGR)</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">$920,410</div>
            <div className="text-[10px] text-slate-400 font-mono">After RevShare</div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 font-mono">24H TURNOVER</div>
            <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">$4,850,220</div>
            <div className="text-[10px] text-slate-400 font-mono">880+ Games &amp; Sports</div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 font-mono">ACTIVE PLAYERS</div>
            <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">3,420 Live</div>
            <div className="text-[10px] text-emerald-400 font-mono">98.4% Retention</div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 font-mono">PENDING PAYOUTS</div>
            <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">
              ${pendingWithdrawals.reduce((sum, w) => sum + w.usdEquivalent, 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-rose-300 font-mono">{pendingWithdrawals.length} In Queue</div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 font-mono">HOUSE WIN MARGIN</div>
            <div className="text-sm font-bold text-purple-400 font-mono mt-0.5">4.82%</div>
            <div className="text-[10px] text-slate-400 font-mono">Provably Fair 99%</div>
          </div>
        </div>
      </section>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Dashboard & Analytics', icon: BarChart3 },
          { id: 'providers', label: 'Providers & RevShare', icon: SlidersHorizontal },
          { id: 'games', label: 'Live Games & Limits', icon: Gamepad2 },
          { id: 'treasury', label: 'Treasury & Withdrawals', icon: Wallet },
          { id: 'players', label: 'Player Management & KYC', icon: Users },
          { id: 'sportsbook', label: 'Sportsbook Risk & Settle', icon: Trophy },
          { id: 'audit', label: 'System Audit Logs', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveAdminTab(tab.id as typeof activeAdminTab);
              }}
              className={`py-3 px-3.5 text-xs font-bold rounded-t-xl border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'border-rose-500 bg-slate-900 text-white shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.id === 'treasury' && pendingWithdrawals.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                  {pendingWithdrawals.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE DASHBOARD */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Real-Time Volume Distribution */}
            <div className="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>Real-Time Turnover by Provider / Product</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">LAST 24 HOURS</span>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Evolution Gaming (Crazy Time, Big Baller, Lightning)', volume: 1840200, pct: 38, color: 'bg-rose-500' },
                  { name: 'Jili & TaDa Gaming (Ice Fishing & Arcade)', volume: 1120400, pct: 23, color: 'bg-cyan-500' },
                  { name: 'Pragmatic Play (Gates of Olympus, Sweet Bonanza)', volume: 940000, pct: 19, color: 'bg-amber-500' },
                  { name: 'Live Sportsbook Exchange (UCL, NBA, CS2)', volume: 680000, pct: 14, color: 'bg-emerald-500' },
                  { name: 'Spribe & BetStream Originals (Aviator, Crash, Mines)', volume: 269620, pct: 6, color: 'bg-purple-500' },
                ].map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium truncate">{item.name}</span>
                      <span className="font-mono text-white font-bold">
                        ${item.volume.toLocaleString()} ({item.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Authorizations Panel */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
                  <span>Pending Withdrawal Authorizations</span>
                  <span className="text-rose-400 font-mono">{pendingWithdrawals.length} Action Needed</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Review and broadcast blockchain and fiat player payout requests. High-value requests undergo automated AML heuristics.
                </p>
              </div>

              <div className="space-y-2.5">
                {pendingWithdrawals.slice(0, 2).map((wd) => (
                  <div key={wd.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-white">{wd.playerUsername}</span>
                      <span className="text-emerald-400 font-mono">{wd.amount} {wd.currency}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      {wd.gateway} · {wd.requestedAt}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleApproveWithdrawal(wd.id)}
                        className="flex-1 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] rounded-lg cursor-pointer"
                      >
                        Approve TX
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectWithdrawal(wd.id)}
                        className="py-1 px-3 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-[11px] font-bold rounded-lg cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveAdminTab('treasury')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
              >
                View Complete Treasury Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GAMING PROVIDERS & REVSHARE */}
      {activeAdminTab === 'providers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Aggregated Gaming Providers &amp; Commission Rates</h2>
              <p className="text-xs text-slate-400">
                Adjust operator revenue share percentages, toggle studio maintenance windows, and inspect live RTP parameters.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400">{providersList.filter((p) => p.enabled).length} Active Studios</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providersList.map((p) => (
              <div
                key={p.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold text-white font-display">{p.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      House Margin: {p.margin}% · Aggregator ID: <code>{p.id}</code>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleProvider(p.id)}
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-colors cursor-pointer ${
                      p.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {p.enabled ? 'ONLINE' : 'MAINTENANCE'}
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-500 font-mono">YOUR REVSHARE COMMISSION</div>
                    <div className="text-lg font-black font-mono text-amber-400">{p.commissionRate}%</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateCommissionRate(p.id, -1)}
                      className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-sm cursor-pointer border border-slate-800"
                    >
                      -1%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateCommissionRate(p.id, +1)}
                      className="w-8 h-8 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono font-bold text-sm cursor-pointer border border-emerald-500/40"
                    >
                      +1%
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE GAMES & LIMITS */}
      {activeAdminTab === 'games' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Live Games Catalog &amp; Betting Limit Configurations</h2>
              <p className="text-xs text-slate-400">
                Configure table limits for Crazy Time, Monopoly Big Baller, Ice Fishing Catch Live, and slots.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400">{gamesList.length} Flagship Games Configured</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Game Title</th>
                  <th className="p-3.5">Provider</th>
                  <th className="p-3.5">Min Bet</th>
                  <th className="p-3.5">Max Bet</th>
                  <th className="p-3.5">RTP %</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {gamesList.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-white font-display">{g.title}</td>
                    <td className="p-3.5 text-slate-300">{g.providerName}</td>
                    <td className="p-3.5 font-mono text-slate-300">${g.minBet}</td>
                    <td className="p-3.5 font-mono text-amber-400">${g.maxBet.toLocaleString()}</td>
                    <td className="p-3.5 font-mono text-emerald-400">{g.rtp}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          g.enabled
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {g.enabled ? 'ACTIVE' : 'OFFLINE'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleToggleGame(g.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold text-[11px] cursor-pointer"
                      >
                        {g.enabled ? 'Pause' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: TREASURY & WITHDRAWALS */}
      {activeAdminTab === 'treasury' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Pending Player Withdrawal Queue</h2>
              <p className="text-xs text-slate-400">
                Authorizations queue for USDT TRC-20, BTC SegWit, Solana, and Visa Fast Funds.
              </p>
            </div>
            <span className="text-xs font-mono text-rose-400 font-bold">{pendingWithdrawals.length} Pending Approvals</span>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-sm font-bold text-white">Queue Cleared!</div>
              <p className="text-xs text-slate-400">All player withdrawal payouts have been approved and broadcast on-chain.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingWithdrawals.map((wd) => (
                <div
                  key={wd.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{wd.playerUsername}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">
                        {wd.riskScore}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Destination: <span className="text-slate-200">{wd.destinationAddressOrCard}</span> ({wd.network})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Requested {wd.requestedAt} · Reference ID: <code>{wd.id}</code>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-black font-mono text-emerald-400">
                        {wd.amount} {wd.currency}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        ≈ ${wd.usdEquivalent.toLocaleString()} USD
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleApproveWithdrawal(wd.id)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer"
                      >
                        Approve &amp; Broadcast
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectWithdrawal(wd.id)}
                        className="px-3 py-2 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PLAYERS & KYC */}
      {activeAdminTab === 'players' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Registered Bettors &amp; VIP High-Rollers</h2>
              <p className="text-xs text-slate-400">
                Inspect player wallet balances, grant bonus credits, or flag accounts for compliance.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">{players.length} Accounts Monitored</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Username &amp; ID</th>
                  <th className="p-3.5">VIP Tier</th>
                  <th className="p-3.5">USDT Balance</th>
                  <th className="p-3.5">Total Wagered</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {players.map((pl) => (
                  <tr key={pl.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{pl.username}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{pl.email} · {pl.country}</div>
                    </td>
                    <td className="p-3.5 font-bold text-amber-400">{pl.vipTier}</td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">
                      ${pl.balances.USDT.toLocaleString()} USDT
                    </td>
                    <td className="p-3.5 font-mono text-white">
                      ${pl.totalWageredUSD.toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          pl.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {pl.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleCreditBonus(pl.id)}
                        className="px-2.5 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded font-semibold text-[11px] cursor-pointer"
                      >
                        +500 Bonus
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePlayerStatus(pl.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold text-[11px] cursor-pointer"
                      >
                        {pl.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SPORTSBOOK RISK & SETTLE */}
      {activeAdminTab === 'sportsbook' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Sportsbook Odds Margin &amp; Live Match Settlement Engine</h2>
              <p className="text-xs text-slate-400">
                Trigger live score events, calibrate odds margin multipliers, and force settle bet slips.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400">Auto-Odds Risk: ACTIVE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {INITIAL_MATCHES.map((m) => (
              <div key={m.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">{m.league}</span>
                  {m.isLive && (
                    <span className="flex items-center gap-1 text-[10px] text-rose-400 font-bold font-mono">
                      <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE {m.period}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between font-bold text-white text-xs">
                    <span>{m.homeTeam}</span>
                    <span className="font-mono text-emerald-400">{m.homeScore}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-white text-xs">
                    <span>{m.awayTeam}</span>
                    <span className="font-mono text-emerald-400">{m.awayScore}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSimulateGoal(m.id);
                      showToast(`Simulated Goal on ${m.homeTeam} vs ${m.awayTeam}`);
                    }}
                    className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Simulate Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast(`Settled all bets on ${m.homeTeam} vs ${m.awayTeam}`)}
                    className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Settle Bets
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: SYSTEM AUDIT LOGS */}
      {activeAdminTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span>Operator Security &amp; Financial Audit Trail</span>
            <span className="font-mono text-slate-400">{auditLogs.length} events logged</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      {log.action}
                    </span>
                    <span className="text-white font-bold">{log.adminUser}</span>
                    <span className="text-slate-500 text-[10px]">({log.ipAddress})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans">{log.details}</div>
                </div>

                <div className="text-right text-[11px] text-slate-500 shrink-0">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
