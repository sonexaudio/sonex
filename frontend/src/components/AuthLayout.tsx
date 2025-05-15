import { Navigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import type { PropsWithChildren } from "react";

const publicRoutes = [
	"/",
	"/login",
	"/signup",
	"/forgot-password",
	"/reset-password",
];

const AuthLayout = ({ children }: PropsWithChildren) => {
	const { user, loading } = useAuth();
	const location = useLocation();

	const isPublicAuthRoute = publicRoutes.includes(location.pathname);

	if (loading) return <p>Loading...</p>; // TODO: create nice loader

	if (!loading && !user && !isPublicAuthRoute) {
		return (
			<Navigate
				to="/login"
				replace
				state={{
					message: "You must be logged in to view this page",
					from: location.pathname,
				}}
			/>
		);
	}

	// if (user) {
	// 	return <Navigate to="/" replace />;
	// }

	return <>{children}</>;
};
export default AuthLayout;
