export type PlanName = (typeof PRICING_ORDER)[number];

export const PRICING_ORDER = [
	"SonExperience",
	"SonExplorer",
	"SonExsphere",
] as const;

export type SonexPricing = {
	monthly: Record<PlanName, string>;
	yearly: Record<PlanName, string>;
};

export const getStripePrices = (): SonexPricing => {
	return {
		monthly: {
			SonExperience: import.meta.env.VITE_STRIPE_PRICE_SONEXPERIENCE_MONTHLY!,
			SonExplorer: import.meta.env.VITE_STRIPE_PRICE_SONEXPLORER_MONTHLY!,
			SonExsphere: import.meta.env.VITE_STRIPE_PRICE_SONEXSPHERE_MONTHLY!,
		},
		yearly: {
			SonExperience: import.meta.env.VITE_STRIPE_PRICE_SONEXPERIENCE_YEARLY!,

			SonExplorer: import.meta.env.VITE_STRIPE_PRICE_SONEXPLORER_YEARLY!,

			SonExsphere: import.meta.env.VITE_STRIPE_PRICE_SONEXSPHERE_YEARLY!,
		},
	};
};
