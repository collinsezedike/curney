import type { Market, Position, PlatformConfig } from "./types";
import { generateId } from "./helpers";
import { number } from "zod";

// Mock data storage
let markets: Market[] = [
	{
		id: "1",
		question: "What will be the price of Bitcoin on January 31, 2025?",
		description:
			"Predict the closing price of Bitcoin (BTC) in USD on January 31, 2025, based on CoinGecko data.",
		category: "crypto",
		creatorFeeRevenue: 10,
		isApproved: true,
		isResolved: false,
		minPredictionPrice: 0.01,
		endTime: new Date("2025-01-31T23:59:59").getTime(),
		totalPool: 15420.5,
		totalPositions: 127,
		creator: "admin",
		startTime: new Date("2025-01-01T00:00:00").getTime(),
	},
	{
		id: "2",
		question: "How many goals will be scored in the next World Cup final?",
		description:
			"Total goals scored by both teams in the FIFA World Cup final match.",
		category: "sports",
		isApproved: true,
		isResolved: false,
		minPredictionPrice: 0.01,
		creatorFeeRevenue: 10000,
		endTime: new Date("2026-07-15T20:00:00").getTime(),
		totalPool: 8750.25,
		totalPositions: 89,
		creator: "user123",
		startTime: new Date("2025-01-02T10:30:00").getTime(),
	},
	{
		id: "3",
		question:
			"What will be the S&P 500 closing value on December 31, 2025?",
		description:
			"Predict the closing value of the S&P 500 index on the last trading day of 2025.",
		category: "stocks",
		isApproved: false,
		isResolved: false,
		minPredictionPrice: 0.01,
		creatorFeeRevenue: 10000,
		endTime: new Date("2025-12-31T16:00:00").getTime(),
		totalPool: 0,
		totalPositions: 0,
		creator: "user456",
		startTime: new Date("2025-01-03T14:15:00").getTime(),
	},
];

let positions: Position[] = [
	{
		id: "1",
		market: "2",
		claimed: false,
		prediction: 140,
		stake: 100,
		timestamp: new Date("2025-10-03T14:15:00"),
		user: "mock_l2t9a72",
	},
];

let platformConfig: PlatformConfig = {
	platformFeeBps: 2.5,
	creatorFeeBps: 2.5,
	marketProposalFee: 0.01,
	admin: import.meta.env.VITE_ADMIN_KEY,
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
			totalPool: 0,
			totalPositions: 0,
		};
		markets.push(newMarket);
		return newMarket;
	},

	approveMarket: async (id: string): Promise<Market | null> => {
		await new Promise((resolve) => setTimeout(resolve, 800));
		const market = markets.find((m) => m.id === id);
		if (market && !market.isApproved) {
			market.isApproved = true;
			return market;
		}
		return null;
	},

	resolveMarket: async (
		id: string,
		resolution: number
	): Promise<Market | null> => {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		const market = markets.find((m) => m.id === id);
		if (market && market.isApproved) {
			market.isResolved = true;
			market.resolution = resolution;
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
	): Promise<Position> => {
		await new Promise((resolve) => setTimeout(resolve, 1200));
		const position: Position = {
			id: generateId(),
			market: marketId,
			user: userId,
			prediction,
			stake,
			claimed: false,
			timestamp: new Date(),
		};
		positions.push(position);

		// Update market totals
		const market = markets.find((m) => m.id === marketId);
		if (market) {
			market.totalPool += stake;
			market.totalPositions += 1;
		}

		return position;
	},

	getUserBets: async (userId: string): Promise<Position[]> => {
		await new Promise((resolve) => setTimeout(resolve, 400));
		return positions.filter((b) => b.user === userId);
	},

	claimReward: async (betId: string): Promise<number> => {
		await new Promise((resolve) => setTimeout(resolve, 800));
		const prediction = positions.find((b) => b.id === betId);
		if (prediction && prediction.reward && !prediction.claimed) {
			prediction.claimed = true;
			return prediction.reward;
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
