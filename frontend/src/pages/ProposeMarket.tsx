import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MarketForm from "../components/MarketForm";
import WalletGate from "../components/WalletGate";
import { useSolanaWallet } from "../hooks/useSolanaWallet";
import { proposeMarket } from "../lib/program/instructions";
import type { MarketFormData } from "../lib/types";

const ProposeMarket: React.FC = () => {
	const navigate = useNavigate();
	const { connect, connection, isConnected, signTransaction, userPublicKey } =
		useSolanaWallet();
	const [creating, setCreating] = useState(false);

	const handleSubmit = async (data: MarketFormData) => {
		if (!userPublicKey || !signTransaction) return;

		setCreating(true);

		try {
			const tx = await proposeMarket(
				data.question,
				data.description,
				new Date(data.startTime).getTime(),
				new Date(data.endTime).getTime(),
				data.minPredictionPrice,
				userPublicKey
			);
			const signedTx = await signTransaction(tx);
			const signature = await connection.sendRawTransaction(
				signedTx.serialize()
			);
			const latestBlockhash = await connection.getLatestBlockhash();
			await connection.confirmTransaction({
				blockhash: latestBlockhash.blockhash,
				lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
				signature: signature,
			});

			toast.success(
				"Market proposed successfully! Awaiting admin approval."
			);
			navigate("/");
		} catch (error) {
			console.error("Failed to submit market proposal:", error);
			toast.error("Failed to submit market proposal");
		} finally {
			setCreating(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />

			<main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="bg-white border border-gray-200 rounded-lg p-8">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-4">
							Propose New Market
						</h1>
						<p className="text-gray-600">
							Your market will need admin approval before going
							live.
						</p>
					</div>

					<WalletGate isConnected={isConnected} onConnect={connect}>
						<MarketForm
							onSubmit={handleSubmit}
							isLoading={creating}
						/>
					</WalletGate>
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default ProposeMarket;
