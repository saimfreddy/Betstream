export type CurrencyCode = 'USDT' | 'BTC' | 'ETH' | 'SOL' | 'USD' | 'EUR';

export interface CurrencyInfo {
  code: CurrencyCode;
  name: string;
  symbol: string;
  type: 'crypto' | 'fiat';
  rateToUSD: number;
  decimals: number;
  networks: string[];
  minDeposit: number;
}

export type ProviderId =
  | 'all'
  | 'evolution'
  | 'pragmatic'
  | 'spribe'
  | 'hacksaw'
  | 'playngo'
  | 'nolimit'
  | 'jili'
  | 'originals';

export interface GamingProvider {
  id: Exclude<ProviderId, 'all'>;
  name: string;
  badge: string;
  type: 'Live Casino & Game Shows' | 'Premium Video Slots' | 'Crash & Instant Turbo' | 'Arcade & Fishing' | 'Provably Fair Originals';
  description: string;
  commissionRate: number; // e.g. 15 = 15% RevShare
  gamesCount: number;
  featuredGames: string[];
  color: string;
}

export type GameCategory =
  | 'all'
  | 'live_dealer'
  | 'game_shows'
  | 'fishing_arcade'
  | 'slots'
  | 'crash_instant'
  | 'table_games'
  | 'provably_fair';

export interface CasinoGame {
  id: string;
  title: string;
  providerId: Exclude<ProviderId, 'all'>;
  providerName: string;
  category: GameCategory;
  rtp: string;
  volatility: 'Low' | 'Medium' | 'High' | 'Very High' | 'Adjustable' | 'Insane';
  maxWin: string;
  minBetUSD: number;
  maxBetUSD: number;
  isHot?: boolean;
  isNew?: boolean;
  isLive?: boolean;
  livePlayersCount?: number;
  thumbnailGradient: string;
  tagline: string;
}

export interface ProviderCommissionStat {
  providerId: Exclude<ProviderId, 'all'>;
  providerName: string;
  commissionRate: number; // %
  turnoverUSD: number;
  grossNGR: number;
  commissionEarnedUSD: number;
  activePlayers: number;
}

export interface LiveCommissionEvent {
  id: string;
  timestamp: string;
  playerAlias: string;
  gameName: string;
  providerName: string;
  wagerUSD: number;
  commissionUSD: number;
}

export interface AffiliateProfile {
  referralCode: string;
  customCampaign: string;
  tier: 'Bronze Agent (25%)' | 'Silver Agent (35%)' | 'Gold Partner (45%)' | 'Diamond Super Agent (50%)';
  tierRate: number; // %
  totalEarningsUSD: number;
  availableCommissionUSD: number;
  paidCommissionUSD: number;
  totalReferrals: number;
  activeDepositors: number;
  conversionRate: number; // %
  clicksToday: number;
}

export type SportCategory = 'all' | 'football' | 'basketball' | 'tennis' | 'esports' | 'mma';

export type OddsFormat = 'decimal' | 'american' | 'fractional';

export interface MarketOption {
  id: string;
  label: string;
  subLabel?: string;
  odds: number;
  trend?: 'up' | 'down' | 'none';
}

export interface MatchMarketGroup {
  id: string;
  name: string;
  options: MarketOption[];
}

export interface LiveMatchStats {
  possession: [number, number];
  shotsOnTarget: [number, number];
  cornersOrAces: [number, number];
  dangerousAttacks: [number, number];
  ballPos: { x: number; y: number };
  attackingTeam: 'home' | 'away' | 'neutral';
  lastEvent: string;
}

export interface SportMatch {
  id: string;
  sport: Exclude<SportCategory, 'all'>;
  league: string;
  region: string;
  isLive: boolean;
  isFeatured?: boolean;
  matchTime: string;
  period: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeSubScore?: string;
  awaySubScore?: string;
  markets: {
    winner: MarketOption[];
    spread: MarketOption[];
    total: MarketOption[];
  };
  extraMarkets: MatchMarketGroup[];
  stats: LiveMatchStats;
}

export interface SelectedOdd {
  selectionId: string;
  matchId: string;
  matchTitle: string;
  league: string;
  marketName: string;
  optionLabel: string;
  odds: number;
  isLive: boolean;
}

export interface PlacedBet {
  id: string;
  mode: 'single' | 'parlay';
  selections: SelectedOdd[];
  totalOdds: number;
  currency: CurrencyCode;
  stake: number;
  potentialPayout: number;
  cashoutOffer: number;
  status: 'open' | 'won' | 'lost' | 'cashed_out';
  settledPayout?: number;
  placedAt: string;
}

export interface TransactionRecord {
  id: string;
  type: 'deposit' | 'withdrawal' | 'swap' | 'commission_payout';
  gateway: string;
  currency: CurrencyCode;
  amount: number;
  usdEquivalent: number;
  status: 'completed' | 'confirmed';
  referenceId: string;
  networkOrCard: string;
  timestamp: string;
}

export type ActiveMainTab =
  | 'sportsbook'
  | 'live_sports'
  | 'casino'
  | 'live_dealers'
  | 'affiliate_commission'
  | 'originals'
  | 'games_api'
  | 'admin_panel';

export interface AdminPlayerRecord {
  id: string;
  username: string;
  email: string;
  country: string;
  vipTier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Whale';
  balances: Record<CurrencyCode, number>;
  totalDepositedUSD: number;
  totalWithdrawnUSD: number;
  totalWageredUSD: number;
  status: 'active' | 'suspended' | 'flagged';
  registeredDate: string;
  lastLogin: string;
  kycVerified: boolean;
}

export interface AdminPendingWithdrawal {
  id: string;
  playerId: string;
  playerUsername: string;
  currency: CurrencyCode;
  amount: number;
  usdEquivalent: number;
  gateway: string;
  destinationAddressOrCard: string;
  network: string;
  requestedAt: string;
  riskScore: 'Low (0.12)' | 'Medium (0.48)' | 'High (0.85)';
  status: 'pending' | 'approved' | 'rejected';
}

export interface AdminGatewayConfig {
  id: string;
  name: string;
  currency: CurrencyCode;
  type: 'crypto' | 'fiat';
  enabled: boolean;
  minDeposit: number;
  maxWithdrawal: number;
  processingFeePercent: number;
  autoApproveThresholdUSD: number;
}

export interface AdminSystemAuditLog {
  id: string;
  timestamp: string;
  adminUser: string;
  action: string;
  category: 'SECURITY' | 'FINANCE' | 'PROVIDER' | 'PLAYER' | 'SPORTSBOOK';
  details: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'critical';
}
