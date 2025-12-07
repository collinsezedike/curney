import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

interface SolanaWalletType {
	isAdmin: boolean;
	isConnected: boolean;
	userPublicKey: PublicKey | null;
	connect: () => void;
	disconnect: () => Promise<void>;
	signTransaction:
		| (<T extends Transaction | VersionedTransaction>(
				transaction: T
		  ) => Promise<T>)
		| undefined;
}

export const useSolanaWallet = (): SolanaWalletType => {
	const { connected, disconnect, publicKey, signTransaction } = useWallet();
	const { setVisible } = useWalletModal();

	const isConnected = connected;
	const connect = () => setVisible(true);
	const isAdmin = publicKey?.toBase58() === import.meta.env.VITE_ADMIN_KEY;

	return {
		isAdmin,
		isConnected,
		userPublicKey: publicKey,
		signTransaction,
		connect,
		disconnect,
	};
};
