import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  CreditCard,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  FileText,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { CurrencyCode, TransactionRecord } from '../types';
import { CURRENCIES } from '../data/mockData';
import { sound } from '../utils/sound';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: 'deposit' | 'withdraw' | 'swap' | 'ledger';
  activeCurrency: CurrencyCode;
  onSelectCurrency: (code: CurrencyCode) => void;
  balances: Record<CurrencyCode, number>;
  onDeposit: (
    currency: CurrencyCode,
    amount: number,
    gateway: string,
    networkOrCard: string
  ) => void;
  onWithdraw: (
    currency: CurrencyCode,
    amount: number,
    gateway: string,
    destination: string
  ) => boolean;
  onSwap: (fromCurrency: CurrencyCode, toCurrency: CurrencyCode, fromAmount: number) => boolean;
  transactions: TransactionRecord[];
}

const WALLET_ADDRESSES: Record<CurrencyCode, string> = {
  USDT: 'TV6MuMXfmLbBqPZvBHdwFsDnQeVfnmiuSi',
  BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  ETH: '0x71C...8976F4e21b9021C984A00912B44e2',
  SOL: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  USD: 'BETSTREAM-3DS-MERCHANT-USD-9941',
  EUR: 'DE89370400440532013000',
};

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  initialTab,
  activeCurrency,
  onSelectCurrency,
  balances,
  onDeposit,
  onWithdraw,
  onSwap,
  transactions,
}) => {
  const [tab, setTab] = useState<'deposit' | 'withdraw' | 'swap' | 'ledger'>(initialTab);
  const [depositChannel, setDepositChannel] = useState<'crypto' | 'fiat'>(
    CURRENCIES[activeCurrency].type === 'fiat' ? 'fiat' : 'crypto'
  );
  const [selectedNetworkIdx, setSelectedNetworkIdx] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<string>('500');
  const [fiatGateway, setFiatGateway] = useState<string>('Visa / Mastercard 3DS');
  const [cardNumber, setCardNumber] = useState<string>('4532 •••• •••• 8891');
  const [copied, setCopied] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [withdrawAmount, setWithdrawAmount] = useState<string>('100');
  const [withdrawDestination, setWithdrawDestination] = useState<string>(
    '0x98B2...741F90a1C88e'
  );

  const [swapFrom, setSwapFrom] = useState<CurrencyCode>('USDT');
  const [swapTo, setSwapTo] = useState<CurrencyCode>('SOL');
  const [swapAmount, setSwapAmount] = useState<string>('250');

  React.useEffect(() => {
    setTab(initialTab);
    setStatusNotice(null);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const currencyInfo = CURRENCIES[activeCurrency];
  const currentBalance = balances[activeCurrency] ?? 0;

  const handleCopyAddress = () => {
    sound.playClick();
    navigator.clipboard?.writeText(WALLET_ADDRESSES[activeCurrency]).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleConfirmDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) {
      setStatusNotice({ type: 'error', text: 'Enter a valid deposit amount.' });
      return;
    }
    sound.playWin();
    const networkName =
      depositChannel === 'crypto'
        ? currencyInfo.networks[selectedNetworkIdx] || currencyInfo.networks[0]
        : `${fiatGateway} (${cardNumber.slice(-4)})`;
    const gatewayLabel =
      depositChannel === 'crypto' ? `${activeCurrency} On-Chain Gateway` : fiatGateway;

    onDeposit(activeCurrency, amt, gatewayLabel, networkName);
    setStatusNotice({
      type: 'success',
      text: `Instant deposit of +${amt} ${activeCurrency} confirmed & credited!`,
    });
  };

  const handleConfirmWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) {
      setStatusNotice({ type: 'error', text: 'Enter a valid withdrawal amount.' });
      return;
    }
    if (amt > currentBalance) {
      sound.playLoss();
      setStatusNotice({
        type: 'error',
        text: `Insufficient ${activeCurrency} balance for withdrawal.`,
      });
      return;
    }
    const ok = onWithdraw(
      activeCurrency,
      amt,
      `${activeCurrency} Instant Payout`,
      withdrawDestination
    );
    if (ok) {
      sound.playWin();
      setStatusNotice({
        type: 'success',
        text: `Withdrawal of ${amt} ${activeCurrency} dispatched to ${withdrawDestination.slice(0, 12)}...`,
      });
    }
  };

  const swapFromInfo = CURRENCIES[swapFrom];
  const swapToInfo = CURRENCIES[swapTo];
  const numericSwapFrom = Math.max(0, parseFloat(swapAmount) || 0);
  const swapRate = swapFromInfo.rateToUSD / swapToInfo.rateToUSD;
  const estimatedSwapOutput = numericSwapFrom * swapRate;

  const handleConfirmSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (swapFrom === swapTo) {
      setStatusNotice({ type: 'error', text: 'Select two different currencies to swap.' });
      return;
    }
    if (numericSwapFrom <= 0 || numericSwapFrom > (balances[swapFrom] || 0)) {
      sound.playLoss();
      setStatusNotice({
        type: 'error',
        text: `Insufficient ${swapFrom} balance to execute swap.`,
      });
      return;
    }
    const ok = onSwap(swapFrom, swapTo, numericSwapFrom);
    if (ok) {
      sound.playWin();
      setStatusNotice({
        type: 'success',
        text: `Swapped ${numericSwapFrom} ${swapFrom} → +${estimatedSwapOutput.toFixed(
          swapToInfo.decimals > 2 ? 4 : 2
        )} ${swapTo}!`,
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Multi-Gateway Cashier"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white font-display">
              BetStream Integrated Payment Gateways
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close Cashier Modal"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-slate-950/70 border-b border-slate-800">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setTab('deposit');
              setStatusNotice(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              tab === 'deposit'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Deposit</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setTab('withdraw');
              setStatusNotice(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              tab === 'withdraw'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setTab('swap');
              setStatusNotice(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              tab === 'swap'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Instant Swap</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setTab('ledger');
              setStatusNotice(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              tab === 'ledger'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Ledger ({transactions.length})</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {statusNotice && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
                statusNotice.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              }`}
            >
              <span>{statusNotice.text}</span>
              <button
                type="button"
                onClick={() => setStatusNotice(null)}
                className="text-slate-400 hover:text-white ml-3"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Currency Selector */}
          {(tab === 'deposit' || tab === 'withdraw') && (
            <div>
              <div className="text-xs font-medium text-slate-400 mb-2">
                Active Asset (Balance:{' '}
                <strong className="font-mono text-emerald-400">
                  {currentBalance.toFixed(currencyInfo.decimals > 2 ? 4 : 2)} {activeCurrency}
                </strong>
                )
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
                  const info = CURRENCIES[code];
                  const active = activeCurrency === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        onSelectCurrency(code);
                        setDepositChannel(info.type);
                        setSelectedNetworkIdx(0);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                        active
                          ? 'bg-emerald-500/15 border-emerald-500 text-white'
                          : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-400">{info.symbol}</span>
                        <span className="text-[10px] text-slate-400 uppercase">{info.type}</span>
                      </div>
                      <div className="text-xs font-bold mt-1">{info.code}</div>
                      <div className="text-[11px] font-mono tabular-nums text-slate-400 truncate">
                        {(balances[code] || 0).toFixed(info.decimals > 2 ? 3 : 2)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 1: DEPOSIT */}
          {tab === 'deposit' && (
            <form onSubmit={handleConfirmDeposit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setDepositChannel('crypto');
                    if (CURRENCIES[activeCurrency].type === 'fiat') onSelectCurrency('USDT');
                  }}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                    depositChannel === 'crypto'
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span>Crypto & Lightning</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setDepositChannel('fiat');
                    if (CURRENCIES[activeCurrency].type === 'crypto') onSelectCurrency('USD');
                  }}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                    depositChannel === 'fiat'
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Visa / Mastercard / PIX</span>
                </button>
              </div>

              {depositChannel === 'crypto' ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-slate-950 border border-slate-800 rounded-xl p-4">
                  {/* QR SVG */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <svg viewBox="0 0 100 100" className="w-28 h-28 bg-white p-2 rounded-lg" aria-label="Deposit QR Code">
                      <rect x="8" y="8" width="24" height="24" fill="#0b0f17" />
                      <rect x="12" y="12" width="16" height="16" fill="#ffffff" />
                      <rect x="16" y="16" width="8" height="8" fill="#10b981" />
                      <rect x="68" y="8" width="24" height="24" fill="#0b0f17" />
                      <rect x="72" y="12" width="16" height="16" fill="#ffffff" />
                      <rect x="76" y="16" width="8" height="8" fill="#0b0f17" />
                      <rect x="8" y="68" width="24" height="24" fill="#0b0f17" />
                      <rect x="12" y="72" width="16" height="16" fill="#ffffff" />
                      <rect x="16" y="76" width="8" height="8" fill="#0b0f17" />
                      <rect x="40" y="14" width="8" height="8" fill="#0b0f17" />
                      <rect x="52" y="22" width="8" height="16" fill="#0b0f17" />
                      <rect x="38" y="42" width="22" height="12" fill="#10b981" />
                      <rect x="14" y="44" width="16" height="8" fill="#0b0f17" />
                      <rect x="68" y="44" width="18" height="10" fill="#0b0f17" />
                      <rect x="42" y="66" width="14" height="20" fill="#0b0f17" />
                      <rect x="66" y="68" width="22" height="22" fill="#0b0f17" />
                    </svg>
                    <span className="text-[11px] font-mono text-slate-400 mt-2">{activeCurrency} Gateway</span>
                  </div>

                  <div className="md:col-span-8 space-y-3">
                    <div>
                      <label htmlFor="crypto-network-select" className="block text-xs text-slate-400 mb-1">
                        Network
                      </label>
                      <select
                        id="crypto-network-select"
                        value={selectedNetworkIdx}
                        onChange={(e) => setSelectedNetworkIdx(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                      >
                        {currencyInfo.networks.map((net, i) => (
                          <option key={net} value={i} className="bg-slate-900">
                            {net}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="text-xs text-slate-400 mb-1">Deposit Address</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={WALLET_ADDRESSES[activeCurrency]}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300"
                        />
                        <button
                          type="button"
                          onClick={handleCopyAddress}
                          className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg cursor-pointer"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="deposit-amt-input" className="block text-xs text-slate-400 mb-1">
                        Amount to Credit ({activeCurrency})
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="deposit-amt-input"
                          type="number"
                          step="any"
                          min="0"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono font-bold text-white"
                        />
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Simulate Instant Deposit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Visa / Mastercard 3DS', 'Apple Pay / Google Pay', 'PIX Instant Bank', 'Skrill / Neteller'].map((gw) => (
                      <button
                        key={gw}
                        type="button"
                        onClick={() => setFiatGateway(gw)}
                        className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-colors cursor-pointer ${
                          fiatGateway === gw
                            ? 'bg-emerald-500/15 border-emerald-500 text-white font-semibold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {gw}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="card-ref" className="block text-xs text-slate-400 mb-1">
                        Payment Account Reference
                      </label>
                      <input
                        id="card-ref"
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="fiat-amt" className="block text-xs text-slate-400 mb-1">
                        Amount ({activeCurrency})
                      </label>
                      <input
                        id="fiat-amt"
                        type="number"
                        step="any"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono font-bold text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Authorize Instant {fiatGateway} Deposit (+{depositAmount} {activeCurrency})
                  </button>
                </div>
              )}
            </form>
          )}

          {/* TAB 2: WITHDRAW */}
          {tab === 'withdraw' && (
            <form onSubmit={handleConfirmWithdraw} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <div>
                <label htmlFor="withdraw-dest" className="block text-xs text-slate-400 font-medium mb-1">
                  Destination Wallet Address or IBAN
                </label>
                <input
                  id="withdraw-dest"
                  type="text"
                  value={withdrawDestination}
                  onChange={(e) => setWithdrawDestination(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="withdraw-amt" className="text-slate-400 font-medium">
                    Withdrawal Amount ({activeCurrency})
                  </label>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(String(currentBalance))}
                    className="text-emerald-400 font-mono text-[11px] underline cursor-pointer"
                  >
                    Max ({currentBalance.toFixed(currencyInfo.decimals > 2 ? 4 : 2)})
                  </button>
                </div>
                <input
                  id="withdraw-amt"
                  type="number"
                  step="any"
                  min="0"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono font-bold text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Submit Instant Withdrawal ({withdrawAmount} {activeCurrency})
              </button>
            </form>
          )}

          {/* TAB 3: SWAP */}
          {tab === 'swap' && (
            <form onSubmit={handleConfirmSwap} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="swap-from" className="block text-xs text-slate-400 mb-1">
                    From ({swapFrom})
                  </label>
                  <select
                    id="swap-from"
                    value={swapFrom}
                    onChange={(e) => setSwapFrom(e.target.value as CurrencyCode)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                  >
                    {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
                      <option key={c} value={c} className="bg-slate-900">{c} — {CURRENCIES[c].name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="swap-to" className="block text-xs text-slate-400 mb-1">
                    To ({swapTo})
                  </label>
                  <select
                    id="swap-to"
                    value={swapTo}
                    onChange={(e) => setSwapTo(e.target.value as CurrencyCode)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                  >
                    {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
                      <option key={c} value={c} className="bg-slate-900">{c} — {CURRENCIES[c].name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="swap-amt" className="block text-xs text-slate-400 mb-1">
                  Amount to Convert ({swapFrom})
                </label>
                <input
                  id="swap-amt"
                  type="number"
                  step="any"
                  min="0"
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono font-bold text-white"
                />
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs flex justify-between font-semibold">
                <span className="text-slate-400">Estimated Output:</span>
                <span className="font-mono text-emerald-400">
                  +{estimatedSwapOutput.toFixed(swapToInfo.decimals > 2 ? 4 : 2)} {swapTo}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Execute Zero-Slippage Swap
              </button>
            </form>
          )}

          {/* TAB 4: LEDGER */}
          {tab === 'ledger' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] text-slate-400 bg-slate-900">
                      <th className="py-2.5 px-4 font-semibold">Gateway / Type</th>
                      <th className="py-2.5 px-4 font-semibold">Network / Account</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Reference</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/60 font-mono">
                        <td className="py-2.5 px-4 font-sans">
                          <div className="font-semibold text-slate-200 capitalize">{tx.type}</div>
                          <div className="text-[11px] text-slate-400">{tx.gateway}</div>
                        </td>
                        <td className="py-2.5 px-4 text-slate-300 text-[11px]">{tx.networkOrCard}</td>
                        <td className="py-2.5 px-4 text-right tabular-nums font-bold text-emerald-400">
                          {tx.type === 'withdrawal' ? '-' : '+'}{tx.amount.toFixed(2)} {tx.currency}
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-400 text-[11px]">{tx.referenceId}</td>
                        <td className="py-2.5 px-4 text-right text-emerald-400 uppercase text-[11px] font-bold">{tx.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
