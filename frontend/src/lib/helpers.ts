import { format, formatDistanceToNow } from "date-fns";

export const formatCurrency = (
	amount: number,
	decimals: number = 4
): string => {
	return new Intl.NumberFormat("en-US", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
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

type TimeDirection = "toLocal" | "toChain";

export const convertTimestamp = (
	timestamp: number,
	timeOffsetMs: number,
	direction: TimeDirection = "toLocal"
): number => {
	const MS_PER_SECOND = 1000;

	if (direction === "toLocal") {
		const chainTimeMs = timestamp * MS_PER_SECOND;
		return chainTimeMs + timeOffsetMs;
	} else {
		const localTimeMs = timestamp;
		const adjustedTimeMs = localTimeMs - timeOffsetMs;
		return Math.ceil(adjustedTimeMs / MS_PER_SECOND);
	}
};
