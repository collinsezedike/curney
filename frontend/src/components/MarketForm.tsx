import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@radix-ui/themes";
import { zodResolver } from "@hookform/resolvers/zod";
import { MarketFormSchema } from "../lib/types";
import type { MarketFormData } from "../lib/types";

interface MarketFormProps {
	onSubmit: (data: MarketFormData) => void;
	isProposing?: boolean;
	isLoading?: boolean;
	defaultValues?: MarketFormData;
}

const MarketForm: React.FC<MarketFormProps> = ({
	onSubmit,
	isLoading = false,
	isProposing = true,
	defaultValues,
}) => {
	const {
		register,
		handleSubmit,
		formState: { errors, dirtyFields },
	} = useForm<MarketFormData>({
		resolver: zodResolver(MarketFormSchema),
		defaultValues: defaultValues,
	});

	const handleFormSubmit = (data: MarketFormData) => {
		if (isProposing) return onSubmit(data);

		const filteredData: Partial<MarketFormData> = {};
		(Object.keys(data) as Array<keyof MarketFormData>).forEach((key) => {
			if (dirtyFields[key]) filteredData[key] = data[key] as any;
		});
		onSubmit(filteredData as MarketFormData);
	};

	const minDateTime = new Date();
	minDateTime.setHours(minDateTime.getHours() + 1);

	const isDirty = Object.keys(dirtyFields).length > 0;

	const buttonText = (() => {
		if (isProposing) {
			return isLoading ? "Submitting Proposal..." : "Submit Proposal";
		}
		if (isLoading) return "Updating Market Config...";
		if (!isDirty) return "No Changes Detected";

		return "Update Market Config";
	})();

	return (
		<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Market Question
				</label>
				<input
					{...register("question")}
					type="text"
					placeholder="What will be the price of SOL on Dec 31?"
					className="w-full px-3 py-2 border rounded-md"
				/>
				{errors.question && (
					<p className="mt-1 text-sm text-red-600">
						{errors.question.message}
					</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Description & Resolution Criteria
				</label>
				<textarea
					{...register("description")}
					rows={4}
					placeholder="Provide context, methodology, and resolution details..."
					className="w-full px-3 py-2 border rounded-md"
				/>
				{errors.description && (
					<p className="mt-1 text-sm text-red-600">
						{errors.description.message}
					</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Category
				</label>
				<select
					{...register("category")}
					className="w-full px-3 py-2 border rounded-md"
				>
					<option value="">Select a category</option>
					<option value="crypto">Cryptocurrency</option>
					<option value="stocks">Stocks</option>
					<option value="sports">Sports</option>
					<option value="politics">Politics</option>
					<option value="economics">Economics</option>
					<option value="other">Other</option>
				</select>
				{errors.category && (
					<p className="mt-1 text-sm text-red-600">
						{errors.category.message}
					</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Minimum Prediction Price
				</label>
				<input
					{...register("minPredictionPrice", { valueAsNumber: true })}
					type="number"
					min={0.01}
					step={0.01}
					placeholder="Minimum stake for participation"
					className="w-full px-3 py-2 border rounded-md"
				/>
				{errors.minPredictionPrice && (
					<p className="mt-1 text-sm text-red-600">
						{errors.minPredictionPrice.message}
					</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Start Time
				</label>
				<input
					{...register("startTime")}
					type="datetime-local"
					min={minDateTime.toISOString().slice(0, 16)}
					className="w-full px-3 py-2 border rounded-md"
				/>
				{errors.startTime && (
					<p className="mt-1 text-sm text-red-600">
						{errors.startTime.message}
					</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					End Time
				</label>
				<input
					{...register("endTime")}
					type="datetime-local"
					min={minDateTime.toISOString().slice(0, 16)}
					className="w-full px-3 py-2 border rounded-md"
				/>
				{errors.endTime && (
					<p className="mt-1 text-sm text-red-600">
						{errors.endTime.message}
					</p>
				)}
			</div>

			<Button
				type="submit"
				disabled={isLoading || (!isProposing && !isDirty)}
				className="cursor-pointer w-full bg-lime-500 text-white py-7 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-80"
			>
				{buttonText}
			</Button>
		</form>
	);
};

export default MarketForm;
