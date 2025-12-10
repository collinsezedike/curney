import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PredictionForm from "../components/PredictionForm";
import PayoutGraph from "../components/PayoutGraph";
import Timer from "../components/Timer";
import WalletGate from "../components/WalletGate";
import type { Market as MarketType, Position } from "../lib/types";
import { mockApi } from "../lib/mockApi";
import { useSolanaWallet } from "../hooks/useSolanaWallet";
import { formatCurrency, formatDate } from "../lib/helpers";
import { placePrediction } from "../lib/program/instructions";
import PredictionSpreadGraph from "../components/PredictionSpreadGraph";

const Market: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { connect, connection, isConnected, signTransaction, userPublicKey } =
		useSolanaWallet();
	const [market, setMarket] = useState<MarketType | null>(null);
	const [userPredictions, setUserPredictions] = useState<Position[]>([]);
	const [loading, setLoading] = useState(true);
	const [placing, setPlacing] = useState(false);

	useEffect(() => {
		const loadMarket = async () => {
			if (!id) return;
			try {
				const marketData = await mockApi.getMarket(id);
				setMarket(marketData);

				if (userPublicKey) {
					const predictions = await mockApi.getUserBets(
						userPublicKey.toBase58()
					);
					setUserPredictions(
						predictions.filter((b) => b.market === id)
					);
				}
			} catch (error) {
				console.error("Failed to load market:", error);
				toast.error("Failed to load market");
			} finally {
				setLoading(false);
			}
		};

		loadMarket();
	}, [id, userPublicKey]);

	const handlePlacePrediction = async (data: {
		prediction: number;
		stake: number;
	}) => {
		if (!market || !userPublicKey || !signTransaction) return;

		setPlacing(true);

		try {
			const tx = await placePrediction(
				market.id,
				data.prediction,
				data.stake,
				market.totalPositions,
				userPublicKey
			);
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

			toast.success("Prediction placed successfully!");
		} catch (error) {
			console.error("Failed to place prediction:", error);
			toast.error("Failed to place prediction");
		} finally {
			setPlacing(false);
		}
	};

	if (!id) return <Navigate to="/" replace />;

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Header />
				<main className="max-w-7xl mx-auto px-4 py-20 text-center">
					<div className="animate-spin h-12 w-12 border-b-2 border-lime-500 mx-auto rounded-full" />
					<p className="mt-4 text-gray-600">Loading market...</p>
				</main>
				<Footer />
			</div>
		);
	}

	if (!market) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Header />
				<main className="max-w-7xl mx-auto px-4 py-20 text-center">
					<h1 className="text-3xl font-semibold text-gray-900 mb-4">
						Market Not Found
					</h1>
					<p className="text-gray-600">
						The market you're looking for doesn't exist.
					</p>
				</main>
				<Footer />
			</div>
		);
	}

	const canBet = market.isApproved && new Date() < new Date(market.endTime);

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />

			<main className="max-w-7xl mx-auto px-4 py-10">
				<h1 className="text-3xl font-semibold text-gray-900 mb-2 leading-tight">
					{market.question}
				</h1>

				<div className="flex items-center gap-3 text-gray-500 text-sm mb-10">
					<span className="capitalize">{market.category}</span>
					<span>•</span>
					<span>
						Ends:{" "}
						<Timer
							endTime={new Date(market.endTime)}
							className="text-lg"
						/>
					</span>
					<span
						className={`flex capitalize items-center gap-1 ${
							market.isResolved
								? "text-red-400"
								: market.isApproved
								? "text-green-400"
								: "text-amber-400"
						}`}
					>
						<span
							className={`w-2 h-2 rounded-full ${
								market.isResolved
									? "bg-red-400"
									: market.isApproved
									? "bg-green-400"
									: "bg-amber-400"
							}`}
						></span>
						{market.isResolved
							? "Resolved"
							: market.isApproved
							? "Live"
							: "Pending"}
					</span>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
					<div className="lg:col-span-2 space-y-10 order-1 lg:order-1">
						{market.isResolved && (
							<PayoutGraph className="w-full" />
						)}

						<PredictionSpreadGraph
							predictions={[120, 132, 121, 140, 118, 122]}
						/>

						<div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
							<div className="grid grid-cols-3 gap-6 text-sm">
								<div>
									<p className="text-gray-500">Pool</p>
									<p className="text-gray-900 font-medium">
										{formatCurrency(market.totalPool)}
									</p>
								</div>
								<div>
									<p className="text-gray-500">Predictions</p>
									<p className="text-gray-900 font-medium">
										{market.totalPositions}
									</p>
								</div>
								<div>
									<p className="text-gray-500">End Time</p>
									<p className="text-gray-900 font-medium">
										{formatDate(market.endTime)}
									</p>
								</div>
							</div>

							{market.isResolved &&
								market.resolution !== undefined && (
									<div className="mt-6 p-4 bg-blue-50 rounded-lg">
										<h3 className="font-medium text-blue-900 mb-1">
											Final Result
										</h3>
										<p className="text-blue-800">
											Final value:{" "}
											<span className="font-bold">
												{market.resolution}
											</span>
										</p>
									</div>
								)}
						</div>

						{userPredictions.length > 0 && (
							<div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">
									Your Predictions
								</h3>

								<div className="divide-y divide-gray-100">
									{userPredictions.map((prediction) => (
										<div
											key={prediction.id}
											className="py-3 flex justify-between"
										>
											<div>
												<p className="font-medium">
													{prediction.prediction}
												</p>
												<p className="text-sm text-gray-500">
													Stake:{" "}
													{formatCurrency(
														prediction.stake
													)}{" "}
													•{" "}
													{formatDate(
														prediction.timestamp
													)}
												</p>
											</div>

											{prediction.reward && (
												<div className="text-right">
													<p className="font-medium text-lime-600">
														{formatCurrency(
															prediction.reward
														)}
													</p>
													{!prediction.claimed && (
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

					<div className="lg:col-span-1 order-2 lg:order-2">
						<div className="sticky top-24">
							{canBet ? (
								<WalletGate
									isConnected={isConnected}
									onConnect={connect}
								>
									<PredictionForm
										market={market}
										onSubmit={handlePlacePrediction}
										isLoading={placing}
									/>
								</WalletGate>
							) : (
								<div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-2">
										{market.isResolved
											? "Market Resolved"
											: "Betting Closed"}
									</h3>
									<p className="text-gray-600">
										{market.isResolved
											? "This market has been resolved. Check your profile for rewards."
											: "Betting is no longer available for this market."}
									</p>
								</div>
							)}
						</div>
					</div>

					<div className="lg:col-span-2 order-3 lg:order-3">
						<div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Rules
							</h3>
							<p className="text-gray-700 leading-relaxed">
								{market.description}
							</p>
						</div>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default Market;
