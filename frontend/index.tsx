import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { SolanaProvider } from "./src/context/SolanaProvider";
import { TimeSyncProvider } from "./src/context/TimeSyncProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<SolanaProvider>
			<TimeSyncProvider>
				<App />
			</TimeSyncProvider>
		</SolanaProvider>
	</React.StrictMode>
);
