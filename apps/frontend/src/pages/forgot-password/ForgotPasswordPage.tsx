
import PageLayout from "../../components/PageLayout";
import ReturnButton from "../../components/ReturnButton";

import ForgotPasswordForm from "./ForgotPasswordForm";

const ForgotPasswordPage = () => {
	return (
		<div className="px-8 py-16 container mx-auto max-w-screen space-y-8">
			<div>
				<ReturnButton href="/login" label="Login" />
			</div>

			<h1 className="text-2xl font-bold">Forgot Password</h1>
			<p>Happens to the best of us! Please enter your email address to reset your password.</p>

			<ForgotPasswordForm />

		</div>
	);
};
export default ForgotPasswordPage;
