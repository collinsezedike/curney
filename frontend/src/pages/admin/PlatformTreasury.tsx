import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Button } from "@radix-ui/themes";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AdminNav from "../../components/AdminNav";
import { formatCurrency } from "../../utils/helpers";

const PlatformTreasury: React.FC = () => {
	const [balance, setBalance] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [withdrawing, setWithdrawing] = useState(false);

	useEffect(() => {
		const loadBalance = async () => {
			try {
				setBalance(Math.random() * 1e5);
			} catch (error) {
				console.error("Failed to load treasury balance:", error);
				toast.error("Failed to load treasury balance");
			} finally {
				setLoading(false);
			}
		};

		loadBalance();
	}, []);

	const handleWithdrawFees = async () => {
		if (balance === null || balance <= 0) {
			toast.info("No fees available to withdraw.");
			return;
		}

		setWithdrawing(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 300));
			setBalance(0);
			toast.success("Platform fees successfully withdrawn!");
		} catch (error) {
			console.error("Withdrawal failed:", error);
			toast.error("Failed to withdraw fees. Check console for details.");
		} finally {
			setWithdrawing(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />
			<AdminNav />

			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">
						Platform Treasury
					</h1>
					<p className="text-gray-600 mt-2">
						View accumulated platform fees and execute withdrawals.
					</p>
				</div>

				<div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
					<h2 className="text-xl font-bold text-gray-900 mb-4">
						Current Fee Balance
					</h2>

					{loading ? (
						<div className="text-center py-4">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-lime-500 mx-auto"></div>
							<p className="mt-2 text-gray-600">Loading...</p>
						</div>
					) : (
						<div className="text-center p-6 bg-lime-50 rounded-lg border border-lime-200 mb-6">
							<div className="text-4xl font-extrabold text-lime-700">
								{formatCurrency(balance || 0)}
							</div>
							<div className="text-lime-600 mt-1">
								Available for Withdrawal
							</div>
						</div>
					)}

					<Button
						onClick={handleWithdrawFees}
						disabled={
							withdrawing || (balance !== null && balance <= 0)
						}
						className="cursor-pointer w-full bg-lime-500 hover:bg-lime-600 text-white py-6 px-6 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-80"
					>
						{withdrawing
							? "Withdrawing..."
							: "Withdraw All Platform Fees"}
					</Button>
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default PlatformTreasury;
