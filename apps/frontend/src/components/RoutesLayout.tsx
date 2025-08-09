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
import ProjectsPage from "../pages/dashboard/projects/ProjectsPage";
import CurrentProjectPage from "../pages/dashboard/projects/[id]/CurrentProjectPage";
import FilesPage from "../pages/dashboard/files/FilesPage";
import ClientsPage from "../pages/dashboard/clients/ClientsPage";
import SingleFilePage from "../pages/dashboard/files/[name]/SingleFilePage";
import { ProjectProvider } from "../context/ProjectProvider";
import PaymentsPage from "../pages/dashboard/payments/PaymentsPage";
import SettingsPage from "../pages/dashboard/settings/SettingsPage";
import ProtectedRoute from "./ProtectedRoute";

const RoutesLayout = () => {
	return (
		<Routes>
			<Route index element={<HomePage />} />
			<Route path="login" element={<ProtectedRoute><LoginPage /></ProtectedRoute>} />
			<Route path="signup" element={<ProtectedRoute><SignupPage /></ProtectedRoute>} />
			<Route path="forgot-password" element={<ProtectedRoute><ForgotPasswordPage /></ProtectedRoute>} />
			<Route path="reset-password" element={<ProtectedRoute><ResetPasswordPage /></ProtectedRoute>} />
			<Route element={<DashboardLayout />}>
				<Route path="overview" element={
					<ProtectedRoute><OverviewPage /></ProtectedRoute>
				} />
				<Route path="projects">
					<Route index element={
						<ProtectedRoute><ProjectsPage /></ProtectedRoute>
					} />
					<Route path=":id">
						<Route index element={
							<ProjectProvider>
								<CurrentProjectPage />
							</ProjectProvider>
						} />
						<Route path="files/:fileId" element={
							<SingleFilePage />
						} />
					</Route>
				</Route>
				<Route path="clients" element={
					<ProtectedRoute><ClientsPage /></ProtectedRoute>
				} />
				<Route path="files" element={
					<ProtectedRoute><FilesPage /></ProtectedRoute>
				} />
				<Route path="account" element={

					<ProtectedRoute><AccountPage /></ProtectedRoute>

				} />
				<Route path="payments" >
					<Route index element={
						<ProtectedRoute><PaymentsPage /></ProtectedRoute>
					} />
					<Route path="success" element={<SuccessPage />} />
				</Route>
				<Route path="settings" element={
					<ProtectedRoute><SettingsPage /></ProtectedRoute>
				} />
			</Route>

			<Route path="*" element={<Error404 />} />
		</Routes >
	);
};
export default RoutesLayout;
