import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Share2,
  Copy,
  Check,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Eye,
  Percent,
  Sparkles,
} from 'lucide-react';
import {
  AffiliateProfile,
  LiveCommissionEvent,
  ProviderCommissionStat,
} from '../types';
import { sound } from '../utils/sound';

interface AffiliateCommissionViewProps {
  affiliateProfile: AffiliateProfile;
  providerCommissions: ProviderCommissionStat[];
  liveCommissionFeed: LiveCommissionEvent[];
  onClaimCommissionToWallet: (amountUSD: number) => void;
  onSimulateReferralBet: () => void;
}

export const AffiliateCommissionView: React.FC<AffiliateCommissionViewProps> = ({
  affiliateProfile,
  providerCommissions,
  liveCommissionFeed,
  onClaimCommissionToWallet,
  onSimulateReferralBet,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [campaignTag, setCampaignTag] = useState(affiliateProfile.customCampaign);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);

  const referralUrl = `https://betstream.io?ref=${affiliateProfile.referralCode}&camp=${campaignTag}&provider=all`;

  const handleCopyLink = () => {
    sound.playClick();
    navigator.clipboard?.writeText(referralUrl).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleClaimEarnings = () => {
    if (affiliateProfile.availableCommissionUSD <= 0) return;
    const claimed = affiliateProfile.availableCommissionUSD;
    sound.playWin();
    onClaimCommissionToWallet(claimed);
    setClaimSuccessMsg(
      `Successfully transferred $${claimed.toLocaleString('en-US', {
        minimumFractionDigits: 2,
      })} USD from your Commission Vault to your Main Wallet!`
    );
    setTimeout(() => setClaimSuccessMsg(null), 5000);
  };

  const totalTurnoverAllProviders = providerCommissions.reduce(
    (sum, p) => sum + p.turnoverUSD,
    0
  );
  const totalCommissionAllProviders = providerCommissions.reduce(
    (sum, p) => sum + p.commissionEarnedUSD,
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Hero: Commission Vault & Instant Payout */}
      <section
        aria-label="Agent Commission Summary Vault"
        className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/20 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>Multi-Provider Revenue Share & Sub-Affiliate Program</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{affiliateProfile.tier}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight">
              Earn Lifetime Commission From Top Gaming Providers
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Earn up to <strong>50% Revenue Share</strong> on every wager placed across <strong>Evolution Gaming</strong>, <strong>Pragmatic Play</strong>, <strong>Spribe Aviator</strong>, <strong>Hacksaw</strong>, and Live Sportsbook. Zero negative carryover, instant daily settlement.
            </p>
          </div>

          {/* Vault Balance & Instant Claim Card */}
          <div className="bg-slate-950/90 border border-amber-500/40 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 shadow-xl">
            <div>
              <div className="text-xs text-slate-400">Unsettled Commission Vault</div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-amber-400 mt-0.5">
                ${affiliateProfile.availableCommissionUSD.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-1">
                Lifetime Paid Out: ${affiliateProfile.paidCommissionUSD.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button
                type="button"
                disabled={affiliateProfile.availableCommissionUSD <= 0}
                onClick={handleClaimEarnings}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-md"
              >
                <DollarSign className="w-4 h-4" />
                <span>Transfer to Main Wallet</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playWin();
                  onSimulateReferralBet();
                }}
                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-[11px] font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Referral Bet (+Commission)</span>
              </button>
            </div>
          </div>
        </div>

        {claimSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-semibold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{claimSuccessMsg}</span>
          </div>
        )}

        {/* 4 Key Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/70 border border-slate-800/90 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Referred Bettors</span>
              <Users className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              {affiliateProfile.totalReferrals.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {affiliateProfile.activeDepositors} Active First Deposits (FTD)
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/90 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Campaign Clicks (Today)</span>
              <Eye className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              {affiliateProfile.clicksToday.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5">
              {affiliateProfile.conversionRate}% Conversion Rate
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/90 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Network Player Turnover</span>
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              ${totalTurnoverAllProviders.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Across 7 integrated providers</div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/90 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Active Agent RevShare</span>
              <Percent className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-bold font-mono text-amber-400 mt-1">
              {affiliateProfile.tierRate}% Max Tier
            </div>
            <div className="text-[11px] text-amber-300 mt-0.5">Diamond VIP Partner Level</div>
          </div>
        </div>
      </section>

      {/* Provider Commission Breakdown Matrix */}
      <section
        aria-label="Provider Revenue Share Matrix"
        className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-950 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-sm font-bold text-white font-display">
              Live Provider Commission Breakdown
            </h2>
            <p className="text-xs text-slate-400">
              Real-time revenue share earnings attributed by gaming provider engine
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400 font-bold">
            Total Earned: ${totalCommissionAllProviders.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 bg-slate-900/80">
                <th className="py-3 px-4 font-semibold">Gaming Provider</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold text-right">Player Turnover</th>
                <th className="py-3 px-4 font-semibold text-right">Gross GGR</th>
                <th className="py-3 px-4 font-semibold text-right">Agent RevShare</th>
                <th className="py-3 px-4 font-semibold text-right">Your Commission</th>
                <th className="py-3 px-4 font-semibold text-right">Active Players</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {providerCommissions.map((row) => (
                <tr key={row.providerId} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-white">
                    {row.providerName}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-400">
                    {row.providerId === 'evolution'
                      ? 'Live Dealers & Game Shows'
                      : row.providerId === 'pragmatic'
                      ? 'Drops & Wins Video Slots'
                      : row.providerId === 'spribe'
                      ? 'Turbo Multiplayer Crash'
                      : row.providerId === 'originals'
                      ? 'In-House Provably Fair'
                      : 'Slots & Arcade'}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-slate-300">
                    ${row.turnoverUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-slate-300">
                    ${row.grossNGR.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-bold text-amber-400">
                    {row.commissionRate}%
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-bold text-emerald-400">
                    +${row.commissionEarnedUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-slate-400">
                    {row.activePlayers}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Referral Link & Campaign Generator + Live Bets Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Affiliate Link & Tracking Code Generator */}
        <section
          aria-label="Affiliate Link and Campaign Generator"
          className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <Share2 className="w-4 h-4" />
            <span>Dedicated Affiliate Link & Marketing Kit</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Share your unique tracking link across Twitch, Telegram, Kick, YouTube, or private betting syndicates. All players registering under your tag are locked to your agent ID forever.
          </p>

          <div className="space-y-3">
            <div>
              <label htmlFor="affiliate-camp-tag" className="block text-xs text-slate-400 mb-1">
                Custom Campaign Tag (UTM tracking)
              </label>
              <input
                id="affiliate-camp-tag"
                type="text"
                value={campaignTag}
                onChange={(e) => setCampaignTag(e.target.value)}
                placeholder="e.g. evolution_live_stream_promo"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-1">Your Live Tracking Link</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  aria-label="Affiliate Tracking URL"
                  value={referralUrl}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-amber-300 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-slate-950" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Agent Tier Program Progression */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-200">
              Agent Commission Tier Schedule:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Bronze Agent</div>
                <div className="font-mono font-bold text-slate-200 mt-0.5">25% RevShare</div>
                <div className="text-[10px] text-slate-500 mt-0.5">1-25 Players</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Silver Agent</div>
                <div className="font-mono font-bold text-slate-200 mt-0.5">35% RevShare</div>
                <div className="text-[10px] text-slate-500 mt-0.5">26-100 Players</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Gold Partner</div>
                <div className="font-mono font-bold text-slate-200 mt-0.5">45% RevShare</div>
                <div className="text-[10px] text-slate-500 mt-0.5">101-250 Players</div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/50">
                <div className="text-amber-300 text-[11px] font-bold">Diamond VIP</div>
                <div className="font-mono font-bold text-amber-400 mt-0.5">50% RevShare</div>
                <div className="text-[10px] text-amber-400/80 mt-0.5">250+ Players (Active)</div>
              </div>
            </div>
          </div>
        </section>

        {/* Right 5 Cols: Live Player Bets & Real-Time Commission Feed */}
        <section
          aria-label="Real-Time Player Commission Stream"
          className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-3"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Live Referral Bets Feed</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> REAL-TIME
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Watch referred player activity across Evolution, Pragmatic & Spribe generate instant commissions.
            </p>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {liveCommissionFeed.map((ev) => (
                <div
                  key={ev.id}
                  className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                      <span>{ev.playerAlias}</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        on {ev.gameName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {ev.providerName} · Bet: ${ev.wagerUSD.toFixed(2)} · {ev.timestamp}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-400">
                      +${ev.commissionUSD.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-amber-400 uppercase">RevShare</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Automated Daily Payouts</span>
            <span className="text-slate-200 font-mono">0% Merchant Processing Fee</span>
          </div>
        </section>
      </div>
    </div>
  );
};
