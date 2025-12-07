import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { SolanaProvider } from "./src/context/SolanaProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<SolanaProvider>
			<App />
		</SolanaProvider>
	</React.StrictMode>
);
