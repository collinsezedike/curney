import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BetForm from "../components/BetForm";
import PayoutGraph from "../components/PayoutGraph";
import Timer from "../components/Timer";
import WalletGate from "../components/WalletGate";
import type { Market as MarketType, Bet } from "../utils/types";
import { mockApi } from "../utils/mockApi";
import { useWallet } from "../utils/wallet";
import { formatCurrency, formatDate } from "../utils/helpers";

const Market: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { isConnected, connect, publicKey } = useWallet();
	const [market, setMarket] = useState<MarketType | null>(null);
	const [userBets, setUserBets] = useState<Bet[]>([]);
	const [loading, setLoading] = useState(true);
	const [placing, setPlacing] = useState(false);

	useEffect(() => {
		const loadMarket = async () => {
			if (!id) return;

			try {
				const marketData = await mockApi.getMarket(id);
				setMarket(marketData);

				if (publicKey) {
					const bets = await mockApi.getUserBets(publicKey);
					setUserBets(bets.filter((b) => b.marketId === id));
				}
			} catch (error) {
				console.error("Failed to load market:", error);
				toast.error("Failed to load market");
			} finally {
				setLoading(false);
			}
		};

		loadMarket();
	}, [id, publicKey]);

	const handlePlaceBet = async (data: {
		prediction: number;
		stake: number;
	}) => {
		if (!market || !publicKey) return;

		setPlacing(true);
		try {
			const bet = await mockApi.placeBet(
				market.id,
				publicKey,
				data.prediction,
				data.stake
			);
			setUserBets((prev) => [...prev, bet]);

			// Update market totals
			setMarket((prev) =>
				prev
					? {
							...prev,
							totalPool: prev.totalPool + data.stake,
							totalBets: prev.totalBets + 1,
					  }
					: null
			);

			toast.success("Bet placed successfully!");
		} catch (error) {
			console.error("Failed to place bet:", error);
			toast.error("Failed to place bet");
		} finally {
			setPlacing(false);
		}
	};

	if (!id) {
		return <Navigate to="/" replace />;
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Header />
				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto"></div>
						<p className="mt-4 text-gray-600">Loading market...</p>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	if (!market) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Header />
				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="text-center py-12">
						<h1 className="text-2xl font-bold text-gray-900 mb-4">
							Market Not Found
						</h1>
						<p className="text-gray-600">
							The market you're looking for doesn't exist.
						</p>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	const canBet =
		market.status === "open" && new Date() < new Date(market.endTime);

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2">
						{/* Market Header */}
						<div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
							<div className="flex justify-between items-start mb-4">
								<h1 className="text-2xl font-bold text-gray-900">
									{market.question}
								</h1>
								<span
									className={`px-3 py-1 rounded-full text-sm font-medium ${
										market.status === "open"
											? "bg-green-100 text-green-800"
											: market.status === "closed"
											? "bg-yellow-100 text-yellow-800"
											: market.status === "resolved"
											? "bg-blue-100 text-blue-800"
											: "bg-gray-100 text-gray-800"
									}`}
								>
									{market.status}
								</span>
							</div>

							<p className="text-gray-600 mb-6">
								{market.description}
							</p>

							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
								<div>
									<span className="text-gray-500">
										Total Pool
									</span>
									<div className="font-semibold">
										{formatCurrency(market.totalPool)}
									</div>
								</div>
								<div>
									<span className="text-gray-500">
										Predictions
									</span>
									<div className="font-semibold">
										{market.totalBets}
									</div>
								</div>
								<div>
									<span className="text-gray-500">
										Category
									</span>
									<div className="font-semibold capitalize">
										{market.category}
									</div>
								</div>
								<div>
									<span className="text-gray-500">
										End Time
									</span>
									<div className="font-semibold">
										{formatDate(market.endTime)}
									</div>
								</div>
							</div>

							{canBet && (
								<div className="mt-6">
									<Timer
										endTime={market.endTime}
										className="text-lg"
									/>
								</div>
							)}

							{market.status === "resolved" &&
								market.finalValue !== undefined && (
									<div className="mt-6 p-4 bg-blue-50 rounded-lg">
										<h3 className="font-semibold text-blue-900 mb-2">
											Final Result
										</h3>
										<p className="text-blue-800">
											Final value:{" "}
											<span className="font-bold">
												{market.finalValue}
											</span>
										</p>
									</div>
								)}
						</div>

						{/* Payout Graph */}
						<PayoutGraph className="mb-6" />

						{/* User Bets */}
						{userBets.length > 0 && (
							<div className="bg-white border border-gray-200 rounded-lg p-6">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">
									Your Predictions
								</h3>
								<div className="space-y-3">
									{userBets.map((bet) => (
										<div
											key={bet.id}
											className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
										>
											<div>
												<div className="font-medium">
													Prediction: {bet.prediction}
												</div>
												<div className="text-sm text-gray-600">
													Stake:{" "}
													{formatCurrency(bet.stake)}{" "}
													•{" "}
													{formatDate(bet.timestamp)}
												</div>
											</div>
											{bet.payout && (
												<div className="text-right">
													<div className="font-medium text-lime-600">
														{formatCurrency(
															bet.payout
														)}
													</div>
													{!bet.claimed && (
														<button className="text-sm text-lime-600 hover:text-lime-700">
															Claim
														</button>
													)}
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					<div className="lg:col-span-1">
						{canBet ? (
							<WalletGate
								isConnected={isConnected}
								onConnect={connect}
							>
								<BetForm
									market={market}
									onSubmit={handlePlaceBet}
									isLoading={placing}
								/>
							</WalletGate>
						) : (
							<div className="bg-white border border-gray-200 rounded-lg p-6">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">
									{market.status === "resolved"
										? "Market Resolved"
										: "Betting Closed"}
								</h3>
								<p className="text-gray-600">
									{market.status === "resolved"
										? "This market has been resolved. Check your profile for any rewards."
										: "Betting is no longer available for this market."}
								</p>
							</div>
						)}
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default Market;
