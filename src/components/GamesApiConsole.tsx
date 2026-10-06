import React, { useState } from 'react';
import {
  Code,
  Terminal,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Server,
  Radio,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Fish,
  Globe,
  Database,
  ExternalLink,
} from 'lucide-react';
import { CasinoGame, CurrencyCode } from '../types';
import { CURRENCIES, GAMING_PROVIDERS } from '../data/mockData';
import { sound } from '../utils/sound';

interface GamesApiConsoleProps {
  activeCurrency: CurrencyCode;
  currentBalance: number;
  onAdjustBalance: (delta: number) => void;
  onCommissionGenerated: (
    providerName: string,
    gameName: string,
    wagerUSD: number,
    commissionUSD: number
  ) => void;
  onLaunchGame: (game: CasinoGame) => void;
}

interface ApiLogItem {
  id: string;
  timestamp: string;
  method: 'POST' | 'GET';
  endpoint: string;
  provider: string;
  status: 200 | 201;
  latencyMs: number;
  requestPayload: any;
  responsePayload: any;
}

export const GamesApiConsole: React.FC<GamesApiConsoleProps> = ({
  activeCurrency,
  currentBalance,
  onAdjustBalance,
  onCommissionGenerated,
  onLaunchGame,
}) => {
  const [selectedGameKey, setSelectedGameKey] = useState<
    'crazy_time' | 'big_baller' | 'ice_fishing' | 'lightning_roulette' | 'mega_ball'
  >('crazy_time');
  const [selectedEndpoint, setSelectedEndpoint] = useState<
    'launch_session' | 'wallet_debit' | 'wallet_credit' | 'commission_calc' | 'table_feed'
  >('launch_session');

  const [testWager, setTestWager] = useState<string>('50');
  const [testMultiplier, setTestMultiplier] = useState<string>('15');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<'tester' | 'specs' | 'credentials' | 'history'>('tester');

  const [apiLogs, setApiLogs] = useState<ApiLogItem[]>([
    {
      id: 'log-init-1',
      timestamp: '10:41:02.190',
      method: 'POST',
      endpoint: '/api/v2/evolution/launch-session',
      provider: 'Evolution Gaming',
      status: 200,
      latencyMs: 18,
      requestPayload: {
        operator_id: 'BETSTREAM_OPERATOR_PROD',
        game_id: 'evo_crazy_time',
        player_id: 'usr_89204_vip',
        currency: 'USDT',
        language: 'en',
        table_id: 'CrazyTime0000001',
      },
      responsePayload: {
        status: 'SUCCESS',
        session_id: 'evo_sess_99f48201a0bc',
        entry_url: 'https://live-game.evolutiongaming.com/hosted/v2/table?session=evo_sess_99f48201a0bc',
        token_expires_in: 86400,
        stream_quality: '4K_60FPS_LOW_LATENCY',
      },
    },
    {
      id: 'log-init-2',
      timestamp: '10:41:03.421',
      method: 'POST',
      endpoint: '/api/v2/jili/ice-fishing/cast',
      provider: 'Jili & TaDa Gaming',
      status: 200,
      latencyMs: 22,
      requestPayload: {
        operator_id: 'BETSTREAM_OPERATOR_PROD',
        game_id: 'jili_ice_fishing_catch',
        player_id: 'usr_89204_vip',
        hole_id: 2,
        bait_type: 'golden_lure',
        cast_stake: 25.0,
      },
      responsePayload: {
        status: 'SUCCESS',
        catch_event: {
          species: 'Golden Rainbow Trout',
          weight_kg: 9.2,
          base_multiplier: 15.0,
          bonus_multiplier: 1.2,
          total_multiplier: 18.0,
        },
        payout_usd: 450.0,
        signature: 'sha256:d8a920fa58b6...',
      },
    },
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const gameDefinitions = {
    crazy_time: {
      name: 'Crazy Time 3D Wheel',
      provider: 'Evolution Gaming',
      providerId: 'evolution',
      gameId: 'evo_crazy_time',
      category: 'Live Game Show',
      revShareRate: 15,
      endpointBase: '/api/v2/evolution/crazy-time',
      defaultMultipliers: ['10', '25', '50', '250', '500'],
      color: 'from-rose-500/20 to-purple-500/20 text-rose-400 border-rose-500/40',
    },
    big_baller: {
      name: 'Monopoly Big Baller Live',
      provider: 'Evolution Gaming',
      providerId: 'evolution',
      gameId: 'evo_monopoly_big_baller',
      category: 'Live Riverboat Bingo & AR',
      revShareRate: 15,
      endpointBase: '/api/v2/evolution/monopoly-big-baller',
      defaultMultipliers: ['5', '15', '35', '85', '200'],
      color: 'from-emerald-500/20 to-amber-500/20 text-emerald-400 border-emerald-500/40',
    },
    ice_fishing: {
      name: 'Ice Fishing Catch Live',
      provider: 'Jili & TaDa Gaming',
      providerId: 'jili',
      gameId: 'jili_ice_fishing_catch',
      category: 'Arcade Ice Fishing Multiplier',
      revShareRate: 16,
      endpointBase: '/api/v2/jili/ice-fishing',
      defaultMultipliers: ['2', '5', '15', '50', '150', '1000'],
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/40',
    },
    lightning_roulette: {
      name: 'XXXtreme Lightning Roulette',
      provider: 'Evolution Gaming',
      providerId: 'evolution',
      gameId: 'evo_xxxtreme_roulette',
      category: 'Live Lightning Table',
      revShareRate: 15,
      endpointBase: '/api/v2/evolution/lightning-roulette',
      defaultMultipliers: ['50', '100', '250', '500', '2000'],
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/40',
    },
    mega_ball: {
      name: 'Mega Ball 100x Live',
      provider: 'Evolution Gaming',
      providerId: 'evolution',
      gameId: 'evo_mega_ball',
      category: 'Live Ball Hopper',
      revShareRate: 15,
      endpointBase: '/api/v2/evolution/mega-ball',
      defaultMultipliers: ['5', '10', '25', '50', '100'],
      color: 'from-yellow-500/20 to-lime-500/20 text-yellow-400 border-yellow-500/40',
    },
  };

  const selectedGame = gameDefinitions[selectedGameKey];

  const handleExecuteApiCall = () => {
    if (isExecuting) return;
    setIsExecuting(true);
    sound.playSpinTick();

    const wagerNum = Math.max(1, parseFloat(testWager) || 25);
    const multNum = Math.max(1, parseFloat(testMultiplier) || 5);
    const winAmount = Number((wagerNum * multNum).toFixed(2));
    const rateToUSD = CURRENCIES[activeCurrency].rateToUSD;
    const wagerUSD = wagerNum * rateToUSD;
    const earnedCommissionUSD = Number((wagerUSD * (selectedGame.revShareRate / 100)).toFixed(2));

    setTimeout(() => {
      let endpointPath = '';
      let reqBody: any = {};
      let resBody: any = {};

      const nowStr = new Date().toTimeString().split(' ')[0] + '.' + String(Math.floor(Math.random() * 900) + 100);

      if (selectedEndpoint === 'launch_session') {
        endpointPath = `${selectedGame.endpointBase}/launch-session`;
        reqBody = {
          operator_id: 'BETSTREAM_OPERATOR_PROD',
          game_id: selectedGame.gameId,
          player_id: 'usr_89204_vip',
          currency: activeCurrency,
          ip_address: '185.120.44.12',
          channel: 'desktop_iframe',
          session_nonce: `nonce_${Date.now()}`,
        };
        resBody = {
          status: 'SUCCESS',
          code: 200,
          session_id: `sess_${selectedGame.gameId}_${Date.now()}`,
          launch_url: `https://gdc.${selectedGame.providerId}.com/launch?token=jwt_eyJhGciOiJIUz...&game=${selectedGame.gameId}&currency=${activeCurrency}`,
          heartbeat_interval_sec: 30,
          seamless_wallet_ready: true,
        };
      } else if (selectedEndpoint === 'wallet_debit') {
        endpointPath = `/api/v2/wallet/debit`;
        reqBody = {
          transaction_id: `tx_debit_${Date.now()}`,
          round_id: `rnd_${Math.floor(100000 + Math.random() * 900000)}`,
          game_id: selectedGame.gameId,
          provider_id: selectedGame.providerId,
          amount: wagerNum,
          currency: activeCurrency,
          signature: 'hmac_sha256_valid',
        };

        if (wagerNum <= currentBalance) {
          onAdjustBalance(-wagerNum);
          onCommissionGenerated(selectedGame.provider, selectedGame.name, wagerUSD, earnedCommissionUSD);
        }

        resBody = {
          status: 'SETTLED',
          balance_after: Number(Math.max(0, currentBalance - wagerNum).toFixed(2)),
          currency: activeCurrency,
          debited: wagerNum,
          revshare_attributed_usd: earnedCommissionUSD,
        };
      } else if (selectedEndpoint === 'wallet_credit') {
        endpointPath = `/api/v2/wallet/credit`;
        reqBody = {
          transaction_id: `tx_credit_${Date.now()}`,
          round_id: `rnd_${Math.floor(100000 + Math.random() * 900000)}`,
          game_id: selectedGame.gameId,
          provider_id: selectedGame.providerId,
          wager_amount: wagerNum,
          multiplier: multNum,
          payout_amount: winAmount,
          currency: activeCurrency,
        };

        onAdjustBalance(winAmount);
        sound.playWin();

        resBody = {
          status: 'SETTLED',
          payout_credited: winAmount,
          currency: activeCurrency,
          balance_after: Number((currentBalance + winAmount).toFixed(2)),
          verified_by: 'PROVABLY_FAIR_RNG',
        };
      } else if (selectedEndpoint === 'commission_calc') {
        endpointPath = `/api/v2/affiliate/calculate-commission`;
        reqBody = {
          provider_id: selectedGame.providerId,
          game_id: selectedGame.gameId,
          wager_usd: wagerUSD,
          contract_rate_percent: selectedGame.revShareRate,
        };

        onCommissionGenerated(selectedGame.provider, selectedGame.name, wagerUSD, earnedCommissionUSD);

        resBody = {
          status: 'COMMISSION_ACCRUED',
          gross_gaming_turnover_usd: wagerUSD,
          commission_rate: `${selectedGame.revShareRate}%`,
          commission_earned_usd: earnedCommissionUSD,
          settlement_vault: 'IMMEDIATE_CLAIMABLE',
        };
      } else {
        // Table feed
        endpointPath = `${selectedGame.endpointBase}/live-stream-status`;
        reqBody = {
          game_id: selectedGame.gameId,
          request_time: new Date().toISOString(),
        };
        resBody = {
          status: 'ONLINE',
          studio_location: selectedGame.providerId === 'evolution' ? 'Riga 4K Studio 1A' : 'Manila Live Hub',
          dealer_name: 'Elena K.',
          active_players: 3840,
          current_stage: 'BETTING_OPEN (12s remaining)',
          video_latency_ms: 18,
          audio_stream: 'PCM_STEREO_48KHZ',
        };
      }

      const newLogItem: ApiLogItem = {
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        method: 'POST',
        endpoint: endpointPath,
        provider: selectedGame.provider,
        status: 200,
        latencyMs: Math.floor(14 + Math.random() * 20),
        requestPayload: reqBody,
        responsePayload: resBody,
      };

      setApiLogs((prev) => [newLogItem, ...prev.slice(0, 14)]);
      setIsExecuting(false);
      sound.playClick();
    }, 450);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / API Architecture Header */}
      <section
        aria-label="Games API Integration Architecture"
        className="rounded-2xl border border-slate-800 bg-slate-900 p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 via-amber-500/5 to-transparent pointer-events-none rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono font-semibold">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>GAMES API & PROVIDER AGGREGATION ENGINE</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" /> 4 STUDIOS ONLINE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
              Live Games API: Ice Fishing, Big Baller & Crazy Time
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Official Aggregator integration gateway for Evolution Gaming, Jili & TaDa Fishing, and Pragmatic Play.
              Test real Seamless Wallet API handshakes, generate Game Delivery Controller (GDC) launch sessions, simulate
              wager debits & jackpot credits, and watch your operator revenue share commissions accrue in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveSubTab('tester')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'tester'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Interactive API Sandbox
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('specs')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'specs'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              API Specs & Webhooks
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('credentials')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'credentials'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Operator Credentials
            </button>
          </div>
        </div>

        {/* Live Provider Handshake Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-rose-500/30">
            <div className="flex items-center justify-between text-[11px] font-mono text-rose-400">
              <span className="font-bold">EVOLUTION GDC</span>
              <span className="text-emerald-400">ONLINE (18ms)</span>
            </div>
            <div className="text-xs font-bold text-white mt-1">Crazy Time & Big Baller</div>
            <div className="text-[10px] text-slate-400 mt-0.5">184 Live 4K Tables · 15% RevShare</div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-cyan-500/30">
            <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400">
              <span className="font-bold">JILI FISHING SOCKET</span>
              <span className="text-emerald-400">ACTIVE (22ms)</span>
            </div>
            <div className="text-xs font-bold text-white mt-1">Ice Fishing Catch Live</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Multiplayer Arcade · 16% RevShare</div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-500/30">
            <div className="flex items-center justify-between text-[11px] font-mono text-amber-400">
              <span className="font-bold">PRAGMATIC SEAMLESS</span>
              <span className="text-emerald-400">ONLINE (14ms)</span>
            </div>
            <div className="text-xs font-bold text-white mt-1">Drops & Wins Live</div>
            <div className="text-[10px] text-slate-400 mt-0.5">CandyLand & Speed Baccarat · 16% RevShare</div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-purple-500/30">
            <div className="flex items-center justify-between text-[11px] font-mono text-purple-400">
              <span className="font-bold">SPRIBE ENGINE</span>
              <span className="text-emerald-400">ONLINE (16ms)</span>
            </div>
            <div className="text-xs font-bold text-white mt-1">Aviator 2.0 Multiplayer</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Real-time Curves · 18% RevShare</div>
          </div>
        </div>
      </section>

      {/* SUB-VIEW 1: INTERACTIVE API SANDBOX & SIMULATOR */}
      {activeSubTab === 'tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: API Configuration & Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Step 1: Select Game API */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>1. Select Game API Target</span>
                <span className="text-[10px] font-mono text-cyan-400">{selectedGame.provider}</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(gameDefinitions) as Array<keyof typeof gameDefinitions>).map((key) => {
                  const g = gameDefinitions[key];
                  const isSelected = selectedGameKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedGameKey(key);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? `bg-slate-800 border-cyan-400 text-white ring-1 ring-cyan-500/40`
                          : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          {key === 'ice_fishing' && <Fish className="w-3.5 h-3.5 text-cyan-400" />}
                          {key === 'crazy_time' && <Zap className="w-3.5 h-3.5 text-rose-400" />}
                          {key === 'big_baller' && <Layers className="w-3.5 h-3.5 text-emerald-400" />}
                          {g.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {g.category} · ID: <code className="text-slate-300">{g.gameId}</code>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {g.revShareRate}% RevShare
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select API Method / Endpoint */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-slate-300">
                2. Select API Endpoint / Callback
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  {
                    id: 'launch_session',
                    label: 'Launch Session (GDC)',
                    desc: 'Generate Iframe URL & JWT Token',
                  },
                  {
                    id: 'wallet_debit',
                    label: 'Debit Callback (Bet)',
                    desc: 'Deduct Stake & Credit RevShare',
                  },
                  {
                    id: 'wallet_credit',
                    label: 'Credit Callback (Win)',
                    desc: 'Credit Multiplier Payout to Wallet',
                  },
                  {
                    id: 'commission_calc',
                    label: 'RevShare Settlement',
                    desc: 'Query & Accrue Agent Share',
                  },
                  {
                    id: 'table_feed',
                    label: 'Live Stream Status',
                    desc: 'Dealer, Table State & Latency',
                  },
                ].map((ep) => {
                  const active = selectedEndpoint === ep.id;
                  return (
                    <button
                      key={ep.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedEndpoint(ep.id as typeof selectedEndpoint);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        active
                          ? 'bg-cyan-500/20 border-cyan-400 text-white font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{ep.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{ep.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Simulation Parameters */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-slate-300">
                3. Simulation Request Parameters
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label htmlFor="test-wager-amount" className="block text-[11px] text-slate-400 mb-1">
                    Simulated Wager ({activeCurrency}):
                  </label>
                  <input
                    id="test-wager-amount"
                    type="number"
                    min="1"
                    value={testWager}
                    onChange={(e) => setTestWager(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label htmlFor="test-hit-multiplier" className="block text-[11px] text-slate-400 mb-1">
                    Hit Multiplier (x):
                  </label>
                  <input
                    id="test-hit-multiplier"
                    type="number"
                    min="1"
                    value={testMultiplier}
                    onChange={(e) => setTestMultiplier(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Multiplier Quick Buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500">Presets:</span>
                {selectedGame.defaultMultipliers.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setTestMultiplier(m);
                    }}
                    className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 text-[11px] font-mono text-cyan-300 rounded border border-slate-800 cursor-pointer"
                  >
                    {m}x
                  </button>
                ))}
              </div>

              {/* Execute Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isExecuting}
                  onClick={handleExecuteApiCall}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>
                    {isExecuting
                      ? 'Executing Handshake...'
                      : `Execute Live API Call on ${selectedGame.name}`}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live JSON Inspector & Stream Log (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Live Terminal / Most Recent Response */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2 text-xs text-slate-300 font-bold">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>LIVE API RESPONSE INSPECTOR</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    HTTP 200 OK
                  </span>
                  {apiLogs[0] && (
                    <span className="text-slate-400">{apiLogs[0].latencyMs}ms</span>
                  )}
                </div>
              </div>

              {apiLogs[0] ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] text-cyan-400 font-bold mb-1 flex items-center justify-between">
                      <span>REQUEST: {apiLogs[0].method} {apiLogs[0].endpoint}</span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(JSON.stringify(apiLogs[0].requestPayload, null, 2), 'req')
                        }
                        className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer text-[10px]"
                      >
                        {copiedId === 'req' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-emerald-300 overflow-x-auto max-h-40">
                      {JSON.stringify(apiLogs[0].requestPayload, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <div className="text-[11px] text-amber-400 font-bold mb-1 flex items-center justify-between">
                      <span>RESPONSE BODY (JSON)</span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(JSON.stringify(apiLogs[0].responsePayload, null, 2), 'res')
                        }
                        className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer text-[10px]"
                      >
                        {copiedId === 'res' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-amber-300 overflow-x-auto max-h-52">
                      {JSON.stringify(apiLogs[0].responsePayload, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">
                  Select an endpoint and execute an API call to inspect the payload.
                </div>
              )}
            </div>

            {/* Recent API Call Log Stream */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Recent API Transaction Stream</span>
                <span className="text-[11px] text-slate-500 font-mono">{apiLogs.length} events logged</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {apiLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                        {log.method}
                      </span>
                      <span className="text-white truncate font-medium">{log.endpoint}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-400">
                      <span className="text-emerald-400">{log.latencyMs}ms</span>
                      <span className="text-slate-500">{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: API SPECIFICATIONS & WEBHOOKS */}
      {activeSubTab === 'specs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Zap className="w-4 h-4" />
                <span>Evolution Gaming Live Feed API</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connects directly to the Riga, Malta, and Atlantic City live studio controllers. Generates secure Game
                Delivery Controller (GDC) sessions for Crazy Time 3D Wheel, Monopoly Big Baller, XXXtreme Lightning
                Roulette, and Mega Ball 100x.
              </p>
              <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-slate-800">
                <div className="text-slate-300 font-semibold">Key Specs:</div>
                <div className="text-slate-400">· Protocol: WSS + REST v2</div>
                <div className="text-slate-400">· Latency: Sub-25ms video synch</div>
                <div className="text-slate-400">· Multipliers: Up to 25,000x</div>
                <div className="text-amber-400">· RevShare: 15% net commission</div>
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Fish className="w-4 h-4" />
                <span>Jili & TaDa Fishing Arcade API</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Specialized multiplayer arcade server protocol for Ice Fishing Catch Live and Bombing Fishing. Handles
                drill hole selection, rod tension physics, sonar echoes, and instant progressive jackpot fish catches.
              </p>
              <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-slate-800">
                <div className="text-slate-300 font-semibold">Key Specs:</div>
                <div className="text-slate-400">· Protocol: Real-Time WebSockets</div>
                <div className="text-slate-400">· Room Capacity: 4–8 players/room</div>
                <div className="text-slate-400">· Max Catch Win: 1,000x Kraken</div>
                <div className="text-amber-400">· RevShare: 16% net commission</div>
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Database className="w-4 h-4" />
                <span>Seamless Wallet Protocol</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Single-wallet architecture allowing players to wager crypto (BTC, USDT, ETH, SOL) and fiat (USD, EUR)
                seamlessly across all 880+ providers without transferring funds to third-party sub-accounts.
              </p>
              <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-slate-800">
                <div className="text-slate-300 font-semibold">Key Specs:</div>
                <div className="text-slate-400">· Auth: HMAC-SHA256 Signatures</div>
                <div className="text-slate-400">· Endpoints: /balance, /debit, /credit</div>
                <div className="text-slate-400">· Idempotency: UUID v4 Guaranteed</div>
                <div className="text-emerald-400">· Speed: Instant Settlement</div>
              </div>
            </div>
          </div>

          {/* cURL Example Code Block */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-white flex items-center gap-2 font-mono">
                <Code className="w-4 h-4 text-cyan-400" />
                <span>Sample Integration Code: Launch Ice Fishing & Crazy Time API</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `curl -X POST https://api.betstream.io/v2/games/launch \\
  -H "Authorization: Bearer sec_live_99a8b27c3d1" \\
  -H "Content-Type: application/json" \\
  -d '{"operator_id":"BETSTREAM","game_id":"evo_crazy_time","player_id":"usr_89204","currency":"USDT"}'`,
                    'curl'
                  )
                }
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer font-mono"
              >
                {copiedId === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy cURL</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto">
{`# 1. Initialize Evolution Gaming Crazy Time 3D Wheel Launch
curl -X POST https://api.betstream.io/v2/games/launch \\
  -H "Authorization: Bearer sec_live_99a8b27c3d1" \\
  -H "Content-Type: application/json" \\
  -d '{
    "operator_id": "BETSTREAM_PROD",
    "game_id": "evo_crazy_time",
    "player_id": "usr_89204_vip",
    "currency": "USDT",
    "mode": "real_play"
  }'

# 2. Initialize Jili Ice Fishing Catch Live Room
curl -X POST https://api.betstream.io/v2/jili/fishing/join-room \\
  -H "Authorization: Bearer sec_live_99a8b27c3d1" \\
  -H "Content-Type: application/json" \\
  -d '{
    "game_id": "jili_ice_fishing_catch",
    "room_tier": "arctic_high_roller",
    "player_currency": "USDT",
    "auto_rebuy": true
  }'`}
            </pre>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: OPERATOR CREDENTIALS & WEBHOOK KEYS */}
      {activeSubTab === 'credentials' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white font-display">
                Operator API Keys & Seamless Webhook Handlers
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Your server credentials for signing transactions and receiving round outcome notifications from Evolution and Jili.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              PRODUCTION READY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="text-slate-400 font-sans font-bold">OPERATOR CLIENT ID</div>
              <div className="text-white font-bold text-sm bg-slate-900 p-2 rounded border border-slate-800 flex items-center justify-between">
                <span>op_betstream_99214_live</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('op_betstream_99214_live', 'op_id')}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  {copiedId === 'op_id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="text-slate-400 font-sans font-bold">HMAC-SHA256 WEBHOOK SECRET</div>
              <div className="text-white font-bold text-sm bg-slate-900 p-2 rounded border border-slate-800 flex items-center justify-between">
                <span>whsec_99af8402ccb7102e9a...</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('whsec_99af8402ccb7102e9a38f71', 'whsec')}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  {copiedId === 'whsec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="text-slate-400 font-sans font-bold">SEAMLESS WALLET CALLBACK URL</div>
              <div className="text-emerald-400 font-bold text-sm bg-slate-900 p-2 rounded border border-slate-800 truncate">
                https://api.betstream.io/v2/wallet/seamless-callback
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="text-slate-400 font-sans font-bold">REVENUE SHARE COMMISSION VAULT</div>
              <div className="text-amber-400 font-bold text-sm bg-slate-900 p-2 rounded border border-slate-800 truncate">
                AUTOMATIC REAL-TIME SETTLEMENT (50% AGENT TIER)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
