import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Settings } from "lucide-react";

const AdminNav: React.FC = () => {
	const location = useLocation();

	const navItems = [
		{ path: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
		{ path: "/admin/platform", label: "Platform Config", icon: Settings },
	];

	return (
		<nav className="bg-white border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex space-x-8">
					{navItems.map(({ path, label, icon: Icon }) => {
						const isActive = location.pathname === path;
						return (
							<Link
								key={path}
								to={path}
								className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
									isActive
										? "border-lime-500 text-lime-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}
							>
								<Icon className="w-4 h-4 mr-2" />
								{label}
							</Link>
						);
					})}
				</div>
			</div>
		</nav>
	);
};

export default AdminNav;
