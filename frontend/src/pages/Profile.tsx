import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WalletGate from "../components/WalletGate";
import MarketCard from "../components/MarketCard";
import type { Position, Market } from "../utils/types";
import { useSolanaWallet } from "../hooks/useSolanaWallet";
import { formatCurrency, truncateAddress } from "../utils/helpers";

const mockResolvedMarketsData: Market[] = [
	{
		id: "resolved-1",
		question: "Will Bitcoin hit $100k by year-end 2024?",
		creator: "9X7e5fGhI1JkL2mN3oP4qR5sT6uV7wX8yZ0",
		isApproved: true,
		isResolved: true,
		resolution: 123,
		totalPool: 1000,
		totalPositions: 50,
		endTime: Date.now() - 86400000,
		startTime: Date.now() - 86400000,
		category: "Sports",
		creatorFeeRevenue: 10000,
		description: "Market Description",
		minPredictionPrice: 10000,
		totalScores: 99999999,
	},

	{
		id: "resolved-2",
		question: "Will the Solana price double in Q3?",
		creator: "NotMockUserPublicKey",
		isApproved: true,
		isResolved: true,
		totalPool: 5000,
		totalPositions: 100,
		resolution: 100,
		endTime: Date.now() - 172800000,
		startTime: Date.now() - 86400000,
		category: "Sports",
		creatorFeeRevenue: 500,
		description: "Market Description",
		minPredictionPrice: 10000,
		totalScores: 9999999,
	},

	{
		id: "resolved-3",
		question: "Will the Ethereum price double in Q3?",
		creator: "MockUserPublicKey",
		isApproved: true,
		isResolved: false,
		totalPool: 5000,
		totalPositions: 100,
		endTime: Date.now() - 172800000,
		startTime: Date.now() - 86400000,
		category: "Sports",
		creatorFeeRevenue: 500,
		description: "Market Description",
		minPredictionPrice: 10000,
	},

	{
		id: "resolved-4",
		question: "Will the Monad price double in Q3?",
		creator: "MockUserPublicKey",
		isApproved: true,
		isResolved: true,
		resolution: 202,
		totalPool: 5000,
		totalPositions: 100,
		endTime: Date.now() - 172800000,
		startTime: Date.now() - 86400000,
		category: "Sports",
		creatorFeeRevenue: 500,
		description: "Market Description",
		minPredictionPrice: 10000,
		totalScores: 99999999,
	},
];

const mockResolvedPositionsData: Position[] = [
	{
		id: "pos-resolved-1-won-claimed",
		market: "resolved-1",
		user: "MockUserPublicKey",
		stake: 50,
		prediction: 21,
		reward: 95,
		claimed: true,
		timestamp: Date.now() - 100000000,
	},

	{
		id: "pos-resolved-2-won-claimable",
		market: "resolved-2",
		user: "MockUserPublicKey",
		stake: 100,
		prediction: 21,
		reward: 180,
		claimed: false,
		timestamp: Date.now() - 150000000,
	},

	{
		id: "pos-resolved-2-lost-claimed",
		market: "resolved-2",
		user: "MockUserPublicKey",
		stake: 20,
		prediction: 12,
		reward: undefined,
		claimed: true,
		timestamp: Date.now() - 150000000,
	},
];

const mockAllMarkets = [
	...mockResolvedMarketsData,
	{
		id: "unresolved-1",
		question: "Will the S&P 500 be up next week?",
		creator: "MockUserPublicKey",
		isApproved: true,
		isResolved: false,
		totalPool: 200,
		totalPositions: 10,
		endTime: Date.now() + 86400000,
		startTime: Date.now() - 86400000,
		category: "Sports",
		creatorFeeRevenue: 0,
		description: "Market Description",
		minPredictionPrice: 10000,
	},

	{
		id: "unresolved-2",
		question: "Next major tech innovation?",
		creator: "OtherCreator",
		isApproved: true,
		isResolved: false,
		totalPool: 500,
		totalPositions: 20,
		endTime: Date.now() + 172800000,
		startTime: Date.now() - 86400000,
		category: "Sports",
		creatorFeeRevenue: 10000,
		description: "Market Description",
		minPredictionPrice: 10000,
	},
];

const mockAllPositions = [
	...mockResolvedPositionsData,
	{
		id: "pos-unresolved-1",
		market: "unresolved-1",
		user: "MockUserPublicKey",
		stake: 10,
		prediction: 213,
		reward: undefined,
		claimed: false,
		timestamp: Date.now() - 1000000,
	},

	{
		id: "pos-unresolved-2",
		market: "unresolved-2",
		user: "MockUserPublicKey",
		stake: 50,
		prediction: 132,
		reward: undefined,
		claimed: false,
		timestamp: Date.now() - 500000,
	},
];

interface UserMarketData {
	market: Market;
	userPosition?: Position;
	isCreator: boolean;
}

const Profile: React.FC = () => {
	const { isConnected, connect, userPublicKey } = useSolanaWallet();
	const [allUserPositions, setAllUserPositions] = useState<Position[]>([]);
	const [allMarkets, setAllMarkets] = useState<Market[]>(mockAllMarkets);
	const [loading, setLoading] = useState(true);

	const userId = "MockUserPublicKey";

	const handleClaimReward = async (positionId: string) => {
		try {
			await new Promise((resolve) => setTimeout(resolve, 500));
			const positionToClaim = allUserPositions.find(
				(p) => p.id === positionId
			);
			const reward = positionToClaim?.reward || 0;

			if (reward > 0) {
				setAllUserPositions((prev) =>
					prev.map((prediction) =>
						prediction.id === positionId
							? { ...prediction, claimed: true }
							: prediction
					)
				);
				toast.success(`Claimed ${formatCurrency(reward)}!`);
			} else {
				toast.error("No reward to claim or claim failed.");
			}
		} catch (error) {
			console.error("Failed to claim reward:", error);
			toast.error("Failed to claim reward");
		}
	};

	const handleWithdrawRevenue = async (marketId: string) => {
		try {
			await new Promise((resolve) => setTimeout(resolve, 500));
			const marketToClaim = allMarkets.find((m) => m.id === marketId);
			const mockRevenue = (marketToClaim?.totalPool || 0) * 0.05;

			setAllMarkets((prev) =>
				prev.map((m) =>
					m.id === marketId ? { ...m, creatorFeeRevenue: 0 } : m
				)
			);

			toast.success(
				`Creator revenue withdrawn: ${formatCurrency(mockRevenue)}!`
			);
		} catch (error) {
			console.error("Failed to withdraw revenue:", error);
			toast.error("Failed to withdraw revenue");
		}
	};

	useEffect(() => {
		const loadUserMarketsAndPositions = async () => {
			if (!userId) return;

			setLoading(true);
			try {
				const [userPositions] = await Promise.all([
					Promise.resolve(
						mockAllPositions.filter((p) => p.user === userId)
					),
				]);
				setAllUserPositions(userPositions);
				setAllMarkets(mockAllMarkets);
			} catch (error) {
				console.error("Failed to load user data:", error);
				toast.error("Failed to load profile data");
			} finally {
				setLoading(false);
			}
		};

		if (isConnected || userId === "MockUserPublicKey") {
			loadUserMarketsAndPositions();
		}
	}, [isConnected, userId]);

	const {
		unclaimedPositionRewards,
		activeProposedMarkets,
		resolvedMarketsHistory,
	} = useMemo(() => {
		if (loading || allMarkets.length === 0) {
			return {
				unclaimedPositionRewards: [],
				activeProposedMarkets: [],
				resolvedMarketsHistory: [],
			};
		}

		const marketsById = new Map<string, Market>(
			allMarkets.map((m) => [m.id, m])
		);

		const userPositionsByMarket = allUserPositions.reduce((acc, pos) => {
			const marketId = pos.market;
			if (acc.has(marketId)) {
				acc.get(marketId)!.push(pos);
			} else {
				acc.set(marketId, [pos]);
			}
			return acc;
		}, new Map<string, Position[]>());

		const allUserMarketData: UserMarketData[] = [];

		const relevantMarketIds = new Set([
			...Array.from(userPositionsByMarket.keys()),
			...allMarkets.filter((m) => m.creator === userId).map((m) => m.id),
		]);

		relevantMarketIds.forEach((marketId) => {
			const market = marketsById.get(marketId);
			const userPosition = userPositionsByMarket.get(marketId);

			if (!market) return;

			const isCreator = market.creator === userId;

			if (userPosition) {
				userPosition.forEach((p) => {
					allUserMarketData.push({
						market,
						userPosition: p,
						isCreator,
					});
				});
			} else {
				allUserMarketData.push({
					market,
					isCreator,
				});
			}
		});

		const unclaimedPositionRewards: UserMarketData[] = [];
		const activeProposedMarkets: UserMarketData[] = [];
		const resolvedMarketsHistory: UserMarketData[] = [];

		allUserMarketData.forEach((item) => {
			const { market, userPosition, isCreator } = item;

			const isUnclaimedPositionReward =
				!!userPosition &&
				market.isResolved &&
				!!userPosition.reward &&
				!userPosition.claimed;

			const isCreatorUnresolved = isCreator && !market.isResolved;
			const isWithdrawableCreatorRevenue =
				isCreator && market.isResolved && market.creatorFeeRevenue > 0;
			const isCreatorActive =
				isCreatorUnresolved || isWithdrawableCreatorRevenue;

			const isHistory =
				market.isResolved &&
				// If user is predictor: position is claimed OR user lost
				(!userPosition ||
					userPosition.claimed ||
					userPosition.reward) &&
				// If user is creator: revenue withdrawn
				(!isCreator || market.creatorFeeRevenue <= 0);

			if (isUnclaimedPositionReward) {
				unclaimedPositionRewards.push(item);
				return;
			}

			if (isCreatorActive) {
				activeProposedMarkets.push(item);
				return;
			}

			if (isHistory) {
				resolvedMarketsHistory.push(item);
				return;
			}
		});

		return {
			unclaimedPositionRewards,
			activeProposedMarkets,
			resolvedMarketsHistory,
		};
	}, [loading, allMarkets, allUserPositions, userId]);

	const totalStaked = allUserPositions.reduce(
		(sum, postion) => sum + postion.stake,
		0
	);
	const totalWinnings = allUserPositions.reduce(
		(sum, postion) => sum + (postion.reward || 0),
		0
	);

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<WalletGate isConnected={isConnected} onConnect={connect}>
					<div className="space-y-8">
						<div className="bg-white border border-gray-200 rounded-lg p-6">
							<h1 className="text-3xl font-bold text-gray-900 mb-4">
								Profile Dashboard
							</h1>
							<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
								<div>
									<span className="text-gray-500 text-sm">
										Wallet Address
									</span>
									<div className="font-mono text-sm">
										{truncateAddress(userId || "", 8)}
									</div>
								</div>
								<div className="md:text-center">
									<span className="text-gray-500 text-sm">
										Total Staked
									</span>
									<div className="font-semibold text-lg">
										{formatCurrency(totalStaked)}
									</div>
								</div>
								<div className="md:text-center">
									<span className="text-gray-500 text-sm">
										Total Winnings
									</span>
									<div className="font-semibold text-lg text-lime-600">
										{formatCurrency(totalWinnings)}
									</div>
								</div>
								<div className="md:text-center">
									<span className="text-gray-500 text-sm">
										Action Required Markets
									</span>
									<div className="font-semibold text-lg">
										{unclaimedPositionRewards.length +
											activeProposedMarkets.length}
									</div>
								</div>
							</div>
						</div>

						<div className="rounded-lg p-6 shadow-md">
							<h3 className="text-xl font-bold mb-4 flex items-center">
								Active Positions (
								{unclaimedPositionRewards.length})
							</h3>
							<p className="text-gray-600 mb-4">
								Markets you predicted in and are potentially
								claim rewards.
							</p>

							{loading ? (
								<p className="text-center py-4 text-gray-500">
									Loading...
								</p>
							) : unclaimedPositionRewards.length === 0 ? (
								<div className="text-center py-4">
									<p className="text-gray-500">
										No rewards available to claim.
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{unclaimedPositionRewards.map((data) => (
										<MarketCard
											key={data.market.id}
											market={data.market}
											userContextData={{
												market: data.market,
												isCreator: data.isCreator,
												panelType: "UnclaimedRewards",
												userPosition: data.userPosition,
												onWithdrawRevenue:
													handleWithdrawRevenue,
												onClaimReward:
													handleClaimReward,
											}}
										/>
									))}
								</div>
							)}
						</div>

						<div className="bg-white rounded-lg p-6 shadow-md">
							<h3 className="text-xl font-bold mb-4 flex items-center">
								Proposed Markets ({activeProposedMarkets.length}
								)
							</h3>
							<p className="text-gray-600 mb-4">
								Markets you proposed that are <b>unresolved</b>{" "}
								or{" "}
								<b>
									resolved with pending creator revenue
									withdrawal
								</b>
							</p>

							{loading ? (
								<p className="text-center py-4 text-gray-500">
									Loading...
								</p>
							) : activeProposedMarkets.length === 0 ? (
								<div className="text-center py-4">
									<p className="text-gray-500">
										No active markets where you are the
										creator.
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{activeProposedMarkets.map((data) => (
										<MarketCard
											key={data.market.id}
											market={data.market}
											userContextData={{
												market: data.market,
												isCreator: data.isCreator,
												panelType: "UnwithdrawnRevenue",
												userPosition: data.userPosition,
												onWithdrawRevenue:
													handleWithdrawRevenue,
												onClaimReward:
													handleClaimReward,
											}}
										/>
									))}
								</div>
							)}
						</div>

						<hr className="border-gray-300 my-8" />

						<div className="bg-white border border-gray-200 rounded-lg p-6">
							<h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
								History (Resolved & Settled)
							</h2>
							<p className="text-gray-600 mb-4">
								Markets that are fully <b>resolved</b> and where
								all rewards/revenue have been{" "}
								<b>claimed, withdrawn or lost</b>
							</p>

							{loading ? (
								<div className="text-center py-8">
									<p className="mt-2 text-gray-600">
										Loading history...
									</p>
								</div>
							) : resolvedMarketsHistory.length === 0 ? (
								<div className="text-center py-8">
									<p className="text-gray-500">
										No resolved markets with settled rewards
										or revenue yet.
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{resolvedMarketsHistory.map((data) => (
										<MarketCard
											key={data.market.id}
											market={data.market}
											userContextData={{
												market: data.market,
												isCreator: data.isCreator,
												panelType: "History",
												userPosition: data.userPosition,
												onWithdrawRevenue:
													handleWithdrawRevenue,
												onClaimReward:
													handleClaimReward,
											}}
										/>
									))}
								</div>
							)}
						</div>
					</div>
				</WalletGate>
			</main>

			<Footer />
		</div>
	);
};

export default Profile;
