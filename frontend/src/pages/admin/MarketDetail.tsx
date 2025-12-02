import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { Button } from "@radix-ui/themes";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AdminNav from "../../components/AdminNav";
import type { Market } from "../../utils/types";
import { mockApi } from "../../utils/mockApi";
import { formatCurrency, formatDate } from "../../utils/helpers";

const resolveSchema = z.object({
	finalValue: z.number().min(0, "Final value must be positive"),
});

type ResolveFormData = z.infer<typeof resolveSchema>;

const AdminMarketDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [market, setMarket] = useState<Market | null>(null);
	const [loading, setLoading] = useState(true);
	const [resolving, setResolving] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ResolveFormData>({
		resolver: zodResolver(resolveSchema),
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

	const handleResolve = async (data: ResolveFormData) => {
		if (!market) return;

		setResolving(true);
		try {
			const resolvedMarket = await mockApi.resolveMarket(
				market.id,
				data.finalValue
			);
			if (resolvedMarket) {
				setMarket(resolvedMarket);
				toast.success("Market resolved successfully!");
			}
		} catch (error) {
			console.error("Failed to resolve market:", error);
			toast.error("Failed to resolve market");
		} finally {
			setResolving(false);
		}
	};

	if (!id) {
		return <Navigate to="/admin/dashboard" replace />;
	}

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
					{/* Market Details */}
					<div className="bg-white border border-gray-200 rounded-lg p-6">
						<div className="flex justify-between items-start mb-4">
							<h2 className="text-xl font-bold text-gray-900">
								{market.question}
							</h2>
							<span
								className={`flex capitalize items-center gap-1 ${
									market.status == "open"
										? "text-green-400"
										: market.status == "pending"
										? "text-amber-400"
										: "text-red-400"
								}`}
							>
								<span
									className={`w-2 h-2 rounded-full ${
										market.status == "open"
											? "bg-green-400"
											: market.status == "pending"
											? "bg-amber-400"
											: "bg-red-400"
									}`}
								></span>
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
								<div className="font-semibold text-lg">
									{formatCurrency(market.totalPool)}
								</div>
							</div>
							<div>
								<span className="text-gray-500">
									Total Bets
								</span>
								<div className="font-semibold text-lg">
									{market.totalBets}
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

						{market.status === "resolved" &&
							market.finalValue !== undefined && (
								<div className="mt-6 p-4 bg-blue-50 rounded-lg">
									<h3 className="font-semibold text-blue-900 mb-2">
										Resolution
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

					{/* Resolution Form */}
					{market.status === "open" &&
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
									onSubmit={handleSubmit(handleResolve)}
									className="max-w-md"
								>
									<div className="mb-4">
										<label
											htmlFor="finalValue"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											Final Value
										</label>
										<input
											{...register("finalValue", {
												valueAsNumber: true,
											})}
											type="number"
											id="finalValue"
											step="0.01"
											placeholder="Enter the final numeric result"
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
										/>
										{errors.finalValue && (
											<p className="mt-1 text-sm text-red-600">
												{errors.finalValue.message}
											</p>
										)}
									</div>

									<Button
										type="submit"
										disabled={resolving}
										className="cursor-pointer py-6 px-9 bg-lime-500 hover:bg-lime-600 text-white"
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
