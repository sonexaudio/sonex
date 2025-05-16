import { Routes, Route } from "react-router";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/login/LoginPage";
import SignupPage from "../pages/signup/SignupPage";
import Error404 from "../pages/error/Error404";
import ForgotPasswordPage from "../pages/forgot-password/ForgotPasswordPage";
import ResetPasswordPage from "../pages/reset-password/ResetPasswordPage";
import SuccessPage from "../pages/payments/SuccessPage";
import DashboardLayout from "./DashboardLayout";
import OverviewPage from "../pages/dashboard/overview/OverviewPage";
import AccountPage from "../pages/dashboard/account/AccountPage";

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
				<Route path="account" element={<AccountPage/>}/>
			</Route>
			<Route path="payments">
				<Route path="success" element={<SuccessPage />} />
			</Route>
			<Route path="*" element={<Error404 />} />
		</Routes>
	);
};
export default RoutesLayout;
