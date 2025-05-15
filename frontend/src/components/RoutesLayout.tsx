import { Routes, Route } from "react-router";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/login/LoginPage";
import SignupPage from "../pages/SignupPage";
import Error404 from "../pages/error/Error404";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import SuccessPage from "../pages/payments/SuccessPage";
import DashboardLayout from "./DashboardLayout";
import OverviewPage from "../pages/dashboard/OverviewPage";

const RoutesLayout = () => {
	return (
		<Routes>
			<Route index element={<HomePage />} />
			<Route path="login" element={<LoginPage />} />
			<Route path="signup" element={<SignupPage />} />
			<Route path="forgot-password" element={<ForgotPasswordPage />} />
			<Route path="reset-password" element={<ResetPasswordPage />} />
			<Route element={<DashboardLayout />}>
				<Route path="overview" element={<OverviewPage />} />
			</Route>
			<Route path="payments">
				<Route path="success" element={<SuccessPage />} />
			</Route>
			<Route path="*" element={<Error404 />} />
		</Routes>
	);
};
export default RoutesLayout;
