import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@radix-ui/themes";
import { Plus, TrendingUp, Users, DollarSign } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MarketList from "../components/MarketList";
import type { Market } from "../utils/types";
import { mockApi } from "../utils/mockApi";
import { formatCurrency } from "../utils/helpers";

const Home: React.FC = () => {
	const [markets, setMarkets] = useState<Market[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadMarkets = async () => {
			try {
				const data = await mockApi.getMarkets();
				setMarkets(data.filter((m) => m.status !== "pending"));
			} catch (error) {
				console.error("Failed to load markets:", error);
			} finally {
				setLoading(false);
			}
		};

		loadMarkets();
	}, []);

	const activeMarkets = markets.filter((m) => m.status === "open");
	const totalPool = markets.reduce((sum, m) => sum + m.totalPool, 0);
	const totalBets = markets.reduce((sum, m) => sum + m.totalBets, 0);

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />

			<main>
				{/* Hero Section */}
				<section className="bg-white">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
						<div className="text-center">
							<h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
								Predict the Future,
								<span className="text-lime-500">
									{" "}
									Earn Rewards
								</span>
							</h1>
							<p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
								Continuous, non-binary prediction markets for
								real numeric outcomes. Forecast asset prices,
								sports scores, and more with accuracy-based
								rewards.
							</p>
							<div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
								<Link to="/create">
									<Button className="bg-lime-500 hover:bg-lime-600 text-white px-8 py-3 text-lg">
										<Plus className="w-5 h-5 mr-2" />
										Create Market
									</Button>
								</Link>
								<Button
									variant="outline"
									className="px-8 py-3 text-lg"
								>
									Learn More
								</Button>
							</div>
						</div>
					</div>
				</section>

				{/* Stats Section */}
				<section className="bg-gray-50 py-12">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							<div className="text-center">
								<div className="flex items-center justify-center w-12 h-12 bg-lime-100 rounded-lg mx-auto mb-4">
									<TrendingUp className="w-6 h-6 text-lime-600" />
								</div>
								<div className="text-3xl font-bold text-gray-900">
									{activeMarkets.length}
								</div>
								<div className="text-gray-600">
									Active Markets
								</div>
							</div>
							<div className="text-center">
								<div className="flex items-center justify-center w-12 h-12 bg-lime-100 rounded-lg mx-auto mb-4">
									<DollarSign className="w-6 h-6 text-lime-600" />
								</div>
								<div className="text-3xl font-bold text-gray-900">
									{formatCurrency(totalPool)}
								</div>
								<div className="text-gray-600">Total Pool</div>
							</div>
							<div className="text-center">
								<div className="flex items-center justify-center w-12 h-12 bg-lime-100 rounded-lg mx-auto mb-4">
									<Users className="w-6 h-6 text-lime-600" />
								</div>
								<div className="text-3xl font-bold text-gray-900">
									{totalBets}
								</div>
								<div className="text-gray-600">
									Total Predictions
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Markets Section */}
				<section className="py-16">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						{loading ? (
							<div className="text-center py-12">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto"></div>
								<p className="mt-4 text-gray-600">
									Loading markets...
								</p>
							</div>
						) : (
							<MarketList
								markets={activeMarkets}
								title="Active Markets"
							/>
						)}
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
};

export default Home;
