import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "@radix-ui/themes";
import { Clock, TrendingUp, UsersRound, DollarSign } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AdminNav from "../../components/AdminNav";
import type { Market } from "../../utils/types";
import { mockApi } from "../../utils/mockApi";
import { formatCurrency, formatDate } from "../../utils/helpers";

const AdminDashboard: React.FC = () => {
	const [markets, setMarkets] = useState<Market[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadMarkets = async () => {
			try {
				const data = await mockApi.getMarkets();
				setMarkets(data);
			} catch (error) {
				console.error("Failed to load markets:", error);
				toast.error("Failed to load markets");
			} finally {
				setLoading(false);
			}
		};

		loadMarkets();
	}, []);

	const pendingMarkets = markets.filter((m) => !m.isApproved);
	const activeMarkets = markets.filter((m) => m.isApproved && !m.isResolved);
	const totalPool = markets.reduce((sum, m) => sum + m.totalPool, 0);
	const totalPredictions = markets.reduce(
		(sum, m) => sum + m.totalPositions,
		0
	);

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />
			<AdminNav />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">
						Admin Dashboard
					</h1>
					<p className="text-gray-600 mt-2">
						Manage markets and platform settings
					</p>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<div className="bg-white border border-gray-200 rounded-lg p-6">
						<div className="flex items-center">
							<Clock className="w-8 h-8 text-yellow-500" />
							<div className="ml-4">
								<div className="text-2xl font-bold text-gray-900">
									{pendingMarkets.length}
								</div>
								<div className="text-gray-600">
									Pending Approval
								</div>
							</div>
						</div>
					</div>

					<div className="bg-white border border-gray-200 rounded-lg p-6">
						<div className="flex items-center">
							<TrendingUp className="w-8 h-8 text-green-500" />
							<div className="ml-4">
								<div className="text-2xl font-bold text-gray-900">
									{activeMarkets.length}
								</div>
								<div className="text-gray-600">
									Active Markets
								</div>
							</div>
						</div>
					</div>

					<div className="bg-white border border-gray-200 rounded-lg p-6">
						<div className="flex items-center">
							<DollarSign className="w-8 h-8 text-lime-500" />
							<div className="ml-4">
								<div className="text-2xl font-bold text-gray-900">
									{formatCurrency(totalPool)}
								</div>
								<div className="text-gray-600">Total Pool</div>
							</div>
						</div>
					</div>

					<div className="bg-white border border-gray-200 rounded-lg p-6">
						<div className="flex items-center">
							<UsersRound className="w-8 h-8 text-blue-500" />
							<div className="ml-4">
								<div className="text-2xl font-bold text-gray-900">
									{totalPredictions}
								</div>
								<div className="text-gray-600">
									Total Predictions
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Pending Markets */}
				<div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-6">
						Pending Market Approvals
					</h2>

					{loading ? (
						<div className="text-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500 mx-auto"></div>
							<p className="mt-2 text-gray-600">
								Loading markets...
							</p>
						</div>
					) : pendingMarkets.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-500">
								No markets pending approval.
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{pendingMarkets.map((market) => (
								<Link
									key={market.id}
									to={`/admin/markets/${market.id}`}
								>
									<div className="border border-gray-200 rounded-lg p-4 mt-5 transition-shadow hover:shadow-md">
										<h3 className="font-semibold text-gray-900 mb-2">
											{market.question}
										</h3>
										<p className="text-gray-600 text-sm mb-2">
											{market.description}
										</p>
										<div className="flex items-center space-x-4 text-sm text-gray-500">
											<span>
												Category: {market.category}
											</span>
											<span>
												Created:{" "}
												{formatDate(
													new Date(market.startTime)
												)}
											</span>
											<span>
												Ends:{" "}
												{formatDate(
													new Date(market.endTime)
												)}
											</span>
										</div>
									</div>
								</Link>
							))}
						</div>
					)}
				</div>

				{/* Active Markets */}
				<div className="bg-white border border-gray-200 rounded-lg p-6">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold text-gray-900">
							Active Markets
						</h2>
					</div>

					{activeMarkets.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-500">No active markets.</p>
						</div>
					) : (
						<div className="space-y-4">
							{activeMarkets.slice(0, 5).map((market) => (
								<Link
									key={market.id}
									to={`/admin/markets/${market.id}`}
								>
									<div className="border border-gray-200 rounded-lg p-4 mt-5 transition-shadow hover:shadow-md">
										<h3 className="font-semibold text-gray-900 mb-2">
											{market.question}
										</h3>
										<div className="flex items-center space-x-4 text-sm text-gray-500">
											<span>
												Pool:{" "}
												{formatCurrency(
													market.totalPool
												)}
											</span>
											<span>
												Predictions:{" "}
												{market.totalPositions}
											</span>
											<span>
												Ends:{" "}
												{formatDate(
													new Date(market.endTime)
												)}
											</span>
										</div>
									</div>
								</Link>
							))}
						</div>
					)}
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default AdminDashboard;
