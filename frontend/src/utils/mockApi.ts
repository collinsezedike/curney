import type { Market, Bet, User, PlatformConfig } from "./types";
import { generateId } from "./helpers";

// Mock data storage
let markets: Market[] = [
	{
		id: "1",
		question: "What will be the price of Bitcoin on January 31, 2025?",
		description:
			"Predict the closing price of Bitcoin (BTC) in USD on January 31, 2025, based on CoinGecko data.",
		category: "crypto",
		status: "open",
		endTime: new Date("2025-01-31T23:59:59"),
		totalPool: 15420.5,
		totalBets: 127,
		createdBy: "admin",
		createdAt: new Date("2025-01-01T00:00:00"),
	},
	{
		id: "2",
		question: "How many goals will be scored in the next World Cup final?",
		description:
			"Total goals scored by both teams in the FIFA World Cup final match.",
		category: "sports",
		status: "open",
		endTime: new Date("2026-07-15T20:00:00"),
		totalPool: 8750.25,
		totalBets: 89,
		createdBy: "user123",
		createdAt: new Date("2025-01-02T10:30:00"),
	},
	{
		id: "3",
		question:
			"What will be the S&P 500 closing value on December 31, 2025?",
		description:
			"Predict the closing value of the S&P 500 index on the last trading day of 2025.",
		category: "stocks",
		status: "pending",
		endTime: new Date("2025-12-31T16:00:00"),
		totalPool: 0,
		totalBets: 0,
		createdBy: "user456",
		createdAt: new Date("2025-01-03T14:15:00"),
	},
];

let bets: Bet[] = [
	{
		id: "1",
		marketId: "2",
		prediction: 140,
		stake: 100,
		timestamp: new Date("2025-10-03T14:15:00"),
		userId: "mock_l2t9a72",
	},
];
let users: User[] = [];
let platformConfig: PlatformConfig = {
	initialized: true,
	feePercentage: 2.5,
	minStake: 0.01,
	maxStake: 10000,
	adminKey: "import.meta.env.VITE_ADMIN_KEY",
};

// Mock API functions
export const mockApi = {
	// Markets
	getMarkets: async (): Promise<Market[]> => {
		await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
		return markets;
	},

	getMarket: async (id: string): Promise<Market | null> => {
		await new Promise((resolve) => setTimeout(resolve, 300));
		return markets.find((m) => m.id === id) || null;
	},

	proposeMarket: async (
		marketData: Omit<
			Market,
			"id" | "status" | "totalPool" | "totalBets" | "createdAt"
		>
	): Promise<Market> => {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		const newMarket: Market = {
			...marketData,
			id: generateId(),
			status: "pending",
			totalPool: 0,
			totalBets: 0,
			createdAt: new Date(),
		};
		markets.push(newMarket);
		return newMarket;
	},

	approveMarket: async (id: string): Promise<Market | null> => {
		await new Promise((resolve) => setTimeout(resolve, 800));
		const market = markets.find((m) => m.id === id);
		if (market && market.status === "pending") {
			market.status = "open";
			return market;
		}
		return null;
	},

	resolveMarket: async (
		id: string,
		finalValue: number
	): Promise<Market | null> => {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		const market = markets.find((m) => m.id === id);
		if (market && market.status === "open") {
			market.status = "resolved";
			market.finalValue = finalValue;
			return market;
		}
		return null;
	},

	// Bets
	placeBet: async (
		marketId: string,
		userId: string,
		prediction: number,
		stake: number
	): Promise<Bet> => {
		await new Promise((resolve) => setTimeout(resolve, 1200));
		const bet: Bet = {
			id: generateId(),
			marketId,
			userId,
			prediction,
			stake,
			timestamp: new Date(),
		};
		bets.push(bet);

		// Update market totals
		const market = markets.find((m) => m.id === marketId);
		if (market) {
			market.totalPool += stake;
			market.totalBets += 1;
		}

		return bet;
	},

	getUserBets: async (userId: string): Promise<Bet[]> => {
		await new Promise((resolve) => setTimeout(resolve, 400));
		return bets.filter((b) => b.userId === userId);
	},

	claimReward: async (betId: string): Promise<number> => {
		await new Promise((resolve) => setTimeout(resolve, 800));
		const bet = bets.find((b) => b.id === betId);
		if (bet && bet.payout && !bet.claimed) {
			bet.claimed = true;
			return bet.payout;
		}
		return 0;
	},

	// Platform
	getPlatformConfig: async (): Promise<PlatformConfig> => {
		await new Promise((resolve) => setTimeout(resolve, 200));
		return platformConfig;
	},

	updatePlatformConfig: async (
		config: Partial<PlatformConfig>
	): Promise<PlatformConfig> => {
		await new Promise((resolve) => setTimeout(resolve, 600));
		platformConfig = { ...platformConfig, ...config };
		return platformConfig;
	},

	initializePlatform: async (
		config: PlatformConfig
	): Promise<PlatformConfig> => {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		platformConfig = config;
		return platformConfig;
	},
};
