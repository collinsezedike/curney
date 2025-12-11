import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useConnection } from "@solana/wallet-adapter-react";

interface TimeContextType {
	timeOffsetMs: number;
}

const TimeContext = createContext<TimeContextType | undefined>(undefined);

export const useTimeSync = () => {
	const context = useContext(TimeContext);
	if (context === undefined) {
		throw new Error("useTimeSync must be used within a TimeSyncProvider");
	}
	return context;
};

interface TimeSyncProviderProps {
	children: ReactNode;
}

export const TimeSyncProvider = ({ children }: TimeSyncProviderProps) => {
	const { connection } = useConnection();
	const [timeOffsetMs, setTimeOffsetMs] = useState(0);

	useEffect(() => {
		const initializeTimeSync = async () => {
			if (!connection) return;

			try {
				const slot = await connection.getSlot();
				const blockTimeResponse = await connection.getBlockTime(slot);

				if (blockTimeResponse === null) {
					throw new Error("Could not fetch block time.");
				}

				const chainTimeSeconds = blockTimeResponse;
				const localTimeMs = Date.now();
				const offset = localTimeMs - chainTimeSeconds * 1000;

				setTimeOffsetMs(offset);
			} catch (error) {
				console.error("Failed to sync time with network:", error);
				setTimeOffsetMs(0);
			}
		};

		initializeTimeSync();
	}, [connection]);

	const value = { timeOffsetMs };

	return (
		<TimeContext.Provider value={value}>{children}</TimeContext.Provider>
	);
};
