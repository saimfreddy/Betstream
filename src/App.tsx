import React, { useState, useEffect, useMemo } from 'react';
import {
  ActiveMainTab,
  AffiliateProfile,
  CasinoGame,
  CurrencyCode,
  LiveCommissionEvent,
  PlacedBet,
  ProviderCommissionStat,
  ProviderId,
  SelectedOdd,
  SportCategory,
  SportMatch,
  TransactionRecord,
} from './types';
import {
  CURRENCIES,
  GAMING_PROVIDERS,
  CASINO_GAMES,
  INITIAL_AFFILIATE_PROFILE,
  INITIAL_PROVIDER_COMMISSIONS,
  INITIAL_LIVE_COMMISSION_FEED,
  INITIAL_MATCHES,
  INITIAL_TRANSACTIONS,
  INITIAL_WALLET_BALANCES,
} from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SportsbookView } from './components/SportsbookView';
import { CasinoLobbyView } from './components/CasinoLobbyView';
import { AffiliateCommissionView } from './components/AffiliateCommissionView';
import { GamesApiConsole } from './components/GamesApiConsole';
import { AdminPanelView } from './components/AdminPanelView';
import { ApkDownloadModal } from './components/ApkDownloadModal';
import { GameLauncherModal } from './components/GameLauncherModal';
import { BetSlipPanel } from './components/BetSlipPanel';
import { PaymentGatewayModal } from './components/PaymentGatewayModal';
import { sound } from './utils/sound';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveMainTab>('sportsbook');
  const [selectedSport, setSelectedSport] = useState<SportCategory>('all');
  const [liveOnlyFilter, setLiveOnlyFilter] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>('all');

  // Wallet & Multi-Currency State
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>('USDT');
  const [balances, setBalances] = useState<Record<CurrencyCode, number>>(INITIAL_WALLET_BALANCES);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [cashierOpen, setCashierOpen] = useState<boolean>(false);
  const [cashierTab, setCashierTab] = useState<'deposit' | 'withdraw' | 'swap' | 'ledger'>('deposit');

  // Affiliate & Agent Commission State
  const [affiliateProfile, setAffiliateProfile] = useState<AffiliateProfile>(INITIAL_AFFILIATE_PROFILE);
  const [providerCommissions, setProviderCommissions] = useState<ProviderCommissionStat[]>(
    INITIAL_PROVIDER_COMMISSIONS
  );
  const [liveCommissionFeed, setLiveCommissionFeed] = useState<LiveCommissionEvent[]>(
    INITIAL_LIVE_COMMISSION_FEED
  );

  // Sportsbook Matches & Bet Slip State
  const [matches, setMatches] = useState<SportMatch[]>(INITIAL_MATCHES);
  const [selectedOdds, setSelectedOdds] = useState<SelectedOdd[]>([
    {
      selectionId: 'm-ucl-1-w1',
      matchId: 'm-ucl-1',
      matchTitle: 'Real Madrid vs Arsenal FC',
      league: 'UEFA Champions League',
      marketName: 'Match Winner',
      optionLabel: 'Real Madrid (1)',
      odds: 1.52,
      isLive: true,
    },
  ]);
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([
    {
      id: 'bet-881',
      mode: 'single',
      selections: [
        {
          selectionId: 'm-nba-1-w1',
          matchId: 'm-nba-1',
          matchTitle: 'Boston Celtics vs Denver Nuggets',
          league: 'NBA Regular Season',
          marketName: 'Match Winner',
          optionLabel: 'Celtics (1)',
          odds: 1.44,
          isLive: true,
        },
      ],
      totalOdds: 1.44,
      currency: 'USDT',
      stake: 50,
      potentialPayout: 72.0,
      cashoutOffer: 62.0,
      status: 'open',
      placedAt: '4m ago',
    },
  ]);

  // Active Game Launcher Modal State
  const [launchedGame, setLaunchedGame] = useState<CasinoGame | null>(null);
  const [launcherOpen, setLauncherOpen] = useState<boolean>(false);
  const [apkModalOpen, setApkModalOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Synchronize Tab Changes
  const handleSelectTab = (tab: ActiveMainTab) => {
    setActiveTab(tab);
    if (tab === 'live_sports') {
      setLiveOnlyFilter(true);
    } else if (tab === 'sportsbook') {
      setLiveOnlyFilter(false);
    } else if (tab === 'live_dealers') {
      setSelectedProvider('evolution');
    }
  };

  // Adjust Wallet Balance
  const handleAdjustBalance = (delta: number, currency: CurrencyCode = activeCurrency) => {
    setBalances((prev) => ({
      ...prev,
      [currency]: Math.max(0, Number(((prev[currency] || 0) + delta).toFixed(6))),
    }));
  };

  // Real-time Provider Commission Attribute Engine
  const handleCommissionGenerated = (
    providerName: string,
    gameName: string,
    wagerUSD: number,
    commissionUSD: number
  ) => {
    // 1. Credit Affiliate Profile Available Commission
    setAffiliateProfile((prev) => ({
      ...prev,
      totalEarningsUSD: Number((prev.totalEarningsUSD + commissionUSD).toFixed(2)),
      availableCommissionUSD: Number((prev.availableCommissionUSD + commissionUSD).toFixed(2)),
    }));

    // 2. Add to Provider Breakdown Matrix
    setProviderCommissions((prev) =>
      prev.map((item) => {
        if (item.providerName.toLowerCase().includes(providerName.toLowerCase())) {
          return {
            ...item,
            turnoverUSD: Number((item.turnoverUSD + wagerUSD).toFixed(2)),
            grossNGR: Number((item.grossNGR + wagerUSD * 0.1).toFixed(2)),
            commissionEarnedUSD: Number((item.commissionEarnedUSD + commissionUSD).toFixed(2)),
          };
        }
        return item;
      })
    );

    // 3. Prepend to Live Commission Ticker
    const newEvent: LiveCommissionEvent = {
      id: `comm-${Date.now()}`,
      timestamp: 'Just now',
      playerAlias: 'You (Active Player)',
      gameName,
      providerName,
      wagerUSD,
      commissionUSD,
    };
    setLiveCommissionFeed((prev) => [newEvent, ...prev.slice(0, 9)]);
  };

  // Claim Affiliate Commission to Main Player Wallet
  const handleClaimCommissionToWallet = (amountUSD: number) => {
    if (amountUSD <= 0) return;
    // Credit USDT balance directly
    handleAdjustBalance(amountUSD, 'USDT');

    setAffiliateProfile((prev) => ({
      ...prev,
      availableCommissionUSD: 0,
      paidCommissionUSD: Number((prev.paidCommissionUSD + amountUSD).toFixed(2)),
    }));

    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      type: 'commission_payout',
      gateway: 'Agent RevShare Settlement Vault',
      currency: 'USDT',
      amount: amountUSD,
      usdEquivalent: amountUSD,
      status: 'completed',
      referenceId: `REV-${Math.floor(100000 + Math.random() * 900000)}`,
      networkOrCard: 'Automated Commission Transfer',
      timestamp: 'Just now',
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Simulate a Referral Bettor Wager to showcase real-time commission earnings
  const handleSimulateReferralBet = () => {
    const randomProviders = [
      { p: 'Evolution Gaming', g: 'Crazy Time 3D Wheel', rate: 0.15 },
      { p: 'Pragmatic Play', g: 'Gates of Olympus 1000', rate: 0.16 },
      { p: 'Spribe', g: 'Aviator', rate: 0.18 },
      { p: 'Evolution Gaming', g: 'Lightning Roulette', rate: 0.15 },
      { p: 'Hacksaw Gaming', g: 'Wanted Dead or a Wild', rate: 0.14 },
    ];
    const pick = randomProviders[Math.floor(Math.random() * randomProviders.length)];
    const wager = 150 + Math.floor(Math.random() * 350);
    const comm = Number((wager * pick.rate).toFixed(2));

    setAffiliateProfile((prev) => ({
      ...prev,
      totalEarningsUSD: Number((prev.totalEarningsUSD + comm).toFixed(2)),
      availableCommissionUSD: Number((prev.availableCommissionUSD + comm).toFixed(2)),
      activeDepositors: prev.activeDepositors + 1,
    }));

    setProviderCommissions((prev) =>
      prev.map((item) => {
        if (item.providerName.toLowerCase().includes(pick.p.toLowerCase())) {
          return {
            ...item,
            turnoverUSD: Number((item.turnoverUSD + wager).toFixed(2)),
            commissionEarnedUSD: Number((item.commissionEarnedUSD + comm).toFixed(2)),
            activePlayers: item.activePlayers + 1,
          };
        }
        return item;
      })
    );

    const randomAliases = ['Player #4819 (VIP)', 'Player #9901 (Whale)', 'Player #2312', 'Player #7804'];
    const newEvent: LiveCommissionEvent = {
      id: `comm-${Date.now()}`,
      timestamp: 'Just now',
      playerAlias: randomAliases[Math.floor(Math.random() * randomAliases.length)],
      gameName: pick.g,
      providerName: pick.p,
      wagerUSD: wager,
      commissionUSD: comm,
    };
    setLiveCommissionFeed((prev) => [newEvent, ...prev.slice(0, 9)]);
  };

  // Live Sports Ticker Pulse
  useEffect(() => {
    const timer = setInterval(() => {
      setMatches((prevMatches) =>
        prevMatches.map((m) => {
          if (!m.isLive) return m;
          const deltaX = (Math.random() - 0.48) * 12;
          const deltaY = (Math.random() - 0.5) * 10;
          const nextX = Math.max(12, Math.min(88, m.stats.ballPos.x + deltaX));
          const nextY = Math.max(15, Math.min(85, m.stats.ballPos.y + deltaY));

          const nextWinner = m.markets.winner.map((opt) => {
            if (Math.random() > 0.4) return opt;
            const shift = (Math.random() - 0.5) * 0.05;
            const nextOdds = Number(Math.max(1.06, opt.odds + shift).toFixed(2));
            return {
              ...opt,
              odds: nextOdds,
              trend: nextOdds > opt.odds ? ('up' as const) : ('down' as const),
            };
          });

          return {
            ...m,
            markets: { ...m.markets, winner: nextWinner },
            stats: {
              ...m.stats,
              ballPos: { x: nextX, y: nextY },
              attackingTeam: nextX > 55 ? 'home' : nextX < 45 ? 'away' : 'neutral',
            },
          };
        })
      );
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  // Simulate Live Match Goal / Point
  const handleSimulateMatchGoal = (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        const scoringSide: 'home' | 'away' = Math.random() >= 0.5 ? 'home' : 'away';
        const increment = m.sport === 'basketball' ? 3 : 1;
        const nextHome = scoringSide === 'home' ? m.homeScore + increment : m.homeScore;
        const nextAway = scoringSide === 'away' ? m.awayScore + increment : m.awayScore;
        const scorerTeam = scoringSide === 'home' ? m.homeTeam : m.awayTeam;

        const eventText =
          m.sport === 'basketball'
            ? `Score! ${scorerTeam} converts 3-point jumper (${nextHome}-${nextAway})`
            : `GOAL! ${scorerTeam} finds the net! (${nextHome}-${nextAway})`;

        return {
          ...m,
          homeScore: nextHome,
          awayScore: nextAway,
          stats: {
            ...m.stats,
            shotsOnTarget: [
              m.stats.shotsOnTarget[0] + (scoringSide === 'home' ? 1 : 0),
              m.stats.shotsOnTarget[1] + (scoringSide === 'away' ? 1 : 0),
            ],
            lastEvent: eventText,
            ballPos: { x: 50, y: 50 },
            attackingTeam: scoringSide,
          },
        };
      })
    );
  };

  // Toggle selection in Bet Slip
  const handleToggleOdd = (odd: SelectedOdd) => {
    setSelectedOdds((prev) => {
      const exists = prev.some((item) => item.selectionId === odd.selectionId);
      if (exists) return prev.filter((item) => item.selectionId !== odd.selectionId);
      const filtered = prev.filter(
        (item) => !(item.matchId === odd.matchId && item.marketName === odd.marketName)
      );
      return [...filtered, odd];
    });
  };

  const handleRemoveOdd = (selectionId: string) => {
    setSelectedOdds((prev) => prev.filter((item) => item.selectionId !== selectionId));
  };

  const handleClearSlip = () => {
    setSelectedOdds([]);
  };

  // Place Bet
  const handlePlaceBet = (mode: 'single' | 'parlay', stakePerBet: number): boolean => {
    if (selectedOdds.length === 0 || stakePerBet <= 0) return false;
    const totalStake = mode === 'parlay' ? stakePerBet : stakePerBet * selectedOdds.length;
    const currentBal = balances[activeCurrency] || 0;
    if (totalStake > currentBal) return false;

    const totalOdds =
      mode === 'parlay'
        ? selectedOdds.reduce((acc, s) => acc * s.odds, 1)
        : selectedOdds.reduce((acc, s) => acc + s.odds, 0);

    const potentialPayout =
      mode === 'parlay'
        ? stakePerBet * totalOdds
        : selectedOdds.reduce((sum, s) => sum + stakePerBet * s.odds, 0);

    handleAdjustBalance(-totalStake, activeCurrency);

    // Also attribute sports commission
    const stakeUSD = totalStake * CURRENCIES[activeCurrency].rateToUSD;
    const sportsComm = Number((stakeUSD * 0.25).toFixed(2));
    handleCommissionGenerated('BetStream Sportsbook', 'Sports Exchange Parlay', stakeUSD, sportsComm);

    const newBet: PlacedBet = {
      id: `bet-${Date.now()}`,
      mode,
      selections: [...selectedOdds],
      totalOdds: Number(totalOdds.toFixed(2)),
      currency: activeCurrency,
      stake: totalStake,
      potentialPayout: Number(potentialPayout.toFixed(4)),
      cashoutOffer: Number((totalStake * 0.94).toFixed(4)),
      status: 'open',
      placedAt: 'Just now',
    };

    setPlacedBets((prev) => [newBet, ...prev]);
    setSelectedOdds([]);
    return true;
  };

  const handleCashOutBet = (betId: string) => {
    const target = placedBets.find((b) => b.id === betId);
    if (!target || target.status !== 'open') return;
    handleAdjustBalance(target.cashoutOffer, target.currency);
    setPlacedBets((prev) =>
      prev.map((b) =>
        b.id === betId
          ? { ...b, status: 'cashed_out', settledPayout: target.cashoutOffer }
          : b
      )
    );
  };

  const handleSimulateSettleBet = (betId: string, outcome: 'won' | 'lost') => {
    const target = placedBets.find((b) => b.id === betId);
    if (!target || target.status !== 'open') return;
    if (outcome === 'won') {
      handleAdjustBalance(target.potentialPayout, target.currency);
    }
    setPlacedBets((prev) =>
      prev.map((b) =>
        b.id === betId
          ? {
              ...b,
              status: outcome,
              settledPayout: outcome === 'won' ? target.potentialPayout : 0,
            }
          : b
      )
    );
  };

  // Cashier handlers
  const handleDeposit = (
    currency: CurrencyCode,
    amount: number,
    gateway: string,
    networkOrCard: string
  ) => {
    handleAdjustBalance(amount, currency);
    const usdEq = amount * CURRENCIES[currency].rateToUSD;
    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      type: 'deposit',
      gateway,
      currency,
      amount,
      usdEquivalent: usdEq,
      status: 'completed',
      referenceId: `0x${Math.random().toString(16).slice(2, 10)}...`,
      networkOrCard,
      timestamp: 'Just now',
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleWithdraw = (
    currency: CurrencyCode,
    amount: number,
    gateway: string,
    destination: string
  ): boolean => {
    const avail = balances[currency] || 0;
    if (amount <= 0 || amount > avail) return false;
    handleAdjustBalance(-amount, currency);
    const usdEq = amount * CURRENCIES[currency].rateToUSD;
    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      type: 'withdrawal',
      gateway,
      currency,
      amount,
      usdEquivalent: usdEq,
      status: 'completed',
      referenceId: `WD-${Math.floor(100000 + Math.random() * 900000)}`,
      networkOrCard: destination.slice(0, 16),
      timestamp: 'Just now',
    };
    setTransactions((prev) => [newTx, ...prev]);
    return true;
  };

  const handleSwap = (
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode,
    fromAmount: number
  ): boolean => {
    const avail = balances[fromCurrency] || 0;
    if (fromAmount <= 0 || fromAmount > avail || fromCurrency === toCurrency) return false;
    const rate = CURRENCIES[fromCurrency].rateToUSD / CURRENCIES[toCurrency].rateToUSD;
    const toAmount = fromAmount * rate;

    handleAdjustBalance(-fromAmount, fromCurrency);
    handleAdjustBalance(toAmount, toCurrency);

    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      type: 'swap',
      gateway: 'BetStream Zero-Slippage Engine',
      currency: toCurrency,
      amount: toAmount,
      usdEquivalent: toAmount * CURRENCIES[toCurrency].rateToUSD,
      status: 'completed',
      referenceId: `SWP-${Math.floor(100000 + Math.random() * 900000)}`,
      networkOrCard: `${fromAmount} ${fromCurrency} → ${toCurrency}`,
      timestamp: 'Just now',
    };
    setTransactions((prev) => [newTx, ...prev]);
    return true;
  };

  const handleOpenCashier = (initial: 'deposit' | 'withdraw' | 'swap' | 'ledger' = 'deposit') => {
    setCashierTab(initial);
    setCashierOpen(true);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    sound.enabled = next;
    setSoundEnabled(next);
    if (next) sound.playClick();
  };

  const handleLaunchGame = (game: CasinoGame) => {
    sound.playClick();
    setLaunchedGame(game);
    setLauncherOpen(true);
  };

  const isSportsView = activeTab === 'sportsbook' || activeTab === 'live_sports';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        activeCurrency={activeCurrency}
        onSelectCurrency={setActiveCurrency}
        balances={balances}
        availableCommissionUSD={affiliateProfile.availableCommissionUSD}
        onOpenCashier={handleOpenCashier}
        onOpenApkModal={() => setApkModalOpen(true)}
      />

      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          selectedSport={selectedSport}
          onSelectSport={setSelectedSport}
          selectedProvider={selectedProvider}
          onSelectProvider={setSelectedProvider}
          onOpenCashier={handleOpenCashier}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onOpenApkModal={() => setApkModalOpen(true)}
        />

        <main className="flex-1 min-w-0 p-4 sm:p-6 overflow-y-auto">
          {isSportsView && (
            <SportsbookView
              matches={matches}
              selectedSport={selectedSport}
              onSelectSport={setSelectedSport}
              liveOnlyFilter={liveOnlyFilter}
              onToggleLiveOnly={setLiveOnlyFilter}
              selectedOdds={selectedOdds}
              onToggleOdd={handleToggleOdd}
              onSimulateMatchGoal={handleSimulateMatchGoal}
            />
          )}

          {(activeTab === 'casino' || activeTab === 'live_dealers' || activeTab === 'originals') && (
            <CasinoLobbyView
              selectedProvider={selectedProvider}
              onSelectProvider={setSelectedProvider}
              onLaunchGame={handleLaunchGame}
              onOpenCommissionHub={() => setActiveTab('affiliate_commission')}
              onOpenGamesApi={() => handleSelectTab('games_api')}
            />
          )}

          {activeTab === 'games_api' && (
            <GamesApiConsole
              activeCurrency={activeCurrency}
              currentBalance={balances[activeCurrency] || 0}
              onAdjustBalance={(delta) => handleAdjustBalance(delta, activeCurrency)}
              onCommissionGenerated={handleCommissionGenerated}
              onLaunchGame={handleLaunchGame}
            />
          )}

          {activeTab === 'affiliate_commission' && (
            <AffiliateCommissionView
              affiliateProfile={affiliateProfile}
              providerCommissions={providerCommissions}
              liveCommissionFeed={liveCommissionFeed}
              onClaimCommissionToWallet={handleClaimCommissionToWallet}
              onSimulateReferralBet={handleSimulateReferralBet}
            />
          )}

          {activeTab === 'admin_panel' && (
            <AdminPanelView
              onBackToPlatform={() => handleSelectTab('casino')}
              onSimulateGoal={handleSimulateMatchGoal}
              onLaunchGame={handleLaunchGame}
            />
          )}

          <footer className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © 2026 BETSTREAM · Evolution Gaming &amp; Jili Certified Provider Aggregator · 18+ Only
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setApkModalOpen(true)}
                className="hover:text-emerald-400 transition-colors cursor-pointer font-semibold flex items-center gap-1 text-emerald-400/90"
              >
                <span>📱 Android APK (v2.4.0)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab('admin_panel')}
                className="hover:text-rose-400 transition-colors cursor-pointer font-semibold flex items-center gap-1 text-rose-400/90"
              >
                <span>🛡️ Admin Backoffice</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab('games_api')}
                className="hover:text-cyan-400 transition-colors cursor-pointer font-mono"
              >
                Games API (Ice Fishing &amp; Crazy Time)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('affiliate_commission')}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                Agent Commission Hub
              </button>
              <button
                type="button"
                onClick={() => handleOpenCashier('ledger')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Payment Gateways
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab('casino')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                All 880+ Casino Games
              </button>
            </div>
          </footer>
        </main>

        <BetSlipPanel
          selectedOdds={selectedOdds}
          onRemoveOdd={handleRemoveOdd}
          onClearSlip={handleClearSlip}
          activeCurrency={activeCurrency}
          currentBalance={balances[activeCurrency] || 0}
          onPlaceBet={handlePlaceBet}
          placedBets={placedBets}
          onCashOutBet={handleCashOutBet}
          onSimulateSettleBet={handleSimulateSettleBet}
          onOpenCashier={() => handleOpenCashier('deposit')}
          desktopDrawerMode={!isSportsView}
        />
      </div>

      <GameLauncherModal
        game={launchedGame}
        isOpen={launcherOpen}
        onClose={() => setLauncherOpen(false)}
        activeCurrency={activeCurrency}
        currentBalance={balances[activeCurrency] || 0}
        onAdjustBalance={(delta) => handleAdjustBalance(delta, activeCurrency)}
        onCommissionGenerated={handleCommissionGenerated}
      />

      <PaymentGatewayModal
        isOpen={cashierOpen}
        onClose={() => setCashierOpen(false)}
        initialTab={cashierTab}
        activeCurrency={activeCurrency}
        onSelectCurrency={setActiveCurrency}
        balances={balances}
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
        onSwap={handleSwap}
        transactions={transactions}
      />

      <ApkDownloadModal
        isOpen={apkModalOpen}
        onClose={() => setApkModalOpen(false)}
      />
    </div>
  );
}

export default App;
