import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Clock, TrendingUp } from "lucide-react";
import { useTimeSync } from "../../context/TimeSyncProvider";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AdminNav from "../../components/AdminNav";
import {
	convertTimestamp,
	formatCurrency,
	formatDate,
} from "../../lib/helpers";
import { fetchAllMarketAccounts } from "../../lib/program/utils";

const AdminDashboard: React.FC = () => {
	const { timeOffsetMs } = useTimeSync();
	const [markets, setMarkets] = useState<
		Awaited<ReturnType<typeof fetchAllMarketAccounts>>
	>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadMarkets = async () => {
			try {
				const data = await fetchAllMarketAccounts();
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

	const pendingMarkets = markets.filter((m) => !m.state!.isApproved);
	const unresolvedMarkets = markets.filter(
		(m) =>
			!m.state!.isResolved &&
			Date.now() > convertTimestamp(m.config.endTime, timeOffsetMs)
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
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
					<div className="relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-t-4 border-yellow-500">
						<div className="flex items-center space-x-4">
							<div className="p-3 bg-yellow-100 rounded-full">
								<Clock className="w-6 h-6 text-yellow-600" />
							</div>

							<div className="flex flex-col">
								<span className="text-4xl font-extrabold text-gray-900 leading-none">
									{pendingMarkets.length}
								</span>
								<span className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">
									Pending Approval
								</span>
							</div>
						</div>
						<div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 opacity-30 rounded-bl-full pointer-events-none"></div>
					</div>

					<div className="relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-t-4 border-green-500">
						<div className="flex items-center space-x-4">
							<div className="p-3 bg-green-100 rounded-full">
								<TrendingUp className="w-6 h-6 text-green-600" />
							</div>

							<div className="flex flex-col">
								<div className="text-4xl font-extrabold text-gray-900 leading-none">
									{unresolvedMarkets.length}
								</div>
								<div className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">
									Active Markets
								</div>
							</div>
						</div>
						<div className="absolute top-0 right-0 w-24 h-24 bg-green-50 opacity-30 rounded-bl-full pointer-events-none"></div>
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
									key={market.state?.marketConfig.toBase58()}
									to={`/admin/markets/${market.state?.marketConfig.toBase58()}`}
								>
									<div className="border border-gray-200 rounded-lg p-4 mt-5 transition-shadow hover:shadow-md">
										<h3 className="font-semibold text-gray-900 mb-2">
											{market.config.question}
										</h3>
										<p className="text-gray-600 text-sm mb-2">
											{market.config.description}
										</p>
										<div className="flex items-center space-x-4 text-sm text-gray-500">
											<span>
												Created:{" "}
												{formatDate(
													convertTimestamp(
														market.config.startTime.toNumber(),
														timeOffsetMs
													)
												)}
											</span>
											<span>
												Ends:{" "}
												{formatDate(
													convertTimestamp(
														market.config.endTime.toNumber(),
														timeOffsetMs
													)
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
							Pending Market Resolution
						</h2>
					</div>

					{unresolvedMarkets.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-500">No active markets.</p>
						</div>
					) : (
						<div className="space-y-4">
							{unresolvedMarkets.slice(0, 5).map((market) => (
								<Link
									key={market.state?.marketConfig.toBase58()}
									to={`/admin/markets/${market.state?.marketConfig.toBase58()}`}
								>
									<div className="border border-gray-200 rounded-lg p-4 mt-5 transition-shadow hover:shadow-md">
										<h3 className="font-semibold text-gray-900 mb-2">
											{market.config.question}
										</h3>
										<div className="flex items-center space-x-4 text-sm text-gray-500">
											<span>
												Pool:{" "}
												{formatCurrency(
													convertTimestamp(
														market.state!.totalPool.toNumber(),
														timeOffsetMs
													)
												)}
											</span>
											<span>
												Predictions:{" "}
												{market.state!.totalPositions.toNumber()}
											</span>
											<span>
												Ends:{" "}
												{formatDate(
													convertTimestamp(
														market.config.endTime.toNumber(),
														timeOffsetMs
													)
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
