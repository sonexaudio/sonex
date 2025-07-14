import FeatureCard from "./FeatureCard";
import SectionLayout from "./SectionLayout";

const features = [
	{
		id: 1,
		title: "Professional Workspace.",
		description:
			"Manage every stage of your music projects in one place, from first mixes to final masters.",
		imgLink: "https://placehold.co/600x480",
	},
	{
		id: 2,
		title: "Real-time feedback.",
		description:
			"Share tracks, gather notes, and collaborate without endless email chains or scattered comments.",
		imgLink: "https://placehold.co/600x480",
	},
	{
		id: 3,
		title: "Get paid, files unlocked.",
		description:
			"Clients see project pricing, pay directly, and files are unlocked after payment—no extra negotiation. Stripe fees apply.",
		imgLink: "https://placehold.co/600x480",
	},
];

const Features = () => {
	return (
		<SectionLayout id="features" className="py-20">
			{features.map((feature) => (
				<FeatureCard
					key={feature.id}
					feature={feature}
					textDirection={feature.id % 2 === 1 ? "left" : "right"}
				/>
			))}
		</SectionLayout>
	);
};

export default Features;
