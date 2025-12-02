import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@radix-ui/themes";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Unauthorized: React.FC = () => {
	return (
		<div className="min-h-screen bg-gray-50">
			<Header />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				<div className="text-center">
					<ShieldAlert className="w-16 h-16 mx-auto text-lime-500 mb-6" />
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						Access Denied
					</h1>
					<p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
						You don't have permission to access this admin area.
						Admin access requires a specific wallet address.
					</p>

					<div className="space-y-4">
						<Link to="/">
							<Button className="cursor-pointer bg-lime-500 hover:bg-lime-600 text-white py-6 px-9">
								Back to Markets
							</Button>
						</Link>
						<div className="text-sm text-gray-500">
							<p>
								If you believe you should have admin access,
								kindly check your wallet connection.
							</p>
						</div>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default Unauthorized;
