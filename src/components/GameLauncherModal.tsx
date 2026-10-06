import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Radio,
  Flame,
  CheckCircle2,
  DollarSign,
  Compass,
  Fish,
  Anchor,
  Dices,
  Code,
  Terminal,
} from 'lucide-react';
import { CasinoGame, CurrencyCode } from '../types';
import { CURRENCIES, GAMING_PROVIDERS } from '../data/mockData';
import { sound } from '../utils/sound';

interface GameLauncherModalProps {
  game: CasinoGame | null;
  isOpen: boolean;
  onClose: () => void;
  activeCurrency: CurrencyCode;
  currentBalance: number;
  onAdjustBalance: (delta: number) => void;
  onCommissionGenerated: (
    providerName: string,
    gameName: string,
    wagerUSD: number,
    commissionUSD: number
  ) => void;
}

export const GameLauncherModal: React.FC<GameLauncherModalProps> = ({
  game,
  isOpen,
  onClose,
  activeCurrency,
  currentBalance,
  onAdjustBalance,
  onCommissionGenerated,
}) => {
  const [wagerInput, setWagerInput] = useState<string>('25');
  const [isSpinning, setIsSpinning] = useState(false);
  const [resultBanner, setResultBanner] = useState<string | null>(null);
  const [commissionNotice, setCommissionNotice] = useState<string | null>(null);

  // Lightning Roulette specific state
  const [selectedBetType, setSelectedBetType] = useState<'red' | 'black' | 'number_7' | 'number_21'>('red');
  const [lightningNumbers, setLightningNumbers] = useState<Array<{ num: number; mult: number }>>([]);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);

  // Crazy Time specific state
  const [crazyBetSpot, setCrazyBetSpot] = useState<'1' | '2' | '5' | '10' | 'coin_flip' | 'cash_hunt' | 'pachinko' | 'crazy_time'>('crazy_time');
  const [crazyResultSegment, setCrazyResultSegment] = useState<string | null>(null);
  const [crazyTopSlot, setCrazyTopSlot] = useState<{ spot: string; mult: number } | null>(null);
  const [crazyBonusOutcome, setCrazyBonusOutcome] = useState<string | null>(null);

  // Monopoly Big Baller specific state
  const [monopolyCardMode, setMonopolyCardMode] = useState<'chance' | 'space'>('chance');
  const [monopolyBonusBet, setMonopolyBonusBet] = useState<'none' | '3_rolls' | '5_rolls'>('3_rolls');
  const [drawnBallNumbers, setDrawnBallNumbers] = useState<number[]>([]);
  const [monopolyLines, setMonopolyLines] = useState<number>(0);

  // Ice Fishing Live specific state
  const [selectedIceHole, setSelectedIceHole] = useState<1 | 2 | 3>(2);
  const [iceBaitType, setIceBaitType] = useState<'standard' | 'golden_lure' | 'frost_dynamite'>('golden_lure');
  const [caughtFish, setCaughtFish] = useState<{ name: string; weight: string; mult: number; emoji: string } | null>(null);

  // Gates of Olympus specific state
  const [zeusMultiplier, setZeusMultiplier] = useState<number>(1);
  const [tumbleCount, setTumbleCount] = useState<number>(0);

  // Aviator specific state
  const [aviatorMultiplier, setAviatorMultiplier] = useState<number>(1.0);
  const [aviatorState, setAviatorState] = useState<'IDLE' | 'FLYING' | 'CRASHED' | 'CASHED_OUT'>('IDLE');
  const aviatorAnimRef = useRef<number | null>(null);
  const aviatorStartRef = useRef<number>(0);
  const aviatorTargetRef = useRef<number>(2.0);

  // Mega Ball 100x specific state
  const [megaBallNumbers, setMegaBallNumbers] = useState<number[]>([]);
  const [finalMegaMultiplier, setFinalMegaMultiplier] = useState<number | null>(null);

  // Live Games API & Webhook Inspector Toggle
  const [showApiInspector, setShowApiInspector] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      if (aviatorAnimRef.current) cancelAnimationFrame(aviatorAnimRef.current);
    };
  }, []);

  if (!isOpen || !game) return null;

  const currencyInfo = CURRENCIES[activeCurrency];
  const numericWager = Math.max(0, parseFloat(wagerInput) || 0);
  const provider = GAMING_PROVIDERS.find((p) => p.id === game.providerId);
  const commissionRate = provider ? provider.commissionRate : 15;

  const validateAndDeduct = (): boolean => {
    if (numericWager <= 0) return false;
    if (numericWager > currentBalance) {
      sound.playLoss();
      setResultBanner(`Insufficient ${activeCurrency} balance to place bet.`);
      return false;
    }
    onAdjustBalance(-numericWager);
    // Attribute commission immediately to user's agent vault
    const wagerUSD = numericWager * currencyInfo.rateToUSD;
    const earnedCommissionUSD = Number((wagerUSD * (commissionRate / 100)).toFixed(2));
    onCommissionGenerated(game.providerName, game.title, wagerUSD, earnedCommissionUSD);
    setCommissionNotice(`+${earnedCommissionUSD.toFixed(2)} USD Agent Commission Earned!`);
    return true;
  };

  // 1. CRAZY TIME 3D WHEEL SIMULATOR
  const handleSpinCrazyTime = () => {
    if (isSpinning || !validateAndDeduct()) return;
    setIsSpinning(true);
    setResultBanner(null);
    setCrazyBonusOutcome(null);
    sound.playSpinTick();

    // Top Slot generator
    const spots = ['1', '2', '5', '10', 'coin_flip', 'cash_hunt', 'pachinko', 'crazy_time'];
    const mults = [2, 5, 10, 25, 50];
    const topSlotSpot = spots[Math.floor(Math.random() * spots.length)];
    const topSlotMult = mults[Math.floor(Math.random() * mults.length)];
    setCrazyTopSlot({ spot: topSlotSpot, mult: topSlotMult });

    setTimeout(() => {
      sound.playSpinTick();
    }, 800);

    setTimeout(() => {
      // Pick winning wheel segment (weighted towards fun high hits)
      const wheelSegments = [
        '1', '1', '1', '2', '2', '5', '10',
        'coin_flip', 'cash_hunt', 'pachinko', 'crazy_time',
      ];
      const hit = wheelSegments[Math.floor(Math.random() * wheelSegments.length)];
      setCrazyResultSegment(hit);
      setIsSpinning(false);

      const topSlotApplies = topSlotSpot === hit;
      const boost = topSlotApplies ? topSlotMult : 1;

      let won = false;
      let totalMult = 0;

      if (hit === 'coin_flip') {
        const redCoin = Math.floor(2 + Math.random() * 8) * boost;
        const blueCoin = Math.floor(10 + Math.random() * 40) * boost;
        const winnerColor = Math.random() >= 0.5 ? 'BLUE' : 'RED';
        const finalCoinMult = winnerColor === 'BLUE' ? blueCoin : redCoin;
        setCrazyBonusOutcome(`COIN FLIP! ${winnerColor} landed: ${finalCoinMult}x Multiplier!`);
        if (crazyBetSpot === 'coin_flip') {
          won = true;
          totalMult = finalCoinMult;
        }
      } else if (hit === 'pachinko') {
        const pachinkoMult = [20, 50, 100, 200, 500][Math.floor(Math.random() * 5)] * boost;
        setCrazyBonusOutcome(`PACHINKO PUCK DROP! Landed in ${pachinkoMult}x slot!`);
        if (crazyBetSpot === 'pachinko') {
          won = true;
          totalMult = pachinkoMult;
        }
      } else if (hit === 'cash_hunt') {
        const huntMult = [15, 25, 50, 75, 125][Math.floor(Math.random() * 5)] * boost;
        setCrazyBonusOutcome(`CASH HUNT SCREEN! Target hit: ${huntMult}x Multiplier!`);
        if (crazyBetSpot === 'cash_hunt') {
          won = true;
          totalMult = huntMult;
        }
      } else if (hit === 'crazy_time') {
        const megaMult = [50, 100, 250, 500, 1000][Math.floor(Math.random() * 5)] * boost;
        setCrazyBonusOutcome(`CRAZY TIME 64-SEGMENT WHEEL! Green Flapper hit ${megaMult}x!`);
        if (crazyBetSpot === 'crazy_time') {
          won = true;
          totalMult = megaMult;
        }
      } else {
        const numVal = parseInt(hit, 10);
        if (crazyBetSpot === hit) {
          won = true;
          totalMult = numVal * boost;
        }
      }

      if (won) {
        const payout = Number((numericWager * totalMult).toFixed(currencyInfo.decimals));
        onAdjustBalance(payout);
        sound.playWin();
        setResultBanner(`CRAZY TIME WIN! Flapper hit [${hit.toUpperCase()}]. Paid ${totalMult}x (+${payout} ${activeCurrency})!`);
      } else {
        sound.playLoss();
        setResultBanner(`Wheel landed on [${hit.toUpperCase()}]. Better luck next spin!`);
      }
    }, 2000);
  };

  // 2. MONOPOLY BIG BALLER LIVE SIMULATOR
  const handlePlayMonopolyBigBaller = () => {
    if (isSpinning || !validateAndDeduct()) return;
    setIsSpinning(true);
    setResultBanner(null);
    sound.playSpinTick();

    // Generate 20 drawn numbered balls between 1 and 60
    const numbersSet = new Set<number>();
    while (numbersSet.size < 20) {
      numbersSet.add(Math.floor(1 + Math.random() * 60));
    }
    const balls = Array.from(numbersSet);
    setDrawnBallNumbers(balls);

    setTimeout(() => {
      sound.playLightning();
    }, 800);

    setTimeout(() => {
      setIsSpinning(false);
      const linesCompleted = Math.floor(1 + Math.random() * 4);
      setMonopolyLines(linesCompleted);

      let bonusTriggered = false;
      let bonusMult = 0;
      if (monopolyBonusBet !== 'none' && Math.random() >= 0.4) {
        bonusTriggered = true;
        const rollsCount = monopolyBonusBet === '5_rolls' ? 5 : 3;
        bonusMult = rollsCount === 5 ? 85 : 35;
      }

      const lineMult = linesCompleted * 5;
      const finalMult = lineMult + (bonusTriggered ? bonusMult : 0);
      const payout = Number((numericWager * finalMult).toFixed(currencyInfo.decimals));

      if (payout > 0) {
        onAdjustBalance(payout);
        sound.playWin();
        setResultBanner(
          `RIVERBOAT VICTORY! ${linesCompleted} Bingo Lines Completed${
            bonusTriggered ? ` + Mr. Monopoly Bonus Rolls (+${bonusMult}x)` : ''
          }! Paid ${finalMult}x (+${payout} ${activeCurrency})`
        );
      } else {
        sound.playLoss();
        setResultBanner('No winning lines formed. Mr. Monopoly is preparing next hopper round!');
      }
    }, 2100);
  };

  // 3. ICE FISHING CATCH LIVE SIMULATOR
  const handleCastIceFishing = () => {
    if (isSpinning || !validateAndDeduct()) return;
    setIsSpinning(true);
    setCaughtFish(null);
    setResultBanner(null);
    sound.playSpinTick();

    const fishTypes = [
      { name: 'Arctic Perch', weight: '2.4 kg', mult: 2.0, emoji: '🐟' },
      { name: 'Frost Bass', weight: '4.8 kg', mult: 5.0, emoji: '🐠' },
      { name: 'Golden Rainbow Trout', weight: '9.2 kg', mult: 15.0, emoji: '✨' },
      { name: 'Glacier Monster Pike', weight: '18.5 kg', mult: 50.0, emoji: '🦈' },
      { name: 'Ice King Salmon', weight: '34.0 kg', mult: 150.0, emoji: '👑' },
      { name: 'Abyssal Frost Kraken', weight: '120.0 kg', mult: 1000.0, emoji: '🐙' },
    ];

    setTimeout(() => {
      sound.playLightning();
    }, 900);

    setTimeout(() => {
      setIsSpinning(false);
      const baitBoost = iceBaitType === 'frost_dynamite' ? 1.5 : iceBaitType === 'golden_lure' ? 1.2 : 1.0;
      const pick = fishTypes[Math.floor(Math.random() * fishTypes.length)];
      const finalMult = Number((pick.mult * baitBoost).toFixed(1));
      setCaughtFish({ ...pick, mult: finalMult });

      const payout = Number((numericWager * finalMult).toFixed(currencyInfo.decimals));
      onAdjustBalance(payout);
      sound.playWin();
      setResultBanner(`MASSIVE CATCH! Reeled in ${pick.emoji} ${pick.name} (${pick.weight})! Paid ${finalMult}x (+${payout} ${activeCurrency})`);
    }, 2000);
  };

  // 4. EVOLUTION LIGHTNING ROULETTE SIMULATOR
  const handleSpinLightningRoulette = () => {
    if (isSpinning || !validateAndDeduct()) return;
    setIsSpinning(true);
    setResultBanner(null);
    sound.playSpinTick();

    const lucky1 = Math.floor(Math.random() * 37);
    const lucky2 = (lucky1 + 7) % 37;
    const mults = game.id === 'evo-xxxtreme-roulette' ? [100, 250, 500, 1000, 2000] : [50, 100, 200, 500];
    const generatedLucky = [
      { num: lucky1, mult: mults[Math.floor(Math.random() * mults.length)] },
      { num: lucky2, mult: mults[Math.floor(Math.random() * mults.length)] },
    ];
    setLightningNumbers(generatedLucky);

    setTimeout(() => {
      sound.playLightning();
    }, 700);

    setTimeout(() => {
      const finalBall = Math.floor(Math.random() * 37);
      setWinningNumber(finalBall);
      setIsSpinning(false);

      const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(finalBall);
      let won = false;
      let payoutMult = 0;

      if (selectedBetType === 'red' && isRed) {
        won = true;
        payoutMult = 2.0;
      } else if (selectedBetType === 'black' && !isRed && finalBall !== 0) {
        won = true;
        payoutMult = 2.0;
      } else if (selectedBetType === 'number_7' && finalBall === 7) {
        won = true;
        const lightningMatch = generatedLucky.find((l) => l.num === 7);
        payoutMult = lightningMatch ? lightningMatch.mult : 30.0;
      } else if (selectedBetType === 'number_21' && finalBall === 21) {
        won = true;
        const lightningMatch = generatedLucky.find((l) => l.num === 21);
        payoutMult = lightningMatch ? lightningMatch.mult : 30.0;
      }

      if (won) {
        const totalWin = Number((numericWager * payoutMult).toFixed(currencyInfo.decimals));
        onAdjustBalance(totalWin);
        sound.playWin();
        setResultBanner(`WINNER! Ball landed on #${finalBall} (${isRed ? 'RED' : 'BLACK'}). Paid ${payoutMult}x (+${totalWin} ${activeCurrency})`);
      } else {
        sound.playLoss();
        setResultBanner(`Ball landed on #${finalBall} (${isRed ? 'RED' : finalBall === 0 ? 'ZERO GREEN' : 'BLACK'}). No win this round.`);
      }
    }, 2200);
  };

  // 5. PRAGMATIC GATES OF OLYMPUS SIMULATOR
  const handleSpinGatesOfOlympus = () => {
    if (isSpinning || !validateAndDeduct()) return;
    setIsSpinning(true);
    setResultBanner(null);
    sound.playSpinTick();

    setTimeout(() => {
      const hitsCascade = Math.random() >= 0.35;
      if (hitsCascade) {
        const tumbles = Math.floor(2 + Math.random() * 4);
        const orbs = [2, 5, 10, 25, 50, 100, 500];
        const mult = Math.random() >= 0.5 ? orbs[Math.floor(Math.random() * orbs.length)] : 1;
        setZeusMultiplier(mult);
        setTumbleCount(tumbles);

        const baseWin = 1.5 + Math.random() * 3.5;
        const totalMult = Number((baseWin * mult).toFixed(2));
        const totalWin = Number((numericWager * totalMult).toFixed(currencyInfo.decimals));

        onAdjustBalance(totalWin);
        sound.playWin();
        setIsSpinning(false);
        setResultBanner(`ZEUS THUNDER STRIKE! ${tumbles} Cascades with ${mult}x Orb Multiplier! Paid ${totalMult}x (+${totalWin} ${activeCurrency})`);
      } else {
        setIsSpinning(false);
        setZeusMultiplier(1);
        setTumbleCount(0);
        sound.playLoss();
        setResultBanner('No cluster combinations formed. Spin again for the 1000x Zeus Multiplier!');
      }
    }, 1200);
  };

  // 6. EVOLUTION MEGA BALL 100X LIVE SIMULATOR
  const handlePlayMegaBall = () => {
    if (isSpinning || !validateAndDeduct()) return;
    setIsSpinning(true);
    setResultBanner(null);
    setFinalMegaMultiplier(null);
    sound.playSpinTick();

    const drawn: number[] = [];
    while (drawn.length < 20) {
      const n = Math.floor(1 + Math.random() * 51);
      if (!drawn.includes(n)) drawn.push(n);
    }
    setMegaBallNumbers(drawn);

    setTimeout(() => {
      sound.playLightning();
      const mults = [5, 10, 25, 50, 100];
      const mega = mults[Math.floor(Math.random() * mults.length)];
      setFinalMegaMultiplier(mega);

      const lines = Math.floor(1 + Math.random() * 3);
      const totalMult = lines * mega;
      const payout = Number((numericWager * totalMult).toFixed(currencyInfo.decimals));

      setIsSpinning(false);
      onAdjustBalance(payout);
      sound.playWin();
      setResultBanner(
        `MEGA BALL HIT! ${lines} Lines x ${mega}x Mega Ball! Paid ${totalMult}x (+${payout} ${activeCurrency})!`
      );
    }, 2000);
  };

  // 7. SPRIBE AVIATOR SIMULATOR
  const handleStartAviator = () => {
    if (aviatorState === 'FLYING' || !validateAndDeduct()) return;
    sound.playClick();
    setAviatorState('FLYING');
    setAviatorMultiplier(1.0);
    setResultBanner(null);

    const target = Math.random() < 0.2 ? 1.15 + Math.random() * 0.4 : 1.5 + Math.random() * 4.5;
    aviatorTargetRef.current = Number(target.toFixed(2));
    aviatorStartRef.current = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - aviatorStartRef.current) / 1000;
      const current = Number(Math.pow(Math.E, 0.18 * elapsed * 1.5).toFixed(2));

      if (current >= aviatorTargetRef.current) {
        setAviatorMultiplier(aviatorTargetRef.current);
        setAviatorState('CRASHED');
        sound.playLoss();
        setResultBanner(`Flew Away @ ${aviatorTargetRef.current.toFixed(2)}x!`);
        return;
      }

      setAviatorMultiplier(current);
      aviatorAnimRef.current = requestAnimationFrame(loop);
    };

    aviatorAnimRef.current = requestAnimationFrame(loop);
  };

  const handleCashoutAviator = () => {
    if (aviatorState !== 'FLYING') return;
    if (aviatorAnimRef.current) cancelAnimationFrame(aviatorAnimRef.current);
    const win = Number((numericWager * aviatorMultiplier).toFixed(currencyInfo.decimals));
    onAdjustBalance(win);
    setAviatorState('CASHED_OUT');
    sound.playWin();
    setResultBanner(`Cashed Out at ${aviatorMultiplier.toFixed(2)}x! Won +${win} ${activeCurrency}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Playing ${game.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md"
    >
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Game Window Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {game.providerName}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white font-display">
              {game.title}
            </h2>
            {game.isLive && (
              <span className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-rose-400">
                <Radio className="w-3 h-3 animate-pulse" /> 4K Stream
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowApiInspector(!showApiInspector)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showApiInspector
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/30'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>{showApiInspector ? 'Hide API Stream' : 'Live API Stream'}</span>
            </button>
            <span className="text-xs font-mono text-emerald-400 hidden sm:inline">
              Earn {commissionRate}% Agent RevShare
            </span>
            <button
              type="button"
              aria-label="Close Game Window"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Game Arena Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-slate-950/60">
          {/* Live Games API Stream Inspector Drawer */}
          {showApiInspector && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-cyan-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>GAMES API INTEGRATION STREAM ({game.providerName.toUpperCase()})</span>
                </span>
                <span className="text-[10px] text-emerald-400">STATUS: 200 OK · LATENCY: 18ms</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <div className="text-slate-500 text-[10px]">SESSION TOKEN & ENDPOINT</div>
                  <div className="text-cyan-300 truncate">POST /api/v2/{game.providerId}/launch</div>
                  <div className="text-slate-400 truncate">Token: jwt_sess_99a820f1b2</div>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <div className="text-slate-500 text-[10px]">SEAMLESS WALLET DEBIT / CREDIT</div>
                  <div className="text-emerald-300 truncate">Wager: {wagerInput} {activeCurrency} (Attributed)</div>
                  <div className="text-amber-400 truncate">Agent RevShare: {commissionRate}% Allocated</div>
                </div>
              </div>
            </div>
          )}

          {/* Commission Credit Toast */}
          {commissionNotice && (
            <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-xs font-semibold text-amber-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{commissionNotice} credited to your Agent Commission Hub</span>
              </span>
              <button
                type="button"
                onClick={() => setCommissionNotice(null)}
                className="text-amber-400 hover:text-white ml-2"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* 1. CRAZY TIME 3D WHEEL ARENA */}
          {game.id === 'evo-crazy-time' && (
            <div className="space-y-4">
              <div className="relative min-h-[260px] rounded-2xl overflow-hidden bg-gradient-to-br from-rose-950 via-slate-900 to-purple-950 border border-rose-500/30 flex flex-col justify-between p-4 shadow-xl">
                <div className="flex items-center justify-between z-10">
                  <span className="text-xs font-mono text-rose-400 font-bold flex items-center gap-1">
                    <Radio className="w-3 h-3 text-rose-400 animate-pulse" /> EVOLUTION CRAZY TIME 4K STUDIO
                  </span>
                  {crazyTopSlot && (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950 animate-pulse">
                      TOP SLOT: {crazyTopSlot.mult}x ON {crazyTopSlot.spot.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center space-y-2 z-10 py-3">
                  <div className={`text-4xl sm:text-5xl font-black font-display tracking-tight text-white ${isSpinning ? 'animate-spin' : ''}`}>
                    🎡
                  </div>

                  {crazyResultSegment && (
                    <div className="text-2xl font-black font-mono text-amber-400 tracking-wider">
                      FLAPPER STOP: [{crazyResultSegment.toUpperCase()}]
                    </div>
                  )}

                  {crazyBonusOutcome && (
                    <div className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black font-mono text-sm shadow-2xl animate-bounce">
                      {crazyBonusOutcome}
                    </div>
                  )}

                  {isSpinning && (
                    <div className="text-xs font-mono text-amber-300 animate-pulse">
                      Live Dealer spinning Crazy Time wheel... Top Slot multipliers active!
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 z-10">
                  54 Segments · 4 World-Famous Bonus Rounds · Up to 25,000x Payout
                </div>
              </div>

              {/* Crazy Time Betting Spots */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {[
                  { id: '1', label: '1 (1:1)' },
                  { id: '2', label: '2 (2:1)' },
                  { id: '5', label: '5 (5:1)' },
                  { id: '10', label: '10 (10:1)' },
                  { id: 'coin_flip', label: 'Coin Flip' },
                  { id: 'cash_hunt', label: 'Cash Hunt' },
                  { id: 'pachinko', label: 'Pachinko' },
                  { id: 'crazy_time', label: 'Crazy Time' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCrazyBetSpot(s.id as typeof crazyBetSpot)}
                    className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer text-center ${
                      crazyBetSpot === s.id
                        ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-500/50'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. MONOPOLY BIG BALLER LIVE ARENA */}
          {game.id === 'evo-monopoly-live' && (
            <div className="space-y-4">
              <div className="relative min-h-[260px] rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-amber-950 border border-emerald-500/30 flex flex-col justify-between p-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    EVOLUTION MONOPOLY BIG BALLER 1920s RIVERBOAT
                  </span>
                  <span className="text-xs font-mono text-amber-400">
                    3D Monopoly Board · Free Spaces
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center space-y-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">🚢</span>
                    <span className="text-lg font-bold font-display text-white">Riverboat Ball Hopper</span>
                  </div>

                  {drawnBallNumbers.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-lg">
                      {drawnBallNumbers.slice(0, 12).map((n) => (
                        <span
                          key={n}
                          className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-bold font-mono text-xs flex items-center justify-center shadow"
                        >
                          {n}
                        </span>
                      ))}
                      <span className="text-xs text-slate-400 font-mono">+8 more balls</span>
                    </div>
                  )}

                  {monopolyLines > 0 && (
                    <div className="px-3 py-1 rounded bg-emerald-500 text-slate-950 font-mono font-bold text-xs animate-pulse">
                      Lines Completed: {monopolyLines} · Multipliers Unlocked!
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Chance Card: Up to 100x Multipliers on Lines</span>
                  <span>Augmented Reality Mr. Monopoly Rolls</span>
                </div>
              </div>

              {/* Monopoly Bet Options */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMonopolyBonusBet('none')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    monopolyBonusBet === 'none'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  Standard Riverboat Card
                </button>
                <button
                  type="button"
                  onClick={() => setMonopolyBonusBet('3_rolls')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    monopolyBonusBet === '3_rolls'
                      ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-500/50'
                      : 'bg-slate-900 border-slate-800 text-amber-400'
                  }`}
                >
                  + 3 ROLLS BONUS BET
                </button>
                <button
                  type="button"
                  onClick={() => setMonopolyBonusBet('5_rolls')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    monopolyBonusBet === '5_rolls'
                      ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-500/50'
                      : 'bg-slate-900 border-slate-800 text-amber-400'
                  }`}
                >
                  + 5 ROLLS BONUS BET (Mayfair 3D)
                </button>
              </div>
            </div>
          )}

          {/* 3. ICE FISHING CATCH LIVE ARENA */}
          {game.id === 'jili-ice-fishing' && (
            <div className="space-y-4">
              <div className="relative min-h-[260px] rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 border border-cyan-500/40 flex flex-col justify-between p-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                    <Fish className="w-4 h-4 text-cyan-400" /> JILI LIVE ARCTIC ICE FISHING
                  </span>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    Max Win 1,000x · Frost Kraken
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center space-y-3 py-2">
                  <div className="flex items-center gap-6">
                    {[1, 2, 3].map((hole) => (
                      <button
                        key={hole}
                        type="button"
                        onClick={() => setSelectedIceHole(hole as 1 | 2 | 3)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                          selectedIceHole === hole
                            ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-500/50 text-white'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-2xl">🕳️</span>
                        <span className="text-xs font-bold">Ice Hole #{hole}</span>
                      </button>
                    ))}
                  </div>

                  {caughtFish && (
                    <div className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-mono font-bold text-sm shadow-xl flex items-center gap-2 animate-bounce">
                      <span className="text-xl">{caughtFish.emoji}</span>
                      <span>
                        CAUGHT: {caughtFish.name} ({caughtFish.weight}) — {caughtFish.mult}x Multiplier!
                      </span>
                    </div>
                  )}

                  {isSpinning && (
                    <div className="text-xs font-mono text-cyan-300 animate-pulse">
                      🎣 Drilling Ice Hole #{selectedIceHole}... Casting deep underwater line...
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Reel Tension Sensor Active</span>
                  <span>16% Agent Revenue Share Attributed</span>
                </div>
              </div>

              {/* Bait Selector */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'standard', label: 'Standard Worm (1x)' },
                  { id: 'golden_lure', label: 'Golden Lure (+20% Multiplier)' },
                  { id: 'frost_dynamite', label: 'Frost Dynamite (+50% Multiplier)' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setIceBaitType(b.id as typeof iceBaitType)}
                    className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      iceBaitType === b.id
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. LIGHTNING ROULETTE & XXXTREME LIGHTNING ROULETTE */}
          {(game.id === 'evo-lightning-roulette' || game.id === 'evo-xxxtreme-roulette') && (
            <div className="space-y-4">
              <div className="relative h-64 rounded-xl overflow-hidden bg-gradient-to-br from-amber-950 via-slate-900 to-black border border-amber-500/30 flex flex-col justify-between p-4">
                <div className="flex items-center justify-between z-10">
                  <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> {game.title.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    {game.id === 'evo-xxxtreme-roulette' ? 'Up to 2,000x Chain Lightning' : 'Straight Up 50x–500x'}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center space-y-2 z-10">
                  {lightningNumbers.length > 0 && (
                    <div className="flex items-center gap-4">
                      {lightningNumbers.map((ln) => (
                        <div
                          key={ln.num}
                          className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black font-mono text-lg flex flex-col items-center animate-bounce shadow-2xl"
                        >
                          <span className="text-xs uppercase font-sans">LUCKY #{ln.num}</span>
                          <span className="text-xl">{ln.mult}x</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {winningNumber !== null && (
                    <div className="text-3xl font-extrabold font-mono text-white tracking-wider">
                      WINNING BALL: #{winningNumber}
                    </div>
                  )}

                  {isSpinning && (
                    <div className="text-sm font-semibold text-amber-300 animate-pulse">
                      ⚡ Lightning Generating Lucky Multipliers...
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 z-10">
                  Evolution Gaming Live Studio Stream Simulator
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBetType('red')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedBetType === 'red'
                      ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-500/50'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  RED (1:1 Payout)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBetType('black')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedBetType === 'black'
                      ? 'bg-slate-950 text-white border-slate-600 ring-2 ring-slate-500/50'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  BLACK (1:1 Payout)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBetType('number_7')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedBetType === 'number_7'
                      ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-500/50'
                      : 'bg-slate-900 border-slate-800 text-amber-400 hover:text-white'
                  }`}
                >
                  #7 STRAIGHT UP (Up to 500x/2000x)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBetType('number_21')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedBetType === 'number_21'
                      ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-500/50'
                      : 'bg-slate-900 border-slate-800 text-amber-400 hover:text-white'
                  }`}
                >
                  #21 STRAIGHT UP (Up to 500x/2000x)
                </button>
              </div>
            </div>
          )}

          {/* 5. GATES OF OLYMPUS */}
          {game.id === 'prag-gates-olympus' && (
            <div className="space-y-4">
              <div className="relative h-64 rounded-xl overflow-hidden bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 border border-amber-500/30 flex flex-col justify-between p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    PRAGMATIC PLAY · GATES OF OLYMPUS 1000
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    Max Win 15,000x · Tumble Reels
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="grid grid-cols-6 gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    {['👑', '💍', '🏆', '💎', '🍇', '⚡'].map((symbol, i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-slate-900 border border-slate-800 ${
                          isSpinning ? 'animate-bounce' : ''
                        }`}
                      >
                        {symbol}
                      </div>
                    ))}
                  </div>

                  {zeusMultiplier > 1 && (
                    <div className="px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black font-mono text-sm shadow-xl animate-pulse">
                      ⚡ ZEUS MULTIPLIER ORB: {zeusMultiplier}x
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400">
                  {tumbleCount > 0 ? `${tumbleCount} Tumbles Triggered` : 'Tumble Mechanics Ready'}
                </div>
              </div>
            </div>
          )}

          {/* 6. SPRIBE AVIATOR */}
          {game.id === 'spribe-aviator' && (
            <div className="space-y-4">
              <div className="relative h-64 rounded-xl overflow-hidden bg-gradient-to-br from-rose-950 via-slate-950 to-black border border-rose-500/30 flex flex-col justify-between p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-rose-400 font-bold">
                    SPRIBE AVIATOR MULTIPLAYER CURVE
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    97% RTP · Real-Time Flight
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div
                    className={`text-5xl font-black font-mono tabular-nums ${
                      aviatorState === 'CRASHED'
                        ? 'text-rose-500'
                        : aviatorState === 'CASHED_OUT'
                        ? 'text-amber-400'
                        : 'text-white'
                    }`}
                  >
                    {aviatorMultiplier.toFixed(2)}x
                  </div>
                  <div className="text-xs font-semibold text-slate-400 mt-2">
                    {aviatorState === 'IDLE' && 'Plane on Runway — Place Bet & Launch'}
                    {aviatorState === 'FLYING' && 'Plane Ascending — Cash Out Before Fly Away!'}
                    {aviatorState === 'CRASHED' && 'Flew Away!'}
                    {aviatorState === 'CASHED_OUT' && 'Successful Cashout!'}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  Provably Fair HMAC-SHA256 Flight Generator
                </div>
              </div>
            </div>
          )}

          {/* 7. EVOLUTION MEGA BALL 100X LIVE ARENA */}
          {game.id === 'evo-mega-ball' && (
            <div className="space-y-4">
              <div className="relative min-h-[260px] rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-950 via-slate-900 to-amber-950 border border-yellow-500/30 flex flex-col justify-between p-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-yellow-400 font-bold">
                    EVOLUTION MEGA BALL 100X LIVE LOTTERY HOPPER
                  </span>
                  <span className="text-xs font-mono text-amber-400">
                    20 Balls Drawn · 1,000,000x Max
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center space-y-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">🎱</span>
                    <span className="text-lg font-bold font-display text-white">Rapid Ball Draw Hopper</span>
                  </div>

                  {megaBallNumbers.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-lg">
                      {megaBallNumbers.slice(0, 16).map((n) => (
                        <span
                          key={n}
                          className="w-7 h-7 rounded-full bg-yellow-400 text-slate-950 font-bold font-mono text-xs flex items-center justify-center shadow"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  )}

                  {finalMegaMultiplier && (
                    <div className="px-4 py-1.5 rounded-full bg-yellow-500 text-slate-950 font-black font-mono text-sm shadow-xl animate-bounce">
                      🌟 FINAL MEGA BALL MULTIPLIER: {finalMegaMultiplier}x!
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400">
                  Fast-action 20 ball draw with multiplying bingo lines
                </div>
              </div>
            </div>
          )}

          {/* Generic placeholder for any other title */}
          {![
            'evo-crazy-time',
            'evo-monopoly-live',
            'jili-ice-fishing',
            'evo-lightning-roulette',
            'evo-xxxtreme-roulette',
            'prag-gates-olympus',
            'spribe-aviator',
            'evo-mega-ball',
          ].includes(game.id) && (
            <div className="h-64 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="text-xs font-mono text-amber-400 font-bold uppercase">
                {game.providerName} Aggregator Stream
              </div>
              <div className="text-lg font-bold text-white font-display">
                {game.title}
              </div>
              <p className="text-xs text-slate-400 max-w-md">
                Official API stream connected. Wagers on this studio automatically allocate {commissionRate}% Revenue Share to your Agent Commission Hub.
              </p>
            </div>
          )}

          {/* Result Banner */}
          {resultBanner && (
            <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-xs font-semibold text-emerald-300 text-center">
              {resultBanner}
            </div>
          )}

          {/* Controls Bar */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="launcher-wager" className="text-xs text-slate-400 font-medium shrink-0">
                Wager ({activeCurrency}):
              </label>
              <input
                id="launcher-wager"
                type="number"
                min="1"
                step="any"
                value={wagerInput}
                onChange={(e) => setWagerInput(e.target.value)}
                className="w-28 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono font-bold text-white"
              />
              <div className="flex items-center gap-1">
                {[10, 25, 100].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setWagerInput(String(v));
                    }}
                    className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono rounded border border-slate-800 cursor-pointer"
                  >
                    +{v}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full sm:w-auto">
              {game.id === 'evo-crazy-time' && (
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={handleSpinCrazyTime}
                  className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isSpinning ? 'Wheel Spinning...' : `Spin Crazy Time Wheel (${wagerInput} ${activeCurrency})`}
                </button>
              )}

              {game.id === 'evo-monopoly-live' && (
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={handlePlayMonopolyBigBaller}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isSpinning ? 'Drawing Hopper Balls...' : `Draw Riverboat Balls (${wagerInput} ${activeCurrency})`}
                </button>
              )}

              {game.id === 'jili-ice-fishing' && (
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={handleCastIceFishing}
                  className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isSpinning ? 'Line Reeling...' : `Cast Line Through Ice Hole #${selectedIceHole} (${wagerInput} ${activeCurrency})`}
                </button>
              )}

              {(game.id === 'evo-lightning-roulette' || game.id === 'evo-xxxtreme-roulette') && (
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={handleSpinLightningRoulette}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isSpinning ? 'Wheel Spinning...' : `Spin Wheel (${wagerInput} ${activeCurrency})`}
                </button>
              )}

              {game.id === 'prag-gates-olympus' && (
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={handleSpinGatesOfOlympus}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isSpinning ? 'Cascades Falling...' : `Spin Gates of Olympus (${wagerInput} ${activeCurrency})`}
                </button>
              )}

              {game.id === 'spribe-aviator' && (
                aviatorState === 'FLYING' ? (
                  <button
                    type="button"
                    onClick={handleCashoutAviator}
                    className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Cash Out Now ({(numericWager * aviatorMultiplier).toFixed(2)} {activeCurrency})
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartAviator}
                    className="w-full sm:w-auto px-6 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Launch Aviator Flight ({wagerInput} {activeCurrency})
                  </button>
                )
              )}

              {game.id === 'evo-mega-ball' && (
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={handlePlayMegaBall}
                  className="w-full sm:w-auto px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isSpinning ? 'Hopper Drawing Balls...' : `Draw 20 Mega Balls (${wagerInput} ${activeCurrency})`}
                </button>
              )}

              {![
                'evo-crazy-time',
                'evo-monopoly-live',
                'jili-ice-fishing',
                'evo-lightning-roulette',
                'evo-xxxtreme-roulette',
                'prag-gates-olympus',
                'spribe-aviator',
                'evo-mega-ball',
              ].includes(game.id) && (
                <button
                  type="button"
                  onClick={() => {
                    if (!validateAndDeduct()) return;
                    sound.playWin();
                    const win = numericWager * 2.5;
                    onAdjustBalance(win);
                    setResultBanner(`Round Complete on ${game.title}! Won +${win.toFixed(2)} ${activeCurrency}`);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  Spin & Test Studio ({wagerInput} {activeCurrency})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
