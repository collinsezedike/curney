import React from "react";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";

import Home from "./src/pages/Home";
import Market from "./src/pages/Market";
import CreateMarket from "./src/pages/ProposeMarket";
import Profile from "./src/pages/Profile";
import AdminDashboard from "./src/pages/admin/Dashboard";
import PlatformConfig from "./src/pages/admin/PlatformConfig";
import AdminMarketDetail from "./src/pages/admin/MarketDetail";
import Unauthorized from "./src/pages/Unauthorized";
import NotFound from "./src/pages/NotFound";
import { useWallet } from "./src/utils/wallet";

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { isAdmin, isConnected } = useWallet();

	if (!isAdmin) {
		return <Navigate to="/unauthorized" replace />;
	}

	return <>{children}</>;
};

const App: React.FC = () => {
	return (
		<Theme appearance="inherit" radius="large" scaling="100%">
			<Router>
				<main className="min-h-screen font-inter bg-gray-50">
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/market/:id" element={<Market />} />
						<Route path="/propose" element={<CreateMarket />} />
						<Route path="/profile" element={<Profile />} />

						<Route
							path="/admin/dashboard"
							element={
								<AdminRoute>
									<AdminDashboard />
								</AdminRoute>
							}
						/>
						<Route
							path="/admin/platform"
							element={
								<AdminRoute>
									<PlatformConfig />
								</AdminRoute>
							}
						/>
						<Route
							path="/admin/markets/:id"
							element={
								<AdminRoute>
									<AdminMarketDetail />
								</AdminRoute>
							}
						/>

						<Route
							path="/unauthorized"
							element={<Unauthorized />}
						/>
						<Route path="*" element={<NotFound />} />
					</Routes>

					<ToastContainer
						position="top-right"
						autoClose={3000}
						newestOnTop
						closeOnClick
						pauseOnHover
						theme="light"
					/>
				</main>
			</Router>
		</Theme>
	);
};

export default App;
