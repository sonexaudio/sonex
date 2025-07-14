import React from "react";

const SectionLayout = ({ id, className, children }) => {
	return (
		<section id={id} className={className}>
			{children}
		</section>
	);
};

export default SectionLayout;
