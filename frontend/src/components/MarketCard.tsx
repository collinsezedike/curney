import React from "react";
import { Clock, Users, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import type { Market } from "../utils/types";
import { formatTimeRemaining, formatCurrency } from "../utils/helpers";

interface MarketCardProps {
	market: Market;
}

const MarketCard: React.FC<MarketCardProps> = ({ market }) => {
	const getStatusColor = (status: string) => {
		switch (status) {
			case "open":
				return "bg-green-100 text-green-800";
			case "closed":
				return "bg-yellow-100 text-yellow-800";
			case "resolved":
				return "bg-blue-100 text-blue-800";
			case "pending":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<Link to={`/market/${market.id}`} className="block">
			<div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
				<div className="flex justify-between items-start mb-3">
					<h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
						{market.question}
					</h3>
					<span
						className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
							market.status
						)}`}
					>
						{market.status}
					</span>
				</div>

				<p className="text-gray-600 text-sm mb-4 line-clamp-2">
					{market.description}
				</p>

				<div className="flex items-center justify-between text-sm text-gray-500">
					<div className="flex items-center space-x-4">
						<div className="flex items-center">
							<DollarSign className="w-4 h-4 mr-1" />
							<span>{formatCurrency(market.totalPool)}</span>
						</div>
						<div className="flex items-center">
							<Users className="w-4 h-4 mr-1" />
							<span>{market.totalBets}</span>
						</div>
					</div>

					{market.status === "open" && (
						<div className="flex items-center text-lime-600">
							<Clock className="w-4 h-4 mr-1" />
							<span>{formatTimeRemaining(market.endTime)}</span>
						</div>
					)}
				</div>
			</div>
		</Link>
	);
};

export default MarketCard;
