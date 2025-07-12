import SectionLayout from "./SectionLayout";

const Hero = () => {
	return (
		<SectionLayout id="home" className="py-20 space-y-20">
			<div className="text-4xl font-bold">
				<h1 className="leading-[1] tracking-tighter">
					Collaborate on music. Effortlessly.
				</h1>
				<h2 className="leading-[1] text-neutral-500 tracking-tighter">
					Files, feedback, and clients. All here.
				</h2>
			</div>
			<div className="flex justify-center">
				<img src="https://placehold.co/939x567?text=Demo Video" alt="" />
			</div>
		</SectionLayout>
	);
};

export default Hero;
