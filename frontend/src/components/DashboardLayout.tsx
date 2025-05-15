import { Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

const DashboardLayout = () => {
	const { user, loading, logout } = useAuth();
	// if (!loading && !user) {
	//     return <Navigate to="/login" replace />
	// }
	if (loading) return <p>Loading...</p>;
	return (
		<>
			<div>
				{user && (
					<div>
						<p>{user.firstName}</p>
						<button type="button" onClick={logout}>
							logout
						</button>
					</div>
				)}
			</div>
			<Outlet />
		</>
	);
};
export default DashboardLayout;
