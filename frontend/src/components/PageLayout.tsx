import type { PropsWithChildren } from "react";

// TODO: Update page layout style
const PageLayout = ({ children }: PropsWithChildren) => {
	return <div className="container mx-auto">{children}</div>;
};
export default PageLayout;
