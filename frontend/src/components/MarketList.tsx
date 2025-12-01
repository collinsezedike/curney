import React from "react";
import MarketCard from "./MarketCard";
import type { Market } from "../utils/types";

interface MarketListProps {
	markets: Market[];
	title?: string;
}

const MarketList: React.FC<MarketListProps> = ({ markets, title }) => {
	if (markets.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500">No markets found.</p>
			</div>
		);
	}

	return (
		<div>
			{title && (
				<h2 className="text-2xl font-bold text-gray-900 mb-6">
					{title}
				</h2>
			)}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{markets.map((market) => (
					<MarketCard key={market.id} market={market} />
				))}
			</div>
		</div>
	);
};

export default MarketList;
