import Features from "./components/Features";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Pricing from "./components/Pricing";
import Testimonials from "./components/Testimonials";
import Waitlist from "./components/Waitlist";

function App() {
	return (
		<div className="container mx-auto">
			<Header />
			<Hero />
			<Features />
			<Testimonials />
			<Pricing />
			<Waitlist />
		</div>
	);
}

export default App;
