import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MarketForm from "../components/MarketForm";
import WalletGate from "../components/WalletGate";
import { mockApi } from "../utils/mockApi";
import { useSolanaWallet } from "../hooks/useSolanaWallet";

const ProposeMarket: React.FC = () => {
	const navigate = useNavigate();
	const { isConnected, connect, publicKey } = useSolanaWallet();
	const [creating, setCreating] = useState(false);

	const handleSubmit = async (data: any) => {
		if (!publicKey) return;

		setCreating(true);
		try {
			const market = await mockApi.proposeMarket({
				...data,
				endTime: new Date(data.endTime),
				createdBy: publicKey,
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
