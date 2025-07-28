import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthProvider.tsx";
import { BrowserRouter } from "react-router";
import { ClientAuthProvider } from "./context/ClientAuthProvider.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<ClientAuthProvider>
					<App />
				</ClientAuthProvider>
			</AuthProvider>
		</BrowserRouter>
	</StrictMode>,
);
