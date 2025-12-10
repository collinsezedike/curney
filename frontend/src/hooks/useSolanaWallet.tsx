import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
	Connection,
	PublicKey,
	Transaction,
	VersionedTransaction,
} from "@solana/web3.js";

interface SolanaWalletType {
	isAdmin: boolean;
	isConnected: boolean;
	userPublicKey: PublicKey | null;
	connection: Connection;
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
	const { connection } = useConnection();

	const isConnected = connected;
	const connect = () => setVisible(true);
	const isAdmin = publicKey?.toBase58() === import.meta.env.VITE_ADMIN_KEY;

	return {
		isAdmin,
		isConnected,
		userPublicKey: publicKey,
		signTransaction,
		connection,
		connect,
		disconnect,
	};
};
