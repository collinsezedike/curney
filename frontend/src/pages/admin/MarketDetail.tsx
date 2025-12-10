import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Button } from "@radix-ui/themes";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AdminNav from "../../components/AdminNav";
import MarketForm from "../../components/MarketForm";
import { useSolanaWallet } from "../../hooks/useSolanaWallet";
import { mockApi } from "../../lib/mockApi";
import { formatCurrency, formatDate } from "../../lib/helpers";
import { ResolveMarketFormSchema } from "../../lib/types";
import type { Market, MarketFormData, ResolveFormData } from "../../lib/types";
import {
	approveMarket,
	dismissMarket,
	resolveMarket,
	updateMarketConfig,
} from "../../lib/program/instructions";

const mapMarketToFormData = (market: Market): MarketFormData => {
	const formatForInput = (isoString: string): string => {
		return isoString.slice(0, 16);
	};

	return {
		question: market.question,
		description: market.description,
		category: market.category,
		minPredictionPrice: market.minPredictionPrice,
		startTime: formatForInput(new Date(market.startTime).toISOString()),
		endTime: formatForInput(new Date(market.endTime).toISOString()),
	};
};

const AdminMarketDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { connect, connection, isConnected, signTransaction, userPublicKey } =
		useSolanaWallet();

	const [market, setMarket] = useState<Market | null>(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [resolving, setResolving] = useState(false);
	const [approving, setApproving] = useState(false);
	const [dismissing, setDismissing] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ResolveFormData>({
		resolver: zodResolver(ResolveMarketFormSchema),
	});

	useEffect(() => {
		const loadMarket = async () => {
			if (!id) return;

			try {
				const marketData = await mockApi.getMarket(id);
				setMarket(marketData);
			} catch (error) {
				console.error("Failed to load market:", error);
				toast.error("Failed to load market");
			} finally {
				setLoading(false);
			}
		};

		loadMarket();
	}, [id]);

	if (!id) return <Navigate to="/admin/dashboard" replace />;

	const handleResolveMarket = async (data: ResolveFormData) => {
		if (!userPublicKey || !signTransaction) return;

		setResolving(true);
		try {
			const tx = await resolveMarket(id, data.resolution, userPublicKey);
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
			toast.success("Market resolved successfully!");
		} catch (error) {
			console.error("Failed to resolve market:", error);
			toast.error("Failed to resolve market");
		} finally {
			setResolving(false);
		}
	};

	const handleUpdateMarketConfig = async (data: MarketFormData) => {
		if (!userPublicKey || !signTransaction) return;

		setUpdating(true);

		try {
			const tx = await updateMarketConfig({
				marketId: id,
				admin: userPublicKey,
				question: data.question,
				description: data.description,
				startTime: new Date(data.startTime).getTime(),
				endTime: new Date(data.endTime).getTime(),
				minPredictionPrice: data.minPredictionPrice,
			});
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
			toast.success("Market updated successfully.");
		} catch (error) {
			console.error("Failed to update market config:", error);
			toast.error("Failed to update market config");
		} finally {
			setUpdating(false);
		}
	};

	const handleApproveMarket = async () => {
		if (!userPublicKey || !signTransaction) return;

		setApproving(true);

		try {
			const tx = await approveMarket(id, userPublicKey);
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
			toast.success("Market approved successfully!");
		} catch (error) {
			console.error("Failed to approve market:", error);
			toast.error("Failed to approve market");
		} finally {
			setApproving(false);
		}
	};

	const handleDismissMarket = async () => {
		if (!userPublicKey || !signTransaction || !market) return;

		setDismissing(true);

		try {
			const tx = await dismissMarket(id, market.creator, userPublicKey);
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
			toast.success("Market dismissed successfully!");
		} catch (error) {
			console.error("Failed to dismiss market:", error);
			toast.error("Failed to dismiss market");
		} finally {
			setDismissing(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Header />
				<AdminNav />
				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500 mx-auto"></div>
						<p className="mt-2 text-gray-600">Loading market...</p>
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
				<AdminNav />
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

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />
			<AdminNav />

			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="space-y-8">
					<div className="bg-white border border-gray-200 rounded-lg p-6">
						<div className="flex justify-between items-start mb-4">
							<h2 className="text-xl font-bold text-gray-900">
								{market.question}
							</h2>
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

						<p className="text-gray-600 mb-6">
							{market.description}
						</p>

						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
							<div>
								<span className="text-gray-500">
									Total Pool
								</span>
								<div className="font-semibold text-lg">
									{formatCurrency(market.totalPool)}
								</div>
							</div>
							<div>
								<span className="text-gray-500">
									Total Bets
								</span>
								<div className="font-semibold text-lg">
									{market.totalPositions}
								</div>
							</div>
							<div>
								<span className="text-gray-500">Category</span>
								<div className="font-semibold text-lg capitalize">
									{market.category}
								</div>
							</div>
							<div>
								<span className="text-gray-500">End Time</span>
								<div className="font-semibold text-lg">
									{formatDate(market.endTime)}
								</div>
							</div>
						</div>

						{!market.isApproved && (
							<div className="mt-4 pt-6">
								<div className="flex justify-between items-center gap-4">
									<Button
										type="button"
										onClick={handleApproveMarket}
										disabled={
											updating || approving || dismissing
										}
										className="flex-1 bg-lime-500 hover:bg-lime-600 text-white px-8 py-7 text-lg cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-80"
									>
										{approving
											? "Approving..."
											: "Approve Market"}
									</Button>

									<Button
										variant="soft"
										onClick={handleDismissMarket}
										disabled={
											updating || approving || dismissing
										}
										className="flex-1 bg-lime-100 hover:bg-lime-200 text-lime-900 px-8 py-7 text-lg cursor-pointer disabled:bg-gray-400 disabled:text-white disabled:cursor-not-allowed disabled:opacity-80"
									>
										{dismissing
											? "Dismissing..."
											: "Dismiss Market"}
									</Button>
								</div>
							</div>
						)}

						{market.isResolved &&
							market.resolution !== undefined && (
								<div className="mt-6 p-4 bg-blue-50 rounded-lg">
									<h3 className="font-semibold text-blue-900 mb-2">
										Resolution
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

					{!market.isApproved && (
						<div className="bg-white border border-gray-200 rounded-lg p-6">
							<h2 className="text-xl font-bold text-gray-900 mb-4">
								Update Market Config
							</h2>
							<p className="text-gray-600 mb-6">
								Edit the market config before approval.
							</p>

							<MarketForm
								onSubmit={handleUpdateMarketConfig}
								isLoading={updating}
								isProposing={false}
								defaultValues={mapMarketToFormData(market)}
							/>
						</div>
					)}

					{market.isApproved &&
						!market.isResolved &&
						new Date() >= new Date(market.endTime) && (
							<div className="bg-white border border-gray-200 rounded-lg p-6">
								<h2 className="text-xl font-bold text-gray-900 mb-4">
									Resolve Market
								</h2>
								<p className="text-gray-600 mb-6">
									This market has ended and is ready for
									resolution. Enter the final numeric value.
								</p>

								<form
									onSubmit={handleSubmit(handleResolveMarket)}
								>
									<div className="mb-4">
										<label
											htmlFor="resolution"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											Final Value
										</label>
										<input
											{...register("resolution", {
												valueAsNumber: true,
											})}
											type="number"
											id="resolution"
											step="0.01"
											placeholder="Enter the final numeric result"
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
										/>
										{errors.resolution && (
											<p className="mt-1 text-sm text-red-600">
												{errors.resolution.message}
											</p>
										)}
									</div>

									<Button
										type="submit"
										disabled={resolving}
										className="cursor-pointer py-6 px-9 bg-lime-500 hover:bg-lime-600 text-white w-full disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-80"
									>
										{resolving
											? "Resolving..."
											: "Resolve Market"}
									</Button>
								</form>
							</div>
						)}
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default AdminMarketDetail;
