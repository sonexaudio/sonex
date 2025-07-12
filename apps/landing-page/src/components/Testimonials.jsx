import SectionLayout from "./SectionLayout";
import TestimonialCard from "./TestimonialCard";

const testimonials = [
	{
		id: 1,
		content: "Sonex keeps my projects organized and makes revisions a breeze.",
		author: "Alex Rivera",
		profession: "Mix Engineer",
	},
	{
		id: 2,
		content: "Way better than sending Dropbox links—everything’s in one place.",
		author: "Alex Rivera",
		profession: "Mix Engineer",
	},
	{
		id: 3,
		content:
			"No more lost notes or version confusion—Sonex is just what we needed.",
		author: "Riley Santos",
		profession: "Producer",
	},
];

const Testimonials = () => {
	return (
		<SectionLayout id="testimonials" className="py-20 space-y-20">
			<div className="text-center">
				<h2 className="text-2xl font-bold leading-[1]">
					Trusted by music professionals.
				</h2>
				<p className="text-2xl font-bold text-neutral-500">
					Real quotes from users.
				</p>
			</div>
			<div className="grid lg:grid-cols-3 gap-5 justify-center">
				{testimonials.map((testimonial) => (
					<TestimonialCard key={testimonial.id} testimonial={testimonial} />
				))}
			</div>
		</SectionLayout>
	);
};

export default Testimonials;
