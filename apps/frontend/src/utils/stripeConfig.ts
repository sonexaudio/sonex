export type PlanName = (typeof PRICING_ORDER)[number];

export const PRICING_ORDER = [
	"SonExperiment",
	"SonExperience",
	"SonExplorer",
	"SonExecutive",
] as const;

export type SonexPricing = {
	monthly: Record<PlanName, string | null>;
	yearly: Record<PlanName, string | null>;
};

export type PlanTier = {
	title: string;
	description: string;
	features: string[];
	priceMonthly: string;
	priceYearly: string;
	priceId: Record<string, string> | null;
};

export const PRICING_MAP: Record<string, PlanTier> = {
	SonExperiment: {
		title: "SonExperiment",
		description: "Test. Tinker. Get Paid.",
		features: [
			"Access to all features",
			"Up to 5GB storage",
			"5% project fee",
		],
		priceMonthly: "0",
		priceYearly: "0",
		priceId: null
	},
	SonExperience: {
		title: "SonExperience",
		description: "Perfect for individuals getting started.",
		features: [
			"Access to all features",
			"Up to 256GB storage",
			"0% project fee",
		],
		priceMonthly: "14.99",
		priceYearly: "99.99",
		priceId: {
			monthly: import.meta.env.VITE_STRIPE_PRICE_SONEXPERIENCE_MONTHLY!,
			yearly: import.meta.env.VITE_STRIPE_PRICE_SONEXPERIENCE_YEARLY!,
		}

	},
	SonExplorer: {
		title: "SonExplorer",
		description: "For creators who need more power and flexibility.",
		features: [
			"Access to all features",
			"Up to 512GB storage",
			"0% Project fee",
		],
		priceMonthly: "$24.99",
		priceYearly: "$199.99",
		priceId: {
			monthly: import.meta.env.VITE_STRIPE_PRICE_SONEXPLORER_MONTHLY!,
			yearly: import.meta.env.VITE_STRIPE_PRICE_SONEXPLORER_YEARLY!,
		}
	},
	SonExecutive: {
		title: "SonExecutive",
		description: "For professionals and teams who need the best.",
		features: [
			"Access to all features",
			"Up to 1TB storage",
			"0% Project fee",
		],
		priceMonthly: "$49.99",
		priceYearly: "$229",
		priceId: {
			monthly: import.meta.env.VITE_STRIPE_PRICE_SONEXECUTIVE_MONTHLY!,
			yearly: import.meta.env.VITE_STRIPE_PRICE_SONEXECUTIVE_YEARLY!,
		}
	},
};

export const getStripePrices = (): SonexPricing => {
	return {
		monthly: {
			SonExperiment: null,
			SonExperience: import.meta.env.VITE_STRIPE_PRICE_SONEXPERIENCE_MONTHLY!,
			SonExplorer: import.meta.env.VITE_STRIPE_PRICE_SONEXPLORER_MONTHLY!,
			SonExecutive: import.meta.env.VITE_STRIPE_PRICE_SONEXECUTIVE_MONTHLY!,
		},
		yearly: {
			SonExperiment: null,
			SonExperience: import.meta.env.VITE_STRIPE_PRICE_SONEXPERIENCE_YEARLY!,

			SonExplorer: import.meta.env.VITE_STRIPE_PRICE_SONEXPLORER_YEARLY!,

			SonExecutive: import.meta.env.VITE_STRIPE_PRICE_SONEXECUTIVE_YEARLY!,
		},
	};
};
