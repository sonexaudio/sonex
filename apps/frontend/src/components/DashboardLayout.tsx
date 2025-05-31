import { Outlet, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

const DashboardLayout = () => {
	const { user, loading, logout } = useAuth();
	const navigate = useNavigate();

	if (loading) return <p>Loading...</p>;

	return (
		<>
			<div>
				{user && (
					<div>
						<p onClick={() => navigate("/account")}>{user.firstName}</p>
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
