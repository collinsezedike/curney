import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { Button } from "@radix-ui/themes";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AdminNav from "../../components/AdminNav";
import type { PlatformConfig as PlatformConfigType } from "../../utils/types";
import { mockApi } from "../../utils/mockApi";

const configSchema = z.object({
	feePercentage: z.number().min(0).max(10),
	minStake: z.number().min(0.01),
	maxStake: z.number().min(1),
});

type ConfigFormData = z.infer<typeof configSchema>;

const PlatformConfig: React.FC = () => {
	const [config, setConfig] = useState<PlatformConfigType | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ConfigFormData>({
		resolver: zodResolver(configSchema),
	});

	useEffect(() => {
		const loadConfig = async () => {
			try {
				const data = await mockApi.getPlatformConfig();
				setConfig(data);
				reset({
					feePercentage: data.feePercentage,
					minStake: data.minStake,
					maxStake: data.maxStake,
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

	const handleSave = async (data: ConfigFormData) => {
		setSaving(true);
		try {
			const updatedConfig = await mockApi.updatePlatformConfig(data);
			setConfig(updatedConfig);
			toast.success("Platform configuration updated successfully!");
		} catch (error) {
			console.error("Failed to update config:", error);
			toast.error("Failed to update configuration");
		} finally {
			setSaving(false);
		}
	};

	const handleInitialize = async () => {
		if (!config) return;

		setSaving(true);
		try {
			await mockApi.initializePlatform({
				...config,
				initialized: true,
			});
			setConfig((prev) => (prev ? { ...prev, initialized: true } : null));
			toast.success("Platform initialized successfully!");
		} catch (error) {
			console.error("Failed to initialize platform:", error);
			toast.error("Failed to initialize platform");
		} finally {
			setSaving(false);
		}
	};

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

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Platform Status */}
					<div className="bg-white border border-gray-200 rounded-lg p-6">
						<h2 className="text-xl font-bold text-gray-900 mb-4">
							Platform Status
						</h2>

						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-gray-600">
									Initialization Status
								</span>
								<span
									className={`px-3 py-1 rounded-full text-sm font-medium ${
										config?.initialized
											? "bg-green-100 text-green-800"
											: "bg-yellow-100 text-yellow-800"
									}`}
								>
									{config?.initialized
										? "Initialized"
										: "Not Initialized"}
								</span>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-gray-600">Admin Key</span>
								<span className="font-mono text-sm">
									{config?.adminKey ? "••••••••" : "Not Set"}
								</span>
							</div>
						</div>

						{!config?.initialized && (
							<div className="mt-6">
								<Button
									onClick={handleInitialize}
									disabled={saving}
									className="w-full bg-lime-500 hover:bg-lime-600 text-white"
								>
									{saving
										? "Initializing..."
										: "Initialize Platform"}
								</Button>
							</div>
						)}
					</div>

					{/* Configuration Form */}
					<div className="bg-white border border-gray-200 rounded-lg p-6">
						<h2 className="text-xl font-bold text-gray-900 mb-4">
							Platform Parameters
						</h2>

						<form
							onSubmit={handleSubmit(handleSave)}
							className="space-y-4"
						>
							<div>
								<label
									htmlFor="feePercentage"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Fee Percentage (%)
								</label>
								<input
									{...register("feePercentage", {
										valueAsNumber: true,
									})}
									type="number"
									id="feePercentage"
									step="0.1"
									min="0"
									max="10"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
								/>
								{errors.feePercentage && (
									<p className="mt-1 text-sm text-red-600">
										{errors.feePercentage.message}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="minStake"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Minimum Stake ($)
								</label>
								<input
									{...register("minStake", {
										valueAsNumber: true,
									})}
									type="number"
									id="minStake"
									step="0.01"
									min="0.01"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
								/>
								{errors.minStake && (
									<p className="mt-1 text-sm text-red-600">
										{errors.minStake.message}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="maxStake"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Maximum Stake ($)
								</label>
								<input
									{...register("maxStake", {
										valueAsNumber: true,
									})}
									type="number"
									id="maxStake"
									step="1"
									min="1"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
								/>
								{errors.maxStake && (
									<p className="mt-1 text-sm text-red-600">
										{errors.maxStake.message}
									</p>
								)}
							</div>

							<Button
								type="submit"
								disabled={saving}
								className="w-full bg-lime-500 hover:bg-lime-600 text-white"
							>
								{saving ? "Saving..." : "Save Configuration"}
							</Button>
						</form>
					</div>
				</div>

				{/* Current Configuration Display */}
				{config && (
					<div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
						<h2 className="text-xl font-bold text-gray-900 mb-4">
							Current Configuration
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className="text-2xl font-bold text-gray-900">
									{config.feePercentage}%
								</div>
								<div className="text-gray-600">
									Platform Fee
								</div>
							</div>
							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className="text-2xl font-bold text-gray-900">
									${config.minStake}
								</div>
								<div className="text-gray-600">
									Minimum Stake
								</div>
							</div>
							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className="text-2xl font-bold text-gray-900">
									${config.maxStake}
								</div>
								<div className="text-gray-600">
									Maximum Stake
								</div>
							</div>
						</div>
					</div>
				)}
			</main>

			<Footer />
		</div>
	);
};

export default PlatformConfig;
