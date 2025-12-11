import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "@radix-ui/themes";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MarketList from "../components/MarketList";
import { fetchAllApprovedMarketAccounts } from "../lib/program/utils";
import { convertTimestamp } from "../lib/helpers";
import { useTimeSync } from "../context/TimeSyncProvider";

const Home: React.FC = () => {
	const { timeOffsetMs } = useTimeSync();

	const [markets, setMarkets] = useState<
		Awaited<ReturnType<typeof fetchAllApprovedMarketAccounts>>
	>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadMarkets = async () => {
			try {
				const data = await fetchAllApprovedMarketAccounts();
				setMarkets(data);
			} catch (error) {
				console.error("Failed to load markets:", error);
				toast.error("Failed to load markets");
			} finally {
				setLoading(false);
			}
		};

		loadMarkets();
	}, [markets]);

	const upComingMarkets = markets?.filter(
		(m) =>
			new Date() <
				new Date(
					convertTimestamp(
						m.config.startTime.toNumber(),
						timeOffsetMs
					)
				) &&
			new Date() <
				new Date(
					convertTimestamp(m.config.endTime.toNumber(), timeOffsetMs)
				)
	);

	const activeMarkets = markets?.filter(
		(m) =>
			new Date() >=
				new Date(
					convertTimestamp(
						m.config.startTime.toNumber(),
						timeOffsetMs
					)
				) &&
			new Date() <
				new Date(
					convertTimestamp(m.config.endTime.toNumber(), timeOffsetMs)
				)
	);
	const unresolvedMarkets = markets?.filter(
		(m) =>
			new Date() >
				new Date(
					convertTimestamp(m.config.endTime.toNumber(), timeOffsetMs)
				) && !m.state.isResolved
	);
	const resolvedMarkets = markets?.filter((m) => m.state.isResolved);

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />

			<main>
				{/* Hero Section */}
				<section className="bg-white">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
						<div className="text-center">
							<h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl my-10">
								Get Paid for Being Right
								<div className="my-3 text-lime-500">
									{" "}
									To Some Extent
								</div>
							</h1>
							<p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
								Permissionless, non-binary prediction markets
								for scalar numeric outcomes. Forecast asset
								prices, sports scores, and more with
								accuracy-based rewards.
							</p>
							<div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
								<a href="#active-markets">
									<Button className="bg-lime-500 hover:bg-lime-600 text-white px-8 py-7 text-lg cursor-pointer">
										Explore Markets
									</Button>
								</a>
								<Link to="/propose">
									<Button
										variant="soft"
										className="bg-lime-100 hover:bg-lime-200 text-lime-900 px-8 py-7 text-lg cursor-pointer"
									>
										Propose A Market
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</section>

				{/* Markets Section */}
				<section id="active-markets" className="py-16">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						{loading ? (
							<div className="text-center py-12">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto"></div>
								<p className="mt-4 text-gray-600">
									Loading markets...
								</p>
							</div>
						) : (
							<>
								<MarketList
									markets={upComingMarkets}
									title="Upcoming Markets"
								/>
								<MarketList
									markets={activeMarkets}
									title="Active Markets"
								/>
								<MarketList
									markets={unresolvedMarkets}
									title="Unresolved Markets"
								/>
								<MarketList
									markets={resolvedMarkets}
									title="Markets History"
								/>
							</>
						)}
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
};

export default Home;
