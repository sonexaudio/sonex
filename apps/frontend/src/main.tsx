import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthProvider.tsx";
import { BrowserRouter } from "react-router";
import { ClientAuthProvider } from "./context/ClientAuthProvider.tsx";
import SubscriptionProvider from "./context/SubscriptionProvider.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<ClientAuthProvider>
					<SubscriptionProvider>
						<App />
					</SubscriptionProvider>
				</ClientAuthProvider>
			</AuthProvider>
		</BrowserRouter>
	</StrictMode>,
);
