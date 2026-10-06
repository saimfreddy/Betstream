import React, { useState } from 'react';
import {
  Ticket,
  Trash2,
  X,
  CheckCircle2,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { CurrencyCode, PlacedBet, SelectedOdd } from '../types';
import { CURRENCIES } from '../data/mockData';
import { sound } from '../utils/sound';

interface BetSlipPanelProps {
  selectedOdds: SelectedOdd[];
  onRemoveOdd: (selectionId: string) => void;
  onClearSlip: () => void;
  activeCurrency: CurrencyCode;
  currentBalance: number;
  onPlaceBet: (mode: 'single' | 'parlay', stake: number) => boolean;
  placedBets: PlacedBet[];
  onCashOutBet: (betId: string) => void;
  onSimulateSettleBet: (betId: string, outcome: 'won' | 'lost') => void;
  onOpenCashier: () => void;
  desktopDrawerMode?: boolean;
}

export const BetSlipPanel: React.FC<BetSlipPanelProps> = ({
  selectedOdds,
  onRemoveOdd,
  onClearSlip,
  activeCurrency,
  currentBalance,
  onPlaceBet,
  placedBets,
  onCashOutBet,
  onSimulateSettleBet,
  onOpenCashier,
  desktopDrawerMode = false,
}) => {
  const [activeSlipTab, setActiveSlipTab] = useState<'slip' | 'mybets'>('slip');
  const [betMode, setBetMode] = useState<'single' | 'parlay'>('parlay');
  const [stakeInput, setStakeInput] = useState<string>('25');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currencyInfo = CURRENCIES[activeCurrency];
  const numericStake = Math.max(0, parseFloat(stakeInput) || 0);

  const totalOdds =
    selectedOdds.length === 0
      ? 0
      : betMode === 'parlay'
      ? selectedOdds.reduce((acc, item) => acc * item.odds, 1)
      : selectedOdds.reduce((acc, item) => acc + item.odds, 0);

  const totalStakeRequired =
    betMode === 'parlay' ? numericStake : numericStake * selectedOdds.length;

  const potentialPayout =
    selectedOdds.length === 0
      ? 0
      : betMode === 'parlay'
      ? numericStake * totalOdds
      : selectedOdds.reduce((sum, item) => sum + numericStake * item.odds, 0);

  const openBetsCount = placedBets.filter((b) => b.status === 'open').length;

  const handleConfirmBet = () => {
    if (selectedOdds.length === 0 || totalStakeRequired <= 0) return;
    if (totalStakeRequired > currentBalance) {
      sound.playLoss();
      setFeedbackMsg(`Insufficient ${activeCurrency} balance. Deposit or lower stake.`);
      return;
    }
    const success = onPlaceBet(betMode, numericStake);
    if (success) {
      sound.playWin();
      setFeedbackMsg('Bet placed & locked into exchange ledger!');
      setTimeout(() => {
        setFeedbackMsg(null);
        setActiveSlipTab('mybets');
      }, 900);
    }
  };

  const presetStakes =
    currencyInfo.rateToUSD > 1000
      ? [0.001, 0.005, 0.01, 0.025]
      : currencyInfo.rateToUSD > 50
      ? [0.1, 0.5, 1, 5]
      : [10, 25, 100, 250];

  const renderContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Slip Tabs */}
        <div className="grid grid-cols-2 gap-1 p-2 bg-slate-950 border-b border-slate-800">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveSlipTab('slip');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSlipTab === 'slip'
                ? 'bg-slate-900 text-white border border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bet Slip ({selectedOdds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveSlipTab('mybets');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSlipTab === 'mybets'
                ? 'bg-slate-900 text-white border border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Open Bets ({openBetsCount})</span>
          </button>
        </div>

        {activeSlipTab === 'slip' ? (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg flex-1">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setBetMode('single');
                  }}
                  className={`flex-1 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                    betMode === 'single'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Singles
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setBetMode('parlay');
                  }}
                  className={`flex-1 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                    betMode === 'parlay'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Parlay ({selectedOdds.length})
                </button>
              </div>

              {selectedOdds.length > 0 && (
                <button
                  type="button"
                  aria-label="Clear bet slip"
                  onClick={() => {
                    sound.playClick();
                    onClearSlip();
                  }}
                  className="p-2 text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {selectedOdds.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-2 border border-dashed border-slate-800 rounded-xl">
                <Ticket className="w-6 h-6 text-slate-600 mx-auto" />
                <div className="text-xs font-semibold text-slate-300">Your Bet Slip is Empty</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Click any live odds button on Football, Basketball, or Esports to construct your bet slip.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {selectedOdds.map((item) => (
                  <div
                    key={item.selectionId}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-semibold text-white truncate">
                        {item.optionLabel}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          onRemoveOdd(item.selectionId);
                        }}
                        className="text-slate-500 hover:text-slate-200 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate">{item.matchTitle}</span>
                      <span className="font-mono tabular-nums font-bold text-emerald-400">
                        @{item.odds.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedOdds.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <label htmlFor="betslip-stake-input" className="text-slate-400 font-medium">
                      Stake ({activeCurrency})
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      Avail: {currentBalance.toFixed(currencyInfo.decimals > 2 ? 4 : 2)}
                    </span>
                  </div>
                  <input
                    id="betslip-stake-input"
                    type="number"
                    min="0"
                    step="any"
                    value={stakeInput}
                    onChange={(e) => setStakeInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono tabular-nums font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {presetStakes.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setStakeInput(String(val));
                      }}
                      className="py-1 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded cursor-pointer"
                    >
                      +{val}
                    </button>
                  ))}
                </div>

                <div className="space-y-1 pt-1 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Combined Odds</span>
                    <span className="font-mono font-bold text-amber-400">
                      {totalOdds.toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-100 font-bold pt-1 border-t border-slate-800">
                    <span>Potential Return</span>
                    <span className="font-mono text-emerald-400 text-sm">
                      {potentialPayout.toFixed(currencyInfo.decimals > 2 ? 4 : 2)} {activeCurrency}
                    </span>
                  </div>
                </div>

                {feedbackMsg && (
                  <div className="p-2 rounded bg-slate-900 border border-emerald-500/40 text-xs text-emerald-300">
                    {feedbackMsg}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleConfirmBet}
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Place {betMode === 'parlay' ? 'Parlay' : 'Single'} Bet ({totalStakeRequired.toFixed(2)}{' '}
                  {activeCurrency})
                </button>
              </div>
            )}
          </div>
        ) : (
          /* My Bets Tab */
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {placedBets.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-2 border border-dashed border-slate-800 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-slate-600 mx-auto" />
                <div className="text-xs font-semibold text-slate-300">No Open Bets</div>
                <p className="text-[11px] text-slate-500">
                  Place a bet from the Sportsbook to track in-play cashout offers.
                </p>
              </div>
            ) : (
              placedBets.map((bet) => (
                <div
                  key={bet.id}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-slate-200 uppercase">
                      {bet.mode} · {bet.selections.length} Leg
                    </span>
                    <span className="font-mono font-bold">
                      {bet.status === 'open' && <span className="text-amber-400">IN-PLAY</span>}
                      {bet.status === 'won' && <span className="text-emerald-400">WON</span>}
                      {bet.status === 'cashed_out' && <span className="text-emerald-400">CASHED OUT</span>}
                      {bet.status === 'lost' && <span className="text-rose-400">LOST</span>}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {bet.selections.map((sel) => (
                      <div key={sel.selectionId} className="flex justify-between text-xs">
                        <span className="text-slate-200 truncate mr-2">{sel.optionLabel}</span>
                        <span className="font-mono font-bold text-emerald-400">
                          @{sel.odds.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1.5 border-t border-slate-800 text-xs flex justify-between font-semibold">
                    <span className="text-slate-400">Return:</span>
                    <span className="font-mono text-emerald-400">
                      {(bet.settledPayout ?? bet.potentialPayout).toFixed(2)} {bet.currency}
                    </span>
                  </div>

                  {bet.status === 'open' && (
                    <div className="pt-1.5 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playWin();
                          onCashOutBet(bet.id);
                        }}
                        className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                      >
                        Cash Out ({bet.cashoutOffer.toFixed(2)} {bet.currency})
                      </button>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            sound.playWin();
                            onSimulateSettleBet(bet.id, 'won');
                          }}
                          className="py-1 bg-slate-800 hover:bg-emerald-500/20 text-slate-300 rounded cursor-pointer"
                        >
                          Simulate Win
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playLoss();
                            onSimulateSettleBet(bet.id, 'lost');
                          }}
                          className="py-1 bg-slate-800 hover:bg-rose-500/20 text-slate-300 rounded cursor-pointer"
                        >
                          Simulate Loss
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <button
          type="button"
          onClick={onOpenCashier}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Wallet className="w-3.5 h-3.5 text-emerald-400" />
          <span>Open Payment Cashier</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {!desktopDrawerMode && (
        <aside aria-label="Bet Slip" className="hidden lg:block w-80 xl:w-88 shrink-0 bg-slate-950 border-l border-slate-800/80">
          {renderContent()}
        </aside>
      )}

      {(selectedOdds.length > 0 || openBetsCount > 0) && (
        <div className={`${desktopDrawerMode ? 'fixed' : 'lg:hidden fixed'} bottom-5 right-5 z-40`}>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-2xl transition-all cursor-pointer ring-2 ring-emerald-400/50"
          >
            <Ticket className="w-4 h-4 fill-slate-950" />
            <span>Bet Slip ({selectedOdds.length}) · Open ({openBetsCount})</span>
          </button>
        </div>
      )}

      {mobileOpen && (
        <div
          role="dialog"
          aria-label="Bet Slip Drawer"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end"
        >
          <div className="w-full max-w-sm bg-slate-950 h-full border-l border-slate-800 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60">
              <span className="text-sm font-bold text-white font-display">Betting Slip & My Bets</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{renderContent()}</div>
          </div>
        </div>
      )}
    </>
  );
};
