import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WalletGate from "../components/WalletGate";
import MarketCard from "../components/MarketCard";
import { useSolanaWallet } from "../hooks/useSolanaWallet";
import { formatCurrency, truncateAddress } from "../lib/helpers";
import {
	claimReward,
	withdrawCreatorRevenue,
} from "../lib/program/instructions";
import {
	fetchAllMarketAccounts,
	fetchAllUserPositionAccounts,
	fetchPositionAccount,
	fetchMarketAccount,
} from "../lib/program/utils";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

type MarketType = Awaited<ReturnType<typeof fetchMarketAccount>>;
type PositionType = Awaited<ReturnType<typeof fetchPositionAccount>>;

interface UserMarketData {
	market: MarketType;
	userPosition?: PositionType;
	isCreator: boolean;
}

const Profile: React.FC = () => {
	const { connect, connection, isConnected, signTransaction, userPublicKey } =
		useSolanaWallet();
	const [allUserPositions, setAllUserPositions] = useState<
		Awaited<ReturnType<typeof fetchAllUserPositionAccounts>>
	>([]);
	const [allMarkets, setAllMarkets] = useState<
		Awaited<ReturnType<typeof fetchAllMarketAccounts>>
	>([]);
	const [loading, setLoading] = useState(true);
	const [isClaiming, setIsClaiming] = useState(false);
	const [isWithdrawing, setIsWithdrawing] = useState(false);

	const isTransactionPending = isClaiming || isWithdrawing;

	const handleClaimReward = async (positionId: number, market: string) => {
		if (!userPublicKey || !signTransaction || isTransactionPending) return;

		setIsClaiming(true);

		try {
			const tx = await claimReward(positionId, market, userPublicKey);
			const signedTx = await signTransaction(tx);
			const signature = await connection.sendRawTransaction(
				signedTx.serialize()
			);
			const latestBlockhash = await connection.getLatestBlockhash();
			await connection.confirmTransaction({
				blockhash: latestBlockhash.blockhash,
				lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
				signature: signature,
			});

			toast.success(`Claimed reward successfully!`);
		} catch (error) {
			console.error("Failed to claim reward:", error);
			toast.error("Failed to claim reward");
		} finally {
			setIsClaiming(false);
		}
	};

	const handleWithdrawRevenue = async (marketId: string) => {
		if (!userPublicKey || !signTransaction || isTransactionPending) return;

		setIsWithdrawing(true);
		try {
			const tx = await withdrawCreatorRevenue(marketId, userPublicKey);
			const signedTx = await signTransaction(tx);
			const signature = await connection.sendRawTransaction(
				signedTx.serialize()
			);
			const latestBlockhash = await connection.getLatestBlockhash();
			await connection.confirmTransaction({
				blockhash: latestBlockhash.blockhash,
				lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
				signature: signature,
			});

			toast.success(`Creator revenue withdrawn successfully!`);
		} catch (error) {
			console.error("Failed to withdraw revenue:", error);
			toast.error("Failed to withdraw revenue");
		} finally {
			setIsWithdrawing(false);
		}
	};

	useEffect(() => {
		const loadUserMarketsAndPositions = async () => {
			if (!userPublicKey) return;

			setLoading(true);
			try {
				const userPositions = await fetchAllUserPositionAccounts(
					userPublicKey.toBase58()
				);
				const markets = await fetchAllMarketAccounts();
				setAllUserPositions(userPositions);
				setAllMarkets(markets);
			} catch (error) {
				console.error("Failed to load user data:", error);
				toast.error("Failed to load profile data");
			} finally {
				setLoading(false);
			}
		};

		if (isConnected) {
			loadUserMarketsAndPositions();
		}
	}, [isConnected, userPublicKey]);

	const {
		unclaimedPositionRewards,
		activeProposedMarkets,
		resolvedMarketsHistory,
	} = useMemo(() => {
		if (loading || !userPublicKey || allMarkets.length === 0) {
			return {
				unclaimedPositionRewards: [],
				activeProposedMarkets: [],
				resolvedMarketsHistory: [],
			};
		}

		const marketsById = new Map<string, MarketType>(
			allMarkets.map((m) => [m.state.marketConfig.toBase58(), m])
		);

		const userPositionsByMarket = allUserPositions.reduce((acc, pos) => {
			const marketId = pos.account.market.toBase58();
			if (acc.has(marketId)) {
				acc.get(marketId)!.push(pos.account);
			} else {
				acc.set(marketId, [pos.account]);
			}
			return acc;
		}, new Map<string, PositionType[]>());

		const allUserMarketData: UserMarketData[] = [];

		const relevantMarketIds = new Set([
			...Array.from(userPositionsByMarket.keys()),
			...allMarkets
				.filter(
					(m) =>
						m.config.creator.toBase58() === userPublicKey.toBase58()
				)
				.map((m) => m.state.marketConfig.toBase58()),
		]);

		relevantMarketIds.forEach((marketId) => {
			const market = marketsById.get(marketId);
			const userPosition = userPositionsByMarket.get(marketId);

			if (!market) return;

			const isCreator =
				market.config.creator.toBase58() === userPublicKey.toBase58();

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
				!!userPosition && !userPosition.claimed;

			const isCreatorUnresolved = isCreator && !market?.state.isResolved;
			const isWithdrawableCreatorRevenue =
				isCreator &&
				market?.state.isResolved &&
				market.state.creatorFeeRevenue.toNumber() > 0;
			const isCreatorActive =
				isCreatorUnresolved || isWithdrawableCreatorRevenue;

			const isHistory =
				market?.state.isResolved &&
				// If user is predictor: position is claimed OR user lost
				(!userPosition ||
					userPosition.claimed ||
					userPosition.reward) &&
				// If user is creator: revenue withdrawn
				(!isCreator || market.state.creatorFeeRevenue.toNumber() <= 0);

			if (isUnclaimedPositionReward) unclaimedPositionRewards.push(item);
			if (isCreatorActive) activeProposedMarkets.push(item);
			if (isHistory) resolvedMarketsHistory.push(item);
		});

		return {
			unclaimedPositionRewards,
			activeProposedMarkets,
			resolvedMarketsHistory,
		};
	}, [loading, allMarkets, allUserPositions, userPublicKey]);

	const totalStaked =
		allUserPositions.reduce(
			(sum, postion) => sum + postion.account.stake.toNumber(),
			0
		) / LAMPORTS_PER_SOL;
	const totalWinnings = allUserPositions.reduce(
		(sum, postion) => sum + (postion.account.reward?.toNumber() || 0),
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
										{truncateAddress(
											userPublicKey?.toBase58() || "",
											8
										)}
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
										Pending Settlements
									</span>
									<div className="font-semibold text-lg">
										{unclaimedPositionRewards.length +
											activeProposedMarkets.length}
									</div>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg p-6 shadow-md">
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
											key={data.market?.state.marketConfig.toBase58()}
											market={data.market}
											userPosition={data.userPosition}
											userContextData={{
												isCreator: data.isCreator,
												panelType: "UnclaimedRewards",
												isTransactionPending,
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
											key={data.market?.state.marketConfig.toBase58()}
											market={data.market}
											userContextData={{
												isCreator: data.isCreator,
												panelType: "UnwithdrawnRevenue",
												isTransactionPending,
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
											key={data.market?.state.marketConfig.toBase58()}
											market={data.market}
											userPosition={data.userPosition}
											userContextData={{
												isCreator: data.isCreator,
												panelType: "History",
												isTransactionPending,
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
