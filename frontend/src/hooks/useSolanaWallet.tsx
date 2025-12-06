import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";

interface SolanaWalletType {
	isAdmin: boolean;
	isConnected: boolean;
	publicKey: PublicKey | null;
	connect: () => void;
	disconnect: () => Promise<void>;
}

export const useSolanaWallet = (): SolanaWalletType => {
	const { connected, disconnect, publicKey: walletPublicKey } = useWallet();
	const { setVisible } = useWalletModal();

	const isConnected = connected;
	const publicKey = walletPublicKey;
	const connect = () => setVisible(true);
	const isAdmin = publicKey?.toBase58() === import.meta.env.VITE_ADMIN_KEY;

	return {
		isAdmin,
		isConnected,
		publicKey,
		connect,
		disconnect,
	};
};
