import { Card, CardContent, CardFooter } from "./ui/card";

const TestimonialCard = ({ testimonial }) => {
	return (
		<Card className="max-w-[480px] bg-muted border-muted">
			<CardContent className="grow h-[220px]">
				<p className="max-w-80 text-lg">"{testimonial.content}"</p>
			</CardContent>
			<CardFooter>
				<div>
					<p className="text-sm font-bold">{testimonial.author}</p>
					<p className="text-sm text-neutral-700">{testimonial.profession}</p>
				</div>
			</CardFooter>
		</Card>
	);
};

export default TestimonialCard;
