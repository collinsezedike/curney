import React from "react";
import MarketCard from "./MarketCard";
import { fetchAllMarketAccounts } from "../lib/program/utils";

interface MarketListProps {
	markets: Awaited<ReturnType<typeof fetchAllMarketAccounts>>;
	title?: string;
}

const MarketList: React.FC<MarketListProps> = ({ markets, title }) => {
	if (!markets) return;

	return (
		<div className="mb-8">
			{title && (
				<h2 className="text-2xl font-bold text-gray-900 mb-6">
					{title}
				</h2>
			)}
			{markets.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-gray-500">No markets found.</p>
				</div>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{markets.map((market) => (
						<MarketCard
							key={market.state?.marketConfig.toBase58()}
							market={market}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default MarketList;
