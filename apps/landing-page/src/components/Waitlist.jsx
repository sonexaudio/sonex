import SectionLayout from "./SectionLayout";
import WaitlistForm from "./WaitlistForm";

const Waitlist = () => {
	return (
		<SectionLayout id="join" className="py-20 space-y-20">
			<div className="text-4xl font-bold text-center">
				<h1 className="leading-[1] tracking-tighter">Get early access</h1>
				<h2 className="leading-[1] text-neutral-500 tracking-tighter">
					Join the waitlist.
				</h2>
			</div>
			<div className="max-w-3xl mx-auto flex justify-center">
				<WaitlistForm />
			</div>
		</SectionLayout>
	);
};

export default Waitlist;
