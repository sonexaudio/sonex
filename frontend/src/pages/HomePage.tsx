import { useState } from "react";
import { getStripePrices, PRICING_ORDER } from "../utils/stripeConfig";
import api from "../lib/axios";
import { useAuth } from "../hooks/useAuth";

const prices = getStripePrices();

const HomePage = () => {
	const [showYearlyPricing, setShowYearlyPricing] = useState(false);

	const { logout, user } = useAuth();

	const handleSubscribe = async (priceId: string) => {
		try {
			const {
				data: { data },
			} = await api.post("/payments/create-checkout-session", {
				priceId,
			});

			window.location.href = data.sessionUrl;
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div>
			{/* Pricing layout */}
			<div>
				<label htmlFor="showYearly" className="flex gap-1 items-center">
					<input
						type="checkbox"
						placeholder="Show yearly pricing"
						checked={showYearlyPricing}
						onChange={() => setShowYearlyPricing(!showYearlyPricing)}
					/>
					Show yearly pricing
				</label>

				<div className="grid grid-cols-3 gap-4 items-center">
					{PRICING_ORDER.map((planName) => {
						const priceId = showYearlyPricing
							? prices.yearly[planName]
							: prices.monthly[planName];

						return (
							<div key={planName} className="border p-6 rounded shadow">
								<h2 className="text-lg font-bold">{planName}</h2>
								<p>Price ID: {priceId}</p>
								<button
									type="button"
									onClick={() => handleSubscribe(priceId)}
									className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
								>
									Subscribe to the {planName}
								</button>
							</div>
						);
					})}
				</div>

				{user && <button onClick={logout}>Logout</button>}
			</div>
		</div>
	);
};
export default HomePage;
