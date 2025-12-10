import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { Button } from "@radix-ui/themes";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AdminNav from "../../components/AdminNav";
import { useSolanaWallet } from "../../hooks/useSolanaWallet";
import type { PlatformConfig as PlatformConfigType } from "../../lib/types";
import { mockApi } from "../../lib/mockApi";
import { updatePlatformConfig } from "../../lib/program/instructions";

const configSchema = z.object({
	platformFeeBps: z.number().min(0).max(10),
	creatorFeeBps: z.number().min(0).max(10),
	marketProposalFee: z.number().min(0.01),
});

type ConfigFormData = z.infer<typeof configSchema>;

const PlatformConfig: React.FC = () => {
	const { connection, signTransaction, userPublicKey } = useSolanaWallet();

	const [config, setConfig] = useState<PlatformConfigType | null>(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, dirtyFields },
	} = useForm<ConfigFormData>({
		resolver: zodResolver(configSchema),
	});

	useEffect(() => {
		const loadConfig = async () => {
			try {
				const data = await mockApi.getPlatformConfig();
				setConfig(data);
				reset({
					platformFeeBps: data.platformFeeBps,
					creatorFeeBps: data.creatorFeeBps,
					marketProposalFee: data.marketProposalFee,
				});
			} catch (error) {
				console.error("Failed to load config:", error);
				toast.error("Failed to load platform configuration");
			} finally {
				setLoading(false);
			}
		};

		loadConfig();
	}, [reset]);

	const handleUpdatePlatformConfig = async (formData: ConfigFormData) => {
		if (!userPublicKey || !signTransaction) return;

		setUpdating(true);

		const filteredData: Partial<ConfigFormData> = {};

		(Object.keys(formData) as Array<keyof ConfigFormData>).forEach(
			(key) => {
				if (dirtyFields[key]) filteredData[key] = formData[key] as any;
				else filteredData[key] = undefined;
			}
		);

		try {
			const tx = await updatePlatformConfig({
				admin: userPublicKey,
				platformFeeBps: formData.platformFeeBps,
				creatorFeeBps: formData.creatorFeeBps,
				marketProposalFee: formData.marketProposalFee,
			});
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
			toast.success("Platform configuration updated successfully!");
		} catch (error) {
			console.error("Failed to update config:", error);
			toast.error("Failed to update configuration");
		} finally {
			setUpdating(false);
		}
	};

	const isDirty = Object.keys(dirtyFields).length > 0;

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Header />
				<AdminNav />
				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500 mx-auto"></div>
						<p className="mt-2 text-gray-600">
							Loading configuration...
						</p>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />
			<AdminNav />

			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">
						Platform Configuration
					</h1>
					<p className="text-gray-600 mt-2">
						Manage platform settings and parameters
					</p>
				</div>

				<div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
					{config && (
						<div className="mb-5">
							<h2 className="text-xl font-bold text-gray-900 mb-4">
								Current Configuration
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="text-center p-4 bg-gray-50 rounded-lg">
									<div className="text-2xl font-bold text-gray-900">
										{config.platformFeeBps}%
									</div>
									<div className="text-gray-600">
										Platform Fee
									</div>
								</div>
								<div className="text-center p-4 bg-gray-50 rounded-lg">
									<div className="text-2xl font-bold text-gray-900">
										{config.creatorFeeBps}%
									</div>
									<div className="text-gray-600">
										Creator Fee
									</div>
								</div>
								<div className="text-center p-4 bg-gray-50 rounded-lg">
									<div className="text-2xl font-bold text-gray-900">
										${config.marketProposalFee}
									</div>
									<div className="text-gray-600">
										Market Proposal Fee
									</div>
								</div>
							</div>
						</div>
					)}

					<div className="bg-white border border-gray-200 rounded-lg p-6">
						<form
							onSubmit={handleSubmit(handleUpdatePlatformConfig)}
							className="space-y-4"
						>
							<div>
								<label
									htmlFor="platformFeeBps"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Platform Fee Percentage (%)
								</label>
								<input
									{...register("platformFeeBps", {
										valueAsNumber: true,
									})}
									type="number"
									id="platformFeeBps"
									step="0.1"
									min="0"
									max="10"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
								/>
								{errors.platformFeeBps && (
									<p className="mt-1 text-sm text-red-600">
										{errors.platformFeeBps.message}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="creatorFeeBps"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Creator Fee Percentage (%)
								</label>
								<input
									{...register("creatorFeeBps", {
										valueAsNumber: true,
									})}
									type="number"
									id="creatorFeeBps"
									step="0.1"
									min="0"
									max="10"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
								/>
								{errors.creatorFeeBps && (
									<p className="mt-1 text-sm text-red-600">
										{errors.creatorFeeBps.message}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="marketProposalFee"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Market Proposal Fee
								</label>
								<input
									{...register("marketProposalFee", {
										valueAsNumber: true,
									})}
									type="number"
									id="marketProposalFee"
									step="0.01"
									min="0.01"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
								/>
								{errors.marketProposalFee && (
									<p className="mt-1 text-sm text-red-600">
										{errors.marketProposalFee.message}
									</p>
								)}
							</div>

							<Button
								type="submit"
								disabled={updating || !isDirty}
								className="cursor-pointer w-full bg-lime-500 hover:bg-lime-600 text-white py-6 px-6 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-80"
							>
								{updating
									? "Updating..."
									: "Update Configuration"}
							</Button>
						</form>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default PlatformConfig;
