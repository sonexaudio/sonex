import React from "react";
import SectionLayout from "./SectionLayout";
import PricingCard from "./PricingCard";

const plans = [
	{
		title: "The SonExperiment",
		tagline: "Test. Tinker. Get Paid.",
		price: {
			month: 14.99,
			year: 149,
		},
		features: [
			"Unlimited Projects and Clients",
			"256GB storage limit",
			"0% fee per paid project*",
			"All core features",
		],
	},
	{
		title: "The SonExplorer",
		tagline: "Build. Grow. Collaborate.",
		price: {
			month: 24.99,
			year: 199,
		},
		features: [
			"Unlimited Projects and Clients",
			"512GB storage limit",
			"0% fee per paid project*",
			"All core features",
		],
	},
	{
		title: "The SonExecutive",
		tagline: "Lead. Scale. Dominate.",
		price: {
			month: 44.99,
			year: 249,
		},
		features: [
			"Unlimited Projects and Clients",
			"1TB storage limit",
			"0% fee per paid project*",
			"All core features",
		],
	},
	{
		title: "The SonExperience",
		tagline: "Create. Share. Discover.",
		price: {
			month: 0,
		},
		features: [
			"Unlimited Projects and Clients",
			"5GB storage limit",
			"5% fee per paid project*",
			"All core features",
		],
	},
];

const Pricing = () => {
	return (
		<SectionLayout id="pricing" className="py-20 space-y-20">
			<div className="text-4xl font-bold">
				<h2 className="leading-[1] tracking-tighter">Pricing</h2>
				<h2 className="leading-[1] text-neutral-500 tracking-tighter">
					All features included.
				</h2>
			</div>
			<div className="grid lg:grid-cols-3 gap-5 place-items-center">
				{plans.slice(0, 3).map((plan) => (
					<PricingCard key={plan.title} plan={plan} />
				))}
			</div>
			<div className="space-y-6">
				<PricingCard plan={plans[3]} />
				<p className="text-[10px] italic text-muted-foreground">
					*Payment is processed via Stripe. Stripe payment fees, terms and
					conditions apply for each payment. For free users: 5% project fee paid
					to Sonex in addition to Stripe's current payment fee.
				</p>
			</div>
		</SectionLayout>
	);
};

export default Pricing;
