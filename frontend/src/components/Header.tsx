import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@radix-ui/themes";
import { Menu, X, Wallet, Settings } from "lucide-react";
import { useWallet } from "../utils/wallet";

const Header: React.FC = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { isConnected, isAdmin, connect, disconnect, publicKey } =
		useWallet();

	const navItems = [
		{ path: "/", label: "Markets" },
		{ path: "/propose", label: "Propose Market" },
		{ path: "/profile", label: "Profile" },
	];

	return (
		<header className="bg-white border-b border-gray-200 py-2">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center">
						<Link to="/" className="flex items-center">
							<span className="text-xl font-bold text-gray-900">
								Curney Markets
							</span>
						</Link>
					</div>

					<nav className="hidden md:flex space-x-8">
						{navItems.map(({ path, label }) => (
							<Link
								key={path}
								to={path}
								className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200"
							>
								{label}
							</Link>
						))}
					</nav>

					<div className="hidden md:flex items-center space-x-4">
						{isAdmin && (
							<Link
								to="/admin/dashboard"
								className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200"
							>
								<Settings className="w-4 h-4 mr-1" />
								Admin
							</Link>
						)}

						{isConnected ? (
							<div className="flex items-center space-x-2">
								<span className="text-sm text-gray-600">
									{publicKey?.slice(0, 4)}...
									{publicKey?.slice(-4)}
								</span>
								<Button
									onClick={disconnect}
									variant="soft"
									className="bg-lime-100 text-lime-900 px-6 py-5 text-sm cursor-pointer"
								>
									Disconnect
								</Button>
							</div>
						) : (
							<Button
								onClick={connect}
								className="cursor-pointer bg-lime-500 hover:bg-lime-600 text-white py-5 px-6"
							>
								<Wallet className="w-4 h-4" />
								Connect Wallet
							</Button>
						)}
					</div>

					<div className="md:hidden">
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="text-gray-600 hover:text-gray-900"
						>
							{isMenuOpen ? (
								<X className="w-6 h-6" />
							) : (
								<Menu className="w-6 h-6" />
							)}
						</button>
					</div>
				</div>

				{isMenuOpen && (
					<div className="md:hidden">
						<div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
							{navItems.map(({ path, label }) => (
								<Link
									key={path}
									to={path}
									className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900"
									onClick={() => setIsMenuOpen(false)}
								>
									{label}
								</Link>
							))}

							{isAdmin && (
								<Link
									to="/admin/dashboard"
									className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900"
									onClick={() => setIsMenuOpen(false)}
								>
									Admin
								</Link>
							)}

							<div className="px-3 py-2">
								{isConnected ? (
									<div className="space-y-2">
										<div className="text-sm text-gray-600">
											{publicKey?.slice(0, 4)}...
											{publicKey?.slice(-4)}
										</div>
										<Button
											onClick={disconnect}
											variant="outline"
											className="w-full"
										>
											Disconnect
										</Button>
									</div>
								) : (
									<Button
										onClick={connect}
										className="w-full bg-lime-500 hover:bg-lime-600 text-white"
									>
										<Wallet className="w-4 h-4 mr-2" />
										Connect Wallet
									</Button>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</header>
	);
};

export default Header;
