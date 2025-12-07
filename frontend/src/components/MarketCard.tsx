import React from "react";
import { Clock, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import type { Market } from "../utils/types";
import { formatTimeRemaining, formatCurrency } from "../utils/helpers";

interface MarketCardProps {
	market: Market;
}

const MarketCard: React.FC<MarketCardProps> = ({ market }) => {
	return (
		<Link to={`/market/${market.id}`} className="block">
			<div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
				<div className="flex justify-between items-start mb-3">
					<h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
						{market.question}
					</h3>
				</div>

				<p className="text-gray-600 text-sm mb-4 line-clamp-2">
					{market.description}
				</p>

				<div className="flex items-center justify-between text-sm text-gray-500">
					<div className="flex items-center space-x-4">
						<div className="flex items-center">
							<span>{formatCurrency(market.totalPool)}</span>
						</div>
						<div className="flex items-center">
							<UsersRound className="w-4 h-4 mr-1" />
							<span>{market.totalPositions}</span>
						</div>
					</div>

					{market.isApproved && (
						<div className="flex items-center text-lime-600">
							<Clock className="w-4 h-4 mr-1" />
							<span>
								{formatTimeRemaining(new Date(market.endTime))}
							</span>
						</div>
					)}
				</div>
			</div>
		</Link>
	);
};

export default MarketCard;
