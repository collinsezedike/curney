import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WalletGate from "../components/WalletGate";
import type { Position, Market } from "../utils/types";
import { mockApi } from "../utils/mockApi";
import { useSolanaWallet } from "../hooks/useSolanaWallet";
import { formatCurrency, formatDate, truncateAddress } from "../utils/helpers";

const Profile: React.FC = () => {
	const { isConnected, connect, userPublicKey } = useSolanaWallet();
	const [predictions, setPredictions] = useState<Position[]>([]);
	const [markets, setMarkets] = useState<Market[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadUserData = async () => {
			if (!userPublicKey) return;

			try {
				const [userPredictions, allMarkets] = await Promise.all([
					mockApi.getUserBets(userPublicKey.toBase58()),
					mockApi.getMarkets(),
				]);

				const alteredMarkets = allMarkets.map((m) => {
					if (m.id == "2") {
						m.resolution = 140;
						m.isResolved = true;
					}
					return m;
				});

				const alteredPredictions = userPredictions.map((b) => {
					if (b.market == "2") {
						b.reward = 130;
					}
					return b;
				});

				// setBets(userBets);
				// setMarkets(allMarkets);
				setPredictions(alteredPredictions);
				setMarkets(alteredMarkets);
			} catch (error) {
				console.error("Failed to load user data:", error);
				toast.error("Failed to load profile data");
			} finally {
				setLoading(false);
			}
		};

		if (isConnected) {
			loadUserData();
		}
	}, [userPublicKey, isConnected]);

	const handleClaimReward = async (betId: string) => {
		try {
			const reward = await mockApi.claimReward(betId);
			if (reward > 0) {
				setPredictions((prev) =>
					prev.map((prediction) =>
						prediction.id === betId
							? { ...prediction, claimed: true }
							: prediction
					)
				);
				toast.success(`Claimed ${formatCurrency(reward)}!`);
			}
		} catch (error) {
			console.error("Failed to claim reward:", error);
			toast.error("Failed to claim reward");
		}
	};

	const totalStaked = predictions.reduce(
		(sum, prediction) => sum + prediction.stake,
		0
	);
	const totalWinnings = predictions.reduce(
		(sum, prediction) => sum + (prediction.reward || 0),
		0
	);
	const activePredictions = predictions.filter((prediction) => {
		const market = markets.find((m) => m.id === prediction.market);
		return market && market.isApproved;
	}).length;

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<WalletGate isConnected={isConnected} onConnect={connect}>
					<div className="space-y-8">
						{/* Profile Header */}
						<div className="bg-white border border-gray-200 rounded-lg p-6">
							<h1 className="text-3xl font-bold text-gray-900 mb-4">
								Profile
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
								<div>
									<span className="text-gray-500 text-sm">
										Total Staked
									</span>
									<div className="font-semibold text-lg">
										{formatCurrency(totalStaked)}
									</div>
								</div>
								<div>
									<span className="text-gray-500 text-sm">
										Total Winnings
									</span>
									<div className="font-semibold text-lg text-lime-600">
										{formatCurrency(totalWinnings)}
									</div>
								</div>
								<div>
									<span className="text-gray-500 text-sm">
										Active Bets
									</span>
									<div className="font-semibold text-lg">
										{activePredictions}
									</div>
								</div>
							</div>
						</div>

						{/* Betting History */}
						<div className="bg-white border border-gray-200 rounded-lg p-6">
							<h2 className="text-2xl font-bold text-gray-900 mb-6">
								Betting History
							</h2>

							{loading ? (
								<div className="text-center py-8">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500 mx-auto"></div>
									<p className="mt-2 text-gray-600">
										Loading bets...
									</p>
								</div>
							) : predictions.length === 0 ? (
								<div className="text-center py-8">
									<p className="text-gray-500">
										No bets placed yet.
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{predictions.map((p) => {
										const market = markets.find(
											(m) => m.id === p.market
										);
										if (!market) return null;

										return (
											<div
												key={p.id}
												className="border border-gray-200 rounded-lg p-4"
											>
												<div className="flex justify-between items-start mb-2">
													<h3 className="font-medium text-gray-900 line-clamp-1">
														{market.question}
													</h3>
												</div>

												<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
													<div>
														<span className="text-gray-500">
															Prediction
														</span>
														<div className="font-medium">
															{p.prediction}
														</div>
													</div>
													<div>
														<span className="text-gray-500">
															Stake
														</span>
														<div className="font-medium">
															{formatCurrency(
																p.stake
															)}
														</div>
													</div>
													<div>
														<span className="text-gray-500">
															Date
														</span>
														<div className="font-medium">
															{formatDate(
																p.timestamp
															)}
														</div>
													</div>
													<div>
														<span className="text-gray-500">
															Status
														</span>
														<div className="font-medium">
															{p.reward
																? p.claimed
																	? "Claimed"
																	: "Claimable"
																: "Pending"}
														</div>
													</div>
												</div>

												{market.isResolved &&
													market.resolution !==
														undefined && (
														<div className="bg-gray-50 p-3 rounded-lg mb-3">
															<div className="text-sm text-gray-600">
																Final Result:{" "}
																<span className="font-medium">
																	{
																		market.resolution
																	}
																</span>
															</div>
														</div>
													)}

												{p.reward && !p.claimed && (
													<div className="flex justify-between items-center">
														<div className="text-lime-600 font-medium">
															Reward:{" "}
															{formatCurrency(
																p.reward
															)}
														</div>
														<button
															onClick={() =>
																handleClaimReward(
																	p.id
																)
															}
															className="bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
														>
															Claim Reward
														</button>
													</div>
												)}
											</div>
										);
									})}
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
