import { useState, useEffect, createContext, useContext } from "react";

interface WalletContextType {
	isConnected: boolean;
	isAdmin: boolean;
	publicKey: string | null;
	connect: () => void;
	disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const useWallet = () => {
	const context = useContext(WalletContext);
	if (!context) {
		// Mock wallet for standalone usage
		const [isConnected, setIsConnected] = useState(false);
		const [publicKey, setPublicKey] = useState<string | null>(null);

		const connect = () => {
			const mockKey = "mock_" + Math.random().toString(36).slice(2, 9);
			setPublicKey(mockKey);
			setIsConnected(true);
			localStorage.setItem("wallet_connected", "true");
			localStorage.setItem("wallet_key", mockKey);
		};

		const disconnect = () => {
			setPublicKey(null);
			setIsConnected(false);
			localStorage.removeItem("wallet_connected");
			localStorage.removeItem("wallet_key");
		};

		useEffect(() => {
			const connected = localStorage.getItem("wallet_connected");
			const key = localStorage.getItem("wallet_key");
			if (connected && key) {
				setPublicKey(key);
				setIsConnected(true);
			}
		}, []);

		// const isAdmin = publicKey === import.meta.env.VITE_ADMIN_KEY;
		const isAdmin = true;

		return {
			isConnected,
			isAdmin,
			publicKey,
			connect,
			disconnect,
		};
	}
	return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const wallet = useWallet();
	return (
		<WalletContext.Provider value={wallet}>
			{children}
		</WalletContext.Provider>
	);
};
