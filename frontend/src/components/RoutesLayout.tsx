import { Routes, Route } from "react-router";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import Error404 from "../pages/error/Error404";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";

const RoutesLayout = () => {
	return (
		<Routes>
			<Route index element={<HomePage />} />
			<Route path="login" element={<LoginPage />} />
			<Route path="signup" element={<SignupPage />} />
			<Route path="forgot-password" element={<ForgotPasswordPage />} />
			<Route path="reset-password" element={<ResetPasswordPage />} />
			<Route path="*" element={<Error404 />} />
		</Routes>
	);
};
export default RoutesLayout;
