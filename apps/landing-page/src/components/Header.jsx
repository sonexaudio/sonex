import { useEffect } from "react";
import { Button } from "./ui/button";
import { useState } from "react";

const anchors = [
	{ title: "Home", link: "#home" },
	{ title: "Features", link: "#features" },
	{ title: "Testimonials", link: "#testimonials" },
	{ title: "Pricing", link: "#pricing" },
];

const Header = () => {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 0);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<header
			className={`flex justify-between items-center h-16 w-full sticky top-0 left-0 z-50 bg-white/70 backdrop-blur-lg transition-all  ${
				scrolled ? "shadow-lg px-4" : ""
			}`}
		>
			<div className="size-36">
				<img src="/logo-light.svg" alt="" />
			</div>
			<nav className="flex gap-4 items-center">
				{/* nav links to scroll to on page */}
				{anchors.map((anchor) => (
					<a
						href={anchor.link}
						key={anchor.title}
						className="hover:underline transition-all duration-300"
					>
						{anchor.title}
					</a>
				))}
				<Button asChild>
					<a href="#join">Join Sonex Today</a>
				</Button>
			</nav>
		</header>
	);
};

export default Header;
