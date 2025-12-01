export interface Market {
	id: string;
	question: string;
	description: string;
	category: string;
	endTime: Date;
	status: string;
	totalPool: number;
	totalBets: number;
	finalValue?: number;
	createdBy: string;
	createdAt: Date;
}
export interface Bet {
	id: string;
	marketId: string;
	userId: string;
	prediction: number;
	stake: number;
	timestamp: Date;
	claimed?: boolean;
	payout?: number;
}

export interface User {}

export interface PlatformConfig {
	feePercentage: number;
	minStake: number;
	maxStake: number;
	initialized: boolean;
	adminKey: string;
}
