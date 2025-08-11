import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthProvider.tsx";
import { BrowserRouter } from "react-router";
import { ClientAuthProvider } from "./context/ClientAuthProvider.tsx";
import SubscriptionProvider from "./context/SubscriptionProvider.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./utils/react-query.ts";
import { UserProvider } from "./context/UserProvider.tsx";


createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<AuthProvider>
					<ClientAuthProvider>
						<UserProvider>
							<SubscriptionProvider>
								<App />
							</SubscriptionProvider>
						</UserProvider>
					</ClientAuthProvider>
				</AuthProvider>
			</BrowserRouter>
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	</StrictMode>,
);
