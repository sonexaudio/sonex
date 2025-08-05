import type { PropsWithChildren } from "react";

// TODO: Update page layout style
const PageLayout = ({ children }: PropsWithChildren) => {
	return <div className="min-h-screen"><div className="container mx-auto">{children}</div></div>;
};
export default PageLayout;
