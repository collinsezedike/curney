import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@radix-ui/themes";
import type { Market } from "../utils/types";
import { formatCurrency } from "../utils/helpers";

const betSchema = z.object({
	prediction: z.number().min(0, "Prediction must be positive"),
	stake: z.number().min(0.01, "Minimum stake is 0.01"),
});

type BetFormData = z.infer<typeof betSchema>;

interface BetFormProps {
	market: Market;
	onSubmit: (data: BetFormData) => void;
	isLoading?: boolean;
}

const BetForm: React.FC<BetFormProps> = ({
	market,
	onSubmit,
	isLoading = false,
}) => {
	const [prediction, setPrediction] = useState<number>(0);
	const [stake, setStake] = useState<number>(0);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<BetFormData>({
		resolver: zodResolver(betSchema),
	});

	const estimatedPayout = stake * 1.8; // Mock payout calculation

	return (
		<div className="bg-white border border-gray-200 rounded-lg p-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				Place Your Prediction
			</h3>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div>
					<label
						htmlFor="prediction"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Your Prediction
					</label>
					<input
						{...register("prediction", { valueAsNumber: true })}
						type="number"
						id="prediction"
						step="0.01"
						placeholder="Enter your numeric prediction"
						onChange={(e) => setPrediction(Number(e.target.value))}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
					/>
					{errors.prediction && (
						<p className="mt-1 text-sm text-red-600">
							{errors.prediction.message}
						</p>
					)}
				</div>

				<div>
					<label
						htmlFor="stake"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Stake Amount
					</label>
					<input
						{...register("stake", { valueAsNumber: true })}
						type="number"
						id="stake"
						step="0.01"
						placeholder="0.00"
						onChange={(e) => setStake(Number(e.target.value))}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
					/>
					{errors.stake && (
						<p className="mt-1 text-sm text-red-600">
							{errors.stake.message}
						</p>
					)}
				</div>

				{stake > 0 && (
					<div className="bg-gray-50 p-4 rounded-md">
						<div className="flex justify-between text-sm">
							<span className="text-gray-600">
								Estimated Payout:
							</span>
							<span className="font-medium">
								{formatCurrency(estimatedPayout)}
							</span>
						</div>
						<div className="flex justify-between text-sm mt-1">
							<span className="text-gray-600">
								Potential Profit:
							</span>
							<span className="font-medium text-lime-600">
								{formatCurrency(estimatedPayout - stake)}
							</span>
						</div>
					</div>
				)}

				<Button
					type="submit"
					disabled={isLoading || !prediction || !stake}
					className="w-full bg-lime-500 hover:bg-lime-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
				>
					{isLoading ? "Placing Bet..." : "Place Bet"}
				</Button>
			</form>
		</div>
	);
};

export default BetForm;
