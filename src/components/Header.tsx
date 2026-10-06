import React, { useState, useRef, useEffect } from 'react';
import { Wallet, ChevronDown, DollarSign, Smartphone, ShieldCheck, Download } from 'lucide-react';
import { ActiveMainTab, CurrencyCode } from '../types';
import { CURRENCIES } from '../data/mockData';
import { sound } from '../utils/sound';

interface HeaderProps {
  activeTab: ActiveMainTab;
  onSelectTab: (tab: ActiveMainTab) => void;
  activeCurrency: CurrencyCode;
  onSelectCurrency: (currency: CurrencyCode) => void;
  balances: Record<CurrencyCode, number>;
  availableCommissionUSD: number;
  onOpenCashier: (initialTab?: 'deposit' | 'withdraw' | 'swap' | 'ledger') => void;
  onOpenApkModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  activeCurrency,
  onSelectCurrency,
  balances,
  availableCommissionUSD,
  onOpenCashier,
  onOpenApkModal,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentCurrencyInfo = CURRENCIES[activeCurrency];
  const currentBalance = balances[activeCurrency] ?? 0;

  const formatBalance = (val: number, code: CurrencyCode) => {
    const decimals = CURRENCIES[code].decimals;
    return val.toLocaleString('en-US', {
      minimumFractionDigits: decimals > 2 ? 4 : 2,
      maximumFractionDigits: decimals,
    });
  };

  const navItems: Array<{ id: ActiveMainTab; label: string }> = [
    { id: 'casino', label: 'Online Casino (880+)' },
    { id: 'live_dealers', label: 'Live Shows & Dealers' },
    { id: 'games_api', label: 'Games API & Webhooks' },
    { id: 'sportsbook', label: 'Sportsbook' },
    { id: 'live_sports', label: 'Live In-Play' },
    { id: 'affiliate_commission', label: 'Agent Commission' },
  ];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 lg:px-6 h-14 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#sportsbook"
        onClick={(e) => {
          e.preventDefault();
          sound.playClick();
          onSelectTab('sportsbook');
        }}
        className="text-xl font-extrabold tracking-tight text-white font-display whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
      >
        BETSTREAM
      </a>

      {/* Zone 2: 5 clean text navigation links */}
      <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-7 text-sm font-medium">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                sound.playClick();
                onSelectTab(item.id);
              }}
              className={`py-4 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'border-emerald-500 text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-100 hover:border-slate-700'
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Zone 3: 2-3 primary actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Android APK Download Button */}
        {onOpenApkModal && (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenApkModal();
            }}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            title="Download Android APK Package (v2.4.0)"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>APK App</span>
          </button>
        )}

        {/* Admin Portal Toggle Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onSelectTab(activeTab === 'admin_panel' ? 'casino' : 'admin_panel');
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'admin_panel'
              ? 'bg-rose-500 text-white font-bold shadow-md'
              : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}
          title="SuperAdmin Backoffice Portal"
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${activeTab === 'admin_panel' ? 'text-white' : 'text-rose-400'}`} />
          <span className="hidden sm:inline">Admin</span>
        </button>

        {/* Quick Commission Shortcut Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onSelectTab('affiliate_commission');
          }}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          title="Your Active Provider Commission Balance"
        >
          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono tabular-nums font-bold">
            ${availableCommissionUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-amber-400/80 uppercase">Commission</span>
        </button>

        {/* Currency & Balance Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            aria-label="Select Active Wallet Currency"
            aria-expanded={dropdownOpen}
            onClick={() => {
              sound.playClick();
              setDropdownOpen((prev) => !prev);
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800/90 text-slate-100 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="text-emerald-400 font-mono font-semibold">{currentCurrencyInfo.symbol}</span>
            <span className="font-mono tabular-nums font-semibold">
              {formatBalance(currentBalance, activeCurrency)}
            </span>
            <span className="text-slate-400 font-mono hidden sm:inline">{activeCurrency}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div
              role="menu"
              aria-label="Multi-Currency Wallet Balances"
              className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50"
            >
              <div className="space-y-1">
                {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
                  const info = CURRENCIES[code];
                  const bal = balances[code] || 0;
                  const usdVal = bal * info.rateToUSD;
                  const isSelected = code === activeCurrency;
                  return (
                    <button
                      key={code}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        sound.playClick();
                        onSelectCurrency(code);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/15 text-white border border-emerald-500/30'
                          : 'hover:bg-slate-800/70 text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-left">
                        <span className="w-5 text-center font-mono font-bold text-emerald-400">{info.symbol}</span>
                        <div>
                          <div className="font-semibold text-slate-100">{info.code}</div>
                          <div className="text-[11px] text-slate-400">{info.name}</div>
                        </div>
                      </div>
                      <div className="text-right font-mono tabular-nums">
                        <div className="font-semibold text-slate-100">{formatBalance(bal, code)}</div>
                        <div className="text-[11px] text-slate-400">
                          ${usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenCashier('swap');
                  }}
                  className="flex-1 py-1.5 px-3 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer text-center"
                >
                  Swap Currency
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenCashier('ledger');
                  }}
                  className="flex-1 py-1.5 px-3 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer text-center"
                >
                  Ledger
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Deposit Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenCashier('deposit');
          }}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Deposit</span>
        </button>
      </div>
    </header>
  );
};
