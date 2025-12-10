import React, { useState } from "react";
import { Clock, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import type { Position, Market } from "../lib/types";
import {
	formatTimeRemaining,
	formatCurrency,
	formatDate,
} from "../lib/helpers";

interface UserContextData {
	market: Market;
	userPosition?: Position;
	isCreator: boolean;
	panelType: "UnclaimedRewards" | "UnwithdrawnRevenue" | "History";
	onClaimReward: (positionId: string) => void;
	onWithdrawRevenue: (marketId: string) => void;
}

interface MarketCardProps {
	market: Market;
	userContextData?: UserContextData;
}

const MarketCard: React.FC<MarketCardProps> = ({ market, userContextData }) => {
	const isProfileView = !!userContextData;

	const data = isProfileView ? userContextData : { market };
	const {
		userPosition,
		isCreator,
		panelType,
		onClaimReward,
		onWithdrawRevenue,
	} = data as Partial<UserContextData>;
	const currentMarket = data.market;

	let claimButton: any;
	let claimableText: any;

	const isWithdrawableRevenue =
		isCreator && currentMarket.creatorFeeRevenue > 0;

	if (isProfileView) {
		if (panelType === "UnclaimedRewards" && userPosition) {
			claimableText = `Reward: ${formatCurrency(
				userPosition.reward || 0
			)}`;
			claimButton = (
				<button
					onClick={(e) => {
						e.preventDefault();
						onClaimReward!(userPosition.id);
					}}
					className="bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
				>
					Claim Reward
				</button>
			);
		} else if (
			panelType === "UnwithdrawnRevenue" &&
			isWithdrawableRevenue
		) {
			const mockRevenue = currentMarket.totalPool * 0.05;
			claimableText = `Creator Revenue: ${formatCurrency(mockRevenue)}`;
			claimButton = (
				<button
					onClick={(e) => {
						e.preventDefault();
						onWithdrawRevenue!(currentMarket.id);
					}}
					className="bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
				>
					Withdraw Revenue
				</button>
			);
		}
	}

	return (
		<Link to={`/market/${currentMarket.id}`} className="block">
			<div
				className={`bg-white border border-gray-200 rounded-lg p-4 ${
					isProfileView ? "shadow-sm" : "hover:shadow-md"
				} transition-shadow duration-200`}
			>
				<div className="flex justify-between items-start mb-2">
					<h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
						{currentMarket.question}
					</h3>
				</div>

				{isProfileView ? (
					<>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
							{userPosition && (
								<div>
									<span className="text-gray-500">
										Your Prediction
									</span>
									<div className="font-medium">
										{userPosition.prediction}
									</div>
								</div>
							)}
							<div>
								<span className="text-gray-500">
									Total Pool
								</span>
								<div className="font-medium">
									{formatCurrency(currentMarket.totalPool)}
								</div>
							</div>
							<div>
								<span className="text-gray-500">Closes</span>
								<div className="font-medium">
									{formatDate(currentMarket.endTime)}
								</div>
							</div>
						</div>

						{currentMarket.isResolved &&
							currentMarket.resolution !== undefined && (
								<div className="bg-gray-50 p-3 rounded-lg mb-3">
									<div className="text-sm text-gray-600">
										Resolution:{" "}
										<span className="font-medium text-green-700">
											{currentMarket.resolution}
										</span>
									</div>

									{userPosition && (
										<div className="text-sm text-gray-600 mt-1">
											Position Status:{" "}
											<span
												className={`font-medium ${
													userPosition.reward
														? userPosition.claimed
															? "text-lime-600"
															: "text-orange-600"
														: "text-red-600"
												}`}
											>
												{userPosition.reward
													? userPosition.claimed
														? "Claimed"
														: "Claimable"
													: "Lost"}
											</span>
										</div>
									)}

									{isCreator && (
										<div className="text-sm text-gray-600 mt-1">
											Revenue Status:{" "}
											<span
												className={`font-medium ${
													currentMarket.creatorFeeRevenue >
													0
														? "text-lime-600"
														: "text-gray-500"
												}`}
											>
												{currentMarket.creatorFeeRevenue <
												0
													? "Withdrawn"
													: "Withdrawable"}
											</span>
										</div>
									)}
								</div>
							)}

						{claimButton && (
							<div className="flex justify-between items-center pt-3 border-t mt-3">
								<div className="text-lime-600 font-medium">
									{claimableText}
								</div>
								{claimButton}
							</div>
						)}
					</>
				) : (
					<>
						<p className="text-gray-600 text-sm mb-4 line-clamp-2">
							{currentMarket.description}
						</p>

						<div className="flex items-center justify-between text-sm text-gray-500">
							<div className="flex items-center space-x-4">
								<div className="flex items-center">
									<span>
										{formatCurrency(
											currentMarket.totalPool
										)}
									</span>
								</div>
								<div className="flex items-center">
									<UsersRound className="w-4 h-4 mr-1" />
									<span>{currentMarket.totalPositions}</span>
								</div>
							</div>

							{currentMarket.isApproved && (
								<div className="flex items-center text-lime-600">
									<Clock className="w-4 h-4 mr-1" />
									<span>
										{formatTimeRemaining(
											new Date(currentMarket.endTime)
										)}
									</span>
								</div>
							)}
						</div>
					</>
				)}
			</div>
		</Link>
	);
};

export default MarketCard;
