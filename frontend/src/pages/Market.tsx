import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PredictionForm from "../components/PredictionForm";
import PayoutGraph from "../components/PayoutGraph";
import Timer from "../components/Timer";
import WalletGate from "../components/WalletGate";
import { useSolanaWallet } from "../hooks/useSolanaWallet";
import { convertTimestamp, formatCurrency, formatDate } from "../lib/helpers";
import { placePrediction } from "../lib/program/instructions";
import PredictionSpreadGraph from "../components/PredictionSpreadGraph";
import {
	fetchAllUserPositionAccountsByMarket,
	fetchMarketAccount,
} from "../lib/program/utils";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useTimeSync } from "../context/TimeSyncProvider";

const Market: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { timeOffsetMs } = useTimeSync();
	const { connect, connection, isConnected, signTransaction, userPublicKey } =
		useSolanaWallet();
	const [market, setMarket] =
		useState<Awaited<ReturnType<typeof fetchMarketAccount>>>(null);
	const [userPredictions, setUserPredictions] = useState<
		Awaited<ReturnType<typeof fetchAllUserPositionAccountsByMarket>>
	>([]);
	const [loading, setLoading] = useState(true);
	const [placing, setPlacing] = useState(false);

	useEffect(() => {
		const loadMarket = async () => {
			if (!id) return;
			try {
				setMarket(await fetchMarketAccount(id));

				if (userPublicKey) {
					const predictions =
						await fetchAllUserPositionAccountsByMarket(
							userPublicKey.toBase58(),
							id
						);
					setUserPredictions(predictions);
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
				market.state.marketConfig.toBase58(),
				data.prediction,
				data.stake,
				market.state.totalPositions.toNumber(),
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

	const canBet =
		market.state.isApproved &&
		new Date() >=
			new Date(
				convertTimestamp(
					market.config.startTime.toNumber(),
					timeOffsetMs
				)
			) &&
		new Date() <
			new Date(
				convertTimestamp(market.config.endTime.toNumber(), timeOffsetMs)
			);

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />

			<main className="max-w-7xl mx-auto px-4 py-10">
				<h1 className="text-3xl font-semibold text-gray-900 mb-2 leading-tight">
					{market.config.question}
				</h1>

				<div className="flex items-center gap-3 text-gray-500 text-sm mb-10">
					{new Date() <
					new Date(
						convertTimestamp(
							market.config.startTime.toNumber(),
							timeOffsetMs
						)
					) ? (
						<span>
							Starts:{" "}
							<Timer
								endTime={
									new Date(
										convertTimestamp(
											market.config.startTime.toNumber(),
											timeOffsetMs
										)
									)
								}
								className="text-lg"
							/>
						</span>
					) : (
						<span>
							Ends:{" "}
							<Timer
								endTime={
									new Date(
										convertTimestamp(
											market.config.endTime.toNumber(),
											timeOffsetMs
										)
									)
								}
								className="text-lg"
							/>
						</span>
					)}
					<span>•</span>
					<span
						className={`flex capitalize items-center gap-1 ${
							market.state.isResolved
								? "text-red-400"
								: new Date() <
										new Date(
											convertTimestamp(
												market.config.endTime.toNumber(),
												timeOffsetMs
											)
										) &&
								  new Date() >=
										new Date(
											convertTimestamp(
												market.config.startTime.toNumber(),
												timeOffsetMs
											)
										) &&
								  market.state.isApproved
								? "text-green-400"
								: "text-amber-400"
						}`}
					>
						<span
							className={`w-2 h-2 rounded-full ${
								market.state.isResolved
									? "bg-red-400"
									: new Date() <
											new Date(
												convertTimestamp(
													market.config.endTime.toNumber(),
													timeOffsetMs
												)
											) &&
									  new Date() >=
											new Date(
												convertTimestamp(
													market.config.startTime.toNumber(),
													timeOffsetMs
												)
											) &&
									  market.state.isApproved
									? "bg-green-400"
									: "bg-amber-400"
							}`}
						></span>
						{market.state.isResolved
							? "Resolved"
							: new Date() <
									new Date(
										convertTimestamp(
											market.config.endTime.toNumber(),
											timeOffsetMs
										)
									) &&
							  new Date() >=
									new Date(
										convertTimestamp(
											market.config.startTime.toNumber(),
											timeOffsetMs
										)
									) &&
							  market.state.isApproved
							? "Live"
							: new Date() <=
							  new Date(
									convertTimestamp(
										market.config.startTime.toNumber(),
										timeOffsetMs
									)
							  )
							? "Yet to Start"
							: "Pending Resolution"}
					</span>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
					<div className="lg:col-span-2 space-y-10 order-1 lg:order-1">
						{market.state.isResolved && (
							<PayoutGraph className="w-full" />
						)}

						<PredictionSpreadGraph
							predictions={[120, 132, 121, 140, 118, 122]}
						/>

						<div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
							<div className="grid grid-cols-4 gap-6 text-sm md:text-center">
								<div>
									<p className="text-gray-500">Pool</p>
									<p className="text-gray-900 font-medium">
										{formatCurrency(
											market.state.totalPool.toNumber() /
												LAMPORTS_PER_SOL
										)}
									</p>
								</div>
								<div>
									<p className="text-gray-500">Predictions</p>
									<p className="text-gray-900 font-medium">
										{market.state.totalPositions.toNumber()}
									</p>
								</div>
								<div>
									<p className="text-gray-500">End Time</p>
									<p className="text-gray-900 font-medium">
										{formatDate(
											convertTimestamp(
												market.config.endTime.toNumber(),
												timeOffsetMs
											)
										)}
									</p>
								</div>
								<div>
									<p>Resolution</p>
									<p
										className={`font-medium ${
											market.state.isResolved
												? "text-lime-500"
												: "text-amber-500"
										}`}
									>
										{market.state.resolution?.toNumber() ||
											"Pending"}
									</p>
								</div>
							</div>
						</div>

						{userPredictions.length > 0 && (
							<div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">
									Your Predictions
								</h3>

								<div className="divide-y divide-gray-100">
									{userPredictions.map((prediction) => (
										<div
											key={prediction.publicKey.toBase58()}
											className="py-3 flex justify-between"
										>
											<div>
												<p className="font-medium">
													{prediction.account.prediction.toNumber()}
												</p>
												<p className="text-sm text-gray-500">
													Stake:{" "}
													{formatCurrency(
														prediction.account.stake.toNumber() /
															LAMPORTS_PER_SOL
													)}{" "}
													•{" "}
													{formatDate(
														prediction.account.timestamp.toNumber()
													)}
												</p>
											</div>

											{prediction.account.reward && (
												<div className="text-right">
													<p className="font-medium text-lime-600">
														{formatCurrency(
															prediction.account.reward?.toNumber()
														)}
													</p>
													{!prediction.account
														.claimed && (
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
										onSubmit={handlePlacePrediction}
										isLoading={placing}
									/>
								</WalletGate>
							) : (
								<div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-2">
										{market.state.isResolved
											? "Market Resolved"
											: new Date() >=
											  new Date(
													convertTimestamp(
														market.config.startTime.toNumber(),
														timeOffsetMs
													)
											  )
											? "Market Closed"
											: "Market Not Started"}
									</h3>
									<p className="text-gray-600">
										{market.state.isResolved
											? "This market has been resolved. Check your profile for rewards."
											: new Date() >=
											  new Date(
													convertTimestamp(
														market.config.startTime.toNumber(),
														timeOffsetMs
													)
											  )
											? "Market is no longer open for predictions"
											: "Market will open once the start time is reached"}
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
								{market.config.description}
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
