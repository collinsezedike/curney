import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WalletGate from "../components/WalletGate";
import type { Bet, Market } from "../utils/types";
import { mockApi } from "../utils/mockApi";
import { useSolanaWallet } from "../hooks/useSolanaWallet";
import { formatCurrency, formatDate, truncateAddress } from "../utils/helpers";

const Profile: React.FC = () => {
	const { isConnected, connect, publicKey } = useSolanaWallet();
	const [bets, setBets] = useState<Bet[]>([]);
	const [markets, setMarkets] = useState<Market[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadUserData = async () => {
			if (!publicKey) return;

			try {
				const [userBets, allMarkets] = await Promise.all([
					mockApi.getUserBets(publicKey.toBase58()),
					mockApi.getMarkets(),
				]);

				const alteredMarkets = allMarkets.map((m) => {
					if (m.id == "2") {
						m.finalValue = 140;
						m.status = "resolved";
					}
					return m;
				});

				const alteredBets = userBets.map((b) => {
					if (b.marketId == "2") {
						b.payout = 130;
					}
					return b;
				});

				// setBets(userBets);
				// setMarkets(allMarkets);
				setBets(alteredBets);
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
	}, [publicKey, isConnected]);

	const handleClaimReward = async (betId: string) => {
		try {
			const reward = await mockApi.claimReward(betId);
			if (reward > 0) {
				setBets((prev) =>
					prev.map((bet) =>
						bet.id === betId ? { ...bet, claimed: true } : bet
					)
				);
				toast.success(`Claimed ${formatCurrency(reward)}!`);
			}
		} catch (error) {
			console.error("Failed to claim reward:", error);
			toast.error("Failed to claim reward");
		}
	};

	const totalStaked = bets.reduce((sum, bet) => sum + bet.stake, 0);
	const totalWinnings = bets.reduce((sum, bet) => sum + (bet.payout || 0), 0);
	const activeBets = bets.filter((bet) => {
		const market = markets.find((m) => m.id === bet.marketId);
		return market && market.status === "open";
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
											publicKey?.toBase58() || "",
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
										{activeBets}
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
							) : bets.length === 0 ? (
								<div className="text-center py-8">
									<p className="text-gray-500">
										No bets placed yet.
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{bets.map((bet) => {
										const market = markets.find(
											(m) => m.id === bet.marketId
										);
										if (!market) return null;

										return (
											<div
												key={bet.id}
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
															{bet.prediction}
														</div>
													</div>
													<div>
														<span className="text-gray-500">
															Stake
														</span>
														<div className="font-medium">
															{formatCurrency(
																bet.stake
															)}
														</div>
													</div>
													<div>
														<span className="text-gray-500">
															Date
														</span>
														<div className="font-medium">
															{formatDate(
																bet.timestamp
															)}
														</div>
													</div>
													<div>
														<span className="text-gray-500">
															Status
														</span>
														<div className="font-medium">
															{bet.payout
																? bet.claimed
																	? "Claimed"
																	: "Claimable"
																: "Pending"}
														</div>
													</div>
												</div>

												{market.status === "resolved" &&
													market.finalValue !==
														undefined && (
														<div className="bg-gray-50 p-3 rounded-lg mb-3">
															<div className="text-sm text-gray-600">
																Final Result:{" "}
																<span className="font-medium">
																	{
																		market.finalValue
																	}
																</span>
															</div>
														</div>
													)}

												{bet.payout && !bet.claimed && (
													<div className="flex justify-between items-center">
														<div className="text-lime-600 font-medium">
															Reward:{" "}
															{formatCurrency(
																bet.payout
															)}
														</div>
														<button
															onClick={() =>
																handleClaimReward(
																	bet.id
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
