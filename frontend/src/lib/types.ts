import { z } from "zod";

export interface Position {
	id: string;
	market: string;
	user: string;
	prediction: number;
	stake: number;
	timestamp: number;
	claimed: boolean;
	reward?: number;
}

// Zod types

export const MarketFormSchema = z.object({
	question: z.string().min(10, "Question must be at least 10 characters"),
	description: z
		.string()
		.min(20, "Description must be at least 20 characters"),
	minPredictionPrice: z
		.number()
		.min(0.01, "Minimum prediction price is required"),
	startTime: z.string().min(1, "Start time is required"),
	endTime: z.string().min(1, "End time is required"),
});

export const ResolveMarketFormSchema = z.object({
	resolution: z.number().min(0, "Final value must be positive"),
});

export const PredictionFormSchema = z.object({
	prediction: z.number().min(0, "Prediction must be positive"),
	stake: z.number().min(0.01, "Minimum stake is 0.01"),
});

export type MarketFormData = z.infer<typeof MarketFormSchema>;

export type ResolveFormData = z.infer<typeof ResolveMarketFormSchema>;

export type PredictionFormData = z.infer<typeof PredictionFormSchema>;
