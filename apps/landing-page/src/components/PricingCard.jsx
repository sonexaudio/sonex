import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";

const PricingCard = ({ plan }) => {
	return (
		<Card className="size-full bg-muted border-none">
			<CardHeader>
				<CardTitle>
					<h2 className="leading-[1]">{plan.title}</h2>
				</CardTitle>
				<CardDescription>
					<p className="leading-[1] text-sm italic text-muted-foreground">
						{plan.tagline}
					</p>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<h3 className="text-3xl font-bold leading-[1]">
					{plan.title === "The SonExperience" ? (
						<>${plan.price.month}</>
					) : (
						<>
							${plan.price.month}/mo or <br /> ${plan.price.year}/yr
						</>
					)}
				</h3>

				<ul className="space-y-2 mt-8">
					{plan.features.map((feature) => (
						<li key={feature} className="flex gap-2 text-muted-foreground">
							<CheckCircle2 className="text-primary" />
							<span>{feature}</span>
						</li>
					))}
				</ul>
			</CardContent>
			<CardFooter className="grow mt-8">
				<Button disabled className="w-full">
					Coming soon
				</Button>
			</CardFooter>
		</Card>
	);
};

export default PricingCard;
