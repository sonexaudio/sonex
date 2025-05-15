import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import type { PropsWithChildren } from "react";

const AuthLayout = ({ children }: PropsWithChildren) => {
	const { user, loading } = useAuth();

	if (loading) return <p>Loading...</p>; // TODO: create nice loader

	if (!loading && !user)
		return (
			<Navigate
				to="/login"
				replace
				state={{ message: "You are not logged in" }}
			/>
		);

	// if (user) {
	// 	return <Navigate to="/" replace />;
	// }

	return <>{children}</>;
};
export default AuthLayout;
