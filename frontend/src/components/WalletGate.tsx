import React from "react";
import { Button } from "@radix-ui/themes";
import { Wallet } from "lucide-react";

interface WalletGateProps {
	children: React.ReactNode;
	isConnected: boolean;
	onConnect: () => void;
}

const WalletGate: React.FC<WalletGateProps> = ({
	children,
	isConnected,
	onConnect,
}) => {
	if (isConnected) {
		return <>{children}</>;
	}

	return (
		<div className="text-center py-12">
			<Wallet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
			<h2 className="text-2xl font-bold text-gray-900 mb-2">
				Connect Your Wallet
			</h2>
			<p className="text-gray-600 mb-6">
				Connect your wallet to participate in prediction markets.
			</p>
			<Button
				onClick={onConnect}
				className="bg-lime-500 hover:bg-lime-600 text-white font-medium py-6 px-8 rounded-md transition-colors duration-200"
			>
				Connect Wallet
			</Button>
		</div>
	);
};

export default WalletGate;
