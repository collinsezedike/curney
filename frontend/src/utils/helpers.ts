import { format, formatDistanceToNow } from "date-fns";

export const formatCurrency = (amount: number): string => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
};

export const formatTimeRemaining = (endTime: Date): string => {
	const now = new Date();
	const end = new Date(endTime);

	if (end <= now) return "Ended";
	return formatDistanceToNow(end, { addSuffix: true });
};

export const formatDate = (date: number): string => {
	return format(new Date(date), "MMM dd, yyyy HH:mm");
};

export const generateId = (): string => {
	return Math.random().toString(36).slice(2, 9);
};

export const truncateAddress = (address: string, chars = 4): string => {
	return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};
