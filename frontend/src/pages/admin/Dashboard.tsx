import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "@radix-ui/themes";
import {
	CheckCircle,
	Clock,
	TrendingUp,
	Users,
	DollarSign,
} from "lucide-react";
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

	const handleApproveMarket = async (marketId: string) => {
		try {
			const updatedMarket = await mockApi.approveMarket(marketId);
			if (updatedMarket) {
				setMarkets((prev) =>
					prev.map((m) => (m.id === marketId ? updatedMarket : m))
				);
				toast.success("Market approved successfully!");
			}
		} catch (error) {
			console.error("Failed to approve market:", error);
			toast.error("Failed to approve market");
		}
	};

	const pendingMarkets = markets.filter((m) => m.status === "pending");
	const activeMarkets = markets.filter((m) => m.status === "open");
	const totalPool = markets.reduce((sum, m) => sum + m.totalPool, 0);
	const totalBets = markets.reduce((sum, m) => sum + m.totalBets, 0);

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
							<Users className="w-8 h-8 text-blue-500" />
							<div className="ml-4">
								<div className="text-2xl font-bold text-gray-900">
									{totalBets}
								</div>
								<div className="text-gray-600">Total Bets</div>
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
								<div
									key={market.id}
									className="border border-gray-200 rounded-lg p-4"
								>
									<div className="flex justify-between items-start mb-3">
										<div className="flex-1">
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
														market.createdAt
													)}
												</span>
												<span>
													Ends:{" "}
													{formatDate(market.endTime)}
												</span>
											</div>
										</div>
										<Button
											onClick={() =>
												handleApproveMarket(market.id)
											}
											className="bg-lime-500 hover:bg-lime-600 text-white ml-4"
										>
											<CheckCircle className="w-4 h-4 mr-2" />
											Approve
										</Button>
									</div>
								</div>
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
						<Link
							to="/admin/markets"
							className="text-lime-600 hover:text-lime-700 font-medium"
						>
							View All
						</Link>
					</div>

					{activeMarkets.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-500">No active markets.</p>
						</div>
					) : (
						<div className="space-y-4">
							{activeMarkets.slice(0, 5).map((market) => (
								<div
									key={market.id}
									className="border border-gray-200 rounded-lg p-4"
								>
									<div className="flex justify-between items-start">
										<div className="flex-1">
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
													Bets: {market.totalBets}
												</span>
												<span>
													Ends:{" "}
													{formatDate(market.endTime)}
												</span>
											</div>
										</div>
										<Link
											to={`/admin/markets/${market.id}`}
											className="text-lime-600 hover:text-lime-700 font-medium ml-4"
										>
											Manage
										</Link>
									</div>
								</div>
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
