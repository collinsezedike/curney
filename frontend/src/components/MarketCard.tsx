import React from "react";
import { Clock, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import {
	formatTimeRemaining,
	formatCurrency,
	formatDate,
	convertTimestamp,
} from "../lib/helpers";
import { fetchMarketAccount, fetchPositionAccount } from "../lib/program/utils";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useTimeSync } from "../context/TimeSyncProvider";

interface UserContextData {
	isCreator: boolean;
	isTransactionPending: boolean;
	panelType: "UnclaimedRewards" | "UnwithdrawnRevenue" | "History";
	onClaimReward: (positionId: number, market: string) => void;
	onWithdrawRevenue: (marketId: string) => void;
}

interface MarketCardProps {
	market: Awaited<ReturnType<typeof fetchMarketAccount>>;
	userPosition?: Awaited<ReturnType<typeof fetchPositionAccount>>;
	userContextData?: UserContextData;
}

const MarketCard: React.FC<MarketCardProps> = ({
	market,
	userPosition,
	userContextData,
}) => {
	const { timeOffsetMs } = useTimeSync();

	const isProfileView = !!userContextData;

	const data = isProfileView ? userContextData : { market };
	const { isCreator, panelType, onClaimReward, onWithdrawRevenue } =
		data as Partial<UserContextData>;
	const currentMarket = market;

	let claimButton: any;
	let claimableText: any;

	const isWithdrawableRevenue =
		isCreator && currentMarket?.state.creatorFeeRevenue.toNumber() > 0;

	if (isProfileView) {
		if (
			panelType === "UnclaimedRewards" &&
			userPosition &&
			market?.state.isResolved &&
			!!userPosition.reward
		) {
			claimableText = `Reward: ${formatCurrency(
				userPosition.reward?.toNumber() / LAMPORTS_PER_SOL || 0
			)}`;
			claimButton = (
				<button
					onClick={(e) => {
						e.preventDefault();
						onClaimReward!(
							userPosition.index.toNumber(),
							userPosition.market.toBase58()
						);
					}}
					disabled={userContextData.isTransactionPending}
					className="bg-lime-500 hover:bg-lime-600 text-white px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-80"
				>
					Claim Reward
				</button>
			);
		}

		if (panelType === "UnwithdrawnRevenue" && isWithdrawableRevenue) {
			claimableText = `Creator Revenue: ${formatCurrency(
				currentMarket?.state.creatorFeeRevenue.toNumber() /
					LAMPORTS_PER_SOL
			)}`;
			claimButton = (
				<button
					onClick={(e) => {
						e.preventDefault();
						onWithdrawRevenue!(
							currentMarket?.state.marketConfig.toBase58()!
						);
					}}
					disabled={
						userContextData.isTransactionPending ||
						!currentMarket?.state.isResolved
					}
					className="bg-lime-500 hover:bg-lime-600 text-white px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-80"
				>
					Withdraw Revenue
				</button>
			);
		}
	}

	return (
		<Link
			to={`/market/${currentMarket?.state.marketConfig.toBase58()}`}
			className="block"
		>
			<div
				className={`bg-white border border-gray-200 rounded-lg p-4 ${
					isProfileView ? "shadow-sm" : "hover:shadow-md"
				} transition-shadow duration-200`}
			>
				<div className="flex justify-between items-start mb-2">
					<h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
						{currentMarket?.config.question}
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
										{userPosition.prediction.toNumber()}
									</div>
								</div>
							)}
							<div>
								<span className="text-gray-500">
									Total Pool
								</span>
								<div className="font-medium">
									{formatCurrency(
										currentMarket?.state.totalPool.toNumber() /
											LAMPORTS_PER_SOL
									)}
								</div>
							</div>
							<div>
								<span className="text-gray-500">Closes</span>
								<div className="font-medium">
									{formatDate(
										convertTimestamp(
											currentMarket?.config.endTime.toNumber(),
											timeOffsetMs
										)
									)}
								</div>
							</div>
						</div>

						{currentMarket?.state.isResolved &&
							currentMarket?.state.resolution !== undefined && (
								<div className="bg-gray-50 p-3 rounded-lg mb-3">
									<div className="text-sm text-gray-600">
										Resolution:{" "}
										<span className="font-medium text-green-700">
											{currentMarket?.state.resolution}
										</span>
									</div>

									{userPosition && (
										<div className="text-sm text-gray-600 mt-1">
											Position Status:{" "}
											<span
												className={`font-medium ${
													!!userPosition.reward
														? userPosition.claimed
															? "text-lime-600"
															: "text-orange-600"
														: "text-red-600"
												}`}
											>
												{!!userPosition.reward
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
													currentMarket.state.creatorFeeRevenue.toNumber() >
													0
														? "text-lime-600"
														: "text-gray-500"
												}`}
											>
												{currentMarket.state.creatorFeeRevenue.toNumber() <
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
							{currentMarket?.config.description}
						</p>

						<div className="flex items-center justify-between text-sm text-gray-500">
							<div className="flex items-center space-x-4">
								<div className="flex items-center">
									<span>
										{formatCurrency(
											currentMarket?.state.totalPool.toNumber() /
												LAMPORTS_PER_SOL
										)}{" "}
										SOL
									</span>
								</div>
								<div className="flex items-center">
									<UsersRound className="w-4 h-4 mr-1" />
									<span>
										{currentMarket?.state.totalPositions.toNumber()}
									</span>
								</div>
							</div>

							{currentMarket?.state.isApproved && (
								<div className="flex items-center text-lime-600">
									<Clock className="w-4 h-4 mr-1" />
									{new Date() <
									new Date(
										convertTimestamp(
											currentMarket.config.startTime.toNumber(),
											timeOffsetMs
										)
									) ? (
										<span>
											{formatTimeRemaining(
												new Date(
													convertTimestamp(
														currentMarket?.config.startTime.toNumber(),
														timeOffsetMs
													)
												)
											)}
										</span>
									) : (
										<span>
											{formatTimeRemaining(
												new Date(
													convertTimestamp(
														currentMarket?.config.endTime.toNumber(),
														timeOffsetMs
													)
												)
											)}
										</span>
									)}
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
